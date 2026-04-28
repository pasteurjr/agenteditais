"""
Backend REST puro pra app de validacao Sprint 1.

Porta: 5060 (frontend React em 5181).
Endpoints retornam SO JSON. Nada de HTML.

Auth: cookie de sessao Flask + bcrypt. CORS habilitado pra :5181.

Endpoints:
  POST /api/login            {email, senha} -> {ok, user}
  POST /api/logout
  GET  /api/me               -> {user} ou 401
  GET  /api/projetos
  GET  /api/projetos/:id/sprints
  GET  /api/sprints/:id/ucs        com cts agrupados
  GET  /api/testes                  meus testes
  GET  /api/testes/:id              detalhe + execucoes
  POST /api/testes                  cria teste {titulo, sprint_id, ct_ids[], ciclo_id?}
  POST /api/testes/:id/iniciar      spawn executor_sprint1.py
  POST /api/testes/:id/cancelar
  GET  /api/testes/:id/relatorio    HTML/markdown
  GET  /healthz
"""
from __future__ import annotations

import os
import subprocess
import sys
from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, request, session, abort
from flask_cors import CORS

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))
sys.path.insert(0, str(_PROJECT))


def _load_env():
    env_file = _PROJECT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())


_load_env()

from db.engine import get_db  # type: ignore
from db.models import (  # type: ignore
    User, Projeto, Sprint, CasoDeUso, CasoDeTeste,
    Teste, ExecucaoCasoDeTeste, PassoExecucao, Observacao, Relatorio,
)
from sqlalchemy import desc


def hash_password(senha: str) -> str:
    try:
        sys.path.insert(0, str(_PROJECT / "backend"))
        from auth.jwt_utils import hash_password as _hp  # type: ignore
        return _hp(senha)
    except Exception:
        import bcrypt
        return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def verify_password(senha: str, hash_arm: str) -> bool:
    try:
        sys.path.insert(0, str(_PROJECT / "backend"))
        from auth.jwt_utils import verify_password as _vp  # type: ignore
        return _vp(senha, hash_arm)
    except Exception:
        import bcrypt
        try:
            return bcrypt.checkpw(senha.encode(), hash_arm.encode())
        except Exception:
            return False


# ============================================================
# App
# ============================================================

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("WEBAPP_SECRET_KEY", "dev-only-change-me")
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 8

    # CORS aberto (qualquer origin) com credentials
    # SameSite=None pra cookie cross-origin funcionar
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = False  # dev — em prod virar True+HTTPS
    CORS(app,
         origins="*",
         supports_credentials=True,
         allow_headers="*",
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    return app


app = create_app()


# ============================================================
# Helpers de auth
# ============================================================

def login_required(fn):
    @wraps(fn)
    def w(*a, **kw):
        if not session.get("user_id"):
            return jsonify({"error": "nao autenticado"}), 401
        return fn(*a, **kw)
    return w


def admin_required(fn):
    @wraps(fn)
    def w(*a, **kw):
        if not session.get("user_id"):
            return jsonify({"error": "nao autenticado"}), 401
        if not session.get("is_admin"):
            return jsonify({"error": "acesso restrito a admin"}), 403
        return fn(*a, **kw)
    return w


# ============================================================
# Endpoints
# ============================================================

@app.route("/healthz")
def healthz():
    return jsonify({"ok": True})


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha") or ""
    if not email or not senha:
        return jsonify({"error": "email e senha obrigatorios"}), 400
    db = get_db()
    try:
        u = db.query(User).filter_by(email=email, ativo=1).first()
        if not u or not verify_password(senha, u.password_hash):
            return jsonify({"error": "credenciais invalidas"}), 401
        session["user_id"] = u.id
        session["user_email"] = u.email
        session["user_name"] = u.name
        session["is_admin"] = bool(u.administrador)
        session.permanent = True
        return jsonify({
            "ok": True,
            "user": {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "administrador": bool(u.administrador),
            }
        })
    finally:
        db.close()


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/me")
def api_me():
    if not session.get("user_id"):
        return jsonify({"user": None}), 401
    return jsonify({
        "user": {
            "id": session["user_id"],
            "email": session["user_email"],
            "name": session["user_name"],
            "administrador": session.get("is_admin", False),
        }
    })


@app.route("/api/projetos")
@login_required
def api_projetos():
    db = get_db()
    try:
        rows = db.query(Projeto).filter_by(ativo=1).order_by(Projeto.nome).all()
        return jsonify([{"id": p.id, "nome": p.nome, "descricao": p.descricao} for p in rows])
    finally:
        db.close()


@app.route("/api/projetos/<projeto_id>/sprints")
@login_required
def api_sprints(projeto_id):
    db = get_db()
    try:
        rows = db.query(Sprint).filter_by(projeto_id=projeto_id, ativo=1).order_by(Sprint.numero).all()
        return jsonify([{"id": s.id, "numero": s.numero, "nome": s.nome} for s in rows])
    finally:
        db.close()


@app.route("/api/sprints/<sprint_id>/ucs")
@login_required
def api_sprint_ucs(sprint_id):
    """UCs com seus CTs (filtraveis por categoria/trilha)."""
    categoria = request.args.get("categoria")
    trilha = request.args.get("trilha")
    so_com_passos = request.args.get("so_com_passos") == "1"

    db = get_db()
    try:
        ucs = db.query(CasoDeUso).filter_by(sprint_id=sprint_id, ativo=1).order_by(CasoDeUso.uc_id).all()
        result = []
        for uc in ucs:
            q = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ativo=1)
            if categoria:
                q = q.filter_by(categoria=categoria)
            if trilha:
                q = q.filter_by(trilha_sugerida=trilha)
            cts_raw = q.order_by(CasoDeTeste.ct_id).all()
            cts = []
            for c in cts_raw:
                tem_passos = len(c.passos_tutorial) > 0
                if so_com_passos and not tem_passos:
                    continue
                cts.append({
                    "id": c.id, "ct_id": c.ct_id, "descricao": c.descricao,
                    "tipo": c.tipo, "categoria": c.categoria,
                    "trilha_sugerida": c.trilha_sugerida,
                    "tem_passos": tem_passos,
                    "n_passos": len(c.passos_tutorial),
                })
            if not cts:
                continue
            result.append({
                "id": uc.id, "uc_id": uc.uc_id, "nome": uc.nome,
                "cts": cts,
            })
        return jsonify({"sprint_id": sprint_id, "ucs": result})
    finally:
        db.close()


@app.route("/api/testes")
@login_required
def api_testes_lista():
    """Meus testes (admin ve todos via ?todos=1)."""
    todos = request.args.get("todos") == "1" and session.get("is_admin")
    db = get_db()
    try:
        q = db.query(Teste)
        if not todos:
            q = q.filter(Teste.user_id == session["user_id"])
        rows = q.order_by(desc(Teste.atualizado_em)).limit(200).all()
        return jsonify([
            {
                "id": t.id, "titulo": t.titulo,
                "estado": t.estado, "ciclo_id": t.ciclo_id,
                "sprint_nome": t.sprint.nome if t.sprint else "-",
                "tester": t.user.email if t.user else "-",
                "criado_em": t.criado_em.strftime("%Y-%m-%d %H:%M") if t.criado_em else None,
                "atualizado_em": t.atualizado_em.strftime("%Y-%m-%d %H:%M") if t.atualizado_em else None,
                "concluido_em": t.concluido_em.strftime("%Y-%m-%d %H:%M") if t.concluido_em else None,
                "n_cts": len(t.execucoes),
                "n_concluidos": sum(1 for e in t.execucoes if e.estado in ("aprovado", "reprovado", "pulado")),
            }
            for t in rows
        ])
    finally:
        db.close()


@app.route("/api/testes", methods=["POST"])
@login_required
def api_teste_criar():
    data = request.get_json(silent=True) or {}
    titulo = (data.get("titulo") or "").strip()
    sprint_id = data.get("sprint_id")
    ct_ids = data.get("ct_ids") or []
    ciclo_id = data.get("ciclo_id") or None
    descricao = data.get("descricao") or None

    if not titulo or not sprint_id or not ct_ids:
        return jsonify({"error": "titulo, sprint_id e ct_ids[] obrigatorios"}), 400

    db = get_db()
    try:
        sprint = db.query(Sprint).filter_by(id=sprint_id, ativo=1).first()
        if not sprint:
            return jsonify({"error": "sprint invalida"}), 400
        cts = db.query(CasoDeTeste).filter(CasoDeTeste.id.in_(ct_ids), CasoDeTeste.ativo == 1).all()
        if not cts:
            return jsonify({"error": "nenhum CT valido encontrado"}), 400

        teste = Teste(
            projeto_id=sprint.projeto_id, sprint_id=sprint.id,
            user_id=session["user_id"], titulo=titulo,
            descricao=descricao, ciclo_id=ciclo_id, estado="criado",
        )
        db.add(teste)
        db.flush()

        ct_map = {c.id: c for c in cts}
        for ordem, ct_id in enumerate(ct_ids, start=1):
            if ct_id not in ct_map:
                continue
            db.add(ExecucaoCasoDeTeste(
                teste_id=teste.id, caso_de_teste_id=ct_id,
                ordem=ordem, estado="pendente",
            ))
        db.commit()
        return jsonify({"ok": True, "teste_id": teste.id}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/testes/<teste_id>")
@login_required
def api_teste_detalhe(teste_id):
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        execs = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=t.id).order_by(ExecucaoCasoDeTeste.ordem).all()
        execs_view = []
        for e in execs:
            ct = e.caso_de_teste
            execs_view.append({
                "id": e.id, "ordem": e.ordem,
                "ct_id": ct.ct_id if ct else "?",
                "ct_descricao": ct.descricao if ct else "",
                "uc_id": ct.caso_de_uso.uc_id if ct and ct.caso_de_uso else "?",
                "uc_nome": ct.caso_de_uso.nome if ct and ct.caso_de_uso else "",
                "estado": e.estado,
                "veredito_automatico": e.veredito_automatico,
                "veredicto_po": e.veredicto_po,
                "duracao_ms": e.duracao_ms,
                "n_passos": db.query(PassoExecucao).filter_by(execucao_id=e.id).count(),
            })
        return jsonify({
            "teste": {
                "id": t.id, "titulo": t.titulo, "descricao": t.descricao,
                "estado": t.estado, "ciclo_id": t.ciclo_id,
                "sprint_nome": t.sprint.nome if t.sprint else "-",
                "projeto_nome": t.projeto.nome if t.projeto else "-",
                "tester": t.user.email if t.user else "-",
                "iniciado_em": t.iniciado_em.isoformat() if t.iniciado_em else None,
                "concluido_em": t.concluido_em.isoformat() if t.concluido_em else None,
                "pid_executor": t.pid_executor,
            },
            "execucoes": execs_view,
        })
    finally:
        db.close()


def _is_pid_alive(pid):
    if not pid:
        return False
    try:
        os.kill(pid, 0)
        return True
    except (OSError, ProcessLookupError):
        return False


@app.route("/api/testes/<teste_id>/iniciar", methods=["POST"])
@login_required
def api_teste_iniciar(teste_id):
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        if _is_pid_alive(t.pid_executor):
            return jsonify({"ok": False, "msg": f"executor ja rodando pid={t.pid_executor}"}), 409

        # Spawn executor_sprint1.py
        cmd = [
            sys.executable,
            str(_FW_VISUAL / "executor_sprint1.py"),
            "--teste_id", t.id,
        ]
        log = open(f"/tmp/executor_{teste_id}.log", "w")
        proc = subprocess.Popen(
            cmd, cwd=str(_PROJECT),
            stdout=log, stderr=subprocess.STDOUT,
            env={**os.environ, "DISPLAY": os.environ.get("DISPLAY", ":0")},
        )
        t.pid_executor = proc.pid
        db.commit()
        return jsonify({
            "ok": True,
            "pid": proc.pid,
            "painel_url": "http://localhost:9876",
            "log_path": f"/tmp/executor_{teste_id}.log",
        })
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/cancelar", methods=["POST"])
@login_required
def api_teste_cancelar(teste_id):
    import signal as _sig
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        if t.pid_executor and _is_pid_alive(t.pid_executor):
            try: os.kill(t.pid_executor, _sig.SIGTERM)
            except Exception: pass
        t.estado = "cancelado"
        t.pid_executor = None
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/relatorio")
@login_required
def api_teste_relatorio(teste_id):
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403

        execs = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=t.id).order_by(ExecucaoCasoDeTeste.ordem).all()
        result_execs = []
        for e in execs:
            ct = e.caso_de_teste
            passos = db.query(PassoExecucao).filter_by(execucao_id=e.id).order_by(PassoExecucao.ordem).all()
            passos_view = []
            for p in passos:
                obs = db.query(Observacao).filter_by(passo_execucao_id=p.id).order_by(Observacao.criado_em).all()
                passos_view.append({
                    "ordem": p.ordem,
                    "passo_id": p.passo_id,
                    "passo_titulo": p.passo_titulo,
                    "veredito_automatico": p.veredito_automatico,
                    "veredicto_po": p.veredicto_po,
                    "duracao_ms": p.duracao_ms,
                    "screenshot_antes_path": p.screenshot_antes_path,
                    "screenshot_depois_path": p.screenshot_depois_path,
                    "correcao_necessaria": bool(p.correcao_necessaria),
                    "correcao_descricao": p.correcao_descricao,
                    "observacoes": [{"texto": o.texto, "criado_em": o.criado_em.isoformat()} for o in obs],
                })
            result_execs.append({
                "ordem": e.ordem,
                "ct_id": ct.ct_id if ct else "?",
                "ct_descricao": ct.descricao if ct else "",
                "uc_id": ct.caso_de_uso.uc_id if ct and ct.caso_de_uso else "?",
                "uc_nome": ct.caso_de_uso.nome if ct and ct.caso_de_uso else "",
                "estado": e.estado,
                "veredito_automatico": e.veredito_automatico,
                "veredicto_po": e.veredicto_po,
                "duracao_ms": e.duracao_ms,
                "passos": passos_view,
            })
        rel = db.query(Relatorio).filter_by(teste_id=t.id).order_by(desc(Relatorio.gerado_em)).first()
        return jsonify({
            "teste": {
                "id": t.id, "titulo": t.titulo, "estado": t.estado,
                "ciclo_id": t.ciclo_id,
                "sprint_nome": t.sprint.nome if t.sprint else "-",
                "tester": t.user.email if t.user else "-",
                "iniciado_em": t.iniciado_em.isoformat() if t.iniciado_em else None,
                "concluido_em": t.concluido_em.isoformat() if t.concluido_em else None,
            },
            "execucoes": result_execs,
            "relatorio_md": rel.conteudo_md if rel else None,
        })
    finally:
        db.close()


@app.route("/api/screenshot")
@login_required
def api_screenshot():
    """?path=testes/relatorios/visual/teste_xxx/UC-F01_xxx.png"""
    from flask import send_file
    p = request.args.get("path") or ""
    if not p or ".." in p:
        abort(400)
    full = _PROJECT / p
    if not full.exists() or not full.is_file():
        abort(404)
    # Sanity: tem que estar dentro de testes/relatorios/visual/
    rel_root = _PROJECT / "testes" / "relatorios" / "visual"
    try:
        full.relative_to(rel_root)
    except ValueError:
        abort(403)
    return send_file(str(full), mimetype="image/png")


# ============================================================
# Main
# ============================================================

def main():
    port = int(os.getenv("API_PORT", "5060"))
    print(f"[api] Backend REST em http://localhost:{port}")
    print(f"[api] Frontend React esperado em http://localhost:5181")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
