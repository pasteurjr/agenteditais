"""Authentication middleware for Flask routes."""
from functools import wraps
from flask import request, jsonify, g

from auth.jwt_utils import verify_access_token


def get_current_user_id() -> str | None:
    """Get current user ID from request context."""
    return getattr(g, 'user_id', None)


def get_current_user_email() -> str | None:
    """Get current user email from request context."""
    return getattr(g, 'user_email', None)


def require_auth(f):
    """
    Decorator to require authentication for a route.
    Sets g.user_id and g.user_email if authenticated.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token de autenticação não fornecido'}), 401

        token = auth_header[7:]  # Remove 'Bearer ' prefix

        # Verify token
        payload = verify_access_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido ou expirado'}), 401

        # Set user info in request context
        g.user_id = payload.get('user_id')
        g.user_email = payload.get('email')

        return f(*args, **kwargs)

    return decorated


def optional_auth(f):
    """
    Decorator for routes where auth is optional.
    Sets g.user_id if authenticated, None otherwise.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            payload = verify_access_token(token)
            if payload:
                g.user_id = payload.get('user_id')
                g.user_email = payload.get('email')
            else:
                g.user_id = None
                g.user_email = None
        else:
            g.user_id = None
            g.user_email = None

        return f(*args, **kwargs)

    return decorated
