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

import io
import os
import subprocess
import sys
from datetime import datetime
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
    Teste, RunTeste, ExecucaoCasoDeTeste, PassoExecucao, Observacao, Relatorio,
    PassoTutorial, UcPredecessor, UcExecucaoSatisfatoria,
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

    # CORS — proxy do Vite repassa pra /api do mesmo origin (5181), entao cookie
    # eh same-origin do ponto de vista do browser. SameSite=Lax funciona pra dev local.
    # Para acesso externo (IP publico, tunnel HTTPS), defina:
    #   CORS_ORIGINS="http://1.2.3.4:5181,https://abc.ngrok.io"
    #   COOKIE_SAMESITE_NONE=1 (so se for HTTPS — cookie cross-site precisa SameSite=None+Secure)
    _samesite_none = os.getenv("COOKIE_SAMESITE_NONE", "0") == "1"
    if _samesite_none:
        app.config["SESSION_COOKIE_SAMESITE"] = "None"
        app.config["SESSION_COOKIE_SECURE"] = True
    else:
        app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
        app.config["SESSION_COOKIE_SECURE"] = False

    _cors_env = os.getenv("CORS_ORIGINS", "").strip()
    if _cors_env == "*":
        # Origin curinga real ("*") nao funciona com supports_credentials.
        # Usar regex que case com qualquer origin e ainda permite cookies.
        import re as _re
        CORS(app, origins=_re.compile(r".*"), supports_credentials=True,
             allow_headers="*", methods=["GET","POST","PUT","DELETE","OPTIONS"])
    elif _cors_env:
        CORS(app, origins=[o.strip() for o in _cors_env.split(",") if o.strip()],
             supports_credentials=True, allow_headers="*",
             methods=["GET","POST","PUT","DELETE","OPTIONS"])
    else:
        CORS(app,
             origins=["http://localhost:5181", "http://127.0.0.1:5181",
                      "http://localhost:5180", "http://127.0.0.1:5180"],
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
    db = get_db()
    try:
        u = db.query(User).filter_by(id=session["user_id"]).first()
        return jsonify({
            "user": {
                "id": session["user_id"],
                "email": session["user_email"],
                "name": session["user_name"],
                "administrador": session.get("is_admin", False),
                "pasta_documentos_teste": u.pasta_documentos_teste if u else None,
            }
        })
    finally:
        db.close()


# ============================================================
# Configuracoes do tester — pasta de documentos sintetizados
# ============================================================

@app.route("/api/configuracoes/pasta-documentos", methods=["GET"])
@login_required
def api_get_pasta_documentos():
    """Retorna a pasta atual + status de validacao."""
    db = get_db()
    try:
        u = db.query(User).filter_by(id=session["user_id"]).first()
        pasta = u.pasta_documentos_teste if u else None
        valido, detalhes = _validar_pasta_documentos(pasta)
        return jsonify({
            "pasta": pasta,
            "valida": valido,
            "detalhes": detalhes,
        })
    finally:
        db.close()


@app.route("/api/configuracoes/pasta-documentos", methods=["POST"])
@login_required
def api_set_pasta_documentos():
    """Salva a pasta apos validar a estrutura."""
    data = request.get_json() or {}
    pasta = (data.get("pasta") or "").strip()
    if not pasta:
        return jsonify({"ok": False, "msg": "pasta vazia"}), 400

    valido, detalhes = _validar_pasta_documentos(pasta)
    if not valido:
        return jsonify({
            "ok": False,
            "msg": "Pasta invalida: " + detalhes.get("erro", "estrutura nao reconhecida"),
            "detalhes": detalhes,
        }), 400

    db = get_db()
    try:
        u = db.query(User).filter_by(id=session["user_id"]).first()
        if not u:
            return jsonify({"ok": False, "msg": "user nao encontrado"}), 404
        u.pasta_documentos_teste = pasta
        db.commit()
        return jsonify({
            "ok": True,
            "pasta": pasta,
            "detalhes": detalhes,
        })
    finally:
        db.close()


@app.route("/api/configuracoes/pasta-documentos/validar", methods=["POST"])
@login_required
def api_validar_pasta_documentos():
    """Valida a pasta sem salvar (preview no frontend antes do save)."""
    data = request.get_json() or {}
    pasta = (data.get("pasta") or "").strip()
    valido, detalhes = _validar_pasta_documentos(pasta)
    return jsonify({"valida": valido, "detalhes": detalhes})


@app.route("/api/documentos-sintetizados.zip", methods=["GET"])
@login_required
def api_download_zip_documentos():
    """Serve o ZIP de documentos sintetizados pra download."""
    from flask import send_file
    zip_path = _PROJECT / "docs" / "documentos_sintetizados.zip"
    if not zip_path.exists():
        return jsonify({"error": "ZIP nao encontrado em " + str(zip_path)}), 404
    return send_file(
        str(zip_path),
        as_attachment=True,
        download_name="documentos_sintetizados.zip",
        mimetype="application/zip",
    )


def _teste_precisa_pasta_documentos(db, teste) -> bool:
    """Retorna True se algum CT do teste tem acao upload_arquivo nos passos."""
    import json as _json
    execs = (
        db.query(ExecucaoCasoDeTeste)
        .filter_by(teste_id=teste.id)
        .all()
    )
    ct_ids = [e.caso_de_teste_id for e in execs]
    if not ct_ids:
        return False
    passos = (
        db.query(PassoTutorial)
        .filter(PassoTutorial.caso_de_teste_id.in_(ct_ids))
        .all()
    )
    for p in passos:
        acoes = p.acoes_json
        if isinstance(acoes, str):
            try: acoes = _json.loads(acoes)
            except: continue
        if not acoes:
            continue
        if _tem_acao_upload(acoes):
            return True
    return False


def _tem_acao_upload(acoes) -> bool:
    """Busca recursiva por tipo='upload_arquivo' em acoes_json."""
    if isinstance(acoes, dict):
        if acoes.get("tipo") == "upload_arquivo":
            return True
        if "sequencia" in acoes:
            return _tem_acao_upload(acoes["sequencia"])
        return False
    if isinstance(acoes, list):
        return any(_tem_acao_upload(a) for a in acoes)
    return False


def _validar_pasta_documentos(pasta: str | None) -> tuple[bool, dict]:
    """Confere que pasta existe, eh diretorio e tem estrutura sprintN/UC-XXX/.
    Retorna (valido, detalhes_dict)."""
    if not pasta:
        return False, {"erro": "pasta nao configurada"}
    p = Path(pasta)
    if not p.exists():
        return False, {"erro": f"pasta nao existe: {pasta}"}
    if not p.is_dir():
        return False, {"erro": f"nao eh diretorio: {pasta}"}

    sprints_esperadas = ["sprint1", "sprint2", "sprint3-4", "sprint4", "sprint5"]
    sprints_encontradas = [s for s in sprints_esperadas if (p / s).is_dir()]
    if not sprints_encontradas:
        return False, {
            "erro": "nenhuma subpasta sprint* encontrada — descompacte o ZIP nesta pasta",
            "esperado": sprints_esperadas,
        }

    pdfs_total = sum(1 for _ in p.rglob("*.pdf"))
    return True, {
        "sprints_encontradas": sprints_encontradas,
        "pdfs_total": pdfs_total,
        "msg": f"OK — {len(sprints_encontradas)} sprints, {pdfs_total} PDFs",
    }


# Estados de execucao que contam como "UC foi executado ate o fim"
ESTADOS_EXECUCAO_COMPLETA = ("aprovado", "reprovado")


def _validar_predecessores(db, teste) -> tuple[bool, dict]:
    """
    Pre-flight: para cada UC do teste, verifica se seus predecessores
    estao satisfeitos (executados ate o fim por este user OU incluidos no proprio teste).

    Retorna (ok, detalhes_dict).
    """
    # 1. UCs do teste
    execs = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=teste.id).all()
    ct_ids = [e.caso_de_teste_id for e in execs]
    if not ct_ids:
        return True, {"msg": "teste sem CTs — nada pra validar"}

    cts = db.query(CasoDeTeste).filter(CasoDeTeste.id.in_(ct_ids)).all()
    uc_ids_no_teste = set(c.caso_de_uso_id for c in cts)
    uc_strs_no_teste = set(
        uc.uc_id
        for uc in db.query(CasoDeUso).filter(CasoDeUso.id.in_(uc_ids_no_teste)).all()
    )

    # 2. Para cada UC, busca predecessores
    predecessores_por_uc = {}  # uc_id_db -> [ {grupo_or, predecessor_uc_db_id, marcador} ]
    preds_rows = (
        db.query(UcPredecessor)
        .filter(UcPredecessor.uc_id.in_(uc_ids_no_teste))
        .order_by(UcPredecessor.uc_id, UcPredecessor.ordem, UcPredecessor.grupo_or)
        .all()
    )
    for r in preds_rows:
        predecessores_por_uc.setdefault(r.uc_id, []).append(r)

    # 3. UCs incluidos no proprio teste — fonte primaria de satisfacao.
    uc_ids_no_proprio_teste = set(uc_ids_no_teste)

    # 3.1 HERANCA: se teste tem teste_base_id, herda UCs ja executados (estado
    # aprovado) do teste base recursivamente. Isso permite que Sprint 2 declare
    # UCs Sprint 1 como predecessores e satisfa-los via heranca.
    base_id = getattr(teste, "teste_base_id", None)
    visitados = set()
    while base_id and base_id not in visitados:
        visitados.add(base_id)
        base = db.query(Teste).filter_by(id=base_id).first()
        if not base:
            break
        # Pega UCs com pelo menos 1 execucao aprovada no teste base
        execs_base = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=base.id, estado="aprovado").all()
        ct_ids_base = [e.caso_de_teste_id for e in execs_base]
        if ct_ids_base:
            ucs_base = db.query(CasoDeTeste).filter(CasoDeTeste.id.in_(ct_ids_base)).all()
            for c in ucs_base:
                uc_ids_no_proprio_teste.add(c.caso_de_uso_id)
        base_id = base.teste_base_id

    # 3a. Fechamento transitivo via <<uses>>: se UC-A esta no teste e UC-A uses UC-B,
    # entao UC-B esta IMPLICITAMENTE satisfeito (rodara como subfluxo automatico do tutorial de UC-A).
    uses_rows = (
        db.query(UcPredecessor)
        .filter(
            UcPredecessor.uc_id.in_(uc_ids_no_proprio_teste),
            UcPredecessor.tipo == "uses",
            UcPredecessor.predecessor_id.isnot(None),
        )
        .all()
    )
    for r in uses_rows:
        uc_ids_no_proprio_teste.add(r.predecessor_id)

    # 4. Avalia cada UC do teste
    pendencias_por_uc = []  # lista de {uc_id_str, faltam: [str]}

    for uc_id_db, lista_preds in predecessores_por_uc.items():
        uc_str = next((u.uc_id for u in db.query(CasoDeUso).filter_by(id=uc_id_db).all()), uc_id_db)

        # Agrupa por grupo_or: AND entre grupos, OR dentro do grupo.
        # Ignora linhas com tipo='uses' — esses sao subfluxos automaticos, nao exigem avaliacao.
        grupos = {}  # grupo_or_num -> [pred_row]
        for r in lista_preds:
            if r.tipo == "uses":
                continue  # uses = subfluxo interno, satisfeito automaticamente
            grupos.setdefault(r.grupo_or, []).append(r)

        faltam = []
        for grupo_num, items in grupos.items():
            if grupo_num == 0:
                # AND: cada item deve ser satisfeito sozinho
                for it in items:
                    if not _predecessor_satisfeito(it, uc_ids_no_proprio_teste):
                        faltam.append(_label_predecessor(it, db))
            else:
                # OR: pelo menos um do grupo deve satisfazer
                algum_ok = any(
                    _predecessor_satisfeito(it, uc_ids_no_proprio_teste)
                    for it in items
                )
                if not algum_ok:
                    labels = " OU ".join(_label_predecessor(it, db) for it in items)
                    faltam.append(f"[{labels}]")

        if faltam:
            pendencias_por_uc.append({
                "uc_id": uc_str,
                "faltam": faltam,
            })

    if pendencias_por_uc:
        return False, {
            "ok": False,
            "pendencias": pendencias_por_uc,
            "msg": "Predecessores nao satisfeitos. Inclua os UCs predecessores neste teste.",
        }

    return True, {"ok": True, "msg": "Todos os predecessores satisfeitos"}


def _predecessor_satisfeito(pred_row, uc_ids_no_proprio_teste) -> bool:
    """Avalia 1 linha de uc_predecessores. Predecessor satisfeito SOMENTE se incluido no teste atual."""
    if pred_row.marcador:
        # Marcadores [login], [infra], [seed] sao considerados satisfeitos
        # (quem garante eh setup do ambiente, nao validacao de UC)
        return True
    if pred_row.predecessor_id:
        # UC concreto: satisfeito SOMENTE se incluido no teste atual.
        # Historico de execucoes passadas NAO conta — cada teste e isolado
        # (ciclo proprio com dados novos).
        return pred_row.predecessor_id in uc_ids_no_proprio_teste
    return False


def _label_predecessor(pred_row, db) -> str:
    if pred_row.marcador:
        return pred_row.marcador
    if pred_row.predecessor_id:
        uc = db.query(CasoDeUso).filter_by(id=pred_row.predecessor_id).first()
        return uc.uc_id if uc else "UC-?"
    return "?"


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


@app.route("/api/sprints/<sprint_id>/ucs-resumo")
@login_required
def api_sprint_ucs_resumo(sprint_id):
    """Lista UCs da sprint com contagem de CTs cadastrados (com passos).
    Pra UI de selecao por UC inteiro."""
    db = get_db()
    try:
        ucs = db.query(CasoDeUso).filter_by(sprint_id=sprint_id, ativo=1).order_by(CasoDeUso.uc_id).all()

        # Predecessores de cada UC
        preds_rows = (
            db.query(UcPredecessor)
            .filter(UcPredecessor.uc_id.in_([u.id for u in ucs]))
            .all()
        )
        preds_por_uc = {}
        for r in preds_rows:
            preds_por_uc.setdefault(r.uc_id, []).append(r)

        result = []
        for uc in ucs:
            cts = db.query(CasoDeTeste).filter_by(caso_de_uso_id=uc.id, ativo=1).all()
            n_total = len(cts)
            n_com_passos = sum(1 for c in cts if c.passos_tutorial)
            n_cenario_com_passos = sum(1 for c in cts
                                       if c.categoria == "Cenário"
                                       and c.trilha_sugerida == "visual"
                                       and c.passos_tutorial)

            # Mapeia predecessores em forma legivel.
            # satisfeito=False sempre — o frontend avalia satisfacao via UCs marcados
            # no proprio teste (cada teste e autocontido, historico nao conta).
            # Inclui tipo (depends|uses) e, se uses, o predecessor nao precisa estar marcado.
            preds_uc = preds_por_uc.get(uc.id, [])
            preds_lista = []
            for r in preds_uc:
                relacao = r.tipo or "depends"
                if r.marcador:
                    preds_lista.append({
                        "tipo": "marcador",
                        "label": r.marcador,
                        "satisfeito": True,  # marcadores [login]/[infra]/[seed] = sempre OK
                        "grupo_or": r.grupo_or,
                        "relacao": relacao,
                    })
                elif r.predecessor_id:
                    pred_uc = db.query(CasoDeUso).filter_by(id=r.predecessor_id).first()
                    pred_uc_str = pred_uc.uc_id if pred_uc else "?"
                    label = f"{pred_uc_str} (uses)" if relacao == "uses" else pred_uc_str
                    preds_lista.append({
                        "tipo": "uc",
                        "uc_id": pred_uc_str,
                        "label": label,
                        "satisfeito": relacao == "uses",  # uses = sempre OK; depends = avaliado pelo front
                        "grupo_or": r.grupo_or,
                        "relacao": relacao,
                    })

            result.append({
                "id": uc.id,
                "uc_id": uc.uc_id,
                "nome": uc.nome,
                "n_total_cts": n_total,
                "n_com_passos": n_com_passos,
                "n_cenario_visual_executavel": n_cenario_com_passos,
                "executavel": n_cenario_com_passos > 0,
                "ja_executado": False,  # historico nao conta — cada teste e autocontido
                "predecessores": preds_lista,
            })
        return jsonify({"sprint_id": sprint_id, "ucs": result})
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
    """Meus testes (admin ve todos via ?todos=1).

    Query params opcionais:
      ?sprint_anterior_a=<sprint_id> — filtra testes de Sprint estritamente
        anterior (numero menor) ao sprint dado. Usado pra dropdown de teste base.
      ?estado=<concluido> — filtra por estado.
    """
    todos = request.args.get("todos") == "1" and session.get("is_admin")
    sprint_anterior_a = request.args.get("sprint_anterior_a")
    estado_filtro = request.args.get("estado")
    db = get_db()
    try:
        _gc_zumbis(db)  # garante que estado mostrado e real
        q = db.query(Teste)
        if not todos:
            q = q.filter(Teste.user_id == session["user_id"])
        if estado_filtro:
            q = q.filter(Teste.estado == estado_filtro)
        if sprint_anterior_a:
            sprint_alvo = db.query(Sprint).filter_by(id=sprint_anterior_a).first()
            if sprint_alvo:
                # Sprint do teste base deve ter numero < sprint alvo
                from sqlalchemy.orm import aliased
                S = aliased(Sprint)
                # <= permite encadear lotes da mesma Sprint (ex: Lote B herda Lote A)
                q = q.join(S, Teste.sprint_id == S.id).filter(S.numero <= sprint_alvo.numero)
        rows = q.order_by(desc(Teste.atualizado_em)).limit(200).all()
        return jsonify([
            {
                "id": t.id, "titulo": t.titulo,
                "estado": t.estado, "ciclo_id": t.ciclo_id,
                "sprint_nome": t.sprint.nome if t.sprint else "-",
                "sprint_numero": t.sprint.numero if t.sprint else None,
                "tester": t.user.email if t.user else "-",
                "criado_em": t.criado_em.strftime("%Y-%m-%d %H:%M") if t.criado_em else None,
                "iniciado_em": t.iniciado_em.strftime("%Y-%m-%d %H:%M") if t.iniciado_em else None,
                "atualizado_em": t.atualizado_em.strftime("%Y-%m-%d %H:%M") if t.atualizado_em else None,
                "concluido_em": t.concluido_em.strftime("%Y-%m-%d %H:%M") if t.concluido_em else None,
                "n_cts": len(t.execucoes),
                "n_concluidos": sum(1 for e in t.execucoes if e.estado in ("aprovado", "reprovado", "pulado")),
                "teste_base_id": t.teste_base_id,
                "teste_base_titulo": t.teste_base.titulo if t.teste_base else None,
            }
            for t in rows
        ])
    finally:
        db.close()


@app.route("/api/testes", methods=["POST"])
@login_required
def api_teste_criar():
    """Cria teste por UCs (preferido) ou CTs individuais (legacy).

    Body:
      {titulo, sprint_id, uc_ids: [...]} -> expande pra todos os CTs
        Cenario+visual com passos cadastrados, em ordem do uc_id+ct_id.
      {titulo, sprint_id, ct_ids: [...]} -> legacy, aceita CTs individuais.

    Sempre gera ciclo unico via context_manager (CNPJ + valida<N> proprio).
    """
    data = request.get_json(silent=True) or {}
    titulo = (data.get("titulo") or "").strip()
    sprint_id = data.get("sprint_id")
    uc_ids = data.get("uc_ids") or []
    ct_ids = data.get("ct_ids") or []
    descricao = data.get("descricao") or None
    teste_base_id = data.get("teste_base_id")  # FK para teste Sprint anterior (heranca)

    if not titulo or not sprint_id or (not uc_ids and not ct_ids):
        return jsonify({"error": "titulo, sprint_id e uc_ids[] (ou ct_ids[]) obrigatorios"}), 400

    db = get_db()
    try:
        sprint = db.query(Sprint).filter_by(id=sprint_id, ativo=1).first()
        if not sprint:
            return jsonify({"error": "sprint invalida"}), 400

        # Validacao: Sprint > 1 obriga teste_base_id de Sprint anterior CONCLUIDO
        teste_base = None
        if sprint.numero > 1:
            if not teste_base_id:
                return jsonify({
                    "error": f"Sprint {sprint.numero} requer teste_base_id (teste de Sprint < {sprint.numero} ja concluido).",
                    "exige_teste_base": True,
                }), 400
            teste_base = db.query(Teste).filter_by(id=teste_base_id, user_id=session["user_id"]).first()
            if not teste_base:
                return jsonify({"error": "teste_base_id nao encontrado ou nao pertence ao usuario"}), 400
            if teste_base.estado != "concluido":
                return jsonify({
                    "error": f"Teste base esta '{teste_base.estado}'. Conclua-o antes de criar Sprint {sprint.numero}.",
                }), 400
            base_sprint = db.query(Sprint).filter_by(id=teste_base.sprint_id).first()
            # Aceita teste base de Sprint <= atual. Permite encadear lotes da
            # mesma Sprint (ex: Lote B Validacao herda do Lote A Captacao).
            if not base_sprint or base_sprint.numero > sprint.numero:
                return jsonify({
                    "error": f"Teste base deve ser de Sprint atual ou anterior (<= {sprint.numero}). Recebido: Sprint {base_sprint.numero if base_sprint else '?'}.",
                }), 400

        # Modo UC: expande pra todos os CTs Cenario+visual+com_passos
        if uc_ids:
            ucs = (
                db.query(CasoDeUso)
                .filter(CasoDeUso.id.in_(uc_ids), CasoDeUso.ativo == 1)
                .all()
            )
            if not ucs:
                return jsonify({"error": "nenhum UC valido encontrado"}), 400
            ucs = _ordenar_ucs_topologico(db, ucs)
            cts_ordenados = _expandir_uc_em_cts(db, ucs)
            if not cts_ordenados:
                return jsonify({"error": "Nenhum CT executavel nos UCs selecionados (precisam de passos cadastrados)"}), 400
            uc_ids_canonicos = [u.id for u in ucs]
        else:
            # Modo legacy: ct_ids diretos
            cts_raw = db.query(CasoDeTeste).filter(CasoDeTeste.id.in_(ct_ids), CasoDeTeste.ativo == 1).all()
            if not cts_raw:
                return jsonify({"error": "nenhum CT valido encontrado"}), 400
            ct_map = {c.id: c for c in cts_raw}
            cts_ordenados = [ct_map[cid] for cid in ct_ids if cid in ct_map]
            uc_ids_canonicos = list({c.caso_de_uso_id for c in cts_ordenados})

        # 1. Cria registro Teste
        teste = Teste(
            projeto_id=sprint.projeto_id, sprint_id=sprint.id,
            user_id=session["user_id"], titulo=titulo,
            descricao=descricao, uc_ids_canonicos=uc_ids_canonicos,
            ciclo_id=None, estado="criado",
            teste_base_id=teste_base_id if teste_base else None,
        )
        db.add(teste)
        db.flush()

        # 2. Provisiona rodada 1 (cria ciclo, aloca user, gera CNPJ, renderiza docs)
        # Se teste_base setado, herda ciclo do teste base (mesma empresa/user/dados).
        ciclo_base = None
        if teste_base:
            run_base = (db.query(RunTeste)
                .filter_by(teste_id=teste_base.id)
                .order_by(RunTeste.numero.desc()).first())
            if run_base:
                ciclo_base = run_base.ciclo_id
        run = _provisionar_rodada(db, teste, numero=1, sprint_numero=sprint.numero,
                                   reusar_de=ciclo_base)
        teste.ciclo_id = run.ciclo_id  # mantem campo legado em testes pra compat

        # 3. Cria execucoes_caso_de_teste apontando para a rodada 1
        for ordem, ct in enumerate(cts_ordenados, start=1):
            db.add(ExecucaoCasoDeTeste(
                teste_id=teste.id, run_id=run.id,
                caso_de_teste_id=ct.id,
                ordem=ordem, estado="pendente",
            ))
        db.commit()
        return jsonify({
            "ok": True,
            "teste_id": teste.id,
            "run_id": run.id,
            "run_numero": run.numero,
            "ciclo_id": run.ciclo_id,
            "n_cts": len(cts_ordenados),
        }), 201
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
        # Filtra execucoes pela rodada atual (default = ultima rodada)
        run = _rodada_atual(db, t)
        q = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=t.id)
        if run:
            q = q.filter_by(run_id=run.id)
        execs = q.order_by(ExecucaoCasoDeTeste.ordem).all()
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
                "sprint_id": t.sprint_id,
                "sprint_nome": t.sprint.nome if t.sprint else "-",
                "sprint_numero": t.sprint.numero if t.sprint else None,
                "projeto_nome": t.projeto.nome if t.projeto else "-",
                "tester": t.user.email if t.user else "-",
                "criado_em": t.criado_em.isoformat() if t.criado_em else None,
                "iniciado_em": t.iniciado_em.isoformat() if t.iniciado_em else None,
                "atualizado_em": t.atualizado_em.isoformat() if t.atualizado_em else None,
                "concluido_em": t.concluido_em.isoformat() if t.concluido_em else None,
                "pid_executor": t.pid_executor,
                "uc_ids_canonicos": t.uc_ids_canonicos or [],
                "teste_base_id": t.teste_base_id,
                "teste_base_titulo": t.teste_base.titulo if t.teste_base else None,
                "teste_base_sprint_numero": t.teste_base.sprint.numero if (t.teste_base and t.teste_base.sprint) else None,
            },
            "rodada_atual": {
                "id": run.id, "numero": run.numero, "estado": run.estado,
            } if run else None,
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


def _gc_zumbis(db):
    """Limpa testes com pid_executor preenchido mas processo morto.
    Chamado antes de iniciar/listar testes — evita PIDs zumbis trancarem o painel."""
    candidatos = (
        db.query(Teste)
        .filter(Teste.pid_executor.isnot(None))
        .all()
    )
    limpos = 0
    for t in candidatos:
        if not _is_pid_alive(t.pid_executor):
            t.pid_executor = None
            if t.estado == "em_andamento":
                t.estado = "pausado"
            limpos += 1
    if limpos:
        db.commit()
        print(f"[api] gc_zumbis: {limpos} PID(s) orfaos limpos")
    return limpos


@app.route("/api/testes/<teste_id>/iniciar", methods=["POST"])
@login_required
def api_teste_iniciar(teste_id):
    db = get_db()
    try:
        # GC: limpa PIDs zumbis (processos mortos sem o cleanup ter rodado)
        _gc_zumbis(db)

        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        if _is_pid_alive(t.pid_executor):
            return jsonify({"ok": False, "msg": f"executor ja rodando pid={t.pid_executor}"}), 409

        # Pre-flight: se teste tem teste_base_id, valida que base ainda esta concluido
        if t.teste_base_id:
            base = db.query(Teste).filter_by(id=t.teste_base_id).first()
            if not base:
                return jsonify({"ok": False, "msg": "Teste base referenciado nao encontrado."}), 409
            if base.estado != "concluido":
                return jsonify({
                    "ok": False,
                    "msg": f"Teste base '{base.titulo}' esta '{base.estado}'. Conclua-o antes de iniciar este teste."
                }), 409

        # Resolve rodada alvo: ?run_id= ou rodada atual (maior numero)
        run_id_param = request.args.get("run_id") or (request.get_json(silent=True) or {}).get("run_id")
        run_atual = _resolver_rodada(db, t, run_id_param)
        if not run_atual:
            return jsonify({"error": f"rodada nao encontrada (run_id={run_id_param}) ou teste sem rodadas"}), 404
        if run_atual.estado in ("cancelado",):
            return jsonify({"ok": False, "msg": f"rodada {run_atual.numero} esta '{run_atual.estado}'. Use /reiniciar para criar nova rodada."}), 409
        # Rodadas concluidas com pendentes (apos adicionar UCs) viram pausado automaticamente
        if run_atual.estado == "concluido":
            tem_pendente = db.query(ExecucaoCasoDeTeste).filter_by(run_id=run_atual.id, estado="pendente").count()
            if tem_pendente == 0:
                return jsonify({"ok": False, "msg": f"rodada {run_atual.numero} ja concluida sem CTs pendentes. Use /adicionar-ucs ou /reiniciar."}), 409
            run_atual.estado = "pausado"

        # Checagem global: painel :9876 e unico por maquina, so 1 teste pode estar rodando
        outro = (
            db.query(Teste)
            .filter(Teste.id != t.id, Teste.pid_executor.isnot(None))
            .all()
        )
        for o in outro:
            if _is_pid_alive(o.pid_executor):
                return jsonify({
                    "ok": False,
                    "msg": f"Ja ha outro teste rodando: '{o.titulo}' (PID {o.pid_executor}). Pause/cancele antes de iniciar este.",
                    "outro_teste_id": o.id,
                    "outro_titulo": o.titulo,
                }), 409

        # Pre-flight: se algum CT do teste tem acao upload_arquivo, exige pasta_documentos_teste
        precisa_pasta = _teste_precisa_pasta_documentos(db, t)
        if precisa_pasta:
            user = db.query(User).filter_by(id=t.user_id).first()
            if not user or not user.pasta_documentos_teste:
                return jsonify({
                    "ok": False,
                    "msg": "Este teste tem CTs com upload de arquivo. Configure a pasta de documentos em Configuracoes (botao ⚙ Config) antes de iniciar.",
                    "exige_configuracao": True,
                }), 409
            # Valida que a pasta ainda eh acessivel
            valido, det = _validar_pasta_documentos(user.pasta_documentos_teste)
            if not valido:
                return jsonify({
                    "ok": False,
                    "msg": f"Pasta de documentos invalida: {det.get('erro')}. Reconfigure em ⚙ Config.",
                    "exige_configuracao": True,
                    "detalhes": det,
                }), 409

        # Pre-flight de predecessores: cada UC do teste precisa ter seus
        # predecessores executados (no proprio teste OU no historico do user)
        ok_pred, det_pred = _validar_predecessores(db, t)
        if not ok_pred:
            return jsonify({
                "ok": False,
                "msg": det_pred.get("msg", "Predecessores nao satisfeitos"),
                "exige_predecessores": True,
                "pendencias": det_pred.get("pendencias", []),
            }), 409

        # Sincroniza testes.ciclo_id com a rodada que vai rodar — evita label
        # stale (ex: testes.ciclo_id apontava para r6 cancelada, mas estamos
        # rodando r5).
        if run_atual.ciclo_id and t.ciclo_id != run_atual.ciclo_id:
            t.ciclo_id = run_atual.ciclo_id
            db.commit()

        # Spawn executor_sprint1.py — passa run_id pra ele filtrar execucoes da rodada atual
        # Auto-login: se a rodada ja tem CTs aprovados (eh retomada apos sessao anterior
        # que ja fez login+criou empresa), passa --auto-login para o executor logar
        # antes do 1o passo. Sem isso, browser abre vazio porque tutoriais como UC-F03
        # comecam em "navegar para Configuracoes > Empresa" assumindo login feito.
        ja_tem_aprovados = db.query(ExecucaoCasoDeTeste).filter_by(
            run_id=run_atual.id, estado="aprovado"
        ).count() > 0
        # Heranca: se teste tem teste_base_id, herda contexto Sprint anterior
        # (mesmo user/empresa). Auto-login obrigatorio porque o user ja existe
        # e os tutoriais nao tem passo de "criar empresa via UI" (Sprint 1 ja fez).
        herda_de_base = bool(getattr(t, "teste_base_id", None))
        cmd = [
            sys.executable,
            str(_FW_VISUAL / "executor_sprint1.py"),
            "--teste_id", t.id,
            "--run_id", run_atual.id,
        ]
        if ja_tem_aprovados or herda_de_base:
            cmd.append("--auto-login")
            motivo = "ja tem aprovados" if ja_tem_aprovados else "herda de teste base"
            print(f"[api] rodada {run_atual.numero} {motivo} — passa --auto-login")
        log = open(f"/tmp/executor_{teste_id}.log", "w")
        # APP_BASE_URL: passa hostname pelo qual cliente acessou (X-Forwarded-Host).
        # Faz o Playwright (executor_sprint1) navegar pra http://<host>:5180 em vez de
        # localhost:5180 — Arnaldo de fora ve screenshots/elementos com URL externa.
        _host_header = request.headers.get("X-Forwarded-Host") or request.host or "localhost"
        _app_host = _host_header.split(":")[0]
        _exec_env = {
            **os.environ,
            "DISPLAY": os.environ.get("DISPLAY", ":0"),
            "APP_BASE_URL": f"http://{_app_host}:5180",
        }
        proc = subprocess.Popen(
            cmd, cwd=str(_PROJECT),
            stdout=log, stderr=subprocess.STDOUT,
            env=_exec_env,
        )
        # Atualiza pid+estado tanto no Teste (compat) quanto na RunTeste (canonico)
        t.pid_executor = proc.pid
        run_atual.pid_executor = proc.pid
        run_atual.estado = "em_andamento"
        if not run_atual.iniciado_em:
            run_atual.iniciado_em = datetime.now()
        db.commit()
        # painel_url usa o mesmo host externo (X-Forwarded-Host) que o browser do tutorial.
        return jsonify({
            "ok": True,
            "pid": proc.pid,
            "painel_url": f"http://{_app_host}:9876",
            "log_path": f"/tmp/executor_{teste_id}.log",
            "run_id": run_atual.id,
            "run_numero": run_atual.numero,
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
        # Cancela rodada alvo (ou atual se nao especificado)
        run_id_param = request.args.get("run_id") or (request.get_json(silent=True) or {}).get("run_id")
        run = _resolver_rodada(db, t, run_id_param)
        if run:
            run.estado = "cancelado"
            run.pid_executor = None
        db.commit()
        return jsonify({"ok": True, "run_id": run.id if run else None})
    finally:
        db.close()


# ============================================================
# Endpoints novos de gestao de rodadas (Modelo A)
# ============================================================

@app.route("/api/testes/<teste_id>/pausar", methods=["POST"])
@login_required
def api_teste_pausar(teste_id):
    """Pausa o teste enviando sinal pro painel parar gracioso.
    Diferente de cancelar: rodada vai pra 'pausado' e CTs pendentes ficam intactos."""
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        run_id_param = request.args.get("run_id") or (request.get_json(silent=True) or {}).get("run_id")
        run = _resolver_rodada(db, t, run_id_param)
        if not run or run.estado != "em_andamento":
            return jsonify({"ok": False, "msg": f"rodada nao esta em_andamento (estado atual={run.estado if run else 'nenhuma'})"}), 409
        # Manda sinal de parar no painel (ele seta evento_parar; executor termina CT atual e sai)
        try:
            import urllib.request as _ur
            req = _ur.Request("http://localhost:9876/parar", data=b"{}", method="POST",
                              headers={"Content-Type":"application/json"})
            _ur.urlopen(req, timeout=2)
        except Exception as e:
            print(f"[api] WARN: nao conseguiu falar com painel:9876: {e}")
        # Marca rodada como pausado IMEDIATAMENTE (executor confirma depois)
        run.estado = "pausado"
        t.estado = "pausado"
        db.commit()
        return jsonify({"ok": True, "run_id": run.id, "msg": "Sinal de pausa enviado. Executor termina o CT atual e para."})
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/retomar", methods=["POST"])
@login_required
def api_teste_retomar(teste_id):
    """Retoma teste pausado (continua de onde parou na MESMA rodada).
    Reusa o mesmo ciclo_id, mesmo usuario sintetico, mesma empresa.
    Aceita ?run_id= para escolher rodada especifica (default = rodada atual).
    Internamente eh como /iniciar mas com guarda de estado mais permissiva."""
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        run_id_param = request.args.get("run_id") or (request.get_json(silent=True) or {}).get("run_id")
        run = _resolver_rodada(db, t, run_id_param)
        if not run:
            return jsonify({"error": f"rodada nao encontrada (run_id={run_id_param}) ou teste sem rodadas"}), 404
        if run.estado not in ("pausado", "concluido"):
            return jsonify({"ok": False, "msg": f"so pode retomar rodada pausada/concluida (estado atual={run.estado})"}), 409
        tem_pendente = db.query(ExecucaoCasoDeTeste).filter_by(run_id=run.id, estado="pendente").count()
        if tem_pendente == 0:
            return jsonify({"ok": False, "msg": "rodada nao tem CTs pendentes. Use /adicionar-ucs ou /reiniciar."}), 409
    finally:
        db.close()
    # Delega para api_teste_iniciar (mesmo fluxo)
    return api_teste_iniciar(teste_id)


@app.route("/api/testes/<teste_id>/adicionar-ucs", methods=["POST"])
@login_required
def api_teste_adicionar_ucs(teste_id):
    """Adiciona UCs ao teste (nova rodada NAO eh criada — insere ExecucaoCasoDeTeste
    apontando para a rodada atual ou rodada especificada).
    So permitido se rodada NAO esta em_andamento.
    Body: {uc_ids: ["uuid1", ...], run_id?: "uuid"}
    Tambem aceita ?run_id= via query string."""
    data = request.get_json(silent=True) or {}
    novos_uc_ids = data.get("uc_ids") or []
    if not novos_uc_ids:
        return jsonify({"error": "uc_ids[] obrigatorio"}), 400
    run_id_param = request.args.get("run_id") or data.get("run_id")
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        run = _resolver_rodada(db, t, run_id_param)
        if not run:
            return jsonify({"error": f"rodada nao encontrada (run_id={run_id_param}) ou teste sem rodadas"}), 404
        if run.estado == "em_andamento":
            return jsonify({"ok": False, "msg": f"rodada {run.numero} em_andamento — pause antes de adicionar UCs"}), 409

        # Filtra UCs ja existentes na rodada atual
        ucs_existentes_ids = set(
            r[0] for r in
            db.query(CasoDeTeste.caso_de_uso_id)
            .join(ExecucaoCasoDeTeste, ExecucaoCasoDeTeste.caso_de_teste_id == CasoDeTeste.id)
            .filter(ExecucaoCasoDeTeste.run_id == run.id)
            .distinct().all()
        )
        novos_uc_ids = [u for u in novos_uc_ids if u not in ucs_existentes_ids]
        if not novos_uc_ids:
            return jsonify({"ok": False, "msg": "todos os UCs ja estao na rodada atual"}), 400

        ucs = db.query(CasoDeUso).filter(CasoDeUso.id.in_(novos_uc_ids), CasoDeUso.ativo == 1).all()
        if not ucs:
            return jsonify({"error": "nenhum UC valido encontrado"}), 400
        # Resolve dependencias considerando UCs JA existentes na rodada como satisfeitos
        # Seleciona TODOS os UCs (existentes + novos) e ordena, mas insere so os novos.
        todos_ucs_ids = list(ucs_existentes_ids) + [u.id for u in ucs]
        todos_ucs = db.query(CasoDeUso).filter(CasoDeUso.id.in_(todos_ucs_ids)).all()
        ordenados = _ordenar_ucs_topologico(db, todos_ucs)
        # Filtra so os novos preservando ordem topologica
        novos_set = {u.id for u in ucs}
        ucs_novos_ord = [u for u in ordenados if u.id in novos_set]
        cts_novos = _expandir_uc_em_cts(db, ucs_novos_ord)
        if not cts_novos:
            return jsonify({"error": "Nenhum CT executavel nos UCs adicionados"}), 400

        # Proximo numero de ordem na rodada
        max_ord = db.query(ExecucaoCasoDeTeste).filter_by(run_id=run.id).count()
        for i, ct in enumerate(cts_novos, start=1):
            db.add(ExecucaoCasoDeTeste(
                teste_id=t.id, run_id=run.id, caso_de_teste_id=ct.id,
                ordem=max_ord + i, estado="pendente",
            ))

        # Atualiza uc_ids_canonicos do teste
        canonicos = list(t.uc_ids_canonicos or [])
        for uc_id in novos_uc_ids:
            if uc_id not in canonicos:
                canonicos.append(uc_id)
        t.uc_ids_canonicos = canonicos

        # Se rodada estava concluida, volta pra pausado
        if run.estado == "concluido":
            run.estado = "pausado"
            run.concluido_em = None
            # Sincroniza estado do teste APENAS se a rodada modificada eh a atual
            rodada_atual = _rodada_atual(db, t)
            if rodada_atual and rodada_atual.id == run.id:
                t.estado = "pausado"

        db.commit()
        return jsonify({
            "ok": True,
            "run_id": run.id,
            "uc_ids_adicionados": novos_uc_ids,
            "n_cts_adicionados": len(cts_novos),
        })
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/reiniciar", methods=["POST"])
@login_required
def api_teste_reiniciar(teste_id):
    """Cria uma NOVA rodada para o teste, com novo ciclo_id, novo usuario sintetico,
    nova empresa DEMO. Reaproveita uc_ids_canonicos do teste para criar execucoes pendentes.
    Rodada anterior eh preservada como historico."""
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403

        run_atual = _rodada_atual(db, t)
        if run_atual and run_atual.estado == "em_andamento":
            return jsonify({"ok": False, "msg": "rodada atual em_andamento — pause/cancele antes de reiniciar"}), 409

        # Marca rodada anterior como concluida (se estava pausado/criado) — fica no historico
        if run_atual and run_atual.estado in ("pausado", "criado"):
            run_atual.estado = "concluido"
            run_atual.concluido_em = run_atual.concluido_em or datetime.now()

        # Cria nova rodada com numero+1
        novo_numero = (run_atual.numero if run_atual else 0) + 1
        sprint = db.query(Sprint).filter_by(id=t.sprint_id).first()
        # Se teste tem teste_base_id (Sprint > 1), HERDA ciclo do teste base
        reusar_ciclo = None
        if t.teste_base_id:
            base = db.query(Teste).filter_by(id=t.teste_base_id).first()
            if base:
                run_base = (db.query(RunTeste)
                            .filter_by(teste_id=base.id, estado="concluido")
                            .order_by(RunTeste.numero.desc()).first())
                if run_base:
                    reusar_ciclo = run_base.ciclo_id
        nova_run = _provisionar_rodada(db, t, numero=novo_numero,
                                       sprint_numero=sprint.numero if sprint else 1,
                                       reusar_de=reusar_ciclo)

        # Recupera UCs canônicos e cria execucoes pendentes na nova rodada
        ucs_canonicos = t.uc_ids_canonicos or []
        if not ucs_canonicos:
            return jsonify({"error": "teste sem uc_ids_canonicos — nada para recriar"}), 500
        ucs = db.query(CasoDeUso).filter(CasoDeUso.id.in_(ucs_canonicos), CasoDeUso.ativo == 1).all()
        if not ucs:
            return jsonify({"error": "nenhum UC canonico ativo"}), 400
        ucs_ord = _ordenar_ucs_topologico(db, ucs)
        cts = _expandir_uc_em_cts(db, ucs_ord)
        if not cts:
            return jsonify({"error": "nenhum CT executavel nos UCs canonicos"}), 400
        for ordem, ct in enumerate(cts, start=1):
            db.add(ExecucaoCasoDeTeste(
                teste_id=t.id, run_id=nova_run.id, caso_de_teste_id=ct.id,
                ordem=ordem, estado="pendente",
            ))

        # Sincroniza estado do teste com a nova rodada
        t.estado = "criado"
        t.ciclo_id = nova_run.ciclo_id
        t.pid_executor = None

        db.commit()
        return jsonify({
            "ok": True,
            "run_id": nova_run.id,
            "run_numero": nova_run.numero,
            "ciclo_id": nova_run.ciclo_id,
            "user_sintetico_email": nova_run.user_sintetico_email,
            "empresa_demo_cnpj": nova_run.empresa_demo_cnpj,
            "n_cts": len(cts),
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/runs")
@login_required
def api_teste_runs(teste_id):
    """Lista todas as rodadas de um teste com sumario de cada uma."""
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        runs = db.query(RunTeste).filter_by(teste_id=t.id).order_by(RunTeste.numero).all()
        result = []
        for r in runs:
            execs = db.query(ExecucaoCasoDeTeste).filter_by(run_id=r.id).all()
            n_total = len(execs)
            n_aprov = sum(1 for e in execs if e.veredicto_po == "APROVADO")
            n_reprov = sum(1 for e in execs if e.veredicto_po == "REPROVADO")
            n_pend = sum(1 for e in execs if e.estado == "pendente")
            # Conta passos+observacoes
            n_passos = (
                db.query(PassoExecucao)
                .join(ExecucaoCasoDeTeste, ExecucaoCasoDeTeste.id == PassoExecucao.execucao_id)
                .filter(ExecucaoCasoDeTeste.run_id == r.id).count()
            )
            n_obs = (
                db.query(Observacao)
                .join(PassoExecucao, PassoExecucao.id == Observacao.passo_execucao_id)
                .join(ExecucaoCasoDeTeste, ExecucaoCasoDeTeste.id == PassoExecucao.execucao_id)
                .filter(ExecucaoCasoDeTeste.run_id == r.id).count()
            )
            result.append({
                "id": r.id, "numero": r.numero, "ciclo_id": r.ciclo_id,
                "estado": r.estado,
                "user_sintetico_email": r.user_sintetico_email,
                "empresa_demo_cnpj": r.empresa_demo_cnpj,
                "empresa_demo_razao": r.empresa_demo_razao,
                "iniciado_em": r.iniciado_em.isoformat() if r.iniciado_em else None,
                "concluido_em": r.concluido_em.isoformat() if r.concluido_em else None,
                "n_cts": n_total,
                "n_cts_aprovados": n_aprov,
                "n_cts_reprovados": n_reprov,
                "n_cts_pendentes": n_pend,
                "n_passos": n_passos,
                "n_observacoes": n_obs,
            })
        return jsonify({"teste_id": t.id, "rodadas": result})
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/ciclo")
@login_required
def api_teste_ciclo(teste_id):
    """Retorna informacoes do contexto do ciclo da rodada atual (ou rodada especifica via ?run_id=...)."""
    db = get_db()
    try:
        t = db.query(Teste).filter_by(id=teste_id).first()
        if not t:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or t.user_id == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        run_id = request.args.get("run_id")
        if run_id:
            run = db.query(RunTeste).filter_by(id=run_id, teste_id=t.id).first()
        else:
            run = _rodada_atual(db, t)
        if not run:
            return jsonify({"error": "rodada nao encontrada"}), 404
        ctx = _ler_contexto_yaml(run.ciclo_id) or {}
        # Prefixo da empresa DEMO pra buscar no banco editais
        # Empresas seguem o padrao: "DEMO <ciclo_short> Comercio e Representacoes Ltda"
        # onde ciclo_short = primeira parte do ciclo_id (ex: teste-f425e4dd -> f425e4dd)
        razao_prefix = None
        if run.empresa_demo_razao:
            razao_prefix = run.empresa_demo_razao.split(" Comércio")[0].split(" Comercio")[0]
        elif run.ciclo_id:
            # Fallback para testes legados sem empresa_demo_razao gravada
            ciclo_short = run.ciclo_id.split("_")[0].replace("-", "")
            # Tira o "teste" prefixo para ficar igual ao usado em renderizar_todos
            ciclo_short = ciclo_short.replace("teste", "")
            razao_prefix = f"DEMO {ciclo_short}"
        dados_editais = _coletar_dados_ciclo_no_editais(razao_prefix)
        evid_dirs = []
        try:
            rel_dir = _PROJECT / "testes" / "relatorios" / "visual"
            if rel_dir.exists():
                prefix = f"teste_{t.id[:8]}_"
                for d in rel_dir.iterdir():
                    if d.is_dir() and d.name.startswith(prefix):
                        evid_dirs.append(str(d.relative_to(_PROJECT)))
        except Exception:
            pass
        return jsonify({
            "rodada": {
                "id": run.id, "numero": run.numero, "ciclo_id": run.ciclo_id,
                "estado": run.estado,
                "iniciado_em": run.iniciado_em.isoformat() if run.iniciado_em else None,
                "concluido_em": run.concluido_em.isoformat() if run.concluido_em else None,
            },
            "usuario_sintetico": {
                "email": run.user_sintetico_email,
                "id": run.user_sintetico_id,
            },
            "empresa_planejada": {
                "cnpj": run.empresa_demo_cnpj,
                "razao": run.empresa_demo_razao,
            },
            "empresa_real_no_editais": dados_editais,
            "contexto_yaml_path": f"testes/contextos/{run.ciclo_id}/contexto.yaml",
            "evidencias_dirs": evid_dirs,
        })
    finally:
        db.close()


@app.route("/api/runs/<run_id>/relatorio")
@login_required
def api_run_relatorio(run_id):
    """Relatorio JSON escopado a uma rodada especifica."""
    db = get_db()
    try:
        run = db.query(RunTeste).filter_by(id=run_id).first()
        if not run:
            return jsonify({"error": "nao encontrado"}), 404
        d = _montar_relatorio_dict(db, run.teste_id, run_id=run_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        return jsonify(d)
    finally:
        db.close()


@app.route("/api/runs/<run_id>/relatorio.md")
@login_required
def api_run_relatorio_md(run_id):
    from flask import send_file
    sys.path.insert(0, str(_FW_VISUAL / "api"))
    from exporters import gerar_md
    db = get_db()
    try:
        run = db.query(RunTeste).filter_by(id=run_id).first()
        if not run:
            return jsonify({"error": "nao encontrado"}), 404
        d = _montar_relatorio_dict(db, run.teste_id, run_id=run_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        body = gerar_md(d)
        nome = f"relatorio_{_slug_titulo(d['teste'].get('titulo'))}_r{run.numero}_{run_id[:8]}.md"
        return send_file(io.BytesIO(body), mimetype="text/markdown; charset=utf-8",
                         as_attachment=True, download_name=nome)
    finally:
        db.close()


@app.route("/api/runs/<run_id>/relatorio.docx")
@login_required
def api_run_relatorio_docx(run_id):
    from flask import send_file
    sys.path.insert(0, str(_FW_VISUAL / "api"))
    from exporters import gerar_docx
    db = get_db()
    try:
        run = db.query(RunTeste).filter_by(id=run_id).first()
        if not run:
            return jsonify({"error": "nao encontrado"}), 404
        d = _montar_relatorio_dict(db, run.teste_id, run_id=run_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        body = gerar_docx(d)
        nome = f"relatorio_{_slug_titulo(d['teste'].get('titulo'))}_r{run.numero}_{run_id[:8]}.docx"
        return send_file(io.BytesIO(body),
                         mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                         as_attachment=True, download_name=nome)
    finally:
        db.close()


@app.route("/api/runs/<run_id>/relatorio.pdf")
@login_required
def api_run_relatorio_pdf(run_id):
    from flask import send_file
    sys.path.insert(0, str(_FW_VISUAL / "api"))
    from exporters import gerar_pdf
    db = get_db()
    try:
        run = db.query(RunTeste).filter_by(id=run_id).first()
        if not run:
            return jsonify({"error": "nao encontrado"}), 404
        d = _montar_relatorio_dict(db, run.teste_id, run_id=run_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        body = gerar_pdf(d)
        nome = f"relatorio_{_slug_titulo(d['teste'].get('titulo'))}_r{run.numero}_{run_id[:8]}.pdf"
        return send_file(io.BytesIO(body), mimetype="application/pdf",
                         as_attachment=True, download_name=nome)
    finally:
        db.close()


# ============================================================
# Helpers de rodadas (runs)
# ============================================================

def _provisionar_rodada(db, teste: "Teste", numero: int, sprint_numero: int,
                        reusar_de: str | None = None) -> "RunTeste":
    """Provisiona uma nova rodada para um teste:
    - Se reusar_de=<ciclo_id_base> setado: HERDA contexto do ciclo base (mesma
      empresa/user/dados). Usado quando teste declara teste_base_id (Sprint > 1).
    - Senao: cria ciclo novo (criar_ciclo aloca novo user sintetico + CNPJ).
    - Cria registro RunTeste e salva infos do contexto.

    Retorna o RunTeste criado (ainda nao commited — caller faz commit).
    """
    if numero == 1:
        ciclo_id = f"teste-{teste.id[:8]}"
    else:
        ciclo_id = f"teste-{teste.id[:8]}-r{numero}"

    user_email = None
    user_id_sintetico = None
    cnpj = None
    razao = None
    sys.path.insert(0, str(_PROJECT / "testes" / "framework_provisionamento"))

    if reusar_de:
        # HERANCA: le contexto.yaml do ciclo base. Mesmo user/empresa.
        try:
            from context_manager import carregar_ciclo  # type: ignore
            ctx_base = carregar_ciclo(reusar_de)
            v = ctx_base.get("trilhas", {}).get("visual", {})
            user_email = v.get("usuario", {}).get("email")
            user_id_sintetico = v.get("usuario", {}).get("id")
            emp = v.get("empresa", {})
            cnpj = emp.get("cnpj_pretendido")
            razao = emp.get("razao_social_pretendida")
            # Reusa o MESMO ciclo_id (aponta pro mesmo dir contextos/) — todos os
            # testes que herdam compartilham o mesmo contexto fisicamente.
            ciclo_id = reusar_de
            print(f"[api] rodada {numero} HERDA ciclo {ciclo_id}: user={user_email} cnpj={cnpj}")
        except Exception as e:
            print(f"[api] ERRO ao herdar ciclo {reusar_de}: {e} — caindo pra criar_ciclo")
            reusar_de = None  # forca fallback

    if not reusar_de:
        try:
            from context_manager import criar_ciclo  # type: ignore
            ctx = criar_ciclo(
                ciclo_id=ciclo_id,
                ambiente="agenteditais",
                precisa_editais=False,
                sprints_no_ciclo=[sprint_numero],
            )
            v = ctx.get("trilhas", {}).get("visual", {})
            user_email = v.get("usuario", {}).get("email")
            user_id_sintetico = v.get("usuario", {}).get("id")
            emp = v.get("empresa", {})
            cnpj = emp.get("cnpj_pretendido")
            razao = emp.get("razao_social_pretendida")
            print(f"[api] rodada {numero} ciclo {ciclo_id}: user={user_email} cnpj={cnpj}")
        except FileExistsError:
            print(f"[api] ciclo {ciclo_id} ja existia — reusando")
        except Exception as e:
            print(f"[api] WARN: falha ao provisionar ciclo {ciclo_id}: {e}")

    run = RunTeste(
        teste_id=teste.id, numero=numero, ciclo_id=ciclo_id,
        user_sintetico_email=user_email, user_sintetico_id=user_id_sintetico,
        empresa_demo_cnpj=cnpj, empresa_demo_razao=razao,
        estado="criado",
    )
    db.add(run)
    db.flush()
    return run


def _rodada_atual(db, teste: "Teste") -> "RunTeste | None":
    """Retorna a rodada atual (maior numero) do teste, ou None se nao houver."""
    return (
        db.query(RunTeste)
        .filter_by(teste_id=teste.id)
        .order_by(RunTeste.numero.desc())
        .first()
    )


def _resolver_rodada(db, teste: "Teste", run_id_opcional: str | None = None) -> "RunTeste | None":
    """Resolve qual rodada o caller quer operar.
    Se run_id_opcional for passado: valida que pertence ao teste e retorna.
    Se nao: retorna a rodada atual (maior numero) — compat com comportamento antigo.
    Retorna None se nao houver rodada ou se run_id passado nao pertence ao teste.
    """
    if run_id_opcional:
        return db.query(RunTeste).filter_by(id=run_id_opcional, teste_id=teste.id).first()
    return _rodada_atual(db, teste)


def _ordenar_ucs_topologico(db, ucs):
    """Ordena UCs topologicamente por predecessores depends. Empate = uc_id alfabetico."""
    preds_rows = (
        db.query(UcPredecessor)
        .filter(UcPredecessor.uc_id.in_([u.id for u in ucs]),
                UcPredecessor.tipo == "depends",
                UcPredecessor.predecessor_id.isnot(None))
        .all()
    )
    uc_id_set = {u.id for u in ucs}
    deps = {u.id: set() for u in ucs}
    for r in preds_rows:
        if r.predecessor_id in uc_id_set:
            deps[r.uc_id].add(r.predecessor_id)
    uc_by_id = {u.id: u for u in ucs}
    ordenados = []
    visitados = set()
    def visitar(uid):
        if uid in visitados:
            return
        visitados.add(uid)
        for d in sorted(deps[uid], key=lambda x: uc_by_id[x].uc_id):
            visitar(d)
        ordenados.append(uc_by_id[uid])
    for uid in sorted(uc_by_id, key=lambda x: uc_by_id[x].uc_id):
        visitar(uid)
    return ordenados


def _expandir_uc_em_cts(db, ucs):
    """Para cada UC, expande em CTs Cenário+visual com passos cadastrados.
    Mantém ordem dos UCs (caller deve passar topologicamente ordenados)."""
    cts_ordenados = []
    for uc in ucs:
        cts_uc = (
            db.query(CasoDeTeste)
            .filter_by(caso_de_uso_id=uc.id, ativo=1,
                       categoria="Cenário", trilha_sugerida="visual")
            .order_by(CasoDeTeste.ct_id)
            .all()
        )
        for c in cts_uc:
            if c.passos_tutorial:
                cts_ordenados.append(c)
    return cts_ordenados


def _ler_contexto_yaml(ciclo_id: str) -> dict | None:
    """Le testes/contextos/<ciclo_id>/contexto.yaml. Retorna None se nao existe."""
    if not ciclo_id:
        return None
    path = _PROJECT / "testes" / "contextos" / ciclo_id / "contexto.yaml"
    if not path.exists():
        return None
    try:
        import yaml as _yaml
        with open(path, "r", encoding="utf-8") as f:
            return _yaml.safe_load(f)
    except Exception as e:
        print(f"[api] erro lendo {path}: {e}")
        return None


def _coletar_dados_ciclo_no_editais(razao_demo_prefix: str | None) -> dict:
    """Vai no banco editais (aplicacao) e coleta empresa/hierarquia/vinculos.
    Retorna dict vazio se nao achar."""
    if not razao_demo_prefix:
        return {}
    try:
        import mysql.connector
        host = os.getenv("MYSQL_HOST", "camerascasas.no-ip.info")
        port = int(os.getenv("MYSQL_PORT", "3308"))
        user = os.getenv("MYSQL_USER", "producao")
        password = os.getenv("MYSQL_PASSWORD", "")
        conn = mysql.connector.connect(
            host=host, port=port, user=user, password=password, database="editais"
        )
        c = conn.cursor()
        # Empresas no banco editais nao tem timestamp de criacao — busca a ultima
        # criada via id descendente (UUIDs costumam ordenar aproximadamente por tempo)
        c.execute("SELECT id, razao_social, cnpj, area_padrao_id, emails, telefone "
                  "FROM empresas WHERE razao_social LIKE %s ORDER BY id DESC LIMIT 1",
                  (f"{razao_demo_prefix}%",))
        r = c.fetchone()
        if not r:
            conn.close()
            return {}
        emp_id, razao, cnpj, area_padrao_id, emails, telefone = r
        # Conta hierarquia
        c.execute("""
            SELECT COUNT(DISTINCT a.id), COUNT(DISTINCT cl.id), COUNT(DISTINCT sc.id)
            FROM areas_produto a
            LEFT JOIN classes_produto_v2 cl ON cl.area_id = a.id
            LEFT JOIN subclasses_produto sc ON sc.classe_id = cl.id
            WHERE a.empresa_id = %s
        """, (emp_id,))
        n_areas, n_classes, n_subclasses = c.fetchone() or (0, 0, 0)
        # Conta vinculos
        c.execute("SELECT COUNT(*) FROM usuario_empresa WHERE empresa_id=%s", (emp_id,))
        n_vinculos = (c.fetchone() or [0])[0]
        # Area padrao nome
        area_padrao_nome = None
        if area_padrao_id:
            c.execute("SELECT nome FROM areas_produto WHERE id=%s", (area_padrao_id,))
            ap = c.fetchone()
            area_padrao_nome = ap[0] if ap else None
        conn.close()
        return {
            "empresa_id_no_editais": emp_id,
            "razao_social": razao,
            "cnpj": cnpj,
            "area_padrao_id": area_padrao_id,
            "area_padrao_nome": area_padrao_nome,
            "emails": emails,
            "telefone": telefone,
            "hierarquia": {"areas": n_areas, "classes": n_classes, "subclasses": n_subclasses},
            "vinculos_usuario_empresa": n_vinculos,
        }
    except Exception as e:
        print(f"[api] erro consultando banco editais: {e}")
        return {}


def _montar_relatorio_dict(db, teste_id: str, run_id: str | None = None) -> dict | None:
    """Monta o dict do relatorio a partir do banco. Retorna None se teste nao encontrado.
    Usa em /relatorio (JSON) e nos exporters (md/docx/pdf).

    Se run_id for None, devolve relatorio da rodada ATUAL (maior numero).
    Se for "todos", devolve execucoes de TODAS as rodadas (modo consolidado).
    Caso contrario, escopa pela rodada especifica.
    """
    import json as _json
    t = db.query(Teste).filter_by(id=teste_id).first()
    if not t:
        return None
    # Define run-alvo
    rodada_alvo = None
    if run_id == "todos":
        rodada_alvo = "todos"
    elif run_id:
        rodada_alvo = db.query(RunTeste).filter_by(id=run_id, teste_id=t.id).first()
        if not rodada_alvo:
            return None
    else:
        rodada_alvo = _rodada_atual(db, t)
    # Carrega execucoes
    q = db.query(ExecucaoCasoDeTeste).filter_by(teste_id=t.id)
    if isinstance(rodada_alvo, RunTeste):
        q = q.filter_by(run_id=rodada_alvo.id)
    elif rodada_alvo == "todos":
        pass  # sem filtro adicional
    # Sem rodada (caso impossivel apos migration mas defensivo): retorna sem execucoes
    execs = q.order_by(ExecucaoCasoDeTeste.ordem).all()
    result_execs = []
    for e in execs:
        ct = e.caso_de_teste
        passos = db.query(PassoExecucao).filter_by(execucao_id=e.id).order_by(PassoExecucao.ordem).all()
        # Mapa de passo_tutorial por (ct_id, passo_id) pra incluir descricao_painel + pontos + acoes
        tut_map = {}
        if ct:
            for pt in db.query(PassoTutorial).filter_by(caso_de_teste_id=ct.id).all():
                tut_map[pt.passo_id] = pt
        passos_view = []
        for p in passos:
            obs = db.query(Observacao).filter_by(passo_execucao_id=p.id).order_by(Observacao.criado_em).all()
            tut = tut_map.get(p.passo_id)
            # pontos_observacao e acoes_json: SQLAlchemy ja deserializa colunas JSON
            # automaticamente (vem como list/dict). Mas se o type da coluna for TEXT
            # podem vir como string. Trata os dois casos.
            pontos_list = []
            acoes_list = []
            descricao_painel = None
            if tut:
                descricao_painel = tut.descricao_painel
                raw_pontos = tut.pontos_observacao
                if isinstance(raw_pontos, list):
                    pontos_list = raw_pontos
                elif isinstance(raw_pontos, str) and raw_pontos.strip():
                    try:
                        v = _json.loads(raw_pontos)
                        pontos_list = v if isinstance(v, list) else []
                    except Exception:
                        pontos_list = []
                raw_acoes = tut.acoes_json
                if isinstance(raw_acoes, list):
                    acoes_list = raw_acoes
                elif isinstance(raw_acoes, str) and raw_acoes.strip():
                    try:
                        v = _json.loads(raw_acoes)
                        acoes_list = v if isinstance(v, list) else []
                    except Exception:
                        acoes_list = []
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
                # Novo: instrucoes do tutorial
                "descricao_painel": descricao_painel,
                "pontos_observacao": pontos_list,
                "acoes": acoes_list,
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
    # Lista de rodadas pra navegacao no frontend
    rodadas = (
        db.query(RunTeste).filter_by(teste_id=t.id)
        .order_by(RunTeste.numero).all()
    )
    rodadas_resumo = [
        {
            "id": r.id, "numero": r.numero, "ciclo_id": r.ciclo_id,
            "estado": r.estado,
            "user_sintetico_email": r.user_sintetico_email,
            "empresa_demo_cnpj": r.empresa_demo_cnpj,
            "iniciado_em": r.iniciado_em.isoformat() if r.iniciado_em else None,
            "concluido_em": r.concluido_em.isoformat() if r.concluido_em else None,
        } for r in rodadas
    ]
    rodada_corrente_id = None
    rodada_corrente_numero = None
    if isinstance(rodada_alvo, RunTeste):
        rodada_corrente_id = rodada_alvo.id
        rodada_corrente_numero = rodada_alvo.numero
    return {
        "teste": {
            "id": t.id, "titulo": t.titulo, "estado": t.estado,
            "ciclo_id": t.ciclo_id,
            "sprint_nome": t.sprint.nome if t.sprint else "-",
            "tester": t.user.email if t.user else "-",
            "iniciado_em": t.iniciado_em.isoformat() if t.iniciado_em else None,
            "concluido_em": t.concluido_em.isoformat() if t.concluido_em else None,
            "user_id": t.user_id,
        },
        "rodada_atual": {
            "id": rodada_corrente_id,
            "numero": rodada_corrente_numero,
        },
        "rodadas": rodadas_resumo,
        "execucoes": result_execs,
        "relatorio_md": rel.conteudo_md if rel else None,
    }


def _slug_titulo(s: str) -> str:
    import re
    s = re.sub(r"[^A-Za-z0-9_-]+", "_", (s or "relatorio").strip())
    return s[:80].strip("_") or "relatorio"


@app.route("/api/testes/<teste_id>/relatorio")
@login_required
def api_teste_relatorio(teste_id):
    db = get_db()
    try:
        d = _montar_relatorio_dict(db, teste_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        # Nao expor user_id no JSON publico
        d["teste"].pop("user_id", None)
        return jsonify(d)
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/relatorio.md")
@login_required
def api_teste_relatorio_md(teste_id):
    from flask import send_file
    sys.path.insert(0, str(_FW_VISUAL / "api")); from exporters import gerar_md
    db = get_db()
    try:
        d = _montar_relatorio_dict(db, teste_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        body = gerar_md(d)
        nome = f"relatorio_{_slug_titulo(d['teste'].get('titulo'))}_{teste_id[:8]}.md"
        return send_file(io.BytesIO(body), mimetype="text/markdown; charset=utf-8",
                         as_attachment=True, download_name=nome)
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/relatorio.docx")
@login_required
def api_teste_relatorio_docx(teste_id):
    from flask import send_file
    sys.path.insert(0, str(_FW_VISUAL / "api")); from exporters import gerar_docx
    db = get_db()
    try:
        d = _montar_relatorio_dict(db, teste_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        body = gerar_docx(d)
        nome = f"relatorio_{_slug_titulo(d['teste'].get('titulo'))}_{teste_id[:8]}.docx"
        return send_file(io.BytesIO(body),
                         mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                         as_attachment=True, download_name=nome)
    finally:
        db.close()


@app.route("/api/testes/<teste_id>/relatorio.pdf")
@login_required
def api_teste_relatorio_pdf(teste_id):
    from flask import send_file
    sys.path.insert(0, str(_FW_VISUAL / "api")); from exporters import gerar_pdf
    db = get_db()
    try:
        d = _montar_relatorio_dict(db, teste_id)
        if d is None:
            return jsonify({"error": "nao encontrado"}), 404
        if not (session.get("is_admin") or d["teste"].get("user_id") == session["user_id"]):
            return jsonify({"error": "acesso negado"}), 403
        d["teste"].pop("user_id", None)
        body = gerar_pdf(d)
        nome = f"relatorio_{_slug_titulo(d['teste'].get('titulo'))}_{teste_id[:8]}.pdf"
        return send_file(io.BytesIO(body), mimetype="application/pdf",
                         as_attachment=True, download_name=nome)
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
