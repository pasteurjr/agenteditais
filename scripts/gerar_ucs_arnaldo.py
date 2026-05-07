#!/usr/bin/env python3
"""Gerador dos 25 UC-ARN-NN da Sprint 10.

Le docs/SPEC_UCS_ARNALDO.yaml e gera por UC:
  testes/casos_de_uso/UC-ARN-NN.md
  testes/datasets/UC-ARN-NN_visual.yaml
  testes/casos_de_teste/UC-ARN-NN_visual_fp.yaml
  testes/tutoriais_visual/UC-ARN-NN_fp.md
  testes/framework_visual/seed/importar_tutorial_uc_arn_NN.py

Idempotente: sobrescreve se ja existe.
"""
from __future__ import annotations
import sys
import yaml
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
SPEC = PROJECT / "docs" / "SPEC_UCS_ARNALDO.yaml"

DIR_UC = PROJECT / "testes" / "casos_de_uso"
DIR_DS = PROJECT / "testes" / "datasets"
DIR_CT = PROJECT / "testes" / "casos_de_teste"
DIR_TUT = PROJECT / "testes" / "tutoriais_visual"
DIR_SEED = PROJECT / "testes" / "framework_visual" / "seed"


def gerar_caso_de_uso(uc):
    """testes/casos_de_uso/UC-ARN-NN.md"""
    p = DIR_UC / f"{uc['id']}.md"
    pre = "\n".join(f"- {x}" for x in uc.get("pre_condicoes", []))
    if not pre:
        pre = "- Empresa criada anteriormente no ciclo (UC-ARN-01)"
    pontos = "\n".join(f"- {x}" for x in uc.get("pontos_observacao", []))
    if not pontos:
        pontos = f"- Confirma que a correção {uc['obs']} esta aplicada"
    conteudo = f"""---
uc_id: {uc['id']}
nome: "{uc['titulo']}"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "{uc['obs']}"
---

# {uc['id']} — {uc['titulo']}

> **Origem:** observação **{uc['obs']}** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

{uc['descricao']}

## Pré-condições

{pre}

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

{pontos}

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção {uc['obs']} esta aplicada.
"""
    p.write_text(conteudo, encoding="utf-8")
    print(f"  [uc]   {p.relative_to(PROJECT)}")


def gerar_dataset(uc):
    """testes/datasets/UC-ARN-NN_visual.yaml"""
    p = DIR_DS / f"{uc['id']}_visual.yaml"
    conteudo = f"""uc_id: {uc['id']}
trilha: visual
ciclo_id_default: arnaldo-correcoes-v1

# UC gerado a partir de docs/SPEC_UCS_ARNALDO.yaml
# Relacionado a: {uc['obs']}
# Empresa do ciclo (criada por UC-ARN-01) ja deve existir quando este UC roda.

usuario:
  email: "{{{{EMAIL_PRINCIPAL}}}}"
  senha: "{{{{SENHA_PRINCIPAL}}}}"

# Dataset minimo: a maior parte dos asserts ja inclui placeholders inline.
# Adicione campos especificos abaixo se este UC precisar:
empresa:
  cnpj: "{{{{CNPJ_UNICO}}}}"
  razao_social: "DEMO ARN {{{{SUFIXO_CICLO}}}} Ltda"
  uf: "SP"
"""
    p.write_text(conteudo, encoding="utf-8")
    print(f"  [ds]   {p.relative_to(PROJECT)}")


def gerar_caso_de_teste(uc):
    """testes/casos_de_teste/UC-ARN-NN_visual_fp.yaml"""
    p = DIR_CT / f"{uc['id']}_visual_fp.yaml"
    passos_ct = []
    for passo in uc["passos"]:
        item = {"id": passo["id"]}
        if "asserts_dom" in passo:
            item["asserts_dom"] = passo["asserts_dom"]
        if "asserts_rede" in passo:
            item["asserts_rede"] = passo["asserts_rede"]
        passos_ct.append(item)

    data = {
        "uc_id": uc["id"],
        "variacao": "fp",
        "trilha": "visual",
        "descricao": uc["titulo"],
        "passos": passos_ct,
    }
    p.write_text(yaml.dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"  [ct]   {p.relative_to(PROJECT)}")


def gerar_tutorial(uc):
    """testes/tutoriais_visual/UC-ARN-NN_fp.md (estrutura YAML em blocos)"""
    p = DIR_TUT / f"{uc['id']}_fp.md"
    blocos = []
    for passo in uc["passos"]:
        # Cada acao no SPEC pode ser dict (1 acao) ou ja vir como sequencia
        acao = passo["acao"]
        if "tipo" not in acao and "sequencia" not in acao:
            # Por seguranca, embrulha
            acao = {"tipo": "evaluate", "valor_literal": "() => 'no-op'"}

        # YAML do passo
        passo_yaml = {
            "id": passo["id"],
            "acao": acao,
            "validacao_ref": f"testes/casos_de_teste/{uc['id']}_visual_fp.yaml#{passo['id']}",
        }
        bloco = f"""## {passo['titulo']}

```yaml
{yaml.dump(passo_yaml, sort_keys=False, allow_unicode=True, default_flow_style=False).strip()}
```
"""
        blocos.append(bloco)

    cab = f"""---
uc_id: {uc['id']}
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/{uc['id']}_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/{uc['id']}_visual_fp.yaml
---

# {uc['id']} — {uc['titulo']} (Fluxo Principal)

> **Origem da observação:** {uc['obs']}
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

{uc['descricao']}

"""
    p.write_text(cab + "\n\n".join(blocos), encoding="utf-8")
    print(f"  [tut]  {p.relative_to(PROJECT)}")


def gerar_importer(uc):
    """testes/framework_visual/seed/importar_tutorial_uc_arn_NN.py"""
    nn = uc["id"].replace("UC-ARN-", "").replace("-", "_")
    p = DIR_SEED / f"importar_tutorial_uc_arn_{nn.lower()}.py"
    conteudo = f'''"""Importer auto-gerado para {uc['id']} (Sprint 10 — Correcoes Arnaldo)."""
from __future__ import annotations
import sys, yaml
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db
from db.models import CasoDeUso, CasoDeTeste, Dataset, PassoTutorial, _uuid
from parser import carregar_tutorial


def _acao_para_dict(acao) -> dict:
    d = {{"tipo": acao.tipo}}
    if acao.seletor: d["seletor"] = acao.seletor
    if acao.alternativa: d["alternativa"] = acao.alternativa
    if acao.valor_literal is not None: d["valor_literal"] = acao.valor_literal
    if acao.valor_from_dataset: d["valor_from_dataset"] = acao.valor_from_dataset
    if acao.valor_from_contexto: d["valor_from_contexto"] = acao.valor_from_contexto
    if getattr(acao, "valor_from_pasta_docs", None): d["valor_from_pasta_docs"] = acao.valor_from_pasta_docs
    if acao.destino: d["destino"] = acao.destino
    if acao.url: d["url"] = acao.url
    if acao.timeout != 10000: d["timeout"] = acao.timeout
    if acao.sequencia:
        d["sequencia"] = [_acao_para_dict(s) for s in acao.sequencia]
    return d


UC_ID = "{uc['id']}"
CT_ID = "CT-{uc['id'][3:]}-FP"
VARIACAO = "fp"


def importar():
    print(f"=== importar_tutorial_uc_arn_{nn.lower()} ===")
    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id=UC_ID).first()
        if not uc:
            print(f"ERRO: {{UC_ID}} nao existe no banco. Rode seed_sprint10 primeiro.")
            return 1

        # Dataset
        dataset_path = _PROJECT / "testes" / "datasets" / f"{{UC_ID}}_visual.yaml"
        dados = yaml.safe_load(dataset_path.read_text(encoding="utf-8"))
        dados_limpos = {{k: v for k, v in dados.items() if k not in ("uc_id", "trilha", "ciclo_id_default")}}
        ds = db.query(Dataset).filter_by(caso_de_uso_id=uc.id, trilha="visual").first()
        if ds:
            ds.dados_json = dados_limpos
        else:
            db.add(Dataset(caso_de_uso_id=uc.id, trilha="visual", dados_json=dados_limpos))

        # CT
        ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id=CT_ID).first()
        if not ct:
            ct = CasoDeTeste(
                id=_uuid(), caso_de_uso_id=uc.id, ct_id=CT_ID,
                descricao="{uc['titulo']}",
                tipo="Positivo", categoria="Cenário",
                trilha_sugerida="visual", variacao_tutorial="fp", ativo=1,
            )
            db.add(ct); db.flush()

        # Tutorial
        tut = carregar_tutorial(UC_ID, VARIACAO, "arnaldo-correcoes-v1")
        print(f"  Tutorial: {{len(tut.passos)}} passos")

        # Asserts
        cdt_path = _PROJECT / "testes" / "casos_de_teste" / f"{{UC_ID}}_visual_{{VARIACAO}}.yaml"
        asserts_por_passo = {{}}
        if cdt_path.exists():
            cdt = yaml.safe_load(cdt_path.read_text(encoding="utf-8"))
            for cp in cdt.get("passos", []):
                ap = []
                for a in cp.get("asserts_dom") or []: ap.append({{"tipo": "dom", **a}})
                for a in cp.get("asserts_rede") or []: ap.append({{"tipo": "rede", **a}})
                asserts_por_passo[cp["id"]] = ap

        # Limpa+insere passos
        db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).delete()
        for ordem, p in enumerate(tut.passos, start=1):
            acoes = [_acao_para_dict(p.acao)]
            if p.acao.tipo == "" and p.acao.sequencia:
                acoes = [_acao_para_dict(s) for s in p.acao.sequencia]
            db.add(PassoTutorial(
                caso_de_teste_id=ct.id, ordem=ordem, passo_id=p.id,
                titulo=p.titulo_acao[:255], descricao_painel=p.descricao_painel,
                pontos_observacao=p.pontos_observacao,
                acoes_json=acoes,
                asserts_json=asserts_por_passo.get(p.id, []) or None,
            ))
        db.commit()
        n = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).count()
        print(f"  OK: {{CT_ID}} {{n}} passos")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
'''
    p.write_text(conteudo, encoding="utf-8")
    print(f"  [imp]  {p.relative_to(PROJECT)}")


def main():
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    ucs = spec["ucs"]
    print(f"Gerando {len(ucs)} UCs em Sprint 10...")

    for d in [DIR_UC, DIR_DS, DIR_CT, DIR_TUT, DIR_SEED]:
        d.mkdir(parents=True, exist_ok=True)

    for uc in ucs:
        print(f"\n=== {uc['id']} ({uc['obs']}) ===")
        gerar_caso_de_uso(uc)
        gerar_dataset(uc)
        gerar_caso_de_teste(uc)
        gerar_tutorial(uc)
        gerar_importer(uc)

    print(f"\n=== OK ===")
    print(f"  {len(ucs)} UCs gerados — {len(ucs)*5} arquivos")


if __name__ == "__main__":
    sys.exit(main() or 0)
