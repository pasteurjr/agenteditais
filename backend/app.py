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
    execute_tool
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


def detectar_intencao(message: str) -> str:
    """Detecta automaticamente a intenção do usuário baseado na mensagem."""
    msg = message.lower()

    # Listar produtos
    if any(p in msg for p in ["liste meus produtos", "listar produtos", "meus produtos", "produtos cadastrados", "quais produtos"]):
        return "listar_produtos"

    # Listar editais (salvos/cadastrados)
    if any(p in msg for p in ["liste editais", "listar editais", "editais abertos", "quais editais", "meus editais", "editais salvos", "editais cadastrados"]):
        return "listar_editais"

    # Calcular aderência
    if any(p in msg for p in ["calcul", "aderência", "aderencia", "analise", "analisar", "score", "atende", "compatível", "compativel"]):
        if any(p in msg for p in ["edital", "pe-", "pregão", "pregao", "licitação", "licitacao"]):
            return "calcular_aderencia"

    # Gerar proposta
    if any(p in msg for p in ["gere proposta", "gerar proposta", "proposta técnica", "proposta tecnica", "elabore proposta", "crie proposta"]):
        return "gerar_proposta"

    # Buscar editais (na web/PNCP) - detecção mais flexível
    busca_palavras = ["busque", "buscar", "procure", "procurar", "encontre", "encontrar", "pesquise", "pesquisar"]
    edital_palavras = ["edital", "editais", "licitação", "licitações", "licitacao", "licitacoes", "pregão", "pregao"]
    if any(b in msg for b in busca_palavras) and any(e in msg for e in edital_palavras):
        return "buscar_editais"

    # Cadastrar fonte
    if any(p in msg for p in ["cadastre fonte", "cadastrar fonte", "adicione fonte", "adicionar fonte", "nova fonte"]):
        return "cadastrar_fonte"

    # Listar fontes
    if any(p in msg for p in ["fontes cadastradas", "listar fontes", "quais fontes", "minhas fontes"]):
        return "listar_fontes"

    # Buscar material na web
    if any(p in msg for p in ["busque na web", "buscar na web", "baixe pdf", "baixar pdf", "download", "busque datasheet"]):
        return "buscar_material_web"

    # Chat livre (default)
    return "chat_livre"


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

        # Detectar intenção automaticamente
        action_type = detectar_intencao(message)

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

        if action_type == "buscar_material_web":
            response_text, resultado = processar_buscar_material_web(message, user_id)

        elif action_type == "cadastrar_fonte":
            response_text, resultado = processar_cadastrar_fonte(message, user_id)

        elif action_type == "buscar_editais":
            response_text, resultado = processar_buscar_editais(message, user_id)

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

def processar_buscar_material_web(message: str, user_id: str):
    """Processa ação: Buscar material na web"""
    resultado = tool_web_search(message, user_id)
    if resultado.get("success"):
        response = f"""**Busca realizada:** {message}

{resultado.get('instrucao', '')}

{resultado.get('sugestao', '')}

Para baixar um arquivo específico, forneça a URL direta do PDF."""
    else:
        response = f"Erro na busca: {resultado.get('error', 'Erro desconhecido')}"
    return response, resultado


def processar_cadastrar_fonte(message: str, user_id: str):
    """Processa ação: Cadastrar fonte de editais"""
    # Tentar extrair informações da mensagem
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


def processar_buscar_editais(message: str, user_id: str):
    """Processa ação: Buscar editais"""
    import json
    import re

    termo = None
    fonte = "PNCP"
    uf = None

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
                           'no', 'na', 'em', 'para', 'pncp', 'comprasnet', 'bec', 'sp', 'são', 'paulo']
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

    print(f"DEBUG buscar_editais: termo='{termo}', fonte='{fonte}', uf='{uf}'")

    # Fazer a busca
    resultado = tool_buscar_editais_fonte(fonte, termo, user_id, uf=uf)

    if resultado.get("success"):
        editais = resultado.get("editais", [])
        response = f"""**Busca realizada:** {termo}
**Fonte:** {fonte}
**Resultados:** {len(editais)} edital(is) encontrado(s)

"""
        for i, ed in enumerate(editais[:10], 1):
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
            status = ed.get('status', 'novo')
            url = ed.get('url', '')

            response += f"---\n"
            response += f"### {i}. {numero}\n"
            response += f"**Órgão:** {orgao} ({local})\n"
            response += f"**Modalidade:** {modalidade} | **Status:** {status}\n"
            response += f"**Valor estimado:** {valor_str}\n"
            response += f"**Data abertura:** {data_abertura}\n"
            response += f"**Objeto:** {objeto}\n"
            if url:
                response += f"**🔗 Link:** [{url}]({url})\n"
            response += "\n"

        return response, resultado
    elif resultado.get("success") and resultado.get("total", 0) == 0:
        # Busca bem sucedida mas sem resultados
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
    else:
        response = f"Erro na busca: {resultado.get('error', 'Erro desconhecido')}"
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
