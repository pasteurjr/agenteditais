"""
RN Audit — wiring do model AuditoriaLog para RN-037 e RN-132.

RN-037: audit log universal de transicoes de estado de entidades
        (Produto, Edital, Contrato, Proposta, Decisao GO/NO-GO).

RN-132: audit de invocacoes de ferramentas DeepSeek (tool name, input hash,
        user, empresa, timestamp, tempo de resposta).

Todas as funcoes sao idempotentes, best-effort (nunca quebram o fluxo principal)
e respeitam feature flag ENFORCE_RN_VALIDATORS=false => apenas loga em stdout.
"""
import os
import hashlib
import json
import time
import uuid
from datetime import datetime
from functools import wraps


_AUDIT_ENABLED = os.environ.get("RN_AUDIT_ENABLED", "true").lower() == "true"


def log_transicao(entidade: str, entidade_id: str, acao: str,
                  dados_antes=None, dados_depois=None, user_id=None,
                  user_email=None, session_id=None, ip_address=None):
    """RN-037: grava uma transicao de estado em AuditoriaLog.

    Best-effort: nunca levanta excecao. Se falhar, loga e segue.
    """
    if not _AUDIT_ENABLED:
        return
    try:
        from models import AuditoriaLog, get_db
        db = get_db()
        log = AuditoriaLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            user_email=user_email,
            acao=acao,
            entidade=entidade,
            entidade_id=entidade_id,
            dados_antes=dados_antes if isinstance(dados_antes, (dict, list)) else None,
            dados_depois=dados_depois if isinstance(dados_depois, (dict, list)) else None,
            ip_address=ip_address,
            created_at=datetime.now(),
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"[RN-037 AUDIT ERROR] {entidade}/{entidade_id} acao={acao}: {e}")


def audited_tool(tool_name: str = None):
    """RN-132: decorator para ferramentas DeepSeek.

    Loga: nome, hash do input (SHA-256 primeiros 16 chars), user (se disponivel
    via contexto), tempo de execucao em ms, sucesso/erro.

    Uso:
        @audited_tool("buscar_edital_pncp")
        def tool_buscar_edital_pncp(...): ...
    """
    def decorator(func):
        name = tool_name or func.__name__

        @wraps(func)
        def wrapper(*args, **kwargs):
            t0 = time.time()
            input_blob = None
            try:
                input_blob = json.dumps({"args": list(args), "kwargs": kwargs}, default=str, ensure_ascii=False)
            except Exception:
                input_blob = str((args, kwargs))[:500]
            input_hash = hashlib.sha256((input_blob or "").encode("utf-8")).hexdigest()[:16]

            error = None
            result = None
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                error = str(e)
                raise
            finally:
                dt_ms = int((time.time() - t0) * 1000)
                if _AUDIT_ENABLED:
                    try:
                        from models import AuditoriaLog, get_db
                        db = get_db()
                        log = AuditoriaLog(
                            id=str(uuid.uuid4()),
                            acao="deepseek_tool_call",
                            entidade="tool",
                            entidade_id=name,
                            dados_antes={"input_hash": input_hash, "input_len": len(input_blob or "")},
                            dados_depois={"duration_ms": dt_ms, "error": error, "success": error is None},
                            created_at=datetime.now(),
                        )
                        db.add(log)
                        db.commit()
                    except Exception as e:
                        print(f"[RN-132 AUDIT ERROR] tool={name}: {e}")
                else:
                    print(f"[RN-132 tool={name} dt={dt_ms}ms hash={input_hash} error={error}]")
        return wrapper
    return decorator


def get_auditoria(entidade: str = None, entidade_id: str = None, limit: int = 100):
    """Consulta log de auditoria. Usado pelo endpoint GET /api/auditoria."""
    try:
        from models import AuditoriaLog, get_db
        db = get_db()
        q = db.query(AuditoriaLog).order_by(AuditoriaLog.created_at.desc())
        if entidade:
            q = q.filter(AuditoriaLog.entidade == entidade)
        if entidade_id:
            q = q.filter(AuditoriaLog.entidade_id == entidade_id)
        return [row.to_dict() for row in q.limit(min(limit, 500)).all()]
    except Exception as e:
        print(f"[RN-037 GET ERROR] {e}")
        return []
