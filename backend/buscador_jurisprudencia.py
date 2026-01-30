"""
Buscador de Jurisprudência Trabalhista via API DataJud (CNJ)

Permite buscar processos e jurisprudência nos tribunais trabalhistas:
- TST (Tribunal Superior do Trabalho)
- TRT1 a TRT24 (Tribunais Regionais do Trabalho)

API: https://api-publica.datajud.cnj.jus.br/
Documentação: https://datajud-wiki.cnj.jus.br/api-publica/
"""

import requests
import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from config import DATAJUD_API_KEY, DATAJUD_BASE_URL, DATAJUD_CACHE_TTL_HOURS
from models import CacheJurisprudencia, get_db


# Tribunais trabalhistas disponíveis
TRIBUNAIS_TRABALHISTAS = {
    "TST": "api_publica_tst",
    "TRT1": "api_publica_trt1",   # Rio de Janeiro
    "TRT2": "api_publica_trt2",   # São Paulo
    "TRT3": "api_publica_trt3",   # Minas Gerais
    "TRT4": "api_publica_trt4",   # Rio Grande do Sul
    "TRT5": "api_publica_trt5",   # Bahia
    "TRT6": "api_publica_trt6",   # Pernambuco
    "TRT7": "api_publica_trt7",   # Ceará
    "TRT8": "api_publica_trt8",   # Pará/Amapá
    "TRT9": "api_publica_trt9",   # Paraná
    "TRT10": "api_publica_trt10", # Distrito Federal/Tocantins
    "TRT11": "api_publica_trt11", # Amazonas/Roraima
    "TRT12": "api_publica_trt12", # Santa Catarina
    "TRT13": "api_publica_trt13", # Paraíba
    "TRT14": "api_publica_trt14", # Rondônia/Acre
    "TRT15": "api_publica_trt15", # Campinas
    "TRT16": "api_publica_trt16", # Maranhão
    "TRT17": "api_publica_trt17", # Espírito Santo
    "TRT18": "api_publica_trt18", # Goiás
    "TRT19": "api_publica_trt19", # Alagoas
    "TRT20": "api_publica_trt20", # Sergipe
    "TRT21": "api_publica_trt21", # Rio Grande do Norte
    "TRT22": "api_publica_trt22", # Piauí
    "TRT23": "api_publica_trt23", # Mato Grosso
    "TRT24": "api_publica_trt24", # Mato Grosso do Sul
}

# Classes processuais mais relevantes para jurisprudência
CLASSES_RELEVANTES = {
    "recurso_revista": [1010, 11882],  # Recurso de Revista, RR com Agravo
    "agravo_instrumento": [1002],       # AIRR
    "recurso_ordinario": [1009],        # RO
    "embargos": [1015],                 # Embargos à SDI
}


def _get_headers() -> Dict[str, str]:
    """Retorna headers para requisições à API DataJud."""
    return {
        "Content-Type": "application/json",
        "Authorization": f"APIKey {DATAJUD_API_KEY}"
    }


def _make_query_hash(query: Dict, tribunal: str) -> str:
    """Gera hash único para a query (para cache)."""
    query_str = json.dumps(query, sort_keys=True) + tribunal
    return hashlib.sha256(query_str.encode()).hexdigest()


def _get_from_cache(query_hash: str, tribunal: str) -> Optional[List[Dict]]:
    """Busca resultado no cache se ainda válido."""
    db = get_db()
    try:
        cache = db.query(CacheJurisprudencia).filter(
            CacheJurisprudencia.query_hash == query_hash,
            CacheJurisprudencia.tribunal == tribunal,
            CacheJurisprudencia.expires_at > datetime.now()
        ).first()

        if cache:
            return cache.resultado_json
        return None
    finally:
        db.close()


def _save_to_cache(query_hash: str, tribunal: str, resultados: List[Dict], total: int):
    """Salva resultado no cache."""
    db = get_db()
    try:
        # Remover cache antigo se existir
        db.query(CacheJurisprudencia).filter(
            CacheJurisprudencia.query_hash == query_hash,
            CacheJurisprudencia.tribunal == tribunal
        ).delete()

        cache = CacheJurisprudencia(
            query_hash=query_hash,
            tribunal=tribunal,
            resultado_json=resultados,
            total_resultados=total,
            expires_at=datetime.now() + timedelta(hours=DATAJUD_CACHE_TTL_HOURS)
        )
        db.add(cache)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Erro ao salvar cache: {e}")
    finally:
        db.close()


def _limpar_cache_expirado():
    """Remove entradas de cache expiradas."""
    db = get_db()
    try:
        db.query(CacheJurisprudencia).filter(
            CacheJurisprudencia.expires_at < datetime.now()
        ).delete()
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def buscar_datajud(
    query: Dict[str, Any],
    tribunal: str = "TST",
    limite: int = 10,
    usar_cache: bool = True
) -> Dict[str, Any]:
    """
    Executa busca na API DataJud.

    Args:
        query: Query no formato Elasticsearch
        tribunal: Sigla do tribunal (TST, TRT1-24)
        limite: Número máximo de resultados
        usar_cache: Se deve usar cache

    Returns:
        Dict com 'sucesso', 'total', 'resultados', 'erro'
    """
    tribunal = tribunal.upper()
    if tribunal not in TRIBUNAIS_TRABALHISTAS:
        return {"sucesso": False, "erro": f"Tribunal não suportado: {tribunal}"}

    endpoint = TRIBUNAIS_TRABALHISTAS[tribunal]
    url = f"{DATAJUD_BASE_URL}/{endpoint}/_search"

    # Verificar cache
    query_hash = _make_query_hash(query, tribunal)
    if usar_cache:
        cached = _get_from_cache(query_hash, tribunal)
        if cached is not None:
            return {
                "sucesso": True,
                "total": len(cached),
                "resultados": cached,
                "fonte": "cache"
            }

    # Preparar payload
    payload = {
        "size": limite,
        "query": query,
        "_source": [
            "numeroProcesso", "classe", "assuntos", "tribunal",
            "grau", "dataAjuizamento", "orgaoJulgador", "movimentos"
        ]
    }

    try:
        response = requests.get(url, headers=_get_headers(), json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        hits = data.get("hits", {})
        total = hits.get("total", {}).get("value", 0)

        resultados = []
        for hit in hits.get("hits", []):
            source = hit.get("_source", {})
            resultados.append(_formatar_resultado(source))

        # Salvar no cache
        if usar_cache and resultados:
            _save_to_cache(query_hash, tribunal, resultados, total)

        return {
            "sucesso": True,
            "total": total,
            "resultados": resultados,
            "fonte": "api"
        }

    except requests.exceptions.Timeout:
        return {"sucesso": False, "erro": "Timeout na requisição ao DataJud"}
    except requests.exceptions.HTTPError as e:
        return {"sucesso": False, "erro": f"Erro HTTP: {e.response.status_code}"}
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}


def _formatar_resultado(source: Dict) -> Dict:
    """Formata um resultado da API para formato mais amigável."""
    # Formatar data de ajuizamento
    data_aj = source.get("dataAjuizamento", "")
    if data_aj and len(data_aj) >= 8:
        try:
            # Formato: YYYYMMDDHHMMSS ou ISO
            if "T" in data_aj:
                data_formatada = data_aj[:10]
            else:
                data_formatada = f"{data_aj[:4]}-{data_aj[4:6]}-{data_aj[6:8]}"
        except:
            data_formatada = data_aj
    else:
        data_formatada = None

    # Extrair último movimento relevante (decisão)
    movimentos = source.get("movimentos", [])
    ultima_decisao = None
    for mov in reversed(movimentos):
        nome_mov = mov.get("nome", "").lower()
        if any(x in nome_mov for x in ["provimento", "não-provimento", "negado", "deferido",
                                        "indeferido", "procedente", "improcedente", "julgamento"]):
            ultima_decisao = {
                "nome": mov.get("nome"),
                "data": mov.get("dataHora", "")[:10] if mov.get("dataHora") else None,
                "orgao": mov.get("orgaoJulgador", {}).get("nome")
            }
            break

    # Extrair assuntos únicos
    assuntos = source.get("assuntos", [])
    assuntos_unicos = list({a.get("nome") for a in assuntos if a.get("nome")})

    return {
        "numero_processo": source.get("numeroProcesso"),
        "numero_formatado": _formatar_numero_processo(source.get("numeroProcesso")),
        "tribunal": source.get("tribunal"),
        "grau": source.get("grau"),
        "classe": source.get("classe", {}).get("nome"),
        "classe_codigo": source.get("classe", {}).get("codigo"),
        "assuntos": assuntos_unicos,
        "data_ajuizamento": data_formatada,
        "orgao_julgador": source.get("orgaoJulgador", {}).get("nome"),
        "ultima_decisao": ultima_decisao
    }


def _formatar_numero_processo(numero: str) -> str:
    """Formata número do processo no padrão CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO"""
    if not numero or len(numero) != 20:
        return numero or ""

    try:
        return f"{numero[:7]}-{numero[7:9]}.{numero[9:13]}.{numero[13]}.{numero[14:16]}.{numero[16:]}"
    except:
        return numero


def buscar_por_assunto(
    assunto: str,
    tribunal: str = "TST",
    limite: int = 10,
    classes: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Busca processos por assunto/tema.

    Args:
        assunto: Termo de busca (ex: "horas extras", "verbas rescisórias")
        tribunal: Sigla do tribunal
        limite: Número máximo de resultados
        classes: Lista de códigos de classes processuais para filtrar

    Returns:
        Dict com resultados
    """
    must_clauses = [
        {"match": {"assuntos.nome": assunto}}
    ]

    if classes:
        must_clauses.append({
            "terms": {"classe.codigo": classes}
        })

    query = {
        "bool": {
            "must": must_clauses
        }
    }

    return buscar_datajud(query, tribunal, limite)


def buscar_por_numero(numero_processo: str) -> Dict[str, Any]:
    """
    Busca processo específico pelo número.

    Args:
        numero_processo: Número do processo (com ou sem formatação)

    Returns:
        Dict com resultado
    """
    # Limpar número (remover pontos, traços)
    numero_limpo = "".join(c for c in numero_processo if c.isdigit())

    # Extrair tribunal do número (posições 14-15)
    if len(numero_limpo) >= 16:
        codigo_tribunal = numero_limpo[14:16]
        tribunal_map = {
            "00": "TST",
            **{f"{i:02d}": f"TRT{i}" for i in range(1, 25)}
        }
        tribunal = tribunal_map.get(codigo_tribunal, "TST")
    else:
        tribunal = "TST"

    query = {
        "match": {
            "numeroProcesso": numero_limpo
        }
    }

    resultado = buscar_datajud(query, tribunal, limite=1)

    if resultado.get("sucesso") and resultado.get("resultados"):
        resultado["processo"] = resultado["resultados"][0]

    return resultado


def buscar_multiplos_tribunais(
    assunto: str,
    tribunais: List[str] = None,
    limite_por_tribunal: int = 5
) -> Dict[str, Any]:
    """
    Busca em múltiplos tribunais simultaneamente.

    Args:
        assunto: Termo de busca
        tribunais: Lista de tribunais (default: TST + TRT2 + TRT3)
        limite_por_tribunal: Limite de resultados por tribunal

    Returns:
        Dict com resultados agrupados por tribunal
    """
    if tribunais is None:
        tribunais = ["TST", "TRT2", "TRT3"]  # Principais tribunais

    resultados_por_tribunal = {}
    total_geral = 0
    erros = []

    for tribunal in tribunais:
        resultado = buscar_por_assunto(assunto, tribunal, limite_por_tribunal)

        if resultado.get("sucesso"):
            resultados_por_tribunal[tribunal] = resultado.get("resultados", [])
            total_geral += len(resultado.get("resultados", []))
        else:
            erros.append(f"{tribunal}: {resultado.get('erro')}")

    return {
        "sucesso": len(erros) < len(tribunais),  # Sucesso se pelo menos um funcionou
        "total": total_geral,
        "resultados_por_tribunal": resultados_por_tribunal,
        "erros": erros if erros else None
    }


def formatar_para_contexto(resultados: List[Dict], max_resultados: int = 5) -> str:
    """
    Formata resultados para incluir no contexto do LLM.

    Args:
        resultados: Lista de resultados da busca
        max_resultados: Número máximo de resultados a incluir

    Returns:
        String formatada para contexto
    """
    if not resultados:
        return "Nenhum resultado encontrado na busca de jurisprudência."

    linhas = ["## Jurisprudência Encontrada\n"]

    for i, r in enumerate(resultados[:max_resultados], 1):
        linha = f"**{i}. {r.get('tribunal')} - {r.get('numero_formatado')}**\n"
        linha += f"   - Classe: {r.get('classe')}\n"
        linha += f"   - Assuntos: {', '.join(r.get('assuntos', []))}\n"

        if r.get('orgao_julgador'):
            linha += f"   - Órgão: {r.get('orgao_julgador')}\n"

        if r.get('ultima_decisao'):
            decisao = r['ultima_decisao']
            linha += f"   - Decisão: {decisao.get('nome')} ({decisao.get('data')})\n"

        linhas.append(linha)

    return "\n".join(linhas)


def formatar_citacao(resultado: Dict) -> str:
    """
    Formata um resultado como citação jurídica.

    Args:
        resultado: Um resultado da busca

    Returns:
        String no formato de citação jurídica
    """
    partes = [
        resultado.get('tribunal'),
        resultado.get('classe'),
        resultado.get('numero_formatado')
    ]

    if resultado.get('orgao_julgador'):
        partes.append(resultado['orgao_julgador'])

    if resultado.get('ultima_decisao', {}).get('data'):
        partes.append(resultado['ultima_decisao']['data'])

    return " - ".join(filter(None, partes))


# Função principal para integração com o chat
def processar_busca_jurisprudencia(
    termos: List[str],
    tribunais: Optional[List[str]] = None,
    limite: int = 5
) -> Dict[str, Any]:
    """
    Processa busca de jurisprudência para o chat.

    Args:
        termos: Lista de termos de busca
        tribunais: Lista de tribunais (ou None para padrão)
        limite: Limite de resultados

    Returns:
        Dict com resultados formatados para o chat
    """
    if tribunais is None:
        tribunais = ["TST"]  # Default: só TST

    todos_resultados = []

    for termo in termos:
        for tribunal in tribunais:
            resultado = buscar_por_assunto(termo, tribunal, limite)
            if resultado.get("sucesso"):
                todos_resultados.extend(resultado.get("resultados", []))

    # Remover duplicatas (pelo número do processo)
    vistos = set()
    resultados_unicos = []
    for r in todos_resultados:
        num = r.get("numero_processo")
        if num and num not in vistos:
            vistos.add(num)
            resultados_unicos.append(r)

    return {
        "sucesso": True,
        "total": len(resultados_unicos),
        "resultados": resultados_unicos[:limite],
        "contexto": formatar_para_contexto(resultados_unicos, limite)
    }
