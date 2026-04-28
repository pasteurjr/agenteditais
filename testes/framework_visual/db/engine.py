"""
Engine SQLAlchemy isolado pro banco testesvalidacoes.

Usa as MESMAS credenciais do banco editais (mesma instancia MySQL) mas aponta
pra outro database. Variavel MYSQL_TESTES_DATABASE controla.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Carrega .env da raiz do projeto se ainda nao tiver
_PROJECT_ROOT = Path(__file__).resolve().parents[3]


def _load_env_once() -> None:
    """Le .env se python-dotenv estiver disponivel; senao, ignora silenciosamente."""
    if os.getenv("_TESTES_ENV_LOADED"):
        return
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv(_PROJECT_ROOT / ".env")
    except ImportError:
        # fallback: parser bem simples
        env_file = _PROJECT_ROOT / ".env"
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())
    os.environ["_TESTES_ENV_LOADED"] = "1"


_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None

Base = declarative_base()


def _build_dsn() -> str:
    _load_env_once()
    host = os.getenv("MYSQL_HOST", "camerascasas.no-ip.info")
    port = os.getenv("MYSQL_PORT", "3308")
    user = os.getenv("MYSQL_USER", "producao")
    password = os.getenv("MYSQL_PASSWORD", "112358123")
    database = os.getenv("MYSQL_TESTES_DATABASE", "testesvalidacoes")
    return f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(
            _build_dsn(),
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=5,
            max_overflow=10,
            future=True,
        )
    return _engine


def get_session_factory() -> sessionmaker:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autocommit=False, autoflush=False)
    return _SessionLocal


def get_db() -> Session:
    """Retorna sessao SQLAlchemy. Caller deve fechar (`db.close()`)."""
    return get_session_factory()()


__all__ = ["Base", "get_engine", "get_session_factory", "get_db"]
