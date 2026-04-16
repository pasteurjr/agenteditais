"""
Sprint 6 — Audit Middleware transversal.
Registra hooks before/after_request que gravam AuditoriaLog
para todas as mutações em /api/crud/* e endpoints sensíveis.
"""
from flask import request, g
from rn_audit import log_transicao


AUDITED_PREFIXES = (
    "/api/crud/",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/smtp/",
    "/api/empresas/",
)

SENSITIVE_ACTIONS = {
    ("smtp-config", "update"),
    ("smtp-config", "create"),
    ("smtp-config", "delete"),
    ("users", "update"),
    ("empresas", "delete"),
    ("contratos", "delete"),
    ("propostas", "delete"),
    ("parametros-score", "update"),
}


def _should_audit(path: str) -> bool:
    return any(path.startswith(p) for p in AUDITED_PREFIXES)


def _method_to_acao(method: str) -> str:
    return {
        "POST": "create",
        "PUT": "update",
        "PATCH": "update",
        "DELETE": "delete",
    }.get(method, method.lower())


def _extract_entidade(path: str) -> str:
    parts = path.rstrip("/").split("/")
    if "/api/crud/" in path and len(parts) >= 4:
        return parts[3]
    if "/api/auth/" in path:
        return "auth"
    if "/api/smtp/" in path:
        return "smtp"
    if "/api/empresas/" in path:
        return "empresa"
    return "unknown"


def _extract_id(path: str) -> str | None:
    parts = path.rstrip("/").split("/")
    if len(parts) >= 5:
        candidate = parts[4]
        if len(candidate) >= 8 and "-" in candidate:
            return candidate
    return None


def _is_sensitive(entidade: str, acao: str) -> bool:
    return (entidade, acao) in SENSITIVE_ACTIONS


def register_audit_hooks(app):
    @app.before_request
    def capture_audit_context():
        if not _should_audit(request.path):
            return
        g.audit_method = request.method
        g.audit_path = request.path

    @app.after_request
    def persist_audit(response):
        if not hasattr(g, "audit_method"):
            return response
        if g.audit_method not in ("POST", "PUT", "PATCH", "DELETE"):
            return response
        if response.status_code >= 400:
            return response

        entidade = _extract_entidade(g.audit_path)
        acao = _method_to_acao(g.audit_method)
        if _is_sensitive(entidade, acao):
            acao = f"sensitive:{acao}"

        user_id = getattr(request, "user_id", None)
        user_email = getattr(request, "user_email", None)
        session_id = getattr(request, "session_id", None)

        dados_depois = None
        try:
            if response.content_type and "json" in response.content_type:
                dados_depois = response.get_json(silent=True)
        except Exception:
            pass

        log_transicao(
            entidade=entidade,
            entidade_id=_extract_id(g.audit_path),
            acao=acao,
            dados_antes=None,
            dados_depois=dados_depois,
            user_id=user_id,
            user_email=user_email,
            session_id=session_id,
            ip_address=request.remote_addr,
        )

        return response
