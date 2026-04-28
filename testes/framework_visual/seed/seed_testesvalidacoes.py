"""
Seed do banco testesvalidacoes — Fase A.

Cria:
  - Schema (via Base.metadata.create_all)
  - Projeto Facilicita.IA
  - Sprint 1 (Empresa, Portfolio, Parametrizacao)
  - 17 UCs lendo testes/casos_de_uso/UC-F*.md
  - 201 CTs parseando docs/.../V7.md
  - 7 usuarios (3 admins + 4 nao-admins)

Idempotente: roda quantas vezes quiser.

Uso:
    python3 testes/framework_visual/seed/seed_testesvalidacoes.py
"""
from __future__ import annotations

import re
import sys
from datetime import datetime
from pathlib import Path

# Path setup
_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import Base, get_engine, get_db  # type: ignore
from db.models import (  # type: ignore
    User, Projeto, Sprint, CasoDeUso, CasoDeTeste,
)
from seed.parse_cts_v7 import parse_v7, stats  # type: ignore


# IDs fixos (idempotencia)
PROJETO_FACILICITA_ID = "00000000-0000-0000-0000-000000000001"
SPRINT_1_ID = "00000000-0000-0000-0001-000000000001"


# ============================================================
# Usuarios
# ============================================================

USUARIOS = [
    # nome,         email,                       admin
    ("Pasteur",    "pasteur@valida.com",         True),
    ("Arnaldo",    "arnaldo@valida.com",         True),
    ("Tarcisio",   "tarcisio@valida.com",        True),
    ("Marbei",     "marbei@valida.com",          False),
    ("Marcelo",    "marcelo@valida.com",         False),
    ("Valida 1",   "valida1@valida.com",         False),
    ("Valida 2",   "valida2@valida.com",         False),
]
SENHA_PADRAO = "123456"


def _hash_senha(senha: str) -> str:
    """Bcrypt — reusa modulo do app principal se possivel."""
    try:
        sys.path.insert(0, str(_PROJECT / "backend"))
        from auth.jwt_utils import hash_password  # type: ignore
        return hash_password(senha)
    except Exception:
        # fallback: bcrypt direto
        import bcrypt
        return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ============================================================
# UCs Sprint 1
# ============================================================

def _extrair_nome_uc(conteudo_md: str, uc_id: str) -> str:
    """Le frontmatter YAML do UC.md e pega o campo 'nome'."""
    m = re.search(r"^---\n(.*?)\n---", conteudo_md, re.DOTALL | re.MULTILINE)
    if m:
        for line in m.group(1).split("\n"):
            line = line.strip()
            if line.startswith("nome:"):
                nome = line.split(":", 1)[1].strip().strip('"').strip("'")
                return nome
    # fallback: primeira linha do tipo "# UC-FXX — Nome"
    m2 = re.search(rf"^#\s+{re.escape(uc_id)}\s*[—-]\s*(.+?)$", conteudo_md, re.MULTILINE)
    if m2:
        return m2.group(1).strip()
    return uc_id


def seed_ucs(db, sprint_id: str, sprint_dir: Path) -> dict[str, str]:
    """Cria/atualiza 17 UCs lendo arquivos. Retorna mapping uc_id -> id."""
    ucs_criados = {}
    for uc_num in range(1, 18):
        uc_id = f"UC-F{uc_num:02d}"
        path = sprint_dir / f"{uc_id}.md"
        if not path.exists():
            print(f"  [warn] arquivo nao encontrado: {path}")
            continue
        conteudo = path.read_text(encoding="utf-8")
        nome = _extrair_nome_uc(conteudo, uc_id)
        existing = db.query(CasoDeUso).filter_by(sprint_id=sprint_id, uc_id=uc_id).first()
        if existing:
            existing.nome = nome
            existing.doc_origem = str(path.relative_to(_PROJECT))
            existing.conteudo_md = conteudo
            ucs_criados[uc_id] = existing.id
        else:
            uc = CasoDeUso(
                sprint_id=sprint_id,
                uc_id=uc_id,
                nome=nome,
                doc_origem=str(path.relative_to(_PROJECT)),
                conteudo_md=conteudo,
            )
            db.add(uc)
            db.flush()
            ucs_criados[uc_id] = uc.id
    return ucs_criados


# ============================================================
# CTs (parse V7)
# ============================================================

def seed_cts(db, ucs_map: dict[str, str], v7_path: Path) -> int:
    cts_data = parse_v7(v7_path)
    n_inserted = 0
    n_updated = 0
    for ct in cts_data:
        uc_id = ct["uc_id"]
        ct_id = ct["ct_id"]
        if uc_id not in ucs_map:
            print(f"  [warn] CT {ct_id}: UC {uc_id} nao encontrado")
            continue
        cdu_id = ucs_map[uc_id]
        existing = db.query(CasoDeTeste).filter_by(caso_de_uso_id=cdu_id, ct_id=ct_id).first()
        # Normaliza valores que possam vir invalidos
        tipo = ct["tipo"] if ct["tipo"] in ("Positivo", "Negativo", "Limite") else "Positivo"
        cat = ct["categoria"]
        trilha = ct["trilha_sugerida"]
        if existing:
            existing.descricao = ct["descricao"][:500]
            existing.pre_condicoes = ct["pre_condicoes"]
            existing.acoes = ct["acoes"]
            existing.saida_esperada = ct["saida_esperada"]
            existing.tipo = tipo
            existing.categoria = cat
            existing.trilha_sugerida = trilha
            existing.rns_aplicadas = ct["rns_aplicadas"][:500] if ct["rns_aplicadas"] else None
            existing.fonte_doc = ct["fonte_doc"][:500] if ct["fonte_doc"] else None
            existing.variacao_tutorial = ct["variacao_tutorial"]
            n_updated += 1
        else:
            obj = CasoDeTeste(
                caso_de_uso_id=cdu_id,
                ct_id=ct_id,
                descricao=ct["descricao"][:500],
                pre_condicoes=ct["pre_condicoes"],
                acoes=ct["acoes"],
                saida_esperada=ct["saida_esperada"],
                tipo=tipo,
                categoria=cat,
                trilha_sugerida=trilha,
                rns_aplicadas=ct["rns_aplicadas"][:500] if ct["rns_aplicadas"] else None,
                fonte_doc=ct["fonte_doc"][:500] if ct["fonte_doc"] else None,
                variacao_tutorial=ct["variacao_tutorial"],
            )
            db.add(obj)
            n_inserted += 1
    print(f"  CTs novos: {n_inserted}; atualizados: {n_updated}")
    return n_inserted + n_updated


# ============================================================
# Main
# ============================================================

def main():
    print("=== seed_testesvalidacoes ===")

    print("[1] Criando schema (create_all)...")
    Base.metadata.create_all(bind=get_engine())

    db = get_db()
    try:
        # Projeto
        print("[2] Projeto Facilicita.IA...")
        proj = db.query(Projeto).filter_by(id=PROJETO_FACILICITA_ID).first()
        if proj:
            proj.nome = "Facilicita.IA"
            proj.descricao = "Sistema de automacao de licitacoes governamentais brasileiras"
        else:
            proj = Projeto(
                id=PROJETO_FACILICITA_ID,
                nome="Facilicita.IA",
                descricao="Sistema de automacao de licitacoes governamentais brasileiras",
            )
            db.add(proj)
        db.flush()

        # Sprint
        print("[3] Sprint 1...")
        sprint = db.query(Sprint).filter_by(id=SPRINT_1_ID).first()
        if sprint:
            sprint.nome = "Sprint 1 — Empresa, Portfolio e Parametrizacao"
        else:
            sprint = Sprint(
                id=SPRINT_1_ID,
                projeto_id=proj.id,
                numero=1,
                nome="Sprint 1 — Empresa, Portfolio e Parametrizacao",
                descricao="UC-F01..F17 — fundacao cadastral",
            )
            db.add(sprint)
        db.flush()

        # UCs
        print("[4] UCs Sprint 1 (17 esperados)...")
        sprint_dir = _PROJECT / "testes" / "casos_de_uso"
        ucs_map = seed_ucs(db, sprint.id, sprint_dir)
        print(f"  UCs persistidos: {len(ucs_map)}")
        db.flush()

        # CTs
        print("[5] CTs (201 esperados)...")
        v7_path = _PROJECT / "docs" / "CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md"
        n_cts = seed_cts(db, ucs_map, v7_path)
        db.flush()

        # Usuarios
        print("[6] Usuarios (7 esperados, 3 admins)...")
        for nome, email, admin in USUARIOS:
            u = db.query(User).filter_by(email=email).first()
            if u:
                u.name = nome
                u.administrador = 1 if admin else 0
            else:
                u = User(
                    name=nome,
                    email=email,
                    password_hash=_hash_senha(SENHA_PADRAO),
                    administrador=1 if admin else 0,
                )
                db.add(u)
        db.flush()

        db.commit()

        # Sanity
        print()
        print("=== SANITY CHECK ===")
        print(f"  Projetos:     {db.query(Projeto).count()}")
        print(f"  Sprints:      {db.query(Sprint).count()}")
        print(f"  UCs:          {db.query(CasoDeUso).count()}")
        print(f"  CTs:          {db.query(CasoDeTeste).count()}")
        print(f"  Users:        {db.query(User).count()} ({db.query(User).filter_by(administrador=1).count()} admins)")

        # Por categoria
        from sqlalchemy import func
        print()
        print("  CTs por categoria:")
        for row in db.query(CasoDeTeste.categoria, func.count(CasoDeTeste.id)).group_by(CasoDeTeste.categoria).all():
            print(f"    {row[0]:<12s}: {row[1]}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
