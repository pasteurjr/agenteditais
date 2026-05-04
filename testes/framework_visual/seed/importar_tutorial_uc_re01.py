"""Importer tutorial UC-RE01 (Sprint 4)."""
from __future__ import annotations
import sys, yaml
from pathlib import Path
_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))
from db.engine import get_db
from db.models import CasoDeUso, CasoDeTeste, Dataset, PassoTutorial
from parser import carregar_tutorial


def _acao_para_dict(a):
    d = {"tipo": a.tipo}
    if a.seletor: d["seletor"] = a.seletor
    if a.alternativa: d["alternativa"] = a.alternativa
    if a.valor_literal is not None: d["valor_literal"] = a.valor_literal
    if a.valor_from_dataset: d["valor_from_dataset"] = a.valor_from_dataset
    if a.valor_from_contexto: d["valor_from_contexto"] = a.valor_from_contexto
    if getattr(a, 'valor_from_pasta_docs', None): d["valor_from_pasta_docs"] = a.valor_from_pasta_docs
    if a.destino: d["destino"] = a.destino
    if a.url: d["url"] = a.url
    if a.timeout != 10000: d["timeout"] = a.timeout
    if a.sequencia: d["sequencia"] = [_acao_para_dict(s) for s in a.sequencia]
    return d


UC_ID = "UC-RE01"
CT_ID = "CT-RE01-FP"


def importar():
    print(f"=== importar UC-RE01 ===")
    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id=UC_ID).first()
        if not uc: return 1
        ds_path = _PROJECT / "testes" / "datasets" / f"{UC_ID}_visual.yaml"
        dados = yaml.safe_load(ds_path.read_text(encoding="utf-8"))
        dados_l = {k: v for k, v in dados.items() if k not in ("uc_id", "trilha")}
        ds_e = db.query(Dataset).filter_by(caso_de_uso_id=uc.id, trilha="visual").first()
        if ds_e: ds_e.dados_json = dados_l
        else: db.add(Dataset(caso_de_uso_id=uc.id, trilha="visual", dados_json=dados_l))
        ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id=CT_ID).first()
        if not ct:
            from db.models import _uuid
            ct = CasoDeTeste(id=_uuid(), caso_de_uso_id=uc.id, ct_id=CT_ID,
                descricao=f"FP UC-RE01", tipo="Positivo", categoria="Cenário",
                trilha_sugerida="visual", variacao_tutorial="fp", ativo=1)
            db.add(ct); db.flush()
        tut = carregar_tutorial(UC_ID, "fp", "piloto-ucre01")
        cdt_path = _PROJECT / "testes" / "casos_de_teste" / f"{UC_ID}_visual_fp.yaml"
        asserts_p = {}
        if cdt_path.exists():
            cdt = yaml.safe_load(cdt_path.read_text(encoding="utf-8"))
            for cp in cdt.get("passos", []):
                a_list = []
                for a in cp.get("asserts_dom", []) or []: a_list.append({"tipo":"dom", **a})
                for a in cp.get("asserts_rede", []) or []: a_list.append({"tipo":"rede", **a})
                asserts_p[cp["id"]] = a_list
        db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).delete()
        for ordem, p in enumerate(tut.passos, start=1):
            acoes = [_acao_para_dict(p.acao)]
            if p.acao.tipo == "" and p.acao.sequencia:
                acoes = [_acao_para_dict(s) for s in p.acao.sequencia]
            db.add(PassoTutorial(caso_de_teste_id=ct.id, ordem=ordem, passo_id=p.id,
                titulo=p.titulo_acao[:255], descricao_painel=p.descricao_painel,
                pontos_observacao=p.pontos_observacao, acoes_json=acoes,
                asserts_json=asserts_p.get(p.id) or None))
        db.commit()
        n = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).count()
        print(f"  {CT_ID}: {n} passos cadastrados")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
