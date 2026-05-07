"""Seed Sprint 10 — Correções Arnaldo (25 UCs UC-ARN-01 .. UC-ARN-25)."""
from __future__ import annotations
import re, sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db
from db.models import Sprint, CasoDeUso, CasoDeTeste, _uuid


def _extrair_nome(conteudo, uc_id):
    m = re.search(r'^nome:\s*[\'"](.+?)[\'"]', conteudo, re.MULTILINE)
    if m: return m.group(1).strip()
    m = re.search(rf"^#\s+{re.escape(uc_id)}\s*[—-]\s*(.+?)$", conteudo, re.MULTILINE)
    if m: return m.group(1).strip()
    return uc_id


def main():
    db = get_db()
    try:
        sprint = db.query(Sprint).filter_by(numero=10).first()
        if not sprint:
            sprint = Sprint(
                numero=10,
                nome="Sprint 10 — Correcoes Arnaldo",
                projeto_id="00000000-0000-0000-0000-000000000001",
            )
            db.add(sprint)
            db.flush()
            print(f"Sprint 10 criada id={sprint.id}")
        else:
            print(f"Sprint 10 ja existe id={sprint.id}")

        ucs_lista = [f"UC-ARN-{n:02d}" for n in range(1, 26)]
        n_uc = 0
        n_ct = 0
        for uc_id in ucs_lista:
            path = _PROJECT / "testes" / "casos_de_uso" / f"{uc_id}.md"
            if not path.exists():
                print(f"  [warn] {path} nao existe — pula")
                continue
            cont = path.read_text(encoding="utf-8")
            nome = _extrair_nome(cont, uc_id)
            existing = db.query(CasoDeUso).filter_by(sprint_id=sprint.id, uc_id=uc_id).first()
            if existing:
                existing.nome = nome
                existing.doc_origem = str(path.relative_to(_PROJECT))
                existing.conteudo_md = cont
                uc_pk = existing.id
            else:
                uc = CasoDeUso(
                    sprint_id=sprint.id,
                    uc_id=uc_id,
                    nome=nome,
                    doc_origem=str(path.relative_to(_PROJECT)),
                    conteudo_md=cont,
                )
                db.add(uc)
                db.flush()
                uc_pk = uc.id
                print(f"  [novo]   {uc_id}: {nome[:55]}")
            n_uc += 1
            ct_id = f"CT-{uc_id[3:]}-FP"  # CT-ARN-NN-FP
            ct = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc_pk, ct_id=ct_id).first()
            if not ct:
                db.add(CasoDeTeste(
                    id=_uuid(),
                    caso_de_uso_id=uc_pk,
                    ct_id=ct_id,
                    descricao=f"FP {uc_id} — valida correção Arnaldo",
                    tipo="Positivo",
                    categoria="Cenário",
                    trilha_sugerida="visual",
                    variacao_tutorial="fp",
                    ativo=1,
                ))
                n_ct += 1

        db.commit()
        print(f"\n=== OK ===")
        print(f"  Sprint 10 com {n_uc} UCs / {n_ct} CTs novos")
        print(f"\nProximo: rodar 25 importers em sequencia")
        print(f"  for nn in {{01..25}}; do python3 testes/framework_visual/seed/importar_tutorial_uc_arn_${{nn}}.py; done")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
