"""Rotas de login/logout do webapp."""
from __future__ import annotations

import sys
from pathlib import Path

from flask import Blueprint, render_template, request, redirect, url_for, flash, session

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import User  # type: ignore
from webapp.auth import verify_password, login_user, logout_user  # type: ignore


bp = Blueprint("login", __name__)


@bp.route("/login", methods=["GET", "POST"])
def login_page():
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        senha = request.form.get("senha") or ""
        if not email or not senha:
            flash("Informe email e senha", "erro")
            return render_template("login.html", email=email)
        db = get_db()
        try:
            user = db.query(User).filter_by(email=email, ativo=1).first()
            if not user or not verify_password(senha, user.password_hash):
                flash("Credenciais invalidas", "erro")
                return render_template("login.html", email=email)
            login_user(user)
            from flask import current_app
            current_app.logger.info(f"login: {email} (admin={user.administrador})")
            from webapp.audit import log as audit_log
            audit_log("login", "user", user.id, {"email": email})
            next_url = request.args.get("next") or request.form.get("next") or url_for("home.home_page")
            return redirect(next_url)
        finally:
            db.close()
    return render_template("login.html", email="")


@bp.route("/logout", methods=["POST", "GET"])
def logout():
    logout_user()
    return redirect(url_for("login.login_page"))
