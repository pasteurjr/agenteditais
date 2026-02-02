"""
Tools para o Agente de Editais.
Cada tool é uma função que o agente pode chamar para executar ações específicas.
"""
import json
import os
import re
import uuid
import requests
import fitz  # PyMuPDF
from typing import Dict, List, Any, Optional
from datetime import datetime
from decimal import Decimal

from models import (
    get_db, Produto, ProdutoEspecificacao, ProdutoDocumento,
    FonteEdital, Edital, EditalRequisito, EditalDocumento,
    Analise, AnaliseDetalhe, Proposta
)
from llm import call_deepseek
from config import UPLOAD_FOLDER, PNCP_BASE_URL


# ==================== PROMPTS PARA EXTRAÇÃO ====================

PROMPT_EXTRAIR_SPECS = """Extraia TODAS as especificações técnicas do texto abaixo.

Para cada especificação, retorne um objeto JSON com:
- nome: nome descritivo da especificação (ex: "Temperatura de operação", "Largura", "Peso", "Alimentação", "Consumo energético")
- valor: valor completo como está no texto (ex: "15 a 30°C", "645 mm", "78 kg")
- unidade: unidade de medida se houver (ex: "mm", "kg", "°C", "%", "kPa", "VA")

Exemplo:
[
  {{"nome": "Temperatura de operação", "valor": "15 a 30°C", "unidade": "°C"}},
  {{"nome": "Largura", "valor": "645 mm", "unidade": "mm"}},
  {{"nome": "Peso total", "valor": "78 kg", "unidade": "kg"}}
]

Retorne APENAS um array JSON válido, sem texto adicional.

TEXTO:
{texto}

JSON:
"""

PROMPT_EXTRAIR_REQUISITOS = """Você é um especialista em análise de editais de licitação.

Analise o texto do edital abaixo e extraia TODOS os requisitos técnicos, documentais e comerciais.

Para cada requisito, retorne um objeto JSON com:
- tipo: "tecnico", "documental" ou "comercial"
- descricao: descrição completa do requisito
- nome_especificacao: nome da especificação técnica se houver (ex: "Sensibilidade", "Voltagem")
- valor_exigido: valor exigido se houver (ex: "≤ 0.05 mg/dL", "220V")
- operador: operador se houver ("<", "<=", "=", ">=", ">")
- valor_numerico: valor numérico extraído
- obrigatorio: true se for obrigatório, false se for desejável

Retorne APENAS um array JSON válido, sem texto adicional.

TEXTO DO EDITAL:
{texto}

REQUISITOS EXTRAÍDOS (JSON):
"""

PROMPT_CLASSIFICAR_EDITAL = """Analise o objeto do edital e classifique em uma das categorias:
- comodato: equipamento em comodato com consumo de reagentes
- venda_equipamento: venda direta de equipamento
- aluguel_com_consumo: aluguel de equipamento com consumo obrigatório
- aluguel_sem_consumo: aluguel de equipamento sem consumo
- consumo_reagentes: apenas reagentes/kits
- consumo_insumos: insumos hospitalares ou laboratoriais
- servicos: prestação de serviços

OBJETO DO EDITAL:
{objeto}

Responda APENAS com a categoria (uma palavra), sem explicação.
"""

PROMPT_GERAR_PROPOSTA = """Você é um especialista em elaboração de propostas técnicas para licitações públicas.

Com base nas informações abaixo, gere uma PROPOSTA TÉCNICA completa e profissional.

EDITAL:
- Número: {numero_edital}
- Órgão: {orgao}
- Objeto: {objeto}

PRODUTO OFERTADO:
- Nome: {nome_produto}
- Fabricante: {fabricante}
- Modelo: {modelo}

ESPECIFICAÇÕES DO PRODUTO:
{especificacoes}

REQUISITOS DO EDITAL E ATENDIMENTO:
{analise_requisitos}

PREÇO: R$ {preco}

Gere uma proposta técnica formatada em Markdown com as seguintes seções:
1. IDENTIFICAÇÃO DA PROPONENTE (deixar campos em branco para preenchimento)
2. OBJETO DA PROPOSTA
3. DESCRIÇÃO TÉCNICA DO PRODUTO
4. ATENDIMENTO AOS REQUISITOS DO EDITAL (tabela comparativa)
5. CONDIÇÕES COMERCIAIS
6. VALIDADE DA PROPOSTA
7. DECLARAÇÕES

A proposta deve ser formal, técnica e seguir o padrão de licitações públicas brasileiras.
"""


# ==================== FUNÇÕES AUXILIARES ====================

def _extrair_json_array(texto: str) -> List[Dict]:
    """
    Extrai um array JSON de uma resposta da IA.
    Lida com casos onde a resposta vem com ```json ou markdown.
    """
    # Remover blocos de código markdown
    texto_limpo = texto
    if "```json" in texto:
        # Extrair conteúdo entre ```json e ```
        match = re.search(r'```json\s*([\s\S]*?)\s*```', texto)
        if match:
            texto_limpo = match.group(1)
    elif "```" in texto:
        match = re.search(r'```\s*([\s\S]*?)\s*```', texto)
        if match:
            texto_limpo = match.group(1)

    # Tentar extrair array JSON
    json_match = re.search(r'\[[\s\S]*\]', texto_limpo)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return []


def _extrair_info_produto(texto: str) -> Dict[str, Any]:
    """
    Usa IA para extrair informações do produto a partir do texto do manual.
    Retorna: nome, fabricante, modelo, categoria
    """
    prompt = f"""Analise o texto abaixo (extraído de um manual/datasheet) e identifique:

1. **Nome do produto** - Nome comercial completo do equipamento/produto
2. **Fabricante** - Empresa que fabrica o produto
3. **Modelo** - Código/número do modelo
4. **Categoria** - Uma das opções: equipamento, reagente, insumo_hospitalar, insumo_laboratorial, informatica, redes, mobiliario, eletronico, outro

TEXTO:
{texto[:5000]}

Retorne APENAS um JSON válido no formato:
{{"nome": "Nome do Produto", "fabricante": "Nome do Fabricante", "modelo": "ABC-123", "categoria": "equipamento"}}

Se não encontrar alguma informação, use null.
JSON:"""

    try:
        print(f"[TOOLS] Chamando IA para extrair info do produto...")
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=500, model_override="deepseek-chat")
        print(f"[TOOLS] Resposta da IA: {resposta[:300]}")

        # Extrair JSON da resposta
        import re
        json_match = re.search(r'\{[\s\S]*?\}', resposta)
        if json_match:
            info = json.loads(json_match.group())
            print(f"[TOOLS] JSON extraído: {info}")
            return {
                "nome": info.get("nome") or "Produto",
                "fabricante": info.get("fabricante"),
                "modelo": info.get("modelo"),
                "categoria": info.get("categoria", "equipamento")
            }
        else:
            print(f"[TOOLS] Não encontrou JSON na resposta")
    except Exception as e:
        print(f"[TOOLS] Erro ao extrair info do produto: {e}")

    return {"nome": "Produto", "fabricante": None, "modelo": None, "categoria": "equipamento"}


# ==================== TOOLS ====================

def tool_web_search(query: str, user_id: str, num_results: int = 10) -> Dict[str, Any]:
    """
    Busca informações na web usando Serper API (Google Search).
    Retorna resultados de busca que podem conter links para PDFs/manuais.
    """
    from config import SERPER_API_KEY, SERPER_API_URL

    try:
        # Adicionar filetype:pdf para priorizar PDFs
        search_query = f"{query} filetype:pdf"

        response = requests.post(
            SERPER_API_URL,
            headers={
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            json={
                'q': search_query,
                'num': num_results,
                'gl': 'br',  # Resultados do Brasil
                'hl': 'pt'   # Interface em português
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        # Extrair resultados orgânicos
        resultados = []
        for item in data.get('organic', []):
            resultados.append({
                'titulo': item.get('title', ''),
                'link': item.get('link', ''),
                'descricao': item.get('snippet', ''),
                'posicao': item.get('position', 0)
            })

        # Filtrar apenas PDFs
        pdfs = [r for r in resultados if '.pdf' in r['link'].lower()]
        outros = [r for r in resultados if '.pdf' not in r['link'].lower()]

        return {
            "success": True,
            "query": query,
            "total_resultados": len(resultados),
            "pdfs_encontrados": len(pdfs),
            "resultados_pdf": pdfs[:5],  # Top 5 PDFs
            "outros_resultados": outros[:3],  # Top 3 outros
            "buscas_relacionadas": [s.get('query') for s in data.get('relatedSearches', [])][:5]
        }

    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Erro na busca: {str(e)}",
            "query": query
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro inesperado: {str(e)}",
            "query": query
        }


def tool_buscar_editais_scraper(termo: str, fontes: List[str] = None, user_id: str = None) -> Dict[str, Any]:
    """
    Busca editais em múltiplas fontes usando Serper API (Google Search com site:).
    Não depende de APIs específicas de cada portal.

    Args:
        termo: Termo de busca (ex: "equipamento laboratorial")
        fontes: Lista de URLs base das fontes (ex: ["bec.sp.gov.br", "comprasnet.gov.br"])
        user_id: ID do usuário

    Returns:
        Dict com editais encontrados de todas as fontes
    """
    from config import SERPER_API_KEY, SERPER_API_URL

    # Se não especificar fontes, buscar nas principais cadastradas
    if not fontes:
        db = get_db()
        try:
            fontes_db = db.query(FonteEdital).filter(FonteEdital.ativo == True).all()
            fontes = []
            for f in fontes_db:
                # Extrair domínio da URL
                url = f.url_base
                if url:
                    # Remover protocolo e path
                    dominio = url.replace("https://", "").replace("http://", "").split("/")[0]
                    if dominio not in fontes:
                        fontes.append(dominio)
        finally:
            db.close()

    # Se ainda não tem fontes, usar padrão
    if not fontes:
        fontes = [
            "pncp.gov.br",
            "gov.br/compras",
            "bec.sp.gov.br",
            "compras.mg.gov.br",
            "licitacoes-e.com.br"
        ]

    print(f"[SCRAPER] Buscando '{termo}' em {len(fontes)} fontes: {fontes}")

    todos_resultados = []
    erros = []

    # Palavras que indicam que NÃO é um edital de AQUISIÇÃO DE PRODUTOS
    palavras_excluir = [
        # Concursos e RH
        'concurso público', 'concurso publico', 'vagas para', 'aprovados',
        'convocação', 'convocacao', 'nomeação', 'nomeacao', 'posse',
        'inscrição', 'inscricao', 'gabarito', 'resultado preliminar',
        'funcionário', 'funcionarios', 'salário', 'salario', '13º',
        # Notícias
        'notícia', 'noticia', 'comunicado', 'portaria', 'decreto',
        'lei complementar', 'resolução', 'resolucao', 'será atendido',
        'passam para', 'transição', 'como vai funcionar', 'servidores estaduais',
        'atendimentos do sas', 'serão transferidos',
        # Serviços (não produtos)
        'prestação de serviço', 'prestacao de servico', 'mão de obra', 'mao de obra',
        'dedicação exclusiva', 'dedicacao exclusiva', 'terceirização', 'terceirizacao',
        'serviço de lavanderia', 'servico de lavanderia', 'serviço de limpeza',
        'manutenção preventiva', 'manutencao preventiva', 'manutenção corretiva',
        # Prorrogações/Aditivos (não novos editais)
        'termo aditivo', 'prorrogação da ata', 'prorrogacao da ata',
        'prorrogação parcial', 'prorrogacao parcial',
        # Editais genéricos sem objeto
        'poderão participar do processo as empresas devidamente credenciadas'
    ]

    # Padrões de URL que indicam página de edital (não notícia)
    padroes_url_edital = [
        '/editais/', '/edital/', '/pregao/', '/licitacao/', '/licitacoes/',
        '/compras/', '/dispensa/', '/inexigibilidade/', '/ata-registro/',
        'edital=', 'pregao=', 'licitacao=', 'processo='
    ]

    for fonte in fontes[:5]:  # Limitar a 5 fontes para não demorar muito
        try:
            # Montar query com site: - buscar por aquisição de bens/equipamentos
            search_query = f"site:{fonte} pregão eletrônico aquisição {termo} 2025 OR 2026"

            print(f"[SCRAPER] Buscando: {search_query}")

            response = requests.post(
                SERPER_API_URL,
                headers={
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json'
                },
                json={
                    'q': search_query,
                    'num': 10,
                    'gl': 'br',
                    'hl': 'pt'
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            # Processar resultados
            resultados_fonte = 0
            for item in data.get('organic', []):
                link = item.get('link', '')
                titulo = item.get('title', '')
                descricao = item.get('snippet', '')
                texto_completo = (titulo + " " + descricao).lower()

                # 1. Filtrar resultados que são notícias/concursos
                eh_noticia = any(palavra in texto_completo for palavra in palavras_excluir)
                if eh_noticia:
                    print(f"[SCRAPER] Ignorando (notícia): {titulo[:40]}...")
                    continue

                # 2. Verificar se a URL parece ser de um edital
                url_lower = link.lower()
                eh_url_edital = any(padrao in url_lower for padrao in padroes_url_edital)

                # 3. Extrair número do edital
                numero_edital = _extrair_numero_edital(titulo + " " + descricao)

                # 4. Se não tem número E não é URL de edital, provavelmente é notícia
                if not numero_edital and not eh_url_edital:
                    print(f"[SCRAPER] Ignorando (sem número/URL): {titulo[:40]}...")
                    continue

                # 5. Extrair órgão
                orgao = _extrair_orgao(titulo + " " + descricao)

                # Se não extraiu órgão, tentar extrair do título de forma mais simples
                if not orgao and '-' in titulo:
                    # Padrão comum: "Edital 123/2025 - Prefeitura de XYZ"
                    partes = titulo.split('-')
                    if len(partes) > 1:
                        orgao = partes[-1].strip()[:80]

                # Fallback: usar nome amigável da fonte
                if not orgao:
                    fonte_nomes = {
                        'www.administracao.pr.gov.br': 'Governo do Paraná',
                        'www.compras.rs.gov.br': 'Governo do Rio Grande do Sul',
                        'www.gov.br': 'Governo Federal',
                        'www.comprasnet.gov.br': 'ComprasNet - Gov Federal',
                        'www.licitacoes-e.com.br': 'Licitações-e (BB)',
                        'portaldecompraspublicas.com.br': 'Portal de Compras Públicas',
                        'www.comprasnet.ba.gov.br': 'Governo da Bahia',
                        'www.bec.sp.gov.br': 'BEC - Governo de São Paulo',
                        'www.compras.mg.gov.br': 'Governo de Minas Gerais',
                        'www.licitanet.com.br': 'LicitaNet',
                        'pncp.gov.br': 'PNCP - Portal Nacional'
                    }
                    orgao = fonte_nomes.get(fonte, fonte)

                # Usar título como fallback para número se não encontrou
                if not numero_edital:
                    # Tentar usar parte do título que parece ser identificador
                    numero_edital = titulo[:50] if len(titulo) < 60 else None

                edital_info = {
                    'fonte': fonte,
                    'titulo': titulo,
                    'link': link,
                    'descricao': descricao,
                    'numero': numero_edital,
                    'orgao': orgao,
                    'tipo': 'scraper'
                }
                todos_resultados.append(edital_info)
                resultados_fonte += 1

            print(f"[SCRAPER] {fonte}: {resultados_fonte} editais válidos (de {len(data.get('organic', []))} resultados)")

        except Exception as e:
            print(f"[SCRAPER] Erro em {fonte}: {e}")
            erros.append({"fonte": fonte, "erro": str(e)})

    # Remover duplicatas por link
    links_vistos = set()
    resultados_unicos = []
    for r in todos_resultados:
        if r['link'] not in links_vistos:
            links_vistos.add(r['link'])
            resultados_unicos.append(r)

    print(f"[SCRAPER] Total: {len(resultados_unicos)} editais únicos encontrados")

    return {
        "success": True,
        "termo": termo,
        "fontes_consultadas": fontes[:5],
        "total_resultados": len(resultados_unicos),
        "editais": resultados_unicos[:20],  # Top 20
        "erros": erros if erros else None
    }


def _extrair_numero_edital(texto: str) -> str:
    """Extrai número do edital do texto."""
    import re
    # Padrões comuns: PE 001/2025, Pregão 123/2025, Edital nº 456/2025
    padroes = [
        r'(?:PE|Pregão|PREGÃO|Edital|EDITAL)[:\s]*[Nn]?[ºo°]?\s*(\d+[/-]\d{4})',
        r'(?:PE|Pregão|PREGÃO)[:\s]*(\d+[/-]\d{4})',
        r'[Nn][ºo°]\s*(\d+[/-]\d{4})',
        r'(\d{1,5}[/-]20\d{2})',
    ]
    for padrao in padroes:
        match = re.search(padrao, texto)
        if match:
            return match.group(1)
    return None


def _extrair_orgao(texto: str) -> str:
    """Extrai nome do órgão do texto."""
    import re
    # Padrões comuns - ordem de prioridade
    padroes = [
        # Órgãos específicos
        r'(Prefeitura\s+(?:Municipal\s+)?(?:de\s+)?[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Secretaria\s+(?:de\s+)?(?:Estado\s+)?(?:da\s+)?[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Hospital\s+[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Universidade\s+[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Ministério\s+(?:da\s+|do\s+)?[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Governo\s+(?:do\s+)?(?:Estado\s+)?(?:de\s+)?[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Fundação\s+[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(Instituto\s+[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        r'(CELIC[A-Za-zÀ-ú\s\-]*)',  # Central de Licitações
        r'(Departamento\s+(?:de\s+)?[A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
        # Siglas de estados (fallback)
        r'(?:Estado\s+(?:do\s+|de\s+)?)([A-Za-zÀ-ú\s]+?)(?:\s*[-–,\.]|\s*$)',
    ]
    for padrao in padroes:
        match = re.search(padrao, texto, re.IGNORECASE)
        if match:
            orgao = match.group(1).strip()
            # Limpar e validar
            if len(orgao) > 5 and len(orgao) < 100:
                return orgao[:100]
    return None


def tool_download_arquivo(url: str, user_id: str, nome_produto: str = None) -> Dict[str, Any]:
    """
    Baixa arquivo de uma URL e salva localmente.
    """
    try:
        # Criar pasta de uploads se não existir
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Fazer download
        response = requests.get(url, timeout=60, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()

        # Determinar nome do arquivo
        filename = url.split('/')[-1].split('?')[0]
        if not filename.endswith('.pdf'):
            filename = f"{nome_produto or 'documento'}_{uuid.uuid4().hex[:8]}.pdf"

        filepath = os.path.join(UPLOAD_FOLDER, f"{user_id}_{filename}")

        with open(filepath, 'wb') as f:
            f.write(response.content)

        return {
            "success": True,
            "filepath": filepath,
            "filename": filename,
            "size": len(response.content)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def _extrair_texto_por_paginas(filepath: str) -> List[Dict[str, Any]]:
    """
    Extrai texto do PDF página por página.
    Retorna lista de dicts com número da página e texto.
    """
    paginas = []
    doc = fitz.open(filepath)
    for i, page in enumerate(doc):
        texto = page.get_text()
        paginas.append({
            "pagina": i + 1,
            "texto": texto,
            "chars": len(texto)
        })
    doc.close()
    return paginas


def _encontrar_paginas_specs(paginas: List[Dict[str, Any]]) -> str:
    """
    Busca inteligentemente as páginas que contêm especificações técnicas.
    Retorna o texto concatenado das páginas relevantes.
    """
    keywords_specs = [
        'especificações', 'specifications', 'technical data', 'dados técnicos',
        'características técnicas', 'informações técnicas', 'technical information',
        'dimensões', 'dimensions', 'peso', 'weight', 'voltagem', 'voltage',
        'alimentação', 'power supply', 'consumo', 'consumption', 'temperatura',
        'faixa de medição', 'range', 'precisão', 'accuracy', 'sensibilidade'
    ]

    paginas_relevantes = []

    for pag in paginas:
        texto_lower = pag["texto"].lower()
        score = sum(1 for kw in keywords_specs if kw in texto_lower)
        if score >= 2:  # Pelo menos 2 keywords
            paginas_relevantes.append((score, pag["pagina"], pag["texto"]))

    # Ordenar por score (mais relevantes primeiro)
    paginas_relevantes.sort(key=lambda x: x[0], reverse=True)

    # Pegar as 10 páginas mais relevantes
    texto_specs = ""
    for score, num, texto in paginas_relevantes[:10]:
        texto_specs += f"\n\n=== PÁGINA {num} ===\n{texto}"

    return texto_specs


def _extrair_specs_em_chunks(texto_completo: str, produto_id: str, db) -> List[Dict]:
    """
    Processa documento grande em chunks e extrai especificações.
    Usa contexto de 60000 tokens (~240000 chars) do DeepSeek.
    """
    MAX_CHUNK_SIZE = 60000  # Chars por chunk (conservador para ~15k tokens)
    specs_totais = []

    # Se texto cabe em um chunk, processar direto
    if len(texto_completo) <= MAX_CHUNK_SIZE:
        chunks = [texto_completo]
    else:
        # Dividir em chunks
        chunks = []
        for i in range(0, len(texto_completo), MAX_CHUNK_SIZE):
            chunks.append(texto_completo[i:i + MAX_CHUNK_SIZE])

    print(f"[TOOLS] Processando {len(chunks)} chunk(s) de specs")

    for i, chunk in enumerate(chunks):
        print(f"[TOOLS] Processando chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")

        prompt = PROMPT_EXTRAIR_SPECS.format(texto=chunk)
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=16000)

        try:
            specs = _extrair_json_array(resposta)
            if specs:
                print(f"[TOOLS] Chunk {i+1}: {len(specs)} specs encontradas")

                for spec in specs:
                    # Aceitar tanto 'nome_especificacao' quanto 'nome'
                    nome_spec = spec.get('nome_especificacao') or spec.get('nome') or 'N/A'

                    # Evitar duplicatas
                    if not any((s.get('nome_especificacao') or s.get('nome')) == nome_spec for s in specs_totais):
                        spec_obj = ProdutoEspecificacao(
                            produto_id=produto_id,
                            nome_especificacao=nome_spec,
                            valor=spec.get('valor', 'N/A'),
                            unidade=spec.get('unidade'),
                            valor_numerico=spec.get('valor_numerico'),
                            operador=spec.get('operador'),
                            valor_min=spec.get('valor_min'),
                            valor_max=spec.get('valor_max')
                        )
                        db.add(spec_obj)
                        # Normalizar o spec para usar nome_especificacao
                        spec['nome_especificacao'] = nome_spec
                        specs_totais.append(spec)
        except json.JSONDecodeError as e:
            print(f"[TOOLS] Erro ao parsear chunk {i+1}: {e}")

    return specs_totais


def tool_processar_upload(filepath: str, user_id: str, nome_produto: str = None,
                          categoria: str = None, fabricante: str = None,
                          modelo: str = None) -> Dict[str, Any]:
    """
    Processa um arquivo PDF uploadado:
    1. Extrai texto com PyMuPDF (todas as páginas)
    2. Busca inteligentemente páginas com especificações
    3. Usa IA para identificar nome do produto, fabricante e especificações
    4. Processa em chunks se necessário
    5. Salva produto e specs no banco
    """
    db = get_db()
    try:
        # 1. Extrair texto do PDF página por página
        print(f"[TOOLS] Extraindo texto do PDF: {filepath}")
        paginas = _extrair_texto_por_paginas(filepath)
        texto_completo = "\n".join([p["texto"] for p in paginas])

        if not texto_completo.strip():
            return {"success": False, "error": "Não foi possível extrair texto do PDF"}

        print(f"[TOOLS] PDF: {len(paginas)} páginas, {len(texto_completo)} caracteres")

        # 2. Se não tem nome do produto, extrair automaticamente via IA
        if not nome_produto or nome_produto.strip() == "":
            print(f"[TOOLS] Extraindo info do produto automaticamente...")
            # Usar primeiras páginas para identificar produto
            texto_inicio = texto_completo[:10000]
            info_produto = _extrair_info_produto(texto_inicio)
            print(f"[TOOLS] Info extraída: {info_produto}")
            nome_produto = info_produto.get("nome", "Produto sem nome")
            if not fabricante:
                fabricante = info_produto.get("fabricante")
            if not modelo:
                modelo = info_produto.get("modelo")
            if not categoria:
                categoria = info_produto.get("categoria", "equipamento")

        # Garantir categoria válida
        categorias_validas = ['equipamento', 'reagente', 'insumo_hospitalar', 'insumo_laboratorial',
                             'informatica', 'redes', 'mobiliario', 'eletronico', 'outro']
        if not categoria or categoria not in categorias_validas:
            categoria = "equipamento"

        # 3. Verificar se produto já existe (mesmo nome + mesmo usuário)
        # Normalizar nome para comparação (remover espaços extras, lowercase)
        import unicodedata
        def normalizar_nome(nome):
            if not nome:
                return ""
            # Remover acentos
            nome = unicodedata.normalize('NFKD', nome).encode('ASCII', 'ignore').decode('ASCII')
            # Lowercase e remover espaços extras
            nome = ' '.join(nome.lower().split())
            return nome

        nome_normalizado = normalizar_nome(nome_produto)

        # Buscar todos os produtos do usuário para comparação normalizada
        produtos_usuario = db.query(Produto).filter(Produto.user_id == user_id).all()
        produto_existente = None

        for p in produtos_usuario:
            # Comparar nome normalizado
            if normalizar_nome(p.nome) == nome_normalizado:
                produto_existente = p
                break
            # Comparar modelo se disponível
            if modelo and p.modelo and normalizar_nome(p.modelo) == normalizar_nome(modelo):
                produto_existente = p
                break

        if produto_existente:
            return {
                "success": False,
                "error": f"Produto já cadastrado: '{produto_existente.nome}' (ID: {produto_existente.id})",
                "duplicado": True,
                "produto_existente": {
                    "id": produto_existente.id,
                    "nome": produto_existente.nome,
                    "modelo": produto_existente.modelo,
                    "fabricante": produto_existente.fabricante
                }
            }

        # 4. Criar produto no banco
        produto = Produto(
            user_id=user_id,
            nome=nome_produto,
            categoria=categoria,
            fabricante=fabricante,
            modelo=modelo
        )
        db.add(produto)
        db.flush()

        # 4. Salvar documento (texto completo)
        doc_registro = ProdutoDocumento(
            produto_id=produto.id,
            tipo='manual',
            nome_arquivo=os.path.basename(filepath),
            path_arquivo=filepath,
            texto_extraido=texto_completo,  # Texto completo
            processado=False
        )
        db.add(doc_registro)

        # 5. Buscar páginas com especificações
        print(f"[TOOLS] Buscando páginas com especificações técnicas...")
        texto_specs = _encontrar_paginas_specs(paginas)

        if not texto_specs:
            # Fallback: usar últimas páginas (onde geralmente ficam as specs)
            print(f"[TOOLS] Nenhuma página de specs encontrada, usando últimas páginas")
            ultimas_paginas = paginas[-20:] if len(paginas) > 20 else paginas
            texto_specs = "\n".join([p["texto"] for p in ultimas_paginas])

        print(f"[TOOLS] Texto de specs: {len(texto_specs)} caracteres")

        # 6. Extrair especificações em chunks
        specs_salvas = _extrair_specs_em_chunks(texto_specs, produto.id, db)

        # 7. Marcar documento como processado
        doc_registro.processado = True
        db.commit()

        return {
            "success": True,
            "produto_id": produto.id,
            "nome": nome_produto,
            "specs_extraidas": len(specs_salvas),
            "specs": specs_salvas[:10],  # Retornar primeiras 10
            # Adicionar estrutura completa para o app.py
            "produto": {
                "id": produto.id,
                "nome": nome_produto,
                "fabricante": fabricante,
                "modelo": modelo,
                "categoria": categoria
            },
            "especificacoes": specs_salvas
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_extrair_especificacoes(texto: str, produto_id: str, user_id: str) -> Dict[str, Any]:
    """
    Extrai especificações de um texto e salva no banco.
    """
    db = get_db()
    try:
        # Verificar se produto existe e pertence ao usuário
        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        if not produto:
            return {"success": False, "error": "Produto não encontrado"}

        # Extrair specs com IA
        prompt = PROMPT_EXTRAIR_SPECS.format(texto=texto[:15000])
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=8000)

        specs_salvas = []
        try:
            specs = _extrair_json_array(resposta)
            if specs:
                for spec in specs:
                    spec_obj = ProdutoEspecificacao(
                        produto_id=produto_id,
                        nome_especificacao=spec.get('nome_especificacao', 'N/A'),
                        valor=spec.get('valor', 'N/A'),
                        unidade=spec.get('unidade'),
                        valor_numerico=spec.get('valor_numerico'),
                        operador=spec.get('operador'),
                        valor_min=spec.get('valor_min'),
                        valor_max=spec.get('valor_max')
                    )
                    db.add(spec_obj)
                    specs_salvas.append(spec)
                db.commit()
        except json.JSONDecodeError:
            pass

        return {
            "success": True,
            "produto_id": produto_id,
            "specs_extraidas": len(specs_salvas)
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_reprocessar_produto(produto_id: str, user_id: str) -> Dict[str, Any]:
    """
    Reprocessa um produto existente para extrair especificações novamente.
    Útil quando a extração inicial falhou ou foi incompleta.
    Usa o documento já salvo no banco.
    """
    db = get_db()
    try:
        # Verificar se produto existe e pertence ao usuário
        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        if not produto:
            return {"success": False, "error": "Produto não encontrado"}

        # Buscar documento do produto
        documento = db.query(ProdutoDocumento).filter(
            ProdutoDocumento.produto_id == produto_id
        ).first()

        if not documento:
            return {"success": False, "error": "Documento do produto não encontrado"}

        # Se tem arquivo, reprocessar do arquivo
        if documento.path_arquivo and os.path.exists(documento.path_arquivo):
            print(f"[TOOLS] Reprocessando produto do arquivo: {documento.path_arquivo}")
            paginas = _extrair_texto_por_paginas(documento.path_arquivo)
            texto_specs = _encontrar_paginas_specs(paginas)

            if not texto_specs:
                ultimas_paginas = paginas[-20:] if len(paginas) > 20 else paginas
                texto_specs = "\n".join([p["texto"] for p in ultimas_paginas])
        elif documento.texto_extraido:
            # Usar texto salvo
            texto_specs = documento.texto_extraido
        else:
            return {"success": False, "error": "Nenhum texto disponível para reprocessar"}

        # Limpar specs antigas
        db.query(ProdutoEspecificacao).filter(
            ProdutoEspecificacao.produto_id == produto_id
        ).delete()

        # Extrair novas specs
        print(f"[TOOLS] Reprocessando specs ({len(texto_specs)} chars)")
        specs_salvas = _extrair_specs_em_chunks(texto_specs, produto_id, db)

        db.commit()

        return {
            "success": True,
            "produto_id": produto_id,
            "produto_nome": produto.nome,
            "specs_extraidas": len(specs_salvas),
            "specs": specs_salvas[:20]
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_atualizar_produto(produto_id: str, user_id: str, nome: str = None,
                           fabricante: str = None, modelo: str = None,
                           categoria: str = None) -> Dict[str, Any]:
    """
    Atualiza informações de um produto existente.
    """
    db = get_db()
    try:
        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        if not produto:
            return {"success": False, "error": "Produto não encontrado"}

        if nome:
            produto.nome = nome
        if fabricante:
            produto.fabricante = fabricante
        if modelo:
            produto.modelo = modelo
        if categoria:
            categorias_validas = ['equipamento', 'reagente', 'insumo_hospitalar', 'insumo_laboratorial',
                                 'informatica', 'redes', 'mobiliario', 'eletronico', 'outro']
            if categoria in categorias_validas:
                produto.categoria = categoria

        db.commit()

        return {
            "success": True,
            "produto": {
                "id": produto.id,
                "nome": produto.nome,
                "fabricante": produto.fabricante,
                "modelo": produto.modelo,
                "categoria": produto.categoria
            }
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_excluir_produto(produto_id: str, user_id: str) -> Dict[str, Any]:
    """
    Exclui um produto e todas suas especificações e documentos associados.
    """
    db = get_db()
    try:
        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        if not produto:
            return {"success": False, "error": "Produto não encontrado"}

        nome_produto = produto.nome

        # Excluir especificações associadas
        db.query(ProdutoEspecificacao).filter(
            ProdutoEspecificacao.produto_id == produto_id
        ).delete()

        # Excluir documentos associados
        db.query(ProdutoDocumento).filter(
            ProdutoDocumento.produto_id == produto_id
        ).delete()

        # Excluir análises associadas
        db.query(Analise).filter(
            Analise.produto_id == produto_id
        ).delete()

        # Excluir o produto
        db.delete(produto)
        db.commit()

        return {
            "success": True,
            "message": f"Produto '{nome_produto}' excluído com sucesso, incluindo especificações, documentos e análises associadas."
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_excluir_edital(edital_id: str, user_id: str) -> Dict[str, Any]:
    """
    Exclui um edital e todos seus requisitos e análises associados.
    """
    db = get_db()
    try:
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not edital:
            return {"success": False, "error": "Edital não encontrado"}

        numero_edital = edital.numero

        # Excluir requisitos associados
        db.query(EditalRequisito).filter(
            EditalRequisito.edital_id == edital_id
        ).delete()

        # Excluir documentos associados
        db.query(EditalDocumento).filter(
            EditalDocumento.edital_id == edital_id
        ).delete()

        # Excluir análises associadas
        db.query(Analise).filter(
            Analise.edital_id == edital_id
        ).delete()

        # Excluir detalhes de análise (se existirem análises com detalhes)
        # Primeiro buscar IDs das análises
        analise_ids = [a.id for a in db.query(Analise.id).filter(Analise.edital_id == edital_id).all()]
        if analise_ids:
            db.query(AnaliseDetalhe).filter(
                AnaliseDetalhe.analise_id.in_(analise_ids)
            ).delete(synchronize_session=False)

        # Excluir o edital
        db.delete(edital)
        db.commit()

        return {
            "success": True,
            "message": f"Edital '{numero_edital}' excluído com sucesso, incluindo requisitos, documentos e análises associadas."
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_excluir_editais_multiplos(edital_ids: List[str], user_id: str) -> Dict[str, Any]:
    """
    Exclui múltiplos editais de uma vez.
    """
    db = get_db()
    try:
        excluidos = []
        erros = []

        for edital_id in edital_ids:
            resultado = tool_excluir_edital(edital_id, user_id)
            if resultado.get("success"):
                excluidos.append(edital_id)
            else:
                erros.append({"id": edital_id, "erro": resultado.get("error")})

        return {
            "success": len(excluidos) > 0,
            "excluidos": len(excluidos),
            "erros": len(erros),
            "detalhes_erros": erros if erros else None,
            "message": f"{len(excluidos)} edital(is) excluído(s) com sucesso." + (f" {len(erros)} erro(s)." if erros else "")
        }
    finally:
        db.close()


def tool_atualizar_edital(edital_id: str, user_id: str, numero: str = None,
                          orgao: str = None, objeto: str = None,
                          modalidade: str = None, status: str = None,
                          valor_referencia: float = None,
                          data_abertura: str = None) -> Dict[str, Any]:
    """
    Atualiza informações de um edital existente.
    """
    db = get_db()
    try:
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not edital:
            return {"success": False, "error": "Edital não encontrado"}

        if numero:
            edital.numero = numero
        if orgao:
            edital.orgao = orgao
        if objeto:
            edital.objeto = objeto
        if modalidade:
            modalidades_validas = ['pregao_eletronico', 'pregao_presencial', 'concorrencia',
                                   'tomada_precos', 'convite', 'dispensa', 'inexigibilidade']
            if modalidade in modalidades_validas:
                edital.modalidade = modalidade
        if status:
            status_validos = ['novo', 'analisando', 'participar', 'nao_participar',
                             'proposta_enviada', 'ganho', 'perdido', 'cancelado']
            if status in status_validos:
                edital.status = status
        if valor_referencia is not None:
            edital.valor_referencia = valor_referencia
        if data_abertura:
            from datetime import datetime
            try:
                edital.data_abertura = datetime.strptime(data_abertura, "%Y-%m-%d")
            except:
                pass  # Ignorar se formato inválido

        db.commit()

        return {
            "success": True,
            "edital": {
                "id": edital.id,
                "numero": edital.numero,
                "orgao": edital.orgao,
                "objeto": edital.objeto[:100] + "..." if len(edital.objeto or '') > 100 else edital.objeto,
                "modalidade": edital.modalidade,
                "status": edital.status,
                "valor_referencia": float(edital.valor_referencia) if edital.valor_referencia else None
            }
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_cadastrar_fonte(nome: str, tipo: str, url_base: str,
                         descricao: str = None, api_key: str = None) -> Dict[str, Any]:
    """
    Cadastra uma nova fonte de editais no banco.
    Verifica duplicatas por nome ou URL.
    """
    db = get_db()
    try:
        # Verificar se já existe fonte com mesmo nome ou URL
        fonte_existente = db.query(FonteEdital).filter(
            (FonteEdital.nome.ilike(nome)) |
            (FonteEdital.url_base == url_base)
        ).first()

        if fonte_existente:
            return {
                "success": False,
                "error": f"Fonte já cadastrada: '{fonte_existente.nome}' ({fonte_existente.url_base})",
                "duplicada": True,
                "fonte_existente": {
                    "id": fonte_existente.id,
                    "nome": fonte_existente.nome,
                    "url": fonte_existente.url_base
                }
            }

        fonte = FonteEdital(
            nome=nome,
            tipo=tipo,
            url_base=url_base,
            descricao=descricao,
            api_key=api_key,
            ativo=True
        )
        db.add(fonte)
        db.commit()

        return {
            "success": True,
            "fonte_id": fonte.id,
            "nome": nome,
            "message": f"Fonte '{nome}' cadastrada com sucesso!"
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_listar_fontes() -> Dict[str, Any]:
    """
    Lista todas as fontes de editais cadastradas.
    """
    db = get_db()
    try:
        fontes = db.query(FonteEdital).filter(FonteEdital.ativo == True).all()
        return {
            "success": True,
            "fontes": [f.to_dict() for f in fontes],
            "total": len(fontes)
        }
    finally:
        db.close()


def tool_buscar_editais_fonte(fonte: str, termo: str, user_id: str,
                               uf: str = None, modalidade: str = None) -> Dict[str, Any]:
    """
    Busca editais em uma fonte específica (PNCP).
    """
    from datetime import timedelta

    db = get_db()
    try:
        # Buscar fonte no banco
        fonte_obj = db.query(FonteEdital).filter(
            (FonteEdital.id == fonte) | (FonteEdital.nome.ilike(f"%{fonte}%"))
        ).first()

        if not fonte_obj:
            return {"success": False, "error": f"Fonte '{fonte}' não encontrada"}

        editais_encontrados = []

        if 'PNCP' in fonte_obj.nome.upper():
            # API do PNCP - endpoint de busca com parâmetros obrigatórios
            try:
                # Datas de PUBLICAÇÃO: últimos 180 dias
                data_final = datetime.now()
                data_inicial = data_final - timedelta(days=180)

                base_params = {
                    "dataInicial": data_inicial.strftime("%Y%m%d"),
                    "dataFinal": data_final.strftime("%Y%m%d"),
                    "codigoModalidadeContratacao": 6,  # 6 = Pregão Eletrônico
                    "tamanhoPagina": 50
                }
                if uf:
                    base_params["uf"] = uf.upper()

                # Data atual para filtrar apenas editais EM ABERTO
                hoje = datetime.now()

                print(f"[TOOLS] Buscando PNCP: {PNCP_BASE_URL}/contratacoes/publicacao")
                print(f"[TOOLS] Termo de busca: '{termo}'")

                # Buscar múltiplas páginas até encontrar 10 editais ou esgotar 5 páginas
                all_items = []
                for pagina in range(1, 6):  # Páginas 1 a 5
                    params = {**base_params, "pagina": pagina}

                    response = requests.get(
                        f"{PNCP_BASE_URL}/contratacoes/publicacao",
                        params=params,
                        timeout=30,
                        headers={"Accept": "application/json"}
                    )

                    if response.status_code == 200 and response.text:
                        data = response.json()
                        items = data.get('data', [])
                        all_items.extend(items)
                        print(f"[TOOLS] Página {pagina}: +{len(items)} itens (total: {len(all_items)})")

                        # Se não há mais páginas, parar
                        if not items or data.get('paginasRestantes', 0) == 0:
                            break
                    else:
                        break

                print(f"[TOOLS] PNCP total coletado: {len(all_items)} itens")
                items = all_items

                # Expandir termo para termos relacionados (mais específicos)
                termo_lower = termo.lower()
                termos_busca = [termo_lower]

                # Expandir termos de TI/tecnologia - termos ESPECÍFICOS para evitar falsos positivos
                if any(t in termo_lower for t in ['tecnologia', 'ti', 'informática', 'informatica', 'computador', 'computação']):
                    termos_busca.extend([
                        'tecnologia da informação', 'informática', 'informatica',
                        'computador', 'computadores', 'desktop', 'notebook', 'laptop',
                        'software', 'sistema de informação', 'sistema de gestão',
                        'hardware', 'servidor de rede', 'servidor de dados',
                        'monitor de vídeo', 'monitor led', 'monitor lcd',
                        'impressora', 'scanner', 'nobreak', 'switch', 'roteador',
                        'rede de dados', 'rede lógica', 'cabeamento estruturado',
                        'licença de software', 'suporte técnico de ti',
                        'equipamentos de informática', 'equipamento de ti'
                    ])

                # Expandir termos médicos/hospitalares
                if any(t in termo_lower for t in ['médic', 'medic', 'hospital', 'saúde', 'saude', 'reagente',
                                                   'clínic', 'clinic', 'enferm', 'cirurg', 'odonto', 'farma',
                                                   'laborat', 'diagnóstic', 'diagnostic']):
                    termos_busca.extend([
                        'médico', 'medico', 'médica', 'medica',
                        'hospitalar', 'hospital', 'clínica', 'clinica',
                        'saúde', 'saude', 'reagente', 'reagentes',
                        'laboratorio', 'laboratório', 'medicamento', 'medicamentos',
                        'equipamento médico', 'equipamento hospitalar',
                        'material hospitalar', 'insumo hospitalar',
                        'enfermagem', 'cirúrgico', 'cirurgico', 'odontológico', 'odontologico',
                        'farmácia', 'farmacia', 'diagnóstico', 'diagnostico',
                        'desfibrilador', 'monitor multiparâmetro', 'autoclave', 'oxímetro',
                        'eletrocardiógrafo', 'bomba de infusão', 'cama hospitalar', 'maca',
                        'upa', 'ubs', 'pronto socorro', 'uti'
                    ])

                print(f"[TOOLS] Termos de busca expandidos: {termos_busca[:8]}...")

                # Filtrar por termos de busca no objeto E por data de abertura futura
                editais_em_aberto = 0
                editais_encerrados = 0

                for item in items:
                    # FILTRO 1: Verificar se edital está EM ABERTO (data de abertura futura)
                    data_abertura_str = item.get('dataAberturaProposta')
                    if data_abertura_str:
                        try:
                            # Formato: "2025-11-03T08:00:00"
                            data_abertura = datetime.fromisoformat(data_abertura_str.replace('Z', ''))
                            if data_abertura < hoje:
                                editais_encerrados += 1
                                continue  # Pular editais já encerrados
                        except (ValueError, TypeError):
                            pass  # Se não conseguir parsear, inclui mesmo assim

                    objeto = (item.get('objetoCompra', '') or '').lower()

                    # FILTRO 2: Verificar se algum termo está no objeto
                    match = any(t in objeto for t in termos_busca)
                    if termo and not match:
                        continue

                    editais_em_aberto += 1

                    # Extrair dados do item
                    orgao_data = item.get('orgaoEntidade', {}) or {}
                    numero_pncp = item.get('numeroControlePNCP', '')

                    # Construir link se não existir
                    link = item.get('linkSistemaOrigem')
                    if not link and numero_pncp:
                        link = f"https://pncp.gov.br/app/editais/{numero_pncp}"

                    # Mapear modalidade da API para ENUM do banco
                    modalidade_api = (item.get('modalidadeNome', '') or '').lower()
                    if 'eletrônico' in modalidade_api or 'eletronico' in modalidade_api:
                        modalidade_db = 'pregao_eletronico'
                    elif 'presencial' in modalidade_api:
                        modalidade_db = 'pregao_presencial'
                    elif 'concorrência' in modalidade_api or 'concorrencia' in modalidade_api:
                        modalidade_db = 'concorrencia'
                    elif 'tomada' in modalidade_api:
                        modalidade_db = 'tomada_precos'
                    elif 'convite' in modalidade_api:
                        modalidade_db = 'convite'
                    elif 'dispensa' in modalidade_api:
                        modalidade_db = 'dispensa'
                    elif 'inexigibilidade' in modalidade_api:
                        modalidade_db = 'inexigibilidade'
                    else:
                        modalidade_db = 'pregao_eletronico'  # default

                    # NÃO salvar - apenas criar dict com dados para retornar
                    edital_data = {
                        "numero": item.get('numeroCompra', 'N/A'),
                        "orgao": orgao_data.get('razaoSocial', 'N/A'),
                        "orgao_tipo": 'municipal' if orgao_data.get('esferaId') == 'M' else 'federal',
                        "uf": orgao_data.get('uf'),
                        "objeto": objeto[:500] if objeto else f"Contratação - {termo}",
                        "modalidade": modalidade_db,
                        "valor_referencia": item.get('valorTotalEstimado'),
                        "data_publicacao": item.get('dataPublicacaoPncp'),
                        "data_abertura": item.get('dataAberturaProposta'),
                        "fonte": 'PNCP',
                        "url": link,
                        "numero_pncp": numero_pncp,  # Para deduplicação posterior
                    }
                    editais_encontrados.append(edital_data)
                    print(f"[TOOLS] + Edital: {edital_data['numero']} - {edital_data['orgao'][:30]}")

                    if len(editais_encontrados) >= 10:
                        break

                print(f"[TOOLS] Encontrados {len(editais_encontrados)} editais EM ABERTO (filtrados {editais_encerrados} já encerrados)")

            except Exception as e:
                print(f"[TOOLS] Erro ao buscar PNCP: {e}")
                import traceback
                traceback.print_exc()

        # Se não encontrou na API, buscar editais existentes no banco que correspondam ao termo
        if not editais_encontrados:
            print(f"[TOOLS] Buscando no banco local por '{termo}'")
            editais_db = db.query(Edital).filter(
                Edital.user_id == user_id,
                Edital.objeto.ilike(f"%{termo}%")
            ).order_by(Edital.created_at.desc()).limit(10).all()

            if editais_db:
                editais_encontrados = [e.to_dict() for e in editais_db]
            else:
                # Não criar fake - informar que não encontrou
                return {
                    "success": True,
                    "fonte": fonte_obj.nome,
                    "termo": termo,
                    "editais": [],
                    "total": 0,
                    "mensagem": f"Nenhum edital encontrado para '{termo}'. A API do PNCP pode estar indisponível ou não há editais recentes com esse termo."
                }

        # NÃO faz commit - não salvou nada no banco
        return {
            "success": True,
            "fonte": fonte_obj.nome,
            "termo": termo,
            "editais": editais_encontrados,  # Já são dicts, não precisa converter
            "total": len(editais_encontrados)
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_extrair_requisitos(edital_id: str, texto: str, user_id: str) -> Dict[str, Any]:
    """
    Extrai requisitos de um texto de edital e salva no banco.
    """
    db = get_db()
    try:
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not edital:
            return {"success": False, "error": "Edital não encontrado"}

        # Classificar edital
        prompt_class = PROMPT_CLASSIFICAR_EDITAL.format(objeto=edital.objeto)
        categoria = call_deepseek([{"role": "user", "content": prompt_class}], max_tokens=50)
        categoria = categoria.strip().lower()
        if categoria in ['comodato', 'venda_equipamento', 'aluguel_com_consumo',
                         'aluguel_sem_consumo', 'consumo_reagentes', 'consumo_insumos', 'servicos']:
            edital.categoria = categoria

        # Extrair requisitos com IA
        prompt = PROMPT_EXTRAIR_REQUISITOS.format(texto=texto[:15000])
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=8000)

        requisitos_salvos = []
        try:
            requisitos = _extrair_json_array(resposta)
            if requisitos:
                for req in requisitos:
                    req_obj = EditalRequisito(
                        edital_id=edital_id,
                        tipo=req.get('tipo', 'tecnico'),
                        descricao=req.get('descricao', 'N/A'),
                        nome_especificacao=req.get('nome_especificacao'),
                        valor_exigido=req.get('valor_exigido'),
                        operador=req.get('operador'),
                        valor_numerico=req.get('valor_numerico'),
                        obrigatorio=req.get('obrigatorio', True)
                    )
                    db.add(req_obj)
                    requisitos_salvos.append(req)
                db.commit()
        except json.JSONDecodeError:
            pass

        return {
            "success": True,
            "edital_id": edital_id,
            "categoria": edital.categoria,
            "requisitos_extraidos": len(requisitos_salvos)
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_listar_editais(user_id: str, status: str = None,
                        uf: str = None, categoria: str = None) -> Dict[str, Any]:
    """
    Lista editais salvos do usuário com filtros opcionais.
    """
    db = get_db()
    try:
        query = db.query(Edital).filter(Edital.user_id == user_id)

        if status:
            query = query.filter(Edital.status == status)
        if uf:
            query = query.filter(Edital.uf == uf.upper())
        if categoria:
            query = query.filter(Edital.categoria == categoria)

        editais = query.order_by(Edital.created_at.desc()).limit(50).all()

        return {
            "success": True,
            "editais": [e.to_dict() for e in editais],
            "total": len(editais)
        }
    finally:
        db.close()


def tool_listar_produtos(user_id: str, categoria: str = None,
                         nome: str = None) -> Dict[str, Any]:
    """
    Lista produtos do usuário com filtros opcionais.
    """
    db = get_db()
    try:
        query = db.query(Produto).filter(Produto.user_id == user_id)

        if categoria:
            query = query.filter(Produto.categoria == categoria)
        if nome:
            query = query.filter(Produto.nome.ilike(f"%{nome}%"))

        produtos = query.order_by(Produto.created_at.desc()).all()

        return {
            "success": True,
            "produtos": [p.to_dict(include_specs=True) for p in produtos],
            "total": len(produtos)
        }
    finally:
        db.close()


def tool_calcular_aderencia(produto_id: str, edital_id: str, user_id: str) -> Dict[str, Any]:
    """
    Calcula a aderência de um produto a um edital.
    Compara especificações do produto com requisitos do edital.
    """
    db = get_db()
    try:
        # Buscar produto e edital
        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not produto:
            return {"success": False, "error": "Produto não encontrado"}
        if not edital:
            return {"success": False, "error": "Edital não encontrado"}

        # Buscar specs e requisitos
        specs = db.query(ProdutoEspecificacao).filter(
            ProdutoEspecificacao.produto_id == produto_id
        ).all()

        requisitos = db.query(EditalRequisito).filter(
            EditalRequisito.edital_id == edital_id
        ).all()

        if not requisitos:
            return {"success": False, "error": "Edital não possui requisitos cadastrados"}

        # Criar análise
        analise = Analise(
            edital_id=edital_id,
            produto_id=produto_id,
            user_id=user_id,
            requisitos_total=len(requisitos)
        )
        db.add(analise)
        db.flush()

        # Analisar cada requisito
        atendidos = 0
        parciais = 0
        nao_atendidos = 0
        detalhes = []

        specs_dict = {s.nome_especificacao.lower(): s for s in specs}

        for req in requisitos:
            status = 'nao_atendido'
            valor_produto = None
            justificativa = "Especificação não encontrada no produto"
            spec_encontrada = None

            # Tentar encontrar spec correspondente
            if req.nome_especificacao:
                nome_lower = req.nome_especificacao.lower()
                # Busca exata
                if nome_lower in specs_dict:
                    spec_encontrada = specs_dict[nome_lower]
                else:
                    # Busca parcial
                    for nome, spec in specs_dict.items():
                        if nome_lower in nome or nome in nome_lower:
                            spec_encontrada = spec
                            break

            if spec_encontrada:
                valor_produto = spec_encontrada.valor

                # Comparar valores
                if req.valor_numerico and spec_encontrada.valor_numerico:
                    req_val = float(req.valor_numerico)
                    prod_val = float(spec_encontrada.valor_numerico)

                    if req.operador == '<=':
                        if prod_val <= req_val:
                            status = 'atendido'
                            justificativa = f"Produto ({prod_val}) ≤ Exigido ({req_val})"
                        else:
                            status = 'nao_atendido'
                            justificativa = f"Produto ({prod_val}) > Exigido ({req_val})"
                    elif req.operador == '>=':
                        if prod_val >= req_val:
                            status = 'atendido'
                            justificativa = f"Produto ({prod_val}) ≥ Exigido ({req_val})"
                        else:
                            status = 'nao_atendido'
                            justificativa = f"Produto ({prod_val}) < Exigido ({req_val})"
                    elif req.operador == '=':
                        if abs(prod_val - req_val) < 0.001:
                            status = 'atendido'
                            justificativa = f"Produto ({prod_val}) = Exigido ({req_val})"
                        else:
                            status = 'parcial'
                            justificativa = f"Produto ({prod_val}) ≠ Exigido ({req_val})"
                    else:
                        # Sem operador específico, considerar parcial
                        status = 'parcial'
                        justificativa = f"Especificação encontrada: {valor_produto}"
                else:
                    # Não numérico, considerar atendido se encontrou
                    status = 'atendido'
                    justificativa = f"Especificação encontrada: {valor_produto}"

            # Contar
            if status == 'atendido':
                atendidos += 1
            elif status == 'parcial':
                parciais += 1
            else:
                nao_atendidos += 1

            # Salvar detalhe
            detalhe = AnaliseDetalhe(
                analise_id=analise.id,
                requisito_id=req.id,
                especificacao_id=spec_encontrada.id if spec_encontrada else None,
                status=status,
                valor_exigido=req.valor_exigido,
                valor_produto=valor_produto,
                justificativa=justificativa
            )
            db.add(detalhe)
            detalhes.append({
                "requisito": req.descricao[:100],
                "status": status,
                "justificativa": justificativa
            })

        # Calcular scores
        total = len(requisitos)
        score_tecnico = ((atendidos + parciais * 0.5) / total) * 100 if total > 0 else 0

        analise.requisitos_atendidos = atendidos
        analise.requisitos_parciais = parciais
        analise.requisitos_nao_atendidos = nao_atendidos
        analise.score_tecnico = Decimal(str(round(score_tecnico, 2)))
        analise.score_final = analise.score_tecnico  # Por enquanto, só score técnico

        # Gerar recomendação
        if score_tecnico >= 80:
            analise.recomendacao = "RECOMENDADO participar. Alta aderência técnica."
        elif score_tecnico >= 50:
            analise.recomendacao = "AVALIAR participação. Aderência média, verificar requisitos não atendidos."
        else:
            analise.recomendacao = "NÃO RECOMENDADO. Baixa aderência técnica."

        edital.status = 'analisando'
        db.commit()

        return {
            "success": True,
            "analise_id": analise.id,
            "produto": produto.nome,
            "edital": edital.numero,
            "score_tecnico": float(analise.score_tecnico),
            "requisitos_total": total,
            "requisitos_atendidos": atendidos,
            "requisitos_parciais": parciais,
            "requisitos_nao_atendidos": nao_atendidos,
            "recomendacao": analise.recomendacao,
            "detalhes": detalhes[:10]  # Primeiros 10
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_gerar_proposta(edital_id: str, produto_id: str, user_id: str,
                        preco: float = None) -> Dict[str, Any]:
    """
    Gera uma proposta técnica para um edital.
    """
    db = get_db()
    try:
        # Buscar dados
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        produto = db.query(Produto).filter(
            Produto.id == produto_id,
            Produto.user_id == user_id
        ).first()

        if not edital:
            return {"success": False, "error": "Edital não encontrado"}
        if not produto:
            return {"success": False, "error": "Produto não encontrado"}

        # Buscar análise existente
        analise = db.query(Analise).filter(
            Analise.edital_id == edital_id,
            Analise.produto_id == produto_id
        ).first()

        # Buscar specs do produto
        specs = db.query(ProdutoEspecificacao).filter(
            ProdutoEspecificacao.produto_id == produto_id
        ).all()
        specs_texto = "\n".join([f"- {s.nome_especificacao}: {s.valor}" for s in specs])

        # Buscar análise de requisitos
        analise_texto = "Análise não disponível"
        if analise:
            detalhes = db.query(AnaliseDetalhe).filter(
                AnaliseDetalhe.analise_id == analise.id
            ).all()
            analise_texto = "\n".join([
                f"- {d.justificativa} ({d.status})" for d in detalhes
            ])

        # Gerar proposta com IA
        prompt = PROMPT_GERAR_PROPOSTA.format(
            numero_edital=edital.numero,
            orgao=edital.orgao,
            objeto=edital.objeto,
            nome_produto=produto.nome,
            fabricante=produto.fabricante or "N/A",
            modelo=produto.modelo or "N/A",
            especificacoes=specs_texto or "Não disponível",
            analise_requisitos=analise_texto,
            preco=f"{preco:,.2f}" if preco else "A definir"
        )

        texto_proposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=16000)

        # Salvar proposta
        proposta = Proposta(
            edital_id=edital_id,
            produto_id=produto_id,
            analise_id=analise.id if analise else None,
            user_id=user_id,
            texto_tecnico=texto_proposta,
            preco_unitario=Decimal(str(preco)) if preco else None,
            preco_total=Decimal(str(preco)) if preco else None,
            quantidade=1,
            status='rascunho'
        )
        db.add(proposta)
        db.commit()

        return {
            "success": True,
            "proposta_id": proposta.id,
            "edital": edital.numero,
            "produto": produto.nome,
            "texto_proposta": texto_proposta,
            "status": "rascunho"
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


# ==================== MAPEAMENTO DE TOOLS ====================

TOOLS_MAP = {
    "web_search": tool_web_search,
    "download_arquivo": tool_download_arquivo,
    "processar_upload": tool_processar_upload,
    "extrair_especificacoes": tool_extrair_especificacoes,
    "cadastrar_fonte": tool_cadastrar_fonte,
    "listar_fontes": tool_listar_fontes,
    "buscar_editais_fonte": tool_buscar_editais_fonte,
    "extrair_requisitos": tool_extrair_requisitos,
    "listar_editais": tool_listar_editais,
    "listar_produtos": tool_listar_produtos,
    "calcular_aderencia": tool_calcular_aderencia,
    "gerar_proposta": tool_gerar_proposta,
}


def execute_tool(tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executa uma tool pelo nome.
    """
    if tool_name not in TOOLS_MAP:
        return {"success": False, "error": f"Tool '{tool_name}' não encontrada"}

    try:
        return TOOLS_MAP[tool_name](**params)
    except TypeError as e:
        return {"success": False, "error": f"Parâmetros inválidos: {e}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# =============================================================================
# NOVAS FUNÇÕES: Score de Aderência e Salvamento
# =============================================================================

PROMPT_CALCULAR_SCORE = """Você é um especialista em análise de licitações públicas brasileiras.

Analise a aderência entre os PRODUTOS do portfólio da empresa e o EDITAL de licitação.

## PRODUTOS DO PORTFÓLIO DA EMPRESA:
{produtos_json}

## EDITAL A ANALISAR:
- Número: {numero}
- Órgão: {orgao}
- Objeto: {objeto}
- Valor estimado: {valor}

## CRITÉRIOS DE ANÁLISE:
1. **Aderência Técnica**: Os produtos atendem ao objeto do edital? Há compatibilidade técnica?
2. **Categoria**: A categoria dos produtos (informática, equipamento médico, etc.) corresponde ao tipo de contratação?
3. **Especificações**: As especificações dos produtos são compatíveis com os requisitos implícitos do edital?

## REGRAS DE SCORE:
- **80-100%**: Alta aderência - produtos atendem diretamente ao objeto. Recomendação: PARTICIPAR
- **50-79%**: Média aderência - produtos podem atender com adaptações. Recomendação: AVALIAR
- **0-49%**: Baixa aderência - produtos não correspondem ao objeto. Recomendação: NÃO PARTICIPAR

## RESPOSTA OBRIGATÓRIA:
Forneça sua análise em formato JSON:

```json
{{
    "score_tecnico": <número inteiro de 0 a 100>,
    "recomendacao": "<PARTICIPAR ou AVALIAR ou NÃO PARTICIPAR>",
    "produtos_aderentes": [
        {{
            "produto_id": "<id do produto>",
            "produto_nome": "<nome do produto>",
            "aderencia": <número 0-100>,
            "motivo": "<explicação de 1-2 frases>"
        }}
    ],
    "justificativa": "<Explicação detalhada de 2-3 parágrafos explicando: 1) Por que o score foi atribuído, 2) Quais produtos são mais aderentes e por quê, 3) Riscos e oportunidades da participação>"
}}
```"""


def tool_calcular_score_aderencia(editais: List[Dict], user_id: str) -> Dict[str, Any]:
    """
    Calcula o score de aderência para uma lista de editais vs produtos do usuário.
    Usa DeepSeek Reasoner para análise detalhada com justificativa.
    """
    import time

    db = get_db()
    try:
        # Buscar produtos do usuário
        produtos = db.query(Produto).filter(Produto.user_id == user_id).all()

        if not produtos:
            return {
                "success": True,
                "editais_com_score": editais,
                "aviso": "Você não tem produtos cadastrados. Cadastre produtos para calcular aderência."
            }

        # Preparar dados dos produtos para o prompt
        # Usar formato RESUMIDO para incluir TODOS os produtos sem exceder limite
        # (nome, categoria, fabricante + nomes das 3 specs principais)
        produtos_data = []
        for p in produtos:
            specs = db.query(ProdutoEspecificacao).filter(
                ProdutoEspecificacao.produto_id == p.id
            ).limit(3).all()

            # Formato resumido: só nomes das specs, não valores completos
            specs_resumo = [s.nome_especificacao for s in specs]

            produtos_data.append({
                "id": p.id,
                "nome": p.nome,
                "categoria": p.categoria,
                "fabricante": p.fabricante,
                "modelo": p.modelo,
                "specs": specs_resumo  # Só os nomes das specs principais
            })

        # Usar formato compacto (sem indent) para reduzir tamanho
        produtos_json = json.dumps(produtos_data, ensure_ascii=False)
        print(f"[TOOLS] Portfólio: {len(produtos)} produtos, JSON: {len(produtos_json)} chars")

        # Calcular score para cada edital
        editais_com_score = []
        for edital in editais:
            try:
                prompt = PROMPT_CALCULAR_SCORE.format(
                    produtos_json=produtos_json,
                    numero=edital.get('numero', 'N/A'),
                    orgao=edital.get('orgao', 'N/A'),
                    objeto=edital.get('objeto', 'N/A')[:500],
                    valor=f"R$ {edital.get('valor_referencia'):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.') if edital.get('valor_referencia') else 'Não informado'
                )

                # Tentar até 2 vezes (retry em caso de resposta vazia)
                resposta = None
                for tentativa in range(2):
                    print(f"[TOOLS] Calculando score para {edital.get('numero')} (tentativa {tentativa + 1})...")

                    # Usar DeepSeek Reasoner para análise detalhada
                    resposta = call_deepseek(
                        [{"role": "user", "content": prompt}],
                        max_tokens=2000
                    )

                    if resposta and len(resposta.strip()) > 10:
                        break

                    print(f"[TOOLS] Resposta vazia, tentando novamente...")
                    time.sleep(1)  # Pequena pausa antes de retry

                # Se ainda vazio após retries, tentar com deepseek-chat como fallback
                if not resposta or len(resposta.strip()) < 10:
                    print(f"[TOOLS] Usando deepseek-chat como fallback para {edital.get('numero')}...")
                    resposta = call_deepseek(
                        [{"role": "user", "content": prompt}],
                        max_tokens=2000,
                        model_override="deepseek-chat"
                    )

                # Extrair JSON da resposta
                json_match = re.search(r'\{[\s\S]*\}', resposta or "")
                if json_match:
                    try:
                        raw_json = json_match.group()
                        # Limpar quebras de linha e tabs reais (chars 0x0A, 0x0D, 0x09)
                        # que podem aparecer dentro de strings JSON e quebram o parser
                        raw_json = raw_json.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
                        # Limpar múltiplos espaços
                        raw_json = re.sub(r'  +', ' ', raw_json)

                        score_data = json.loads(raw_json)
                        edital['score_tecnico'] = score_data.get('score_tecnico', score_data.get('score', 0))
                        edital['recomendacao'] = score_data.get('recomendacao', 'AVALIAR')
                        edital['produtos_aderentes'] = score_data.get('produtos_aderentes', [])
                        edital['justificativa'] = score_data.get('justificativa', '')
                        print(f"[TOOLS] Score {edital.get('numero')}: {edital['score_tecnico']}% - {edital['recomendacao']}")
                    except json.JSONDecodeError as je:
                        print(f"[TOOLS] Erro ao parsear JSON para {edital.get('numero')}: {je}")
                        print(f"[TOOLS] JSON bruto: {raw_json[:300]}...")
                        edital['score_tecnico'] = 0
                        edital['recomendacao'] = 'AVALIAR'
                        edital['justificativa'] = 'Erro ao processar resposta da IA.'
                else:
                    print(f"[TOOLS] Nenhum JSON encontrado para {edital.get('numero')}")
                    edital['score_tecnico'] = 0
                    edital['recomendacao'] = 'AVALIAR'
                    edital['justificativa'] = 'Não foi possível calcular score automaticamente.'

            except Exception as e:
                print(f"[TOOLS] Erro ao calcular score para {edital.get('numero')}: {e}")
                import traceback
                traceback.print_exc()
                edital['score_tecnico'] = 0
                edital['recomendacao'] = 'AVALIAR'
                edital['justificativa'] = f'Erro no cálculo: {str(e)[:100]}'

            editais_com_score.append(edital)

        # Ordenar por score decrescente
        editais_com_score.sort(key=lambda x: x.get('score_tecnico', 0), reverse=True)

        return {
            "success": True,
            "editais_com_score": editais_com_score,
            "total_produtos": len(produtos)
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_salvar_editais_selecionados(editais: List[Dict], user_id: str) -> Dict[str, Any]:
    """
    Salva editais selecionados no banco, verificando duplicatas.
    """
    db = get_db()
    try:
        salvos = []
        duplicados = []
        erros = []

        for edital_data in editais:
            numero = edital_data.get('numero')
            orgao = edital_data.get('orgao')
            numero_pncp = edital_data.get('numero_pncp')

            # Validar numero - campo obrigatório
            if not numero:
                # Tentar extrair da URL ou gerar um identificador único
                url = edital_data.get('url', '')
                if url:
                    # Extrair identificador da URL
                    import re
                    match = re.search(r'/(\d+[-_/]\d+)/?', url)
                    if match:
                        numero = match.group(1).replace('/', '-').replace('_', '-')
                    else:
                        # Usar hash da URL como identificador
                        import hashlib
                        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                        numero = f"SCR-{url_hash}"
                else:
                    # Gerar número único
                    numero = f"SCR-{str(uuid.uuid4())[:8]}"

            # Validar orgao - campo obrigatório
            if not orgao:
                orgao = edital_data.get('fonte', 'Não identificado')

            # Verificar se já existe
            existe = db.query(Edital).filter(
                Edital.user_id == user_id,
                Edital.numero == numero,
                Edital.orgao == orgao
            ).first()

            if existe:
                duplicados.append(numero)
                continue

            try:
                # Validar modalidade - deve ser um dos valores do ENUM
                modalidades_validas = ['pregao_eletronico', 'pregao_presencial', 'concorrencia',
                                       'tomada_precos', 'convite', 'dispensa', 'inexigibilidade']
                modalidade = edital_data.get('modalidade', 'pregao_eletronico')
                if modalidade not in modalidades_validas:
                    modalidade = 'pregao_eletronico'  # Default para scraper

                # Validar data_abertura - não pode ser string como "Ver no portal"
                data_abertura = edital_data.get('data_abertura')
                if isinstance(data_abertura, str) and data_abertura and not data_abertura[0].isdigit():
                    data_abertura = None  # Limpar valores inválidos

                edital = Edital(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    numero=numero,
                    orgao=orgao,
                    orgao_tipo=edital_data.get('orgao_tipo', 'federal'),
                    uf=edital_data.get('uf'),
                    objeto=edital_data.get('objeto', ''),
                    modalidade=modalidade,
                    valor_referencia=edital_data.get('valor_referencia'),
                    data_publicacao=edital_data.get('data_publicacao'),
                    data_abertura=data_abertura,
                    fonte=edital_data.get('fonte', 'PNCP'),
                    url=edital_data.get('url'),
                    status='novo'
                )
                db.add(edital)
                salvos.append(numero)

                # Se tem score, salvar análise
                if edital_data.get('score_tecnico') is not None:
                    # Buscar primeiro produto aderente ou usar genérico
                    produtos_aderentes = edital_data.get('produtos_aderentes', [])
                    if produtos_aderentes:
                        produto_id = produtos_aderentes[0].get('produto_id')
                    else:
                        # Pegar primeiro produto do usuário
                        primeiro_produto = db.query(Produto).filter(Produto.user_id == user_id).first()
                        produto_id = primeiro_produto.id if primeiro_produto else None

                    if produto_id:
                        analise = Analise(
                            id=str(uuid.uuid4()),
                            edital_id=edital.id,
                            produto_id=produto_id,
                            user_id=user_id,
                            score_tecnico=edital_data.get('score_tecnico'),
                            recomendacao=edital_data.get('justificativa', '')[:5000]
                        )
                        db.add(analise)

            except Exception as e:
                erros.append(f"{numero}: {str(e)[:50]}")

        db.commit()

        return {
            "success": True,
            "salvos": salvos,
            "duplicados": duplicados,
            "erros": erros,
            "total_salvos": len(salvos)
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()
