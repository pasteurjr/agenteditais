"""
Database operations using SQLAlchemy ORM with MySQL.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid

from models import (
    Base, engine, SessionLocal, get_db,
    User, Session, Message, RefreshToken, Documento
)


def init_db():
    """Initialize database tables (creates if not exist)."""
    Base.metadata.create_all(bind=engine)


# =============================================================================
# User Operations
# =============================================================================

def create_user(email: str, name: str, password_hash: Optional[str] = None,
                google_id: Optional[str] = None, picture_url: Optional[str] = None) -> Dict[str, Any]:
    """Create a new user."""
    db = get_db()
    try:
        user = User(
            email=email,
            name=name,
            password_hash=password_hash,
            google_id=google_id,
            picture_url=picture_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user.to_dict()
    finally:
        db.close()


def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email."""
    db = get_db()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID."""
    db = get_db()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()


def get_user_by_google_id(google_id: str) -> Optional[User]:
    """Get user by Google ID."""
    db = get_db()
    try:
        return db.query(User).filter(User.google_id == google_id).first()
    finally:
        db.close()


def update_user_last_login(user_id: str) -> None:
    """Update user's last login timestamp."""
    db = get_db()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_login_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


# =============================================================================
# Session/Conversation Operations
# =============================================================================

def create_session(user_id: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Create a new chat session for a user."""
    db = get_db()
    try:
        session = Session(
            user_id=user_id,
            name=name or "Nova conversa"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session.to_dict()
    finally:
        db.close()


def list_sessions(user_id: str) -> List[Dict[str, Any]]:
    """List all sessions for a user, ordered by most recent first."""
    db = get_db()
    try:
        sessions = db.query(Session).filter(
            Session.user_id == user_id
        ).order_by(Session.updated_at.desc()).all()
        return [s.to_dict() for s in sessions]
    finally:
        db.close()


def get_session(session_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Get a session with all its messages.
    If user_id is provided, verifies ownership.
    """
    db = get_db()
    try:
        query = db.query(Session).filter(Session.id == session_id)
        if user_id:
            query = query.filter(Session.user_id == user_id)
        session = query.first()

        if not session:
            return None

        return session.to_dict(include_messages=True)
    finally:
        db.close()


def delete_session(session_id: str, user_id: Optional[str] = None) -> bool:
    """
    Delete a session and all its messages.
    If user_id is provided, verifies ownership.
    """
    db = get_db()
    try:
        query = db.query(Session).filter(Session.id == session_id)
        if user_id:
            query = query.filter(Session.user_id == user_id)
        session = query.first()

        if not session:
            return False

        db.delete(session)
        db.commit()
        return True
    finally:
        db.close()


def rename_session(session_id: str, new_name: str, user_id: Optional[str] = None) -> bool:
    """
    Rename a session.
    If user_id is provided, verifies ownership.
    """
    db = get_db()
    try:
        query = db.query(Session).filter(Session.id == session_id)
        if user_id:
            query = query.filter(Session.user_id == user_id)
        session = query.first()

        if not session:
            return False

        session.name = new_name
        db.commit()
        return True
    finally:
        db.close()


def get_session_owner(session_id: str) -> Optional[str]:
    """Get the owner (user_id) of a session."""
    db = get_db()
    try:
        session = db.query(Session).filter(Session.id == session_id).first()
        return session.user_id if session else None
    finally:
        db.close()


# =============================================================================
# Message Operations
# =============================================================================

def add_message(session_id: str, role: str, content: str,
                sources: Optional[List[Dict]] = None) -> None:
    """Add a message to a session."""
    db = get_db()
    try:
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            sources_json=sources
        )
        db.add(message)

        # Update session's updated_at
        session = db.query(Session).filter(Session.id == session_id).first()
        if session:
            session.updated_at = datetime.utcnow()

        db.commit()
    finally:
        db.close()


def get_messages(session_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get messages for a session."""
    db = get_db()
    try:
        query = db.query(Message).filter(
            Message.session_id == session_id
        ).order_by(Message.created_at)

        if limit:
            # Get last N messages
            query = db.query(Message).filter(
                Message.session_id == session_id
            ).order_by(Message.created_at.desc()).limit(limit)
            messages = list(reversed(query.all()))
        else:
            messages = query.all()

        return [m.to_dict() for m in messages]
    finally:
        db.close()


def count_session_messages(session_id: str) -> int:
    """Count the number of messages in a session."""
    db = get_db()
    try:
        return db.query(Message).filter(Message.session_id == session_id).count()
    finally:
        db.close()


# =============================================================================
# Refresh Token Operations
# =============================================================================

def create_refresh_token(user_id: str, token_hash: str, expires_at: datetime) -> str:
    """Create a new refresh token and return its ID."""
    db = get_db()
    try:
        token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(token)
        db.commit()
        db.refresh(token)
        return token.id
    finally:
        db.close()


def get_refresh_token(token_hash: str) -> Optional[RefreshToken]:
    """Get a refresh token by its hash."""
    db = get_db()
    try:
        return db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.expires_at > datetime.utcnow()
        ).first()
    finally:
        db.close()


def delete_refresh_token(token_hash: str) -> bool:
    """Delete a refresh token."""
    db = get_db()
    try:
        result = db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash
        ).delete()
        db.commit()
        return result > 0
    finally:
        db.close()


def delete_user_refresh_tokens(user_id: str) -> int:
    """Delete all refresh tokens for a user (logout from all devices)."""
    db = get_db()
    try:
        result = db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id
        ).delete()
        db.commit()
        return result
    finally:
        db.close()


def cleanup_expired_tokens() -> int:
    """Remove expired refresh tokens."""
    db = get_db()
    try:
        result = db.query(RefreshToken).filter(
            RefreshToken.expires_at <= datetime.utcnow()
        ).delete()
        db.commit()
        return result
    finally:
        db.close()


# =============================================================================
# Documento Operations
# =============================================================================

def create_documento(
    user_id: str,
    tipo: str,
    titulo: str,
    conteudo_md: str,
    dados_json: Optional[Dict] = None,
    session_id: Optional[str] = None,
    documento_pai_id: Optional[str] = None,
    versao: int = 1
) -> Dict[str, Any]:
    """Create a new document."""
    db = get_db()
    try:
        documento = Documento(
            user_id=user_id,
            tipo=tipo,
            titulo=titulo,
            conteudo_md=conteudo_md,
            dados_json=dados_json,
            session_id=session_id,
            documento_pai_id=documento_pai_id,
            versao=versao
        )
        db.add(documento)
        db.commit()
        db.refresh(documento)
        return documento.to_dict()
    finally:
        db.close()


def get_documento(documento_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Get a document by ID. If user_id provided, verifies ownership."""
    db = get_db()
    try:
        query = db.query(Documento).filter(Documento.id == documento_id)
        if user_id:
            query = query.filter(Documento.user_id == user_id)
        documento = query.first()
        return documento.to_dict() if documento else None
    finally:
        db.close()


def list_documentos(
    user_id: str,
    tipo: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """List documents for a user, optionally filtered by type.

    Returns the latest version of each document (documents that have no children).
    """
    db = get_db()
    try:
        from sqlalchemy import and_, not_, exists

        # Subquery to find documents that are parents of other documents
        has_child = db.query(Documento.id).filter(
            Documento.documento_pai_id == Documento.id
        ).exists()

        # Get all documents for the user
        query = db.query(Documento).filter(Documento.user_id == user_id)
        if tipo:
            query = query.filter(Documento.tipo == tipo)

        # Filter to get only documents that are NOT parents of any other document
        # (i.e., the latest versions)
        subquery = db.query(Documento.documento_pai_id).filter(
            Documento.documento_pai_id.isnot(None),
            Documento.user_id == user_id
        )
        query = query.filter(~Documento.id.in_(subquery))

        query = query.order_by(Documento.updated_at.desc()).limit(limit)
        documentos = query.all()
        return [d.to_dict(include_content=False) for d in documentos]
    finally:
        db.close()


def get_documento_versoes(documento_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all versions of a document (including the original and all derived versions)."""
    db = get_db()
    try:
        # First, find the root document (the one without documento_pai_id)
        doc = db.query(Documento).filter(Documento.id == documento_id).first()
        if not doc:
            return []

        # If this doc has a parent, find the root
        root_id = documento_id
        while doc and doc.documento_pai_id:
            root_id = doc.documento_pai_id
            doc = db.query(Documento).filter(Documento.id == root_id).first()

        # Now get all documents that are either the root or have root as ancestor
        # We need to traverse the tree - get root + all descendants
        versoes = []

        def get_descendants(parent_id):
            query = db.query(Documento).filter(Documento.id == parent_id)
            if user_id:
                query = query.filter(Documento.user_id == user_id)
            doc = query.first()
            if doc:
                versoes.append(doc.to_dict(include_content=False))
                # Get children
                children = db.query(Documento).filter(Documento.documento_pai_id == parent_id).all()
                for child in children:
                    get_descendants(child.id)

        get_descendants(root_id)

        # Sort by version number
        versoes.sort(key=lambda x: x['versao'])
        return versoes
    finally:
        db.close()


def create_documento_versao(
    documento_pai_id: str,
    conteudo_md: str,
    user_id: str,
    dados_json: Optional[Dict] = None
) -> Optional[Dict[str, Any]]:
    """Create a new version of a document."""
    db = get_db()
    try:
        # Get the parent document
        doc_pai = db.query(Documento).filter(
            Documento.id == documento_pai_id,
            Documento.user_id == user_id
        ).first()

        if not doc_pai:
            return None

        # Create new version
        nova_versao = Documento(
            user_id=user_id,
            tipo=doc_pai.tipo,
            titulo=doc_pai.titulo,
            conteudo_md=conteudo_md,
            dados_json=dados_json or doc_pai.dados_json,
            session_id=doc_pai.session_id,
            documento_pai_id=documento_pai_id,
            versao=doc_pai.versao + 1
        )
        db.add(nova_versao)
        db.commit()
        db.refresh(nova_versao)
        return nova_versao.to_dict()
    finally:
        db.close()


def update_documento(
    documento_id: str,
    user_id: str,
    titulo: Optional[str] = None,
    conteudo_md: Optional[str] = None,
    dados_json: Optional[Dict] = None
) -> Optional[Dict[str, Any]]:
    """Update a document (only title and metadata, not content - use versioning for content)."""
    db = get_db()
    try:
        documento = db.query(Documento).filter(
            Documento.id == documento_id,
            Documento.user_id == user_id
        ).first()

        if not documento:
            return None

        if titulo:
            documento.titulo = titulo
        if conteudo_md:
            documento.conteudo_md = conteudo_md
        if dados_json:
            documento.dados_json = dados_json

        db.commit()
        db.refresh(documento)
        return documento.to_dict()
    finally:
        db.close()


def delete_documento(documento_id: str, user_id: Optional[str] = None) -> bool:
    """Delete a document and all its versions."""
    db = get_db()
    try:
        query = db.query(Documento).filter(Documento.id == documento_id)
        if user_id:
            query = query.filter(Documento.user_id == user_id)
        documento = query.first()

        if not documento:
            return False

        # Delete all versions (children) first
        db.query(Documento).filter(Documento.documento_pai_id == documento_id).delete()

        # Delete the document itself
        db.delete(documento)
        db.commit()
        return True
    finally:
        db.close()


def get_documentos_by_session(session_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all documents associated with a session."""
    db = get_db()
    try:
        query = db.query(Documento).filter(Documento.session_id == session_id)
        if user_id:
            query = query.filter(Documento.user_id == user_id)
        query = query.order_by(Documento.created_at.desc())
        documentos = query.all()
        return [d.to_dict(include_content=False) for d in documentos]
    finally:
        db.close()
