"""
Cadastra UCs CV01..CV13 da Sprint 2 no banco testesvalidacoes.

Le splits em testes/casos_de_uso/UC-CV{NN}.md, cria registros em
casos_de_uso, e cria 1 CT-FP por UC (esqueleto — passos serao
inseridos pelos importers individuais importar_tutorial_uc_cv{NN}.py).

Idempotente: usa upsert por (sprint_id, uc_id).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import Sprint, CasoDeUso, CasoDeTeste, _uuid  # type: ignore


def _extrair_nome_uc(conteudo_md: str, uc_id: str) -> str:
    m = re.search(r"^nome:\s*['\"](.+?)['\"]\s*$", conteudo_md, re.MULTILINE)
    if m:
        return m.group(1).strip()
    m2 = re.search(rf"^#\s+{re.escape(uc_id)}\s*[—-]\s*(.+?)$", conteudo_md, re.MULTILINE)
    if m2:
        return m2.group(1).strip()
    return uc_id


def main():
    print("=== seed_sprint2_ucs ===")
    db = get_db()
    try:
        sprint = db.query(Sprint).filter_by(numero=2).first()
        if not sprint:
            print("ERRO: Sprint 2 nao existe. Crie primeiro.")
            return 1
        print(f"Sprint 2 id={sprint.id}")

        sprint_dir = _PROJECT / "testes" / "casos_de_uso"

        n_uc = 0
        n_ct = 0
        for uc_num in range(1, 14):
            uc_id = f"UC-CV{uc_num:02d}"
            path = sprint_dir / f"{uc_id}.md"
            if not path.exists():
                print(f"  [warn] {path} nao existe — pulando")
                continue
            conteudo = path.read_text(encoding="utf-8")
            nome = _extrair_nome_uc(conteudo, uc_id)

            existing = db.query(CasoDeUso).filter_by(sprint_id=sprint.id, uc_id=uc_id).first()
            if existing:
                existing.nome = nome
                existing.doc_origem = str(path.relative_to(_PROJECT))
                existing.conteudo_md = conteudo
                uc_pk = existing.id
                print(f"  [update] {uc_id}: {nome[:50]}")
            else:
                uc = CasoDeUso(
                    sprint_id=sprint.id,
                    uc_id=uc_id,
                    nome=nome,
                    doc_origem=str(path.relative_to(_PROJECT)),
                    conteudo_md=conteudo,
                )
                db.add(uc)
                db.flush()
                uc_pk = uc.id
                print(f"  [novo]   {uc_id}: {nome[:50]}")
            n_uc += 1

            # Cria CT-FP minimo (importer individual depois popula passos)
            ct_id = f"CT-CV{uc_num:02d}-FP"
            ct_existente = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc_pk, ct_id=ct_id).first()
            if not ct_existente:
                ct = CasoDeTeste(
                    id=_uuid(),
                    caso_de_uso_id=uc_pk,
                    ct_id=ct_id,
                    descricao=f"Fluxo Principal de {uc_id}",
                    tipo="Positivo",
                    categoria="Cenário",
                    trilha_sugerida="visual",
                    variacao_tutorial="fp",
                    ativo=1,
                )
                db.add(ct)
                n_ct += 1
                print(f"           + CT {ct_id}")

        db.commit()
        print(f"\n=== OK ===")
        print(f"  {n_uc} UCs cadastrados")
        print(f"  {n_ct} CTs novos criados (esqueleto)")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
