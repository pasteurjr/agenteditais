"""
Aloca usuários sequenciais `valida<N>@valida.com.br`.

Consulta o banco pelo maior N existente e reserva os próximos M livres.
Cria os usuários no banco com senha padrão "123456" e papel "usuario_valida".

NÃO cria empresa — empresa é criada pelo UC-F01 via UI (Opção Y do plano).
"""

from __future__ import annotations

import os
import re
import sys
import uuid
from typing import Optional

import bcrypt

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND = os.path.join(PROJECT_ROOT, "backend")
if BACKEND not in sys.path:
    sys.path.insert(0, BACKEND)

EMAIL_REGEX = re.compile(r"^valida(\d+)@valida\.com\.br$", re.IGNORECASE)
SENHA_PADRAO = "123456"


def proximo_indice_livre(db_session=None) -> int:
    """
    Retorna o próximo N que não existe em users.email LIKE 'valida%@valida.com.br'.
    """
    from models import get_db, User  # type: ignore
    if db_session is None:
        db = get_db()
        try:
            return _max_indice(db) + 1
        finally:
            db.close()
    return _max_indice(db_session) + 1


def _max_indice(db) -> int:
    from models import User  # type: ignore
    max_n = 0
    users = db.query(User.email).filter(User.email.like("valida%@valida.com.br")).all()
    for (email,) in users:
        m = EMAIL_REGEX.match(email)
        if m:
            n = int(m.group(1))
            if n > max_n:
                max_n = n
    return max_n


def alocar_usuarios(quantidade: int = 3, db_session=None) -> list[dict[str, str]]:
    """
    Aloca `quantidade` usuários sequenciais e os CRIA no banco.

    Retorna lista de dicts com `email`, `senha`, `id`. A senha é a padrão
    `SENHA_PADRAO`.

    Concorrência: assume que apenas 1 processo de provisionamento roda por vez.
    Se vários ciclos forem provisionados em paralelo, pode haver race condition
    no `MAX(N) + 1`. Para o uso atual (um ciclo de validação por vez), é OK.
    """
    from models import get_db, User  # type: ignore
    if db_session is None:
        db = get_db()
        try:
            return _alocar(db, quantidade)
        finally:
            db.close()
    return _alocar(db_session, quantidade)


def _alocar(db, quantidade: int) -> list[dict[str, str]]:
    from models import User  # type: ignore

    proximo = _max_indice(db) + 1
    users_criados: list[dict[str, str]] = []

    senha_hash = bcrypt.hashpw(SENHA_PADRAO.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    for i in range(quantidade):
        n = proximo + i
        email = f"valida{n}@valida.com.br"
        # Sanity: garantir que não existe (corrida)
        ja = db.query(User.id).filter(User.email == email).first()
        if ja:
            raise RuntimeError(f"Email {email} ja existe — sequencia de allocation comprometida")

        u = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=senha_hash,
            password_plain=SENHA_PADRAO,  # ambiente de validação — senha em claro pra debug
            name=f"Validador {n}",
            is_super=True,  # super para criar empresa via UI no UC-F01
        )
        db.add(u)
        db.flush()  # garante o id antes do commit
        users_criados.append({
            "email": email,
            "senha": SENHA_PADRAO,
            "id": u.id,
        })

    db.commit()
    return users_criados


def remover_usuarios(emails: list[str], db_session=None) -> int:
    """
    Remove usuários por email. Útil para limpeza pós-ciclo (trilha E2E).

    Retorna a quantidade efetivamente removida.
    """
    from models import get_db, User  # type: ignore
    if db_session is None:
        db = get_db()
        try:
            return _remover(db, emails)
        finally:
            db.close()
    return _remover(db_session, emails)


def _remover(db, emails: list[str]) -> int:
    from models import User  # type: ignore
    removidos = 0
    for email in emails:
        u = db.query(User).filter(User.email == email).first()
        if u:
            db.delete(u)
            removidos += 1
    db.commit()
    return removidos


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Alocar usuários valida<N>")
    parser.add_argument("--n", type=int, default=3, help="Quantos alocar")
    parser.add_argument("--proximo", action="store_true", help="So mostrar proximo indice")
    parser.add_argument("--remover", help="Email para remover (cleanup)")
    args = parser.parse_args()

    if args.remover:
        n = remover_usuarios([args.remover])
        print(f"Removidos: {n}")
    elif args.proximo:
        print(f"Próximo índice livre: valida{proximo_indice_livre()}")
    else:
        users = alocar_usuarios(args.n)
        print(f"\nAlocados {len(users)} usuários:")
        for u in users:
            print(f"  {u['email']} (id={u['id']})")
