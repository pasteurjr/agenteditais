"""APIs auxiliares — JSON pras telas."""
from __future__ import annotations

import sys
from pathlib import Path

from flask import Blueprint, jsonify, request

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import Projeto, Sprint, CasoDeUso, CasoDeTeste  # type: ignore
from webapp.auth import login_required  # type: ignore

bp = Blueprint("api", __name__, url_prefix="/api")


@bp.route("/projetos")
@login_required
def lista_projetos():
    db = get_db()
    try:
        rows = db.query(Projeto).filter_by(ativo=1).order_by(Projeto.nome).all()
        return jsonify([{"id": p.id, "nome": p.nome, "descricao": p.descricao} for p in rows])
    finally:
        db.close()


@bp.route("/projetos/<projeto_id>/sprints")
@login_required
def lista_sprints(projeto_id):
    db = get_db()
    try:
        rows = (
            db.query(Sprint)
            .filter_by(projeto_id=projeto_id, ativo=1)
            .order_by(Sprint.numero)
            .all()
        )
        return jsonify([{"id": s.id, "numero": s.numero, "nome": s.nome} for s in rows])
    finally:
        db.close()


@bp.route("/sprints/<sprint_id>/cts")
@login_required
def lista_cts(sprint_id):
    """Retorna CTs da sprint agrupados por UC. Filtros via query params:
    - categoria: Cenário | Classe | Fronteira | Combinado
    - trilha: visual | e2e | humana
    """
    categoria = request.args.get("categoria")
    trilha = request.args.get("trilha")

    db = get_db()
    try:
        ucs = (
            db.query(CasoDeUso)
            .filter_by(sprint_id=sprint_id, ativo=1)
            .order_by(CasoDeUso.uc_id)
            .all()
        )
        result = []
        for uc in ucs:
            q = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ativo=1)
            if categoria:
                q = q.filter_by(categoria=categoria)
            if trilha:
                q = q.filter_by(trilha_sugerida=trilha)
            cts = q.order_by(CasoDeTeste.ct_id).all()
            if not cts:
                continue
            result.append({
                "uc_id": uc.uc_id,
                "uc_nome": uc.nome,
                "cts": [
                    {
                        "id": c.id,
                        "ct_id": c.ct_id,
                        "descricao": c.descricao,
                        "tipo": c.tipo,
                        "categoria": c.categoria,
                        "trilha_sugerida": c.trilha_sugerida,
                        "variacao_tutorial": c.variacao_tutorial,
                        "tem_tutorial": c.variacao_tutorial is not None,
                    }
                    for c in cts
                ],
            })
        return jsonify({"sprint_id": sprint_id, "ucs": result})
    finally:
        db.close()
