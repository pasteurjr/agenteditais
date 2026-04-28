"""Rotas de relatorios."""
from __future__ import annotations

import sys
from pathlib import Path

from flask import Blueprint, render_template, abort, session, Response

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import Teste, Relatorio, ExecucaoCasoDeTeste, PassoExecucao, Observacao  # type: ignore
from webapp.auth import login_required, admin_required  # type: ignore

from sqlalchemy import desc

bp = Blueprint("relatorios", __name__)


@bp.route("/relatorios")
@admin_required
def lista_global():
    """Lista todos os relatorios — apenas admin."""
    db = get_db()
    try:
        rels = (
            db.query(Relatorio)
            .join(Teste)
            .order_by(desc(Relatorio.gerado_em))
            .limit(100)
            .all()
        )
        view = []
        for r in rels:
            t = r.teste
            view.append({
                "id": r.id,
                "teste_id": t.id,
                "titulo": t.titulo,
                "tester": t.user.email if t.user else "-",
                "sprint": t.sprint.nome if t.sprint else "-",
                "estado": t.estado,
                "gerado_em": r.gerado_em.strftime("%Y-%m-%d %H:%M") if r.gerado_em else "-",
            })
        return render_template(
            "relatorios.html",
            relatorios=view,
            user_name=session.get("user_name"),
            is_admin=True,
            titulo_pagina="Todos os Relatórios (admin)",
        )
    finally:
        db.close()


@bp.route("/meus-relatorios")
@login_required
def meus_relatorios():
    db = get_db()
    try:
        user_id = session["user_id"]
        rels = (
            db.query(Relatorio)
            .join(Teste)
            .filter(Teste.user_id == user_id)
            .order_by(desc(Relatorio.gerado_em))
            .limit(100)
            .all()
        )
        view = []
        for r in rels:
            t = r.teste
            view.append({
                "id": r.id,
                "teste_id": t.id,
                "titulo": t.titulo,
                "tester": t.user.email if t.user else "-",
                "sprint": t.sprint.nome if t.sprint else "-",
                "estado": t.estado,
                "gerado_em": r.gerado_em.strftime("%Y-%m-%d %H:%M") if r.gerado_em else "-",
            })
        return render_template(
            "relatorios.html",
            relatorios=view,
            user_name=session.get("user_name"),
            is_admin=session.get("is_admin", False),
            titulo_pagina="Meus Relatórios",
        )
    finally:
        db.close()


@bp.route("/relatorio/<teste_id>")
@login_required
def detalhe(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        # Acesso: dono ou admin
        if not (session.get("is_admin") or teste.user_id == session.get("user_id")):
            abort(403)
        execs = (
            db.query(ExecucaoCasoDeTeste)
            .filter_by(teste_id=teste_id)
            .order_by(ExecucaoCasoDeTeste.ordem)
            .all()
        )
        # Para cada execucao, traz passos + observacoes
        execs_view = []
        for e in execs:
            passos = (
                db.query(PassoExecucao)
                .filter_by(execucao_id=e.id)
                .order_by(PassoExecucao.ordem)
                .all()
            )
            passos_view = []
            for p in passos:
                obs = (
                    db.query(Observacao)
                    .filter_by(passo_execucao_id=p.id)
                    .order_by(Observacao.criado_em)
                    .all()
                )
                passos_view.append({
                    "ordem": p.ordem,
                    "passo_id": p.passo_id,
                    "passo_titulo": p.passo_titulo,
                    "veredito_automatico": p.veredito_automatico,
                    "veredicto_po": p.veredicto_po,
                    "duracao_ms": p.duracao_ms,
                    "screenshot_antes_url": p.screenshot_antes_url,
                    "screenshot_depois_url": p.screenshot_depois_url,
                    "correcao_necessaria": bool(p.correcao_necessaria),
                    "correcao_descricao": p.correcao_descricao,
                    "observacoes": [
                        {"texto": o.texto, "criado_em": o.criado_em.strftime("%H:%M:%S") if o.criado_em else ""}
                        for o in obs
                    ],
                })
            execs_view.append({
                "ordem": e.ordem,
                "ct_id": e.caso_de_teste.ct_id if e.caso_de_teste else "?",
                "ct_descricao": e.caso_de_teste.descricao if e.caso_de_teste else "",
                "estado": e.estado,
                "veredito_automatico": e.veredito_automatico,
                "veredicto_po": e.veredicto_po,
                "duracao_ms": e.duracao_ms,
                "passos": passos_view,
            })

        return render_template(
            "relatorio.html",
            teste=teste,
            execucoes=execs_view,
            user_name=session.get("user_name"),
            is_admin=session.get("is_admin", False),
        )
    finally:
        db.close()


@bp.route("/relatorio/<teste_id>/md")
@login_required
def detalhe_md(teste_id):
    db = get_db()
    try:
        teste = db.query(Teste).filter_by(id=teste_id).first()
        if not teste:
            abort(404)
        if not (session.get("is_admin") or teste.user_id == session.get("user_id")):
            abort(403)
        # Tenta pegar do registro Relatorio salvo
        rel = (
            db.query(Relatorio)
            .filter_by(teste_id=teste_id, formato="md")
            .order_by(Relatorio.gerado_em.desc())
            .first()
        )
        if rel and rel.conteudo_md:
            return Response(
                rel.conteudo_md,
                mimetype="text/markdown; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="relatorio_{teste_id[:8]}.md"'},
            )
        return Response("Relatorio markdown nao gerado.", status=404)
    finally:
        db.close()
