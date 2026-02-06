"""
Agente de Editais - Backend Flask
MVP com 9 ações via Select + Prompt
"""
import os
from flask import Flask, request, jsonify, send_file
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
    tool_buscar_links_editais,
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

6. **extrair_ata**: Extrair resultados de uma ata de sessão de pregão/licitação
   Exemplos: "extraia os resultados desta ata", "quem ganhou este pregão?", "registre os resultados da ata", "extraia vencedores", "resultado da licitação"
   Palavras-chave: ata, resultados da ata, vencedor do pregão, extrair resultados, ata de sessão
   IMPORTANTE: Use quando o arquivo é uma ATA de sessão (não um manual de produto)

### AÇÕES DE BUSCA:
7. **buscar_web**: Buscar MATERIAIS/MANUAIS/DATASHEETS na WEB (não editais!)
   Exemplos: "busque na web o manual do equipamento X", "encontre o datasheet do Y"

8. **download_url**: Baixar arquivo de uma URL específica
   Exemplos: "baixe o arquivo da URL: http://...", "baixe https://..."
   IMPORTANTE: Se contém URL (http:// ou https://), classifique como download_url!

9. **buscar_editais**: Buscar EDITAIS/LICITAÇÕES em portais (PNCP, BEC) por TERMO/ÁREA COM cálculo de score de aderência
   Exemplos: "busque editais de tecnologia", "editais da área médica", "busque editais de hematologia"
   IMPORTANTE: Use quando buscar por TERMO genérico (área, categoria, produto) E calcular score de aderência

9b. **buscar_editais_simples**: Buscar EDITAIS SEM calcular score - apenas listar os editais encontrados
   Exemplos: "busque editais de tecnologia sem score", "liste editais de hematologia sem calcular aderência", "busque editais de informática apenas listando"
   Palavras-chave: sem score, sem calcular, sem aderência, apenas listar, só listar, listar editais
   IMPORTANTE: Use quando o usuário quer apenas ver os editais sem análise de aderência

10. **buscar_edital_numero**: Buscar UM edital específico pelo NÚMERO
   Exemplos: "busque o edital PE-001/2026", "encontre o edital 90186", "busque edital número 123/2025"
   Palavras-chave: busque o edital, encontre o edital, buscar edital número, edital PE-, edital nº
   IMPORTANTE: Use quando o usuário menciona um NÚMERO específico de edital

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

16. **salvar_editais**: Salvar editais da última busca (um específico ou todos)
    Exemplos: "salve os editais", "salvar recomendados", "salvar todos", "salvar edital 02223/2025", "salvar edital PE-001/2026"
    IMPORTANTE: Use quando o usuário quer SALVAR editais que vieram de uma BUSCA anterior. Diferente de cadastrar_edital que é para criar um edital MANUALMENTE com dados informados.

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

21. **buscar_atas_pncp**: Buscar atas de sessão/registro de preço no PNCP para download
    Exemplos: "busque atas de hematologia", "encontre atas de pregão de equipamentos", "baixe atas de registro de preço", "atas de sessão de pregão"
    Palavras-chave: buscar atas, encontrar atas, baixar atas, atas de registro, atas de sessão, atas pncp
    IMPORTANTE: Use quando o usuário quer BUSCAR atas no portal PNCP (não quando já tem um arquivo)

22. **buscar_precos_pncp**: Buscar preços históricos de contratos no PNCP
    Exemplos: "busque preços de hematologia", "qual o preço de mercado para analisador?", "preços de contratos de equipamentos", "quanto custa um equipamento X no PNCP?"
    Palavras-chave: buscar preços, preço de mercado, preços pncp, quanto custa, preço médio, valores de contrato
    Use quando: usuário quer saber preços praticados em licitações anteriores

23. **historico_precos**: Consultar histórico de preços registrados no sistema
    Exemplos: "mostre histórico de preços de hematologia", "histórico de preços do produto X", "quais preços já registramos?"
    Palavras-chave: histórico de preços, preços registrados, preços salvos, histórico preço

24. **listar_concorrentes**: Listar todos os concorrentes conhecidos
    Exemplos: "liste os concorrentes", "quais concorrentes conhecemos?", "mostre os concorrentes"
    Palavras-chave: listar concorrentes, concorrentes conhecidos, nossos concorrentes

25. **analisar_concorrente**: Analisar um concorrente específico
    Exemplos: "analise o concorrente MedLab", "como está a empresa TechSaúde?", "histórico do concorrente X"
    Palavras-chave: analisar concorrente, análise concorrente, histórico concorrente

26. **recomendar_preco**: Recomendar preço para um produto/edital
    Exemplos: "qual preço sugerir para hematologia?", "recomende preço para analisador", "que preço colocar?"
    Palavras-chave: recomendar preço, sugerir preço, que preço, qual preço colocar

27. **classificar_edital**: Classificar tipo de edital (comodato, venda, aluguel)
    Exemplos: "classifique este edital", "que tipo de edital é este?", "é comodato ou venda?"
    Palavras-chave: classificar edital, tipo de edital, qual modalidade, é comodato

28. **verificar_completude**: Verificar se produto tem todas informações necessárias
    Exemplos: "produto X está completo?", "verifique completude do produto", "falta algo no produto?"
    Palavras-chave: verificar completude, produto completo, falta informação, completude produto

29. **cadastrar_edital**: Cadastrar/registrar manualmente um edital no sistema COM DADOS INFORMADOS PELO USUÁRIO
    Exemplos: "cadastre o edital PE-001/2026, órgão Ministério da Saúde, objeto: aquisição de equipamentos", "registre este edital com os dados...", "adicione o edital número X do órgão Y"
    Palavras-chave: cadastre edital, registre edital, adicione edital, cadastrar edital manualmente, inserir edital
    IMPORTANTE: Use APENAS quando o usuário quer CRIAR um edital MANUALMENTE informando dados (órgão, objeto, etc).
    NÃO USE para "salvar edital NUMERO" que veio de uma busca - isso é salvar_editais!

### SPRINT 2 - ALERTAS E MONITORAMENTO:
30. **configurar_alertas**: Configurar alertas de prazo para um edital
    Exemplos: "configure alertas para PE-001", "avise-me 24h antes da abertura", "quero alerta de impugnação"
    Palavras-chave: configurar alerta, avise-me, lembre-me, alertar antes, alertas para edital

31. **listar_alertas**: Ver alertas configurados / próximos pregões
    Exemplos: "quais alertas tenho?", "meus alertas", "próximos pregões", "alertas configurados"
    Palavras-chave: listar alertas, meus alertas, alertas configurados, próximos pregões

32. **dashboard_prazos**: Ver dashboard de prazos e contagem regressiva
    Exemplos: "mostre dashboard de prazos", "quais editais abrem esta semana?", "timer dos editais"
    Palavras-chave: dashboard prazos, editais abrem, contagem regressiva, timer editais

33. **calendario_editais**: Ver calendário de editais
    Exemplos: "calendário de fevereiro", "calendário de editais", "editais do mês"
    Palavras-chave: calendário editais, calendário mês, ver calendário

34. **configurar_monitoramento**: Configurar monitoramento automático de editais
    Exemplos: "monitore editais de hematologia", "configure busca automática", "avise novos editais de X"
    Palavras-chave: monitorar editais, monitoramento automático, busca automática, avisar novos

35. **listar_monitoramentos**: Ver monitoramentos configurados
    Exemplos: "quais monitoramentos tenho?", "monitoramentos ativos", "ver minhas buscas automáticas"
    Palavras-chave: listar monitoramentos, monitoramentos ativos, minhas buscas

36. **desativar_monitoramento**: Desativar um monitoramento
    Exemplos: "desative monitoramento de hematologia", "pare de monitorar X", "cancele busca automática"
    Palavras-chave: desativar monitoramento, parar monitorar, cancelar busca

37. **configurar_notificacoes**: Configurar preferências de notificação
    Exemplos: "configure meu email de notificação", "quero alertas das 8h às 18h", "preferências de alerta"
    Palavras-chave: configurar notificação, email notificação, preferências alerta

38. **historico_notificacoes**: Ver histórico de notificações
    Exemplos: "histórico de notificações", "notificações não lidas", "ver notificações"
    Palavras-chave: histórico notificações, notificações não lidas, ver notificações

39. **extrair_datas_edital**: Extrair datas importantes de um edital (PDF)
    Exemplos: "extraia as datas deste edital", "quando abre o edital?", "prazo de impugnação"
    Palavras-chave: extrair datas, datas edital, quando abre, prazo impugnação

40. **cancelar_alerta**: Cancelar alertas configurados
    Exemplos: "cancele alertas do PE-001", "remova meus alertas", "desative alertas"
    Palavras-chave: cancelar alerta, remover alerta, desativar alerta

41. **chat_livre**: Dúvidas gerais, conversas
    Exemplos: "o que é pregão?", "olá", "obrigado"

### ANÁLISE DE EDITAIS:
42. **resumir_edital**: Fazer um resumo de um edital cadastrado
    Exemplos: "resuma o edital PE-001/2026", "faça um resumo do edital", "resumo do edital PE-001", "sintetize o edital"
    Palavras-chave: resumir edital, resumo do edital, sintetize edital, resumo edital
    IMPORTANTE: O usuário quer um resumo executivo do edital (objeto, valor, prazos, requisitos principais)

43. **perguntar_edital**: Responder dúvidas/perguntas sobre um edital específico
    Exemplos: "qual o prazo de entrega do edital PE-001?", "o edital PE-001 exige garantia?", "quais documentos são exigidos no PE-001?", "pergunte ao edital PE-001 sobre [DÚVIDA]"
    Palavras-chave: perguntar ao edital, dúvida sobre edital, o edital exige, o edital pede, prazo do edital, requisitos do edital
    IMPORTANTE: Use quando o usuário tem uma dúvida específica sobre um edital cadastrado

44. **baixar_pdf_edital**: Baixar o PDF de um edital já cadastrado (a partir da URL salva)
    Exemplos: "baixe o PDF do edital PE-001/2026", "faça download do edital PE-001", "baixar edital PE-001", "download do pdf do edital"
    Palavras-chave: baixar pdf edital, download edital, baixar edital, baixe o edital, download pdf edital
    IMPORTANTE: Use quando o usuário quer BAIXAR o arquivo PDF de um edital que já está cadastrado no sistema

45. **atualizar_url_edital**: Atualizar a URL de um edital cadastrado
    Exemplos: "atualize o edital PE-001 com URL: https://...", "mude a URL do edital PE-001 para https://...", "corrija a URL do edital PE-001", "atualize URL do edital"
    Palavras-chave: atualizar url, atualize edital com url, mude url, corrija url, atualizar link edital
    IMPORTANTE: Use quando o usuário quer ATUALIZAR/CORRIGIR a URL de download de um edital já cadastrado

46. **buscar_links_editais**: Retornar links de editais em uma área/categoria específica
    Exemplos: "retorne os links para os editais na área de hematologia", "links de editais de equipamentos médicos", "mostre links de editais de TI", "links para editais de laboratório"
    Palavras-chave: links de editais, links para editais, retorne os links, mostre links editais
    IMPORTANTE: Use quando o usuário quer VER LINKS clicáveis de editais, não calcular score

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

    # 2.1 Extrair ata de sessão (ANTES de outras ações com arquivo)
    if any(p in msg for p in ["extraia os resultados", "extrair resultados", "resultados da ata",
                               "ata de sessão", "ata de sessao", "vencedor do pregão", "vencedor do pregao",
                               "quem ganhou o pregão", "quem ganhou o pregao", "extraia da ata",
                               "registre os resultados da ata", "resultado da licitação", "resultado da licitacao"]):
        return "extrair_ata"

    # 2.5. Download de URL - ANTES de outras ações
    if "http://" in msg or "https://" in msg:
        if any(p in msg for p in ["baixe", "baixar", "download", "faça download"]):
            return "download_url"
        # Se tem URL e fala de PDF/manual/arquivo, também é download
        if any(p in msg for p in [".pdf", "manual", "arquivo", "documento"]):
            return "download_url"

    # 3. Salvar editais (da busca)
    # Detecta: "salvar edital", "salvar editais", "salvar todos", "salvar recomendados"
    # Também detecta "salvar edital NUMERO" (quando tem número de edital)
    if any(p in msg for p in ["salvar edital", "salvar editais", "salvar todos", "salvar recomendados",
                               "guardar edital", "guardar editais"]):
        return "salvar_editais"
    # "salve" sozinho ou com número de edital
    if "salve" in msg and ("edital" in msg or "editais" in msg or re.search(r'\d{2,}[/]\d{4}', msg)):
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

    # 5.4 Buscar atas no PNCP
    if any(p in msg for p in ["buscar atas", "busque atas", "encontrar atas", "encontre atas",
                               "baixar atas", "baixe atas", "atas de registro", "atas de sessão",
                               "atas de sessao", "atas pncp", "atas do pncp"]):
        return "buscar_atas_pncp"

    # 5.4.1 Buscar preços no PNCP (Funcionalidade 4 Sprint 1)
    if any(p in msg for p in ["buscar preços", "busque preços", "buscar precos", "busque precos",
                               "preço de mercado", "preco de mercado", "preços pncp", "precos pncp",
                               "quanto custa", "preço médio", "preco medio", "valores de contrato",
                               "preços de contrato", "precos de contrato", "preço praticado",
                               "preco praticado", "preços praticados", "precos praticados"]):
        return "buscar_precos_pncp"

    # 5.4.2 Histórico de preços (Funcionalidade 5 Sprint 1)
    if any(p in msg for p in ["histórico de preços", "historico de precos", "preços registrados",
                               "precos registrados", "preços salvos", "precos salvos",
                               "histórico preço", "historico preco"]):
        return "historico_precos"

    # 5.4.3 Listar concorrentes (Funcionalidade 6 Sprint 1)
    if any(p in msg for p in ["listar concorrentes", "liste concorrentes", "concorrentes conhecidos",
                               "nossos concorrentes", "quais concorrentes", "ver concorrentes"]):
        return "listar_concorrentes"

    # 5.4.4 Analisar concorrente (Funcionalidade 6 Sprint 1)
    if any(p in msg for p in ["analisar concorrente", "analise concorrente", "análise concorrente",
                               "analise o concorrente", "histórico concorrente", "historico concorrente"]):
        return "analisar_concorrente"

    # 5.4.5 Recomendar preço (Funcionalidade 7 Sprint 1)
    if any(p in msg for p in ["recomendar preço", "recomendar preco", "sugerir preço", "sugerir preco",
                               "que preço colocar", "que preco colocar", "qual preço sugerir",
                               "qual preco sugerir", "recomende preço", "recomende preco"]):
        return "recomendar_preco"

    # 5.4.6 Classificar edital (Funcionalidade 8 Sprint 1)
    if any(p in msg for p in ["classificar edital", "classifique edital", "tipo de edital",
                               "que tipo de edital", "é comodato", "e comodato", "é venda",
                               "é aluguel", "qual modalidade"]):
        return "classificar_edital"

    # 5.4.7 Verificar completude produto (Funcionalidade 9 Sprint 1)
    if any(p in msg for p in ["verificar completude", "produto completo", "falta informação",
                               "falta informacao", "completude produto", "está completo",
                               "esta completo", "informações faltando"]):
        return "verificar_completude"

    # 5.4.8 Resumir edital
    if any(p in msg for p in ["resumir edital", "resuma o edital", "resumo do edital", "resuma edital",
                               "sintetize o edital", "sintetize edital", "resumo edital"]):
        return "resumir_edital"

    # 5.4.9 Perguntar ao edital
    if any(p in msg for p in ["perguntar ao edital", "pergunte ao edital", "dúvida sobre edital",
                               "duvida sobre edital", "o edital exige", "o edital pede",
                               "prazo do edital", "requisitos do edital", "no edital pe-",
                               "do edital pe-", "edital pe-"]) and "?" in msg:
        return "perguntar_edital"

    # 5.4.10 Baixar PDF do edital
    if any(p in msg for p in ["baixar pdf edital", "baixe o pdf do edital", "download do edital",
                               "baixar edital", "baixe o edital", "download pdf edital",
                               "faça download do edital", "baixe edital"]):
        return "baixar_pdf_edital"

    # 5.4.11 Atualizar URL do edital
    if any(p in msg for p in ["atualize o edital", "atualizar url", "atualize url", "mude a url",
                               "corrija a url", "corrija url", "atualizar link", "atualize link"]):
        if "url" in msg or "http" in msg:
            return "atualizar_url_edital"

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

    # 9. Cadastrar edital manualmente - ANTES de buscar editais
    if any(p in msg for p in ["cadastre o edital", "cadastrar edital", "registre o edital", "adicione o edital", "inserir edital"]):
        return "cadastrar_edital"

    # 10. Detectar se é busca no BANCO ou na WEB
    # Palavras que indicam BANCO LOCAL: "no banco", "cadastrado", "salvo", "no sistema", "banco de dados"
    busca_local = any(p in msg for p in ["no banco", "cadastrado", "salvo", "no sistema", "banco de dados",
                                          "tenho o edital", "tenho edital", "já tenho", "ja tenho"])
    # Palavras que indicam WEB: "na web", "no pncp", "internet", "online", "portal"
    busca_web = any(p in msg for p in ["na web", "no pncp", "pncp", "internet", "online", "portal", "bec"])

    import re

    # 10.1 Buscar edital específico por número
    tem_numero_edital = re.search(r'(PE[-]?\d+|[Pp]reg[aã]o\s*n?[ºo°]?\s*\d+|\d{4,}[/]\d{4}|n[ºo°]\s*\d+)', msg, re.IGNORECASE)
    if any(p in msg for p in ["busque o edital", "encontre o edital", "buscar edital"]) or tem_numero_edital:
        # Sempre usa buscar_edital_numero - a função internamente decide banco/web
        return "buscar_edital_numero"

    # 10.2 Buscar editais por termo
    if any(p in msg for p in ["busque editais", "buscar editais", "encontre editais", "encontrar editais"]):
        if busca_local:
            return "listar_editais"  # Lista do banco
        # Verificar se quer sem score
        sem_score = any(p in msg for p in ["sem score", "sem calcular", "sem aderência", "sem aderencia",
                                            "apenas listar", "só listar", "so listar", "apenas liste",
                                            "só liste", "so liste", "sem análise", "sem analise"])
        if sem_score:
            return "buscar_editais_simples"  # Busca sem calcular score
        else:
            return "buscar_editais"  # Busca na web com score (padrão)

    # 10.3 Buscar produtos
    if any(p in msg for p in ["busque produto", "buscar produto", "encontre produto", "encontrar produto"]):
        if busca_web:
            return "buscar_web"  # Busca manual na web
        else:
            return "listar_produtos"  # Lista do banco (padrão)

    # 11. Consultas analíticas via MindsDB - ANTES de buscar_editais genérico!
    # Inclui consultas com filtros de status, agregações, estatísticas
    palavras_mindsdb = [
        "estatística", "estatistica", "score médio", "score medio", "média de", "media de",
        "quantos editais", "quantos produtos", "análise dos dados", "analise dos dados",
        "relatório", "relatorio", "ranking", "tendência", "tendencia", "comparar",
        "por estado", "por uf", "por categoria", "desempenho", "performance",
        # Consultas de status/resultado
        "status perdido", "status ganho", "status novo", "status cancelado",
        "resultado perdido", "resultado ganho", "editais perdidos", "editais ganhos",
        "editais com status", "editais que estão", "editais que estao",
        "quais editais têm", "quais editais tem", "liste editais com",
        # Agregações
        "total de", "soma de", "contagem de", "quantidade de"
    ]
    if any(p in msg for p in palavras_mindsdb):
        return "consulta_mindsdb"

    # 12. FALLBACK INTELIGENTE: Se parece ser consulta sobre dados do banco → MindsDB
    # Palavras que indicam que é uma pergunta sobre dados armazenados
    palavras_dados_banco = [
        # Entidades do banco
        "edital", "editais", "produto", "produtos", "proposta", "propostas",
        "análise", "analise", "análises", "analises", "ata", "atas",
        "resultado", "resultados", "fonte", "fontes", "concorrente", "concorrentes",
        # Verbos de consulta
        "liste", "listar", "mostre", "mostrar", "exiba", "exibir",
        "quais", "qual", "quantos", "quantas", "onde", "quando",
        # Filtros
        "com valor", "acima de", "abaixo de", "maior que", "menor que",
        "entre", "desde", "até", "depois de", "antes de",
        "do mês", "da semana", "do ano", "de hoje", "de ontem",
        "em são paulo", "em sp", "em minas", "em mg", "no rio",
        # Ordenação
        "ordenado", "ordenados", "mais recente", "mais antigo", "últimos", "ultimos"
    ]

    # Se contém palavras de dados E parece ser uma pergunta/consulta
    eh_pergunta = any(p in msg for p in ["?", "quais", "qual", "quantos", "quantas",
                                          "liste", "mostre", "exiba", "me diga", "me fale"])
    menciona_dados = any(p in msg for p in palavras_dados_banco)

    if menciona_dados and eh_pergunta:
        return "consulta_mindsdb"

    # =============================================================================
    # SPRINT 2: ALERTAS E AUTOMAÇÃO
    # =============================================================================

    # 13.1 Configurar alertas de prazo
    if any(p in msg for p in ["configurar alerta", "configure alerta", "criar alerta", "crie alerta",
                               "avise-me", "lembre-me antes", "alerta para o edital", "alertar sobre",
                               "quero ser avisado", "me avise quando", "notifique-me"]):
        return "configurar_alertas"

    # 13.2 Listar alertas
    if any(p in msg for p in ["meus alertas", "listar alertas", "alertas configurados", "ver alertas",
                               "quais alertas", "alertas ativos", "próximos pregões", "proximos pregoes"]):
        return "listar_alertas"

    # 13.3 Dashboard de prazos
    if any(p in msg for p in ["dashboard de prazo", "dashboard prazos", "contagem regressiva",
                               "prazos dos editais", "próximos prazos", "proximos prazos",
                               "ver prazos", "mostre os prazos", "quais prazos"]):
        return "dashboard_prazos"

    # 13.4 Calendário de editais
    if any(p in msg for p in ["calendário", "calendario", "calendário de editais", "calendario de editais",
                               "editais do mês", "editais do mes", "editais da semana", "agenda de editais",
                               "datas importantes", "próximas datas", "proximas datas"]):
        return "calendario_editais"

    # 13.5 Configurar monitoramento
    if any(p in msg for p in ["configurar monitoramento", "configure monitoramento", "criar monitoramento",
                               "monitorar editais", "monitore editais", "quero monitorar",
                               "acompanhar editais", "busca automática", "busca automatica"]):
        return "configurar_monitoramento"

    # 13.6 Listar monitoramentos
    if any(p in msg for p in ["meus monitoramentos", "listar monitoramentos", "monitoramentos ativos",
                               "ver monitoramentos", "quais monitoramentos", "monitoramentos configurados"]):
        return "listar_monitoramentos"

    # 13.7 Desativar monitoramento
    if any(p in msg for p in ["desativar monitoramento", "parar monitoramento", "cancelar monitoramento",
                               "desative o monitoramento", "pare de monitorar", "remover monitoramento"]):
        return "desativar_monitoramento"

    # 13.8 Configurar notificações
    if any(p in msg for p in ["configurar notificações", "configurar notificacoes", "preferências de notificação",
                               "preferencias de notificacao", "email de notificação", "configurar email",
                               "configurar preferências", "configurar preferencias"]):
        return "configurar_notificacoes"

    # 13.9 Histórico de notificações
    if any(p in msg for p in ["histórico de notificações", "historico de notificacoes", "notificações recebidas",
                               "notificacoes recebidas", "ver notificações", "ver notificacoes",
                               "minhas notificações", "minhas notificacoes", "notificações não lidas",
                               "notificacoes nao lidas"]):
        return "historico_notificacoes"

    # 13.10 Extrair datas de edital
    if any(p in msg for p in ["extrair datas", "extraia as datas", "datas do edital", "prazos do edital",
                               "quais são as datas", "quais sao as datas", "identifique as datas",
                               "encontre as datas"]):
        return "extrair_datas_edital"

    # 13.11 Cancelar alerta
    if any(p in msg for p in ["cancelar alerta", "cancele o alerta", "remover alerta", "remova o alerta",
                               "excluir alerta", "desativar alerta", "não me avise mais",
                               "nao me avise mais"]):
        return "cancelar_alerta"

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

        elif action_type == "buscar_editais_simples":
            response_text, resultado = processar_buscar_editais(message, user_id, termo_ia=termo_busca_ia, calcular_score=False)

        elif action_type == "buscar_edital_numero":
            response_text, resultado = processar_buscar_edital_numero(message, user_id)

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

        elif action_type == "buscar_atas_pncp":
            response_text, resultado = processar_buscar_atas_pncp(message, user_id)

        elif action_type == "buscar_precos_pncp":
            response_text, resultado = processar_buscar_precos_pncp(message, user_id)

        elif action_type == "historico_precos":
            response_text, resultado = processar_historico_precos(message, user_id)

        elif action_type == "listar_concorrentes":
            response_text, resultado = processar_listar_concorrentes(user_id)

        elif action_type == "analisar_concorrente":
            response_text, resultado = processar_analisar_concorrente(message, user_id)

        elif action_type == "recomendar_preco":
            response_text, resultado = processar_recomendar_preco(message, user_id)

        elif action_type == "classificar_edital":
            response_text, resultado = processar_classificar_edital(message, user_id)

        elif action_type == "verificar_completude":
            response_text, resultado = processar_verificar_completude(message, user_id)

        elif action_type == "cadastrar_edital":
            response_text, resultado = processar_cadastrar_edital(message, user_id, intencao_resultado)

        # =============================================================================
        # SPRINT 2: ALERTAS E AUTOMAÇÃO
        # =============================================================================
        elif action_type == "configurar_alertas":
            response_text = processar_configurar_alertas(message, user_id)

        elif action_type == "listar_alertas":
            response_text = processar_listar_alertas(message, user_id)

        elif action_type == "dashboard_prazos":
            response_text = processar_dashboard_prazos(message, user_id)

        elif action_type == "calendario_editais":
            response_text = processar_calendario_editais(message, user_id)

        elif action_type == "configurar_monitoramento":
            response_text = processar_configurar_monitoramento(message, user_id)

        elif action_type == "listar_monitoramentos":
            response_text = processar_listar_monitoramentos(message, user_id)

        elif action_type == "desativar_monitoramento":
            response_text = processar_desativar_monitoramento(message, user_id)

        elif action_type == "configurar_notificacoes":
            response_text = processar_configurar_notificacoes(message, user_id)

        elif action_type == "historico_notificacoes":
            response_text = processar_historico_notificacoes(message, user_id)

        elif action_type == "extrair_datas_edital":
            response_text = processar_extrair_datas_edital(message, user_id)

        elif action_type == "cancelar_alerta":
            response_text = processar_cancelar_alerta(message, user_id)

        # =============================================================================
        # ANÁLISE DE EDITAIS (Resumir e Perguntar)
        # =============================================================================
        elif action_type == "resumir_edital":
            response_text, resultado = processar_resumir_edital(message, user_id, intencao_resultado)

        elif action_type == "perguntar_edital":
            response_text, resultado = processar_perguntar_edital(message, user_id, intencao_resultado)

        elif action_type == "baixar_pdf_edital":
            response_text, resultado = processar_baixar_pdf_edital(message, user_id, intencao_resultado)

        elif action_type == "atualizar_url_edital":
            response_text, resultado = processar_atualizar_url_edital(message, user_id, intencao_resultado)

        elif action_type == "buscar_links_editais":
            response_text, resultado = processar_buscar_links_editais(message, user_id)

        else:  # chat_livre
            response_text = processar_chat_livre(message, user_id, session_id, db)

        # Salvar resposta do assistente
        # Se foi busca de editais, salvar os editais no sources_json para recuperar depois
        sources_data = None
        if action_type in ["buscar_editais", "buscar_editais_simples"] and resultado:
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


def processar_buscar_editais(message: str, user_id: str, termo_ia: str = None, calcular_score: bool = True):
    """
    Processa ação: Buscar editais

    Novo fluxo:
    1. Busca editais (sem salvar)
    2. Calcula score de aderência para cada edital vs produtos do usuário (se calcular_score=True)
    3. Ordena por score
    4. Mostra recomendações (PARTICIPAR/AVALIAR/NÃO PARTICIPAR) com justificativas
    5. Oferece opção de salvar os recomendados

    Args:
        message: Mensagem original do usuário
        user_id: ID do usuário
        termo_ia: Termo de busca já extraído pelo agente classificador (opcional)
        calcular_score: Se True, calcula score de aderência. Se False, apenas lista os editais.
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

    # ========== PASSO 2: Calcular score de aderência (se solicitado) ==========
    aviso_produtos = None
    if calcular_score:
        print(f"[APP] Calculando score de aderência para {len(editais)} editais...")
        resultado_score = tool_calcular_score_aderencia(editais, user_id)

        if resultado_score.get("success"):
            editais_com_score = resultado_score.get("editais_com_score", editais)
            aviso_produtos = resultado_score.get("aviso")
        else:
            editais_com_score = editais
    else:
        print(f"[APP] Busca SIMPLES (sem score) - {len(editais)} editais encontrados")
        editais_com_score = editais

    # ========== PASSO 3: Formatar resposta ==========
    fontes_str = ', '.join(fontes_consultadas) if fontes_consultadas else fonte
    modo_busca = "com análise de aderência" if calcular_score else "listagem simples (sem score)"
    response = f"""**Busca realizada:** {termo}
**Fontes consultadas:** {fontes_str}
**Modo:** {modo_busca}
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
        """Formata um edital para exibição com botões de ação"""
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
        pdf_url = ed.get('pdf_url', '')
        total_itens = ed.get('total_itens', 0)
        cnpj = ed.get('cnpj_orgao', '')
        ano = ed.get('ano_compra', '')
        seq = ed.get('seq_compra', '')
        dados_completos = ed.get('dados_completos', False)

        # Badge de fonte com cor
        fonte_badge = ""
        if 'PNCP' in fonte_edital:
            fonte_badge = f"🟢 {fonte_edital}"
        elif 'ComprasNet' in fonte_edital:
            fonte_badge = f"🔵 {fonte_edital}"
        elif 'BEC' in fonte_edital:
            fonte_badge = f"🟡 {fonte_edital}"
        elif 'Scraper' in fonte_edital:
            fonte_badge = f"🟠 {fonte_edital}"
        else:
            fonte_badge = f"⚪ {fonte_edital}" if fonte_edital else ""

        texto = f"---\n"
        texto += f"### {i}. {numero}"
        if score is not None:
            texto += f" | Score: **{score:.0f}%**"
        if fonte_badge:
            texto += f" | {fonte_badge}"
        texto += "\n"
        texto += f"**Órgão:** {orgao} ({local})\n"
        texto += f"**Modalidade:** {modalidade}\n"
        texto += f"**Valor estimado:** {valor_str}\n"
        texto += f"**Data abertura:** {data_abertura}\n"
        if total_itens > 0:
            texto += f"**Itens:** {total_itens} item(ns)\n"
        if dados_completos:
            texto += f"**Dados:** ✅ Completos (PNCP)\n"
        texto += f"**Objeto:** {objeto}\n"
        if justificativa:
            texto += f"\n**Análise:** {justificativa}\n"

        # Botões de ação
        texto += f"\n"
        if url:
            texto += f"🔗 [Acessar Portal]({url}) "

        # Botão PDF - se tem pdf_url direta ou dados PNCP para construir
        if pdf_url:
            texto += f"| 📄 [Ver PDF]({pdf_url}) "
            texto += f"| ⬇️ [Baixar PDF]({pdf_url}?download=true) "
        elif cnpj and ano and seq:
            # Construir URL do PDF via API do PNCP
            pdf_api_url = f"https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{seq}/arquivos/1"
            texto += f"| 📄 [Ver PDF]({pdf_api_url}) "
            texto += f"| ⬇️ [Baixar PDF]({pdf_api_url}) "

        texto += "\n\n"
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

    if calcular_score and qtd_recomendados > 0:
        # Busca COM score - mostrar opções por recomendação
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

    elif not calcular_score and len(editais_com_score) > 0:
        # Busca SEM score - oferecer salvar todos
        response += f"\n---\n"
        response += f"## 💾 Deseja salvar os editais?\n\n"
        response += f"Encontrei **{len(editais_com_score)} edital(is)**.\n\n"

        # Botões de ação
        response += f"<!-- BOTOES_SALVAR -->\n"
        response += f"[[btn:salvar_todos:💾 Salvar Todos ({len(editais_com_score)})]]\n"
        response += f"<!-- /BOTOES_SALVAR -->\n\n"

        response += f"*Ou digite: \"salvar editais\", \"salvar todos\", \"salvar edital [NÚMERO]\"*\n"

    # Adicionar editais ao resultado para possível salvamento posterior
    resultado["editais_com_score"] = editais_com_score
    resultado["editais_recomendados"] = participar + avaliar
    resultado["editais_participar"] = participar
    resultado["editais_avaliar"] = avaliar

    return response, resultado


def processar_buscar_links_editais(message: str, user_id: str):
    """
    Processa ação: Retornar links de editais em uma área.
    Retorna links formatados para o usuário clicar.
    """
    import re

    # Extrair termo/área da mensagem
    termo = None

    # Padrões comuns
    padroes = [
        r'links?\s+(?:para\s+)?(?:os\s+)?editais?\s+(?:na\s+|da\s+|de\s+)?(?:área|area)\s+(.+)',
        r'links?\s+(?:de\s+)?editais?\s+(?:de\s+|para\s+|em\s+)?(.+)',
        r'editais?\s+(?:de\s+|para\s+|em\s+|na\s+área\s+)?(.+)',
        r'busca.+links?\s+(.+)',
        r'(?:retorne|mostre|liste)\s+(?:os\s+)?links?\s+(?:para\s+|de\s+)?(.+)',
    ]

    msg_lower = message.lower()
    for padrao in padroes:
        match = re.search(padrao, msg_lower, re.IGNORECASE)
        if match:
            termo = match.group(1).strip()
            # Limpar palavras desnecessárias
            palavras_remover = ['por favor', 'obrigado', 'pncp', 'web', 'internet']
            for p in palavras_remover:
                termo = termo.replace(p, '').strip()
            break

    # Fallback: usar toda a mensagem após limpeza
    if not termo:
        palavras_ignorar = ['retorne', 'mostre', 'liste', 'busque', 'links', 'link', 'editais',
                           'edital', 'para', 'os', 'de', 'da', 'do', 'na', 'no', 'área', 'area']
        palavras = msg_lower.split()
        termos = [p for p in palavras if p not in palavras_ignorar and len(p) > 2]
        termo = ' '.join(termos) if termos else "equipamentos"

    print(f"[LINKS] Buscando links para área: '{termo}'")

    # Chamar a função de busca de links
    resultado = tool_buscar_links_editais(termo, user_id=user_id)

    if resultado.get("success"):
        return resultado.get("texto", "Nenhum resultado"), resultado
    else:
        return f"❌ Erro ao buscar links: {resultado.get('error', 'Erro desconhecido')}", resultado


def processar_buscar_edital_numero(message: str, user_id: str, buscar_apenas_banco: bool = False):
    """
    Processa busca de um edital específico pelo número.

    Args:
        message: Mensagem do usuário contendo o número do edital
        user_id: ID do usuário
        buscar_apenas_banco: Se True, busca APENAS no banco local. Se False, busca no banco e depois na web.

    Returns:
        Tuple (response_text, resultado)
    """
    import re
    import requests

    # Detectar se é busca no banco ou na web
    msg_lower = message.lower()
    busca_local = any(p in msg_lower for p in ["no banco", "cadastrado", "salvo", "no sistema", "banco de dados",
                                                "tenho o edital", "tenho edital", "já tenho", "ja tenho"])

    # Se especificou banco na mensagem, força busca local
    if busca_local:
        buscar_apenas_banco = True

    # Extrair número do edital da mensagem
    # Padrões: PE-001/2026, PE0013/2025, PE 050/2025, 90186/2025, nº 123, número 456
    padroes = [
        r'PE[-\s]?\d+[/\-]?\d*',  # PE-001/2026, PE0013/2025, PE 050/2025
        r'[Pp]reg[aã]o\s*(?:n[ºo°]?\s*)?\d+[/\-]?\d*',  # Pregão nº 123/2025
        r'[Ee]dital\s*(?:n[ºo°]?\s*)?\d+[/\-]?\d*',  # Edital nº 123/2025
        r'\d{3,}[/\-]\d{4}',  # 90186/2025, 050/2025
        r'n[ºo°]\s*\d+[/\-]?\d*',  # nº 123/2025
    ]

    numero_edital = None
    for padrao in padroes:
        match = re.search(padrao, message, re.IGNORECASE)
        if match:
            numero_edital = match.group().strip()
            # Limpar prefixos comuns que não fazem parte do número
            numero_edital = re.sub(r'^(edital|pregão|pregao|pe|nº|no|n°)\s*', '', numero_edital, flags=re.IGNORECASE).strip()
            break

    if not numero_edital:
        return """❌ **Não consegui identificar o número do edital.**

Por favor, informe o número no formato:
- "Busque o edital PE-001/2026 no banco"
- "Busque o edital PE-001/2026 no PNCP"
- "Tenho o edital PE-001/2026 cadastrado?"
""", None

    print(f"[BUSCA-EDITAL] Buscando edital: {numero_edital} | Apenas banco: {buscar_apenas_banco}")

    # 1. Verificar se está salvo no sistema
    from models import Edital
    from database import SessionLocal

    db = SessionLocal()
    try:
        edital_local = db.query(Edital).filter(
            Edital.numero.ilike(f"%{numero_edital}%"),
            Edital.user_id == user_id
        ).first()

        if edital_local:
            from models import EditalItem, EditalDocumento

            valor_ref = f"R$ {edital_local.valor_referencia:,.2f}" if edital_local.valor_referencia else '-'
            data_ab = edital_local.data_abertura.strftime('%d/%m/%Y %H:%M') if edital_local.data_abertura else '-'
            data_pub = edital_local.data_publicacao.strftime('%d/%m/%Y') if edital_local.data_publicacao else '-'
            objeto_texto = (edital_local.objeto or '')[:200]
            objeto_sufixo = '...' if len(edital_local.objeto or '') > 200 else ''

            response = f"""## ✅ Edital Encontrado no Sistema

### Dados Gerais
| Campo | Valor |
|-------|-------|
| **Número** | {edital_local.numero} |
| **Órgão** | {edital_local.orgao} |
| **UF/Cidade** | {edital_local.uf or '-'} / {edital_local.cidade or '-'} |
| **Modalidade** | {edital_local.modalidade or '-'} |
| **Status** | {edital_local.status or '-'} |
| **Valor Referência** | {valor_ref} |
| **Data Publicação** | {data_pub} |
| **Data Abertura** | {data_ab} |

### Objeto
{objeto_texto}{objeto_sufixo}

"""
            # Buscar itens do edital
            itens = db.query(EditalItem).filter(EditalItem.edital_id == edital_local.id).order_by(EditalItem.numero_item).all()
            if itens:
                response += f"### Itens ({len(itens)})\n"
                response += "| Item | Descrição | Qtd | Valor Total |\n"
                response += "|------|-----------|-----|-------------|\n"
                for item in itens:
                    desc = (item.descricao or '')[:50]
                    desc_sufixo = '...' if len(item.descricao or '') > 50 else ''
                    qtd = f"{item.quantidade:,.0f} {item.unidade_medida or ''}" if item.quantidade else '-'
                    valor = f"R$ {item.valor_total_estimado:,.2f}" if item.valor_total_estimado else '-'
                    response += f"| {item.numero_item or '-'} | {desc}{desc_sufixo} | {qtd} | {valor} |\n"
                response += "\n"

            # Verificar se tem PDF
            doc = db.query(EditalDocumento).filter(EditalDocumento.edital_id == edital_local.id).first()
            if doc and doc.path_arquivo:
                import os
                if os.path.exists(doc.path_arquivo):
                    response += f"### Documento\n"
                    response += f"📄 **{doc.nome_arquivo}** ({len(doc.texto_extraido or ''):,} caracteres extraídos)\n\n"
                else:
                    response += f"### Documento\n"
                    response += f"⚠️ PDF não disponível (arquivo removido)\n\n"

            # Dados PNCP
            if edital_local.cnpj_orgao:
                response += f"### Dados PNCP\n"
                response += f"- **CNPJ Órgão:** {edital_local.cnpj_orgao}\n"
                response += f"- **Nº PNCP:** {edital_local.numero_pncp or '-'}\n"
                response += f"- **Situação:** {edital_local.situacao_pncp or '-'}\n"
                response += f"- **SRP:** {'Sim' if edital_local.srp else 'Não'}\n\n"

            # URL
            if edital_local.url:
                response += f"### Link\n🔗 {edital_local.url}\n\n"

            response += f"""---
**Ações disponíveis:**
- Baixar PDF: "Baixe o PDF do edital {edital_local.numero}"
- Fazer perguntas: "Qual o prazo de entrega do edital {edital_local.numero}?"
- Calcular aderência: "Calcule aderência do produto X ao edital {edital_local.numero}"
"""
            return response, {"edital": edital_local.numero, "encontrado_local": True, "id": edital_local.id}

        # Se não encontrou no banco e é busca apenas local
        if buscar_apenas_banco:
            return f"""## ❌ Edital não encontrado no banco

O edital **{numero_edital}** não está cadastrado no sistema.

**Opções:**
- Buscar na web: "Busque o edital {numero_edital} no PNCP"
- Cadastrar manualmente: "Cadastre o edital {numero_edital}, órgão [ORGAO], objeto: [OBJETO]"
- Buscar por termo: "Busque editais de [TERMO] no PNCP"
""", {"numero": numero_edital, "encontrado": False}

    finally:
        db.close()

    # 2. Buscar no PNCP (apenas se não for busca exclusiva no banco)
    try:
        # Limpar número para busca
        numero_limpo = re.sub(r'[^\d/]', '', numero_edital)

        url = f"https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao"
        params = {
            "q": numero_edital,
            "pagina": 1,
            "tamanhoPagina": 10
        }

        response_api = requests.get(url, params=params, timeout=30)

        if response_api.status_code == 200:
            dados = response_api.json()
            resultados = dados.get("data", []) or dados.get("items", []) or []

            if resultados:
                response = f"## 🌐 Resultados da Web para: {numero_edital}\n\n"
                response += f"Encontrados: **{len(resultados)}** edital(is)\n\n"

                for i, ed in enumerate(resultados[:5], 1):
                    orgao = ed.get("orgaoEntidade", {}).get("razaoSocial", ed.get("nomeOrgao", "N/A"))
                    numero = ed.get("numeroControlePNCP", ed.get("numero", "N/A"))
                    objeto = ed.get("objetoCompra", ed.get("objeto", "N/A"))[:150]

                    response += f"""### {i}. {numero}
- **Órgão:** {orgao}
- **Objeto:** {objeto}...
- **Modalidade:** {ed.get("modalidadeNome", "N/A")}

"""

                response += "\n---\n*Para salvar, use: \"Salve os editais encontrados\"*"
                return response, {"editais": resultados, "termo": numero_edital}

        # Se não encontrou na API principal, tentar busca genérica
        return processar_buscar_editais(f"edital {numero_edital}", user_id)

    except Exception as e:
        print(f"[BUSCA-EDITAL] Erro na API PNCP: {e}")
        # Fallback para busca genérica
        return processar_buscar_editais(f"edital {numero_edital}", user_id)


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
    from tools import tool_excluir_edital, tool_excluir_editais_multiplos, tool_listar_editais

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
    from tools import tool_excluir_produto, tool_listar_produtos

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
    from tools import tool_atualizar_edital, tool_listar_editais

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

Campos possíveis: numero, orgao, objeto, modalidade, status, valor_referencia, data_abertura, url

Status possíveis: novo, analisando, participar, nao_participar, proposta_enviada, ganho, perdido, cancelado
Modalidades: pregao_eletronico, pregao_presencial, concorrencia, tomada_precos, convite, dispensa, inexigibilidade

IMPORTANTE: Se a mensagem contém uma URL (http:// ou https://), extraia como campo "url".

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
- **URL:** {edital_a_editar.get('url') or 'Não cadastrada'}

Por favor, especifique o que deseja alterar. Exemplos:
- "alterar status para participar"
- "mudar órgão para Prefeitura de SP"
- "atualizar URL para https://exemplo.com/edital.pdf"
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
    from tools import tool_atualizar_produto, tool_listar_produtos

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
                fonte = ed.get('fonte', '')
                fonte_badge = ""
                if 'PNCP' in fonte:
                    fonte_badge = "🟢"
                elif 'ComprasNet' in fonte:
                    fonte_badge = "🔵"
                elif 'BEC' in fonte:
                    fonte_badge = "🟡"
                else:
                    fonte_badge = "⚪"

                response += f"{i}. **{ed['numero']}** ({ed['status']}) {fonte_badge} {fonte}\n"
                response += f"   {ed['orgao']} - {ed['uf'] or 'N/A'}\n"
                response += f"   {ed['objeto'][:80]}...\n"

                # Botões de ação
                botoes = []
                if ed.get('url'):
                    botoes.append(f"[🔗 Portal]({ed['url']})")

                # PDF - verificar se tem pdf_url ou dados PNCP
                pdf_url = ed.get('pdf_url')
                cnpj = ed.get('cnpj_orgao')
                ano = ed.get('ano_compra')
                seq = ed.get('seq_compra')

                if pdf_url:
                    botoes.append(f"[📄 Ver PDF]({pdf_url})")
                    botoes.append(f"[⬇️ Baixar]({pdf_url}?download=true)")
                elif cnpj and ano and seq:
                    pdf_api = f"https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{seq}/arquivos/1"
                    botoes.append(f"[📄 Ver PDF]({pdf_api})")
                    botoes.append(f"[⬇️ Baixar]({pdf_api})")

                if botoes:
                    response += f"   {' | '.join(botoes)}\n"
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
            response = f"""## Análise de Aderência

**Produto:** {resultado.get('produto')}
**Edital:** {resultado.get('edital')}

### Score Técnico: {resultado.get('score_tecnico', 0):.1f}%

"""
            # Se tem requisitos cadastrados
            if resultado.get('requisitos_total', 0) > 0:
                response += f"""**Requisitos:**
- Total: {resultado.get('requisitos_total', 0)}
- Atendidos: {resultado.get('requisitos_atendidos', 0)}
- Parciais: {resultado.get('requisitos_parciais', 0)}
- Não atendidos: {resultado.get('requisitos_nao_atendidos', 0)}

"""
            # Justificativa (da análise via IA)
            if resultado.get('justificativa'):
                response += f"""**Análise:** {resultado.get('justificativa')}

"""
            # Recomendação com emoji
            recomendacao = resultado.get('recomendacao', '')
            if 'RECOMENDADO' in recomendacao and 'NAO' not in recomendacao:
                emoji = "✅"
            elif 'AVALIAR' in recomendacao:
                emoji = "⚠️"
            else:
                emoji = "❌"

            response += f"""### {emoji} Recomendação: {recomendacao}
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
    # - "salvar edital NUMERO" → edital específico

    # Primeiro verificar se tem número de edital específico na mensagem
    numero_especifico = None
    numero_match = re.search(r'edital\s+(\S+)', msg_lower)
    if numero_match:
        numero_especifico = numero_match.group(1).upper()
        # Limpar caracteres especiais do número
        numero_especifico = numero_especifico.strip('.,;:')

    # Determinar tipo de salvamento
    if numero_especifico:
        salvar_tipo = "especifico"
    elif "todos" in msg_lower:
        salvar_tipo = "todos"
    elif "participar" in msg_lower:
        salvar_tipo = "participar"
    elif "recomendados" in msg_lower or "recomendado" in msg_lower:
        salvar_tipo = "recomendados"
    else:
        salvar_tipo = "todos"  # Padrão para busca sem score

    # Buscar última mensagem de busca no histórico (com editais salvos em sources_json)
    # Aceita tanto buscar_editais (com score) quanto buscar_editais_simples (sem score)
    ultima_busca = db.query(Message).filter(
        Message.session_id == session_id,
        Message.action_type.in_(["buscar_editais", "buscar_editais_simples"]),
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

    if salvar_tipo == "especifico" and numero_especifico:
        # Salvar edital específico pelo número
        print(f"[SALVAR] Buscando edital específico: {numero_especifico}")
        for ed in editais_com_score:
            numero_edital = (ed.get("numero") or "").upper()
            # Tentar match exato ou parcial
            if numero_especifico in numero_edital or numero_edital in numero_especifico:
                editais_para_salvar.append(ed)
                print(f"[SALVAR] Encontrado edital: {numero_edital}")
                break
            # Tentar match só com números
            nums_busca = re.sub(r'[^\d]', '', numero_especifico)
            nums_edital = re.sub(r'[^\d]', '', numero_edital)
            if nums_busca and nums_edital and (nums_busca in nums_edital or nums_edital in nums_busca):
                editais_para_salvar.append(ed)
                print(f"[SALVAR] Encontrado edital (match numérico): {numero_edital}")
                break
    elif salvar_tipo == "todos":
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
            # Fallback: pegar os com score >= 50 ou todos se busca foi sem score
            editais_para_salvar = [e for e in editais_com_score if e.get("score_tecnico", 0) >= 50]
            if not editais_para_salvar:
                # Se ainda não tem (busca sem score), pegar todos
                editais_para_salvar = editais_com_score
            print(f"[SALVAR] Fallback recomendados: {len(editais_para_salvar)} editais")

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
        incompletos = resultado_salvar.get("incompletos", [])

        response = "## 💾 Resultado do Salvamento\n\n"

        if salvos:
            response += f"**✅ Salvos com sucesso:** {len(salvos)} edital(is)\n"
            for num in salvos[:5]:
                response += f"- {num}\n"
            if len(salvos) > 5:
                response += f"- ... e mais {len(salvos) - 5}\n"
            response += "\n"

        if incompletos:
            response += f"**⚠️ Salvos com dados incompletos:** {len(incompletos)} edital(is)\n"
            response += "Estes editais não foram encontrados no PNCP e têm informações limitadas:\n"
            for num in incompletos[:3]:
                response += f"- {num}\n"
            response += "\n**Dica:** Para obter dados completos, acesse o link do edital e faça upload do PDF manualmente.\n\n"

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


def processar_extrair_ata(texto_pdf: str, filepath: str, user_id: str, filename: str):
    """
    Processa extração de resultados de uma ata de sessão de pregão.

    Args:
        texto_pdf: Texto extraído do PDF
        filepath: Caminho do arquivo
        user_id: ID do usuário
        filename: Nome do arquivo original

    Returns:
        Tuple (response_text, resultado)
    """
    from tools import tool_extrair_ata_pdf

    resultado = tool_extrair_ata_pdf(texto_pdf, user_id)

    if not resultado.get("success"):
        response = f"""## ❌ Erro ao Extrair Ata

**Arquivo:** {filename}

**Erro:** {resultado.get('error', 'Erro desconhecido')}

**Dica:** Certifique-se de que o arquivo é uma ata de sessão de pregão eletrônico.
"""
        return response, resultado

    # Montar resposta formatada
    response = f"""## 📄 Resultados Extraídos da Ata

**Arquivo:** {filename}
**Edital:** {resultado.get('edital', 'Não identificado')}
**Órgão:** {resultado.get('orgao', 'Não identificado')}
**Data da Sessão:** {resultado.get('data_sessao', 'N/A')}
**Objeto:** {resultado.get('objeto', 'N/A')[:200]}{'...' if resultado.get('objeto') and len(resultado.get('objeto', '')) > 200 else ''}

---

### 📊 Itens/Lotes Extraídos

"""

    # Verificar se há aviso (sem itens extraídos)
    if resultado.get("aviso"):
        response += f"""⚠️ **{resultado['aviso']}**

O documento foi processado mas não foram encontrados itens com vencedores/preços estruturados.

**Possíveis causas:**
- A ata pode estar incompleta ou ser de outra fase do pregão
- O formato do PDF pode ser diferente do esperado
- O texto pode estar escaneado (imagem) e não selecionável

**Alternativa:** Registre o resultado manualmente:
- "Perdemos o edital {resultado.get('edital', '[NUMERO]')} para [EMPRESA] com R$ [VALOR]"
- "Ganhamos o edital {resultado.get('edital', '[NUMERO]')} com R$ [VALOR]"

"""
        return response, resultado

    for item in resultado.get("itens", []):
        emoji = "🏆" if item.get("vencedor") else "❓"
        response += f"""**Item {item.get('item', '?')}:** {item.get('descricao', 'N/A')[:100]}...
- {emoji} **Vencedor:** {item.get('vencedor', 'Não identificado')}
- 💰 **Preço:** R$ {item.get('preco_vencedor', 0):,.2f}
- 👥 **Participantes:** {item.get('participantes_count', 0)}

"""

    # Desclassificados
    if resultado.get("desclassificados"):
        response += "### ⚠️ Empresas Desclassificadas\n\n"
        for desc in resultado["desclassificados"]:
            response += f"- **{desc.get('empresa', 'N/A')}:** {desc.get('motivo', 'Motivo não informado')}\n"
        response += "\n"

    # Concorrentes registrados
    response += "---\n\n### 📁 Dados Registrados\n\n"

    if resultado.get("concorrentes_novos"):
        response += f"**Novos concorrentes:** {', '.join(resultado['concorrentes_novos'][:5])}"
        if len(resultado.get('concorrentes_novos', [])) > 5:
            response += f" (+{len(resultado['concorrentes_novos']) - 5})"
        response += "\n"

    if resultado.get("concorrentes_atualizados"):
        response += f"**Concorrentes atualizados:** {len(resultado['concorrentes_atualizados'])}\n"

    if resultado.get("edital_encontrado"):
        response += f"\n✅ **Edital {resultado['edital_encontrado']} encontrado no sistema - dados salvos no histórico!**\n"
    else:
        edital_num = resultado.get('edital', '[NUMERO]')
        itens = resultado.get('itens', [])

        # Obter dados do primeiro item de forma segura
        primeiro_item = itens[0] if itens else {}
        vencedor = primeiro_item.get('vencedor', 'EMPRESA')
        preco = primeiro_item.get('preco_vencedor', 0)
        objeto = resultado.get('objeto', 'equipamentos') or 'equipamentos'

        response += f"""
⚠️ **Edital não encontrado no sistema.**

Para salvar os dados no histórico, primeiro cadastre o edital:
- Busque editais: "busque editais de {objeto[:30]}"
- Ou registre manualmente o resultado: "Perdemos o edital {edital_num} para {vencedor} com R$ {preco:,.0f}"
"""

    return response, resultado


def processar_buscar_atas_pncp(message: str, user_id: str):
    """
    Processa busca de atas de sessão/registro de preço no PNCP.

    Args:
        message: Mensagem do usuário
        user_id: ID do usuário

    Returns:
        Tuple (response_text, resultado)
    """
    from tools import tool_buscar_atas_pncp

    # Extrair termo de busca usando helper
    palavras = ["busque", "buscar", "encontre", "encontrar", "baixe", "baixar",
                "atas", "ata", "de", "do", "da", "no", "na", "pncp", "registro",
                "preço", "preco", "sessão", "sessao"]
    termo = extrair_termo(message, palavras)

    if not termo or len(termo) < 3:
        return """## ❓ Termo de Busca Necessário

Por favor, especifique o que você está buscando. Exemplos:
- "Busque atas de **hematologia**"
- "Encontre atas de **equipamentos hospitalares**"
- "Baixe atas de **material de laboratório**"
""", None

    resultado = tool_buscar_atas_pncp(termo, user_id)

    if not resultado.get("success"):
        response = f"""## ❌ Erro na Busca de Atas

**Termo:** {termo}
**Erro:** {resultado.get('error', 'Erro desconhecido')}

**Dica:** Tente termos mais específicos como:
- "hematologia"
- "equipamento médico"
- "reagentes laboratoriais"
"""
        return response, resultado

    atas = resultado.get("atas", [])

    response = f"""## 📄 Atas Encontradas no PNCP

**Termo:** {termo}
**Total:** {resultado.get('total', len(atas))} atas encontradas
**Fonte:** {resultado.get('fonte', 'PNCP')}

---

"""

    for i, ata in enumerate(atas[:10], 1):
        titulo = ata.get('titulo', 'Sem título')
        orgao = ata.get('orgao', 'N/A')
        descricao = ata.get('descricao', '')[:150]
        data = ata.get('data_assinatura') or ata.get('data_publicacao', 'N/A')
        url = ata.get('url_pncp', ata.get('url', '#'))

        response += f"""### {i}. {titulo}

**Órgão:** {orgao}
**Data:** {data}
**Descrição:** {descricao}{'...' if len(ata.get('descricao', '')) > 150 else ''}

🔗 [Acessar no PNCP]({url})

---

"""

    response += """
### 💡 Como usar as atas:

1. Clique no link para acessar a ata no PNCP
2. Baixe o PDF da ata de sessão
3. Envie o PDF aqui com a mensagem: **"Extraia os resultados desta ata"**

O sistema irá extrair automaticamente os vencedores, preços e participantes!
"""

    return response, resultado


def processar_buscar_precos_pncp(message: str, user_id: str):
    """
    Processa busca de preços de contratos no PNCP.
    Funcionalidade 4 da Sprint 1.

    Args:
        message: Mensagem do usuário
        user_id: ID do usuário

    Returns:
        Tuple (response_text, resultado)
    """
    from tools import tool_buscar_precos_pncp

    # Extrair termo de busca usando helper
    palavras = ["busque", "buscar", "encontre", "encontrar", "preços", "precos",
                "de", "do", "da", "no", "na", "pncp", "mercado", "médio", "medio",
                "quanto", "custa", "valor", "valores", "contrato", "contratos",
                "praticado", "praticados", "histórico", "historico", "qual", "o"]
    termo = extrair_termo(message, palavras)

    if not termo or len(termo) < 3:
        return """## ❓ Termo de Busca Necessário

Por favor, especifique o produto/equipamento que deseja pesquisar. Exemplos:
- "Busque preços de **analisador hematológico**"
- "Qual o preço de mercado para **centrífuga**?"
- "Preços de **reagentes de bioquímica** no PNCP"
""", None

    resultado = tool_buscar_precos_pncp(termo, meses=12, user_id=user_id)

    if not resultado.get("success"):
        response = f"""## ❌ Nenhum Preço Encontrado

**Termo:** {termo}
**Erro:** {resultado.get('error', 'Nenhum contrato encontrado')}

**Dica:** Tente termos mais específicos como:
- "analisador hematológico"
- "equipamento laboratório"
- "reagentes diagnóstico"
"""
        return response, resultado

    # Formatar resposta
    stats = resultado.get("estatisticas", {})
    contratos = resultado.get("contratos", [])
    top_fornecedores = resultado.get("top_fornecedores", [])

    response = f"""## 💰 Preços de Mercado - PNCP

**Termo pesquisado:** {termo}
**Período:** Últimos {resultado.get('periodo_meses', 12)} meses
**Contratos encontrados:** {resultado.get('total_contratos', 0)}
**Fonte:** {resultado.get('fonte', 'PNCP')}

---

### 📊 Estatísticas de Preços

| Métrica | Valor |
|---------|-------|
| **Mínimo** | R$ {stats.get('preco_minimo', 0):,.2f} |
| **Médio** | R$ {stats.get('preco_medio', 0):,.2f} |
| **Mediano** | R$ {stats.get('preco_mediano', 0):,.2f} |
| **Máximo** | R$ {stats.get('preco_maximo', 0):,.2f} |

---

### 🏢 Principais Fornecedores

"""
    for i, forn in enumerate(top_fornecedores[:5], 1):
        response += f"{i}. **{forn.get('nome', 'N/A')[:40]}** - {forn.get('contratos', 0)} contratos (média: R$ {forn.get('preco_medio', 0):,.2f})\n"

    response += """

---

### 📋 Últimos Contratos

"""
    for i, contrato in enumerate(contratos[:10], 1):
        objeto = contrato.get('objeto', contrato.get('titulo', 'N/A'))[:80]
        fornecedor = contrato.get('fornecedor', 'N/A')[:30]
        valor = contrato.get('valor', 0)
        orgao = contrato.get('orgao', 'N/A')[:30]
        data = contrato.get('data_assinatura', contrato.get('data_publicacao', 'N/A'))
        url = contrato.get('url_pncp', '#')

        response += f"""**{i}. {objeto}...**
- 🏢 Órgão: {orgao}
- 🏭 Fornecedor: {fornecedor}
- 💵 Valor: **R$ {valor:,.2f}**
- 📅 Data: {data}
"""
        if url and url != '#':
            response += f"- 🔗 [Ver no PNCP]({url})\n"
        response += "\n"

    response += """
---

### 💡 Como usar esses dados:

1. **Para definir preço de proposta:** Use o preço médio como referência
2. **Para análise de concorrentes:** Veja os principais fornecedores
3. **Para justificativa de preços:** Cite os contratos como referência

📌 **Dica:** Para salvar esses preços no histórico, registre um resultado de edital!
"""

    return response, resultado


# ==================== HELPER: EXTRAÇÃO DE TERMOS ====================

def extrair_termo(message: str, palavras_remover: list) -> str:
    """
    Extrai termo de busca removendo palavras-chave de comando.
    Usa regex com word boundaries para não cortar partes de palavras.

    Args:
        message: Mensagem do usuário
        palavras_remover: Lista de palavras a remover

    Returns:
        Termo extraído limpo
    """
    import re

    texto = message.lower()

    # Remover palavras usando word boundaries para não cortar partes de palavras
    for palavra in palavras_remover:
        # \b = word boundary - só casa com palavra completa
        pattern = r'\b' + re.escape(palavra) + r'\b'
        texto = re.sub(pattern, ' ', texto, flags=re.IGNORECASE)

    # Limpar espaços extras e pontuação no início/fim
    texto = re.sub(r'\s+', ' ', texto).strip()
    texto = re.sub(r'^[.,!?:;\s]+|[.,!?:;\s]+$', '', texto)

    return texto


# ==================== SPRINT 1 - FUNCIONALIDADE 5: HISTÓRICO DE PREÇOS ====================

def processar_historico_precos(message: str, user_id: str):
    """Processa consulta de histórico de preços."""
    from tools import tool_historico_precos

    # Extrair termo usando helper
    palavras = ["histórico", "historico", "preços", "precos", "de", "do", "da",
                "registrados", "salvos", "mostre", "mostrar", "ver", "consultar",
                "quais", "já", "ja"]
    termo = extrair_termo(message, palavras)

    resultado = tool_historico_precos(termo=termo if termo else None, user_id=user_id)

    if not resultado.get("success"):
        return f"""## ❌ Histórico de Preços

**Erro:** {resultado.get('error', 'Nenhum registro encontrado')}

**Dica:** Registre resultados de editais para criar histórico de preços.
""", resultado

    stats = resultado.get("estatisticas", {})
    historico = resultado.get("historico", [])

    response = f"""## 📈 Histórico de Preços

**Termo:** {termo or 'Todos'}
**Total de registros:** {resultado.get('total', 0)}

---

### 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Mínimo** | R$ {stats.get('preco_minimo', 0):,.2f} |
| **Médio** | R$ {stats.get('preco_medio', 0):,.2f} |
| **Mediano** | R$ {stats.get('preco_mediano', 0):,.2f} |
| **Máximo** | R$ {stats.get('preco_maximo', 0):,.2f} |

---

### 📋 Últimos Registros

"""
    for i, h in enumerate(historico[:10], 1):
        resultado_emoji = "🏆" if h.get('resultado') == 'vitoria' else "📊"
        response += f"{i}. {resultado_emoji} **R$ {h.get('preco_vencedor', 0):,.2f}** - {h.get('empresa_vencedora', 'N/A')} ({h.get('data', 'N/A')})\n"

    return response, resultado


# ==================== SPRINT 1 - FUNCIONALIDADE 6: ANÁLISE DE CONCORRENTES ====================

def processar_listar_concorrentes(user_id: str):
    """Processa listagem de concorrentes."""
    from tools import tool_listar_concorrentes

    resultado = tool_listar_concorrentes(user_id=user_id)

    if not resultado.get("success"):
        return f"""## ❌ Concorrentes

**Erro:** {resultado.get('error', 'Nenhum concorrente cadastrado')}

**Dica:** {resultado.get('dica', 'Registre resultados de editais para cadastrar concorrentes automaticamente.')}
""", resultado

    concorrentes = resultado.get("concorrentes", [])

    response = f"""## 👥 Concorrentes Conhecidos

**Total:** {resultado.get('total', 0)} concorrentes

---

| # | Empresa | Participações | Vitórias | Taxa |
|---|---------|---------------|----------|------|
"""
    for i, c in enumerate(concorrentes[:15], 1):
        response += f"| {i} | {c.get('nome', 'N/A')[:25]} | {c.get('editais_participados', 0)} | {c.get('editais_ganhos', 0)} | {c.get('taxa_vitoria', 0):.1f}% |\n"

    response += """

---

💡 **Dica:** Use "analise o concorrente [NOME]" para ver detalhes.
"""
    return response, resultado


def processar_analisar_concorrente(message: str, user_id: str):
    """Processa análise de concorrente específico."""
    from tools import tool_analisar_concorrente

    # Extrair nome do concorrente usando helper
    palavras = ["analise", "analisar", "análise", "concorrente", "o", "do", "da",
                "empresa", "histórico", "historico", "como", "está", "esta"]
    nome = extrair_termo(message, palavras)

    if not nome:
        return """## ❓ Nome do Concorrente

Por favor, especifique o concorrente. Exemplo:
- "Analise o concorrente **MedLab**"
- "Histórico do concorrente **TechSaúde**"
""", None

    resultado = tool_analisar_concorrente(nome, user_id=user_id)

    if not resultado.get("success"):
        return f"""## ❌ Concorrente Não Encontrado

**Buscado:** {nome}
**Erro:** {resultado.get('error', 'Não encontrado')}

**Dica:** {resultado.get('dica', 'Use "liste concorrentes" para ver os cadastrados.')}
""", resultado

    conc = resultado.get("concorrente", {})
    stats = resultado.get("estatisticas_precos", {})
    historico = resultado.get("historico_participacoes", [])

    response = f"""## 🔍 Análise do Concorrente

### {conc.get('nome', 'N/A')}
**CNPJ:** {conc.get('cnpj', 'Não informado')}

---

### 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Editais Participados** | {conc.get('editais_participados', 0)} |
| **Editais Ganhos** | {conc.get('editais_ganhos', 0)} |
| **Taxa de Vitória** | {conc.get('taxa_vitoria', 0):.1f}% |

### 💰 Preços Praticados

| Métrica | Valor |
|---------|-------|
| **Mínimo** | R$ {stats.get('preco_minimo', 0):,.2f} |
| **Médio** | R$ {stats.get('preco_medio', 0):,.2f} |
| **Máximo** | R$ {stats.get('preco_maximo', 0):,.2f} |

---

### 📋 Últimas Participações

"""
    for i, h in enumerate(historico[:10], 1):
        emoji = "🏆" if h.get('venceu') else "📊"
        response += f"{i}. {emoji} {h.get('edital', 'N/A')} - R$ {h.get('preco', 0):,.2f} (#{h.get('posicao', '?')}º)\n"

    return response, resultado


# ==================== SPRINT 1 - FUNCIONALIDADE 7: RECOMENDAÇÃO DE PREÇOS ====================

def processar_recomendar_preco(message: str, user_id: str):
    """Processa recomendação de preço."""
    from tools import tool_recomendar_preco

    # Extrair termo usando helper
    palavras = ["recomendar", "recomende", "sugerir", "sugira", "preço", "preco",
                "que", "qual", "colocar", "para", "de", "do", "da"]
    termo = extrair_termo(message, palavras)

    if not termo:
        return """## ❓ Produto/Termo Necessário

Por favor, especifique o produto. Exemplo:
- "Recomende preço para **analisador hematológico**"
- "Qual preço sugerir para **reagentes bioquímica**?"
""", None

    resultado = tool_recomendar_preco(termo, user_id=user_id)

    if not resultado.get("success"):
        return f"""## ❌ Recomendação de Preço

**Termo:** {termo}
**Erro:** {resultado.get('error', 'Dados insuficientes')}

**Dica:** {resultado.get('dica', 'Registre mais resultados de editais ou busque preços no PNCP.')}
""", resultado

    rec = resultado.get("recomendacao", {})
    stats = resultado.get("estatisticas_historico", resultado.get("estatisticas_mercado", {}))
    fonte = resultado.get("fonte", "")

    response = f"""## 💡 Recomendação de Preço

**Termo:** {termo}
**Fonte:** {fonte.replace('_', ' ').title()}
**Registros analisados:** {stats.get('total_registros', 0)}

---

### 🎯 Preços Sugeridos

| Estratégia | Preço Sugerido |
|------------|----------------|
| 🔥 **Agressivo** | R$ {rec.get('preco_agressivo', rec.get('preco_minimo_sugerido', 0)):,.2f} |
| ✅ **Ideal** | R$ {rec.get('preco_ideal', 0):,.2f} |
| 🛡️ **Conservador** | R$ {rec.get('preco_conservador', rec.get('preco_maximo_sugerido', 0)):,.2f} |

---

### 📊 Referência de Mercado

| Métrica | Valor |
|---------|-------|
| **Preço Médio Vencedor** | R$ {stats.get('preco_medio_vencedor', stats.get('preco_medio', 0)):,.2f} |
| **Preço Mínimo** | R$ {stats.get('preco_minimo_vencedor', stats.get('preco_minimo', 0)):,.2f} |

---

**Justificativa:** {resultado.get('justificativa', 'N/A')}

💡 **Dica:** O preço **ideal** oferece boa margem de vitória com lucro razoável.
"""
    return response, resultado


# ==================== SPRINT 1 - FUNCIONALIDADE 8: CLASSIFICAÇÃO DE EDITAIS ====================

def processar_classificar_edital(message: str, user_id: str):
    """Processa classificação de edital."""
    from tools import tool_classificar_edital

    # Extrair texto do edital ou ID
    msg_lower = message.lower()

    # Verificar se tem ID de edital
    import re
    match_id = re.search(r'edital\s*(\d+)', msg_lower)
    edital_id = int(match_id.group(1)) if match_id else None

    # Usar mensagem como texto se não tem ID
    texto = message if not edital_id else None

    resultado = tool_classificar_edital(edital_id=edital_id, texto_edital=texto, user_id=user_id)

    if not resultado.get("success"):
        return f"""## ❌ Classificação de Edital

**Erro:** {resultado.get('error', 'Não foi possível classificar')}

**Dica:** Forneça o texto do objeto do edital ou o ID de um edital cadastrado.
""", resultado

    categoria = resultado.get("categoria", "outros")
    confianca = resultado.get("confianca", 0)

    # Mapeamento de categorias
    categorias_nome = {
        "comodato": "🤝 Comodato de Equipamentos",
        "aluguel_reagentes": "📦 Aluguel com Reagentes",
        "aluguel_simples": "🏷️ Aluguel Simples",
        "venda": "💰 Venda/Aquisição",
        "consumo_reagentes": "🧪 Consumo de Reagentes",
        "insumos_hospitalares": "🏥 Insumos Hospitalares",
        "insumos_laboratoriais": "🔬 Insumos Laboratoriais",
        "outros": "❓ Outros"
    }

    response = f"""## 🏷️ Classificação do Edital

**Categoria Identificada:** {categorias_nome.get(categoria, categoria)}
**Confiança:** {confianca}%

---

### 📊 Todas as Categorias Detectadas

"""
    for cat, score in resultado.get("todas_categorias", {}).items():
        emoji = "✅" if cat == categoria else "⬜"
        response += f"{emoji} **{cat}**: {score} matches\n"

    response += f"""

---

**Justificativa:** {resultado.get('justificativa', 'N/A')}
"""
    return response, resultado


# ==================== SPRINT 1 - FUNCIONALIDADE 9: VERIFICAR COMPLETUDE ====================

def processar_verificar_completude(message: str, user_id: str):
    """Processa verificação de completude de produto."""
    from tools import tool_verificar_completude_produto

    # Extrair nome do produto usando helper
    palavras = ["verificar", "verifique", "completude", "produto", "está", "esta",
                "completo", "falta", "informação", "informacao", "faltando", "o", "do", "da"]
    nome = extrair_termo(message, palavras)

    resultado = tool_verificar_completude_produto(nome_produto=nome if nome else None, user_id=user_id)

    if not resultado.get("success"):
        return f"""## ❌ Verificação de Completude

**Erro:** {resultado.get('error', 'Produto não encontrado')}

**Dica:** Informe o nome do produto. Exemplo: "Verifique completude do **Analisador XYZ**"
""", resultado

    produto = resultado.get("produto", {})
    completude = resultado.get("completude", {})
    specs = resultado.get("especificacoes", {})

    # Emoji de status
    status_emoji = {
        "completo": "✅",
        "quase_completo": "🟡",
        "incompleto": "🟠",
        "muito_incompleto": "🔴"
    }

    response = f"""## 📋 Verificação de Completude

### Produto: {produto.get('nome', 'N/A')}

| Campo | Valor |
|-------|-------|
| **Fabricante** | {produto.get('fabricante', '❌ Não informado')} |
| **Modelo** | {produto.get('modelo', '❌ Não informado')} |
| **Categoria** | {produto.get('categoria', '❌ Não informado')} |

---

### 📊 Status de Completude

| Métrica | Valor |
|---------|-------|
| **Status** | {status_emoji.get(completude.get('status'), '❓')} {completude.get('status', 'N/A').replace('_', ' ').title()} |
| **Percentual** | {completude.get('percentual', 0):.1f}% |
| **Campos Preenchidos** | {completude.get('campos_preenchidos', 0)}/{completude.get('total_campos', 0)} |
| **Especificações** | {specs.get('total', 0)}/{specs.get('minimo_recomendado', 5)} recomendadas |

---

### ⚠️ Campos Faltantes

"""
    for campo in resultado.get("campos_faltantes", []):
        response += f"- ❌ {campo}\n"

    response += """

### 💡 Recomendações

"""
    for rec in resultado.get("recomendacoes", []):
        response += f"- {rec}\n"

    return response, resultado


def processar_cadastrar_edital(message: str, user_id: str, intencao_resultado: dict = None):
    """
    Processa ação: Cadastrar edital manualmente no sistema.

    Extrai dados da mensagem do usuário:
    - Número do edital
    - Órgão
    - Objeto (descrição)
    - Modalidade (opcional)
    - Data de abertura (opcional)
    - UF (opcional)
    """
    from models import Edital
    from database import SessionLocal
    import re
    from datetime import datetime

    # Usar LLM para extrair dados estruturados da mensagem
    prompt_extracao = f"""Extraia os dados do edital da mensagem abaixo e retorne APENAS um JSON:

MENSAGEM: "{message}"

Extraia:
- numero: número/identificador do edital (ex: PE-001/2026, Pregão 15/2026)
- orgao: nome do órgão licitante
- objeto: descrição/objeto da licitação
- modalidade: uma de [pregao_eletronico, pregao_presencial, concorrencia, tomada_precos, convite, leilao, dispensa, inexigibilidade] (default: pregao_eletronico)
- data_abertura: data no formato YYYY-MM-DD (se mencionada)
- uf: sigla do estado (se mencionado)
- cidade: nome da cidade (se mencionado)
- valor_referencia: valor estimado (se mencionado, apenas número)

Retorne APENAS o JSON, sem explicações:
{{"numero": "...", "orgao": "...", "objeto": "...", "modalidade": "...", "data_abertura": null, "uf": null, "cidade": null, "valor_referencia": null}}"""

    try:
        resposta_llm = call_deepseek(
            [{"role": "user", "content": prompt_extracao}],
            max_tokens=500,
            model_override="deepseek-chat"
        )

        # Extrair JSON da resposta
        import json
        json_match = re.search(r'\{[\s\S]*?\}', resposta_llm)
        if not json_match:
            return """❌ **Não consegui extrair os dados do edital.**

Por favor, forneça pelo menos:
- **Número do edital** (ex: PE-001/2026)
- **Órgão** (ex: Hospital das Clínicas)
- **Objeto** (ex: Aquisição de equipamentos)

**Exemplo:**
```
Cadastre o edital PE-001/2026, órgão Hospital das Clínicas UFMG, objeto: Aquisição de analisadores hematológicos
```""", None

        dados = json.loads(json_match.group())

        # Validar campos obrigatórios
        if not dados.get("numero"):
            return "❌ **Número do edital é obrigatório.** Informe o número (ex: PE-001/2026)", None

        if not dados.get("orgao"):
            return "❌ **Órgão é obrigatório.** Informe o órgão licitante.", None

        if not dados.get("objeto"):
            return "❌ **Objeto é obrigatório.** Informe a descrição/objeto da licitação.", None

        # Criar edital no banco
        db = SessionLocal()
        try:
            # Verificar se já existe
            edital_existente = db.query(Edital).filter(
                Edital.numero == dados["numero"],
                Edital.user_id == user_id
            ).first()

            if edital_existente:
                return f"""⚠️ **Edital já cadastrado!**

**Número:** {edital_existente.numero}
**Órgão:** {edital_existente.orgao}
**Status:** {edital_existente.status}

Se deseja atualizar, use: "Atualize o edital {dados['numero']} com..." """, None

            # Criar novo edital
            novo_edital = Edital(
                user_id=user_id,
                numero=dados["numero"],
                orgao=dados["orgao"],
                objeto=dados["objeto"],
                modalidade=dados.get("modalidade", "pregao_eletronico"),
                status="novo",
                fonte="manual",
                uf=dados.get("uf"),
                cidade=dados.get("cidade"),
                valor_referencia=float(dados["valor_referencia"]) if dados.get("valor_referencia") else None
            )

            # Converter data_abertura se existir
            if dados.get("data_abertura"):
                try:
                    novo_edital.data_abertura = datetime.strptime(dados["data_abertura"], "%Y-%m-%d")
                except:
                    pass

            db.add(novo_edital)
            db.commit()
            db.refresh(novo_edital)

            response = f"""✅ **Edital cadastrado com sucesso!**

📋 **Dados do Edital:**
| Campo | Valor |
|-------|-------|
| **Número** | {novo_edital.numero} |
| **Órgão** | {novo_edital.orgao} |
| **Objeto** | {novo_edital.objeto[:100]}{'...' if len(novo_edital.objeto) > 100 else ''} |
| **Modalidade** | {novo_edital.modalidade} |
| **Status** | {novo_edital.status} |
| **UF** | {novo_edital.uf or '-'} |
| **Cidade** | {novo_edital.cidade or '-'} |

---
**Próximos passos:**
- Calcule a aderência: "Calcule aderência do produto X ao edital {novo_edital.numero}"
- Gere uma proposta: "Gere proposta para o edital {novo_edital.numero}"
- Liste seus editais: "Liste meus editais"
"""
            return response, {"edital_id": str(novo_edital.id), "numero": novo_edital.numero}

        finally:
            db.close()

    except json.JSONDecodeError as e:
        return f"❌ Erro ao interpretar dados: {str(e)}", None
    except Exception as e:
        print(f"[ERRO] processar_cadastrar_edital: {e}")
        return f"❌ Erro ao cadastrar edital: {str(e)}", None


# =============================================================================
# PROCESSADORES SPRINT 2: ALERTAS E AUTOMAÇÃO
# =============================================================================

def processar_configurar_alertas(message: str, user_id: str):
    """Processa configuração de alertas de prazo para editais."""
    import re
    from tools import tool_configurar_alertas

    msg = message.lower()

    # Extrair número do edital - aceita formatos: PE-123/2026, PE-TESTE/2026, PE 123, Pregão 123/2026
    match_edital = re.search(r'(PE[-\s]?[\w]+[-/]?\d*|[Pp]reg[aã]o\s*n?[ºo°]?\s*[\w/]+|\d{1,5}[/]\d{4})', message, re.IGNORECASE)
    edital_numero = match_edital.group(1).strip() if match_edital else None

    if not edital_numero:
        return "⚠️ Para configurar alertas, preciso saber qual edital. Informe o número do edital, por exemplo:\n\n*\"Configure alertas para o PE 123/2024\"*"

    # Extrair tempos (horas/minutos antes)
    tempos_minutos = []

    # Padrões de tempo
    match_horas = re.findall(r'(\d+)\s*(?:hora|h)', msg)
    match_dias = re.findall(r'(\d+)\s*(?:dia|d)', msg)
    match_minutos = re.findall(r'(\d+)\s*(?:minuto|min|m\b)', msg)

    for h in match_horas:
        tempos_minutos.append(int(h) * 60)
    for d in match_dias:
        tempos_minutos.append(int(d) * 1440)
    for m in match_minutos:
        tempos_minutos.append(int(m))

    # Se não especificou tempo, usar padrões
    if not tempos_minutos:
        tempos_minutos = [1440, 60, 15]  # 1 dia, 1 hora, 15 min

    # Detectar tipo de alerta
    tipo = "abertura"
    if "impugna" in msg:
        tipo = "impugnacao"
    elif "recurso" in msg:
        tipo = "recursos"
    elif "proposta" in msg:
        tipo = "proposta"

    # Detectar canais
    canais = {"email": True, "push": True}
    if "apenas email" in msg or "só email" in msg:
        canais = {"email": True, "push": False}
    elif "apenas push" in msg or "só push" in msg:
        canais = {"email": False, "push": True}

    resultado = tool_configurar_alertas(
        user_id=user_id,
        edital_numero=edital_numero,
        tempos_minutos=tempos_minutos,
        tipo=tipo,
        canais=canais
    )

    if resultado.get("success"):
        alertas = resultado.get("alertas_criados", [])
        msg_resp = f"✅ **Alertas configurados para {edital_numero}**\n\n"

        if alertas:
            msg_resp += "📋 **Alertas agendados:**\n"
            for a in alertas:
                msg_resp += f"- ⏰ {a['tempo_antes']} antes → {a['data_disparo']}\n"
        else:
            msg_resp += "ℹ️ Os alertas foram configurados com os tempos padrão.\n"

        msg_resp += f"\n🔔 **Canais:** Email: {'✅' if canais['email'] else '❌'} | Push: {'✅' if canais['push'] else '❌'}"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao configurar alertas')}"


def processar_listar_alertas(message: str, user_id: str):
    """Processa listagem de alertas configurados."""
    from tools import tool_listar_alertas
    msg = message.lower()

    apenas_agendados = "todos" not in msg and "histórico" not in msg and "historico" not in msg
    periodo_dias = 30

    if "semana" in msg:
        periodo_dias = 7
    elif "mês" in msg or "mes" in msg:
        periodo_dias = 30
    elif "ano" in msg:
        periodo_dias = 365

    resultado = tool_listar_alertas(
        user_id=user_id,
        apenas_agendados=apenas_agendados,
        periodo_dias=periodo_dias
    )

    if resultado.get("success"):
        editais_com_alertas = resultado.get("editais", [])
        total_alertas = resultado.get("total_alertas", 0)

        if total_alertas == 0:
            return "📭 Você não tem alertas configurados.\n\nPara criar alertas, diga algo como:\n*\"Configure alertas para o PE 123/2024 com 1 dia e 1 hora de antecedência\"*"

        msg_resp = f"🔔 **Seus Alertas** ({total_alertas} encontrados)\n\n"

        for ed in editais_com_alertas:
            edital_info = ed.get('edital', {})
            alertas = ed.get('alertas', [])
            numero = edital_info.get('numero', 'N/A')
            orgao = edital_info.get('orgao', '')[:40]

            msg_resp += f"📋 **{numero}** - {orgao}\n"

            for a in alertas:
                status_icon = {"agendado": "⏳", "disparado": "✅", "lido": "👁️", "cancelado": "❌"}.get(a.get('status', ''), "📌")
                tipo = a.get('tipo', 'abertura').title()
                data_disparo = a.get('data_disparo', 'N/A')
                # Formatar data ISO para legível
                if data_disparo and data_disparo != 'N/A':
                    try:
                        from datetime import datetime
                        dt = datetime.fromisoformat(data_disparo)
                        data_disparo = dt.strftime("%d/%m/%Y %H:%M")
                    except:
                        pass
                tempo_antes = a.get('tempo_antes', '')

                msg_resp += f"   {status_icon} {tipo} - 📅 {data_disparo}\n"
                if tempo_antes:
                    msg_resp += f"      ⏰ {tempo_antes} antes da abertura\n"

            msg_resp += "\n"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao listar alertas')}"


def processar_dashboard_prazos(message: str, user_id: str):
    """Processa exibição do dashboard de prazos."""
    from tools import tool_dashboard_prazos
    msg = message.lower()

    dias = 7  # Padrão: próximos 7 dias
    if "mês" in msg or "mes" in msg or "30" in msg:
        dias = 30
    elif "15" in msg:
        dias = 15
    elif "semana" in msg or "7" in msg:
        dias = 7

    resultado = tool_dashboard_prazos(user_id=user_id, dias=dias)

    if resultado.get("success"):
        editais = resultado.get("editais", [])
        stats = resultado.get("estatisticas", {})

        msg_resp = f"📊 **Dashboard de Prazos** (próximos {dias} dias)\n\n"

        # Resumo (estatísticas: total, criticos, altos, medios, normais)
        msg_resp += "### 📈 Resumo\n"
        msg_resp += f"- Total: **{stats.get('total', 0)}** editais\n"
        msg_resp += f"- 🔴 Críticos (< 1 dia): **{stats.get('criticos', 0)}**\n"
        msg_resp += f"- 🟠 Altos (1-3 dias): **{stats.get('altos', 0)}**\n"
        msg_resp += f"- 🟡 Médios (3-7 dias): **{stats.get('medios', 0)}**\n"
        msg_resp += f"- 🟢 Normais (> 7 dias): **{stats.get('normais', 0)}**\n\n"

        if not editais:
            msg_resp += "ℹ️ Nenhum edital com prazo neste período.\n"
        else:
            msg_resp += "### 📋 Editais por Prazo\n\n"

            for e in editais[:10]:  # Limitar a 10
                # Estrutura: edital{id,numero,orgao,...}, datas{...}, tempo_restante{texto,dias,horas}, urgencia, emoji, alertas_configurados
                edital_info = e.get('edital', {})
                datas = e.get('datas', {})
                tempo = e.get('tempo_restante', {})
                icon = e.get('emoji', '🟢')

                numero = edital_info.get('numero', 'N/A')
                orgao = edital_info.get('orgao', '')[:40]
                data_abertura = datas.get('abertura_formatada', 'N/A')
                tempo_texto = tempo.get('texto', 'N/A')
                alertas_qtd = e.get('alertas_configurados', 0)

                msg_resp += f"{icon} **{numero}** - {orgao}\n"
                msg_resp += f"   📅 Abertura: {data_abertura}\n"
                msg_resp += f"   ⏱️ **{tempo_texto}**\n"
                if alertas_qtd:
                    msg_resp += f"   🔔 Alertas: {alertas_qtd}\n"
                msg_resp += "\n"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao carregar dashboard')}"


def processar_calendario_editais(message: str, user_id: str):
    """Processa exibição do calendário de editais."""
    from datetime import datetime
    from tools import tool_calendario_editais
    import re

    msg = message.lower()
    hoje = datetime.now()

    # Detectar mês/ano
    mes = hoje.month
    ano = hoje.year

    # Padrões para mês
    meses_pt = {
        "janeiro": 1, "fevereiro": 2, "março": 3, "marco": 3, "abril": 4,
        "maio": 5, "junho": 6, "julho": 7, "agosto": 8, "setembro": 9,
        "outubro": 10, "novembro": 11, "dezembro": 12
    }

    for nome, num in meses_pt.items():
        if nome in msg:
            mes = num
            break

    # Detectar ano
    match_ano = re.search(r'20\d{2}', msg)
    if match_ano:
        ano = int(match_ano.group())

    resultado = tool_calendario_editais(user_id=user_id, mes=mes, ano=ano)

    if resultado.get("success"):
        calendario = resultado.get("calendario", {})
        mes_nome = resultado.get("mes_nome", "")
        total = resultado.get("total_editais", 0)

        msg_resp = f"📅 **Calendário de Editais - {mes_nome} {ano}**\n\n"
        msg_resp += f"Total: **{total}** editais no mês\n\n"

        if not calendario:
            msg_resp += "ℹ️ Nenhum edital com data neste mês.\n"
        else:
            # Ordenar por dia
            for dia in sorted(calendario.keys(), key=int):
                editais_dia = calendario[dia]
                msg_resp += f"### 📆 Dia {dia}\n"

                for e in editais_dia:
                    status_icon = {"novo": "🆕", "analisando": "🔍", "participar": "✅", "proposta_enviada": "📤"}.get(e['status'], "📌")
                    msg_resp += f"{status_icon} **{e['numero']}** - {e['orgao'][:35]}\n"
                    if e.get('horario'):
                        msg_resp += f"   ⏰ {e['horario']}\n"
                msg_resp += "\n"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao carregar calendário')}"


def processar_configurar_monitoramento(message: str, user_id: str):
    """Processa configuração de monitoramento automático de editais."""
    import re
    from tools import tool_configurar_monitoramento

    msg = message.lower()

    # Extrair termo de busca - geralmente vem após "monitore" ou "monitorar"
    match_termo = re.search(r'monitor[ea]?\s+(?:editais\s+(?:de|para|sobre)\s+)?(.+?)(?:\s+(?:no|na|em|com|para)|$)', msg)
    termo = match_termo.group(1).strip() if match_termo else None

    if not termo:
        # Tentar extrair de outra forma
        match_termo2 = re.search(r'(?:busca automática|acompanhar)\s+(?:de\s+)?(.+?)(?:\s+(?:no|na|em)|$)', msg)
        termo = match_termo2.group(1).strip() if match_termo2 else None

    if not termo:
        return "⚠️ Para configurar um monitoramento, preciso saber o que monitorar.\n\nExemplos:\n- *\"Monitore editais de equipamentos laboratoriais\"*\n- *\"Configure monitoramento para reagentes em SP e MG\"*"

    # Detectar fontes
    fontes = []
    if "pncp" in msg:
        fontes.append("pncp")
    if "comprasnet" in msg:
        fontes.append("comprasnet")
    if "bec" in msg:
        fontes.append("bec")
    if not fontes:
        fontes = ["pncp"]  # Padrão

    # Detectar UFs
    ufs = []
    ufs_validas = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
                   "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
                   "SP", "SE", "TO"]
    for uf in ufs_validas:
        if uf.lower() in msg or uf in message:
            ufs.append(uf)

    # Detectar frequência
    frequencia_horas = 4  # Padrão
    if "hora em hora" in msg or "1 hora" in msg:
        frequencia_horas = 1
    elif "2 hora" in msg:
        frequencia_horas = 2
    elif "6 hora" in msg:
        frequencia_horas = 6
    elif "12 hora" in msg:
        frequencia_horas = 12
    elif "diário" in msg or "diario" in msg or "24 hora" in msg:
        frequencia_horas = 24

    # Detectar score mínimo
    score_minimo = 70
    match_score = re.search(r'score\s*(?:mínimo|minimo)?\s*(?:de\s+)?(\d+)', msg)
    if match_score:
        score_minimo = int(match_score.group(1))

    resultado = tool_configurar_monitoramento(
        user_id=user_id,
        termo=termo,
        fontes=fontes,
        ufs=ufs if ufs else None,
        frequencia_horas=frequencia_horas,
        score_minimo=score_minimo
    )

    if resultado.get("success"):
        mon = resultado.get("monitoramento", {})
        msg_resp = f"✅ **Monitoramento Configurado**\n\n"
        msg_resp += f"🔍 **Termo:** {mon.get('termo', termo)}\n"
        msg_resp += f"📡 **Fontes:** {', '.join(mon.get('fontes', fontes))}\n"
        msg_resp += f"📍 **UFs:** {', '.join(mon.get('ufs', ufs)) if mon.get('ufs') else 'Todas'}\n"
        msg_resp += f"⏱️ **Frequência:** A cada {mon.get('frequencia_horas', frequencia_horas)} hora(s)\n"
        msg_resp += f"📊 **Score mínimo para alerta:** {mon.get('score_minimo', score_minimo)}%\n"
        msg_resp += f"\n🆔 ID: `{mon.get('id', 'N/A')}`"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao configurar monitoramento')}"


def processar_listar_monitoramentos(message: str, user_id: str):
    """Processa listagem de monitoramentos configurados."""
    from tools import tool_listar_monitoramentos
    msg = message.lower()
    apenas_ativos = "todos" not in msg and "inativos" not in msg

    resultado = tool_listar_monitoramentos(user_id=user_id, apenas_ativos=apenas_ativos)

    if resultado.get("success"):
        monitoramentos = resultado.get("monitoramentos", [])

        if not monitoramentos:
            return "📭 Você não tem monitoramentos configurados.\n\nPara criar um monitoramento, diga algo como:\n*\"Monitore editais de equipamentos laboratoriais no PNCP\"*"

        msg_resp = f"🔍 **Seus Monitoramentos** ({len(monitoramentos)} encontrados)\n\n"

        for m in monitoramentos:
            status_icon = "✅" if m.get('ativo') else "⏸️"
            msg_resp += f"{status_icon} **{m['termo']}**\n"
            msg_resp += f"   📡 Fontes: {', '.join(m.get('fontes', []))}\n"
            msg_resp += f"   📍 UFs: {', '.join(m.get('ufs', [])) if m.get('ufs') else 'Todas'}\n"
            msg_resp += f"   ⏱️ A cada {m.get('frequencia_horas', 4)}h\n"
            msg_resp += f"   📊 Score mínimo: {m.get('score_minimo', 70)}%\n"
            if m.get('ultima_execucao'):
                msg_resp += f"   🕐 Última execução: {m['ultima_execucao']}\n"
            if m.get('editais_encontrados'):
                msg_resp += f"   📋 Editais encontrados: {m['editais_encontrados']}\n"
            msg_resp += "\n"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao listar monitoramentos')}"


def processar_desativar_monitoramento(message: str, user_id: str):
    """Processa desativação de monitoramento."""
    import re
    from tools import tool_desativar_monitoramento

    msg = message.lower()

    # Tentar extrair termo do monitoramento
    match_termo = re.search(r'(?:desativ|par|cancel|remov)[ea]?\s+(?:o\s+)?monitoramento\s+(?:de\s+)?(.+)', msg)
    termo = match_termo.group(1).strip() if match_termo else None

    # Tentar extrair ID
    match_id = re.search(r'id[:\s]+([a-f0-9-]+)', msg, re.IGNORECASE)
    monitoramento_id = match_id.group(1) if match_id else None

    if not termo and not monitoramento_id:
        return "⚠️ Para desativar um monitoramento, informe o termo ou ID.\n\nExemplos:\n- *\"Desative o monitoramento de equipamentos laboratoriais\"*\n- *\"Pare de monitorar reagentes\"*"

    resultado = tool_desativar_monitoramento(
        user_id=user_id,
        termo=termo,
        monitoramento_id=monitoramento_id
    )

    if resultado.get("success"):
        return f"✅ Monitoramento desativado com sucesso!\n\n🔍 **Termo:** {resultado.get('termo', termo or 'N/A')}"
    else:
        return f"❌ {resultado.get('error', 'Erro ao desativar monitoramento')}"


def processar_configurar_notificacoes(message: str, user_id: str):
    """Processa configuração de preferências de notificação."""
    import re
    from tools import tool_configurar_preferencias_notificacao

    msg = message.lower()

    # Extrair email
    match_email = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', message)
    email = match_email.group() if match_email else None

    # Detectar habilitação
    email_habilitado = True
    push_habilitado = True

    if "desativar email" in msg or "sem email" in msg:
        email_habilitado = False
    if "desativar push" in msg or "sem push" in msg:
        push_habilitado = False

    # Detectar horários
    horario_inicio = None
    horario_fim = None

    match_horario = re.search(r'(?:das|entre)\s+(\d{1,2})(?:h|:00)?\s+(?:às|e|até)\s+(\d{1,2})(?:h|:00)?', msg)
    if match_horario:
        horario_inicio = f"{int(match_horario.group(1)):02d}:00"
        horario_fim = f"{int(match_horario.group(2)):02d}:00"

    resultado = tool_configurar_preferencias_notificacao(
        user_id=user_id,
        email_habilitado=email_habilitado,
        push_habilitado=push_habilitado,
        email_notificacao=email,
        horario_inicio=horario_inicio,
        horario_fim=horario_fim
    )

    if resultado.get("success"):
        prefs = resultado.get("preferencias", {})
        msg_resp = "✅ **Preferências de Notificação Atualizadas**\n\n"
        msg_resp += f"📧 **Email:** {'✅ Habilitado' if prefs.get('email_habilitado') else '❌ Desabilitado'}\n"
        if prefs.get('email_notificacao'):
            msg_resp += f"   Enviar para: {prefs['email_notificacao']}\n"
        msg_resp += f"🔔 **Push:** {'✅ Habilitado' if prefs.get('push_habilitado') else '❌ Desabilitado'}\n"

        if prefs.get('horario_inicio') and prefs.get('horario_fim'):
            msg_resp += f"⏰ **Horário:** {prefs['horario_inicio']} às {prefs['horario_fim']}\n"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao configurar notificações')}"


def processar_historico_notificacoes(message: str, user_id: str):
    """Processa listagem do histórico de notificações."""
    from tools import tool_historico_notificacoes
    msg = message.lower()

    apenas_nao_lidas = "não lida" in msg or "nao lida" in msg or "pendente" in msg

    limite = 20
    if "últimas 10" in msg or "ultimas 10" in msg:
        limite = 10
    elif "últimas 50" in msg or "ultimas 50" in msg:
        limite = 50

    resultado = tool_historico_notificacoes(
        user_id=user_id,
        limite=limite,
        apenas_nao_lidas=apenas_nao_lidas
    )

    if resultado.get("success"):
        notificacoes = resultado.get("notificacoes", [])
        nao_lidas = resultado.get("nao_lidas", 0)

        if not notificacoes:
            return "📭 Você não tem notificações.\n\nAs notificações aparecem quando:\n- Alertas de prazo são disparados\n- Novos editais são encontrados pelo monitoramento\n- O sistema precisa informar algo importante"

        msg_resp = f"📬 **Suas Notificações** ({len(notificacoes)} exibidas"
        if nao_lidas > 0:
            msg_resp += f", {nao_lidas} não lidas"
        msg_resp += ")\n\n"

        for n in notificacoes:
            tipo_icon = {
                "alerta_prazo": "⏰",
                "novo_edital": "📋",
                "alta_aderencia": "⭐",
                "resultado": "📊",
                "sistema": "🔧"
            }.get(n.get('tipo'), "📌")

            lida_icon = "👁️" if n.get('lida') else "🔵"

            msg_resp += f"{lida_icon} {tipo_icon} **{n['titulo']}**\n"
            msg_resp += f"   {n['mensagem'][:100]}{'...' if len(n.get('mensagem', '')) > 100 else ''}\n"
            msg_resp += f"   🕐 {n['created_at']}\n\n"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao carregar notificações')}"


def processar_extrair_datas_edital(message: str, user_id: str, texto_pdf: str = None):
    """Processa extração de datas importantes de um edital."""
    import re
    from tools import tool_extrair_datas_edital

    # Se não tem texto PDF, informar como usar
    if not texto_pdf:
        # Verificar se há número de edital para buscar
        match_edital = re.search(r'(PE[-]?\d+[-/]?\d*|[Pp]reg[aã]o\s*n?[ºo°]?\s*[\d/]+|\d{1,5}[/]\d{4})', message, re.IGNORECASE)

        if match_edital:
            edital_numero = match_edital.group(1)
            return f"⚠️ Para extrair as datas do edital **{edital_numero}**, faça upload do PDF do edital.\n\nApós o upload, direi:\n*\"Extraia as datas do edital {edital_numero}\"*"
        else:
            return "⚠️ Para extrair datas de um edital, faça upload do PDF primeiro.\n\nApós o upload, diga:\n*\"Extraia as datas do edital PE 123/2024\"*"

    # Se temos texto PDF, extrair datas
    resultado = tool_extrair_datas_edital(
        user_id=user_id,
        texto_edital=texto_pdf
    )

    if resultado.get("success"):
        datas = resultado.get("datas", {})
        msg_resp = "📅 **Datas Extraídas do Edital**\n\n"

        if datas.get("data_abertura"):
            msg_resp += f"📆 **Data de Abertura:** {datas['data_abertura']}\n"
        if datas.get("horario_abertura"):
            msg_resp += f"⏰ **Horário:** {datas['horario_abertura']}\n"
        if datas.get("data_limite_propostas"):
            msg_resp += f"📝 **Limite para Propostas:** {datas['data_limite_propostas']}\n"
        if datas.get("data_impugnacao"):
            msg_resp += f"⚠️ **Prazo Impugnação:** {datas['data_impugnacao']}\n"
        if datas.get("data_recursos"):
            msg_resp += f"📑 **Prazo Recursos:** {datas['data_recursos']}\n"
        if datas.get("data_publicacao"):
            msg_resp += f"📰 **Data Publicação:** {datas['data_publicacao']}\n"

        msg_resp += "\n💡 *Deseja configurar alertas para estas datas?*"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao extrair datas')}"


def processar_cancelar_alerta(message: str, user_id: str):
    """Processa cancelamento de alertas."""
    import re
    from tools import tool_cancelar_alerta

    msg = message.lower()

    # Extrair número do edital
    match_edital = re.search(r'(PE[-]?\d+[-/]?\d*|[Pp]reg[aã]o\s*n?[ºo°]?\s*[\d/]+|\d{1,5}[/]\d{4})', message, re.IGNORECASE)
    edital_numero = match_edital.group(1) if match_edital else None

    # Extrair ID do alerta
    match_id = re.search(r'alerta[:\s]+([a-f0-9-]+)', msg, re.IGNORECASE)
    alerta_id = match_id.group(1) if match_id else None

    # Cancelar todos?
    cancelar_todos = "todos" in msg

    if not edital_numero and not alerta_id and not cancelar_todos:
        return "⚠️ Para cancelar alertas, informe o edital ou o ID do alerta.\n\nExemplos:\n- *\"Cancele os alertas do PE 123/2024\"*\n- *\"Cancele todos os alertas\"*"

    resultado = tool_cancelar_alerta(
        user_id=user_id,
        alerta_id=alerta_id,
        edital_numero=edital_numero,
        cancelar_todos=cancelar_todos
    )

    if resultado.get("success"):
        qtd = resultado.get("cancelados", 0)
        msg_resp = f"✅ **{qtd} alerta(s) cancelado(s)**\n\n"

        if edital_numero:
            msg_resp += f"📋 Edital: {edital_numero}"

        return msg_resp
    else:
        return f"❌ {resultado.get('error', 'Erro ao cancelar alertas')}"


# =============================================================================
# ANÁLISE DE EDITAIS (Resumir e Perguntar)
# =============================================================================

def processar_resumir_edital(message: str, user_id: str, intencao_resultado: dict = None):
    """
    Processa ação: Resumir um edital cadastrado no sistema.
    Gera um resumo executivo com principais informações.

    Returns: (response_text, resultado_dict)
    """
    import re
    db = get_db()

    try:
        # Extrair número do edital da mensagem
        edital_numero = None
        if intencao_resultado and intencao_resultado.get("edital"):
            edital_numero = intencao_resultado.get("edital")
        else:
            # Tentar extrair padrões como PE-001/2026, PE001/2026, 001/2026
            padrao = re.search(r'(PE[-\s]?\d+[/\-]\d{4}|\d+[/\-]\d{4})', message, re.IGNORECASE)
            if padrao:
                edital_numero = padrao.group(1)

        if not edital_numero:
            return (
                "## ❌ Número do Edital Não Informado\n\n"
                "Por favor, informe o número do edital que deseja resumir.\n\n"
                "**Exemplos:**\n"
                "- \"Resuma o edital PE-001/2026\"\n"
                "- \"Resumo do edital 123/2025\"\n"
                "- \"Faça um resumo do edital PE-041/2026\"",
                {"error": "Número do edital não informado"}
            )

        # Buscar edital no banco
        edital = db.query(Edital).filter(
            Edital.user_id == user_id,
            Edital.numero.ilike(f"%{edital_numero.replace('-', '%').replace('/', '%')}%")
        ).first()

        if not edital:
            return (
                f"## ❌ Edital Não Encontrado\n\n"
                f"O edital **{edital_numero}** não foi encontrado no seu cadastro.\n\n"
                "**Dica:** Use \"Liste meus editais\" para ver os editais cadastrados.",
                {"error": f"Edital {edital_numero} não encontrado"}
            )

        # Buscar requisitos do edital
        from models import EditalRequisito
        requisitos = db.query(EditalRequisito).filter(
            EditalRequisito.edital_id == edital.id
        ).all()

        # Montar contexto para o resumo
        contexto = f"""
EDITAL: {edital.numero}
ÓRGÃO: {edital.orgao or 'Não informado'}
OBJETO: {edital.objeto or 'Não informado'}
MODALIDADE: {edital.modalidade or 'Não informada'}
VALOR DE REFERÊNCIA: {f'R$ {edital.valor_referencia:,.2f}' if edital.valor_referencia else 'Não informado'}
DATA DE ABERTURA: {edital.data_abertura.strftime('%d/%m/%Y %H:%M') if edital.data_abertura else 'Não informada'}
DATA DE PUBLICAÇÃO: {edital.data_publicacao.strftime('%d/%m/%Y') if edital.data_publicacao else 'Não informada'}
UF: {edital.uf or 'Não informada'}
CIDADE: {edital.cidade or 'Não informada'}
STATUS: {edital.status or 'novo'}

REQUISITOS ({len(requisitos)} encontrados):
"""
        for req in requisitos[:20]:  # Limitar a 20 requisitos
            obrig = "OBRIGATÓRIO" if req.obrigatorio else "Desejável"
            contexto += f"- [{obrig}] {req.descricao[:200]}\n"

        if len(requisitos) > 20:
            contexto += f"\n... e mais {len(requisitos) - 20} requisitos"

        # Chamar LLM para gerar resumo
        prompt_resumo = f"""Faça um RESUMO EXECUTIVO do seguinte edital de licitação.

O resumo deve ser objetivo e incluir:
1. **Objeto**: O que está sendo licitado (em 1-2 frases)
2. **Valor**: Valor de referência e observações
3. **Prazos**: Data de abertura e prazos importantes
4. **Principais Requisitos**: Os 3-5 requisitos mais importantes/restritivos
5. **Alertas**: Pontos de atenção para participação

DADOS DO EDITAL:
{contexto}

Formate a resposta em Markdown com emojis para facilitar a leitura."""

        messages = [{"role": "user", "content": prompt_resumo}]

        resumo = call_deepseek(messages, max_tokens=2000)

        response_text = f"""## 📋 Resumo do Edital {edital.numero}

{resumo}

---
📊 **Dados do Sistema:**
- Status: {edital.status or 'novo'}
- Requisitos cadastrados: {len(requisitos)}
- URL: {edital.url or 'Não disponível'}
"""

        return response_text, {"success": True, "edital": edital.numero, "requisitos": len(requisitos)}

    except Exception as e:
        return f"## ❌ Erro ao Resumir Edital\n\n{str(e)}", {"error": str(e)}
    finally:
        db.close()


def processar_perguntar_edital(message: str, user_id: str, intencao_resultado: dict = None):
    """
    Processa ação: Responder dúvidas sobre um edital específico.

    Fluxo:
    1. Tenta responder com dados cadastrados no banco
    2. Se LLM indicar que não encontrou a informação, verifica se tem PDF
    3. Se tiver PDF, lê e responde
    4. Se não tiver PDF, pede para o usuário fazer upload

    Returns: (response_text, resultado_dict)
    """
    import re
    import os
    db = get_db()

    try:
        # Extrair número do edital da mensagem
        edital_numero = None
        if intencao_resultado and intencao_resultado.get("edital"):
            edital_numero = intencao_resultado.get("edital")
        else:
            # Tentar extrair padrões como PE-001/2026, PE001/2026, 001/2026
            padrao = re.search(r'(PE[-\s]?\d+[/\-]\d{4}|\d+[/\-]\d{4})', message, re.IGNORECASE)
            if padrao:
                edital_numero = padrao.group(1)

        if not edital_numero:
            return (
                "## ❌ Número do Edital Não Informado\n\n"
                "Por favor, informe o número do edital sobre o qual deseja perguntar.\n\n"
                "**Exemplos:**\n"
                "- \"Qual o prazo de entrega do edital PE-001/2026?\"\n"
                "- \"O edital PE-001/2026 exige garantia?\"\n"
                "- \"Quais documentos são exigidos no PE-041/2026?\"",
                {"error": "Número do edital não informado"}
            )

        # Buscar edital no banco
        edital = db.query(Edital).filter(
            Edital.user_id == user_id,
            Edital.numero.ilike(f"%{edital_numero.replace('-', '%').replace('/', '%')}%")
        ).first()

        if not edital:
            return (
                f"## ❌ Edital Não Encontrado\n\n"
                f"O edital **{edital_numero}** não foi encontrado no seu cadastro.\n\n"
                "**Dica:** Use \"Liste meus editais\" para ver os editais cadastrados.\n"
                f"Ou busque o edital: \"Busque o edital {edital_numero} no PNCP\"",
                {"error": f"Edital {edital_numero} não encontrado"}
            )

        # Buscar requisitos do edital
        from models import EditalRequisito, EditalDocumento
        requisitos = db.query(EditalRequisito).filter(
            EditalRequisito.edital_id == edital.id
        ).all()

        # Buscar documentos PDF do edital
        documentos = db.query(EditalDocumento).filter(
            EditalDocumento.edital_id == edital.id
        ).all()

        # Montar contexto do edital com dados cadastrados
        contexto_banco = f"""
EDITAL: {edital.numero}
ÓRGÃO: {edital.orgao or 'Não informado'}
OBJETO: {edital.objeto or 'Não informado'}
MODALIDADE: {edital.modalidade or 'Não informada'}
VALOR DE REFERÊNCIA: {f'R$ {edital.valor_referencia:,.2f}' if edital.valor_referencia else 'Não informado'}
DATA DE ABERTURA: {edital.data_abertura.strftime('%d/%m/%Y %H:%M') if edital.data_abertura else 'Não informada'}
DATA DE PUBLICAÇÃO: {edital.data_publicacao.strftime('%d/%m/%Y') if edital.data_publicacao else 'Não informada'}
UF: {edital.uf or 'Não informada'}
CIDADE: {edital.cidade or 'Não informada'}
STATUS: {edital.status or 'novo'}

REQUISITOS DO EDITAL ({len(requisitos)} requisitos):
"""
        for req in requisitos:
            obrig = "[OBRIGATÓRIO]" if req.obrigatorio else "[Desejável]"
            tipo = f"({req.tipo})" if req.tipo else ""
            contexto_banco += f"- {obrig} {tipo} {req.descricao}\n"

        if not requisitos:
            contexto_banco += "- Nenhum requisito cadastrado.\n"

        # Detectar se é pergunta específica que provavelmente está no PDF
        msg_lower = message.lower()
        perguntas_especificas = [
            'prazo de entrega', 'prazo entrega', 'dias para entrega', 'entregar em',
            'garantia', 'garantir',
            'local de entrega', 'onde entregar', 'endereço de entrega',
            'forma de pagamento', 'pagamento', 'pagar',
            'penalidade', 'multa', 'sanção', 'sanções',
            'documentos de habilitação', 'habilitação', 'documentos exigidos',
            'qualificação técnica', 'atestado', 'certidão',
            'termo de referência', 'anexo', 'especificação técnica',
            'cláusula', 'item', 'subitem',
            'critério de julgamento', 'desempate', 'lance',
            'contrato', 'vigência', 'aditivo',
            'reajuste', 'índice', 'igpm', 'ipca'
        ]
        eh_pergunta_especifica = any(p in msg_lower for p in perguntas_especificas)

        # Verificar se tem PDF disponível ANTES de tentar banco
        doc_com_texto = None
        for doc in documentos:
            if doc.texto_extraido and len(doc.texto_extraido) > 100:
                doc_com_texto = doc
                break
            elif doc.path_arquivo and os.path.exists(doc.path_arquivo):
                try:
                    from tools import tool_processar_upload
                    texto = tool_processar_upload(doc.path_arquivo)
                    if texto and len(texto) > 100:
                        doc.texto_extraido = texto[:200000]  # Aumentar limite
                        doc.processado = True
                        db.commit()
                        doc_com_texto = doc
                        break
                except Exception as e:
                    print(f"[PERGUNTAR_EDITAL] Erro ao ler PDF {doc.nome_arquivo}: {e}")

        # Se é pergunta específica E tem PDF, ir direto pro PDF
        if eh_pergunta_especifica and doc_com_texto:
            print(f"[PERGUNTAR_EDITAL] Pergunta específica detectada. Indo direto pro PDF...")
        else:
            # PASSO 1: Tentar responder com dados do banco (perguntas gerais)
            prompt_banco = f"""Você é um assistente especializado em licitações públicas.

DADOS CADASTRADOS DO EDITAL:
{contexto_banco}

PERGUNTA DO USUÁRIO:
{message}

INSTRUÇÕES IMPORTANTES:
1. Responda a pergunta usando os dados acima
2. Para perguntas amplas como "tudo sobre", "informações", "detalhes", "resumo": apresente TODOS os dados disponíveis de forma organizada
3. SOMENTE responda "INFORMACAO_NAO_ENCONTRADA_NO_CADASTRO" se a pergunta for sobre algo MUITO ESPECÍFICO que realmente não está nos dados (ex: cláusula específica, anexo, item de planilha)
4. Se há dados relevantes para responder, mesmo que parcialmente, responda com o que tem
5. Seja objetivo e organize a resposta em seções quando apropriado

Responda em Markdown (ou a frase especial APENAS se realmente não houver dados relevantes)."""

            messages = [{"role": "user", "content": prompt_banco}]
            resposta_banco = call_deepseek(messages, max_tokens=2000)

            # Verificar se encontrou a informação no banco
            if "INFORMACAO_NAO_ENCONTRADA" not in resposta_banco.upper() and "NÃO ENCONTRADA" not in resposta_banco.upper() and "NÃO CONSTA" not in resposta_banco.upper():
                # Encontrou no banco - retornar resposta
                response_text = f"""## 💬 Resposta sobre o Edital {edital.numero}

{resposta_banco}

---
📋 **Edital:** {edital.numero}
🏢 **Órgão:** {edital.orgao or 'N/I'}
📊 **Fonte:** Dados cadastrados no sistema
"""
                return response_text, {"success": True, "edital": edital.numero, "fonte": "banco"}

            print(f"[PERGUNTAR_EDITAL] Informação não encontrada no banco. Verificando PDFs...")

        # doc_com_texto já foi verificado antes
        if doc_com_texto and doc_com_texto.texto_extraido:
            # PASSO 3: Tem PDF - ler e responder
            print(f"[PERGUNTAR_EDITAL] Lendo PDF: {doc_com_texto.nome_arquivo}")

            texto_completo = doc_com_texto.texto_extraido
            print(f"[PERGUNTAR_EDITAL] Texto total: {len(texto_completo)} caracteres")

            # Extrair palavras-chave da pergunta para busca inteligente
            msg_lower = message.lower()
            palavras_busca = []

            # Mapeamento de termos comuns em editais
            if any(p in msg_lower for p in ['prazo', 'entrega', 'entregar']):
                palavras_busca.extend(['prazo', 'entrega', 'dias', 'úteis', 'corridos', 'fornecimento'])
            if any(p in msg_lower for p in ['garantia', 'garantir']):
                palavras_busca.extend(['garantia', 'garantir', 'meses', 'anos', 'cobertura'])
            if any(p in msg_lower for p in ['pagamento', 'pagar', 'valor']):
                palavras_busca.extend(['pagamento', 'pagar', 'fatura', 'nota fiscal', 'dias'])
            if any(p in msg_lower for p in ['local', 'onde', 'endereço']):
                palavras_busca.extend(['local', 'entrega', 'endereço', 'sede', 'almoxarifado'])
            if any(p in msg_lower for p in ['documento', 'habilitação', 'exigência', 'exige']):
                palavras_busca.extend(['habilitação', 'documento', 'certidão', 'atestado', 'declaração'])
            if any(p in msg_lower for p in ['penalidade', 'multa', 'sanção']):
                palavras_busca.extend(['penalidade', 'multa', 'sanção', 'advertência', 'suspensão'])

            # Chunkar o documento (chunks de 2000 caracteres com overlap de 300)
            chunk_size = 2000
            overlap = 300
            chunks = []
            for i in range(0, len(texto_completo), chunk_size - overlap):
                chunk = texto_completo[i:i + chunk_size]
                chunks.append((i, chunk))  # (posição, texto)

            print(f"[PERGUNTAR_EDITAL] Documento dividido em {len(chunks)} chunks")

            # Criar frases de busca combinadas (mais específicas)
            frases_exatas = []
            if any(p in msg_lower for p in ['prazo', 'entrega']):
                frases_exatas.extend(['prazo de entrega', 'prazo para entrega', 'entrega do objeto',
                                      'prazo de fornecimento', 'dias para entrega', 'dias após'])
            if any(p in msg_lower for p in ['garantia']):
                frases_exatas.extend(['prazo de garantia', 'garantia de', 'meses de garantia', 'anos de garantia'])
            if any(p in msg_lower for p in ['pagamento']):
                frases_exatas.extend(['prazo de pagamento', 'pagamento será', 'dias após', 'nota fiscal'])
            if any(p in msg_lower for p in ['local']):
                frases_exatas.extend(['local de entrega', 'endereço de entrega', 'entregar no', 'entregue no'])

            # Buscar nos chunks - priorizar frases exatas
            chunks_relevantes = []
            for pos, chunk in chunks:
                chunk_lower = chunk.lower()

                # Score alto para frases exatas
                score_exato = sum(3 for f in frases_exatas if f in chunk_lower)
                # Score menor para palavras individuais
                score_palavras = sum(1 for p in palavras_busca if p in chunk_lower)

                score_total = score_exato + score_palavras
                if score_total > 0:
                    chunks_relevantes.append((score_total, pos, chunk))

            # Ordenar por relevância (maior score primeiro)
            chunks_relevantes.sort(key=lambda x: -x[0])

            # Pegar os 12 chunks mais relevantes
            chunks_relevantes = chunks_relevantes[:12]
            print(f"[PERGUNTAR_EDITAL] {len(chunks_relevantes)} chunks relevantes encontrados")
            if chunks_relevantes:
                print(f"[PERGUNTAR_EDITAL] Top scores: {[c[0] for c in chunks_relevantes[:5]]}")

            # Montar contexto com chunks relevantes
            if chunks_relevantes:
                texto_pdf = f"=== TRECHOS RELEVANTES DO EDITAL ===\n\n"
                for i, (score, pos, chunk) in enumerate(chunks_relevantes, 1):
                    texto_pdf += f"--- Trecho {i} (posição {pos}) ---\n{chunk}\n\n"
            else:
                # Sem chunks relevantes, pegar documento inteiro até limite
                texto_pdf = texto_completo[:60000]
                print(f"[PERGUNTAR_EDITAL] Sem chunks relevantes, usando primeiros 60K caracteres")

            prompt_pdf = f"""Você é um assistente especializado em licitações públicas brasileiras.

CONTEÚDO DO EDITAL (extraído do PDF "{doc_com_texto.nome_arquivo}"):
{texto_pdf}

PERGUNTA DO USUÁRIO:
{message}

INSTRUÇÕES:
1. Responda a pergunta com base no conteúdo do edital acima
2. CITE O TRECHO EXATO do edital que contém a resposta (entre aspas)
3. Se a informação estiver em um Anexo ou Termo de Referência, indique qual
4. Se não encontrar a informação específica, diga claramente e sugira onde pode estar
5. Seja objetivo e direto

Responda em Markdown."""

            messages_pdf = [{"role": "user", "content": prompt_pdf}]
            resposta_pdf = call_deepseek(messages_pdf, max_tokens=3000)

            response_text = f"""## 💬 Resposta sobre o Edital {edital.numero}

{resposta_pdf}

---
📋 **Edital:** {edital.numero}
🏢 **Órgão:** {edital.orgao or 'N/I'}
📄 **Fonte:** PDF do edital ({doc_com_texto.nome_arquivo})
"""
            return response_text, {"success": True, "edital": edital.numero, "fonte": "pdf", "arquivo": doc_com_texto.nome_arquivo}

        # PASSO 4: Não tem PDF - pedir upload
        print(f"[PERGUNTAR_EDITAL] Nenhum PDF encontrado para o edital {edital.numero}")

        response_text = f"""## ⚠️ Informação Não Disponível

A informação solicitada **não foi encontrada** nos dados cadastrados do edital **{edital.numero}**.

Para responder sua pergunta, preciso do **PDF do edital**.

### 📤 Como fazer:
1. Faça upload do PDF do edital (arraste ou clique no 📎)
2. Junto com o arquivo, envie sua pergunta novamente

**Exemplo:** Envie o PDF e escreva:
> "Qual o prazo de entrega exigido neste edital?"

---
📋 **Edital:** {edital.numero}
🏢 **Órgão:** {edital.orgao or 'N/I'}
📊 **Dados no sistema:** {len(requisitos)} requisitos cadastrados
📄 **PDFs salvos:** Nenhum
"""
        return response_text, {
            "success": False,
            "edital": edital.numero,
            "precisa_upload": True,
            "mensagem": "PDF do edital necessário para responder esta pergunta"
        }

    except Exception as e:
        return f"## ❌ Erro ao Processar Pergunta\n\n{str(e)}", {"error": str(e)}
    finally:
        db.close()


def processar_baixar_pdf_edital(message: str, user_id: str, intencao_resultado: dict = None):
    """
    Processa ação: Baixar o PDF de um edital cadastrado.

    Fluxo:
    1. Identifica o edital pelo número
    2. Verifica se já tem PDF salvo
    3. Se não tem, usa a URL cadastrada para baixar
    4. Extrai texto do PDF e salva na tabela editais_documentos

    Returns: (response_text, resultado_dict)
    """
    import re
    import os
    import requests
    from datetime import datetime
    db = get_db()

    try:
        # Extrair número do edital da mensagem
        edital_numero = None
        if intencao_resultado and intencao_resultado.get("edital"):
            edital_numero = intencao_resultado.get("edital")
        else:
            # Tentar extrair padrões como PE-001/2026, PE001/2026, 001/2026
            padrao = re.search(r'(PE[-\s]?\d+[/\-]\d{4}|\d+[/\-]\d{4})', message, re.IGNORECASE)
            if padrao:
                edital_numero = padrao.group(1)

        if not edital_numero:
            return (
                "## ❌ Número do Edital Não Informado\n\n"
                "Por favor, informe o número do edital que deseja baixar.\n\n"
                "**Exemplos:**\n"
                "- \"Baixe o PDF do edital PE-001/2026\"\n"
                "- \"Faça download do edital 90006/2026\"\n"
                "- \"Baixar edital PE-041/2026\"",
                {"error": "Número do edital não informado"}
            )

        # Buscar edital no banco
        edital = db.query(Edital).filter(
            Edital.user_id == user_id,
            Edital.numero.ilike(f"%{edital_numero.replace('-', '%').replace('/', '%')}%")
        ).first()

        if not edital:
            return (
                f"## ❌ Edital Não Encontrado\n\n"
                f"O edital **{edital_numero}** não foi encontrado no seu cadastro.\n\n"
                "**Dica:** Use \"Liste meus editais\" para ver os editais cadastrados.",
                {"error": f"Edital {edital_numero} não encontrado"}
            )

        # Verificar se já tem documento salvo
        from models import EditalDocumento
        doc_existente = db.query(EditalDocumento).filter(
            EditalDocumento.edital_id == edital.id
        ).first()

        # Verificar se existe registro E se o arquivo físico ainda existe
        arquivo_existe = doc_existente and doc_existente.path_arquivo and os.path.exists(doc_existente.path_arquivo)

        if doc_existente and doc_existente.texto_extraido and len(doc_existente.texto_extraido) > 100 and arquivo_existe:
            return (
                f"## ✅ PDF Já Disponível\n\n"
                f"O edital **{edital.numero}** já possui PDF baixado e processado.\n\n"
                f"📄 **Arquivo:** {doc_existente.nome_arquivo}\n"
                f"📝 **Texto extraído:** {len(doc_existente.texto_extraido):,} caracteres\n\n"
                "Você pode fazer perguntas sobre o edital:\n"
                f"- \"Quais itens o edital {edital.numero} comporta?\"\n"
                f"- \"Qual o prazo de entrega do edital {edital.numero}?\"",
                {"success": True, "edital": edital.numero, "ja_existia": True, "arquivo": doc_existente.nome_arquivo, "edital_id": edital.id}
            )

        # Se o registro existe mas arquivo foi apagado, deletar o registro para recriar
        if doc_existente and not arquivo_existe:
            db.delete(doc_existente)
            db.commit()
            doc_existente = None  # Permitir re-download

        # ========== MÉTODO 1: Tentar baixar via API do PNCP (se tiver dados) ==========
        if edital.cnpj_orgao and edital.ano_compra and edital.seq_compra:
            from tools import tool_buscar_arquivos_edital_pncp, tool_baixar_pdf_pncp

            response_text = f"## ⏳ Baixando PDF do Edital {edital.numero}...\n\n"
            response_text += f"🔍 **Fonte:** API do PNCP\n"
            response_text += f"📌 **CNPJ:** {edital.cnpj_orgao} | **Ano:** {edital.ano_compra} | **Seq:** {edital.seq_compra}\n\n"

            # Buscar lista de arquivos
            arquivos_result = tool_buscar_arquivos_edital_pncp(edital_id=edital.id, user_id=user_id)

            if arquivos_result.get('success') and arquivos_result.get('arquivos'):
                arquivos = arquivos_result['arquivos']
                arquivo_edital = arquivos_result.get('arquivo_edital') or arquivos[0]

                response_text += f"📁 **Arquivos encontrados:** {len(arquivos)}\n"
                for arq in arquivos:
                    response_text += f"   - {arq['titulo']}\n"
                response_text += f"\n📥 **Baixando:** {arquivo_edital['titulo']}...\n\n"

                # Baixar o arquivo principal
                download_result = tool_baixar_pdf_pncp(
                    cnpj=edital.cnpj_orgao,
                    ano=edital.ano_compra,
                    seq=edital.seq_compra,
                    sequencial_arquivo=arquivo_edital['sequencial'],
                    user_id=user_id,
                    edital_id=edital.id
                )

                if download_result.get('success'):
                    filepath = download_result['filepath']
                    filename = download_result['filename']
                    filesize = download_result['filesize']

                    response_text += f"✅ **Download concluído:** {filename} ({filesize/1024:.1f} KB)\n\n"

                    # Extrair texto do PDF
                    texto_extraido = ""
                    try:
                        from PyPDF2 import PdfReader
                        reader = PdfReader(filepath)
                        for page in reader.pages:
                            texto_extraido += page.extract_text() or ""
                        response_text += f"📝 **Texto extraído:** {len(texto_extraido):,} caracteres\n\n"
                    except Exception as e:
                        response_text += f"⚠️ **Aviso:** Não foi possível extrair texto: {str(e)}\n\n"

                    # Salvar no banco
                    novo_doc = EditalDocumento(
                        id=str(uuid.uuid4()),
                        edital_id=edital.id,
                        tipo='edital_principal',
                        nome_arquivo=filename,
                        path_arquivo=filepath,
                        texto_extraido=texto_extraido[:100000] if texto_extraido else None,
                        processado=True,
                        created_at=datetime.now()
                    )
                    db.add(novo_doc)
                    db.commit()

                    response_text += "## ✅ PDF Salvo com Sucesso!\n\n"
                    response_text += "Agora você pode fazer perguntas sobre o edital:\n"
                    response_text += f"- \"Quais itens o edital {edital.numero} comporta?\"\n"
                    response_text += f"- \"Qual o local de entrega do edital {edital.numero}?\"\n"

                    return response_text, {
                        "success": True,
                        "edital": edital.numero,
                        "arquivo": filename,
                        "tamanho": filesize,
                        "texto_extraido": len(texto_extraido),
                        "fonte": "PNCP"
                    }
                else:
                    response_text += f"⚠️ **Erro no download via PNCP:** {download_result.get('error', 'Erro desconhecido')}\n\n"
                    response_text += "Tentando método alternativo...\n\n"
            else:
                response_text = f"## ⏳ Baixando PDF do Edital {edital.numero}...\n\n"
                response_text += f"⚠️ **PNCP:** Nenhum arquivo encontrado via API\n"
                response_text += "Tentando método alternativo...\n\n"

        # ========== MÉTODO 2: Tentar baixar da URL cadastrada ==========

        # Verificar se tem URL do edital
        if not edital.url:
            return (
                f"## ⚠️ URL do Edital Não Cadastrada\n\n"
                f"O edital **{edital.numero}** não possui URL cadastrada para download.\n\n"
                "**Opções:**\n"
                f"1. Atualize o edital com a URL: \"Atualize o edital {edital.numero} com URL: [URL_DO_PDF]\"\n"
                "2. Faça upload manual do PDF (arraste o arquivo para o chat)",
                {"error": "URL não cadastrada", "edital": edital.numero}
            )

        # Tentar baixar o PDF da URL
        if 'response_text' not in locals():
            response_text = f"## ⏳ Baixando PDF do Edital {edital.numero}...\n\n"
        response_text += f"🔗 **URL:** {edital.url}\n\n"

        try:
            # Baixar o arquivo
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(edital.url, headers=headers, timeout=60, allow_redirects=True)
            response.raise_for_status()

            # Determinar nome do arquivo
            content_type = response.headers.get('Content-Type', '')
            filename = f"edital_{edital.numero.replace('/', '_').replace('-', '_')}"

            if 'pdf' in content_type.lower() or edital.url.lower().endswith('.pdf'):
                filename += ".pdf"
            elif 'html' in content_type.lower():
                # É uma página HTML, não PDF direto - tentar encontrar link do PDF
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.content, 'html.parser')

                # Procurar links de PDF na página
                pdf_links = []
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if '.pdf' in href.lower():
                        # Converter para URL absoluta se necessário
                        if href.startswith('/'):
                            from urllib.parse import urlparse
                            parsed = urlparse(edital.url)
                            href = f"{parsed.scheme}://{parsed.netloc}{href}"
                        elif not href.startswith('http'):
                            href = edital.url.rsplit('/', 1)[0] + '/' + href
                        pdf_links.append(href)

                if pdf_links:
                    # Verificar se a URL cadastrada parece ser genérica (página inicial de portal)
                    url_generica = any(x in edital.url.lower() for x in [
                        '/pt-br', '/home', 'compras.gov', 'pncp.gov', 'bec.sp.gov'
                    ]) and edital.url.count('/') <= 4

                    if url_generica:
                        # URL é genérica demais - pedir URL específica
                        return (
                            f"## ⚠️ URL Genérica Cadastrada\n\n"
                            f"A URL cadastrada para o edital **{edital.numero}** parece ser a página inicial do portal:\n"
                            f"`{edital.url}`\n\n"
                            "Essa URL não aponta diretamente para o edital.\n\n"
                            "**O que fazer:**\n"
                            f"1. Acesse o portal e busque pelo edital {edital.numero}\n"
                            "2. Copie a URL da página específica do edital (ou do PDF)\n"
                            "3. Atualize com a URL correta:\n"
                            f"   `Atualize o edital {edital.numero} com URL: [URL_DO_EDITAL]`\n\n"
                            "Ou faça upload manual do PDF.",
                            {"error": "URL genérica", "edital": edital.numero, "url_atual": edital.url}
                        )

                    # Filtrar links relevantes ao edital
                    # Extrair apenas números do edital para comparação
                    numero_limpo = re.sub(r'[^\d]', '', edital.numero)

                    # Prioridade 1: Links que contenham o número do edital
                    links_com_numero = [l for l in pdf_links if numero_limpo in l]

                    # Prioridade 2: Links com palavras-chave do edital
                    palavras_edital = ['edital', 'pregao', 'pregão', 'pe-', 'pe_', 'licitacao', 'licitação',
                                       'termo_referencia', 'termo-referencia', 'tr_', 'tr-']
                    links_com_palavra = [l for l in pdf_links if any(p in l.lower() for p in palavras_edital)]

                    # Prioridade 3: Excluir links claramente não relacionados
                    palavras_excluir = ['politica', 'policy', 'manual', 'regulamento', 'instrucao', 'normativa',
                                        'template', 'modelo', 'anexo_unico', 'formulario', 'cadastro']
                    links_filtrados = [l for l in pdf_links if not any(p in l.lower() for p in palavras_excluir)]

                    # Escolher o melhor link
                    pdf_url = None
                    if links_com_numero:
                        pdf_url = links_com_numero[0]
                        response_text += f"🔍 **URL original era HTML.** Encontrado PDF com número do edital:\n`{pdf_url}`\n\n"
                    elif links_com_palavra:
                        pdf_url = links_com_palavra[0]
                        response_text += f"🔍 **URL original era HTML.** Encontrado PDF de edital:\n`{pdf_url}`\n\n"
                    elif links_filtrados:
                        pdf_url = links_filtrados[0]
                        response_text += f"🔍 **URL original era HTML.** Encontrado possível PDF:\n`{pdf_url}`\n\n"
                    else:
                        # Todos os links parecem não relacionados - listar para o usuário
                        links_lista = "\n".join([f"- `{l}`" for l in pdf_links[:5]])
                        return (
                            f"## ⚠️ Nenhum PDF do Edital Encontrado\n\n"
                            f"A página do edital **{edital.numero}** contém PDFs, mas nenhum parece ser o edital:\n\n"
                            f"{links_lista}\n\n"
                            "**O que fazer:**\n"
                            "1. Acesse a URL no navegador e encontre o PDF correto\n"
                            "2. Atualize com a URL direta do PDF:\n"
                            f"   `Atualize o edital {edital.numero} com URL: [URL_DO_PDF]`\n\n"
                            "Ou faça upload manual do PDF.",
                            {"error": "PDF não identificado", "edital": edital.numero, "links_encontrados": pdf_links[:5]}
                        )

                    # Baixar o PDF encontrado
                    response_pdf = requests.get(pdf_url, headers=headers, timeout=60, allow_redirects=True)
                    response_pdf.raise_for_status()
                    response = response_pdf  # Substituir o response pelo PDF
                    filename += ".pdf"
                else:
                    # Não encontrou PDF - informar usuário
                    return (
                        f"## ⚠️ URL Não Contém PDF Direto\n\n"
                        f"A URL cadastrada para o edital **{edital.numero}** aponta para uma página HTML, "
                        f"não para o arquivo PDF:\n`{edital.url}`\n\n"
                        "**O que fazer:**\n"
                        "1. Acesse a URL acima no navegador\n"
                        "2. Encontre o link do PDF do edital\n"
                        "3. Atualize com a URL correta:\n"
                        f"   `Atualize o edital {edital.numero} com URL: [URL_DO_PDF]`\n\n"
                        "Ou faça upload manual do PDF (arraste o arquivo para o chat).",
                        {"error": "URL não é PDF direto", "edital": edital.numero, "url_atual": edital.url}
                    )
            else:
                filename += ".pdf"

            # Salvar arquivo
            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads', user_id, 'editais')
            os.makedirs(upload_dir, exist_ok=True)
            filepath = os.path.join(upload_dir, filename)

            with open(filepath, 'wb') as f:
                f.write(response.content)

            filesize = len(response.content)
            response_text += f"✅ **Download concluído:** {filename} ({filesize/1024:.1f} KB)\n\n"

            # Extrair texto do PDF
            texto_extraido = ""
            try:
                if filename.endswith('.pdf'):
                    from PyPDF2 import PdfReader
                    reader = PdfReader(filepath)
                    for page in reader.pages:
                        texto_extraido += page.extract_text() or ""
                elif filename.endswith('.html'):
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(response.content, 'html.parser')
                    texto_extraido = soup.get_text(separator='\n', strip=True)

                response_text += f"📝 **Texto extraído:** {len(texto_extraido):,} caracteres\n\n"
            except Exception as e:
                response_text += f"⚠️ **Aviso:** Não foi possível extrair texto: {str(e)}\n\n"

            # Salvar no banco
            if doc_existente:
                doc_existente.path_arquivo = filepath
                doc_existente.nome_arquivo = filename
                doc_existente.texto_extraido = texto_extraido[:100000] if texto_extraido else None
                doc_existente.processado = True
            else:
                novo_doc = EditalDocumento(
                    id=str(uuid.uuid4()),
                    edital_id=edital.id,
                    tipo='edital_principal',  # Valores: edital_principal, termo_referencia, anexo, planilha, outro
                    nome_arquivo=filename,
                    path_arquivo=filepath,
                    texto_extraido=texto_extraido[:100000] if texto_extraido else None,
                    processado=True,
                    created_at=datetime.now()
                )
                db.add(novo_doc)

            db.commit()

            response_text += "## ✅ PDF Salvo com Sucesso!\n\n"
            response_text += "Agora você pode fazer perguntas sobre o edital:\n"
            response_text += f"- \"Quais itens o edital {edital.numero} comporta?\"\n"
            response_text += f"- \"Qual o local de entrega do edital {edital.numero}?\"\n"
            response_text += f"- \"Me conte tudo sobre o edital {edital.numero}\"\n"

            return response_text, {
                "success": True,
                "edital": edital.numero,
                "arquivo": filename,
                "tamanho": filesize,
                "texto_extraido": len(texto_extraido)
            }

        except requests.exceptions.RequestException as e:
            return (
                f"## ❌ Erro ao Baixar PDF\n\n"
                f"Não foi possível baixar o arquivo da URL:\n`{edital.url}`\n\n"
                f"**Erro:** {str(e)}\n\n"
                "**Opções:**\n"
                "1. Verifique se a URL está correta\n"
                "2. Tente acessar a URL manualmente e baixar o PDF\n"
                "3. Faça upload manual do PDF (arraste o arquivo para o chat)",
                {"error": str(e), "edital": edital.numero}
            )

    except Exception as e:
        return f"## ❌ Erro ao Processar Download\n\n{str(e)}", {"error": str(e)}
    finally:
        db.close()


def processar_atualizar_url_edital(message: str, user_id: str, intencao_resultado: dict = None):
    """Atualiza a URL de um edital cadastrado"""
    db = get_db()
    try:
        import re

        # Extrair número do edital da mensagem
        # Padrões: PE-001/2026, 02223/2025, PE001, etc.
        edital_numero = None
        if intencao_resultado and intencao_resultado.get("edital"):
            edital_numero = intencao_resultado["edital"]
        else:
            # Tentar extrair da mensagem
            patterns = [
                r'edital\s+([A-Za-z]{0,3}[-]?\d+[/]\d{4})',  # edital PE-001/2026 ou 02223/2025
                r'edital\s+([A-Za-z]{2,3}[-]?\d+)',  # edital PE-001 ou PE001
                r'([A-Za-z]{2,3}[-]\d+[/]\d{4})',  # PE-001/2026
                r'(\d{4,}[/]\d{4})',  # 02223/2025
            ]
            for pattern in patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    edital_numero = match.group(1)
                    break

        if not edital_numero:
            return (
                "## ⚠️ Número do Edital Não Informado\n\n"
                "Por favor, informe o número do edital que deseja atualizar.\n\n"
                "**Formato:**\n"
                "`Atualize o edital PE-001/2026 com URL: https://exemplo.com/edital.pdf`",
                {"error": "Número do edital não informado"}
            )

        # Extrair a nova URL da mensagem
        url_match = re.search(r'(https?://[^\s<>"]+)', message)
        if not url_match:
            return (
                f"## ⚠️ URL Não Informada\n\n"
                f"Por favor, informe a nova URL para o edital **{edital_numero}**.\n\n"
                "**Formato:**\n"
                f"`Atualize o edital {edital_numero} com URL: https://exemplo.com/edital.pdf`",
                {"error": "URL não informada", "edital": edital_numero}
            )

        nova_url = url_match.group(1)

        # Buscar edital no banco
        editais = db.query(Edital).filter(Edital.user_id == user_id).all()

        # Normalizar número para comparação
        numero_busca = edital_numero.replace('-', '').replace('/', '').upper()

        edital = None
        for e in editais:
            num_edital = e.numero.replace('-', '').replace('/', '').upper()
            if num_edital == numero_busca or numero_busca in num_edital or num_edital in numero_busca:
                edital = e
                break

        if not edital:
            return (
                f"## ❌ Edital Não Encontrado\n\n"
                f"O edital **{edital_numero}** não foi encontrado no seu cadastro.\n\n"
                "**Dica:** Use \"Liste meus editais\" para ver os editais cadastrados.",
                {"error": f"Edital {edital_numero} não encontrado"}
            )

        # Atualizar a URL
        url_antiga = edital.url
        edital.url = nova_url
        db.commit()

        response_text = f"## ✅ URL Atualizada com Sucesso!\n\n"
        response_text += f"**Edital:** {edital.numero}\n"
        response_text += f"**Órgão:** {edital.orgao or 'N/A'}\n\n"

        if url_antiga:
            response_text += f"**URL anterior:** `{url_antiga}`\n"
        response_text += f"**Nova URL:** `{nova_url}`\n\n"

        response_text += "Agora você pode baixar o PDF:\n"
        response_text += f"- `Baixe o PDF do edital {edital.numero}`"

        return response_text, {
            "success": True,
            "edital": edital.numero,
            "edital_id": edital.id,
            "url_antiga": url_antiga,
            "url_nova": nova_url
        }

    except Exception as e:
        return f"## ❌ Erro ao Atualizar URL\n\n{str(e)}", {"error": str(e)}
    finally:
        db.close()


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
        "extrair_ata": "extrair_ata",  # Nova ação: extrair resultados de ata de pregão
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
            "analisar": "Analisar documento",
            "extrair_ata": "Extrair resultados da ata"
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

        # ========== AÇÃO: EXTRAIR ATA DE SESSÃO ==========
        elif intencao_arquivo == "extrair_ata":
            response_text, resultado = processar_extrair_ata(texto_pdf, filepath, user_id, file.filename)

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


@app.route("/api/editais/<edital_id>/pdf", methods=["GET"])
@require_auth
def download_edital_pdf(edital_id):
    """Download ou visualização do PDF do edital"""
    user_id = get_current_user_id()
    db = get_db()
    try:
        # Buscar edital
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not edital:
            return jsonify({"error": "Edital não encontrado"}), 404

        # Parâmetro para forçar download (ao invés de visualizar)
        download = request.args.get('download', 'false').lower() == 'true'

        # Opção 1: Arquivo local já baixado (pdf_path)
        if edital.pdf_path and os.path.exists(edital.pdf_path):
            return send_file(
                edital.pdf_path,
                mimetype='application/pdf',
                as_attachment=download,
                download_name=edital.pdf_titulo or f"edital_{edital.numero}.pdf"
            )

        # Opção 2: Buscar documento salvo localmente (EditalDocumento)
        doc = db.query(EditalDocumento).filter(
            EditalDocumento.edital_id == edital_id,
            EditalDocumento.tipo == 'edital_principal'
        ).first()

        if doc and doc.path_arquivo and os.path.exists(doc.path_arquivo):
            return send_file(
                doc.path_arquivo,
                mimetype='application/pdf',
                as_attachment=download,
                download_name=doc.nome_arquivo or f"edital_{edital.numero}.pdf"
            )

        # Opção 3: Fazer proxy do PDF da URL do PNCP
        if edital.pdf_url:
            try:
                import requests as req
                print(f"[PDF] Fazendo proxy de: {edital.pdf_url}")
                resp = req.get(edital.pdf_url, timeout=60, stream=True)
                if resp.status_code == 200:
                    from io import BytesIO
                    pdf_content = BytesIO(resp.content)
                    return send_file(
                        pdf_content,
                        mimetype='application/pdf',
                        as_attachment=download,
                        download_name=edital.pdf_titulo or f"edital_{edital.numero}.pdf"
                    )
                else:
                    print(f"[PDF] Erro ao baixar: {resp.status_code}")
            except Exception as e:
                print(f"[PDF] Erro no proxy: {e}")

        # Opção 4: Se tem dados do PNCP, buscar arquivos dinamicamente
        if edital.cnpj_orgao and edital.ano_compra and edital.seq_compra:
            try:
                from tools import tool_buscar_arquivos_edital_pncp
                resultado = tool_buscar_arquivos_edital_pncp(
                    cnpj=edital.cnpj_orgao,
                    ano=edital.ano_compra,
                    seq=edital.seq_compra
                )
                if resultado.get('success') and resultado.get('arquivo_edital'):
                    pdf_url = resultado['arquivo_edital'].get('url_download') or resultado['arquivo_edital'].get('url')
                    if pdf_url:
                        import requests as req
                        resp = req.get(pdf_url, timeout=60, stream=True)
                        if resp.status_code == 200:
                            # Salvar URL para próxima vez
                            edital.pdf_url = pdf_url
                            edital.pdf_titulo = resultado['arquivo_edital'].get('titulo')
                            db.commit()

                            from io import BytesIO
                            pdf_content = BytesIO(resp.content)
                            return send_file(
                                pdf_content,
                                mimetype='application/pdf',
                                as_attachment=download,
                                download_name=edital.pdf_titulo or f"edital_{edital.numero}.pdf"
                            )
            except Exception as e:
                print(f"[PDF] Erro ao buscar arquivos PNCP: {e}")

        return jsonify({"error": "PDF não disponível para este edital"}), 404
    finally:
        db.close()


@app.route("/api/editais/numero/<numero>/pdf", methods=["GET"])
@require_auth
def download_edital_pdf_by_numero(numero):
    """Download ou visualização do PDF do edital pelo número"""
    user_id = get_current_user_id()
    db = get_db()
    try:
        # Normalizar número para busca
        numero_busca = numero.replace('_', '/').replace('-', '/').upper()

        # Buscar edital pelo número
        edital = db.query(Edital).filter(
            Edital.user_id == user_id
        ).all()

        # Encontrar edital com número similar
        edital_encontrado = None
        for e in edital:
            num_edital = e.numero.replace('-', '/').upper()
            if num_edital == numero_busca or numero_busca in num_edital or num_edital in numero_busca:
                edital_encontrado = e
                break

        if not edital_encontrado:
            return jsonify({"error": f"Edital {numero} não encontrado"}), 404

        # Buscar documento do edital
        doc = db.query(EditalDocumento).filter(
            EditalDocumento.edital_id == edital_encontrado.id,
            EditalDocumento.tipo == 'edital_principal'
        ).first()

        if not doc or not doc.path_arquivo:
            return jsonify({"error": "PDF não disponível para este edital"}), 404

        if not os.path.exists(doc.path_arquivo):
            return jsonify({"error": "Arquivo não encontrado no servidor"}), 404

        # Parâmetro para forçar download
        download = request.args.get('download', 'false').lower() == 'true'

        return send_file(
            doc.path_arquivo,
            mimetype='application/pdf',
            as_attachment=download,
            download_name=doc.nome_arquivo or f"edital_{edital_encontrado.numero}.pdf"
        )
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

    # Iniciar scheduler para alertas e monitoramentos (Sprint 2)
    try:
        from scheduler import iniciar_scheduler
        print("Iniciando scheduler de alertas e monitoramentos...")
        iniciar_scheduler()
    except Exception as e:
        print(f"[AVISO] Scheduler não iniciado: {e}")

    print("Servidor pronto na porta 5007!")
    print("=" * 50)

    app.run(host="0.0.0.0", port=5007, debug=True)
