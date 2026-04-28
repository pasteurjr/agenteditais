"""
Parser do documento CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md

Estrutura esperada por CT (tabela vertical Markdown):
  #### CT-F01-FP — descricao curta
  | Campo | Valor |
  |---|---|
  | **ID** | CT-F01-FP |
  | **Descricao** | ... |
  | **Pre-condicoes** | ... |
  | **Acoes do ator e dados de entrada** | ... |
  | **Saida esperada** | ... |
  | **Tipo** | Positivo |
  | **Categoria** | Cenário |
  | **RNs** | ... |
  | **Trilha sugerida** | visual |

UC corrente identificado por linha "## [UC-FXX] ...".

Saida: lista de dicts.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable, Optional


_RE_UC_HEADER = re.compile(r"^## \[(UC-F\d{2})\] (.+)$", re.MULTILINE)
_RE_CT_HEADER = re.compile(r"^#### (CT-F\S+) — (.+?)$", re.MULTILINE)
_RE_TABLE_ROW = re.compile(r"^\|\s*\*\*([^*]+)\*\*\s*\|\s*(.+?)\s*\|\s*$")


# Mapeamento label da tabela → chave do dict
LABEL_KEYS = {
    "ID": "ct_id",
    "Descricao": "descricao",
    "Pre-condicoes": "pre_condicoes",
    "Acoes do ator e dados de entrada": "acoes",
    "Saida esperada": "saida_esperada",
    "Tipo": "tipo",
    "Categoria": "categoria",
    "RNs": "rns_aplicadas",
    "Trilha sugerida": "trilha_sugerida",
    "Trilha": "trilha_sugerida",  # variante
}


@dataclass
class CTParsed:
    uc_id: str
    ct_id: str
    descricao: str = ""
    pre_condicoes: str = ""
    acoes: str = ""
    saida_esperada: str = ""
    tipo: str = "Positivo"
    categoria: str = "Cenário"
    trilha_sugerida: str = "visual"
    rns_aplicadas: str = ""
    fonte_doc: str = ""
    variacao_tutorial: Optional[str] = None


def _infer_variacao(ct_id: str) -> Optional[str]:
    """A partir do ID do CT, infere o nome da variacao do tutorial visual.

    CT-F01-FP -> "fp"
    CT-F01-FA07-A -> "fa07a"
    CT-F01-FE01 -> "fe01"
    Caso contrario (CLS, LIM, COMB) -> None (nao tem tutorial visual).
    """
    parts = ct_id.split("-")  # ['CT', 'F01', 'FP'] ou ['CT', 'F01', 'FA07', 'A']
    if len(parts) < 3:
        return None
    suffix = "-".join(parts[2:]).lower()
    # FP, FA01, FA07, FA07-A → fp, fa01, fa07, fa07a
    if suffix == "fp":
        return "fp"
    m = re.match(r"^(fa\d+)(?:-(\w+))?$", suffix)
    if m:
        return f"{m.group(1)}{m.group(2) or ''}"
    m = re.match(r"^(fe\d+)$", suffix)
    if m:
        return suffix
    return None


def _normalize_categoria(raw: str) -> str:
    """Aceita 'Cenario'/'Cenário' e normaliza pra forma com acento."""
    raw = raw.strip()
    mapping = {
        "Cenario": "Cenário",
        "Cenário": "Cenário",
        "Classe": "Classe",
        "Fronteira": "Fronteira",
        "Combinado": "Combinado",
    }
    return mapping.get(raw, raw)


def _normalize_trilha(raw: str) -> str:
    raw = raw.strip().lower()
    if raw in {"visual", "e2e", "humana"}:
        return raw
    return "visual"


def parse_v7(md_path: Path) -> list[dict]:
    """Le o markdown V7 e retorna lista de dicts pronta pra UPSERT no banco."""
    text = md_path.read_text(encoding="utf-8")
    lines = text.split("\n")

    cts: list[CTParsed] = []
    current_uc: Optional[str] = None
    current_ct: Optional[CTParsed] = None

    for line in lines:
        # UC header
        m_uc = _RE_UC_HEADER.match(line)
        if m_uc:
            # Antes de mudar de UC, persiste o CT atual (ultimo do UC anterior)
            if current_ct is not None:
                cts.append(current_ct)
                current_ct = None
            current_uc = m_uc.group(1)
            continue

        # CT header
        m_ct = _RE_CT_HEADER.match(line)
        if m_ct:
            if current_ct is not None:
                cts.append(current_ct)
            ct_id = m_ct.group(1)
            descricao = m_ct.group(2).strip()
            current_ct = CTParsed(
                uc_id=current_uc or "UC-???",
                ct_id=ct_id,
                descricao=descricao,
                fonte_doc=str(md_path),
                variacao_tutorial=_infer_variacao(ct_id),
            )
            continue

        # Linha de tabela
        m_row = _RE_TABLE_ROW.match(line)
        if m_row and current_ct is not None:
            label = m_row.group(1).strip()
            value = m_row.group(2).strip()
            key = LABEL_KEYS.get(label)
            if not key:
                continue
            if key == "categoria":
                value = _normalize_categoria(value)
            elif key == "trilha_sugerida":
                value = _normalize_trilha(value)
            elif key == "ct_id":
                # ja temos do header — ignora se bater, sobrescreve se diferente
                if value != current_ct.ct_id:
                    current_ct.ct_id = value
                continue
            setattr(current_ct, key, value)

    if current_ct is not None:
        cts.append(current_ct)

    return [asdict(ct) for ct in cts]


def stats(cts: Iterable[dict]) -> dict[str, int]:
    """Conta CTs por categoria/tipo/trilha pra sanity check."""
    out = {"total": 0, "Cenário": 0, "Classe": 0, "Fronteira": 0, "Combinado": 0,
           "Positivo": 0, "Negativo": 0, "Limite": 0,
           "visual": 0, "e2e": 0, "humana": 0}
    for ct in cts:
        out["total"] += 1
        out[ct["categoria"]] = out.get(ct["categoria"], 0) + 1
        out[ct["tipo"]] = out.get(ct["tipo"], 0) + 1
        out[ct["trilha_sugerida"]] = out.get(ct["trilha_sugerida"], 0) + 1
    return out


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        md = Path(sys.argv[1])
    else:
        md = Path(__file__).resolve().parents[3] / "docs" / "CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md"

    cts = parse_v7(md)
    s = stats(cts)
    print(f"Arquivo: {md}")
    print(f"Total CTs: {s['total']}")
    print(f"Por categoria: Cenário={s['Cenário']}, Classe={s['Classe']}, Fronteira={s['Fronteira']}, Combinado={s['Combinado']}")
    print(f"Por tipo: Positivo={s['Positivo']}, Negativo={s['Negativo']}, Limite={s['Limite']}")
    print(f"Por trilha: visual={s['visual']}, e2e={s['e2e']}, humana={s['humana']}")
    print()
    print("Primeiros 3 CTs:")
    for ct in cts[:3]:
        print(f"  {ct['ct_id']} ({ct['uc_id']}) [{ct['tipo']}/{ct['categoria']}/{ct['trilha_sugerida']}] var={ct['variacao_tutorial']}")
        print(f"    desc: {ct['descricao'][:80]}")
