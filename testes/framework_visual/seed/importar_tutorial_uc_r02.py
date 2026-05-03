"""Importer tutorial visual UC-R02 (Sprint 3)."""
from __future__ import annotations
import sys
import yaml
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db
from db.models import CasoDeUso, CasoDeTeste, Dataset, PassoTutorial
from parser import carregar_tutorial


def _acao_para_dict(acao) -> dict:
    d = {"tipo": acao.tipo}
    if acao.seletor: d["seletor"] = acao.seletor
    if acao.alternativa: d["alternativa"] = acao.alternativa
    if acao.valor_literal is not None: d["valor_literal"] = acao.valor_literal
    if acao.valor_from_dataset: d["valor_from_dataset"] = acao.valor_from_dataset
    if acao.valor_from_contexto: d["valor_from_contexto"] = acao.valor_from_contexto
    if getattr(acao, 'valor_from_pasta_docs', None): d["valor_from_pasta_docs"] = acao.valor_from_pasta_docs
    if acao.destino: d["destino"] = acao.destino
    if acao.url: d["url"] = acao.url
    if acao.timeout != 10000: d["timeout"] = acao.timeout
    if acao.sequencia:
        d["sequencia"] = [_acao_para_dict(s) for s in acao.sequencia]
    return d


UC_ID = "UC-R02"
CT_ID = "CT-R02-FP"
VARIACAO = "fp"


def importar():
    print(f"=== importar_tutorial_uc_r02 ===")
    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id=UC_ID).first()
        if not uc:
            print(f"ERRO: {UC_ID} nao existe no banco.")
            return 1

        dataset_path = _PROJECT / "testes" / "datasets" / f"{UC_ID}_visual.yaml"
        if not dataset_path.exists():
            print(f"ERRO: dataset nao encontrado: {dataset_path}")
            return 1
        dados = yaml.safe_load(dataset_path.read_text(encoding="utf-8"))
        dados_limpos = {k: v for k, v in dados.items() if k not in ("uc_id", "trilha", "ciclo_id_default")}

        ds_existente = db.query(Dataset).filter_by(caso_de_uso_id=uc.id, trilha="visual").first()
        if ds_existente:
            ds_existente.dados_json = dados_limpos
        else:
            db.add(Dataset(caso_de_uso_id=uc.id, trilha="visual", dados_json=dados_limpos))

        ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id=CT_ID).first()
        if not ct:
            from db.models import _uuid
            ct = CasoDeTeste(id=_uuid(), caso_de_uso_id=uc.id, ct_id=CT_ID,
                descricao=f"FP UC-R02", tipo="Positivo", categoria="Cenário",
                trilha_sugerida="visual", variacao_tutorial="fp", ativo=1)
            db.add(ct)
            db.flush()

        tut = carregar_tutorial(UC_ID, VARIACAO, "piloto-ucr02")

        cdt_path = _PROJECT / "testes" / "casos_de_teste" / f"{UC_ID}_visual_{VARIACAO}.yaml"
        asserts_por_passo = {}
        if cdt_path.exists():
            cdt_data = yaml.safe_load(cdt_path.read_text(encoding="utf-8"))
            for cp in cdt_data.get("passos", []):
                asserts_passo = []
                for a in cp.get("asserts_dom", []) or []:
                    asserts_passo.append({"tipo": "dom", **a})
                for a in cp.get("asserts_rede", []) or []:
                    asserts_passo.append({"tipo": "rede", **a})
                asserts_por_passo[cp["id"]] = asserts_passo

        n_apagados = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).delete()
        if n_apagados > 0:
            print(f"  {n_apagados} passos antigos apagados")

        for ordem, p in enumerate(tut.passos, start=1):
            acoes = [_acao_para_dict(p.acao)]
            if p.acao.tipo == "" and p.acao.sequencia:
                acoes = [_acao_para_dict(s) for s in p.acao.sequencia]
            asserts = asserts_por_passo.get(p.id, [])
            db.add(PassoTutorial(
                caso_de_teste_id=ct.id, ordem=ordem, passo_id=p.id,
                titulo=p.titulo_acao[:255],
                descricao_painel=p.descricao_painel,
                pontos_observacao=p.pontos_observacao,
                acoes_json=acoes,
                asserts_json=asserts if asserts else None,
            ))

        db.commit()
        n = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).count()
        print(f"\n=== OK ===")
        print(f"  {CT_ID}: {n} passos cadastrados")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
