"""
Importa o tutorial visual do CT-F01-FP do disco pro banco.

Le:
  testes/datasets/UC-F01_visual.yaml          → Dataset(uc=UC-F01, trilha=visual)
  testes/casos_de_teste/UC-F01_visual_fp.yaml → asserts_json por passo
  testes/tutoriais_visual/UC-F01_fp.md        → acoes_json por passo + descricao painel

Resultado: 1 linha em datasets + 5 linhas em passos_tutorial (CT-F01-FP).

Idempotente: deleta passos antigos do CT antes de inserir novos.
"""
from __future__ import annotations

import re
import sys
import yaml
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import CasoDeUso, CasoDeTeste, Dataset, PassoTutorial  # type: ignore

# Reusar o parser do MD que ja existe
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
    if acao.destino: d["destino"] = acao.destino
    if acao.url: d["url"] = acao.url
    if acao.timeout != 10000: d["timeout"] = acao.timeout
    if acao.sequencia:
        d["sequencia"] = [_acao_para_dict(s) for s in acao.sequencia]
    return d


def importar():
    print("=== importar_tutorial_uc_f01 ===")

    db = get_db()
    try:
        uc = db.query(CasoDeUso).filter_by(uc_id="UC-F01").first()
        if not uc:
            print("ERRO: UC-F01 nao existe no banco. Rode seed_testesvalidacoes primeiro.")
            return 1
        ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ct_id="CT-F01-FP").first()
        if not ct:
            print("ERRO: CT-F01-FP nao existe no banco.")
            return 1

        # 1. Dataset
        dataset_path = _PROJECT / "testes" / "datasets" / "UC-F01_visual.yaml"
        if not dataset_path.exists():
            print(f"ERRO: dataset nao encontrado: {dataset_path}")
            return 1
        dados = yaml.safe_load(dataset_path.read_text(encoding="utf-8"))
        # Remove keys de meta (uc_id, trilha, ciclo_id_default)
        dados_limpos = {k: v for k, v in dados.items() if k not in ("uc_id", "trilha", "ciclo_id_default")}

        ds_existente = db.query(Dataset).filter_by(caso_de_uso_id=uc.id, trilha="visual").first()
        if ds_existente:
            ds_existente.dados_json = dados_limpos
            print(f"  Dataset atualizado (id={ds_existente.id})")
        else:
            ds = Dataset(caso_de_uso_id=uc.id, trilha="visual", dados_json=dados_limpos)
            db.add(ds)
            print(f"  Dataset criado: {len(dados_limpos)} grupos de dados")

        # 2. Passos do tutorial — usa o parser do framework visual
        # Carrega tutorial usando o ciclo piloto-ucf01 pra resolver contextos
        tut = carregar_tutorial("UC-F01", "fp", "piloto-ucf01")
        print(f"  Tutorial carregado: {len(tut.passos)} passos")

        # 3. Carrega caso_de_teste YAML pra pegar asserts_dom por passo_id
        cdt_path = _PROJECT / "testes" / "casos_de_teste" / "UC-F01_visual_fp.yaml"
        cdt_data = yaml.safe_load(cdt_path.read_text(encoding="utf-8"))
        asserts_por_passo_id = {}
        for cp in cdt_data.get("passos", []):
            asserts_passo = []
            for a in cp.get("asserts_dom", []) or []:
                asserts_passo.append({"tipo": "dom", **a})
            for a in cp.get("asserts_rede", []) or []:
                asserts_passo.append({"tipo": "rede", **a})
            asserts_por_passo_id[cp["id"]] = asserts_passo

        # 4. Limpa passos antigos do CT (idempotencia)
        n_apagados = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).delete()
        if n_apagados > 0:
            print(f"  {n_apagados} passos antigos apagados (re-import)")

        # 5. Insere passos novos
        for ordem, p in enumerate(tut.passos, start=1):
            acoes = [_acao_para_dict(p.acao)]
            # Se a acao raiz tem so sequencia, achata pra lista direta
            if p.acao.tipo == "" and p.acao.sequencia:
                acoes = [_acao_para_dict(s) for s in p.acao.sequencia]
            asserts = asserts_por_passo_id.get(p.id, [])

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
        print(f"  {len(tut.passos)} passos inseridos pra CT-F01-FP")

        # Verifica
        n = db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).count()
        print(f"\n=== OK ===")
        print(f"  CT-F01-FP tem {n} passos cadastrados no banco.")
        print(f"  Dataset visual UC-F01 cadastrado.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(importar())
