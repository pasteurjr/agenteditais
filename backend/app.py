"""
Agente de Editais - Backend Flask
MVP com 9 ações via Select + Prompt
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from models import init_db, get_db, User, Session, Message, RefreshToken, Produto, Edital, Analise, Proposta, FonteEdital
from llm import call_deepseek
from tools import (
    tool_web_search, tool_download_arquivo, tool_processar_upload,
    tool_extrair_especificacoes, tool_cadastrar_fonte, tool_listar_fontes,
    tool_buscar_editais_fonte, tool_extrair_requisitos, tool_listar_editais,
    tool_listar_produtos, tool_calcular_aderencia, tool_gerar_proposta,
    tool_calcular_score_aderencia, tool_salvar_editais_selecionados,
    execute_tool, _extrair_info_produto, PROMPT_EXTRAIR_SPECS
)
from config import UPLOAD_FOLDER, MAX_HISTORY_MESSAGES

import bcrypt
import jwt
import uuid
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5175", "http://localhost:3000"])

# JWT Config
JWT_SECRET = "editais-ia-secret-key-change-in-production-2024"
JWT_EXPIRY_HOURS = 24

# Prompts prontos para o dropdown
PROMPTS_PRONTOS = [
    {"id": "listar_produtos", "nome": "Listar meus produtos", "prompt": "Liste todos os meus produtos cadastrados"},
    {"id": "listar_editais", "nome": "Listar editais abertos", "prompt": "Quais editais estão abertos?"},
    {"id": "calcular_aderencia", "nome": "Calcular aderência", "prompt": "Calcule a aderência do produto [NOME_PRODUTO] ao edital [NUMERO_EDITAL]"},
    {"id": "gerar_proposta", "nome": "Gerar proposta", "prompt": "Gere uma proposta do produto [NOME_PRODUTO] para o edital [NUMERO_EDITAL] com preço R$ [VALOR]"},
    {"id": "buscar_editais", "nome": "Buscar editais", "prompt": "Busque editais de [TERMO] no PNCP"},
    {"id": "cadastrar_fonte", "nome": "Cadastrar fonte", "prompt": "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]"},
    {"id": "listar_fontes", "nome": "Listar fontes", "prompt": "Quais são as fontes de editais cadastradas?"},
    {"id": "ajuda", "nome": "O que posso fazer?", "prompt": "O que você pode fazer? Quais são suas capacidades?"},
]


PROMPT_CLASSIFICAR_INTENCAO = """Você é um agente classificador de intenções para um sistema de gestão de editais e licitações.

Analise a mensagem do usuário e classifique em UMA das categorias abaixo:

## CATEGORIAS DO SISTEMA:

### AÇÕES COM ARQUIVOS (quando usuário envia um PDF/documento):
1. **arquivo_cadastrar**: Cadastrar o arquivo como produto no sistema (PADRÃO se não especificar outra ação)
   Exemplos: "cadastre", "salve como produto", "registre", "" (vazio), "cadastre como Analisador X"

2. **arquivo_mostrar**: Mostrar/exibir o conteúdo do arquivo
   Exemplos: "mostre o conteúdo", "exiba o texto", "o que tem nesse PDF?", "leia o documento", "mostra"

3. **arquivo_specs**: Extrair e listar especificações técnicas (sem cadastrar)
   Exemplos: "quais especificações?", "extraia as specs", "liste as características técnicas"

4. **arquivo_resumir**: Fazer um resumo do documento
   Exemplos: "resuma", "faça um resumo", "sintetize", "resuma o documento"

5. **arquivo_analisar**: Fazer análise detalhada do documento
   Exemplos: "analise", "faça uma análise", "avalie o documento", "o que você acha desse manual?"

### AÇÕES DE BUSCA:
6. **buscar_web**: Buscar MATERIAIS/MANUAIS/DATASHEETS na WEB (não editais!)
   Exemplos: "busque na web o manual do equipamento X", "encontre o datasheet do Y"

7. **download_url**: Baixar arquivo de uma URL específica
   Exemplos: "baixe o arquivo da URL: http://...", "baixe https://..."
   IMPORTANTE: Se contém URL (http:// ou https://), classifique como download_url!

8. **buscar_editais**: Buscar EDITAIS/LICITAÇÕES em portais (PNCP, BEC)
   Exemplos: "busque editais de tecnologia", "editais da área médica"

### AÇÕES DE LISTAGEM:
9. **listar_editais**: Ver editais JÁ SALVOS no sistema
   Exemplos: "liste meus editais", "editais salvos"

10. **listar_produtos**: Ver produtos cadastrados
    Exemplos: "liste meus produtos", "quais produtos tenho"

11. **listar_fontes**: Ver fontes de editais cadastradas
    Exemplos: "quais fontes?", "liste fontes"

### AÇÕES DE PROCESSAMENTO:
12. **calcular_aderencia**: Calcular score produto vs edital
    Exemplos: "calcule aderência do produto X com edital Y"

13. **gerar_proposta**: Gerar proposta técnica
    Exemplos: "gere proposta para o edital X"

14. **cadastrar_fonte**: Cadastrar nova fonte de editais
    Exemplos: "cadastre a fonte BEC-SP"

15. **salvar_editais**: Salvar editais da última busca
    Exemplos: "salve os editais", "salvar recomendados"

16. **chat_livre**: Dúvidas gerais, conversas
    Exemplos: "o que é pregão?", "olá", "obrigado"

## CONTEXTO IMPORTANTE:
- **tem_arquivo**: {tem_arquivo} (true se usuário enviou um arquivo junto com a mensagem)
- Se tem_arquivo=true E mensagem vazia ou genérica → **arquivo_cadastrar**
- Se tem_arquivo=true E pede para mostrar/ler → **arquivo_mostrar**

## PARÂMETROS EXTRAS (extraia se mencionados):
- "termo_busca": termo de busca otimizado
- "nome_produto": nome do produto
- "url": URL completa se houver
- "produto": nome do produto para aderência/proposta
- "edital": número/identificador do edital

## MENSAGEM DO USUÁRIO:
"{mensagem}"

## RESPOSTA:
Retorne APENAS um JSON:
{{"intencao": "<categoria>", "termo_busca": null, "nome_produto": null, "url": null, "produto": null, "edital": null}}"""


def detectar_intencao_ia(message: str, tem_arquivo: bool = False) -> dict:
    """
    Usa DeepSeek-chat para classificar a intenção do usuário.
    Retorna dict com 'intencao' e parâmetros extraídos.

    Args:
        message: Mensagem do usuário
        tem_arquivo: True se o usuário enviou um arquivo junto
    """
    import json
    import re

    prompt = PROMPT_CLASSIFICAR_INTENCAO.format(
        mensagem=message or "(mensagem vazia)",
        tem_arquivo="true" if tem_arquivo else "false"
    )

    try:
        resposta = call_deepseek(
            [{"role": "user", "content": prompt}],
            max_tokens=150,
            model_override="deepseek-chat"  # Rápido para classificação
        )

        # Extrair JSON da resposta
        json_match = re.search(r'\{[\s\S]*?\}', resposta)
        if json_match:
            resultado = json.loads(json_match.group())
            print(f"[AGENTE] Intenção detectada: {resultado.get('intencao')} | Termo: {resultado.get('termo_busca')}")
            return resultado
    except Exception as e:
        print(f"[AGENTE] Erro na classificação: {e}")

    # Fallback para detecção por palavras-chave
    return {"intencao": detectar_intencao_fallback(message), "termo_busca": None}


def detectar_intencao_fallback(message: str) -> str:
    """Fallback: detecção por palavras-chave (usado se IA falhar)."""
    msg = message.lower()

    # 1. Buscar na WEB (manuais, datasheets) - ANTES de buscar editais!
    if any(p in msg for p in ["busque na web", "buscar na web", "pesquise na web", "datasheet", "manual do"]):
        return "buscar_web"
    if any(p in msg for p in ["especificações do", "especificacoes do"]) and "edital" not in msg:
        return "buscar_web"

    # 2. Upload de manual
    if any(p in msg for p in ["upload", "enviei", "arquivo que", "processe o manual", "processe o pdf"]):
        return "upload_manual"

    # 2.5. Download de URL - ANTES de outras ações
    if "http://" in msg or "https://" in msg:
        if any(p in msg for p in ["baixe", "baixar", "download", "faça download"]):
            return "download_url"
        # Se tem URL e fala de PDF/manual/arquivo, também é download
        if any(p in msg for p in [".pdf", "manual", "arquivo", "documento"]):
            return "download_url"

    # 3. Salvar editais
    if any(p in msg for p in ["salvar edital", "salvar editais", "salve", "guardar edital"]):
        return "salvar_editais"

    # 4. Listar produtos
    if any(p in msg for p in ["meus produtos", "listar produtos", "produtos cadastrados", "ver produtos"]):
        return "listar_produtos"

    # 5. Listar editais salvos
    if any(p in msg for p in ["meus editais", "editais salvos", "editais cadastrados", "ver editais"]):
        return "listar_editais"

    # 6. Calcular aderência
    if any(p in msg for p in ["aderência", "aderencia", "score", "compatível", "compatibilidade"]):
        return "calcular_aderencia"

    # 7. Gerar proposta
    if any(p in msg for p in ["proposta", "gerar proposta", "elaborar proposta"]):
        return "gerar_proposta"

    # 8. Fontes
    if any(p in msg for p in ["fonte"]):
        if any(p in msg for p in ["cadastr", "adicion", "nova fonte"]):
            return "cadastrar_fonte"
        return "listar_fontes"

    # 9. Buscar editais - por último, pois é genérico
    if any(p in msg for p in ["edital", "editais", "licitaç", "licitac", "pregão", "pregao"]):
        return "buscar_editais"

    return "chat_livre"


def detectar_intencao(message: str) -> str:
    """Wrapper para compatibilidade - retorna apenas a intenção."""
    resultado = detectar_intencao_ia(message)
    return resultado.get("intencao", "chat_livre")


# =============================================================================
# Auth Helpers
# =============================================================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({"error": "Token não fornecido"}), 401

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user_id = payload["user_id"]
            request.user_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        return f(*args, **kwargs)
    return decorated


def get_current_user_id():
    return getattr(request, 'user_id', None)


# =============================================================================
# Auth Routes
# =============================================================================

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    db = get_db()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.password_hash:
            return jsonify({"error": "Email ou senha inválidos"}), 401

        if not verify_password(password, user.password_hash):
            return jsonify({"error": "Email ou senha inválidos"}), 401

        user.last_login_at = datetime.now()

        # Create refresh token
        refresh_token_value = str(uuid.uuid4())
        refresh_token = RefreshToken(
            token=refresh_token_value,
            user_id=user.id,
            expires_at=datetime.now() + timedelta(days=30)
        )
        db.add(refresh_token)
        db.commit()

        access_token = create_access_token(user.id, user.email)

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token_value,
            "user": user.to_dict()
        })
    finally:
        db.close()


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    if len(password) < 6:
        return jsonify({"error": "A senha deve ter pelo menos 6 caracteres"}), 400

    db = get_db()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return jsonify({"error": "Este email já está cadastrado"}), 409

        user = User(
            email=email,
            name=name,
            password_hash=hash_password(password)
        )
        db.add(user)
        db.commit()

        # Create refresh token
        refresh_token_value = str(uuid.uuid4())
        refresh_token = RefreshToken(
            token=refresh_token_value,
            user_id=user.id,
            expires_at=datetime.now() + timedelta(days=30)
        )
        db.add(refresh_token)
        db.commit()

        access_token = create_access_token(user.id, user.email)

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token_value,
            "user": user.to_dict()
        }), 201
    finally:
        db.close()


@app.route("/api/auth/user", methods=["GET"])
@require_auth
def get_current_user():
    db = get_db()
    try:
        user = db.query(User).filter(User.id == get_current_user_id()).first()
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        return jsonify(user.to_dict())
    finally:
        db.close()


@app.route("/api/auth/refresh", methods=["POST"])
def refresh():
    data = request.json or {}
    refresh_token_value = data.get("refresh_token", "")

    if not refresh_token_value:
        return jsonify({"error": "Refresh token não fornecido"}), 400

    db = get_db()
    try:
        token_record = db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token_value,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.now()
        ).first()

        if not token_record:
            return jsonify({"error": "Refresh token inválido ou expirado"}), 401

        user = db.query(User).filter(User.id == token_record.user_id).first()
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        access_token = create_access_token(user.id, user.email)

        return jsonify({
            "access_token": access_token,
            "user": user.to_dict()
        })
    finally:
        db.close()


@app.route("/api/auth/logout", methods=["POST"])
@require_auth
def logout():
    data = request.json or {}
    refresh_token_value = data.get("refresh_token", "")

    if refresh_token_value:
        db = get_db()
        try:
            token_record = db.query(RefreshToken).filter(
                RefreshToken.token == refresh_token_value
            ).first()
            if token_record:
                token_record.revoked = True
                db.commit()
        finally:
            db.close()

    return jsonify({"message": "Logout realizado com sucesso"})


# =============================================================================
# Ações Routes
# =============================================================================

@app.route("/api/acoes", methods=["GET"])
def listar_acoes():
    """Lista prompts prontos para o dropdown."""
    return jsonify({"prompts": PROMPTS_PRONTOS})


# =============================================================================
# Auto-rename session
# =============================================================================

def generate_session_title(first_question: str) -> str:
    """Generate a short title for the session based on the first question."""
    prompt = f"""Crie um título curto (3-5 palavras) que resuma esta pergunta sobre licitações/editais:
"{first_question}"
Responda apenas com o título, sem aspas ou pontuação final."""

    try:
        messages = [{"role": "user", "content": prompt}]
        # Usar deepseek-chat para tarefas simples (reasoner retorna vazio para prompts curtos)
        title = call_deepseek(messages, max_tokens=50, model_override="deepseek-chat")
        # Clean up the title
        title = title.strip().strip('"\'').strip()
        # Limit length
        if len(title) > 50:
            title = title[:47] + "..."
        return title if title else None
    except Exception as e:
        print(f"Erro ao gerar título: {e}")
        return None


def count_session_messages(session_id: str, db) -> int:
    """Count messages in a session."""
    return db.query(Message).filter(Message.session_id == session_id).count()


# =============================================================================
# Chat Routes (com suporte a ações)
# =============================================================================

@app.route("/api/chat", methods=["POST"])
@require_auth
def chat():
    """
    Endpoint principal do chat.
    Detecta automaticamente a intenção do usuário.
    """
    data = request.json or {}
    session_id = data.get("session_id")
    message = data.get("message", "").strip()
    user_id = get_current_user_id()

    if not session_id or not message:
        return jsonify({"error": "session_id e message são obrigatórios"}), 400

    db = get_db()
    try:
        # Verificar sessão
        session = db.query(Session).filter(
            Session.id == session_id,
            Session.user_id == user_id
        ).first()

        if not session:
            return jsonify({"error": "Sessão não encontrada"}), 404

        # Check if this is the first user message (for auto-rename)
        is_first_message = count_session_messages(session_id, db) == 0

        # Detectar intenção usando agente IA
        print(f"[CHAT] Detectando intenção para: {message[:50]}...")
        intencao_resultado = detectar_intencao_ia(message)
        action_type = intencao_resultado.get("intencao", "chat_livre")
        termo_busca_ia = intencao_resultado.get("termo_busca")
        print(f"[CHAT] Intenção: {action_type} | Termo: {termo_busca_ia}")

        # Salvar mensagem do usuário
        user_msg = Message(
            session_id=session_id,
            role='user',
            content=message,
            action_type=action_type
        )
        db.add(user_msg)

        # Processar de acordo com a ação detectada
        response_text = ""
        resultado = None

        if action_type == "buscar_web":
            response_text, resultado = processar_buscar_web(message, user_id, intencao_resultado)

        elif action_type == "upload_manual":
            response_text, resultado = processar_upload_manual(message, user_id, intencao_resultado)

        elif action_type == "download_url":
            response_text, resultado = processar_download_url(message, user_id, intencao_resultado)

        elif action_type == "cadastrar_fonte":
            response_text, resultado = processar_cadastrar_fonte(message, user_id, intencao_resultado)

        elif action_type == "buscar_editais":
            response_text, resultado = processar_buscar_editais(message, user_id, termo_ia=termo_busca_ia)

        elif action_type == "listar_editais":
            response_text, resultado = processar_listar_editais(message, user_id)

        elif action_type == "listar_produtos":
            response_text, resultado = processar_listar_produtos(message, user_id)

        elif action_type == "listar_fontes":
            response_text, resultado = processar_listar_fontes(message)

        elif action_type == "calcular_aderencia":
            response_text, resultado = processar_calcular_aderencia(message, user_id)

        elif action_type == "gerar_proposta":
            response_text, resultado = processar_gerar_proposta(message, user_id)

        elif action_type == "salvar_editais":
            response_text, resultado = processar_salvar_editais(message, user_id, session_id, db)

        else:  # chat_livre
            response_text = processar_chat_livre(message, user_id, session_id, db)

        # Salvar resposta do assistente
        assistant_msg = Message(
            session_id=session_id,
            role='assistant',
            content=response_text,
            action_type=action_type
        )
        db.add(assistant_msg)

        # Auto-rename session if first message
        new_session_name = None
        print(f"DEBUG: is_first_message={is_first_message}, session.name='{session.name}'")
        if is_first_message and session.name == "Nova conversa":
            try:
                print(f"DEBUG: Gerando título para: {message[:50]}...")
                new_session_name = generate_session_title(message)
                print(f"DEBUG: Título gerado: {new_session_name}")
                if new_session_name:
                    session.name = new_session_name
            except Exception as e:
                print(f"DEBUG: Erro ao gerar título: {e}")
                pass  # Don't fail the request if rename fails

        # Atualizar sessão
        session.updated_at = datetime.now()
        db.commit()

        response_data = {
            "response": response_text,
            "session_id": session_id,
            "action_type": action_type,
            "resultado": resultado
        }

        if new_session_name:
            response_data["session_name"] = new_session_name

        return jsonify(response_data)

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# =============================================================================
# Processadores de Ações
# =============================================================================

def processar_buscar_web(message: str, user_id: str, intencao_resultado: dict):
    """
    Processa ação: Buscar material/manuais/datasheets na web usando Serper API.

    Diferente de buscar_editais - aqui buscamos MANUAIS e ESPECIFICAÇÕES de produtos,
    não licitações/editais.
    """
    # Extrair termo de busca da IA ou usar mensagem
    termo = intencao_resultado.get("termo_busca") or message

    resultado = tool_web_search(termo, user_id)

    if resultado.get("success"):
        response = f"""## 🔍 Busca de Material na Web

**Termo pesquisado:** {termo}
**Total de resultados:** {resultado.get('total_resultados', 0)}
**PDFs encontrados:** {resultado.get('pdfs_encontrados', 0)}

"""
        # Mostrar PDFs encontrados
        pdfs = resultado.get('resultados_pdf', [])
        if pdfs:
            response += "### 📄 PDFs Encontrados\n\n"
            for i, pdf in enumerate(pdfs, 1):
                response += f"**{i}. {pdf['titulo']}**\n"
                response += f"   {pdf['descricao'][:150]}...\n" if len(pdf.get('descricao', '')) > 150 else f"   {pdf.get('descricao', '')}\n"
                response += f"   🔗 [Baixar PDF]({pdf['link']})\n\n"

        # Mostrar outros resultados
        outros = resultado.get('outros_resultados', [])
        if outros:
            response += "### 🌐 Outros Resultados\n\n"
            for i, item in enumerate(outros, 1):
                response += f"**{i}. {item['titulo']}**\n"
                response += f"   🔗 {item['link']}\n\n"

        response += """---
### Próximos passos:
Para baixar um PDF e cadastrar como produto, envie:
`Baixe o arquivo da URL: <cole_a_url_do_pdf>`

O sistema irá:
1. Baixar o arquivo
2. Extrair texto e especificações
3. Cadastrar como produto no sistema"""

    else:
        response = f"❌ Erro na busca: {resultado.get('error', 'Erro desconhecido')}"

    return response, resultado


def processar_upload_manual(message: str, user_id: str, intencao_resultado: dict):
    """
    Processa ação: Upload de manual/PDF para cadastrar produto.

    Nota: O upload físico do arquivo é feito via /api/upload.
    Esta função processa a intenção quando o usuário menciona que quer processar um arquivo.
    """
    nome_produto = intencao_resultado.get("nome_produto")

    if nome_produto:
        response = f"""## 📄 Upload de Manual

Para cadastrar o produto **{nome_produto}**, faça o seguinte:

1. Clique no botão **📎** ao lado do campo de mensagem
2. Selecione o arquivo PDF do manual
3. Após o upload, envie uma mensagem confirmando: "Processe como {nome_produto}"

O sistema irá:
- Extrair o texto do PDF
- Identificar especificações técnicas
- Cadastrar o produto com todas as specs"""
    else:
        response = """## 📄 Upload de Manual

Para cadastrar um produto a partir de um manual PDF:

1. Clique no botão **📎** ao lado do campo de mensagem
2. Selecione o arquivo PDF do manual
3. Após o upload, informe o nome do produto

Exemplo: "Processe o manual que enviei e cadastre como Analisador Bioquímico BS-240"

O sistema extrairá automaticamente as especificações técnicas do manual."""

    return response, {"status": "aguardando_upload", "nome_produto": nome_produto}


def processar_download_url(message: str, user_id: str, intencao_resultado: dict):
    """
    Processa ação: Baixar arquivo de URL, extrair especificações e cadastrar produto.

    Fluxo completo:
    1. Baixa o arquivo da URL
    2. Extrai texto do PDF
    3. Usa IA para extrair especificações técnicas
    4. Cadastra produto no banco
    """
    import re

    intencao_resultado = intencao_resultado or {}

    # Extrair URL da mensagem ou do resultado da IA
    url = intencao_resultado.get("url")
    nome_produto = intencao_resultado.get("nome_produto")

    # Se IA não extraiu a URL, tentar extrair via regex
    if not url:
        url_match = re.search(r'https?://[^\s<>"\']+', message)
        if url_match:
            url = url_match.group()

    if not url:
        return "❌ Não encontrei uma URL na mensagem. Envie no formato:\n`Baixe o arquivo da URL: https://exemplo.com/manual.pdf`", {"error": "URL não encontrada"}

    # Se não tem nome do produto, tentar extrair do nome do arquivo ou pedir
    if not nome_produto:
        # Tentar extrair do nome do arquivo na URL
        filename = url.split('/')[-1].split('?')[0]
        if filename and len(filename) > 5:
            nome_produto = filename.replace('.pdf', '').replace('_', ' ').replace('-', ' ')[:50]

    response = f"## ⏳ Baixando arquivo...\n\n**URL:** {url}\n\n"

    # 1. Baixar o arquivo
    resultado_download = tool_download_arquivo(url, user_id, nome_produto)

    if not resultado_download.get("success"):
        return f"❌ Erro ao baixar arquivo: {resultado_download.get('error')}", resultado_download

    filepath = resultado_download.get("filepath")
    filesize = resultado_download.get("size", 0)
    response += f"✅ Arquivo baixado: {resultado_download.get('filename')} ({filesize/1024:.1f} KB)\n\n"

    # 2. Se não tem nome do produto, pedir ao usuário
    if not nome_produto or nome_produto == "documento":
        response += """## ⚠️ Nome do produto não identificado

Envie o nome do produto para cadastrar. Exemplo:
`Cadastre como Analisador Bioquímico BS-240 da Mindray`

Ou informe mais detalhes:
`Cadastre como [nome], fabricante [fabricante], categoria [categoria]`"""
        return response, {
            "success": True,
            "status": "aguardando_nome_produto",
            "filepath": filepath,
            "filesize": filesize
        }

    # 3. Processar o arquivo e cadastrar produto
    response += f"## ⏳ Processando PDF e extraindo especificações...\n\n"

    # Determinar categoria automaticamente
    categoria = "equipamento"  # Padrão
    nome_lower = nome_produto.lower()
    if any(t in nome_lower for t in ["analisador", "bioquímic", "laborat"]):
        categoria = "equipamento"
    elif any(t in nome_lower for t in ["centrifuga", "microscop"]):
        categoria = "equipamento"
    elif any(t in nome_lower for t in ["cama", "maca", "cadeira"]):
        categoria = "mobiliario"
    elif any(t in nome_lower for t in ["monitor", "desfibrilador", "eletrocard"]):
        categoria = "equipamento"

    resultado_processo = tool_processar_upload(
        filepath=filepath,
        user_id=user_id,
        nome_produto=nome_produto,
        categoria=categoria,
        fabricante="Mindray" if "mindray" in message.lower() else None,
        modelo=None
    )

    if resultado_processo.get("success"):
        produto = resultado_processo.get("produto", {})
        specs = resultado_processo.get("especificacoes", [])

        response += f"""## ✅ Produto Cadastrado com Sucesso!

**Nome:** {produto.get('nome', nome_produto)}
**Categoria:** {categoria}
**Fabricante:** {produto.get('fabricante', 'Não informado')}

### Especificações Extraídas ({len(specs)} encontradas):
"""
        for spec in specs[:10]:  # Mostrar até 10 specs
            response += f"- **{spec.get('nome', 'N/A')}:** {spec.get('valor', 'N/A')}\n"

        if len(specs) > 10:
            response += f"\n... e mais {len(specs) - 10} especificações.\n"

        response += f"\n---\n✅ Produto pronto para calcular aderência com editais!"
    else:
        response += f"❌ Erro ao processar: {resultado_processo.get('error')}"

    return response, resultado_processo


def processar_cadastrar_fonte(message: str, user_id: str, intencao_resultado: dict = None):
    """Processa ação: Cadastrar fonte de editais"""
    intencao_resultado = intencao_resultado or {}

    # Verificar se a IA já extraiu os dados
    nome_fonte = intencao_resultado.get("nome_fonte")
    tipo_fonte = intencao_resultado.get("tipo_fonte")
    url_fonte = intencao_resultado.get("url_fonte")

    if nome_fonte and url_fonte:
        # Dados já extraídos pela IA
        resultado = tool_cadastrar_fonte(
            nome=nome_fonte,
            tipo=tipo_fonte or "scraper",
            url_base=url_fonte,
            descricao=f"Fonte cadastrada via chat: {nome_fonte}"
        )
        if resultado.get("success"):
            response = f"✅ Fonte **{nome_fonte}** cadastrada com sucesso!"
        else:
            response = f"❌ Erro ao cadastrar: {resultado.get('error')}"
        return response, resultado

    # Fallback: Tentar extrair informações da mensagem
    prompt = f"""Extraia as informações de fonte de editais da mensagem abaixo.
Retorne JSON com: nome, tipo (api ou scraper), url_base, descricao

Mensagem: {message}

JSON:"""

    try:
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=500)
        import json
        import re
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if json_match:
            dados = json.loads(json_match.group())
            resultado = tool_cadastrar_fonte(
                nome=dados.get('nome', 'Nova Fonte'),
                tipo=dados.get('tipo', 'scraper'),
                url_base=dados.get('url_base', ''),
                descricao=dados.get('descricao')
            )
            if resultado.get("success"):
                response = f"✅ Fonte **{dados.get('nome')}** cadastrada com sucesso!"
            else:
                response = f"❌ Erro ao cadastrar: {resultado.get('error')}"
            return response, resultado
    except Exception as e:
        pass

    # Se não conseguiu extrair, pedir mais informações
    response = """Para cadastrar uma fonte de editais, preciso de:
- **Nome**: Nome da fonte (ex: PNCP, BEC-SP)
- **Tipo**: api ou scraper
- **URL**: URL base da fonte

Exemplo: "Cadastre a fonte BEC-SP, tipo scraper, URL https://bec.sp.gov.br" """
    return response, {"status": "aguardando_dados"}


def processar_buscar_editais(message: str, user_id: str, termo_ia: str = None):
    """
    Processa ação: Buscar editais

    Novo fluxo:
    1. Busca editais (sem salvar)
    2. Calcula score de aderência para cada edital vs produtos do usuário
    3. Ordena por score
    4. Mostra recomendações (PARTICIPAR/AVALIAR/NÃO PARTICIPAR) com justificativas
    5. Oferece opção de salvar os recomendados

    Args:
        message: Mensagem original do usuário
        user_id: ID do usuário
        termo_ia: Termo de busca já extraído pelo agente classificador (opcional)
    """
    import json
    import re

    fonte = "PNCP"
    uf = None

    # Usar termo da IA se disponível, senão extrair da mensagem
    if termo_ia:
        termo = termo_ia
        print(f"[BUSCA] Usando termo da IA: '{termo}'")
    else:
        termo = None
        # Tentar extrair parâmetros com LLM (usar deepseek-chat para rapidez)
        prompt = f"""Extraia os parâmetros de busca de editais da mensagem.
Retorne APENAS um JSON válido com: fonte (PNCP, ComprasNet, BEC-SP ou null), termo (palavras-chave da busca), uf (sigla do estado com 2 letras ou null)

Mensagem: "{message}"

JSON:"""

        try:
            resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=200, model_override="deepseek-chat")
            json_match = re.search(r'\{[\s\S]*?\}', resposta)
            if json_match:
                dados = json.loads(json_match.group())
                fonte = dados.get('fonte') or 'PNCP'
                termo = dados.get('termo')
                uf = dados.get('uf')
        except Exception as e:
            print(f"Erro ao extrair parâmetros com LLM: {e}")

    # Fallback: extrair termos da própria mensagem
    if not termo:
        # Remover palavras comuns de comando
        palavras_ignorar = ['busque', 'buscar', 'procure', 'procurar', 'editais', 'edital', 'de', 'do', 'da',
                           'no', 'na', 'em', 'para', 'pncp', 'comprasnet', 'bec', 'sp', 'são', 'paulo',
                           'retorne', 'mostre', 'liste', 'quero', 'ver', 'todos', 'área', 'area']
        palavras = message.lower().split()
        termos = [p for p in palavras if p not in palavras_ignorar and len(p) > 2]
        termo = ' '.join(termos) if termos else message

    # Detectar UF na mensagem
    ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
    msg_upper = message.upper()
    for sigla in ufs:
        if f" {sigla} " in f" {msg_upper} " or msg_upper.endswith(f" {sigla}"):
            uf = sigla
            break
    # Detectar por nome do estado
    if "SÃO PAULO" in msg_upper or "SAO PAULO" in msg_upper:
        uf = "SP"
    elif "RIO DE JANEIRO" in msg_upper:
        uf = "RJ"
    elif "MINAS GERAIS" in msg_upper:
        uf = "MG"

    print(f"[BUSCA] Termo final: '{termo}', Fonte: '{fonte}', UF: '{uf}'")

    # ========== PASSO 1: Buscar editais (sem salvar) ==========
    resultado = tool_buscar_editais_fonte(fonte, termo, user_id, uf=uf)

    if not resultado.get("success"):
        response = f"Erro na busca: {resultado.get('error', 'Erro desconhecido')}"
        return response, resultado

    editais = resultado.get("editais", [])

    if not editais:
        mensagem = resultado.get("mensagem", f"Nenhum edital encontrado para '{termo}'.")
        response = f"""**Busca realizada:** {termo}
**Fonte:** {fonte}

⚠️ {mensagem}

**Sugestões:**
- Tente termos mais específicos (ex: "monitor LCD 24 polegadas")
- Verifique se há editais salvos: "liste meus editais"
- A API do PNCP pode estar temporariamente indisponível
"""
        return response, resultado

    # ========== PASSO 2: Calcular score de aderência ==========
    print(f"[APP] Calculando score de aderência para {len(editais)} editais...")
    resultado_score = tool_calcular_score_aderencia(editais, user_id)

    if resultado_score.get("success"):
        editais_com_score = resultado_score.get("editais_com_score", editais)
        aviso_produtos = resultado_score.get("aviso")
    else:
        editais_com_score = editais
        aviso_produtos = None

    # ========== PASSO 3: Formatar resposta com scores ==========
    response = f"""**Busca realizada:** {termo}
**Fonte:** {fonte}
**Resultados:** {len(editais_com_score)} edital(is) encontrado(s)

"""

    if aviso_produtos:
        response += f"⚠️ {aviso_produtos}\n\n"

    # Separar por recomendação
    participar = [e for e in editais_com_score if e.get('recomendacao') == 'PARTICIPAR']
    avaliar = [e for e in editais_com_score if e.get('recomendacao') == 'AVALIAR']
    nao_participar = [e for e in editais_com_score if e.get('recomendacao') == 'NÃO PARTICIPAR']
    sem_score = [e for e in editais_com_score if not e.get('recomendacao')]

    def formatar_edital(ed, i):
        """Formata um edital para exibição"""
        numero = ed.get('numero', 'N/A')
        orgao = ed.get('orgao', 'N/A')
        uf_ed = ed.get('uf', '')
        cidade = ed.get('cidade', '')
        local = f"{cidade}/{uf_ed}" if cidade and uf_ed else (uf_ed or cidade or 'Brasil')
        objeto = ed.get('objeto', '')[:200]
        valor = ed.get('valor_referencia')
        valor_str = f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.') if valor else "Não informado"
        data_abertura = ed.get('data_abertura', 'Não informada')
        modalidade = ed.get('modalidade', 'N/A')
        url = ed.get('url', '')
        score = ed.get('score_tecnico')
        justificativa = ed.get('justificativa', '')

        texto = f"---\n"
        texto += f"### {i}. {numero}"
        if score is not None:
            texto += f" | Score: **{score:.0f}%**"
        texto += "\n"
        texto += f"**Órgão:** {orgao} ({local})\n"
        texto += f"**Modalidade:** {modalidade}\n"
        texto += f"**Valor estimado:** {valor_str}\n"
        texto += f"**Data abertura:** {data_abertura}\n"
        texto += f"**Objeto:** {objeto}\n"
        if justificativa:
            texto += f"\n**Análise:** {justificativa}\n"
        if url:
            texto += f"\n🔗 [Acessar edital]({url})\n"
        texto += "\n"
        return texto

    contador = 1

    # Editais recomendados (PARTICIPAR)
    if participar:
        response += "## ✅ RECOMENDADOS PARA PARTICIPAR\n\n"
        for ed in participar:
            response += formatar_edital(ed, contador)
            contador += 1

    # Editais para avaliar
    if avaliar:
        response += "## ⚠️ AVALIAR PARTICIPAÇÃO\n\n"
        for ed in avaliar:
            response += formatar_edital(ed, contador)
            contador += 1

    # Editais não recomendados
    if nao_participar:
        response += "## ❌ NÃO RECOMENDADOS\n\n"
        for ed in nao_participar:
            response += formatar_edital(ed, contador)
            contador += 1

    # Sem score (sem produtos cadastrados)
    if sem_score:
        response += "## 📋 EDITAIS ENCONTRADOS\n\n"
        for ed in sem_score:
            response += formatar_edital(ed, contador)
            contador += 1

    # ========== PASSO 4: Oferecer salvamento ==========
    qtd_recomendados = len(participar) + len(avaliar)
    if qtd_recomendados > 0:
        response += f"\n---\n"
        response += f"**💾 {qtd_recomendados} edital(is) recomendado(s) para acompanhamento.**\n"
        response += f"Para salvar, digite: **\"salvar editais recomendados\"** ou **\"salvar edital [número]\"**\n"

    # Adicionar editais ao resultado para possível salvamento posterior
    resultado["editais_com_score"] = editais_com_score
    resultado["editais_recomendados"] = participar + avaliar

    return response, resultado


def processar_listar_produtos(message: str, user_id: str):
    """Processa ação: Listar produtos do usuário"""
    resultado = tool_listar_produtos(user_id)

    if resultado.get("success"):
        produtos = resultado.get("produtos", [])
        if produtos:
            response = f"**Seus produtos cadastrados:** {len(produtos)}\n\n"

            # Agrupar por categoria
            por_categoria = {}
            for p in produtos:
                cat = p.get("categoria", "outro")
                if cat not in por_categoria:
                    por_categoria[cat] = []
                por_categoria[cat].append(p)

            for cat, prods in sorted(por_categoria.items()):
                response += f"**[{cat.upper()}]**\n"
                for p in prods:
                    response += f"- {p['nome']} ({p.get('fabricante', 'N/A')} - {p.get('modelo', 'N/A')})\n"
                response += "\n"
        else:
            response = "Você não tem produtos cadastrados ainda. Faça upload de um manual PDF para cadastrar."
    else:
        response = f"Erro ao listar produtos: {resultado.get('error')}"

    return response, resultado


def processar_listar_fontes(message: str):
    """Processa ação: Listar fontes de editais"""
    resultado = tool_listar_fontes()

    if resultado.get("success"):
        fontes = resultado.get("fontes", [])
        if fontes:
            response = f"**Fontes de editais cadastradas:** {len(fontes)}\n\n"
            for f in fontes:
                status = "✅ Ativa" if f.get("ativo") else "❌ Inativa"
                response += f"- **{f['nome']}** ({f['tipo']}) {status}\n"
                response += f"  URL: {f.get('url_base', 'N/A')}\n"
                if f.get('descricao'):
                    response += f"  {f['descricao'][:100]}\n"
                response += "\n"
        else:
            response = "Nenhuma fonte de editais cadastrada."
    else:
        response = f"Erro ao listar fontes: {resultado.get('error')}"

    return response, resultado


def processar_buscar_editais_score(message: str, user_id: str):
    """Processa ação: Buscar editais + calcular score"""
    # Primeiro buscar editais
    response_busca, resultado_busca = processar_buscar_editais(message, user_id)

    if not resultado_busca.get("success"):
        return response_busca, resultado_busca

    # Depois calcular score para cada edital com os produtos do usuário
    produtos = tool_listar_produtos(user_id)

    if not produtos.get("produtos"):
        return response_busca + "\n\n⚠️ Você não tem produtos cadastrados para calcular aderência.", resultado_busca

    response = response_busca + "\n\n**Análise de Aderência:**\n"
    analises = []

    for edital in resultado_busca.get("editais", [])[:3]:
        for produto in produtos.get("produtos", [])[:2]:
            analise = tool_calcular_aderencia(produto["id"], edital["id"], user_id)
            if analise.get("success"):
                analises.append(analise)
                response += f"\n- {produto['nome']} x {edital['numero']}: **{analise.get('score_tecnico', 0):.0f}%** - {analise.get('recomendacao', '')}"

    resultado_busca["analises"] = analises
    return response, resultado_busca


def processar_listar_editais(message: str, user_id: str):
    """Processa ação: Listar editais salvos"""
    # Extrair filtros da mensagem
    uf = None
    status = None

    message_lower = message.lower()
    if " sp" in message_lower or "são paulo" in message_lower:
        uf = "SP"
    elif " rj" in message_lower or "rio de janeiro" in message_lower:
        uf = "RJ"
    elif " mg" in message_lower or "minas gerais" in message_lower:
        uf = "MG"

    if "novo" in message_lower:
        status = "novo"
    elif "analisando" in message_lower:
        status = "analisando"

    resultado = tool_listar_editais(user_id, status=status, uf=uf)

    if resultado.get("success"):
        editais = resultado.get("editais", [])
        if editais:
            response = f"**Editais salvos:** {len(editais)}\n\n"
            for i, ed in enumerate(editais[:10], 1):
                response += f"{i}. **{ed['numero']}** ({ed['status']})\n"
                response += f"   {ed['orgao']} - {ed['uf'] or 'N/A'}\n"
                response += f"   {ed['objeto'][:80]}...\n"
                if ed.get('url'):
                    response += f"   🔗 [Acessar edital]({ed['url']})\n"
                response += "\n"
        else:
            response = "Você não tem editais salvos ainda. Use 'Buscar editais' para encontrar oportunidades."
    else:
        response = f"Erro ao listar: {resultado.get('error')}"

    return response, resultado


def _encontrar_produto(produtos: list, message_lower: str):
    """Helper para encontrar produto por nome, modelo ou palavras-chave"""
    for p in produtos:
        nome_lower = p["nome"].lower()
        modelo_lower = p.get("modelo", "").lower()
        fabricante_lower = p.get("fabricante", "").lower()

        # Match exato do nome
        if nome_lower in message_lower:
            return p
        # Match por modelo completo
        if modelo_lower and modelo_lower in message_lower:
            return p
        # Match por parte principal do modelo (primeira palavra significativa)
        if modelo_lower:
            modelo_parts = modelo_lower.split()
            for part in modelo_parts:
                if len(part) >= 5 and part in message_lower:
                    return p
        # Match por fabricante + qualquer parte do modelo
        if fabricante_lower in message_lower:
            if modelo_lower:
                for part in modelo_lower.split():
                    if len(part) >= 3 and part in message_lower:
                        return p
        # Match parcial: qualquer palavra significativa do nome (>5 chars)
        palavras = nome_lower.split()
        for palavra in palavras:
            if len(palavra) > 5 and palavra in message_lower:
                return p
    return None


def processar_calcular_aderencia(message: str, user_id: str):
    """Processa ação: Calcular aderência"""
    # Listar produtos e editais disponíveis
    produtos = tool_listar_produtos(user_id)
    editais = tool_listar_editais(user_id)

    if not produtos.get("produtos"):
        return "Você não tem produtos cadastrados. Faça upload de um manual primeiro.", {"status": "sem_produtos"}

    if not editais.get("editais"):
        return "Você não tem editais salvos. Busque editais primeiro.", {"status": "sem_editais"}

    # Tentar identificar produto e edital na mensagem
    produto_encontrado = None
    edital_encontrado = None

    message_lower = message.lower()

    # Buscar produto - várias estratégias de match
    produto_encontrado = _encontrar_produto(produtos.get("produtos", []), message_lower)

    for e in editais.get("editais", []):
        if e["numero"].lower() in message_lower:
            edital_encontrado = e
            break

    if produto_encontrado and edital_encontrado:
        resultado = tool_calcular_aderencia(
            produto_encontrado["id"],
            edital_encontrado["id"],
            user_id
        )

        if resultado.get("success"):
            response = f"""**Análise de Aderência**

**Produto:** {resultado.get('produto')}
**Edital:** {resultado.get('edital')}

**Score Técnico:** {resultado.get('score_tecnico', 0):.1f}%

**Requisitos:**
- Total: {resultado.get('requisitos_total', 0)}
- Atendidos: {resultado.get('requisitos_atendidos', 0)}
- Parciais: {resultado.get('requisitos_parciais', 0)}
- Não atendidos: {resultado.get('requisitos_nao_atendidos', 0)}

**Recomendação:** {resultado.get('recomendacao', '')}
"""
            return response, resultado

    # Se não identificou, mostrar opções
    response = "Para calcular aderência, informe o produto e o edital.\n\n"
    response += "**Seus produtos:**\n"
    for p in produtos.get("produtos", [])[:5]:
        response += f"- {p['nome']}\n"
    response += "\n**Seus editais:**\n"
    for e in editais.get("editais", [])[:5]:
        response += f"- {e['numero']} ({e['orgao']})\n"
    response += "\nExemplo: 'Analise o Mindray BS-240 para o edital PE-2024-001'"

    return response, {"status": "aguardando_selecao", "produtos": produtos.get("produtos"), "editais": editais.get("editais")}


def processar_gerar_proposta(message: str, user_id: str):
    """Processa ação: Gerar proposta"""
    # Similar ao calcular aderência, precisa identificar produto e edital
    produtos = tool_listar_produtos(user_id)
    editais = tool_listar_editais(user_id)

    if not produtos.get("produtos") or not editais.get("editais"):
        return "Você precisa ter produtos e editais cadastrados para gerar uma proposta.", {"status": "incompleto"}

    # Tentar identificar e extrair preço
    produto_encontrado = None
    edital_encontrado = None
    preco = None

    message_lower = message.lower()

    # Usar helper para encontrar produto
    produto_encontrado = _encontrar_produto(produtos.get("produtos", []), message_lower)

    for e in editais.get("editais", []):
        if e["numero"].lower() in message_lower:
            edital_encontrado = e
            break

    # Extrair preço
    import re
    preco_match = re.search(r'R?\$?\s*([\d.,]+)', message)
    if preco_match:
        try:
            preco = float(preco_match.group(1).replace('.', '').replace(',', '.'))
        except:
            pass

    if produto_encontrado and edital_encontrado:
        resultado = tool_gerar_proposta(
            edital_encontrado["id"],
            produto_encontrado["id"],
            user_id,
            preco=preco
        )

        if resultado.get("success"):
            response = f"""**Proposta Gerada com Sucesso!**

**Edital:** {resultado.get('edital')}
**Produto:** {resultado.get('produto')}
**Status:** {resultado.get('status')}

---

{resultado.get('texto_proposta', '')[:3000]}...

---

A proposta completa foi salva. Use o endpoint /api/propostas/{resultado.get('proposta_id')} para acessá-la."""
            return response, resultado

    # Se não identificou, mostrar opções
    response = "Para gerar proposta, informe:\n- Produto\n- Edital\n- Preço (opcional)\n\n"
    response += "Exemplo: 'Gere proposta do Mindray BS-240 para edital PE-2024-001 com preço R$ 50.000'"

    return response, {"status": "aguardando_dados"}


def processar_salvar_editais(message: str, user_id: str, session_id: str, db):
    """
    Processa ação: Salvar editais

    Busca no histórico da sessão os editais da última busca e salva os recomendados
    ou os especificados pelo usuário.
    """
    import json
    import re

    msg_lower = message.lower()

    # Verificar se quer salvar todos os recomendados ou um específico
    salvar_todos = "recomendados" in msg_lower or "todos" in msg_lower

    # Buscar última mensagem de busca no histórico
    mensagens_anteriores = db.query(Message).filter(
        Message.session_id == session_id,
        Message.action_type == "buscar_editais",
        Message.role == "assistant"
    ).order_by(Message.created_at.desc()).first()

    if not mensagens_anteriores:
        return "Não encontrei uma busca de editais recente. Execute primeiro: **buscar editais de [tema]**", {"status": "sem_busca"}

    # Tentar recuperar editais do contexto (resultado JSON salvo na mensagem)
    # Como não temos isso armazenado, vamos fazer uma nova busca simplificada
    # ou pedir para o usuário re-executar

    # Buscar última mensagem do usuário com busca
    ultima_busca_user = db.query(Message).filter(
        Message.session_id == session_id,
        Message.action_type == "buscar_editais",
        Message.role == "user"
    ).order_by(Message.created_at.desc()).first()

    if ultima_busca_user:
        # Re-executar a busca para obter os dados
        print(f"[APP] Re-executando busca para salvar: {ultima_busca_user.content}")
        _, resultado_busca = processar_buscar_editais(ultima_busca_user.content, user_id)

        if not resultado_busca.get("success"):
            return "Erro ao recuperar editais da busca anterior. Tente buscar novamente.", {"status": "erro_busca"}

        editais_para_salvar = []

        if salvar_todos:
            # Salvar todos os recomendados (PARTICIPAR e AVALIAR)
            editais_para_salvar = resultado_busca.get("editais_recomendados", [])
            if not editais_para_salvar:
                # Se não há recomendados, pegar os com score > 50
                editais_com_score = resultado_busca.get("editais_com_score", [])
                editais_para_salvar = [e for e in editais_com_score if e.get("score_tecnico", 0) >= 50]
        else:
            # Tentar extrair número específico do edital
            numero_match = re.search(r'edital\s+(\S+)', msg_lower)
            if numero_match:
                numero_busca = numero_match.group(1).upper()
                editais_com_score = resultado_busca.get("editais_com_score", [])
                for ed in editais_com_score:
                    if numero_busca in ed.get("numero", "").upper():
                        editais_para_salvar.append(ed)
                        break

        if not editais_para_salvar:
            return """Não encontrei editais para salvar.

**Opções:**
- Digite: **salvar editais recomendados** para salvar todos os recomendados
- Digite: **salvar edital [número]** para salvar um específico
- Execute uma nova busca: **buscar editais de [tema]**
""", {"status": "sem_editais"}

        # Salvar os editais selecionados (com verificação de duplicatas)
        resultado_salvar = tool_salvar_editais_selecionados(editais_para_salvar, user_id)

        if resultado_salvar.get("success"):
            salvos = resultado_salvar.get("salvos", [])
            duplicados = resultado_salvar.get("duplicados", [])
            erros = resultado_salvar.get("erros", [])

            response = "## 💾 Resultado do Salvamento\n\n"

            if salvos:
                response += f"**✅ Salvos com sucesso:** {len(salvos)} edital(is)\n"
                for num in salvos[:5]:
                    response += f"- {num}\n"
                if len(salvos) > 5:
                    response += f"- ... e mais {len(salvos) - 5}\n"
                response += "\n"

            if duplicados:
                response += f"**⚠️ Já existentes (ignorados):** {len(duplicados)} edital(is)\n"
                for num in duplicados[:3]:
                    response += f"- {num}\n"
                response += "\n"

            if erros:
                response += f"**❌ Erros:** {len(erros)}\n"
                for err in erros[:3]:
                    response += f"- {err}\n"
                response += "\n"

            response += "Use **liste meus editais** para ver todos os editais salvos."

            return response, resultado_salvar
        else:
            return f"Erro ao salvar editais: {resultado_salvar.get('error')}", resultado_salvar

    return "Não consegui identificar a última busca. Execute: **buscar editais de [tema]**", {"status": "sem_contexto"}


def processar_chat_livre(message: str, user_id: str, session_id: str, db):
    """Processa chat livre sobre licitações"""
    # Buscar histórico
    historico = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at.desc()).limit(MAX_HISTORY_MESSAGES).all()

    historico = list(reversed(historico))

    # Montar mensagens
    system_prompt = """Você é um especialista em licitações públicas brasileiras.
Seu conhecimento inclui:
- Lei 14.133/2021 (Nova Lei de Licitações)
- Pregão eletrônico e presencial
- Elaboração de propostas técnicas
- Análise de editais
- Impugnações e recursos
- Comodato de equipamentos
- Contratos administrativos

Responda de forma clara, objetiva e fundamentada na legislação quando aplicável."""

    messages = [{"role": "system", "content": system_prompt}]

    for msg in historico:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": message})

    try:
        response = call_deepseek(messages, max_tokens=4000)
        return response
    except Exception as e:
        return f"Erro ao processar: {str(e)}"


# =============================================================================
# Upload Routes
# =============================================================================

@app.route("/api/upload", methods=["POST"])
@require_auth
def upload_manual():
    """
    Upload de manual PDF para extração de especificações.

    Form data:
    - file: arquivo PDF
    - nome_produto: nome do produto
    - categoria: equipamento, reagente, insumo_hospitalar, insumo_laboratorial
    - fabricante: (opcional)
    - modelo: (opcional)
    """
    user_id = get_current_user_id()

    if 'file' not in request.files:
        return jsonify({"error": "Arquivo não enviado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    nome_produto = request.form.get('nome_produto')
    categoria = request.form.get('categoria', 'equipamento')
    fabricante = request.form.get('fabricante')
    modelo = request.form.get('modelo')

    if not nome_produto:
        return jsonify({"error": "nome_produto é obrigatório"}), 400

    # Salvar arquivo
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = f"{user_id}_{uuid.uuid4().hex[:8]}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Processar
    resultado = tool_processar_upload(
        filepath=filepath,
        user_id=user_id,
        nome_produto=nome_produto,
        categoria=categoria,
        fabricante=fabricante,
        modelo=modelo
    )

    if resultado.get("success"):
        return jsonify(resultado), 201
    else:
        return jsonify(resultado), 400


@app.route("/api/chat-upload", methods=["POST"])
@require_auth
def chat_upload():
    """
    Envia mensagem com arquivo anexo.
    O agente classificador interpreta a intenção do usuário.

    Form data:
    - file: arquivo PDF
    - session_id: ID da sessão de chat
    - message: mensagem do usuário (opcional)
    """
    user_id = get_current_user_id()

    if 'file' not in request.files:
        return jsonify({"error": "Arquivo não enviado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    session_id = request.form.get('session_id')
    message = request.form.get('message', '').strip()

    if not session_id:
        return jsonify({"error": "session_id é obrigatório"}), 400

    # ========== USAR AGENTE CLASSIFICADOR ==========
    print(f"[CHAT-UPLOAD] Classificando intenção: '{message}' (tem_arquivo=True)")
    intencao_resultado = detectar_intencao_ia(message, tem_arquivo=True)
    intencao_arquivo = intencao_resultado.get("intencao", "arquivo_cadastrar")
    nome_produto = intencao_resultado.get("nome_produto")
    print(f"[CHAT-UPLOAD] Intenção detectada: {intencao_arquivo}")

    # Mapear intenções do classificador para ações internas
    mapa_intencoes = {
        "arquivo_cadastrar": "cadastrar",
        "arquivo_mostrar": "mostrar_conteudo",
        "arquivo_specs": "extrair_specs",
        "arquivo_resumir": "resumir",
        "arquivo_analisar": "analisar",
        # Fallbacks para compatibilidade
        "upload_manual": "cadastrar",
        "chat_livre": "cadastrar"  # Se não entendeu, cadastra
    }
    intencao_arquivo = mapa_intencoes.get(intencao_arquivo, "cadastrar")

    db = get_db()
    try:
        # Verificar sessão
        session = db.query(Session).filter(
            Session.id == session_id,
            Session.user_id == user_id
        ).first()

        if not session:
            return jsonify({"error": "Sessão não encontrada"}), 404

        # Salvar arquivo
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Extrair texto do PDF
        import fitz
        texto_pdf = ""
        try:
            doc = fitz.open(filepath)
            for page in doc:
                texto_pdf += page.get_text()
            doc.close()
        except Exception as e:
            texto_pdf = f"Erro ao extrair texto: {e}"

        # Salvar mensagem do usuário
        acoes_desc = {
            "cadastrar": "Cadastrar como produto",
            "mostrar_conteudo": "Mostrar conteúdo",
            "extrair_specs": "Extrair especificações",
            "resumir": "Resumir documento",
            "analisar": "Analisar documento"
        }
        user_msg_content = f"📎 **{file.filename}**\n*{acoes_desc.get(intencao_arquivo, 'Processar')}*"
        user_msg = Message(
            session_id=session_id,
            role='user',
            content=user_msg_content,
            action_type='upload_manual'
        )
        db.add(user_msg)

        resultado = {"success": True}
        response_text = ""

        # ========== AÇÃO: MOSTRAR CONTEÚDO ==========
        if intencao_arquivo == "mostrar_conteudo":
            response_text = f"""## 📄 Conteúdo do Documento

**Arquivo:** {file.filename}
**Tamanho:** {len(texto_pdf)} caracteres

---

{texto_pdf[:5000]}

{"..." if len(texto_pdf) > 5000 else ""}

---
*Para cadastrar como produto, envie: "cadastre"*"""

        # ========== AÇÃO: EXTRAIR SPECS (sem cadastrar) ==========
        elif intencao_arquivo == "extrair_specs":
            # info e specs já importados no topo
            info = _extrair_info_produto(texto_pdf[:8000])

            # Extrair specs via IA
            prompt = PROMPT_EXTRAIR_SPECS.format(texto=texto_pdf[:15000])
            resposta_ia = call_deepseek([{"role": "user", "content": prompt}], max_tokens=8000)

            response_text = f"""## 📊 Especificações Extraídas

**Produto identificado:** {info.get('nome', 'N/A')}
**Fabricante:** {info.get('fabricante', 'N/A')}
**Modelo:** {info.get('modelo', 'N/A')}

### Especificações:

{resposta_ia[:4000]}

---
*Para cadastrar como produto, envie: "cadastre"*"""

        # ========== AÇÃO: RESUMIR ==========
        elif intencao_arquivo == "resumir":
            prompt_resumo = f"""Resuma o documento abaixo em português, destacando:
1. Tipo de documento (manual, datasheet, etc)
2. Produto/equipamento descrito
3. Principais características
4. Pontos importantes

DOCUMENTO:
{texto_pdf[:10000]}

RESUMO:"""
            resumo = call_deepseek([{"role": "user", "content": prompt_resumo}], max_tokens=2000, model_override="deepseek-chat")

            response_text = f"""## 📝 Resumo do Documento

**Arquivo:** {file.filename}

{resumo}

---
*Para cadastrar como produto, envie: "cadastre"*"""

        # ========== AÇÃO: ANALISAR ==========
        elif intencao_arquivo == "analisar":
            prompt_analise = f"""Analise o documento técnico abaixo e forneça:
1. Tipo de documento
2. Produto/equipamento descrito
3. Fabricante
4. Principais especificações técnicas
5. Aplicações/uso indicado
6. Pontos fortes e fracos (se identificáveis)

DOCUMENTO:
{texto_pdf[:12000]}

ANÁLISE:"""
            analise = call_deepseek([{"role": "user", "content": prompt_analise}], max_tokens=3000, model_override="deepseek-chat")

            response_text = f"""## 🔍 Análise do Documento

**Arquivo:** {file.filename}

{analise}

---
*Para cadastrar como produto, envie: "cadastre"*"""

        # ========== AÇÃO: CADASTRAR (padrão) ==========
        else:
            resultado = tool_processar_upload(
                filepath=filepath,
                user_id=user_id,
                nome_produto=nome_produto,
                categoria=None,
                fabricante=None,
                modelo=None
            )

            if resultado.get("success"):
                produto = resultado.get("produto", {})
                specs = resultado.get("especificacoes", [])

                response_text = f"""## ✅ Produto Cadastrado com Sucesso!

**Nome:** {produto.get('nome', 'N/A')}
**Fabricante:** {produto.get('fabricante', 'Não identificado')}
**Modelo:** {produto.get('modelo', 'Não identificado')}
**Categoria:** {produto.get('categoria', 'equipamento')}
**ID:** {produto.get('id', 'N/A')}

### Especificações Extraídas ({len(specs)} encontradas):
"""
                for spec in specs[:15]:
                    response_text += f"- **{spec.get('nome', 'N/A')}:** {spec.get('valor', 'N/A')}\n"

                if len(specs) > 15:
                    response_text += f"\n... e mais {len(specs) - 15} especificações.\n"

                response_text += "\n---\n✅ Produto pronto para calcular aderência com editais!"
            else:
                response_text = f"❌ Erro ao processar arquivo: {resultado.get('error', 'Erro desconhecido')}"

        # Salvar resposta do assistente
        assistant_msg = Message(
            session_id=session_id,
            role='assistant',
            content=response_text,
            action_type='upload_manual'
        )
        db.add(assistant_msg)

        # Atualizar sessão
        session.updated_at = datetime.now()
        db.commit()

        return jsonify({
            "success": resultado.get("success", False),
            "response": response_text,
            "session_id": session_id,
            "action_type": "upload_manual"
        })

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/upload-chat", methods=["POST"])
@require_auth
def upload_chat():
    """
    DEPRECATED - Use /api/chat-upload instead.
    Mantido para compatibilidade.
    """
    user_id = get_current_user_id()

    if 'file' not in request.files:
        return jsonify({"error": "Arquivo não enviado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    session_id = request.form.get('session_id')
    nome_produto = request.form.get('nome_produto', '').strip()

    if not session_id:
        return jsonify({"error": "session_id é obrigatório"}), 400
    if not nome_produto:
        return jsonify({"error": "nome_produto é obrigatório"}), 400

    db = get_db()
    try:
        # Verificar sessão
        session = db.query(Session).filter(
            Session.id == session_id,
            Session.user_id == user_id
        ).first()

        if not session:
            return jsonify({"error": "Sessão não encontrada"}), 404

        # Salvar arquivo
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Salvar mensagem do usuário
        user_msg_content = f"📎 Upload: **{file.filename}**\nCadastrar como: **{nome_produto}**"
        user_msg = Message(
            session_id=session_id,
            role='user',
            content=user_msg_content,
            action_type='upload_manual'
        )
        db.add(user_msg)

        # Determinar categoria automaticamente
        categoria = "equipamento"
        nome_lower = nome_produto.lower()
        if any(t in nome_lower for t in ["analisador", "bioquímic", "laborat"]):
            categoria = "equipamento"
        elif any(t in nome_lower for t in ["centrifuga", "microscop"]):
            categoria = "equipamento"
        elif any(t in nome_lower for t in ["cama", "maca", "cadeira"]):
            categoria = "mobiliario"
        elif any(t in nome_lower for t in ["monitor", "desfibrilador", "eletrocard"]):
            categoria = "equipamento"

        # Processar arquivo
        resultado = tool_processar_upload(
            filepath=filepath,
            user_id=user_id,
            nome_produto=nome_produto,
            categoria=categoria,
            fabricante=None,
            modelo=None
        )

        # Montar resposta
        if resultado.get("success"):
            produto = resultado.get("produto", {})
            specs = resultado.get("especificacoes", [])

            response_text = f"""## ✅ Produto Cadastrado com Sucesso!

**Nome:** {produto.get('nome', nome_produto)}
**Categoria:** {categoria}
**ID:** {produto.get('id', 'N/A')}

### Especificações Extraídas ({len(specs)} encontradas):
"""
            for spec in specs[:15]:
                response_text += f"- **{spec.get('nome', 'N/A')}:** {spec.get('valor', 'N/A')}\n"

            if len(specs) > 15:
                response_text += f"\n... e mais {len(specs) - 15} especificações.\n"

            response_text += "\n---\n✅ Produto pronto para calcular aderência com editais!"
        else:
            response_text = f"❌ Erro ao processar arquivo: {resultado.get('error', 'Erro desconhecido')}"

        # Salvar resposta do assistente
        assistant_msg = Message(
            session_id=session_id,
            role='assistant',
            content=response_text,
            action_type='upload_manual'
        )
        db.add(assistant_msg)

        # Atualizar sessão
        session.updated_at = datetime.now()
        db.commit()

        return jsonify({
            "success": resultado.get("success", False),
            "response": response_text,
            "session_id": session_id,
            "produto": resultado.get("produto"),
            "especificacoes_extraidas": len(resultado.get("especificacoes", []))
        })

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# =============================================================================
# Session Routes
# =============================================================================

@app.route("/api/sessions", methods=["GET"])
@require_auth
def get_sessions():
    user_id = get_current_user_id()
    db = get_db()
    try:
        sessions = db.query(Session).filter(
            Session.user_id == user_id
        ).order_by(Session.updated_at.desc()).all()

        return jsonify({"sessions": [s.to_dict() for s in sessions]})
    finally:
        db.close()


@app.route("/api/sessions", methods=["POST"])
@require_auth
def new_session():
    user_id = get_current_user_id()
    data = request.json or {}
    name = data.get("name", "Nova conversa")

    db = get_db()
    try:
        session = Session(user_id=user_id, name=name)
        db.add(session)
        db.commit()
        return jsonify(session.to_dict()), 201
    finally:
        db.close()


@app.route("/api/sessions/<session_id>", methods=["GET"])
@require_auth
def get_session_detail(session_id):
    user_id = get_current_user_id()
    db = get_db()
    try:
        session = db.query(Session).filter(
            Session.id == session_id,
            Session.user_id == user_id
        ).first()

        if not session:
            return jsonify({"error": "Sessão não encontrada"}), 404

        return jsonify(session.to_dict(include_messages=True))
    finally:
        db.close()


@app.route("/api/sessions/<session_id>", methods=["DELETE"])
@require_auth
def delete_session(session_id):
    user_id = get_current_user_id()
    db = get_db()
    try:
        session = db.query(Session).filter(
            Session.id == session_id,
            Session.user_id == user_id
        ).first()

        if not session:
            return jsonify({"error": "Sessão não encontrada"}), 404

        db.delete(session)
        db.commit()
        return jsonify({"message": "Sessão excluída"})
    finally:
        db.close()


@app.route("/api/sessions/<session_id>", methods=["PATCH"])
@require_auth
def update_session(session_id):
    user_id = get_current_user_id()
    data = request.json or {}
    new_name = data.get("name")

    if not new_name:
        return jsonify({"error": "name é obrigatório"}), 400

    db = get_db()
    try:
        session = db.query(Session).filter(
            Session.id == session_id,
            Session.user_id == user_id
        ).first()

        if not session:
            return jsonify({"error": "Sessão não encontrada"}), 404

        session.name = new_name
        db.commit()
        return jsonify({"message": "Sessão renomeada", "name": new_name})
    finally:
        db.close()


# =============================================================================
# Produtos Routes
# =============================================================================

@app.route("/api/produtos", methods=["GET"])
@require_auth
def listar_produtos_api():
    user_id = get_current_user_id()
    categoria = request.args.get("categoria")
    nome = request.args.get("nome")

    resultado = tool_listar_produtos(user_id, categoria=categoria, nome=nome)
    return jsonify(resultado)


@app.route("/api/produtos/<produto_id>", methods=["GET"])
@require_auth
def get_produto(produto_id):
    user_id = get_current_user_id()
    db = get_db()
    try:
        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        if not produto:
            return jsonify({"error": "Produto não encontrado"}), 404

        return jsonify(produto.to_dict(include_specs=True))
    finally:
        db.close()


# =============================================================================
# Editais Routes
# =============================================================================

@app.route("/api/editais", methods=["GET"])
@require_auth
def listar_editais_api():
    user_id = get_current_user_id()
    status = request.args.get("status")
    uf = request.args.get("uf")
    categoria = request.args.get("categoria")

    resultado = tool_listar_editais(user_id, status=status, uf=uf, categoria=categoria)
    return jsonify(resultado)


@app.route("/api/editais/<edital_id>", methods=["GET"])
@require_auth
def get_edital(edital_id):
    user_id = get_current_user_id()
    db = get_db()
    try:
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not edital:
            return jsonify({"error": "Edital não encontrado"}), 404

        return jsonify(edital.to_dict(include_requisitos=True))
    finally:
        db.close()


# =============================================================================
# Fontes Routes
# =============================================================================

@app.route("/api/fontes", methods=["GET"])
def listar_fontes_api():
    resultado = tool_listar_fontes()
    return jsonify(resultado)


# =============================================================================
# Análises Routes
# =============================================================================

@app.route("/api/analises", methods=["GET"])
@require_auth
def listar_analises():
    user_id = get_current_user_id()
    db = get_db()
    try:
        analises = db.query(Analise).filter(
            Analise.user_id == user_id
        ).order_by(Analise.created_at.desc()).limit(50).all()

        return jsonify({"analises": [a.to_dict() for a in analises]})
    finally:
        db.close()


@app.route("/api/analises/<analise_id>", methods=["GET"])
@require_auth
def get_analise(analise_id):
    user_id = get_current_user_id()
    db = get_db()
    try:
        analise = db.query(Analise).filter(
            Analise.id == analise_id,
            Analise.user_id == user_id
        ).first()

        if not analise:
            return jsonify({"error": "Análise não encontrada"}), 404

        return jsonify(analise.to_dict(include_detalhes=True))
    finally:
        db.close()


# =============================================================================
# Propostas Routes
# =============================================================================

@app.route("/api/propostas", methods=["GET"])
@require_auth
def listar_propostas():
    user_id = get_current_user_id()
    db = get_db()
    try:
        propostas = db.query(Proposta).filter(
            Proposta.user_id == user_id
        ).order_by(Proposta.created_at.desc()).limit(50).all()

        return jsonify({"propostas": [p.to_dict() for p in propostas]})
    finally:
        db.close()


@app.route("/api/propostas/<proposta_id>", methods=["GET"])
@require_auth
def get_proposta(proposta_id):
    user_id = get_current_user_id()
    db = get_db()
    try:
        proposta = db.query(Proposta).filter(
            Proposta.id == proposta_id,
            Proposta.user_id == user_id
        ).first()

        if not proposta:
            return jsonify({"error": "Proposta não encontrada"}), 404

        return jsonify(proposta.to_dict())
    finally:
        db.close()


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 50)
    print("AGENTE DE EDITAIS - MVP")
    print("=" * 50)

    # Criar pasta de uploads
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    print("Inicializando banco de dados...")
    init_db()

    print("Servidor pronto na porta 5007!")
    print("=" * 50)

    app.run(host="0.0.0.0", port=5007, debug=True)
