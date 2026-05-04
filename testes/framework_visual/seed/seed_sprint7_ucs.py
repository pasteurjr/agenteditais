"""Seed Sprint 7 (UC-ME01..04 + UC-AN01..05 + UC-AP01..03 = 12 UCs)."""
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
    m = re.search(r"^nome:\s*['\"](.+?)['\"]", conteudo, re.MULTILINE)
    if m: return m.group(1).strip()
    m = re.search(rf"^#\s+{re.escape(uc_id)}\s*[—-]\s*(.+?)$", conteudo, re.MULTILINE)
    if m: return m.group(1).strip()
    return uc_id


def main():
    db = get_db()
    try:
        sprint = db.query(Sprint).filter_by(numero=7).first()
        if not sprint:
            sprint = Sprint(numero=7, nome="Sprint 7 — Mercado, Analytics, Aprendizado",
                            projeto_id="00000000-0000-0000-0000-000000000001")
            db.add(sprint); db.flush()
            print(f"Sprint 7 criada id={sprint.id}")

        ucs_lista = (
            [f"UC-ME{n:02d}" for n in range(1, 5)] +
            [f"UC-AN{n:02d}" for n in range(1, 6)] +
            [f"UC-AP{n:02d}" for n in range(1, 4)]
        )
        n_uc = 0; n_ct = 0
        for uc_id in ucs_lista:
            path = _PROJECT / "testes" / "casos_de_uso" / f"{uc_id}.md"
            if not path.exists():
                print(f"  [warn] {path} nao existe"); continue
            cont = path.read_text(encoding="utf-8")
            nome = _extrair_nome(cont, uc_id)
            existing = db.query(CasoDeUso).filter_by(sprint_id=sprint.id, uc_id=uc_id).first()
            if existing:
                existing.nome = nome
                existing.doc_origem = str(path.relative_to(_PROJECT))
                existing.conteudo_md = cont
                uc_pk = existing.id
            else:
                uc = CasoDeUso(sprint_id=sprint.id, uc_id=uc_id, nome=nome,
                    doc_origem=str(path.relative_to(_PROJECT)), conteudo_md=cont)
                db.add(uc); db.flush(); uc_pk = uc.id
                print(f"  [novo]   {uc_id}: {nome[:50]}")
            n_uc += 1
            ct_id = f"CT-{uc_id[3:]}-FP"
            if not db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc_pk, ct_id=ct_id).first():
                db.add(CasoDeTeste(id=_uuid(), caso_de_uso_id=uc_pk, ct_id=ct_id,
                    descricao=f"FP {uc_id}", tipo="Positivo", categoria="Cenário",
                    trilha_sugerida="visual", variacao_tutorial="fp", ativo=1))
                n_ct += 1
        db.commit()
        print(f"\n=== OK ===\n  {n_uc} UCs, {n_ct} CTs novos")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
