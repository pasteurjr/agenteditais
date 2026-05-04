"""Pregoeiro IA — protocolo Lei 14.133/2021.

Funcoes:
- classificar(propostas, valor_referencia): aceita propostas dentro de +/-10% do menor
- decidir_encerrar_rodada(historico): encerra se 3 rodadas sem lance novo
- negociar(vencedor_atual, valor_referencia): tenta desconto adicional
- habilitar(vencedor): simulado (90% passa)
- gerar_ata(sessao_completa): texto resumido via DeepSeek
"""
from __future__ import annotations
import sys
from pathlib import Path
from typing import List, Dict, Any
import random

_BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND))

from llm import call_deepseek


def classificar_propostas(propostas: List[Dict[str, Any]],
                          valor_referencia: float,
                          tolerancia_pct: float = 30.0) -> Dict[str, List]:
    """Classifica propostas: aceita as que estao dentro de +/-tolerancia% do menor.

    Args:
        propostas: lista [{agente_id, valor, ...}]
        valor_referencia: valor do edital
        tolerancia_pct: % de tolerancia em relacao ao MENOR proposta (default 30%)

    Returns:
        {"classificados": [...], "desclassificados": [...]}
    """
    if not propostas:
        return {"classificados": [], "desclassificados": []}

    propostas_ord = sorted(propostas, key=lambda p: p["valor"])
    menor = propostas_ord[0]["valor"]
    teto = menor * (1 + tolerancia_pct / 100)
    # Tambem desclassifica acima do valor_referencia * 1.5 (excessivo)
    teto_max = max(teto, valor_referencia * 1.5)

    classificados = [p for p in propostas_ord if p["valor"] <= teto_max]
    desclassificados = [p for p in propostas_ord if p["valor"] > teto_max]
    return {"classificados": classificados, "desclassificados": desclassificados}


def deve_encerrar_rodada(historico_lances: List[Dict],
                          rodada_atual: int,
                          max_rodadas: int = 10,
                          rodadas_sem_lance: int = 3) -> bool:
    """Encerra disputa se:
    - max_rodadas atingidas, OU
    - ultimas N rodadas sem nenhum lance novo
    """
    if rodada_atual >= max_rodadas:
        return True
    if rodada_atual < rodadas_sem_lance:
        return False
    # Verifica ultimas N rodadas
    ultimas = [l for l in historico_lances if l["rodada"] > (rodada_atual - rodadas_sem_lance)]
    return len(ultimas) == 0


def negociar_com_vencedor(vencedor: Dict[str, Any],
                          valor_atual: float,
                          valor_referencia: float) -> Dict[str, Any]:
    """Pregoeiro tenta desconto adicional sobre o vencedor.

    Estrategia: pede 5% de desconto. Se aceita, retorna novo valor; senao, mantem.
    """
    if valor_atual <= valor_referencia:
        # Ja abaixo do referencia, nao precisa negociar
        return {"negociado": False, "valor_final": valor_atual,
                "motivo": "valor ja abaixo do referencia"}

    # Pede 5% de desconto
    valor_proposto = valor_atual * 0.95
    return {"negociado": True, "valor_proposto_pregoeiro": valor_proposto,
            "valor_final": valor_proposto if vencedor.get("aceita_negociacao", True) else valor_atual,
            "motivo": "desconto de 5%"}


def habilitar_documental(vencedor: Dict[str, Any]) -> Dict[str, Any]:
    """Simula verificacao documental (90% passa). Falha aleatoria simula
    certidao vencida, falta de atestado, etc."""
    if random.random() < 0.90:
        return {"habilitado": True, "motivo": None}
    motivos = [
        "Certidao Negativa de Tributos Federais vencida",
        "Atestado de capacidade tecnica nao apresentado",
        "Cartao CNPJ nao corresponde a empresa licitante",
        "Falta declaracao de inexistencia de fato impeditivo",
    ]
    return {"habilitado": False, "motivo": random.choice(motivos)}


def adjudicar(vencedor_habilitado: Dict[str, Any]) -> Dict[str, Any]:
    """Declara vencedor adjudicado."""
    return {
        "adjudicado": True,
        "vencedor_id": vencedor_habilitado["agente_id"],
        "vencedor_nome": vencedor_habilitado.get("nome", "?"),
        "valor_adjudicado": vencedor_habilitado["valor_final"],
    }


def gerar_ata_pregao(sessao: Dict[str, Any], use_llm: bool = True) -> str:
    """Gera ata do pregao em texto. Usa DeepSeek se disponivel, senao template."""
    if not use_llm:
        return _ata_template(sessao)

    prompt = f"""Gere uma ata oficial de pregao eletronico (Lei 14.133/2021) com base nestes dados:

EDITAL: {sessao.get('edital_id', 'N/A')}
MODALIDADE: {sessao.get('modalidade', 'aberto')}
DATA: {sessao.get('data', 'hoje')}

PARTICIPANTES:
{_format_participantes(sessao.get('agentes', []))}

PROPOSTAS INICIAIS:
{_format_propostas(sessao.get('propostas', []))}

RODADAS DE LANCES:
{sessao.get('total_rodadas', 0)} rodadas, {len(sessao.get('lances', []))} lances totais.

VENCEDOR:
- {sessao.get('vencedor', {}).get('nome', '?')}
- Valor adjudicado: R$ {sessao.get('vencedor', {}).get('valor_adjudicado', 0):.2f}
- Habilitado: {sessao.get('vencedor', {}).get('habilitado', True)}

Formato da ata: maximo 8 paragrafos, linguagem juridica formal,
mencionar protocolo Lei 14.133/2021. Termine com "Adjudicado o objeto..."
"""
    try:
        ata = call_deepseek(
            [{"role": "user", "content": prompt}],
            max_tokens=1500, temperature=0.3, model_override="deepseek-chat"
        )
        return ata
    except Exception:
        return _ata_template(sessao)


def _ata_template(sessao: Dict[str, Any]) -> str:
    venc = sessao.get('vencedor', {})
    return f"""ATA DO PREGAO ELETRONICO

Edital: {sessao.get('edital_id', 'N/A')}
Modalidade: {sessao.get('modalidade', 'aberto')}
Total de rodadas: {sessao.get('total_rodadas', 0)}
Total de lances: {len(sessao.get('lances', []))}

VENCEDOR ADJUDICADO:
- Empresa: {venc.get('nome', '?')}
- CNPJ: {venc.get('cnpj', '?')}
- Valor: R$ {venc.get('valor_adjudicado', 0):.2f}
- Habilitado: {venc.get('habilitado', True)}

Adjudicado o objeto a empresa supracitada, na forma da Lei 14.133/2021.
"""


def _format_participantes(ags: List[Dict]) -> str:
    return "\n".join([f"- {a.get('nome', '?')} (CNPJ {a.get('cnpj', '?')}, perfil {a.get('personalidade', '?')})"
                      for a in ags])


def _format_propostas(props: List[Dict]) -> str:
    return "\n".join([f"- R$ {p.get('valor', 0):.2f} ({p.get('agente_nome', '?')})"
                      for p in props])
