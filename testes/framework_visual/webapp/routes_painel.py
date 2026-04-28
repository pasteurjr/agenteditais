"""Rotas do painel de execucao — leem IPC + escrevem comandos no banco."""
from __future__ import annotations

import json
import sys
from pathlib import Path
from datetime import datetime

from flask import Blueprint, jsonify, request, abort, send_file, session

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import Teste, ExecucaoCasoDeTeste, PassoExecucao, Observacao  # type: ignore
from webapp.auth import login_required  # type: ignore
from webapp.orchestrator import iniciar_executor, parar_executor, is_pid_alive  # type: ignore

bp = Blueprint("painel", __name__)


def _check_acesso(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        if not (session.get("is_admin") or teste.user_id == session.get("user_id")):
            abort(403)
        return teste
    finally:
        db.close()


@bp.route("/teste/<teste_id>/iniciar", methods=["POST"])
@login_required
def iniciar(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        if not (session.get("is_admin") or teste.user_id == session.get("user_id")):
            abort(403)
        if is_pid_alive(teste.pid_executor):
            return jsonify({"ok": False, "msg": f"executor ja rodando (pid={teste.pid_executor})"}), 409
        # Limpa pid stale
        if teste.pid_executor:
            teste.pid_executor = None
            db.commit()
        # Spawn
        pid = iniciar_executor(teste_id)
        teste.pid_executor = pid
        db.commit()
        return jsonify({"ok": True, "pid": pid})
    finally:
        db.close()


@bp.route("/teste/<teste_id>/pausar", methods=["POST"])
@login_required
def pausar(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        if not (session.get("is_admin") or teste.user_id == session.get("user_id")):
            abort(403)
        if teste.pid_executor and parar_executor(teste.pid_executor):
            return jsonify({"ok": True, "msg": "SIGTERM enviado"})
        return jsonify({"ok": False, "msg": "executor nao esta rodando"})
    finally:
        db.close()


@bp.route("/teste/<teste_id>/cancelar", methods=["POST"])
@login_required
def cancelar(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        if not (session.get("is_admin") or teste.user_id == session.get("user_id")):
            abort(403)
        if teste.pid_executor:
            parar_executor(teste.pid_executor)
        teste.estado = "cancelado"
        teste.pid_executor = None
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


@bp.route("/teste/<teste_id>/estado", methods=["GET"])
@login_required
def estado(teste_id):
    teste = _check_acesso(teste_id)  # ja faz close
    db = get_db()
    try:
        # Ler IPC
        ipc_path = Path(f"/tmp/painel_{teste_id}.json")
        ipc_data = {}
        if ipc_path.exists():
            try:
                ipc_data = json.loads(ipc_path.read_text(encoding="utf-8"))
            except Exception:
                pass
        # Status do banco
        teste_db = db.query(Teste).filter_by(id=teste_id).first()
        execs = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=teste_id).order_by(ExecucaoCasoDeTeste.ordem).all()
        return jsonify({
            "teste": {
                "id": teste_db.id,
                "titulo": teste_db.titulo,
                "estado": teste_db.estado,
                "pid_alive": is_pid_alive(teste_db.pid_executor),
            },
            "ipc": ipc_data,
            "execucoes": [
                {
                    "id": e.id,
                    "ordem": e.ordem,
                    "ct_id": e.caso_de_teste.ct_id if e.caso_de_teste else "?",
                    "estado": e.estado,
                    "veredito_automatico": e.veredito_automatico,
                    "veredicto_po": e.veredicto_po,
                }
                for e in execs
            ],
        })
    finally:
        db.close()


def _passo_atual(db, teste_id):
    """Retorna o PassoExecucao em estado pendente do CT em execucao."""
    exec_atual = (
        db.query(ExecucaoCasoDeTeste)
        .filter_by(teste_id=teste_id, estado="em_execucao")
        .first()
    )
    if not exec_atual:
        return None
    # Ultimo passo nao decidido (sem veredicto_po)
    passo = (
        db.query(PassoExecucao)
        .filter_by(execucao_id=exec_atual.id, veredicto_po=None)
        .order_by(PassoExecucao.ordem)
        .first()
    )
    return passo


@bp.route("/teste/<teste_id>/aprovar", methods=["POST"])
@login_required
def aprovar(teste_id):
    _check_acesso(teste_id)
    db = get_db()
    try:
        passo = _passo_atual(db, teste_id)
        if not passo:
            return jsonify({"ok": False, "msg": "sem passo aguardando decisao"}), 409
        passo.veredicto_po = "APROVADO"
        passo.pediu_continuar = 1
        db.commit()
        return jsonify({"ok": True, "passo_id": passo.passo_id})
    finally:
        db.close()


@bp.route("/teste/<teste_id>/reprovar", methods=["POST"])
@login_required
def reprovar(teste_id):
    _check_acesso(teste_id)
    db = get_db()
    try:
        passo = _passo_atual(db, teste_id)
        if not passo:
            return jsonify({"ok": False, "msg": "sem passo aguardando decisao"}), 409
        passo.veredicto_po = "REPROVADO"
        passo.pediu_continuar = 1
        passo.correcao_necessaria = 1
        db.commit()
        return jsonify({"ok": True, "passo_id": passo.passo_id})
    finally:
        db.close()


@bp.route("/teste/<teste_id>/comentario", methods=["POST"])
@login_required
def comentario(teste_id):
    _check_acesso(teste_id)
    data = request.get_json(silent=True) or request.form
    texto = (data.get("texto") or "").strip() if hasattr(data, "get") else ""
    if not texto:
        return jsonify({"ok": False, "msg": "texto vazio"}), 400
    db = get_db()
    try:
        passo = _passo_atual(db, teste_id)
        if not passo:
            return jsonify({"ok": False, "msg": "sem passo atual"}), 409
        obs = Observacao(
            passo_execucao_id=passo.id,
            user_id=session["user_id"],
            texto=texto,
        )
        db.add(obs)
        db.commit()
        return jsonify({"ok": True, "id": obs.id})
    finally:
        db.close()


@bp.route("/teste/<teste_id>/screenshot/<nome>", methods=["GET"])
@login_required
def screenshot(teste_id, nome):
    _check_acesso(teste_id)
    if "/" in nome or ".." in nome:
        abort(400)
    # Estrategia 1: pasta teste_<id8>/<ct_dir>/<nome>
    teste_dir = _PROJECT / "testes" / "relatorios" / "visual" / f"teste_{teste_id[:8]}"
    if teste_dir.exists():
        for sub in teste_dir.iterdir():
            if not sub.is_dir():
                continue
            candidato = sub / nome
            if candidato.exists():
                return send_file(candidato, mimetype="image/png")
    # Estrategia 2: legacy/piloto — procurar em testes/relatorios/visual/UC-*/timestamp/
    db = get_db()
    try:
        # Pega path do screenshot direto do banco se exists
        from db.models import PassoExecucao, ExecucaoCasoDeTeste
        passo = (
            db.query(PassoExecucao)
            .join(ExecucaoCasoDeTeste)
            .filter(ExecucaoCasoDeTeste.teste_id == teste_id)
            .filter((PassoExecucao.screenshot_antes_path.like(f"%{nome}")) |
                    (PassoExecucao.screenshot_depois_path.like(f"%{nome}")))
            .first()
        )
        if passo:
            for path in (passo.screenshot_antes_path, passo.screenshot_depois_path):
                if path and path.endswith(nome):
                    full = _PROJECT / path
                    if full.exists():
                        return send_file(full, mimetype="image/png")
    finally:
        db.close()
    abort(404)
