"""
Gerador de Documentos Trabalhistas com IA

Integra a geração de documentos jurídicos com o LLM para:
1. Detectar pedidos de geração de documentos no chat
2. Extrair dados da mensagem do usuário
3. Identificar dados faltantes e solicitar ao usuário
4. Gerar documento completo em Markdown
5. Permitir alterações/revisões gerando novas versões
"""

import json
import re
from typing import Dict, Any, Optional, Tuple, List
from llm import call_deepseek
from database import (
    create_documento, get_documento, create_documento_versao, get_documentos_by_session
)


# Tipos de documentos disponíveis
TIPOS_DOCUMENTO = {
    "peticao_inicial": {
        "nome": "Petição Inicial Trabalhista",
        "descricao": "Petição inicial para reclamação trabalhista",
        "campos": [
            {"nome": "reclamante_nome", "label": "Nome do Reclamante", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamante_cpf", "label": "CPF do Reclamante", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamante_endereco", "label": "Endereço do Reclamante", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamante_ctps", "label": "CTPS (Número/Série)", "tipo": "text", "obrigatorio": False},
            {"nome": "reclamada_nome", "label": "Nome da Reclamada", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamada_cnpj", "label": "CNPJ da Reclamada", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamada_endereco", "label": "Endereço da Reclamada", "tipo": "text", "obrigatorio": True},
            {"nome": "data_admissao", "label": "Data de Admissão", "tipo": "date", "obrigatorio": True},
            {"nome": "data_demissao", "label": "Data de Demissão", "tipo": "date", "obrigatorio": True},
            {"nome": "funcao", "label": "Função Exercida", "tipo": "text", "obrigatorio": True},
            {"nome": "salario", "label": "Último Salário (R$)", "tipo": "number", "obrigatorio": True},
            {"nome": "fatos", "label": "Descrição dos Fatos", "tipo": "textarea", "obrigatorio": True},
            {"nome": "pedidos", "label": "Pedidos (separados por linha)", "tipo": "textarea", "obrigatorio": True},
            {"nome": "valor_causa", "label": "Valor da Causa (R$)", "tipo": "number", "obrigatorio": True},
        ]
    },
    "contestacao": {
        "nome": "Contestação Trabalhista",
        "descricao": "Contestação para defesa em reclamação trabalhista",
        "campos": [
            {"nome": "reclamada_nome", "label": "Nome da Reclamada", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamada_cnpj", "label": "CNPJ da Reclamada", "tipo": "text", "obrigatorio": True},
            {"nome": "reclamante_nome", "label": "Nome do Reclamante", "tipo": "text", "obrigatorio": True},
            {"nome": "numero_processo", "label": "Número do Processo", "tipo": "text", "obrigatorio": True},
            {"nome": "vara", "label": "Vara do Trabalho", "tipo": "text", "obrigatorio": True},
            {"nome": "preliminares", "label": "Preliminares (se houver)", "tipo": "textarea", "obrigatorio": False},
            {"nome": "fatos_contestados", "label": "Contestação dos Fatos", "tipo": "textarea", "obrigatorio": True},
            {"nome": "documentos_anexos", "label": "Documentos que serão anexados", "tipo": "textarea", "obrigatorio": False},
        ]
    },
    "recurso_ordinario": {
        "nome": "Recurso Ordinário",
        "descricao": "Recurso ordinário contra sentença de primeiro grau",
        "campos": [
            {"nome": "recorrente_nome", "label": "Nome do Recorrente", "tipo": "text", "obrigatorio": True},
            {"nome": "recorrido_nome", "label": "Nome do Recorrido", "tipo": "text", "obrigatorio": True},
            {"nome": "numero_processo", "label": "Número do Processo", "tipo": "text", "obrigatorio": True},
            {"nome": "vara_origem", "label": "Vara de Origem", "tipo": "text", "obrigatorio": True},
            {"nome": "data_sentenca", "label": "Data da Sentença", "tipo": "date", "obrigatorio": True},
            {"nome": "resumo_sentenca", "label": "Resumo da Sentença Recorrida", "tipo": "textarea", "obrigatorio": True},
            {"nome": "razoes_recurso", "label": "Razões do Recurso", "tipo": "textarea", "obrigatorio": True},
            {"nome": "pedido_reforma", "label": "Pedido de Reforma", "tipo": "textarea", "obrigatorio": True},
        ]
    },
    "acordo_extrajudicial": {
        "nome": "Acordo Extrajudicial",
        "descricao": "Acordo extrajudicial para homologação judicial (Art. 855-B CLT)",
        "campos": [
            {"nome": "empregador_nome", "label": "Nome do Empregador", "tipo": "text", "obrigatorio": True},
            {"nome": "empregador_cnpj", "label": "CNPJ do Empregador", "tipo": "text", "obrigatorio": True},
            {"nome": "empregado_nome", "label": "Nome do Empregado", "tipo": "text", "obrigatorio": True},
            {"nome": "empregado_cpf", "label": "CPF do Empregado", "tipo": "text", "obrigatorio": True},
            {"nome": "data_admissao", "label": "Data de Admissão", "tipo": "date", "obrigatorio": True},
            {"nome": "data_demissao", "label": "Data de Demissão", "tipo": "date", "obrigatorio": True},
            {"nome": "valor_acordo", "label": "Valor Total do Acordo (R$)", "tipo": "number", "obrigatorio": True},
            {"nome": "verbas_discriminadas", "label": "Verbas Discriminadas", "tipo": "textarea", "obrigatorio": True},
            {"nome": "forma_pagamento", "label": "Forma de Pagamento", "tipo": "textarea", "obrigatorio": True},
            {"nome": "quitacao", "label": "Tipo de Quitação", "tipo": "select", "opcoes": ["Parcial", "Total"], "obrigatorio": True},
        ]
    },
    "notificacao_extrajudicial": {
        "nome": "Notificação Extrajudicial",
        "descricao": "Notificação extrajudicial trabalhista",
        "campos": [
            {"nome": "notificante_nome", "label": "Nome do Notificante", "tipo": "text", "obrigatorio": True},
            {"nome": "notificante_qualificacao", "label": "Qualificação do Notificante", "tipo": "textarea", "obrigatorio": True},
            {"nome": "notificado_nome", "label": "Nome do Notificado", "tipo": "text", "obrigatorio": True},
            {"nome": "notificado_endereco", "label": "Endereço do Notificado", "tipo": "text", "obrigatorio": True},
            {"nome": "fatos", "label": "Descrição dos Fatos", "tipo": "textarea", "obrigatorio": True},
            {"nome": "providencias", "label": "Providências Solicitadas", "tipo": "textarea", "obrigatorio": True},
            {"nome": "prazo", "label": "Prazo para Resposta (dias)", "tipo": "number", "obrigatorio": True},
        ]
    },
    "procuracao": {
        "nome": "Procuração Ad Judicia",
        "descricao": "Procuração para representação em processo trabalhista",
        "campos": [
            {"nome": "outorgante_nome", "label": "Nome do Outorgante", "tipo": "text", "obrigatorio": True},
            {"nome": "outorgante_nacionalidade", "label": "Nacionalidade", "tipo": "text", "obrigatorio": True},
            {"nome": "outorgante_estado_civil", "label": "Estado Civil", "tipo": "text", "obrigatorio": True},
            {"nome": "outorgante_profissao", "label": "Profissão", "tipo": "text", "obrigatorio": True},
            {"nome": "outorgante_cpf", "label": "CPF", "tipo": "text", "obrigatorio": True},
            {"nome": "outorgante_rg", "label": "RG", "tipo": "text", "obrigatorio": True},
            {"nome": "outorgante_endereco", "label": "Endereço Completo", "tipo": "text", "obrigatorio": True},
            {"nome": "advogado_nome", "label": "Nome do Advogado", "tipo": "text", "obrigatorio": True},
            {"nome": "advogado_oab", "label": "Número da OAB", "tipo": "text", "obrigatorio": True},
            {"nome": "poderes_especiais", "label": "Poderes Especiais (se houver)", "tipo": "textarea", "obrigatorio": False},
        ]
    },
}


# Prompt para detectar pedido de documento
PROMPT_DETECTAR_DOCUMENTO = """Você é um assistente especializado em IDENTIFICAR pedidos de geração de documentos jurídicos trabalhistas.

TAREFA: Analise a mensagem e determine se o usuário está pedindo para gerar um documento jurídico.

TIPOS DE DOCUMENTO DISPONÍVEIS:
1. peticao_inicial - Petição Inicial Trabalhista (reclamação trabalhista)
2. contestacao - Contestação Trabalhista (defesa do empregador)
3. recurso_ordinario - Recurso Ordinário (recurso contra sentença)
4. acordo_extrajudicial - Acordo Extrajudicial (acordo para homologação)
5. notificacao_extrajudicial - Notificação Extrajudicial
6. procuracao - Procuração Ad Judicia (procuração para advogado)

REGRAS DE DETECÇÃO:
- "gere uma petição", "fazer petição inicial", "preciso de uma reclamação trabalhista" = peticao_inicial
- "gere uma contestação", "defesa trabalhista", "contestar reclamação" = contestacao
- "recurso ordinário", "recorrer da sentença" = recurso_ordinario
- "acordo extrajudicial", "acordo para homologar" = acordo_extrajudicial
- "notificação extrajudicial", "notificar empresa/empregado" = notificacao_extrajudicial
- "procuração", "instrumento de mandato" = procuracao

EXTRAÇÃO DE DADOS:
- Extraia todos os dados que o usuário forneceu na mensagem
- Nomes, CPFs, CNPJs, datas, valores, descrições de fatos, etc.
- Converta datas para formato YYYY-MM-DD
- Converta valores monetários para números (R$ 5.000,00 → 5000.0)

Responda APENAS com JSON válido:
{
    "e_pedido_documento": true/false,
    "tipo_documento": "tipo" ou null,
    "dados_extraidos": {"campo": "valor", ...},
    "dados_faltantes": [],
    "mensagem_solicitacao": null
}

REGRAS CRÍTICAS:
1. Se o usuário pede para gerar um documento, SEMPRE retorne e_pedido_documento=true
2. NUNCA peça mais dados - retorne dados_faltantes como lista VAZIA []
3. Use os dados fornecidos e deixe a IA preencher o que faltar com dados genéricos
4. Se NÃO for pedido de documento, retorne {"e_pedido_documento": false}
5. Se for pedido de ALTERAÇÃO de documento existente (ex: "mude o nome", "altere", "troque", "substitua"), retorne {"e_pedido_documento": false, "e_pedido_alteracao": true, "alteracao_solicitada": "descrição da alteração"}

MENSAGEM DO USUÁRIO:
"""


# Prompt para gerar documento
PROMPT_GERAR_DOCUMENTO = """Você é um advogado trabalhista experiente redigindo um documento jurídico.

TIPO DE DOCUMENTO: {tipo_nome}
DESCRIÇÃO: {tipo_descricao}

DADOS FORNECIDOS:
{dados_json}

INSTRUÇÕES IMPORTANTES:
1. Gere o documento COMPLETO em formato Markdown IMEDIATAMENTE
2. Use formatação jurídica adequada e profissional
3. Inclua todos os elementos padrão do tipo de documento
4. Use linguagem técnica jurídica apropriada
5. Cite a base legal quando aplicável (artigos da CLT, leis, súmulas)
6. Estruture o documento com seções claras (cabeçalho, preâmbulo, corpo, pedidos, fecho)
7. Use **negrito** para destaques importantes
8. Use listas numeradas ou com marcadores quando apropriado

REGRAS CRÍTICAS:
- NUNCA peça mais informações - gere o documento com os dados disponíveis
- Para dados faltantes, use valores genéricos ou deixe espaços como "[ENDEREÇO]" ou "[A DEFINIR]"
- Para valores de verbas rescisórias, faça estimativas baseadas no salário e período trabalhado
- O valor da causa pode ser estimado somando os pedidos
- Endereços faltantes podem ser marcados como "[ENDEREÇO COMPLETO]"
- CTPS faltante pode ser marcada como "[NÚMERO CTPS/SÉRIE]"

FORMATO DE SAÍDA:
- Retorne APENAS o documento em Markdown, sem comentários adicionais
- Comece diretamente com o cabeçalho do documento
- NÃO inclua explicações, perguntas ou comentários antes ou depois do documento
- NÃO peça confirmação ou mais dados

Gere o documento completo AGORA:
"""


# Prompt para alterar documento
PROMPT_ALTERAR_DOCUMENTO = """Você é um advogado trabalhista experiente revisando um documento jurídico.

DOCUMENTO ATUAL:
```markdown
{documento_atual}
```

ALTERAÇÃO SOLICITADA PELO USUÁRIO:
{alteracao}

INSTRUÇÕES:
1. Faça a alteração solicitada mantendo a estrutura e formatação do documento
2. Mantenha o restante do documento inalterado
3. Use linguagem jurídica apropriada nas alterações
4. Se a alteração envolver valores, verifique a consistência
5. Se a alteração envolver novos pedidos, inclua a base legal

Gere o documento completo com a alteração (retorne APENAS o documento em Markdown):
"""


def detectar_pedido_documento(mensagem: str) -> Dict[str, Any]:
    """
    Usa o LLM para detectar se a mensagem é um pedido de geração de documento
    e extrair os dados fornecidos.
    """
    prompt = PROMPT_DETECTAR_DOCUMENTO + mensagem

    try:
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=1500)

        # Extrair JSON da resposta
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if json_match:
            resultado = json.loads(json_match.group())
            return resultado
        else:
            return {"e_pedido_documento": False, "erro": "Não foi possível parsear resposta"}
    except json.JSONDecodeError:
        return {"e_pedido_documento": False, "erro": "JSON inválido na resposta"}
    except Exception as e:
        return {"e_pedido_documento": False, "erro": str(e)}


def gerar_documento_com_ia(tipo: str, dados: Dict[str, Any]) -> str:
    """
    Usa o LLM para gerar um documento completo baseado no tipo e dados fornecidos.
    """
    tipo_info = TIPOS_DOCUMENTO.get(tipo)
    if not tipo_info:
        raise ValueError(f"Tipo de documento desconhecido: {tipo}")

    prompt = PROMPT_GERAR_DOCUMENTO.format(
        tipo_nome=tipo_info["nome"],
        tipo_descricao=tipo_info["descricao"],
        dados_json=json.dumps(dados, ensure_ascii=False, indent=2)
    )

    try:
        documento = call_deepseek([{"role": "user", "content": prompt}], max_tokens=8000)
        return documento.strip()
    except Exception as e:
        raise Exception(f"Erro ao gerar documento: {str(e)}")


def alterar_documento_com_ia(documento_atual: str, alteracao: str) -> str:
    """
    Usa o LLM para alterar um documento existente baseado na solicitação do usuário.
    """
    prompt = PROMPT_ALTERAR_DOCUMENTO.format(
        documento_atual=documento_atual,
        alteracao=alteracao
    )

    try:
        documento = call_deepseek([{"role": "user", "content": prompt}], max_tokens=8000)
        return documento.strip()
    except Exception as e:
        raise Exception(f"Erro ao alterar documento: {str(e)}")


def gerar_titulo_documento(tipo: str, dados: Dict[str, Any]) -> str:
    """Gera um título para o documento baseado no tipo e dados."""
    tipo_info = TIPOS_DOCUMENTO.get(tipo, {})
    nome_tipo = tipo_info.get("nome", tipo.replace("_", " ").title())

    # Tentar extrair nome da parte principal
    if tipo == "peticao_inicial":
        parte = dados.get("reclamante_nome", "")
    elif tipo == "contestacao":
        parte = dados.get("reclamada_nome", "")
    elif tipo == "recurso_ordinario":
        parte = dados.get("recorrente_nome", "")
    elif tipo == "acordo_extrajudicial":
        parte = f"{dados.get('empregado_nome', '')} x {dados.get('empregador_nome', '')}"
    elif tipo == "notificacao_extrajudicial":
        parte = dados.get("notificante_nome", "")
    elif tipo == "procuracao":
        parte = dados.get("outorgante_nome", "")
    else:
        parte = ""

    if parte:
        return f"{nome_tipo} - {parte}"
    return nome_tipo


def processar_documento_chat(
    mensagem: str,
    user_id: str,
    session_id: Optional[str] = None,
    historico: Optional[List] = None
) -> Tuple[bool, Optional[str], Optional[Dict]]:
    """
    Processa uma mensagem do chat verificando se é pedido de documento ou alteração.

    Retorna:
    - (True, resposta, resultado) se processou um documento ou alteração
    - (False, None, None) se não é pedido de documento nem alteração
    """
    # Detectar se é pedido de documento ou alteração
    deteccao = detectar_pedido_documento(mensagem)

    # Verificar se é pedido de ALTERAÇÃO de documento existente
    if deteccao.get("e_pedido_alteracao"):
        alteracao = deteccao.get("alteracao_solicitada", mensagem)

        # Buscar o último documento da sessão
        if session_id:
            documentos_sessao = get_documentos_by_session(session_id, user_id)
            if documentos_sessao:
                # Pegar o mais recente
                doc_mais_recente = documentos_sessao[0]
                documento_completo = get_documento(doc_mais_recente["id"], user_id)

                if documento_completo:
                    try:
                        # Gerar nova versão com alteração
                        novo_conteudo = alterar_documento_com_ia(documento_completo["conteudo_md"], alteracao)

                        # Criar nova versão no banco
                        nova_versao = create_documento_versao(
                            documento_pai_id=documento_completo["id"],
                            conteudo_md=novo_conteudo,
                            user_id=user_id
                        )

                        if nova_versao:
                            resposta = f"## {nova_versao['titulo']} (Versão {nova_versao['versao']})\n\n{novo_conteudo}"
                            return True, resposta, {
                                "status": "alterado",
                                "documento_id": nova_versao["id"],
                                "versao": nova_versao["versao"],
                                "titulo": nova_versao["titulo"]
                            }
                    except Exception as e:
                        return True, f"**Erro ao alterar documento:** {str(e)}", None

        # Se não encontrou documento na sessão
        return True, "**Não encontrei um documento nesta conversa para alterar.** Por favor, gere um documento primeiro ou especifique qual documento deseja alterar.", None

    # Verificar se é pedido de geração de documento
    if not deteccao.get("e_pedido_documento"):
        return False, None, None

    tipo = deteccao.get("tipo_documento")
    dados = deteccao.get("dados_extraidos", {})
    faltantes = deteccao.get("dados_faltantes", [])

    if not tipo or tipo not in TIPOS_DOCUMENTO:
        return False, None, None

    # Gerar documento diretamente com os dados disponíveis (não pedir mais dados)
    try:
        conteudo_md = gerar_documento_com_ia(tipo, dados)
        titulo = gerar_titulo_documento(tipo, dados)

        # Salvar no banco
        documento = create_documento(
            user_id=user_id,
            tipo=tipo,
            titulo=titulo,
            conteudo_md=conteudo_md,
            dados_json=dados,
            session_id=session_id
        )

        # Montar resposta para o chat
        resposta = f"## {titulo}\n\n{conteudo_md}"

        return True, resposta, {
            "status": "gerado",
            "documento_id": documento["id"],
            "tipo": tipo,
            "titulo": titulo
        }

    except Exception as e:
        return True, f"**Erro ao gerar documento:** {str(e)}", None


def gerar_documento_formulario(
    tipo: str,
    dados: Dict[str, Any],
    user_id: str,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Gera um documento a partir dos dados do formulário.
    Usado pelo endpoint /api/documentos/gerar.
    """
    if tipo not in TIPOS_DOCUMENTO:
        return {"sucesso": False, "erro": f"Tipo de documento inválido: {tipo}"}

    tipo_info = TIPOS_DOCUMENTO[tipo]

    # Validar campos obrigatórios
    campos_faltantes = []
    for campo in tipo_info["campos"]:
        if campo["obrigatorio"] and not dados.get(campo["nome"]):
            campos_faltantes.append(campo["label"])

    if campos_faltantes:
        return {
            "sucesso": False,
            "erro": "Campos obrigatórios não preenchidos",
            "campos_faltantes": campos_faltantes
        }

    try:
        conteudo_md = gerar_documento_com_ia(tipo, dados)
        titulo = gerar_titulo_documento(tipo, dados)

        # Salvar no banco
        documento = create_documento(
            user_id=user_id,
            tipo=tipo,
            titulo=titulo,
            conteudo_md=conteudo_md,
            dados_json=dados,
            session_id=session_id
        )

        return {
            "sucesso": True,
            "documento": documento
        }

    except Exception as e:
        return {"sucesso": False, "erro": str(e)}


def alterar_documento_formulario(
    documento_id: str,
    alteracao: str,
    user_id: str
) -> Dict[str, Any]:
    """
    Altera um documento existente criando uma nova versão.
    Usado pelo endpoint /api/documentos/{id}/versao.
    """
    # Buscar documento atual
    documento = get_documento(documento_id, user_id)
    if not documento:
        return {"sucesso": False, "erro": "Documento não encontrado"}

    try:
        # Gerar nova versão com alteração
        novo_conteudo = alterar_documento_com_ia(documento["conteudo_md"], alteracao)

        # Criar nova versão no banco
        nova_versao = create_documento_versao(
            documento_pai_id=documento_id,
            conteudo_md=novo_conteudo,
            user_id=user_id
        )

        if not nova_versao:
            return {"sucesso": False, "erro": "Erro ao criar nova versão"}

        return {
            "sucesso": True,
            "documento": nova_versao
        }

    except Exception as e:
        return {"sucesso": False, "erro": str(e)}


def get_tipos_documento() -> Dict[str, Any]:
    """Retorna os tipos de documento disponíveis com seus campos."""
    return {
        tipo: {
            "nome": info["nome"],
            "descricao": info["descricao"],
            "campos": info["campos"]
        }
        for tipo, info in TIPOS_DOCUMENTO.items()
    }
