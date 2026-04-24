#!/usr/bin/env python3
"""
Split dos documentos V5 de Casos de Uso em arquivos individuais.

Lê os 5 docs em `docs/*V5*.md`, identifica cada UC pelo cabeçalho
`## [UC-XYZ] ...`, e gera 1 arquivo por UC em
`testes/casos_de_uso/UC-XYZ.md`.

Cada arquivo gerado contém:
- Header com metadados (sprint origem, doc V5 origem, data do split)
- Bloco YAML com info estruturada (uc_id, sprint, nome)
- Conteúdo integral do UC (do `## [UC-` até o próximo, ou EOF)

Também produz `testes/casos_de_uso/README.md` com índice tabulado.

Uso:
    python3 scripts/split-uc-v5.py [--dry-run]

Saída: ~89 arquivos UC-*.md + README.md.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = PROJECT_ROOT / "docs"
OUTPUT_DIR = PROJECT_ROOT / "testes" / "casos_de_uso"

# Mapping doc V5 → sprint
DOC_TO_SPRINT: dict[str, str] = {
    "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md": "Sprint 1",
    "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md": "Sprint 2",
    "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md": "Sprint 3-4 (Precificação e Proposta)",
    "CASOS DE USO RECURSOS E IMPUGNACOES V5.md": "Sprint 4 (Recursos e Impugnações)",
    "CASOS DE USO SPRINT5 V5.md": "Sprint 5",
}

UC_HEADER_RE = re.compile(r"^##\s*\[(UC-[A-Z]+\d+)\]\s*(.+?)$", re.MULTILINE)


@dataclass
class UC:
    """Representa um caso de uso extraído."""

    uc_id: str
    nome: str
    sprint: str
    doc_origem: str
    conteudo: str  # markdown integral, do header inclusive até antes do próximo
    linha_inicio: int  # linha no doc original (1-based) onde começa


def split_doc(doc_path: Path, sprint: str) -> list[UC]:
    """Quebra um doc V5 em lista de UCs."""
    text = doc_path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)

    # Encontra todas as posições de `## [UC-` com regex sobre linhas inteiras
    matches: list[tuple[int, int, str, str]] = []  # (line_idx, char_offset, uc_id, nome)
    char_offset = 0
    for i, line in enumerate(lines):
        m = UC_HEADER_RE.match(line)
        if m:
            matches.append((i, char_offset, m.group(1), m.group(2).strip()))
        char_offset += len(line)

    if not matches:
        return []

    ucs: list[UC] = []
    for idx, (line_idx, char_offset, uc_id, nome) in enumerate(matches):
        # Conteúdo vai do início deste header até o próximo (ou EOF)
        if idx + 1 < len(matches):
            end_offset = matches[idx + 1][1]
            conteudo = text[char_offset:end_offset]
        else:
            conteudo = text[char_offset:]

        # Limpar trailing whitespace e separadores
        conteudo = conteudo.rstrip() + "\n"

        ucs.append(
            UC(
                uc_id=uc_id,
                nome=nome,
                sprint=sprint,
                doc_origem=doc_path.name,
                conteudo=conteudo,
                linha_inicio=line_idx + 1,
            )
        )
    return ucs


def render_uc_file(uc: UC, gerado_em: str) -> str:
    """Gera o arquivo final UC-XYZ.md com header + frontmatter + conteúdo."""
    # Frontmatter com metadados estruturados (não YAML strict — apenas anotação)
    header = f"""---
uc_id: {uc.uc_id}
nome: "{uc.nome}"
sprint: "{uc.sprint}"
versao_uc: "5.0"
doc_origem: "{uc.doc_origem}"
linha_inicio_no_doc: {uc.linha_inicio}
split_gerado_em: "{gerado_em}"
---

# {uc.uc_id} — {uc.nome}

> Caso de uso extraído automaticamente de `docs/{uc.doc_origem}` (linha {uc.linha_inicio}).
> Sprint origem: **{uc.sprint}**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

"""
    # Conteúdo original — remover o `## [UC-XYZ]` que vai virar `# UC-XYZ` no novo arquivo
    # e ajustar níveis de heading (o original era ## H2, agora vamos descer 1 nível pra
    # tudo abaixo do título)
    cont = uc.conteudo
    # Remove a primeira linha (## [UC-XYZ] ...) — já temos no header customizado
    cont_lines = cont.splitlines(keepends=True)
    if cont_lines and cont_lines[0].startswith("## ["):
        cont = "".join(cont_lines[1:])

    # Não vou alterar níveis de heading — pode quebrar referências internas.
    # O parser do uc-analyzer agente lida com headings em qualquer nível.

    return header + cont.lstrip()


def render_readme(ucs: list[UC], gerado_em: str) -> str:
    """Gera o índice em testes/casos_de_uso/README.md."""
    canonicos = [u for u in ucs if "_legacy" not in u.uc_id]
    legacies = [u for u in ucs if "_legacy" in u.uc_id]

    lines = [
        "# Índice de Casos de Uso (V5)",
        "",
        f"**Gerado em:** {gerado_em}",
        f"**Total de UCs canônicos:** {len(canonicos)}",
        f"**UCs legacy preservados:** {len(legacies)} (versões antigas de UCs duplicados em docs diferentes)",
        f"**Origem:** 5 documentos V5 em `docs/`.",
        "",
        "Cada arquivo `UC-XYZ.md` contém o caso de uso integral com metadados.",
        "Para regerar tudo: `python3 scripts/split-uc-v5.py`.",
        "",
        "## UCs canônicos por Sprint",
        "",
    ]

    # Agrupar canônicos por sprint
    sprints_ord = sorted({u.sprint for u in canonicos})
    for sprint in sprints_ord:
        ucs_sprint = [u for u in canonicos if u.sprint == sprint]
        lines.append(f"### {sprint}")
        lines.append("")
        lines.append("| UC | Nome | Doc origem |")
        lines.append("|---|---|---|")
        for u in ucs_sprint:
            doc_short = u.doc_origem.replace("CASOS DE USO ", "").replace(" V5.md", "")
            lines.append(f"| [{u.uc_id}]({u.uc_id}.md) | {u.nome} | {doc_short} |")
        lines.append("")

    if legacies:
        lines.append("## UCs legacy (duplicatas resolvidas)")
        lines.append("")
        lines.append(
            "Estes UCs aparecem em DOIS docs V5 com conteúdos diferentes. "
            "O canônico (sem sufixo) é a versão mais recente; o legacy é a versão "
            "antiga preservada para auditoria. **O processo de validação usa apenas o canônico.**"
        )
        lines.append("")
        lines.append("| UC legacy | Sprint origem | Nome | Substituído por |")
        lines.append("|---|---|---|---|")
        for u in legacies:
            doc_short = u.doc_origem.replace("CASOS DE USO ", "").replace(" V5.md", "")
            # Nome canônico: remove sufixo _S<n>_legacy
            uc_canonico = re.sub(r"_S\d+_legacy$", "", u.uc_id)
            lines.append(f"| [{u.uc_id}]({u.uc_id}.md) | {u.sprint} | {u.nome} | [{uc_canonico}]({uc_canonico}.md) |")
        lines.append("")

    lines.append("## Listagem completa (apenas canônicos, ordem alfabética)")
    lines.append("")
    lines.append("| UC | Sprint | Nome |")
    lines.append("|---|---|---|")
    for u in sorted(canonicos, key=lambda x: x.uc_id):
        lines.append(f"| [{u.uc_id}]({u.uc_id}.md) | {u.sprint} | {u.nome} |")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Como usar")
    lines.append("")
    lines.append(
        "Estes arquivos são a **entrada** do processo de validação V3. "
        "O agente `validation-uc-analyzer` lê cada UC e produz a estrutura formal "
        "que alimenta o resto do pipeline (datasets → casos de teste → tutoriais)."
    )
    lines.append("")
    lines.append("Ver `docs/VALIDACAOFACILICITA.md` para o processo completo.")
    lines.append("")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Não escreve arquivos, só imprime o que faria")
    args = parser.parse_args()

    if not DOCS_DIR.is_dir():
        print(f"ERRO: dir não existe: {DOCS_DIR}", file=sys.stderr)
        return 1

    if not OUTPUT_DIR.is_dir() and not args.dry_run:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    gerado_em = datetime.now().isoformat(timespec="seconds")

    todos_ucs: list[UC] = []
    for doc_filename, sprint in DOC_TO_SPRINT.items():
        doc_path = DOCS_DIR / doc_filename
        if not doc_path.is_file():
            print(f"AVISO: doc não encontrado: {doc_path}", file=sys.stderr)
            continue

        ucs = split_doc(doc_path, sprint)
        print(f"  {doc_filename}: {len(ucs)} UCs")
        todos_ucs.extend(ucs)

    print(f"\nTotal de UCs encontrados: {len(todos_ucs)}")

    if args.dry_run:
        print("\n--dry-run: nada gravado.")
        for u in todos_ucs[:5]:
            print(f"  - {u.uc_id} ({u.sprint}): {u.nome[:60]}")
        if len(todos_ucs) > 5:
            print(f"  ... e mais {len(todos_ucs) - 5}")
        return 0

    # Detectar duplicatas (mesmo uc_id em múltiplos docs)
    seen: dict[str, UC] = {}
    duplicatas: list[tuple[UC, UC]] = []
    for u in todos_ucs:
        if u.uc_id in seen:
            duplicatas.append((seen[u.uc_id], u))
        else:
            seen[u.uc_id] = u

    if duplicatas:
        print("\nDUPLICATAS DETECTADAS (mesmo UC-ID em docs diferentes):")
        # Estratégia: o arquivo canônico (UC-XYZ.md) recebe o conteúdo do doc
        # MAIS RECENTE em ordem de processamento (geralmente Sprint maior).
        # As versões anteriores ficam em UC-XYZ_<sprint>_legacy.md
        # Como iteramos na ordem do DOC_TO_SPRINT, o último vencer.

        # Reorganizar: agrupar por uc_id, manter o último como canônico
        ordem_origem = list(todos_ucs)
        canonicos: dict[str, UC] = {}
        legacies: list[UC] = []
        for u in ordem_origem:
            if u.uc_id in canonicos:
                # O anterior vira legacy
                anterior = canonicos[u.uc_id]
                sprint_short = anterior.sprint.replace("Sprint ", "S").split()[0].rstrip(",")
                anterior.uc_id = f"{anterior.uc_id}_{sprint_short}_legacy"
                legacies.append(anterior)
                print(f"  - {u.uc_id} canônico = {u.doc_origem} (Sprint mais recente); {anterior.doc_origem} → legacy")
            canonicos[u.uc_id] = u

        # Reconstruir lista mantendo: canônicos + legacies
        todos_ucs = list(canonicos.values()) + legacies

    # Escrever arquivos (idempotente: só regrava se conteúdo "real" mudou)
    escritos = 0
    inalterados = 0
    legacy_paths: list[str] = []
    for u in todos_ucs:
        out_path = OUTPUT_DIR / f"{u.uc_id}.md"
        novo = render_uc_file(u, gerado_em)
        regravar = True
        if out_path.exists():
            atual = out_path.read_text(encoding="utf-8")
            # Comparar excluindo a linha do timestamp
            atual_norm = re.sub(r'^split_gerado_em:.*\n', '', atual, flags=re.MULTILINE)
            novo_norm = re.sub(r'^split_gerado_em:.*\n', '', novo, flags=re.MULTILINE)
            if atual_norm == novo_norm:
                regravar = False
                inalterados += 1
        if regravar:
            out_path.write_text(novo, encoding="utf-8")
            escritos += 1
        if "_legacy" in u.uc_id:
            legacy_paths.append(u.uc_id)

    # README index (mesma lógica de idempotência)
    readme_path = OUTPUT_DIR / "README.md"
    novo_readme = render_readme(todos_ucs, gerado_em)
    if readme_path.exists():
        atual = readme_path.read_text(encoding="utf-8")
        atual_norm = re.sub(r'^\*\*Gerado em:\*\*.*\n', '', atual, flags=re.MULTILINE)
        novo_norm = re.sub(r'^\*\*Gerado em:\*\*.*\n', '', novo_readme, flags=re.MULTILINE)
        if atual_norm != novo_norm:
            readme_path.write_text(novo_readme, encoding="utf-8")
    else:
        readme_path.write_text(novo_readme, encoding="utf-8")

    print(f"\n✅ {escritos} arquivos UC-*.md (re)escritos, {inalterados} inalterados")
    print(f"✅ Índice: {readme_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
