import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

# DeepSeek LLM - Mesmo modelo do trabalhista: reasoner com thinking mode e 64K tokens
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-bb7d97e4754943a2b6f92a00670c72bc")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-reasoner")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

# FAISS / Embeddings (opcional para este MVP - foco no banco estruturado)
FAISS_INDEX_PATH = str(Path(__file__).parent.parent / "faiss_index_editais")
EMBEDDINGS_MODEL = "intfloat/multilingual-e5-base"

# MySQL - Banco "editais"
MYSQL_HOST = os.getenv("MYSQL_HOST", "camerascasas.no-ip.info")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3308"))
MYSQL_USER = os.getenv("MYSQL_USER", "producao")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "112358123")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "editais")
MYSQL_URI = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"

# JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "editais-ia-secret-key-change-in-production-2024")
JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "3600"))  # 1 hour
JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", "2592000"))  # 30 days

# RAG / LLM
SIMILARITY_TOP_K = 15
MAX_HISTORY_MESSAGES = 10
TEMPERATURE = 0.7
MAX_TOKENS = 65536  # DeepSeek Reasoner suporta até 64K tokens de saída com thinking mode

# Diretórios de upload
UPLOAD_FOLDER = str(Path(__file__).parent.parent / "uploads")
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

# PNCP API (Portal Nacional de Contratações Públicas)
PNCP_BASE_URL = "https://pncp.gov.br/api/consulta/v1"

# Serper API (Google Search)
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "d46999449953645b87258a752ef428d98ae5970f")
SERPER_API_URL = "https://google.serper.dev/search"
