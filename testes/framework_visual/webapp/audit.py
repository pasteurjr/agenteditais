"""Helper de auditoria — INSERT em log_auditoria."""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

from flask import session, request

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import LogAuditoria  # type: ignore


def log(acao: str, recurso: str, recurso_id: Optional[str] = None, metadata: Optional[dict] = None):
    """Registra evento em log_auditoria. Nao bloqueia se falhar."""
    try:
        db = get_db()
        try:
            db.add(LogAuditoria(
                user_id=session.get("user_id"),
                acao=acao,
                recurso=recurso,
                recurso_id=recurso_id,
                metadata_json=metadata,
                ip_address=(request.remote_addr if request else None),
            ))
            db.commit()
        finally:
            db.close()
    except Exception as e:
        # Auditoria nunca quebra o fluxo principal
        try:
            from flask import current_app
            current_app.logger.warning(f"audit log failed: {e}")
        except Exception:
            pass
