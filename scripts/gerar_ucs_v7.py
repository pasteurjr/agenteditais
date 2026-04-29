#!/usr/bin/env python3
"""
Gera V7 dos documentos de Casos de Uso adicionando secao "UCs predecessores"
apos cada bloco "Pre-condicoes".

Le V6 (se existir) ou V5. Saida: V7 do mesmo doc + atualiza splits em
testes/casos_de_uso/UC-XXX.md.

Uso:
    python3 scripts/gerar_ucs_v7.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Mapeamento curado: uc_id → lista de predecessores
# Cada item da lista: "UC-XXX" | "[login]" | "[infra]" | "[seed]" | "UC-A OU UC-B"
PREDECESSORES = {
    # Sprint 1
    # UC-F01 cria empresa e dispara UC-F18 (vincular) via <<uses>>
    "UC-F01": ["[login]", "[infra]", "UC-F18 (uses)"],
    # UCs que precisam de empresa VINCULADA ao user corrente:
    # UC-F01 cria a empresa, UC-F18 vincula. Ambos sao predecessores AND.
    # UC-F02 tambem precisa de hierarquia Area/Classe/Subclasse criada (UC-F13 V8).
    "UC-F02": ["UC-F01", "UC-F18", "UC-F13"],
    "UC-F03": ["UC-F01", "UC-F18", "[infra]", "[seed]"],
    "UC-F04": ["UC-F01", "UC-F18", "[seed]", "[infra]"],
    "UC-F05": ["UC-F01", "UC-F18", "[infra]"],
    "UC-F06": ["[login]", "UC-F07 OU UC-F08", "UC-F13"],  # hierarquia Area/Classe/Subclasse criada em UC-F13 V8
    "UC-F07": ["[login]", "[infra]"],
    "UC-F08": ["UC-F07 OU UC-F08", "UC-F13"],  # subclasse com mascara criada em UC-F13 V8
    "UC-F09": ["UC-F07 OU UC-F08", "[infra]"],
    "UC-F10": ["UC-F06", "[infra]"],
    "UC-F11": ["UC-F07 OU UC-F08", "[infra]"],
    "UC-F12": ["UC-F06", "[infra]"],
    "UC-F13": ["UC-F01", "UC-F18", "[infra]"],  # V8: cria hierarquia (precisa empresa vinculada)
    "UC-F14": ["[infra]"],
    "UC-F15": ["[infra]", "[seed]"],
    "UC-F16": ["[infra]", "[seed]"],
    "UC-F17": ["[seed]"],
    "UC-F18": ["[login]", "UC-F01", "[infra]"],  # vincular empresa a user — usa UC-F01 como predecessor (a empresa deve existir)
    # Sprint 2
    "UC-CV01": ["[login]", "UC-F14", "UC-F15", "UC-F16", "UC-F13"],  # filtros cascata Area/Classe/Subclasse exigem hierarquia (UC-F13 V8)
    "UC-CV02": ["UC-CV01"],
    "UC-CV03": ["UC-CV01", "[infra]"],
    "UC-CV04": ["UC-CV02", "UC-CV03"],
    "UC-CV05": ["UC-CV01"],
    "UC-CV06": ["[infra]"],
    "UC-CV07": ["UC-CV03", "[infra]"],
    "UC-CV08": ["UC-CV07", "[infra]"],
    "UC-CV09": ["UC-CV03 OU UC-CV07"],
    "UC-CV10": ["UC-CV03 OU UC-CV07", "UC-F01", "UC-F18", "UC-F03", "[infra]"],
    "UC-CV11": ["UC-CV03 OU UC-CV07"],
    "UC-CV12": ["UC-CV03 OU UC-CV07", "[infra]"],
    "UC-CV13": ["UC-CV03 OU UC-CV07", "[infra]"],
    # Sprint 3-4 (Precificacao/Proposta)
    "UC-P01": ["[login]", "UC-CV03", "UC-CV09"],
    "UC-P02": ["UC-P01", "UC-F07 OU UC-F08"],
    "UC-P03": ["UC-P01", "UC-P02"],
    "UC-P04": ["UC-P03", "UC-F07 OU UC-F08"],
    "UC-P05": ["UC-P04"],
    "UC-P06": ["UC-P05"],
    "UC-P07": ["UC-P04", "UC-P05", "UC-P06"],
    "UC-P08": ["UC-P07"],
    "UC-P09": ["UC-F06"],
    "UC-P10": ["[login]"],
    "UC-P11": ["UC-P02"],
    "UC-P12": ["UC-P04 OU UC-P05"],
    "UC-R01": ["UC-P04", "UC-P05", "UC-P06", "UC-P07", "UC-P08", "UC-CV03", "UC-F07 OU UC-F08"],
    "UC-R02": ["[login]"],
    "UC-R03": ["UC-R01"],
    "UC-R04": ["UC-R01 OU UC-R02", "UC-F07 OU UC-F08"],
    "UC-R05": ["UC-R01 OU UC-R02", "UC-F03"],
    "UC-R06": ["UC-R01 OU UC-R02", "UC-R04 OU UC-R05"],
    "UC-R07": ["UC-R01 OU UC-R02"],
    # Sprint 4 (Recursos/Impugnacoes/Funcional)
    "UC-I01": ["[login]", "UC-CV03", "[seed]"],
    "UC-I02": ["UC-I01", "[seed]"],
    "UC-I03": ["UC-I02", "[seed]"],
    "UC-I04": ["[login]", "UC-CV03"],
    "UC-I05": ["UC-CV03", "UC-I03 OU UC-I04", "[infra]"],
    "UC-RE01": ["[infra]"],
    "UC-RE02": ["UC-CV03", "[seed]"],
    "UC-RE03": ["UC-RE02"],
    "UC-RE04": ["UC-RE02", "UC-RE01"],
    "UC-RE05": ["UC-R01 OU UC-R02", "UC-CV03"],
    "UC-RE06": ["UC-I03 OU UC-RE04 OU UC-RE05", "[infra]"],
    "UC-FU01": ["[login]"],
    "UC-FU02": ["UC-CT01 OU UC-AT01"],
    "UC-FU03": ["UC-CV03", "UC-F15 OU [seed]"],
    # Sprint 5 (Atas/Contratos/Acompanhamento/CRM)
    "UC-AT01": ["[login]", "[infra]"],
    "UC-AT02": ["UC-AT01", "[infra]"],
    "UC-AT03": ["UC-AT01"],
    "UC-CR01": ["UC-CT01"],
    "UC-CR02": ["UC-CT01", "UC-CT02"],
    "UC-CR03": ["UC-CT01"],
    "UC-CRM01": ["UC-CV03"],
    "UC-CRM02": ["UC-CV03", "UC-FU01"],
    "UC-CRM03": ["UC-CV03"],
    "UC-CRM04": ["UC-FU01"],
    "UC-CRM05": ["UC-FU01"],
    "UC-CRM06": ["UC-CT01"],
    "UC-CRM07": ["UC-FU01", "UC-CT01"],
    "UC-CT01": ["[login]", "UC-FU01"],
    "UC-CT02": ["UC-CT01"],
    "UC-CT03": ["UC-CT02"],
    "UC-CT04": ["UC-CT01"],
    "UC-CT05": ["UC-CT01"],
    "UC-CT06": ["UC-AT01", "UC-AT02"],
    "UC-CT07": ["UC-CT01"],
    "UC-CT08": ["UC-CT01"],
    "UC-CT09": ["UC-CT01"],
    "UC-CT10": ["UC-CT01"],
}


def construir_secao_predecessores(uc_id: str) -> str:
    """Monta a secao MD '### UCs predecessores' pra um uc_id."""
    preds = PREDECESSORES.get(uc_id)
    if not preds:
        return f"""### UCs predecessores

Nao mapeado. Verificar manualmente quais UCs satisfazem as pre-condicoes.

"""
    # Separar UCs reais de marcadores
    ucs_concretos = [p for p in preds if p.startswith("UC-") or " OU " in p]
    marcadores = [p for p in preds if p.startswith("[")]

    bloco = "### UCs predecessores\n\n"
    bloco += "Estado satisfeito por execucao previa de:\n\n"
    for p in ucs_concretos:
        bloco += f"- **{p}**\n"
    if marcadores:
        bloco += "\nPre-requisitos nao-UC:\n\n"
        legenda = {
            "[login]": "autenticacao basica do usuario",
            "[infra]": "endpoint/servico operacional (nao eh UC)",
            "[seed]": "dado pre-cadastrado no banco (seed)",
        }
        for m in marcadores:
            desc = legenda.get(m, "")
            bloco += f"- `{m}` — {desc}\n" if desc else f"- `{m}`\n"

    if not ucs_concretos:
        # UC raiz
        bloco = "### UCs predecessores\n\n**UC raiz** — nao depende de execucao previa de outros UCs.\n\n"
        if marcadores:
            bloco += "Pre-requisitos nao-UC:\n\n"
            legenda = {
                "[login]": "autenticacao basica do usuario",
                "[infra]": "endpoint/servico operacional (nao eh UC)",
                "[seed]": "dado pre-cadastrado no banco (seed)",
            }
            for m in marcadores:
                desc = legenda.get(m, "")
                bloco += f"- `{m}` — {desc}\n" if desc else f"- `{m}`\n"
    bloco += "\n"
    return bloco


# Regex para localizar bloco de pre-condicoes e o proximo titulo de mesmo nivel
RE_UC_HEADER = re.compile(
    r"^(##\s+UC-[A-Z0-9]+(?:_S\d_legacy)?\s*[—\-:]\s*.*?)$",
    re.MULTILINE
)
RE_PRE_BLOCO = re.compile(
    r"(### Pre-condicoes\n.*?)(?=\n### )",
    re.DOTALL
)


def extrair_uc_id_do_header(linha: str) -> str | None:
    """Extrai uc_id de '## [UC-F01] Nome'."""
    m = re.search(r"##\s+\[(UC-[A-Z0-9]+(?:_S\d_legacy)?)\]", linha)
    return m.group(1) if m else None


def processar_doc(path_in: Path, path_out: Path) -> tuple[int, int]:
    """Le doc V5/V6, injeta secao UCs predecessores apos cada Pre-condicoes,
    grava como V7. Retorna (n_ucs_processados, n_ucs_com_predecessores_mapeados)."""
    if not path_in.exists():
        print(f"  [skip] {path_in.name} nao existe")
        return 0, 0

    conteudo = path_in.read_text(encoding="utf-8")
    n_ucs = 0
    n_mapeados = 0

    # Estrategia: split por header de UC, processa cada bloco
    # Header da forma: "## UC-XXX — Nome"
    partes = re.split(r"(?=^##\s+\[UC-[A-Z0-9]+(?:_S\d_legacy)?\])", conteudo, flags=re.MULTILINE)

    novas_partes = []
    for parte in partes:
        if not parte.strip().startswith("## [UC-"):
            novas_partes.append(parte)
            continue

        # Extrai uc_id do primeiro header
        primeira_linha = parte.split("\n", 1)[0]
        uc_id = extrair_uc_id_do_header(primeira_linha)
        if not uc_id:
            novas_partes.append(parte)
            continue

        # Normaliza uc_id (remove sufixo _S4_legacy pra mapear)
        uc_id_norm = uc_id.replace("_S4_legacy", "")
        n_ucs += 1
        if uc_id_norm in PREDECESSORES:
            n_mapeados += 1

        # Injeta a secao DEPOIS da Pre-condicoes (antes do proximo ###)
        secao_pred = construir_secao_predecessores(uc_id_norm)

        # Acha "### Pre-condicoes ... \n### "
        match_pre = re.search(
            r"(###\s*Pre-condicoes.*?)(?=\n###\s)",
            parte,
            re.DOTALL | re.IGNORECASE
        )
        if match_pre:
            inicio = match_pre.end()
            parte_nova = parte[:inicio] + "\n" + secao_pred + parte[inicio:]
        else:
            # Doc sem Pre-condicoes — adiciona apos o header
            # (pula doc se nao tem)
            parte_nova = parte
            if uc_id_norm in PREDECESSORES:
                # Insere depois do primeiro paragrafo apos o header
                lines = parte.split("\n")
                # Acha primeira linha em branco depois da linha 0
                inseriu = False
                for i in range(1, min(len(lines), 30)):
                    if lines[i].strip() == "" and i + 1 < len(lines) and lines[i+1].startswith("###"):
                        # Insere antes do primeiro ###
                        lines.insert(i+1, secao_pred.rstrip())
                        parte_nova = "\n".join(lines)
                        inseriu = True
                        break

        novas_partes.append(parte_nova)

    novo_conteudo = "".join(novas_partes)

    # Adiciona nota de versao no header do doc
    if "<!-- V7 GENERATED" not in novo_conteudo:
        nota = "<!-- V7 GENERATED — secao 'UCs predecessores' adicionada automaticamente em 2026-04-28 -->\n\n"
        # Apos primeiro titulo H1
        novo_conteudo = re.sub(r"^(#\s+.*?\n)", r"\1\n" + nota, novo_conteudo, count=1, flags=re.MULTILINE)

    path_out.write_text(novo_conteudo, encoding="utf-8")
    return n_ucs, n_mapeados


def processar_split(uc_md_path: Path) -> bool:
    """Atualiza um arquivo testes/casos_de_uso/UC-XXX.md com secao UCs predecessores."""
    if not uc_md_path.exists():
        return False
    conteudo = uc_md_path.read_text(encoding="utf-8")
    uc_id = uc_md_path.stem.replace("_S4_legacy", "")
    if uc_id not in PREDECESSORES:
        return False

    # Verifica se ja tem
    if "### UCs predecessores" in conteudo:
        # Substitui secao existente
        conteudo = re.sub(
            r"### UCs predecessores.*?(?=\n### )",
            construir_secao_predecessores(uc_id),
            conteudo,
            count=1,
            flags=re.DOTALL,
        )
    else:
        secao_pred = construir_secao_predecessores(uc_id)
        match_pre = re.search(
            r"(###\s*Pre-condicoes.*?)(?=\n###\s)",
            conteudo,
            re.DOTALL | re.IGNORECASE
        )
        if match_pre:
            inicio = match_pre.end()
            conteudo = conteudo[:inicio] + "\n" + secao_pred + conteudo[inicio:]
        else:
            return False

    uc_md_path.write_text(conteudo, encoding="utf-8")
    return True


DOCS = [
    # (input V5 ou V6, output V7)
    ("CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V6.md", "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V7.md"),
    ("CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md", "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V7.md"),
    ("CASOS DE USO PRECIFICACAO E PROPOSTA V5.md", "CASOS DE USO PRECIFICACAO E PROPOSTA V7.md"),
    ("CASOS DE USO RECURSOS E IMPUGNACOES V5.md", "CASOS DE USO RECURSOS E IMPUGNACOES V7.md"),
    ("CASOS DE USO SPRINT5 V5.md", "CASOS DE USO SPRINT5 V7.md"),
]


def main():
    print("=== Gerador V7 dos Casos de Uso ===")
    docs_dir = PROJECT_ROOT / "docs"
    splits_dir = PROJECT_ROOT / "testes" / "casos_de_uso"

    total_ucs = 0
    total_mapeados = 0

    print("\n[1] Gerando V7 dos documentos consolidados:")
    for inp, out in DOCS:
        path_in = docs_dir / inp
        path_out = docs_dir / out
        n, m = processar_doc(path_in, path_out)
        print(f"  {out}: {n} UCs ({m} mapeados)")
        total_ucs += n
        total_mapeados += m

    print(f"\n[2] Atualizando splits em testes/casos_de_uso/:")
    n_splits = 0
    for uc_md in sorted(splits_dir.glob("UC-*.md")):
        if processar_split(uc_md):
            n_splits += 1
    print(f"  {n_splits} splits atualizados")

    print(f"\n=== RESUMO ===")
    print(f"  UCs totais: {total_ucs}")
    print(f"  UCs com predecessores mapeados: {total_mapeados}")
    print(f"  UCs sem mapeamento (carecem revisao): {total_ucs - total_mapeados}")
    print(f"  Splits atualizados: {n_splits}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
