"""Rotas /home — dashboard do tester logado."""
from __future__ import annotations

import sys
from pathlib import Path

from flask import Blueprint, render_template, redirect, url_for, session

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import Teste, ExecucaoCasoDeTeste, CasoDeTeste, Sprint  # type: ignore
from webapp.auth import login_required  # type: ignore

from sqlalchemy import func, desc


bp = Blueprint("home", __name__)


@bp.route("/")
def root():
    if session.get("user_id"):
        return redirect(url_for("home.home_page"))
    return redirect(url_for("login.login_page"))


@bp.route("/home")
@login_required
def home_page():
    user_id = session["user_id"]
    db = get_db()
    try:
        # Testes em andamento (criado, em_andamento, pausado)
        em_andamento = (
            db.query(Teste)
            .filter(Teste.user_id == user_id, Teste.estado.in_(["criado", "em_andamento", "pausado"]))
            .order_by(desc(Teste.atualizado_em))
            .all()
        )
        # Historico (concluido, cancelado) — ultimos 20
        historico = (
            db.query(Teste)
            .filter(Teste.user_id == user_id, Teste.estado.in_(["concluido", "cancelado"]))
            .order_by(desc(Teste.atualizado_em))
            .limit(20)
            .all()
        )

        # Progresso por teste (X/N CTs)
        def _progresso(t):
            total = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=t.id).count()
            concluidos = db.query(ExecucaoCasoDeTeste).filter(
                ExecucaoCasoDeTeste.teste_id == t.id,
                ExecucaoCasoDeTeste.estado.in_(["aprovado", "reprovado", "pulado"])
            ).count()
            return f"{concluidos}/{total}"

        em_andamento_view = []
        for t in em_andamento:
            em_andamento_view.append({
                "id": t.id,
                "titulo": t.titulo,
                "sprint_nome": t.sprint.nome if t.sprint else "?",
                "estado": t.estado,
                "progresso": _progresso(t),
                "atualizado_em": t.atualizado_em.strftime("%Y-%m-%d %H:%M") if t.atualizado_em else "-",
            })

        historico_view = []
        for t in historico:
            historico_view.append({
                "id": t.id,
                "titulo": t.titulo,
                "sprint_nome": t.sprint.nome if t.sprint else "?",
                "estado": t.estado,
                "progresso": _progresso(t),
                "concluido_em": t.concluido_em.strftime("%Y-%m-%d %H:%M") if t.concluido_em else "-",
            })

        # KPIs simples
        kpis = {
            "em_andamento": len(em_andamento_view),
            "historico_total": db.query(Teste).filter(Teste.user_id == user_id).count(),
            "ja_aprovados": db.query(ExecucaoCasoDeTeste).join(Teste).filter(
                Teste.user_id == user_id,
                ExecucaoCasoDeTeste.estado == "aprovado"
            ).count(),
        }

        return render_template(
            "home.html",
            user_name=session.get("user_name", ""),
            is_admin=session.get("is_admin", False),
            em_andamento=em_andamento_view,
            historico=historico_view,
            kpis=kpis,
        )
    finally:
        db.close()
