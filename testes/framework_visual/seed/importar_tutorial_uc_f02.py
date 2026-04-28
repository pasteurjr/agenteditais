"""
Importa o tutorial visual do UC-F02 (Gerir contatos e area padrao) do disco pro banco.

Le:
  testes/datasets/UC-F02_visual.yaml             → Dataset(uc=UC-F02, trilha=visual)
  testes/casos_de_teste/UC-F02_visual_<var>.yaml → asserts_json por passo (1 por variacao)
  testes/tutoriais_visual/UC-F02_<var>.md        → acoes_json + descricao painel

Variacoes: fp, fa01, fa02, fa03 (4 CTs)

Idempotente: deleta passos antigos do CT antes de inserir novos.
"""
from __future__ import annotations

import sys
import yaml
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import CasoDeUso, CasoDeTeste, Dataset, PassoTutorial  # type: ignore

sys.path.insert(0, str(_FW_VISUAL))
from parser import carregar_tutorial  # type: ignore


def _acao_para_dict(acao) -> dict:
    """Converte objeto Acao do parser pra dict serializavel."""
    d = {"tipo": acao.tipo}
    if acao.seletor: d["seletor"] = acao.seletor
    if acao.alternativa: d["alternativa"] = acao.alternativa
    if acao.valor_literal is not None: d["valor_literal"] = acao.valor_literal
    if acao.valor_from_dataset: d["valor_from_dataset"] = acao.valor_from_dataset
    if acao.valor_from_contexto: d["valor_from_contexto"] = acao.valor_from_contexto
    if acao.valor_from_pasta_docs: d["valor_from_pasta_docs"] = acao.valor_from_pasta_docs
    if acao.destino: d["destino"] = acao.destino
    if acao.url: d["url"] = acao.url
    if acao.timeout != 10000: d["timeout"] = acao.timeout
    if acao.sequencia:
        d["sequencia"] = [_acao_para_dict(s) for s in acao.sequencia]
    return d


VARIACOES = ["fp", "fa01", "fa02", "fa03"]
UC_ID = "UC-F02"
CT_PREFIX = "CT-F02"


def importar():
    print(f"=== importar_tutorial_{UC_ID.lower()} ===")
    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id=UC_ID).first()
        if not uc:
            print(f"ERRO: {UC_ID} nao existe no banco. Rode seed primeiro.")
            return 1

        # 1. Dataset (uma vez por UC)
        dataset_path = _PROJECT / "testes" / "datasets" / f"{UC_ID}_visual.yaml"
        if not dataset_path.exists():
            print(f"ERRO: dataset nao encontrado: {dataset_path}")
            return 1
        dados = yaml.safe_load(dataset_path.read_text(encoding="utf-8"))
        dados_limpos = {k: v for k, v in dados.items() if k not in ("uc_id", "trilha", "ciclo_id_default")}

        ds_existente = db.query(Dataset).filter_by(caso_de_uso_id=uc.id, trilha="visual").first()
        if ds_existente:
            ds_existente.dados_json = dados_limpos
            print(f"  Dataset atualizado")
        else:
            db.add(Dataset(caso_de_uso_id=uc.id, trilha="visual", dados_json=dados_limpos))
            print(f"  Dataset criado: {len(dados_limpos)} grupos")

        # 2. Para cada variacao, busca CT, importa passos
        for var in VARIACOES:
            ct_id_str = f"{CT_PREFIX}-{var.upper()}" if var == "fp" else f"{CT_PREFIX}-{var[:2].upper()}{var[2:]}"
            # Convencao: CT-F02-FP, CT-F02-FA01, CT-F02-FA02, CT-F02-FA03
            ct_id_real = f"{CT_PREFIX}-FP" if var == "fp" else f"{CT_PREFIX}-FA{var[2:]}"
            ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id=ct_id_real).first()
            if not ct:
                print(f"  AVISO: {ct_id_real} nao existe no banco — pulando")
                continue

            tut = carregar_tutorial(UC_ID, var, "piloto-ucf02")
            print(f"  [{ct_id_real}] tutorial: {len(tut.passos)} passos")

            cdt_path = _PROJECT / "testes" / "casos_de_teste" / f"{UC_ID}_visual_{var}.yaml"
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
                print(f"  [{ct_id_real}] {n_apagados} passos antigos apagados")

            for ordem, p in enumerate(tut.passos, start=1):
                acoes = [_acao_para_dict(p.acao)]
                if p.acao.tipo == "" and p.acao.sequencia:
                    acoes = [_acao_para_dict(s) for s in p.acao.sequencia]
                asserts = asserts_por_passo.get(p.id, [])
                db.add(PassoTutorial(
                    caso_de_teste_id=ct.id,
                    ordem=ordem,
                    passo_id=p.id,
                    titulo=p.titulo_acao[:255],
                    descricao_painel=p.descricao_painel,
                    pontos_observacao=p.pontos_observacao,
                    acoes_json=acoes,
                    asserts_json=asserts if asserts else None,
                ))
            print(f"  [{ct_id_real}] {len(tut.passos)} passos inseridos")

        db.commit()
        print(f"\n=== OK ===")
        # Resumo final
        for var in VARIACOES:
            ct_id_real = f"{CT_PREFIX}-FP" if var == "fp" else f"{CT_PREFIX}-FA{var[2:]}"
            ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id=ct_id_real).first()
            if ct:
                n = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).count()
                print(f"  {ct_id_real}: {n} passos cadastrados")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
