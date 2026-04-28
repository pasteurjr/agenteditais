"""
Auth do webapp — sessao Flask cookie + bcrypt.

login_required / admin_required como decorators.
current_user() retorna o User logado ou None.
"""
from __future__ import annotations

import sys
from functools import wraps
from pathlib import Path
from typing import Optional

from flask import session, redirect, url_for, request, jsonify, abort

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import User  # type: ignore


# ----- Hash / verify -----

def _try_import_jwt_utils():
    try:
        sys.path.insert(0, str(_PROJECT / "backend"))
        from auth.jwt_utils import hash_password, verify_password  # type: ignore
        return hash_password, verify_password
    except Exception:
        return None, None


_hash_fn, _verify_fn = _try_import_jwt_utils()


def hash_password(senha: str) -> str:
    if _hash_fn:
        return _hash_fn(senha)
    import bcrypt
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(senha: str, hash_armazenado: str) -> bool:
    if _verify_fn:
        try:
            return _verify_fn(senha, hash_armazenado)
        except Exception:
            return False
    import bcrypt
    try:
        return bcrypt.checkpw(senha.encode("utf-8"), hash_armazenado.encode("utf-8"))
    except Exception:
        return False


# ----- current_user -----

def current_user() -> Optional[User]:
    """Retorna o User logado ou None. Cacheia em flask.g."""
    user_id = session.get("user_id")
    if not user_id:
        return None
    db = get_db()
    try:
        return db.query(User).filter_by(id=user_id, ativo=1).first()
    finally:
        db.close()


def login_user(user: User) -> None:
    session["user_id"] = user.id
    session["user_email"] = user.email
    session["user_name"] = user.name
    session["is_admin"] = bool(user.administrador)
    session.permanent = True


def logout_user() -> None:
    session.clear()


# ----- Decorators -----

def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            if request.path.startswith("/api/") or request.headers.get("Accept", "").startswith("application/json"):
                return jsonify({"error": "nao autenticado"}), 401
            return redirect(url_for("login.login_page", next=request.path))
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return redirect(url_for("login.login_page", next=request.path))
        if not session.get("is_admin"):
            if request.path.startswith("/api/") or request.headers.get("Accept", "").startswith("application/json"):
                return jsonify({"error": "acesso restrito a administrador"}), 403
            abort(403)
        return fn(*args, **kwargs)
    return wrapper


__all__ = [
    "hash_password", "verify_password",
    "current_user", "login_user", "logout_user",
    "login_required", "admin_required",
]
