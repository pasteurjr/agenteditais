"""Importer auto-gerado para UC-ARN-07 (Sprint 10 — Correcoes Arnaldo)."""
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
    d = {"tipo": acao.tipo}
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


UC_ID = "UC-ARN-07"
CT_ID = "CT-ARN-07-FP"
VARIACAO = "fp"


def importar():
    print(f"=== importar_tutorial_uc_arn_07 ===")
    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id=UC_ID).first()
        if not uc:
            print(f"ERRO: {UC_ID} nao existe no banco. Rode seed_sprint10 primeiro.")
            return 1

        # Dataset
        dataset_path = _PROJECT / "testes" / "datasets" / f"{UC_ID}_visual.yaml"
        dados = yaml.safe_load(dataset_path.read_text(encoding="utf-8"))
        dados_limpos = {k: v for k, v in dados.items() if k not in ("uc_id", "trilha", "ciclo_id_default")}
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
                descricao="Endereco estruturado: 4 campos novos",
                tipo="Positivo", categoria="Cenário",
                trilha_sugerida="visual", variacao_tutorial="fp", ativo=1,
            )
            db.add(ct); db.flush()

        # Tutorial
        tut = carregar_tutorial(UC_ID, VARIACAO, "arnaldo-correcoes-v1")
        print(f"  Tutorial: {len(tut.passos)} passos")

        # Asserts
        cdt_path = _PROJECT / "testes" / "casos_de_teste" / f"{UC_ID}_visual_{VARIACAO}.yaml"
        asserts_por_passo = {}
        if cdt_path.exists():
            cdt = yaml.safe_load(cdt_path.read_text(encoding="utf-8"))
            for cp in cdt.get("passos", []):
                ap = []
                for a in cp.get("asserts_dom") or []: ap.append({"tipo": "dom", **a})
                for a in cp.get("asserts_rede") or []: ap.append({"tipo": "rede", **a})
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
        print(f"  OK: {CT_ID} {n} passos")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
