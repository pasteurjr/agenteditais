"""
RN DeepSeek — controles de invocacao do DeepSeek.

Cobertura:
- RN-083: Escopo de chat limitado ao edital aberto (contexto scope_edital_id).
- RN-084: Cooldown de 60 segundos entre chamadas DeepSeek por empresa.
- RN-086: Invalidar scores calculados quando pesos do ParametroScore mudam.
"""
import os
import time
import threading
from typing import Optional


_ENFORCE = os.environ.get("ENFORCE_RN_VALIDATORS", "false").lower() == "true"
_COOLDOWN_SECONDS = int(os.environ.get("RN084_COOLDOWN_SECONDS", "60"))

# Mapa em memoria: empresa_id -> last_call_ts
# Em producao com multiplas instancias, mover para Redis.
_last_call: dict = {}
_lock = threading.Lock()


class CooldownError(Exception):
    """RN-084: chamada bloqueada por cooldown."""
    def __init__(self, empresa_id: str, wait_seconds: float):
        self.empresa_id = empresa_id
        self.wait_seconds = wait_seconds
        super().__init__(f"[RN-084] Cooldown DeepSeek: aguarde {wait_seconds:.0f}s (empresa {empresa_id})")


def check_cooldown(empresa_id: Optional[str]) -> Optional[float]:
    """RN-084: retorna segundos de espera restantes (0 se pode chamar).

    Se ENFORCE_RN_VALIDATORS=true e empresa em cooldown, levanta CooldownError.
    """
    if not empresa_id:
        return 0
    now = time.time()
    with _lock:
        last = _last_call.get(empresa_id, 0)
        elapsed = now - last
        if elapsed < _COOLDOWN_SECONDS:
            wait = _COOLDOWN_SECONDS - elapsed
            if _ENFORCE:
                raise CooldownError(empresa_id, wait)
            print(f"[RN-084 WARN] Empresa {empresa_id} em cooldown ({wait:.0f}s restantes)")
            return wait
        _last_call[empresa_id] = now
    return 0


def reset_cooldown(empresa_id: str):
    """Usado em testes ou para resetar manualmente."""
    with _lock:
        _last_call.pop(empresa_id, None)


def validar_scope_edital(empresa_id: str, edital_id: str, scope_edital_id: Optional[str]):
    """RN-083: se scope_edital_id definido, o edital consultado deve ser == scope.

    Impede que uma tool chamada de dentro do chat de um edital consulte dado de outro.
    """
    if scope_edital_id and edital_id and str(edital_id) != str(scope_edital_id):
        msg = f"[RN-083] Tentativa de acesso cruzado: edital {edital_id} fora do escopo {scope_edital_id}"
        if _ENFORCE:
            raise PermissionError(msg)
        print(f"[RN-083 WARN] {msg}")
        return False
    return True


def invalidar_scores_empresa(db, empresa_id: str) -> int:
    """RN-086: ao mudar pesos do ParametroScore, marca todos os editais da empresa
    como score_stale=True (se o campo existir) ou loga aviso.

    Retorna numero de editais afetados.
    """
    try:
        from models import Edital
        # Tenta usar campo score_stale se existir
        if hasattr(Edital, "score_stale"):
            updated = db.query(Edital).filter(Edital.empresa_id == empresa_id).update(
                {"score_stale": True}, synchronize_session=False
            )
            db.commit()
            return updated
        else:
            # Fallback: loga warning — campo nao existe, migracao pendente
            count = db.query(Edital).filter(Edital.empresa_id == empresa_id).count()
            print(f"[RN-086 WARN] Edital.score_stale nao existe — {count} editais deveriam ser invalidados (empresa {empresa_id})")
            return 0
    except Exception as e:
        print(f"[RN-086 ERROR] {e}")
        return 0
