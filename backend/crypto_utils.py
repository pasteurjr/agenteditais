"""
Utilitários de criptografia para senhas de FonteCertidao.
Usa Fernet (AES-128-CBC) com chave simétrica.
"""
import os
import base64
from cryptography.fernet import Fernet, InvalidToken
from config import CRYPTO_KEY


def _get_fernet():
    """Retorna instância Fernet. Gera chave se não configurada."""
    key = CRYPTO_KEY
    if not key:
        # Fallback: derivar chave do JWT_SECRET para não precisar de config extra
        from config import JWT_SECRET_KEY
        # Fernet precisa de 32 bytes base64-encoded
        raw = JWT_SECRET_KEY.encode()[:32].ljust(32, b'\0')
        key = base64.urlsafe_b64encode(raw).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_password(plain_text: str) -> str:
    """Criptografa uma senha. Retorna string base64."""
    if not plain_text:
        return ""
    f = _get_fernet()
    return f.encrypt(plain_text.encode()).decode()


def decrypt_password(encrypted_text: str) -> str:
    """Descriptografa uma senha. Retorna texto plano."""
    if not encrypted_text:
        return ""
    f = _get_fernet()
    try:
        return f.decrypt(encrypted_text.encode()).decode()
    except InvalidToken:
        # Senha não criptografada (legado) — retornar como está
        return encrypted_text
