"""Orquestracao de processos do executor_db (spawn/kill/check)."""
from __future__ import annotations

import os
import signal
import subprocess
import sys
from pathlib import Path
from typing import Optional

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent


def is_pid_alive(pid: Optional[int]) -> bool:
    if not pid or pid <= 0:
        return False
    try:
        os.kill(pid, 0)
        return True
    except (OSError, ProcessLookupError):
        return False


def iniciar_executor(teste_id: str) -> int:
    """Spawn o executor_db.py como subprocesso. Retorna PID."""
    cmd = [
        sys.executable,
        str(_FW_VISUAL / "executor_db.py"),
        "--teste_id", teste_id,
    ]
    log_path = Path(f"/tmp/executor_{teste_id}.log")
    log_f = open(log_path, "w")
    proc = subprocess.Popen(
        cmd,
        cwd=str(_PROJECT),
        stdout=log_f,
        stderr=subprocess.STDOUT,
        env={**os.environ},
    )
    return proc.pid


def parar_executor(pid: Optional[int]) -> bool:
    """Envia SIGTERM ao processo. Retorna True se enviado."""
    if not is_pid_alive(pid):
        return False
    try:
        os.kill(pid, signal.SIGTERM)
        return True
    except OSError:
        return False
