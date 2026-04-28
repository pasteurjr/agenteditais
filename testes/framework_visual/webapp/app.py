"""
Webapp Flask permanente — porta 9876.

Sobe com:
  python3 -m testes.framework_visual.webapp.app
ou:
  bash scripts/start_painel_webapp.sh
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from flask import Flask, redirect, url_for

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent

sys.path.insert(0, str(_FW_VISUAL))


def _load_env():
    """Le .env da raiz se nao foi carregado."""
    if os.getenv("_WEBAPP_ENV_LOADED"):
        return
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv(_PROJECT / ".env")
    except ImportError:
        env_file = _PROJECT / ".env"
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())
    os.environ["_WEBAPP_ENV_LOADED"] = "1"


def create_app() -> Flask:
    _load_env()

    template_folder = str(_FW_VISUAL / "painel_assets")
    static_folder = str(_FW_VISUAL / "painel_assets")

    app = Flask(
        __name__,
        template_folder=template_folder,
        static_folder=static_folder,
        static_url_path="/static",
    )

    app.config["SECRET_KEY"] = os.getenv("WEBAPP_SECRET_KEY", "dev-only-change-me")
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 8  # 8h
    app.config["TEMPLATES_AUTO_RELOAD"] = True

    # Blueprints
    from webapp.routes_login import bp as bp_login  # type: ignore
    from webapp.routes_home import bp as bp_home  # type: ignore
    from webapp.routes_api import bp as bp_api  # type: ignore
    from webapp.routes_testes import bp as bp_testes  # type: ignore

    app.register_blueprint(bp_login)
    app.register_blueprint(bp_home)
    app.register_blueprint(bp_api)
    app.register_blueprint(bp_testes)

    # Health
    @app.route("/healthz")
    def healthz():
        return {"ok": True}

    # 404 default → /home se logado, /login senao
    @app.errorhandler(404)
    def not_found(e):
        return f"<h1>404</h1><p>Recurso nao encontrado.</p><p><a href='/'>Inicio</a></p>", 404

    @app.errorhandler(403)
    def forbidden(e):
        return f"<h1>403 — Acesso restrito</h1><p>Esta area e restrita a administradores.</p><p><a href='/home'>Voltar</a></p>", 403

    return app


def main():
    _load_env()
    port = int(os.getenv("WEBAPP_PORT", "9876"))
    app = create_app()
    print(f"[webapp] subindo em http://localhost:{port}")
    print(f"[webapp]   secret_key: {app.config['SECRET_KEY'][:10]}...")
    print(f"[webapp]   templates:  {app.template_folder}")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
