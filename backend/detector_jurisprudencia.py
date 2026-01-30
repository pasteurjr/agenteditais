"""
Detector de necessidade de busca de jurisprudência no chat.

Analisa mensagens do usuário para identificar se é necessário
buscar jurisprudência atualizada nos tribunais trabalhistas.
"""

import json
import re
from typing import Dict, Any, List, Optional
from llm import call_deepseek


PROMPT_DETECTAR_BUSCA_JURIS = """Você é um assistente especializado em identificar quando uma pergunta sobre direito trabalhista requer busca de jurisprudência atualizada nos tribunais.

TAREFA: Analise a mensagem e determine se é necessário buscar jurisprudência recente.

INDICADORES DE NECESSIDADE DE BUSCA:
1. Perguntas sobre "entendimento atual", "jurisprudência recente", "como os tribunais estão decidindo"
2. Perguntas sobre temas controversos ou em evolução
3. Solicitações de "precedentes", "decisões", "julgados" sobre um tema
4. Perguntas específicas sobre posição do TST ou TRTs
5. Questões sobre aplicação prática de temas (não só conceituais)

NÃO REQUER BUSCA:
1. Perguntas sobre conceitos básicos já consolidados na CLT
2. Perguntas sobre cálculos trabalhistas
3. Perguntas sobre procedimentos/prazos
4. Pedidos de geração de documentos
5. Perguntas muito genéricas sem tema específico

EXTRAIA OS TERMOS DE BUSCA:
- Identifique os temas/assuntos principais da pergunta
- Use termos jurídicos padronizados quando possível
- Exemplos: "horas extras", "verbas rescisórias", "dano moral", "vínculo empregatício"

Responda APENAS com JSON válido:
{
    "requer_busca": true/false,
    "confianca": 0.0 a 1.0,
    "termos_busca": ["termo1", "termo2"],
    "tribunais": ["TST"] ou ["TST", "TRT2", "TRT3"] ou null,
    "motivo": "breve explicação"
}

MENSAGEM DO USUÁRIO:
"""


def detectar_necessidade_busca(mensagem: str, historico: Optional[List] = None) -> Dict[str, Any]:
    """
    Detecta se a mensagem requer busca de jurisprudência.

    Args:
        mensagem: Mensagem do usuário
        historico: Histórico de mensagens (opcional, para contexto)

    Returns:
        Dict com 'requer_busca', 'termos_busca', 'tribunais', 'confianca'
    """
    # Verificação rápida por palavras-chave (evita chamada ao LLM para casos óbvios)
    palavras_busca = [
        "jurisprudência", "jurisprudencia", "entendimento atual", "decisões recentes",
        "como o tst", "como os tribunais", "precedentes sobre", "julgados sobre",
        "posição do tst", "posição do trt", "está decidindo", "têm decidido"
    ]

    mensagem_lower = mensagem.lower()

    # Se não tem nenhuma palavra-chave, provavelmente não precisa busca
    tem_indicador = any(p in mensagem_lower for p in palavras_busca)

    # Se a mensagem é muito curta ou é saudação, não precisa busca
    if len(mensagem.strip()) < 20 or mensagem_lower.strip() in ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"]:
        return {
            "requer_busca": False,
            "confianca": 1.0,
            "termos_busca": [],
            "tribunais": None,
            "motivo": "Mensagem muito curta ou saudação"
        }

    # Se não tem indicador óbvio e não parece ser sobre jurisprudência
    palavras_excluir = ["calcule", "calcular", "gere", "gerar", "elabore", "crie", "quanto"]
    if not tem_indicador and any(p in mensagem_lower for p in palavras_excluir):
        return {
            "requer_busca": False,
            "confianca": 0.8,
            "termos_busca": [],
            "tribunais": None,
            "motivo": "Parece ser pedido de cálculo ou documento"
        }

    # Para casos mais complexos, usar o LLM
    try:
        prompt = PROMPT_DETECTAR_BUSCA_JURIS + mensagem

        # Usar modelo mais leve para detecção (deepseek-chat em vez de reasoner)
        resposta = call_deepseek(
            [{"role": "user", "content": prompt}],
            max_tokens=500,
            model_override="deepseek-chat"  # Modelo mais rápido para detecção
        )

        # Extrair JSON da resposta
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if json_match:
            resultado = json.loads(json_match.group())
            return {
                "requer_busca": resultado.get("requer_busca", False),
                "confianca": resultado.get("confianca", 0.5),
                "termos_busca": resultado.get("termos_busca", []),
                "tribunais": resultado.get("tribunais"),
                "motivo": resultado.get("motivo", "")
            }

    except Exception as e:
        print(f"Erro na detecção de busca jurisprudência: {e}")

    # Fallback: se tem indicador óbvio, assume que precisa busca
    if tem_indicador:
        # Extrair termos simples da mensagem
        termos = extrair_termos_simples(mensagem)
        return {
            "requer_busca": True,
            "confianca": 0.6,
            "termos_busca": termos,
            "tribunais": ["TST"],
            "motivo": "Detectado indicador de busca de jurisprudência"
        }

    return {
        "requer_busca": False,
        "confianca": 0.5,
        "termos_busca": [],
        "tribunais": None,
        "motivo": "Não identificada necessidade de busca"
    }


def extrair_termos_simples(mensagem: str) -> List[str]:
    """
    Extrai termos de busca simples da mensagem (fallback sem LLM).
    """
    # Termos trabalhistas comuns
    termos_conhecidos = [
        "horas extras", "hora extra", "verbas rescisórias", "verbas rescisorias",
        "aviso prévio", "aviso previo", "férias", "ferias", "décimo terceiro", "13º",
        "fgts", "multa de 40%", "dano moral", "assédio", "assedio",
        "vínculo empregatício", "vinculo empregaticio", "terceirização", "terceirizacao",
        "equiparação salarial", "equiparacao salarial", "desvio de função", "desvio de funcao",
        "acúmulo de função", "acumulo de funcao", "intervalo intrajornada", "intervalo",
        "adicional noturno", "adicional de periculosidade", "adicional de insalubridade",
        "estabilidade", "gestante", "acidente de trabalho", "doença ocupacional",
        "justa causa", "rescisão indireta", "rescisao indireta", "banco de horas",
        "pejotização", "pejotizacao", "trabalho intermitente", "teletrabalho"
    ]

    mensagem_lower = mensagem.lower()
    termos_encontrados = []

    for termo in termos_conhecidos:
        if termo in mensagem_lower:
            # Padronizar termo
            termo_padrao = termo.replace("ç", "c").replace("ã", "a").replace("é", "e").replace("í", "i")
            if termo_padrao not in [t.replace("ç", "c").replace("ã", "a").replace("é", "e").replace("í", "i") for t in termos_encontrados]:
                termos_encontrados.append(termo)

    # Se não encontrou nenhum termo conhecido, pegar substantivos da mensagem
    if not termos_encontrados:
        # Simplificação: pegar palavras maiores que 5 caracteres
        palavras = re.findall(r'\b[a-záàâãéêíóôõúç]{6,}\b', mensagem_lower)
        # Filtrar palavras muito comuns
        stopwords = ["sobre", "qual", "quais", "como", "quando", "porque", "trabalhista", "tribunal", "decisão", "entendimento"]
        termos_encontrados = [p for p in palavras if p not in stopwords][:3]

    return termos_encontrados[:5]  # Máximo 5 termos
