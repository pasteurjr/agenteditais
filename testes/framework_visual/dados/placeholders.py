"""
Placeholders pra dataset — evita colisao de campos UNIQUE entre execucoes.

Especificacao: docs/PROCESSO_CADASTRO_UC_NO_BANCO.md secao 5.

Uso:
    from dados.placeholders import construir_mapa_placeholders, resolver_placeholders

    mapa = construir_mapa_placeholders(ciclo_id="teste-aa7e09bc", ctx=contexto_yaml_dict)
    dados_resolvidos = resolver_placeholders(dataset.dados_json, mapa)

Placeholders padrao:
  {{CICLO}}            → "teste-aa7e09bc"
  {{SUFIXO_CICLO}}     → "aa7e09bc"
  {{CNPJ_UNICO}}       → CNPJ valido RF (provisionado pelo context_manager)
  {{EMAIL_PRINCIPAL}}  → email valida<N>@valida.com (provisionado)
  {{SENHA_PRINCIPAL}}  → senha do user
  {{IE_UNICA}}         → inscricao estadual deterministica do hash do ciclo
  {{IM_UNICA}}         → inscricao municipal idem
  {{TELEFONE_UNICO}}   → telefone idem
"""
from __future__ import annotations

import hashlib
import re
from typing import Any


_PATTERN = re.compile(r"\{\{([A-Z_]+)\}\}")


def _hash_int(s: str, max_val: int) -> int:
    """Gera int deterministico de string."""
    h = hashlib.sha256(s.encode()).hexdigest()
    return int(h[:8], 16) % max_val


def _gerar_ie_deterministica(ciclo_id: str) -> str:
    """IE no formato XXX.XXX.XXX.XXX (12 digitos). Deterministica."""
    n = _hash_int(ciclo_id + "_IE", 999_999_999_999)
    s = f"{n:012d}"
    return f"{s[0:3]}.{s[3:6]}.{s[6:9]}.{s[9:12]}"


def _gerar_im_deterministica(ciclo_id: str) -> str:
    """IM no formato XXXXXXX-X (8 digitos). Deterministica."""
    n = _hash_int(ciclo_id + "_IM", 99_999_999)
    s = f"{n:08d}"
    return f"{s[0:7]}-{s[7]}"


def _gerar_telefone_deterministico(ciclo_id: str) -> str:
    """Telefone (11) 4XXX-YYYY deterministico, com DDD fixo SP."""
    n = _hash_int(ciclo_id + "_TEL", 9_999_999)
    s = f"{n:07d}"
    return f"(11) 4{s[0:3]}-{s[3:7]}"


def construir_mapa_placeholders(ciclo_id: str, ctx: dict[str, Any] | None = None) -> dict[str, str]:
    """
    Constroi mapa {placeholder: valor} pra uso em resolver_placeholders.

    Args:
        ciclo_id: id do ciclo (ex: "teste-aa7e09bc" ou "piloto-ucf01")
        ctx: dict do contexto.yaml carregado (de carregar_ciclo()). Se None, usa fallback.

    Returns:
        mapa de placeholders → valores
    """
    sufixo = ciclo_id.split("-")[-1][:8] if "-" in ciclo_id else ciclo_id[:8]

    cnpj = email = senha = None
    if ctx:
        # Trilha visual e a default da Sprint 1; futuro pode receber arg trilha=
        trilha_data = ctx.get("trilhas", {}).get("visual", {})
        emp = trilha_data.get("empresa", {})
        usr = trilha_data.get("usuario", {})
        cnpj = emp.get("cnpj_pretendido") or emp.get("cnpj")
        email = usr.get("email")
        senha = usr.get("senha")

    return {
        "CICLO": ciclo_id,
        "SUFIXO_CICLO": sufixo,
        "CNPJ_UNICO": cnpj or "00.000.000/0001-91",       # fallback: CNPJ generico
        "EMAIL_PRINCIPAL": email or "valida4@valida.com",
        "SENHA_PRINCIPAL": senha or "123456",
        "IE_UNICA": _gerar_ie_deterministica(ciclo_id),
        "IM_UNICA": _gerar_im_deterministica(ciclo_id),
        "TELEFONE_UNICO": _gerar_telefone_deterministico(ciclo_id),
    }


def resolver_placeholders(obj: Any, mapa: dict[str, str]) -> Any:
    """
    Substitui {{X}} recursivamente em strings dentro de dict/list/str.

    Placeholders nao-mapeados ficam intactos (warning seria ideal, mas nao bloqueia).

    Args:
        obj: estrutura arbitraria (dict, list, str, int, etc)
        mapa: {nome_placeholder: valor_string} (vindo de construir_mapa_placeholders)

    Returns:
        copia profunda com placeholders substituidos
    """
    if isinstance(obj, str):
        def _sub(m: re.Match) -> str:
            nome = m.group(1)
            return str(mapa.get(nome, m.group(0)))
        return _PATTERN.sub(_sub, obj)
    if isinstance(obj, dict):
        return {k: resolver_placeholders(v, mapa) for k, v in obj.items()}
    if isinstance(obj, list):
        return [resolver_placeholders(x, mapa) for x in obj]
    return obj


def listar_placeholders_nao_resolvidos(obj: Any) -> list[str]:
    """Util para auditor: lista todos os {{X}} ainda presentes em obj."""
    encontrados = set()

    def _walk(o):
        if isinstance(o, str):
            for m in _PATTERN.finditer(o):
                encontrados.add(m.group(1))
        elif isinstance(o, dict):
            for v in o.values():
                _walk(v)
        elif isinstance(o, list):
            for x in o:
                _walk(x)

    _walk(obj)
    return sorted(encontrados)
