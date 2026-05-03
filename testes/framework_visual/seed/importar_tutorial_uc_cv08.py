"""
Importa tutorial visual UC-CV08.

Le:
  testes/datasets/UC-F07_visual.yaml
  testes/casos_de_teste/UC-F07_visual_fp.yaml
  testes/tutoriais_visual/UC-F07_fp.md

Insere/atualiza:
  - 1 linha em datasets (UC-F07, trilha=visual)
  - 4 linhas em passos_tutorial pra CT-F07-FP (passo_00 a passo_03)

Idempotente: deleta passos antigos antes de inserir novos.
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
from parser import carregar_tutorial  # type: ignore


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


UC_ID = "UC-CV08"
CT_ID = "CT-CV08-FP"
VARIACAO = "fp"


def importar():
    print(f"=== importar_tutorial_{UC_ID.lower()} ===")
    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id=UC_ID).first()
        if not uc:
            print(f"ERRO: {UC_ID} nao existe no banco. Rode seed primeiro.")
            return 1

        # 1. Dataset
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

        # 2. CT-F07-FP
        ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id=CT_ID).first()
        if not ct:
            print(f"  AVISO: {CT_ID} nao existe no banco — criando")
            from db.models import _uuid
            ct = CasoDeTeste(
                id=_uuid(),
                caso_de_uso_id=uc.id,
                ct_id=CT_ID,
                descricao="UC-CV08 Lote B",
                tipo="Positivo",
                categoria="Cenário",
                trilha_sugerida="visual",
                variacao_tutorial="fp",
                ativo=1,
            )
            db.add(ct)
            db.flush()

        # 3. Carrega tutorial via parser
        tut = carregar_tutorial(UC_ID, VARIACAO, "piloto-uccv08")
        print(f"  Tutorial carregado: {len(tut.passos)} passos")

        # 4. Asserts do CT YAML
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

        # 5. Limpa passos antigos
        n_apagados = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).delete()
        if n_apagados > 0:
            print(f"  {n_apagados} passos antigos apagados")

        # 6. Insere
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

        db.commit()
        n = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).count()
        print(f"\n=== OK ===")
        print(f"  {CT_ID}: {n} passos cadastrados")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
