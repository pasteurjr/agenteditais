"""Rotas de criacao/gestao de testes."""
from __future__ import annotations

import sys
import uuid
from datetime import datetime
from pathlib import Path

from flask import Blueprint, render_template, request, redirect, url_for, session, flash, abort, jsonify

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import (  # type: ignore
    Projeto, Sprint, CasoDeUso, CasoDeTeste,
    Teste, ExecucaoCasoDeTeste,
)
from webapp.auth import login_required  # type: ignore

bp = Blueprint("testes", __name__)


def _user_pode_ver(teste, user_id, is_admin):
    return is_admin or teste.user_id == user_id


@bp.route("/teste/novo", methods=["GET"])
@login_required
def teste_novo_form():
    db = get_db()
    try:
        projetos = db.query(Projeto).filter_by(ativo=1).order_by(Projeto.nome).all()
        return render_template("teste_novo.html",
                               projetos=projetos,
                               user_name=session.get("user_name"),
                               is_admin=session.get("is_admin", False))
    finally:
        db.close()


@bp.route("/teste/novo", methods=["POST"])
@login_required
def teste_novo_criar():
    titulo = (request.form.get("titulo") or "").strip()
    descricao = (request.form.get("descricao") or "").strip() or None
    projeto_id = request.form.get("projeto_id") or ""
    sprint_id = request.form.get("sprint_id") or ""
    ciclo_id = (request.form.get("ciclo_id") or "").strip() or None
    ct_ids = request.form.getlist("ct_ids")  # lista de IDs de CTs selecionados

    if not titulo or not projeto_id or not sprint_id or not ct_ids:
        flash("Preencha titulo, projeto, sprint e selecione ao menos 1 CT", "erro")
        return redirect(url_for("testes.teste_novo_form"))

    db = get_db()
    try:
        # Validar projeto/sprint
        proj = db.query(Projeto).filter_by(id=projeto_id, ativo=1).first()
        sprint = db.query(Sprint).filter_by(id=sprint_id, ativo=1).first()
        if not proj or not sprint:
            flash("Projeto/Sprint invalido", "erro")
            return redirect(url_for("testes.teste_novo_form"))

        # Carregar CTs
        cts = (
            db.query(CasoDeTeste)
            .filter(CasoDeTeste.id.in_(ct_ids), CasoDeTeste.ativo == 1)
            .all()
        )
        if not cts:
            flash("Nenhum CT selecionado encontrado", "erro")
            return redirect(url_for("testes.teste_novo_form"))

        # Criar teste
        teste = Teste(
            projeto_id=proj.id,
            sprint_id=sprint.id,
            user_id=session["user_id"],
            titulo=titulo,
            descricao=descricao,
            ciclo_id=ciclo_id,
            estado="criado",
        )
        db.add(teste)
        db.flush()

        # Criar execucoes (1 por CT selecionado, na ordem do form)
        ct_by_id = {c.id: c for c in cts}
        for ordem, ct_id in enumerate(ct_ids, start=1):
            if ct_id not in ct_by_id:
                continue
            db.add(ExecucaoCasoDeTeste(
                teste_id=teste.id,
                caso_de_teste_id=ct_id,
                ordem=ordem,
                estado="pendente",
            ))

        db.commit()
        from webapp.audit import log as audit_log
        audit_log("criar_teste", "teste", teste.id, {"titulo": titulo, "n_cts": len(cts)})
        return redirect(url_for("testes.teste_executar", teste_id=teste.id))
    except Exception as e:
        db.rollback()
        flash(f"Erro ao criar teste: {e}", "erro")
        return redirect(url_for("testes.teste_novo_form"))
    finally:
        db.close()


@bp.route("/teste/<teste_id>/executar", methods=["GET"])
@login_required
def teste_executar(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        if not _user_pode_ver(teste, session["user_id"], session.get("is_admin")):
            abort(403)
        # Por enquanto so renderiza tela basica (Fase E vai trazer painel completo)
        execs = (
            db.query(ExecucaoCasoDeTeste)
            .filter_by(teste_id=teste.id)
            .order_by(ExecucaoCasoDeTeste.ordem)
            .all()
        )
        cts_view = []
        for e in execs:
            ct = e.caso_de_teste
            cts_view.append({
                "ordem": e.ordem,
                "ct_id": ct.ct_id if ct else "?",
                "descricao": ct.descricao if ct else "",
                "estado": e.estado,
                "veredito_automatico": e.veredito_automatico,
                "veredicto_po": e.veredicto_po or "—",
                "tem_tutorial": ct.variacao_tutorial is not None if ct else False,
            })
        return render_template("executar.html",
                               teste=teste,
                               cts=cts_view,
                               user_name=session.get("user_name"),
                               is_admin=session.get("is_admin", False))
    finally:
        db.close()
