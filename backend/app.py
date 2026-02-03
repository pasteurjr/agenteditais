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
    tool_buscar_editais_fonte, tool_buscar_editais_scraper, tool_extrair_requisitos,
    tool_listar_editais, tool_listar_produtos, tool_calcular_aderencia, tool_gerar_proposta,
    tool_calcular_score_aderencia, tool_salvar_editais_selecionados,
    tool_reprocessar_produto, tool_atualizar_produto,
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
    # === CONSULTAS ANALÍTICAS (MindsDB) ===
    {"id": "mindsdb_totais", "nome": "📊 Totais (produtos/editais)", "prompt": "Quantos produtos e editais existem no banco?"},
    {"id": "mindsdb_editais_novos", "nome": "📊 Editais com status novo", "prompt": "Quais editais estão com status novo?"},
    {"id": "mindsdb_editais_orgao", "nome": "📊 Editais por órgão", "prompt": "Liste editais do Ministério da Saúde"},
    {"id": "mindsdb_editais_mes", "nome": "📊 Editais do mês", "prompt": "Quais editais têm data de abertura em fevereiro de 2026?"},
    {"id": "mindsdb_score_medio", "nome": "📊 Score médio de aderência", "prompt": "Qual é o score médio de aderência das análises?"},
    {"id": "mindsdb_produtos_categoria", "nome": "📊 Produtos por categoria", "prompt": "Quantos produtos temos em cada categoria?"},
    {"id": "mindsdb_alta_aderencia", "nome": "📊 Produtos c/ alta aderência", "prompt": "Quais produtos têm aderência acima de 70% em algum edital?"},
    {"id": "mindsdb_propostas", "nome": "📊 Total de propostas", "prompt": "Quantas propostas foram geradas?"},
    {"id": "mindsdb_editais_semana", "nome": "📊 Editais da semana", "prompt": "Quais editais vencem esta semana?"},
    {"id": "mindsdb_melhor_produto", "nome": "📊 Produto c/ melhor score", "prompt": "Qual produto tem o melhor score de aderência?"},
    {"id": "mindsdb_editais_uf", "nome": "📊 Editais por UF", "prompt": "Quantos editais temos por estado (UF)?"},
    {"id": "mindsdb_resumo", "nome": "📊 Resumo geral do banco", "prompt": "Faça um resumo do banco: total de produtos, editais, análises e propostas"},
    # === AÇÕES DO SISTEMA ===
    {"id": "listar_produtos", "nome": "Listar meus produtos", "prompt": "Liste todos os meus produtos cadastrados"},
    {"id": "listar_editais", "nome": "Listar editais abertos", "prompt": "Quais editais estão abertos?"},
    {"id": "calcular_aderencia", "nome": "Calcular aderência", "prompt": "Calcule a aderência do produto [NOME_PRODUTO] ao edital [NUMERO_EDITAL]"},
    {"id": "gerar_proposta", "nome": "Gerar proposta", "prompt": "Gere uma proposta do produto [NOME_PRODUTO] para o edital [NUMERO_EDITAL] com preço R$ [VALOR]"},
    {"id": "buscar_editais", "nome": "Buscar editais", "prompt": "Busque editais de [TERMO] no PNCP"},
    {"id": "cadastrar_fonte", "nome": "Cadastrar fonte", "prompt": "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]"},
    {"id": "listar_fontes", "nome": "Listar fontes", "prompt": "Quais são as fontes de editais cadastradas?"},
    {"id": "ajuda", "nome": "O que posso fazer?", "prompt": "O que você pode fazer? Quais são suas capacidades?"},
    # === REGISTRO DE RESULTADOS (Sprint 1) ===
    {"id": "registrar_derrota", "nome": "📉 Registrar derrota", "prompt": "Perdemos o edital [NUMERO] para [EMPRESA] com R$ [VALOR_VENCEDOR], nosso preço foi R$ [NOSSO_VALOR]"},
    {"id": "registrar_vitoria", "nome": "🏆 Registrar vitória", "prompt": "Ganhamos o edital [NUMERO] com R$ [VALOR]"},
    {"id": "registrar_cancelado", "nome": "⛔ Edital cancelado", "prompt": "O edital [NUMERO] foi cancelado"},
    {"id": "consultar_resultado", "nome": "🔎 Consultar resultado", "prompt": "Qual o resultado do edital [NUMERO]?"},
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

12. **listar_propostas**: Ver propostas técnicas geradas
    Exemplos: "liste minhas propostas", "quais propostas tenho", "propostas geradas", "ver propostas"

### AÇÕES DE PROCESSAMENTO:
13. **calcular_aderencia**: Calcular score produto vs edital
    Exemplos: "calcule aderência do produto X com edital Y"

14. **gerar_proposta**: Gerar proposta técnica
    Exemplos: "gere proposta para o edital X"

15. **cadastrar_fonte**: Cadastrar nova fonte de editais
    Exemplos: "cadastre a fonte BEC-SP"

16. **salvar_editais**: Salvar editais da última busca
    Exemplos: "salve os editais", "salvar recomendados"

17. **reprocessar_produto**: Reprocessar/atualizar especificações de um produto
    Exemplos: "reprocesse o produto X", "atualize specs do produto X", "extraia novamente as especificações"

18. **consulta_mindsdb**: Consultas analíticas complexas sobre editais e produtos via linguagem natural
    Exemplos: "qual o score médio de aderência?", "quantos editais por estado?", "qual produto tem melhor desempenho?", "estatísticas dos editais", "análise dos dados", "relatório de editais"
    Use quando: perguntas analíticas, estatísticas, agregações, comparações, rankings, tendências

19. **registrar_resultado**: Registrar resultado de certame (vitória ou derrota) - AFIRMAÇÕES
    Exemplos: "perdemos o edital PE-001", "ganhamos o pregão", "vencedor foi empresa X com R$ 100k", "registre derrota no PE-002", "perdemos por preço para MedLab"
    Palavras-chave: perdemos, ganhamos, vencedor, derrota, vitória, segundo lugar
    IMPORTANTE: Use apenas quando o usuário está AFIRMANDO um resultado, não perguntando.

20. **consultar_resultado**: Consultar/perguntar sobre resultado de certames - PERGUNTAS
    Exemplos: "qual o resultado do edital PE-001?", "quem ganhou o pregão?", "como foi o edital?", "mostre os resultados de todos os editais", "ver resultados dos editais", "listar resultados", "resultados dos certames"
    Palavras-chave: qual o resultado, quem ganhou, quem venceu, como foi, resultados de todos, ver resultados, listar resultados
    IMPORTANTE: Use quando o usuário está PERGUNTANDO sobre resultados (um edital ou todos).

21. **chat_livre**: Dúvidas gerais, conversas
    Exemplos: "o que é pregão?", "olá", "obrigado"

## CONTEXTO IMPORTANTE:
- **tem_arquivo**: {tem_arquivo} (true se usuário enviou um arquivo junto com a mensagem)
- Se tem_arquivo=true E mensagem vazia ou genérica → **arquivo_cadastrar**
- Se tem_arquivo=true E pede para mostrar/ler → **arquivo_mostrar**

## PARÂMETROS EXTRAS (extraia se mencionados):
- "termo_busca": termo de busca OTIMIZADO para APIs de licitação
- "nome_produto": nome do produto
- "url": URL completa se houver
- "produto": nome do produto para aderência/proposta
- "edital": número/identificador do edital
- "nome_fonte": nome da fonte de editais (ex: "ComprasNet", "BEC-SP")
- "tipo_fonte": tipo da fonte ("api" ou "scraper")

## IMPORTANTE - OTIMIZAÇÃO DE TERMO DE BUSCA:
Se a intenção for **buscar_editais**, converta termos genéricos para palavras-chave usadas em editais:
- "área médica" → "hospitalar"
- "área de tecnologia" → "informática"
- "equipamentos hospitalares" → "hospitalar"
- "área da saúde" → "hospitalar"
- "computadores" → "informática"
- "equipamentos de laboratório" → "laboratorial"

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

    # 5.1 Listar propostas
    if any(p in msg for p in ["minhas propostas", "listar propostas", "propostas geradas", "ver propostas", "propostas cadastradas"]):
        return "listar_propostas"

    # 5.2 Consultar resultado de certame (perguntas sobre resultado)
    # IMPORTANTE: Deve vir ANTES de buscar_editais para ter prioridade
    if any(p in msg for p in ["qual o resultado", "qual foi o resultado", "resultado do edital",
                               "resultado dos editais", "resultados dos editais", "resultado existente",
                               "resultados existentes", "busque o resultado", "buscar resultado",
                               "mostre os resultados", "ver resultados", "listar resultados",
                               "quem ganhou", "quem venceu", "como foi o edital",
                               "resultado do certame", "resultados dos certames"]):
        return "consultar_resultado"

    # 5.3 Registrar resultado de certame (afirmações de vitória/derrota)
    if any(p in msg for p in ["perdemos", "ganhamos", "vencedor foi", "vencedora foi",
                               "derrota", "vitória", "vitoria", "segundo lugar", "terceiro lugar",
                               "registre resultado", "registrar resultado", "perdemos o", "ganhamos o",
                               "foi cancelado", "ficou deserto", "foi revogado", "edital cancelado",
                               "edital deserto", "edital revogado"]):
        return "registrar_resultado"

    # 5.5 Reprocessar produto
    if any(p in msg for p in ["reprocess", "atualize specs", "atualizar specs", "extraia novamente"]):
        return "reprocessar_produto"

    # 5.6 Excluir edital
    if any(p in msg for p in ["excluir edital", "excluir editais", "deletar edital", "remover edital", "apagar edital"]):
        return "excluir_edital"

    # 5.7 Excluir produto
    if any(p in msg for p in ["excluir produto", "deletar produto", "remover produto", "apagar produto"]):
        return "excluir_produto"

    # 5.8 Atualizar/Editar edital
    if any(p in msg for p in ["editar edital", "atualizar edital", "modificar edital", "alterar edital"]):
        return "atualizar_edital"

    # 5.9 Atualizar/Editar produto
    if any(p in msg for p in ["editar produto", "atualizar produto", "modificar produto", "alterar produto"]):
        return "atualizar_produto"

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

    # 10. Consultas analíticas via MindsDB
    if any(p in msg for p in ["estatística", "estatistica", "score médio", "score medio", "média de", "media de",
                               "quantos editais", "quantos produtos", "análise dos dados", "analise dos dados",
                               "relatório", "relatorio", "ranking", "tendência", "tendencia", "comparar",
                               "por estado", "por uf", "por categoria", "desempenho", "performance"]):
        return "consulta_mindsdb"

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

        elif action_type == "listar_propostas":
            response_text, resultado = processar_listar_propostas(message, user_id)

        elif action_type == "calcular_aderencia":
            response_text, resultado = processar_calcular_aderencia(message, user_id)

        elif action_type == "gerar_proposta":
            response_text, resultado = processar_gerar_proposta(message, user_id)

        elif action_type == "salvar_editais":
            response_text, resultado = processar_salvar_editais(message, user_id, session_id, db)

        elif action_type == "reprocessar_produto":
            response_text, resultado = processar_reprocessar_produto(message, user_id)

        elif action_type == "excluir_edital":
            response_text, resultado = processar_excluir_edital(message, user_id)

        elif action_type == "excluir_produto":
            response_text, resultado = processar_excluir_produto(message, user_id)

        elif action_type == "atualizar_edital":
            response_text, resultado = processar_atualizar_edital(message, user_id)

        elif action_type == "atualizar_produto":
            response_text, resultado = processar_atualizar_produto(message, user_id)

        elif action_type == "consulta_mindsdb":
            response_text, resultado = processar_consulta_mindsdb(message, user_id)

        elif action_type == "registrar_resultado":
            response_text, resultado = processar_registrar_resultado(message, user_id)

        elif action_type == "consultar_resultado":
            response_text, resultado = processar_consultar_resultado(message, user_id)

        else:  # chat_livre
            response_text = processar_chat_livre(message, user_id, session_id, db)

        # Salvar resposta do assistente
        # Se foi busca de editais, salvar os editais no sources_json para recuperar depois
        sources_data = None
        if action_type == "buscar_editais" and resultado:
            # Salvar editais para uso posterior (salvar_editais)
            sources_data = {
                "editais": resultado.get("editais", []),
                "editais_com_score": resultado.get("editais_com_score", []),
                "editais_recomendados": resultado.get("editais_recomendados", []),
                "editais_participar": resultado.get("editais_participar", []),
                "termo": resultado.get("termo")
            }

        assistant_msg = Message(
            session_id=session_id,
            role='assistant',
            content=response_text,
            action_type=action_type,
            sources_json=sources_data
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
    """
    Processa ação: Cadastrar fonte de editais.
    Se tiver todos os dados, cadastra direto.
    Se faltar URL ou tipo, busca na web automaticamente.
    """
    import re

    intencao_resultado = intencao_resultado or {}

    # Verificar se a IA já extraiu os dados (aceitar vários nomes de campo)
    nome_fonte = intencao_resultado.get("nome_fonte") or intencao_resultado.get("nome")
    tipo_fonte = intencao_resultado.get("tipo_fonte") or intencao_resultado.get("tipo")
    url_fonte = intencao_resultado.get("url_fonte") or intencao_resultado.get("url")

    # Se não tem nome_fonte, tentar extrair da mensagem com regex
    if not nome_fonte:
        # Padrão: "fonte NOME" ou "fonte: NOME" ou "cadastre a fonte NOME"
        # Inclui caracteres acentuados (À-ú)
        match = re.search(r'fonte[:\s]+([A-Za-zÀ-ú0-9\-_\s]+?)(?:,|\s+tipo|\s+url|$)', message, re.IGNORECASE)
        if match:
            nome_fonte = match.group(1).strip()

    # Se não tem tipo_fonte, tentar extrair da mensagem
    if not tipo_fonte:
        if 'tipo api' in message.lower() or ', api,' in message.lower() or ' api ' in message.lower():
            tipo_fonte = 'api'
        elif 'tipo scraper' in message.lower() or ', scraper,' in message.lower() or ' scraper ' in message.lower():
            tipo_fonte = 'scraper'

    # Se não tem URL, tentar extrair da mensagem
    if not url_fonte:
        url_match = re.search(r'https?://[^\s,]+', message)
        if url_match:
            url_fonte = url_match.group(0).strip()

    print(f"[FONTE] Dados extraídos: nome={nome_fonte}, tipo={tipo_fonte}, url={url_fonte}")

    # Se tem nome mas falta URL, buscar na web
    if nome_fonte and not url_fonte:
        print(f"[FONTE] URL não informada, buscando na web...")

        # Buscar na web
        resultado_busca = tool_web_search(f"{nome_fonte} portal licitações governo site oficial", user_id, num_results=5)

        # Combinar todos os resultados (PDFs + outros)
        todos_resultados = resultado_busca.get("resultados_pdf", []) + resultado_busca.get("outros_resultados", [])

        if resultado_busca.get("success") and todos_resultados:
            # Usar IA para extrair a URL correta dos resultados
            resultados_texto = "\n".join([
                f"- {r.get('titulo')}: {r.get('link')}"
                for r in todos_resultados[:5]
            ])

            prompt_extrair = f"""Analise os resultados de busca abaixo e identifique a URL oficial do portal de licitações "{nome_fonte}".

Resultados:
{resultados_texto}

Retorne APENAS um JSON com:
- url: URL oficial do portal (a mais provável)
- tipo: "api" se for portal do governo federal ou tiver API conhecida, "scraper" caso contrário
- nome_completo: nome completo/oficial da fonte

JSON:"""

            try:
                resposta_ia = call_deepseek([{"role": "user", "content": prompt_extrair}], max_tokens=300, model_override="deepseek-chat")
                json_match = re.search(r'\{[\s\S]*?\}', resposta_ia)
                if json_match:
                    dados_web = json.loads(json_match.group())
                    url_fonte = dados_web.get("url")
                    if not tipo_fonte:
                        tipo_fonte = dados_web.get("tipo", "scraper")
                    nome_completo = dados_web.get("nome_completo")
                    if nome_completo:
                        nome_fonte = nome_completo
                    print(f"[FONTE] Dados da web: url={url_fonte}, tipo={tipo_fonte}, nome={nome_fonte}")
            except Exception as e:
                print(f"[FONTE] Erro ao extrair dados da web: {e}")
                # Fallback: usar primeiro resultado
                if todos_resultados:
                    primeiro = todos_resultados[0]
                    url_fonte = primeiro.get("link")
                    if not tipo_fonte:
                        tipo_fonte = "scraper"

    # Se ainda não tem tipo, usar padrão
    if not tipo_fonte:
        tipo_fonte = "scraper"

    print(f"[FONTE] Dados finais: nome={nome_fonte}, tipo={tipo_fonte}, url={url_fonte}")

    if nome_fonte and url_fonte:
        resultado = tool_cadastrar_fonte(
            nome=nome_fonte,
            tipo=tipo_fonte,
            url_base=url_fonte,
            descricao=f"Fonte cadastrada via chat: {nome_fonte}"
        )
        if resultado.get("success"):
            response = f"""✅ Fonte cadastrada com sucesso!

**Nome:** {nome_fonte}
**Tipo:** {tipo_fonte}
**URL:** {url_fonte}"""
        elif resultado.get("duplicada"):
            fonte_exist = resultado.get('fonte_existente', {})
            response = f"""⚠️ Fonte já existe!

**Nome:** {fonte_exist.get('nome')}
**URL:** {fonte_exist.get('url')}"""
        else:
            response = f"❌ Erro ao cadastrar: {resultado.get('error')}"
        return response, resultado

    # Se não conseguiu extrair nem da web, pedir mais informações
    response = f"""Não consegui encontrar informações sobre a fonte "{nome_fonte or 'informada'}".

Por favor, forneça os dados completos:
- **Nome**: Nome da fonte
- **Tipo**: api ou scraper
- **URL**: URL base da fonte

Exemplo: `cadastre a fonte BEC-SP, tipo scraper, url https://bec.sp.gov.br`"""
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

    # ========== PASSO 1: Buscar editais em MÚLTIPLAS FONTES ==========
    editais = []
    fontes_consultadas = []
    erros_fontes = []

    # 1.1 Buscar no PNCP (API oficial)
    print(f"[BUSCA] Consultando PNCP via API...")
    resultado_pncp = tool_buscar_editais_fonte("PNCP", termo, user_id, uf=uf)
    if resultado_pncp.get("success"):
        editais_pncp = resultado_pncp.get("editais", [])
        # Marcar fonte
        for ed in editais_pncp:
            ed['fonte'] = 'PNCP (API)'
        editais.extend(editais_pncp)
        fontes_consultadas.append("PNCP (API)")
        print(f"[BUSCA] PNCP: {len(editais_pncp)} editais encontrados")
    else:
        erros_fontes.append(f"PNCP: {resultado_pncp.get('error', 'erro desconhecido')}")

    # 1.2 Buscar em outras fontes via Serper (scraper)
    print(f"[BUSCA] Consultando outras fontes via Serper...")
    resultado_scraper = tool_buscar_editais_scraper(termo, user_id=user_id)
    if resultado_scraper.get("success"):
        editais_scraper = resultado_scraper.get("editais", [])
        # Filtrar editais que já vieram do PNCP (evitar duplicatas)
        links_pncp = {ed.get('url', '') for ed in editais}

        # Palavras que indicam que NÃO é edital de aquisição de produtos
        palavras_excluir_objeto = [
            'prestação de serviço', 'mão de obra', 'dedicação exclusiva',
            'terceirização', 'lavanderia', 'limpeza', 'manutenção preventiva',
            'manutenção corretiva', 'prorrogação da ata', 'prorrogação parcial',
            'termo aditivo', 'credenciadas no sistema', 'poderão participar'
        ]

        editais_novos = []
        for ed in editais_scraper:
            if ed.get('link') not in links_pncp and ed.get('link'):
                # Verificar se é edital de serviço ou prorrogação (filtrar)
                texto = (ed.get('descricao', '') + ' ' + ed.get('titulo', '')).lower()
                eh_servico_ou_prorrogacao = any(p in texto for p in palavras_excluir_objeto)
                if eh_servico_ou_prorrogacao:
                    print(f"[BUSCA] Filtrando (serviço/prorrogação): {ed.get('numero', ed.get('titulo', '')[:30])}")
                    continue

                # Padronizar campos
                ed_normalizado = {
                    'numero': ed.get('numero', ed.get('titulo', '')[:50]),
                    'orgao': ed.get('orgao', 'Não identificado'),
                    'objeto': ed.get('descricao', ed.get('titulo', '')),
                    'url': ed.get('link'),
                    'fonte': f"{ed.get('fonte', 'Web')} (Scraper)",
                    'modalidade': 'Identificar no portal',
                    'valor_referencia': None,
                    'data_abertura': 'Ver no portal'
                }
                editais_novos.append(ed_normalizado)
        editais.extend(editais_novos)
        fontes_scraper = resultado_scraper.get('fontes_consultadas', [])
        fontes_consultadas.extend([f"{f} (Scraper)" for f in fontes_scraper if 'pncp' not in f.lower()])
        print(f"[BUSCA] Scraper: {len(editais_novos)} editais adicionais encontrados")
        if resultado_scraper.get('erros'):
            for err in resultado_scraper.get('erros', []):
                erros_fontes.append(f"{err.get('fonte')}: {err.get('erro')}")

    # Remover duplicatas por número de edital (priorizar PNCP)
    editais_unicos = []
    numeros_vistos = set()
    for ed in editais:
        numero = ed.get('numero', '')
        # Se não tem número ou número é genérico, usar URL como chave
        chave = numero if numero and numero not in ['N/A', 'None', ''] else ed.get('url', '')
        if chave and chave not in numeros_vistos:
            numeros_vistos.add(chave)
            editais_unicos.append(ed)

    if len(editais) != len(editais_unicos):
        print(f"[BUSCA] Removidas {len(editais) - len(editais_unicos)} duplicatas")
    editais = editais_unicos

    # Montar resultado combinado
    resultado = {
        "success": len(editais) > 0,
        "termo": termo,
        "fontes_consultadas": fontes_consultadas,
        "total_resultados": len(editais),
        "editais": editais,
        "erros": erros_fontes if erros_fontes else None
    }

    if not editais:
        fontes_str = ', '.join(fontes_consultadas) if fontes_consultadas else 'nenhuma fonte disponível'
        response = f"""**Busca realizada:** {termo}
**Fontes consultadas:** {fontes_str}

⚠️ Nenhum edital encontrado para '{termo}'.

**Sugestões:**
- Tente termos mais específicos (ex: "monitor LCD 24 polegadas")
- Verifique se há editais salvos: "liste meus editais"
- Cadastre mais fontes de editais: "cadastre a fonte BEC-SP"
"""
        if erros_fontes:
            response += f"\n**Erros nas fontes:** {'; '.join(erros_fontes)}\n"
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
    fontes_str = ', '.join(fontes_consultadas) if fontes_consultadas else fonte
    response = f"""**Busca realizada:** {termo}
**Fontes consultadas:** {fontes_str}
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
        fonte_edital = ed.get('fonte', '')

        texto = f"---\n"
        texto += f"### {i}. {numero}"
        if score is not None:
            texto += f" | Score: **{score:.0f}%**"
        texto += "\n"
        texto += f"**Órgão:** {orgao} ({local})\n"
        if fonte_edital:
            texto += f"**Fonte:** {fonte_edital}\n"
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
    qtd_participar = len(participar)
    qtd_avaliar = len(avaliar)
    qtd_recomendados = qtd_participar + qtd_avaliar

    if qtd_recomendados > 0:
        response += f"\n---\n"
        response += f"## 💾 Deseja salvar os editais?\n\n"
        response += f"Encontrei **{qtd_recomendados} edital(is)** recomendado(s):\n"
        if qtd_participar > 0:
            response += f"- ✅ {qtd_participar} para PARTICIPAR\n"
        if qtd_avaliar > 0:
            response += f"- ⚠️ {qtd_avaliar} para AVALIAR\n"
        response += f"\n"

        # Botões de ação (marcação especial para o frontend)
        response += f"<!-- BOTOES_SALVAR -->\n"
        response += f"[[btn:salvar_recomendados:💾 Salvar Recomendados ({qtd_recomendados})]]\n"
        if qtd_participar > 0 and qtd_avaliar > 0:
            response += f"[[btn:salvar_participar:✅ Salvar só PARTICIPAR ({qtd_participar})]]\n"
        response += f"[[btn:salvar_todos:📋 Salvar Todos ({len(editais_com_score)})]]\n"
        response += f"<!-- /BOTOES_SALVAR -->\n\n"

        response += f"*Ou digite: \"salvar editais\", \"salvar recomendados\", \"salvar edital PE-2026/001\"*\n"

    # Adicionar editais ao resultado para possível salvamento posterior
    resultado["editais_com_score"] = editais_com_score
    resultado["editais_recomendados"] = participar + avaliar
    resultado["editais_participar"] = participar
    resultado["editais_avaliar"] = avaliar

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


def processar_reprocessar_produto(message: str, user_id: str):
    """
    Reprocessa um produto para extrair especificações novamente.
    Útil quando a extração inicial falhou ou foi incompleta.
    """
    # Tentar identificar o produto na mensagem
    # Primeiro listar produtos do usuário
    produtos_resultado = tool_listar_produtos(user_id)

    if not produtos_resultado.get("success"):
        return "Erro ao buscar seus produtos.", produtos_resultado

    produtos = produtos_resultado.get("produtos", [])
    if not produtos:
        return "Você não tem produtos cadastrados para reprocessar.", {"success": False}

    # Tentar encontrar o produto mencionado na mensagem
    msg_lower = message.lower()
    produto_id = None
    produto_nome = None

    for p in produtos:
        nome_lower = p.get("nome", "").lower()
        modelo_lower = (p.get("modelo") or "").lower()

        # Verificar se nome ou modelo está na mensagem
        if nome_lower and any(parte in msg_lower for parte in nome_lower.split()[:3]):
            produto_id = p.get("id")
            produto_nome = p.get("nome")
            break
        if modelo_lower and modelo_lower in msg_lower:
            produto_id = p.get("id")
            produto_nome = p.get("nome")
            break

    # Se não encontrou, usar o último produto cadastrado
    if not produto_id:
        ultimo = produtos[-1]
        produto_id = ultimo.get("id")
        produto_nome = ultimo.get("nome")

    # Reprocessar
    print(f"[APP] Reprocessando produto: {produto_nome} ({produto_id})")
    resultado = tool_reprocessar_produto(produto_id, user_id)

    if resultado.get("success"):
        specs = resultado.get("specs", [])
        response = f"""## 🔄 Produto Reprocessado!

**Produto:** {resultado.get('produto_nome', produto_nome)}
**ID:** {produto_id}

### Especificações Extraídas ({resultado.get('specs_extraidas', 0)} encontradas):

"""
        for spec in specs[:30]:
            nome = spec.get('nome_especificacao', 'N/A')
            valor = spec.get('valor', 'N/A')
            unidade = spec.get('unidade', '')
            response += f"- **{nome}:** {valor} {unidade}\n"

        if len(specs) > 30:
            response += f"\n... e mais {len(specs) - 30} especificações.\n"

        response += "\n✅ Produto atualizado e pronto para calcular aderência!"
    else:
        response = f"❌ Erro ao reprocessar: {resultado.get('error')}"

    return response, resultado


def processar_excluir_edital(message: str, user_id: str):
    """
    Processa ação: Excluir edital(is).
    Identifica editais por número, ID ou palavras-chave na mensagem.
    """
    from backend.tools import tool_excluir_edital, tool_excluir_editais_multiplos, tool_listar_editais

    msg_lower = message.lower()

    # Verificar se é exclusão de todos
    if "todos" in msg_lower:
        editais_resultado = tool_listar_editais(user_id)
        if not editais_resultado.get("success") or not editais_resultado.get("editais"):
            return "Você não tem editais salvos para excluir.", {"success": False}

        edital_ids = [e["id"] for e in editais_resultado.get("editais", [])]
        resultado = tool_excluir_editais_multiplos(edital_ids, user_id)

        if resultado.get("success"):
            return f"✅ {resultado.get('excluidos', 0)} edital(is) excluído(s) com sucesso!", resultado
        else:
            return f"❌ Erro ao excluir editais: {resultado.get('error')}", resultado

    # Listar editais para identificar qual excluir
    editais_resultado = tool_listar_editais(user_id)
    if not editais_resultado.get("success"):
        return "Erro ao buscar seus editais.", editais_resultado

    editais = editais_resultado.get("editais", [])
    if not editais:
        return "Você não tem editais salvos para excluir.", {"success": False}

    # Tentar encontrar edital por número ou ID na mensagem
    edital_a_excluir = None
    for ed in editais:
        numero = ed.get("numero", "").lower()
        edital_id = ed.get("id", "")

        if numero and numero in msg_lower:
            edital_a_excluir = ed
            break
        if edital_id[:8].lower() in msg_lower:
            edital_a_excluir = ed
            break

    if not edital_a_excluir:
        # Mostrar lista de editais para o usuário escolher
        response = "**Qual edital você deseja excluir?**\n\nEditais salvos:\n"
        for i, ed in enumerate(editais[:10], 1):
            response += f"{i}. **{ed.get('numero')}** - {ed.get('orgao', 'N/A')[:40]}\n"
        response += "\nDigite: 'excluir edital [número]' para confirmar."
        return response, {"success": False, "editais": editais}

    # Excluir o edital encontrado
    resultado = tool_excluir_edital(edital_a_excluir["id"], user_id)

    if resultado.get("success"):
        return f"✅ Edital **{edital_a_excluir.get('numero')}** excluído com sucesso!", resultado
    else:
        return f"❌ Erro ao excluir edital: {resultado.get('error')}", resultado


def processar_excluir_produto(message: str, user_id: str):
    """
    Processa ação: Excluir produto.
    Identifica produto por nome ou ID na mensagem.
    """
    from backend.tools import tool_excluir_produto, tool_listar_produtos

    msg_lower = message.lower()

    # Listar produtos para identificar qual excluir
    produtos_resultado = tool_listar_produtos(user_id)
    if not produtos_resultado.get("success"):
        return "Erro ao buscar seus produtos.", produtos_resultado

    produtos = produtos_resultado.get("produtos", [])
    if not produtos:
        return "Você não tem produtos cadastrados para excluir.", {"success": False}

    # Verificar se é exclusão de todos
    if "todos" in msg_lower:
        excluidos = 0
        erros = 0
        for p in produtos:
            resultado = tool_excluir_produto(p["id"], user_id)
            if resultado.get("success"):
                excluidos += 1
            else:
                erros += 1
        return f"✅ {excluidos} produto(s) excluído(s)!" + (f" ({erros} erros)" if erros else ""), {"success": True, "excluidos": excluidos}

    # Tentar encontrar produto por nome na mensagem
    produto_a_excluir = None
    for p in produtos:
        nome = p.get("nome", "").lower()
        modelo = (p.get("modelo") or "").lower()
        produto_id = p.get("id", "")

        # Verificar se nome, modelo ou ID está na mensagem
        if nome and any(parte in msg_lower for parte in nome.split()[:3]):
            produto_a_excluir = p
            break
        if modelo and modelo in msg_lower:
            produto_a_excluir = p
            break
        if produto_id[:8].lower() in msg_lower:
            produto_a_excluir = p
            break

    if not produto_a_excluir:
        # Mostrar lista de produtos para o usuário escolher
        response = "**Qual produto você deseja excluir?**\n\nProdutos cadastrados:\n"
        for i, p in enumerate(produtos[:10], 1):
            response += f"{i}. **{p.get('nome')}** ({p.get('fabricante', 'N/A')})\n"
        response += "\nDigite: 'excluir produto [nome]' para confirmar."
        return response, {"success": False, "produtos": produtos}

    # Excluir o produto encontrado
    resultado = tool_excluir_produto(produto_a_excluir["id"], user_id)

    if resultado.get("success"):
        return f"✅ Produto **{produto_a_excluir.get('nome')}** excluído com sucesso!", resultado
    else:
        return f"❌ Erro ao excluir produto: {resultado.get('error')}", resultado


def processar_atualizar_edital(message: str, user_id: str):
    """
    Processa ação: Atualizar/Editar edital.
    Usa IA para extrair o que o usuário quer alterar.
    """
    from backend.tools import tool_atualizar_edital, tool_listar_editais

    # Listar editais para identificar qual atualizar
    editais_resultado = tool_listar_editais(user_id)
    if not editais_resultado.get("success"):
        return "Erro ao buscar seus editais.", editais_resultado

    editais = editais_resultado.get("editais", [])
    if not editais:
        return "Você não tem editais salvos para editar.", {"success": False}

    msg_lower = message.lower()

    # Tentar encontrar edital por número na mensagem
    edital_a_editar = None
    for ed in editais:
        numero = ed.get("numero", "").lower()
        if numero and numero in msg_lower:
            edital_a_editar = ed
            break

    if not edital_a_editar:
        # Usar o último edital
        edital_a_editar = editais[0]

    # Extrair campos a atualizar usando IA
    prompt = f"""Analise a mensagem do usuário e extraia quais campos do edital ele quer alterar.

Mensagem: "{message}"

Campos possíveis: numero, orgao, objeto, modalidade, status, valor_referencia, data_abertura

Status possíveis: novo, analisando, participar, nao_participar, proposta_enviada, ganho, perdido, cancelado
Modalidades: pregao_eletronico, pregao_presencial, concorrencia, tomada_precos, convite, dispensa, inexigibilidade

Retorne JSON com apenas os campos a alterar:
{{"campo1": "novo_valor", "campo2": "novo_valor"}}

Se não identificar campos claros, retorne {{}}
"""

    try:
        resposta_ia = call_deepseek([{"role": "user", "content": prompt}], max_tokens=100, model_override="deepseek-chat")
        import json
        import re
        json_match = re.search(r'\{[\s\S]*?\}', resposta_ia)
        if json_match:
            campos = json.loads(json_match.group())
        else:
            campos = {}
    except:
        campos = {}

    if not campos:
        # Mostrar edital atual e pedir para especificar
        response = f"""**Editar Edital: {edital_a_editar.get('numero')}**

Dados atuais:
- **Número:** {edital_a_editar.get('numero')}
- **Órgão:** {edital_a_editar.get('orgao')}
- **Status:** {edital_a_editar.get('status')}
- **Modalidade:** {edital_a_editar.get('modalidade')}

Por favor, especifique o que deseja alterar. Exemplos:
- "alterar status para participar"
- "mudar órgão para Prefeitura de SP"
"""
        return response, {"success": False, "edital": edital_a_editar}

    # Aplicar atualizações
    resultado = tool_atualizar_edital(
        edital_id=edital_a_editar["id"],
        user_id=user_id,
        **campos
    )

    if resultado.get("success"):
        edital_atualizado = resultado.get("edital", {})
        response = f"""✅ Edital **{edital_atualizado.get('numero')}** atualizado!

Novos dados:
- **Número:** {edital_atualizado.get('numero')}
- **Órgão:** {edital_atualizado.get('orgao')}
- **Status:** {edital_atualizado.get('status')}
- **Modalidade:** {edital_atualizado.get('modalidade')}
"""
        return response, resultado
    else:
        return f"❌ Erro ao atualizar edital: {resultado.get('error')}", resultado


def processar_atualizar_produto(message: str, user_id: str):
    """
    Processa ação: Atualizar/Editar produto.
    Usa IA para extrair o que o usuário quer alterar.
    """
    from backend.tools import tool_atualizar_produto, tool_listar_produtos

    # Listar produtos para identificar qual atualizar
    produtos_resultado = tool_listar_produtos(user_id)
    if not produtos_resultado.get("success"):
        return "Erro ao buscar seus produtos.", produtos_resultado

    produtos = produtos_resultado.get("produtos", [])
    if not produtos:
        return "Você não tem produtos cadastrados para editar.", {"success": False}

    msg_lower = message.lower()

    # Tentar encontrar produto por nome na mensagem
    produto_a_editar = None
    for p in produtos:
        nome = p.get("nome", "").lower()
        if nome and any(parte in msg_lower for parte in nome.split()[:3]):
            produto_a_editar = p
            break

    if not produto_a_editar:
        # Usar o último produto
        produto_a_editar = produtos[-1]

    # Extrair campos a atualizar usando IA
    prompt = f"""Analise a mensagem do usuário e extraia quais campos do produto ele quer alterar.

Mensagem: "{message}"

Campos possíveis: nome, fabricante, modelo, categoria

Categorias: equipamento, reagente, insumo_hospitalar, insumo_laboratorial, informatica, redes, mobiliario, eletronico, outro

Retorne JSON com apenas os campos a alterar:
{{"campo1": "novo_valor", "campo2": "novo_valor"}}

Se não identificar campos claros, retorne {{}}
"""

    try:
        resposta_ia = call_deepseek([{"role": "user", "content": prompt}], max_tokens=100, model_override="deepseek-chat")
        import json
        import re
        json_match = re.search(r'\{[\s\S]*?\}', resposta_ia)
        if json_match:
            campos = json.loads(json_match.group())
        else:
            campos = {}
    except:
        campos = {}

    if not campos:
        # Mostrar produto atual e pedir para especificar
        response = f"""**Editar Produto: {produto_a_editar.get('nome')}**

Dados atuais:
- **Nome:** {produto_a_editar.get('nome')}
- **Fabricante:** {produto_a_editar.get('fabricante', 'N/A')}
- **Modelo:** {produto_a_editar.get('modelo', 'N/A')}
- **Categoria:** {produto_a_editar.get('categoria', 'N/A')}

Por favor, especifique o que deseja alterar. Exemplos:
- "alterar fabricante para Philips"
- "mudar categoria para equipamento"
"""
        return response, {"success": False, "produto": produto_a_editar}

    # Aplicar atualizações
    resultado = tool_atualizar_produto(
        produto_id=produto_a_editar["id"],
        user_id=user_id,
        **campos
    )

    if resultado.get("success"):
        produto_atualizado = resultado.get("produto", {})
        response = f"""✅ Produto **{produto_atualizado.get('nome')}** atualizado!

Novos dados:
- **Nome:** {produto_atualizado.get('nome')}
- **Fabricante:** {produto_atualizado.get('fabricante', 'N/A')}
- **Modelo:** {produto_atualizado.get('modelo', 'N/A')}
- **Categoria:** {produto_atualizado.get('categoria', 'N/A')}
"""
        return response, resultado
    else:
        return f"❌ Erro ao atualizar produto: {resultado.get('error')}", resultado


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


def processar_listar_propostas(message: str, user_id: str):
    """Processa ação: Listar propostas geradas pelo usuário"""
    db = get_db()
    try:
        propostas = db.query(Proposta).filter(
            Proposta.user_id == user_id
        ).order_by(Proposta.created_at.desc()).limit(20).all()

        if propostas:
            response = f"## 📝 Minhas Propostas ({len(propostas)})\n\n"
            for p in propostas:
                # Buscar edital e produto relacionados
                edital = db.query(Edital).filter(Edital.id == p.edital_id).first()
                produto = db.query(Produto).filter(Produto.id == p.produto_id).first()

                edital_num = edital.numero if edital else "N/A"
                produto_nome = produto.nome[:40] if produto else "N/A"
                preco = f"R$ {p.preco_total:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") if p.preco_total else "N/A"
                data = p.created_at.strftime("%d/%m/%Y %H:%M") if p.created_at else "N/A"

                status_emoji = {
                    "rascunho": "📋",
                    "enviada": "📤",
                    "aceita": "✅",
                    "rejeitada": "❌"
                }.get(p.status, "📋")

                response += f"### {status_emoji} Proposta - Edital {edital_num}\n"
                response += f"- **Produto:** {produto_nome}\n"
                response += f"- **Preço:** {preco}\n"
                response += f"- **Status:** {p.status}\n"
                response += f"- **Data:** {data}\n"
                response += f"- **ID:** `{p.id[:8]}...`\n\n"

            resultado = {"success": True, "propostas": [p.to_dict() for p in propostas], "total": len(propostas)}
        else:
            response = "Você ainda não tem propostas geradas.\n\nPara gerar uma proposta, use:\n`Gere uma proposta do produto [NOME] para o edital [NUMERO] com preço R$ [VALOR]`"
            resultado = {"success": True, "propostas": [], "total": 0}

        return response, resultado

    except Exception as e:
        return f"Erro ao listar propostas: {str(e)}", {"success": False, "error": str(e)}
    finally:
        db.close()


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

    # Verificar se usuário quer ver todos
    mostrar_todos = any(p in message_lower for p in ["todos", "all", "completo", "completa"])
    limite = 100 if mostrar_todos else 20  # Default 20, ou 100 se pedir todos

    resultado = tool_listar_editais(user_id, status=status, uf=uf)

    if resultado.get("success"):
        editais = resultado.get("editais", [])
        if editais:
            total = len(editais)
            editais_mostrar = editais[:limite]

            response = f"**Editais salvos:** {total}"
            if total > limite:
                response += f" (mostrando {limite})"
            response += "\n\n"

            for i, ed in enumerate(editais_mostrar, 1):
                response += f"{i}. **{ed['numero']}** ({ed['status']})\n"
                response += f"   {ed['orgao']} - {ed['uf'] or 'N/A'}\n"
                response += f"   {ed['objeto'][:80]}...\n"
                if ed.get('url'):
                    response += f"   🔗 [Acessar edital]({ed['url']})\n"
                response += "\n"

            if total > limite:
                response += f"\n📋 *Mostrando {limite} de {total} editais. Digite 'listar todos editais' para ver todos.*"
        else:
            response = "Você não tem editais salvos ainda. Use 'Buscar editais' para encontrar oportunidades."
    else:
        response = f"Erro ao listar: {resultado.get('error')}"

    return response, resultado


def _encontrar_produto(produtos: list, message_lower: str):
    """Helper para encontrar produto por nome, modelo ou palavras-chave"""
    for p in produtos:
        nome_lower = (p.get("nome") or "").lower()
        modelo_lower = (p.get("modelo") or "").lower()
        fabricante_lower = (p.get("fabricante") or "").lower()

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
        numero = e.get("numero") or ""
        if numero and numero.lower() in message_lower:
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
        numero = e.get("numero") or ""
        if numero and numero.lower() in message_lower:
            edital_encontrado = e
            break

    # Extrair preço - buscar padrão "R$ X" ou "preço X" ou "valor X"
    import re
    # Primeiro tenta R$ seguido de número
    preco_match = re.search(r'R\$\s*([\d.,]+)', message)
    if not preco_match:
        # Tenta "preço" ou "valor" seguido de número
        preco_match = re.search(r'(?:preço|preco|valor)\s*(?:de\s*)?R?\$?\s*([\d.,]+)', message, re.IGNORECASE)
    if preco_match:
        try:
            valor_str = preco_match.group(1)
            # Remove pontos de milhar e converte vírgula decimal
            preco = float(valor_str.replace('.', '').replace(',', '.'))
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

{resultado.get('texto_proposta', '')}

---

*Proposta salva com ID: {resultado.get('proposta_id')}*"""
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

    # Determinar o que salvar
    # - "salvar recomendados" ou "salvar editais recomendados" → PARTICIPAR + AVALIAR
    # - "salvar para participar" ou "salvar participar" → só PARTICIPAR
    # - "salvar todos" → todos os editais
    salvar_tipo = "recomendados"  # padrão
    if "todos" in msg_lower:
        salvar_tipo = "todos"
    elif "participar" in msg_lower:
        salvar_tipo = "participar"
    elif "recomendados" in msg_lower or "recomendado" in msg_lower:
        salvar_tipo = "recomendados"

    # Buscar última mensagem de busca no histórico (com editais salvos em sources_json)
    ultima_busca = db.query(Message).filter(
        Message.session_id == session_id,
        Message.action_type == "buscar_editais",
        Message.role == "assistant"
    ).order_by(Message.created_at.desc()).first()

    if not ultima_busca:
        return "Não encontrei uma busca de editais recente. Execute primeiro: **buscar editais de [tema]**", {"status": "sem_busca"}

    # Tentar recuperar editais do sources_json (salvo na busca)
    editais_para_salvar = []
    editais_com_score = []
    editais_participar = []
    editais_recomendados = []

    if ultima_busca.sources_json:
        # Recuperar editais salvos - SEM re-buscar!
        print(f"[SALVAR] Recuperando editais do sources_json...")
        sources = ultima_busca.sources_json
        editais_com_score = sources.get("editais_com_score", sources.get("editais", []))
        editais_participar = sources.get("editais_participar", [])
        editais_recomendados = sources.get("editais_recomendados", [])
        print(f"[SALVAR] Encontrados {len(editais_com_score)} editais salvos na sessão")
    else:
        # Fallback: sources_json vazio, precisa re-buscar (compatibilidade com buscas antigas)
        print(f"[SALVAR] sources_json vazio, buscando mensagem do usuário...")
        ultima_busca_user = db.query(Message).filter(
            Message.session_id == session_id,
            Message.action_type == "buscar_editais",
            Message.role == "user"
        ).order_by(Message.created_at.desc()).first()

        if ultima_busca_user:
            print(f"[SALVAR] Re-executando busca (fallback): {ultima_busca_user.content[:50]}...")
            classificacao = detectar_intencao_ia(ultima_busca_user.content, tem_arquivo=False)
            termo_ia = classificacao.get("termo_busca")
            _, resultado_busca = processar_buscar_editais(ultima_busca_user.content, user_id, termo_ia=termo_ia)

            if resultado_busca.get("success"):
                editais_com_score = resultado_busca.get("editais_com_score", [])
                editais_participar = resultado_busca.get("editais_participar", [])
                editais_recomendados = resultado_busca.get("editais_recomendados", [])

    if not editais_com_score:
        return "Não há editais para salvar. Execute uma busca primeiro: **buscar editais de [tema]**", {"status": "sem_editais"}

    print(f"[SALVAR] Tipo: {salvar_tipo}")
    print(f"[SALVAR] editais_com_score: {len(editais_com_score)}")
    print(f"[SALVAR] editais_participar: {len(editais_participar)}")
    print(f"[SALVAR] editais_recomendados: {len(editais_recomendados)}")

    if salvar_tipo == "todos":
        # Salvar TODOS os editais encontrados
        editais_para_salvar = editais_com_score
    elif salvar_tipo == "participar":
        # Salvar só os PARTICIPAR (score >= 80 ou recomendação PARTICIPAR)
        editais_para_salvar = editais_participar
        if not editais_para_salvar:
            # Fallback: pegar os com score >= 75 (margem para variação)
            editais_para_salvar = [e for e in editais_com_score if e.get("score_tecnico", 0) >= 75]
            print(f"[SALVAR] Fallback participar: {len(editais_para_salvar)} com score >= 75")
    elif salvar_tipo == "recomendados":
        # Salvar PARTICIPAR + AVALIAR
        editais_para_salvar = editais_recomendados
        if not editais_para_salvar:
            # Fallback: pegar os com score >= 50
            editais_para_salvar = [e for e in editais_com_score if e.get("score_tecnico", 0) >= 50]
            print(f"[SALVAR] Fallback recomendados: {len(editais_para_salvar)} com score >= 50")
    else:
        # Tentar extrair número específico do edital
        numero_match = re.search(r'edital\s+(\S+)', msg_lower)
        if numero_match:
            numero_busca = numero_match.group(1).upper()
            for ed in editais_com_score:
                if numero_busca in ed.get("numero", "").upper():
                    editais_para_salvar.append(ed)
                    break

    print(f"[SALVAR] editais_para_salvar: {len(editais_para_salvar)}")

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


def formatar_resposta_tabular(resposta: str) -> str:
    """
    Melhora a formatação de respostas que contêm dados tabulares.
    Converte tabelas mal formatadas para markdown correto.
    """
    import re

    # Se já tem formato markdown de tabela bem formatada, preservar
    if re.search(r'\|[^|]+\|[^|]+\|', resposta) and '---' in resposta:
        return resposta

    linhas = resposta.strip().split("\n")

    # Detectar padrões de tabela (linha com múltiplas colunas separadas)
    # Padrão comum: "ID    Número    Órgão    Status"
    palavras_header = ["id", "número", "numero", "órgão", "orgao", "status", "valor", "data",
                       "nome", "objeto", "modalidade", "fonte", "url", "tipo"]

    for i, linha in enumerate(linhas):
        linha_lower = linha.lower()
        # Verifica se a linha parece um header de tabela
        matches = sum(1 for p in palavras_header if p in linha_lower)

        if matches >= 3:  # Pelo menos 3 palavras de header
            # Encontrou header, tentar converter para markdown
            # Detectar separador (múltiplos espaços ou tab)

            # Tentar separar por tabs primeiro
            if "\t" in linha:
                colunas_header = [c.strip() for c in linha.split("\t") if c.strip()]
            else:
                # Separar por múltiplos espaços (4+)
                colunas_header = [c.strip() for c in re.split(r'\s{4,}', linha) if c.strip()]

            if len(colunas_header) >= 3:
                # Montar tabela markdown
                md_linhas = []

                # Header
                md_linhas.append("| " + " | ".join(colunas_header) + " |")
                md_linhas.append("|" + "|".join("---" for _ in colunas_header) + "|")

                # Dados (linhas seguintes)
                for j in range(i + 1, len(linhas)):
                    data_linha = linhas[j].strip()
                    if not data_linha:
                        continue

                    if "\t" in data_linha:
                        colunas_data = [c.strip() for c in data_linha.split("\t")]
                    else:
                        colunas_data = [c.strip() for c in re.split(r'\s{4,}', data_linha)]

                    # Ajustar número de colunas
                    while len(colunas_data) < len(colunas_header):
                        colunas_data.append("")
                    colunas_data = colunas_data[:len(colunas_header)]

                    # Truncar valores muito longos
                    colunas_data = [c[:80] + "..." if len(c) > 80 else c for c in colunas_data]

                    md_linhas.append("| " + " | ".join(colunas_data) + " |")

                # Texto antes da tabela + tabela
                texto_antes = "\n".join(linhas[:i]).strip()
                tabela = "\n".join(md_linhas)

                if texto_antes:
                    return texto_antes + "\n\n" + tabela
                return tabela

    return resposta


def processar_consulta_mindsdb(message: str, user_id: str):
    """
    Processa consultas analíticas via MindsDB.
    Envia a pergunta em linguagem natural para o agente editais_database_searcher.
    """
    from tools import tool_consulta_mindsdb

    resultado = tool_consulta_mindsdb(message, user_id)

    if resultado.get("success"):
        resposta_mindsdb = resultado.get("resposta", "")

        # Melhorar formatação de tabelas
        resposta_formatada = formatar_resposta_tabular(resposta_mindsdb)

        response = f"""## 📊 Consulta Analítica

**Pergunta:** {message}

---

{resposta_formatada}

---
*Consulta realizada via MindsDB (GPT-4o)*"""
    else:
        error = resultado.get("error", "Erro desconhecido")
        response = f"""## ❌ Erro na Consulta

Não foi possível processar a consulta analítica.

**Erro:** {error}

**Dica:** Tente reformular a pergunta ou use comandos diretos como:
- "liste meus editais"
- "liste meus produtos"
- "calcule aderência do produto X ao edital Y"
"""

    return response, resultado


def processar_registrar_resultado(message: str, user_id: str):
    """
    Processa registro de resultado de certame (vitória/derrota).
    Alimenta a base de preços históricos e concorrentes.
    """
    from tools import tool_registrar_resultado

    resultado = tool_registrar_resultado(message, user_id)

    if not resultado.get("success"):
        error = resultado.get("error", "Erro desconhecido")
        response = f"""❌ **Erro ao registrar resultado**

{error}

**Exemplos de como registrar:**
- "Perdemos o PE-001/2026 para MedLab com R$ 365.000, nosso preço foi R$ 380.000"
- "Ganhamos o edital PE-002/2026 com R$ 290.000"
- "Perdemos o PE-003 por documentação"
- "O edital PE-004 foi cancelado"
"""
        return response, None

    # Montar resposta de sucesso
    emoji_resultado = "🏆" if resultado["resultado"] == "vitoria" else "📊"
    status_texto = {
        "vitoria": "VITÓRIA",
        "derrota": "DERROTA",
        "cancelado": "CANCELADO",
        "deserto": "DESERTO",
        "revogado": "REVOGADO"
    }.get(resultado["resultado"], resultado["resultado"].upper())

    response = f"""{emoji_resultado} **Resultado Registrado - {resultado['edital_numero']}**

**Órgão:** {resultado.get('orgao', 'N/A')}
**Resultado:** {status_texto}
"""

    # Tabela de preços se disponível
    if resultado.get("preco_vencedor") or resultado.get("nosso_preco"):
        response += "\n| Posição | Empresa | Preço |\n"
        response += "|---------|---------|-------|\n"

        if resultado.get("empresa_vencedora") and resultado["resultado"] != "vitoria":
            preco_venc = resultado["preco_vencedor"]
            preco_fmt = f"R$ {preco_venc:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") if preco_venc else "N/A"
            response += f"| 1º | {resultado['empresa_vencedora']} | {preco_fmt} |\n"

        if resultado.get("nosso_preco"):
            pos = "1º" if resultado["resultado"] == "vitoria" else "2º"
            nosso_preco = resultado["nosso_preco"]
            preco_fmt = f"R$ {nosso_preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") if nosso_preco else "N/A"
            response += f"| {pos} | Sua Empresa | {preco_fmt} |\n"

        response += "\n"

    # Análise se foi derrota por preço
    if resultado.get("diferenca") and resultado["resultado"] == "derrota":
        diferenca = resultado["diferenca"]
        diferenca_pct = resultado.get("diferenca_pct", 0)
        desconto = resultado.get("desconto_percentual")

        response += f"""**Análise:**
- Diferença: R$ {diferenca:,.2f} ({diferenca_pct:.1f}%)
"""
        if desconto:
            response += f"- Desconto do vencedor: {desconto:.1f}% sobre referência\n"

        if resultado.get("motivo"):
            motivo_texto = {
                "preco": "Preço",
                "tecnica": "Questão técnica",
                "documentacao": "Documentação",
                "prazo": "Prazo",
                "outro": "Outro"
            }.get(resultado["motivo"], resultado["motivo"])
            response += f"- Motivo principal: {motivo_texto}\n"

        response += f"""
💡 **Insight:** Para editais similares, considere preços ~{diferenca_pct:.0f}% menores.
"""

    # Mensagem de sucesso final
    response += """
✅ Dados salvos no histórico de preços e concorrentes!
"""

    return response, resultado


def processar_consultar_resultado(message: str, user_id: str):
    """
    Consulta resultado de um certame já registrado.
    Suporta consulta de um edital específico ou de todos os editais.
    """
    from models import get_db, Edital, PrecoHistorico, Concorrente, ParticipacaoEdital
    import re

    db = get_db()
    try:
        # Verificar se é consulta de TODOS os editais
        msg_lower = message.lower()
        consulta_todos = any(p in msg_lower for p in [
            "todos os editais", "todos editais", "resultados dos editais",
            "resultado dos editais", "todos os resultados", "listar resultados"
        ])

        if consulta_todos:
            return processar_consultar_todos_resultados(user_id, db)

        # Extrair número do edital da mensagem
        # Padrões: PE-001/2026, 90186, PE001, etc
        padrao = r'(?:PE[-\s]?)?(\d{2,6})(?:/\d{4})?'
        match = re.search(padrao, message, re.IGNORECASE)

        if not match:
            return "❌ Não identifiquei o número do edital. Informe o número (ex: PE-041/2026 ou 90186)\n\nPara ver todos os resultados, use: \"mostre os resultados de todos os editais\"", None

        numero_edital = match.group(0)

        # Buscar edital
        edital = db.query(Edital).filter(
            Edital.numero.ilike(f"%{numero_edital}%"),
            Edital.user_id == user_id
        ).first()

        if not edital:
            # Tentar busca mais flexível
            numero_limpo = match.group(1)
            edital = db.query(Edital).filter(
                Edital.numero.ilike(f"%{numero_limpo}%"),
                Edital.user_id == user_id
            ).first()

        if not edital:
            return f"❌ Edital '{numero_edital}' não encontrado no seu cadastro.", None

        # Buscar resultado registrado
        preco_hist = db.query(PrecoHistorico).filter(
            PrecoHistorico.edital_id == edital.id
        ).order_by(PrecoHistorico.data_registro.desc()).first()

        if not preco_hist:
            response = f"""📋 **Edital {edital.numero}**

**Órgão:** {edital.orgao}
**Status:** {edital.status or 'Não definido'}
**Valor Referência:** R$ {float(edital.valor_referencia):,.2f}

⚠️ **Nenhum resultado registrado ainda.**

Para registrar o resultado, use:
- "Perdemos o {edital.numero} para [EMPRESA] com R$ [VALOR]"
- "Ganhamos o {edital.numero} com R$ [VALOR]"
"""
            return response, None

        # Buscar participações
        participacoes = db.query(ParticipacaoEdital).filter(
            ParticipacaoEdital.edital_id == edital.id
        ).order_by(ParticipacaoEdital.posicao_final).all()

        # Montar resposta
        emoji_resultado = "🏆" if preco_hist.resultado == "vitoria" else "📊"
        status_texto = {
            "vitoria": "VITÓRIA",
            "derrota": "DERROTA",
            "cancelado": "CANCELADO",
            "deserto": "DESERTO",
            "revogado": "REVOGADO"
        }.get(preco_hist.resultado, preco_hist.resultado.upper() if preco_hist.resultado else "N/A")

        response = f"""{emoji_resultado} **Resultado do Edital {edital.numero}**

**Órgão:** {edital.orgao}
**Resultado:** {status_texto}
**Data:** {preco_hist.data_homologacao.strftime('%d/%m/%Y') if preco_hist.data_homologacao else 'N/A'}
"""

        # Tabela de participantes
        if participacoes:
            response += "\n**Participantes:**\n"
            response += "| Pos | Empresa | Preço |\n"
            response += "|-----|---------|-------|\n"

            for part in participacoes:
                if part.concorrente_id:
                    conc = db.query(Concorrente).get(part.concorrente_id)
                    nome = conc.nome if conc else "Desconhecido"
                else:
                    nome = "Sua Empresa"

                preco_fmt = f"R$ {float(part.preco_proposto):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") if part.preco_proposto else "N/A"
                pos = f"{part.posicao_final}º" if part.posicao_final else "-"
                response += f"| {pos} | {nome} | {preco_fmt} |\n"

            response += "\n"

        # Análise
        if preco_hist.resultado == "derrota" and preco_hist.nosso_preco and preco_hist.preco_vencedor:
            diferenca = float(preco_hist.nosso_preco) - float(preco_hist.preco_vencedor)
            diferenca_pct = (diferenca / float(preco_hist.nosso_preco)) * 100

            response += f"""**Análise:**
- Nosso preço: R$ {float(preco_hist.nosso_preco):,.2f}
- Preço vencedor: R$ {float(preco_hist.preco_vencedor):,.2f}
- Diferença: R$ {diferenca:,.2f} ({diferenca_pct:.1f}%)
"""
            if preco_hist.motivo_perda:
                motivo_texto = {
                    "preco": "Preço",
                    "tecnica": "Questão técnica",
                    "documentacao": "Documentação",
                    "prazo": "Prazo",
                    "outro": "Outro"
                }.get(preco_hist.motivo_perda, preco_hist.motivo_perda)
                response += f"- Motivo: {motivo_texto}\n"

        return response, {"edital_id": edital.id, "resultado": preco_hist.resultado}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"❌ Erro ao consultar resultado: {str(e)}", None
    finally:
        db.close()


def processar_consultar_todos_resultados(user_id: str, db):
    """
    Consulta resultados de TODOS os editais do usuário.
    Retorna uma tabela markdown com os resultados.
    """
    from models import Edital, PrecoHistorico

    try:
        # Buscar editais com resultado registrado (status diferente de 'novo', 'aberto', 'analisando')
        status_com_resultado = ['vencedor', 'perdedor', 'cancelado', 'deserto', 'revogado']

        editais = db.query(Edital).filter(
            Edital.user_id == user_id,
            Edital.status.in_(status_com_resultado)
        ).order_by(Edital.data_abertura.desc()).all()

        if not editais:
            # Verificar se tem editais sem resultado
            total_editais = db.query(Edital).filter(Edital.user_id == user_id).count()
            if total_editais > 0:
                return f"""📊 **Resultados de Certames**

⚠️ Nenhum edital com resultado registrado.

Você tem **{total_editais} editais** cadastrados, mas nenhum com resultado definido.

Para registrar um resultado, use:
- "Perdemos o edital [NUMERO] para [EMPRESA] com R$ [VALOR]"
- "Ganhamos o edital [NUMERO] com R$ [VALOR]"
- "O edital [NUMERO] foi cancelado"
""", None
            else:
                return "❌ Você não tem editais cadastrados.", None

        # Contar por status
        contagem = {}
        for e in editais:
            status = e.status or "indefinido"
            contagem[status] = contagem.get(status, 0) + 1

        # Montar tabela markdown
        response = f"""## 📊 Resultados dos Certames

**Total com resultado:** {len(editais)} editais

**Resumo:**
"""
        # Adicionar resumo com emojis
        emoji_status = {
            'vencedor': '🏆',
            'perdedor': '📉',
            'cancelado': '⛔',
            'deserto': '🚫',
            'revogado': '❌'
        }
        for status, qtd in sorted(contagem.items(), key=lambda x: -x[1]):
            emoji = emoji_status.get(status, '📋')
            response += f"- {emoji} **{status.capitalize()}:** {qtd}\n"

        response += "\n---\n\n"

        # Tabela de editais
        response += "| Número | Órgão | Status | Valor Ref. | Data |\n"
        response += "|--------|-------|--------|------------|------|\n"

        for edital in editais[:20]:  # Limitar a 20 para não ficar muito grande
            numero = edital.numero or "N/A"
            orgao = (edital.orgao[:30] + "...") if edital.orgao and len(edital.orgao) > 30 else (edital.orgao or "N/A")
            status = edital.status.capitalize() if edital.status else "N/A"
            valor = f"R$ {float(edital.valor_referencia):,.0f}".replace(",", ".") if edital.valor_referencia else "N/A"
            data = edital.data_abertura.strftime('%d/%m/%Y') if edital.data_abertura else "N/A"

            # Adicionar emoji ao status
            emoji = emoji_status.get(edital.status, '')
            response += f"| {numero} | {orgao} | {emoji} {status} | {valor} | {data} |\n"

        if len(editais) > 20:
            response += f"\n*... e mais {len(editais) - 20} editais*\n"

        response += "\n---\n*Para detalhes de um edital específico, use: \"Qual o resultado do edital [NUMERO]?\"*"

        return response, {"total": len(editais), "contagem": contagem}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"❌ Erro ao consultar resultados: {str(e)}", None


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
            elif resultado.get("duplicado"):
                prod_exist = resultado.get("produto_existente", {})
                response_text = f"""## ⚠️ Produto já cadastrado!

**Nome:** {prod_exist.get('nome', 'N/A')}
**Modelo:** {prod_exist.get('modelo', 'N/A')}
**ID:** {prod_exist.get('id', 'N/A')}

Use **reprocesse o produto {prod_exist.get('nome')}** para atualizar as especificações."""
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
