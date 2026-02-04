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
    Analise, AnaliseDetalhe, Proposta,
    Concorrente, PrecoHistorico, ParticipacaoEdital
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

PROMPT_GERAR_PROPOSTA = """Você é um especialista em elaboração de propostas técnicas para licitações públicas brasileiras.

Com base nas informações abaixo, gere uma PROPOSTA TÉCNICA COMPLETA e profissional.

## DADOS DO EDITAL:
- Número: {numero_edital}
- Órgão: {orgao}
- Objeto: {objeto}

## PRODUTO OFERTADO:
- Nome: {nome_produto}
- Fabricante: {fabricante}
- Modelo: {modelo}

## ESPECIFICAÇÕES TÉCNICAS DO PRODUTO:
{especificacoes}

## ANÁLISE DE REQUISITOS DO EDITAL:
{analise_requisitos}

## PREÇO PROPOSTO: R$ {preco}

---

GERE A PROPOSTA TÉCNICA COMPLETA em Markdown com TODAS as seções abaixo. NÃO OMITA NENHUMA SEÇÃO:

# PROPOSTA TÉCNICA - EDITAL Nº {numero_edital}

## 1. IDENTIFICAÇÃO DA PROPONENTE
(Incluir campos em branco: Razão Social, CNPJ, Endereço, Telefone, E-mail, Representante Legal)

## 2. OBJETO DA PROPOSTA
(Descrição clara do que está sendo ofertado, referenciando o edital)

## 3. DESCRIÇÃO TÉCNICA DO PRODUTO
(Detalhar o produto, fabricante, modelo e principais características técnicas)

## 4. ATENDIMENTO AOS REQUISITOS DO EDITAL
(OBRIGATÓRIO: Criar uma TABELA MARKDOWN comparando requisitos do edital vs especificações do produto)

| Requisito do Edital | Especificação Oferecida | Status |
|---------------------|-------------------------|--------|
| (requisito 1) | (spec do produto) | ✅ Atende |
| (requisito 2) | (spec do produto) | ✅ Atende |

## 5. CONDIÇÕES COMERCIAIS
OBRIGATÓRIO incluir:
- **PREÇO UNITÁRIO: R$ {preco}**
- **PREÇO TOTAL: R$ {preco}** (quantidade: 1 unidade)
- Prazo de entrega: XX dias após emissão da ordem de fornecimento
- Prazo de garantia: XX meses
- Assistência técnica: disponível em todo território nacional
- Forma de pagamento: conforme edital

## 6. VALIDADE DA PROPOSTA
A presente proposta tem validade de 60 (sessenta) dias, contados da data de sua apresentação.

## 7. DECLARAÇÕES
Incluir declarações padrão:
- Declaração de que os produtos atendem às especificações técnicas
- Declaração de inexistência de fato impeditivo
- Declaração de não emprego de menores
- Declaração de conformidade com a legislação vigente

## 8. ENCERRAMENTO
Local, data e assinatura do representante legal.

---
IMPORTANTE: Gere a proposta COMPLETA com TODAS as 8 seções acima. O preço R$ {preco} DEVE aparecer na seção 5.
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
                          data_abertura: str = None, url: str = None) -> Dict[str, Any]:
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
        if url:
            edital.url = url

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

                    # Construir URL do PNCP usando CNPJ, ano e sequencial (mais confiável)
                    # Formato: https://pncp.gov.br/app/editais/{cnpj}-{sequencial}-{ano}
                    cnpj = (orgao_data.get('cnpj') or '').replace('.', '').replace('/', '').replace('-', '')
                    ano = item.get('anoCompra')
                    seq = item.get('sequencialCompra')

                    if cnpj and ano and seq:
                        # URL direta para página do edital no PNCP
                        link = f"https://pncp.gov.br/app/editais/{cnpj}-1-{str(seq).zfill(6)}/{ano}"
                    elif numero_pncp:
                        link = f"https://pncp.gov.br/app/editais/{numero_pncp}"
                    else:
                        # Fallback para linkSistemaOrigem se não tiver dados do PNCP
                        link = item.get('linkSistemaOrigem')

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

        # Buscar requisitos do edital
        requisitos = db.query(EditalRequisito).filter(
            EditalRequisito.edital_id == edital_id
        ).all()
        requisitos_texto = ""
        if requisitos:
            requisitos_texto = "\n".join([
                f"- {r.descricao} (Tipo: {r.tipo}, Obrigatório: {'Sim' if r.obrigatorio else 'Não'})"
                for r in requisitos
            ])
        else:
            requisitos_texto = "Requisitos específicos não cadastrados para este edital."

        # Buscar análise de aderência se existir
        analise_texto = ""
        if analise:
            detalhes = db.query(AnaliseDetalhe).filter(
                AnaliseDetalhe.analise_id == analise.id
            ).all()
            if detalhes:
                analise_texto = "\n\nANÁLISE DE ADERÊNCIA:\n" + "\n".join([
                    f"- {d.justificativa} ({d.status})" for d in detalhes
                ])

        # Combinar requisitos e análise
        requisitos_e_analise = requisitos_texto + analise_texto

        # Formatar preço
        preco_formatado = f"{preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") if preco else "A definir"

        # Gerar proposta com IA
        prompt = PROMPT_GERAR_PROPOSTA.format(
            numero_edital=edital.numero or "S/N",
            orgao=edital.orgao or "Não informado",
            objeto=edital.objeto or "Não informado",
            nome_produto=produto.nome or "Produto",
            fabricante=produto.fabricante or "N/A",
            modelo=produto.modelo or "N/A",
            especificacoes=specs_texto or "Especificações não cadastradas",
            analise_requisitos=requisitos_e_analise,
            preco=preco_formatado
        )

        # Usar max_tokens maior para proposta completa
        texto_proposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=32000)

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


# ==================== MINDSDB TOOL ====================

def tool_consulta_mindsdb(pergunta: str, user_id: str) -> Dict[str, Any]:
    """
    Envia uma pergunta em linguagem natural para o agente MindsDB (editais_database_searcher).
    O agente traduz para SQL, executa e retorna a resposta formatada.

    Args:
        pergunta: Pergunta em linguagem natural sobre editais/produtos
        user_id: ID do usuário (para contexto)

    Returns:
        Dict com resposta do MindsDB ou erro
    """
    import os

    # Configuração MindsDB
    MINDSDB_HOST = os.getenv("MINDSDB_HOST", "192.168.1.100")
    MINDSDB_PORT = os.getenv("MINDSDB_PORT", "47334")
    MINDSDB_USER = os.getenv("MINDSDB_USER", "mindsdb")
    MINDSDB_PASSWORD = os.getenv("MINDSDB_PASSWORD", "")

    try:
        # Método 1: Via API REST do MindsDB
        url = f"http://{MINDSDB_HOST}:{MINDSDB_PORT}/api/sql/query"

        # Query para o agente
        sql_query = f"""
        SELECT *
        FROM mindsdb.editais_database_searcher
        WHERE question = '{pergunta.replace("'", "''")}';
        """

        print(f"[MINDSDB] Enviando consulta: {pergunta[:100]}...")

        response = requests.post(
            url,
            json={"query": sql_query},
            headers={"Content-Type": "application/json"},
            timeout=120  # MindsDB pode demorar com consultas complexas
        )

        if response.status_code == 200:
            data = response.json()

            # Extrair resposta do agente
            if data.get("data") and len(data["data"]) > 0:
                row = data["data"][0]
                # A resposta pode estar em diferentes colunas dependendo da versão
                resposta = None
                if isinstance(row, dict):
                    resposta = row.get("answer") or row.get("response") or row.get("result")
                elif isinstance(row, list) and len(row) > 0:
                    resposta = row[0]

                if resposta:
                    print(f"[MINDSDB] Resposta recebida: {str(resposta)[:200]}...")
                    return {
                        "success": True,
                        "resposta": resposta,
                        "pergunta": pergunta
                    }
                else:
                    return {
                        "success": False,
                        "error": "Resposta vazia do agente MindsDB",
                        "raw_data": data
                    }
            else:
                return {
                    "success": False,
                    "error": "Sem dados retornados pelo MindsDB",
                    "raw_response": data
                }
        else:
            return {
                "success": False,
                "error": f"Erro HTTP {response.status_code}: {response.text[:500]}"
            }

    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": f"Não foi possível conectar ao MindsDB em {MINDSDB_HOST}:{MINDSDB_PORT}. Verifique se o serviço está rodando."
        }
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Timeout na consulta ao MindsDB (>120s). A consulta pode ser muito complexa."
        }
    except Exception as e:
        print(f"[MINDSDB] Erro: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ==================== SPRINT 1: REGISTRAR RESULTADO DE CERTAME ====================

PROMPT_EXTRAIR_RESULTADO = """Extraia os dados deste registro de resultado de licitação.

MENSAGEM DO USUÁRIO:
"{message}"

IMPORTANTE:
- Valores monetários: converta "365k" para 365000, "1.2M" para 1200000, "R$ 450.000,00" para 450000
- Se o usuário mencionar que "perdemos" ou "não ganhamos", o resultado é "derrota"
- Se mencionar "ganhamos" ou "vencemos", o resultado é "vitoria"
- Se mencionar "cancelado", "revogado" ou "deserto", use esses valores
- Identifique todos os participantes mencionados com suas posições
- O "motivo" só deve ser preenchido se for derrota

Retorne APENAS um JSON válido:
{{
    "edital": "número do edital (ex: PE-001/2026)",
    "resultado": "vitoria|derrota|cancelado|deserto|revogado",
    "nosso_preco": número ou null,
    "preco_vencedor": número ou null,
    "empresa_vencedora": "nome da empresa" ou null,
    "cnpj_vencedor": "cnpj" ou null,
    "motivo": "preco|tecnica|documentacao|prazo|outro" ou null,
    "outros_participantes": [
        {{"empresa": "nome", "preco": número, "posicao": número}}
    ]
}}"""


def tool_registrar_resultado(message: str, user_id: str, db=None) -> Dict[str, Any]:
    """
    Registra resultado de certame (vitória/derrota) e alimenta base de preços históricos.

    Args:
        message: Mensagem do usuário descrevendo o resultado
        user_id: ID do usuário
        db: Sessão do banco (opcional, será criada se não fornecida)

    Returns:
        Dict com sucesso/erro e dados registrados
    """
    from models import Edital, Concorrente, PrecoHistorico, ParticipacaoEdital

    close_db = False
    if db is None:
        db = get_db()
        close_db = True

    try:
        # 1. Extrair dados via LLM (usar deepseek-chat para extração de JSON)
        prompt = PROMPT_EXTRAIR_RESULTADO.format(message=message)
        resposta = call_deepseek(
            [{"role": "user", "content": prompt}],
            max_tokens=500,
            model_override="deepseek-chat"  # Chat é melhor para extração de JSON
        )

        # Extrair JSON da resposta
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if not json_match:
            return {"success": False, "error": "Não consegui extrair os dados. Tente um formato como: 'Perdemos o PE-001 para Empresa X com R$ 100.000'"}

        try:
            dados = json.loads(json_match.group())
        except json.JSONDecodeError:
            return {"success": False, "error": "Erro ao processar dados. Tente novamente com mais detalhes."}

        print(f"[TOOLS] Dados extraídos: {dados}")

        # 2. Buscar edital
        edital_numero = dados.get('edital', '')
        if not edital_numero:
            return {"success": False, "error": "Não identifiquei o número do edital. Informe o número (ex: PE-001/2026)"}

        print(f"[TOOLS] Buscando edital: '{edital_numero}'")

        # Busca exata primeiro
        edital = db.query(Edital).filter(
            Edital.numero.ilike(f"%{edital_numero}%"),
            Edital.user_id == user_id
        ).first()

        if not edital:
            # Tentar busca mais flexível, mas garantindo que match seja específico
            # Extrair partes: PE, 001, 2026 de "PE-001/2026"
            partes = re.findall(r'[A-Za-z]+|\d+', edital_numero)
            print(f"[TOOLS] Partes extraídas: {partes}")

            if len(partes) >= 2:
                # Buscar usando as partes mais relevantes (tipo + número)
                # Ex: PE e 001 para "PE-001/2026"
                tipo_edital = partes[0]  # PE, PP, CC, etc.
                num_edital = partes[1] if len(partes) > 1 else None

                # Buscar editais que contenham tanto o tipo quanto o número
                query = db.query(Edital).filter(
                    Edital.user_id == user_id
                )

                # Adicionar filtro por tipo se parece ser tipo de edital
                if tipo_edital.upper() in ['PE', 'PP', 'CC', 'TP', 'PREGAO', 'CONCORRENCIA']:
                    query = query.filter(Edital.numero.ilike(f"%{tipo_edital}%"))

                # Adicionar filtro por número
                if num_edital:
                    query = query.filter(Edital.numero.ilike(f"%{num_edital}%"))

                editais_encontrados = query.all()

                if len(editais_encontrados) == 1:
                    edital = editais_encontrados[0]
                elif len(editais_encontrados) > 1:
                    # Múltiplos encontrados - tentar match mais específico
                    # Ordenar por similaridade (o que contém mais partes)
                    for ed in editais_encontrados:
                        match_count = sum(1 for p in partes if p.lower() in ed.numero.lower())
                        if match_count >= len(partes) - 1:  # Match quase completo
                            edital = ed
                            break

                    if not edital:
                        numeros = [e.numero for e in editais_encontrados[:5]]
                        return {
                            "success": False,
                            "error": f"Encontrei múltiplos editais que podem corresponder a '{edital_numero}': {', '.join(numeros)}. Seja mais específico."
                        }

        if not edital:
            return {"success": False, "error": f"Edital '{edital_numero}' não encontrado no seu cadastro."}

        # 3. Registrar/atualizar concorrente vencedor
        concorrente_id = None
        empresa_vencedora = dados.get("empresa_vencedora")

        if empresa_vencedora and dados.get("resultado") != "vitoria":
            # Buscar concorrente existente
            concorrente = db.query(Concorrente).filter(
                Concorrente.nome.ilike(f"%{empresa_vencedora}%")
            ).first()

            if not concorrente:
                # Criar novo concorrente
                concorrente = Concorrente(
                    nome=empresa_vencedora,
                    cnpj=dados.get("cnpj_vencedor"),
                    editais_participados=0,
                    editais_ganhos=0
                )
                db.add(concorrente)
                db.flush()

            concorrente.editais_participados += 1
            concorrente.editais_ganhos += 1

            # Recalcular taxa de vitória
            if concorrente.editais_participados > 0:
                concorrente.taxa_vitoria = (concorrente.editais_ganhos / concorrente.editais_participados) * 100

            concorrente_id = concorrente.id

        # 4. Calcular desconto sobre referência
        desconto = None
        if edital.valor_referencia and dados.get("preco_vencedor"):
            preco_ref = float(edital.valor_referencia)
            preco_venc = float(dados["preco_vencedor"])
            if preco_ref > 0:
                desconto = ((preco_ref - preco_venc) / preco_ref) * 100

        # 5. Registrar preço histórico
        preco_hist = PrecoHistorico(
            edital_id=edital.id,
            user_id=user_id,
            preco_referencia=edital.valor_referencia,
            preco_vencedor=dados.get("preco_vencedor"),
            nosso_preco=dados.get("nosso_preco"),
            desconto_percentual=desconto,
            concorrente_id=concorrente_id,
            empresa_vencedora=empresa_vencedora,
            cnpj_vencedor=dados.get("cnpj_vencedor"),
            resultado=dados.get("resultado"),
            motivo_perda=dados.get("motivo"),
            data_homologacao=datetime.now().date(),
            fonte="manual"
        )
        db.add(preco_hist)

        # 6. Registrar participações
        # Vencedor (se não somos nós)
        if concorrente_id and dados.get("preco_vencedor"):
            part_vencedor = ParticipacaoEdital(
                edital_id=edital.id,
                concorrente_id=concorrente_id,
                preco_proposto=dados["preco_vencedor"],
                posicao_final=1,
                fonte="manual"
            )
            db.add(part_vencedor)

        # Nossa participação
        if dados.get("nosso_preco"):
            nossa_posicao = 1 if dados.get("resultado") == "vitoria" else 2
            part_nossa = ParticipacaoEdital(
                edital_id=edital.id,
                concorrente_id=None,  # Nós mesmos
                preco_proposto=dados["nosso_preco"],
                posicao_final=nossa_posicao,
                fonte="manual"
            )
            db.add(part_nossa)

        # Outros participantes
        for part in dados.get("outros_participantes", []):
            if part.get("empresa"):
                # Buscar ou criar concorrente
                conc = db.query(Concorrente).filter(
                    Concorrente.nome.ilike(f"%{part['empresa']}%")
                ).first()

                if not conc:
                    conc = Concorrente(nome=part["empresa"])
                    db.add(conc)
                    db.flush()

                conc.editais_participados += 1

                part_edital = ParticipacaoEdital(
                    edital_id=edital.id,
                    concorrente_id=conc.id,
                    preco_proposto=part.get("preco"),
                    posicao_final=part.get("posicao"),
                    fonte="manual"
                )
                db.add(part_edital)

        # 7. Atualizar status do edital
        resultado = dados.get("resultado")
        if resultado == "vitoria":
            edital.status = "vencedor"
        elif resultado == "derrota":
            edital.status = "perdedor"
        elif resultado in ["cancelado", "revogado", "deserto"]:
            edital.status = resultado

        db.commit()

        # Calcular diferença de preço
        diferenca = None
        diferenca_pct = None
        if dados.get("nosso_preco") and dados.get("preco_vencedor") and dados.get("resultado") == "derrota":
            diferenca = float(dados["nosso_preco"]) - float(dados["preco_vencedor"])
            if float(dados["nosso_preco"]) > 0:
                diferenca_pct = (diferenca / float(dados["nosso_preco"])) * 100

        return {
            "success": True,
            "edital_numero": edital.numero,
            "edital_id": edital.id,
            "orgao": edital.orgao,
            "resultado": resultado,
            "preco_vencedor": dados.get("preco_vencedor"),
            "nosso_preco": dados.get("nosso_preco"),
            "empresa_vencedora": empresa_vencedora,
            "desconto_percentual": round(desconto, 1) if desconto else None,
            "diferenca": diferenca,
            "diferenca_pct": round(diferenca_pct, 1) if diferenca_pct else None,
            "motivo": dados.get("motivo")
        }

    except Exception as e:
        db.rollback()
        print(f"[TOOLS] Erro ao registrar resultado: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}
    finally:
        if close_db:
            db.close()


# ==================== EXTRAIR ATA DE SESSÃO ====================

PROMPT_EXTRAIR_ATA = """Analise este documento de licitação (pode ser Ata de Sessão ou Ata de Registro de Preços) e extraia TODOS os dados.

TEXTO DO DOCUMENTO:
{texto_ata}

EXTRAIA:

1. **Dados Gerais:**
   - Número do edital/pregão (ex: PE0013/2025, PE-001/2026)
   - Órgão licitante
   - Data da sessão ou assinatura
   - Objeto resumido

2. **Para CADA ITEM registrado:**
   - Número do item
   - Descrição do produto/serviço
   - Empresa vencedora/fornecedora (nome completo)
   - CNPJ (se disponível, mesmo parcialmente mascarado)
   - Valor unitário e/ou total
   - Outros participantes se houver

3. **Empresas Desclassificadas (se houver)**

IMPORTANTE:
- Valores monetários: converta para número (R$ 300,0000 → 300.00, 365.000,00 → 365000.00)
- Extraia TODOS os itens que encontrar
- Em Atas de Registro de Preços, os itens geralmente estão no final do documento
- Se encontrar tabela com itens, extraia cada linha

Retorne APENAS um JSON válido:
{{
    "edital": "número do pregão/edital",
    "orgao": "nome do órgão licitante",
    "data_sessao": "dd/mm/yyyy",
    "objeto": "descrição resumida do objeto",
    "itens": [
        {{
            "item": 1,
            "descricao": "descrição do objeto",
            "vencedor": "nome da empresa vencedora",
            "cnpj_vencedor": "XX.XXX.XXX/XXXX-XX ou null",
            "preco_vencedor": 123456.78,
            "participantes": [
                {{"empresa": "nome", "cnpj": "...", "lance_final": 123456.78, "posicao": 1}}
            ]
        }}
    ],
    "desclassificados": [
        {{"empresa": "nome", "motivo": "motivo da desclassificação"}}
    ]
}}"""


def tool_extrair_ata_pdf(texto_pdf: str, user_id: str, db=None) -> Dict[str, Any]:
    """
    Extrai resultados de uma ata de sessão de pregão eletrônico.

    Args:
        texto_pdf: Texto extraído do PDF da ata
        user_id: ID do usuário
        db: Sessão do banco (opcional)

    Returns:
        Dict com dados extraídos e status
    """
    close_db = False
    if db is None:
        db = get_db()
        close_db = True

    try:
        # Verificar se o texto parece uma ata
        texto_lower = texto_pdf.lower()
        palavras_ata = ["ata", "sessão", "pregão", "licitação", "vencedor", "lance", "adjudicado"]
        if not any(p in texto_lower for p in palavras_ata):
            return {
                "success": False,
                "error": "O documento não parece ser uma ata de sessão de pregão. Envie uma ata de licitação."
            }

        # Limitar texto mas pegar partes importantes (início e fim)
        # Atas de Registro de Preços têm os itens/preços no final do documento
        if len(texto_pdf) > 20000:
            # Pegar início (dados gerais) + fim (itens e preços)
            texto_truncado = texto_pdf[:8000] + "\n\n[...]\n\n" + texto_pdf[-12000:]
        else:
            texto_truncado = texto_pdf[:20000]

        # Enviar para LLM
        prompt = PROMPT_EXTRAIR_ATA.format(texto_ata=texto_truncado)
        print(f"[TOOLS] Extraindo dados da ata via LLM...")

        resposta = call_deepseek(
            [{"role": "user", "content": prompt}],
            max_tokens=4000,
            model_override="deepseek-chat"
        )

        # Extrair JSON da resposta
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if not json_match:
            return {"success": False, "error": "Não consegui extrair dados estruturados da ata."}

        dados = json.loads(json_match.group())
        print(f"[TOOLS] Dados extraídos: edital={dados.get('edital')}, itens={len(dados.get('itens', []))}")

        # Verificar se extraiu algum item
        if not dados.get("itens") or len(dados.get("itens", [])) == 0:
            # Tentar extrair informações mesmo sem itens estruturados
            return {
                "success": True,
                "edital": dados.get("edital"),
                "orgao": dados.get("orgao"),
                "data_sessao": dados.get("data_sessao"),
                "objeto": dados.get("objeto"),
                "itens": [],
                "desclassificados": dados.get("desclassificados", []),
                "concorrentes_novos": [],
                "concorrentes_atualizados": [],
                "edital_encontrado": None,
                "dados_salvos": False,
                "aviso": "Não foi possível extrair itens detalhados da ata. Verifique se o PDF contém o resultado do certame."
            }

        # Buscar edital correspondente no banco (opcional)
        edital = None
        if dados.get("edital"):
            edital = db.query(Edital).filter(
                Edital.numero.ilike(f"%{dados['edital']}%"),
                Edital.user_id == user_id
            ).first()

        itens_processados = []
        concorrentes_novos = []
        concorrentes_atualizados = []

        # Processar cada item
        for item in dados.get("itens", []):
            item_result = {
                "item": item.get("item"),
                "descricao": item.get("descricao"),
                "vencedor": item.get("vencedor"),
                "preco_vencedor": item.get("preco_vencedor"),
                "participantes_count": len(item.get("participantes", []))
            }

            # Registrar vencedor como concorrente
            if item.get("vencedor"):
                conc = db.query(Concorrente).filter(
                    Concorrente.nome.ilike(f"%{item['vencedor']}%")
                ).first()

                if not conc:
                    conc = Concorrente(
                        nome=item["vencedor"],
                        cnpj=item.get("cnpj_vencedor"),
                        editais_participados=1,
                        editais_ganhos=1
                    )
                    db.add(conc)
                    db.flush()
                    concorrentes_novos.append(item["vencedor"])
                else:
                    conc.editais_participados = (conc.editais_participados or 0) + 1
                    conc.editais_ganhos = (conc.editais_ganhos or 0) + 1
                    concorrentes_atualizados.append(item["vencedor"])

                # Se temos o edital, registrar preço histórico
                if edital and item.get("preco_vencedor"):
                    preco_hist = PrecoHistorico(
                        edital_id=edital.id,
                        user_id=user_id,
                        preco_referencia=edital.valor_referencia,
                        preco_vencedor=item["preco_vencedor"],
                        empresa_vencedora=item["vencedor"],
                        cnpj_vencedor=item.get("cnpj_vencedor"),
                        concorrente_id=conc.id,
                        resultado="derrota",  # Se estamos extraindo ata, provavelmente não ganhamos
                        data_homologacao=datetime.strptime(dados.get("data_sessao", ""), "%d/%m/%Y").date() if dados.get("data_sessao") else datetime.now().date(),
                        fonte="ata_pdf"
                    )
                    db.add(preco_hist)

            # Registrar participantes
            for part in item.get("participantes", []):
                if part.get("empresa") and part["empresa"] != item.get("vencedor"):
                    conc_part = db.query(Concorrente).filter(
                        Concorrente.nome.ilike(f"%{part['empresa']}%")
                    ).first()

                    if not conc_part:
                        conc_part = Concorrente(
                            nome=part["empresa"],
                            cnpj=part.get("cnpj"),
                            editais_participados=1,
                            editais_ganhos=0
                        )
                        db.add(conc_part)
                        db.flush()
                        concorrentes_novos.append(part["empresa"])
                    else:
                        conc_part.editais_participados = (conc_part.editais_participados or 0) + 1
                        concorrentes_atualizados.append(part["empresa"])

                    # Registrar participação
                    if edital:
                        part_edital = ParticipacaoEdital(
                            edital_id=edital.id,
                            concorrente_id=conc_part.id,
                            preco_proposto=part.get("lance_final"),
                            posicao_final=part.get("posicao"),
                            fonte="ata_pdf"
                        )
                        db.add(part_edital)

            itens_processados.append(item_result)

        # Atualizar status do edital se encontrado
        if edital:
            edital.status = "perdedor"

        db.commit()

        return {
            "success": True,
            "edital": dados.get("edital"),
            "orgao": dados.get("orgao"),
            "data_sessao": dados.get("data_sessao"),
            "objeto": dados.get("objeto"),
            "itens": itens_processados,
            "desclassificados": dados.get("desclassificados", []),
            "concorrentes_novos": concorrentes_novos,
            "concorrentes_atualizados": concorrentes_atualizados,
            "edital_encontrado": edital.numero if edital else None,
            "dados_salvos": edital is not None
        }

    except json.JSONDecodeError as e:
        print(f"[TOOLS] Erro ao parsear JSON da ata: {e}")
        return {"success": False, "error": f"Erro ao interpretar dados da ata: {str(e)}"}
    except Exception as e:
        db.rollback()
        print(f"[TOOLS] Erro ao extrair ata: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}
    finally:
        if close_db:
            db.close()


# ==================== BUSCAR ATAS NO PNCP ====================

def tool_buscar_atas_pncp(termo: str, user_id: str = None) -> Dict[str, Any]:
    """
    Busca atas de registro de preço no PNCP.

    Args:
        termo: Termo de busca (ex: "hematologia", "equipamento hospitalar")
        user_id: ID do usuário

    Returns:
        Dict com atas encontradas e URLs para download
    """
    from config import SERPER_API_KEY, SERPER_API_URL

    print(f"[PNCP-ATAS] Buscando atas de '{termo}'...")

    # Método 1: Usar API de busca do PNCP
    try:
        url_search = f"https://pncp.gov.br/api/search/?q={termo}&tipos_documento=ata&pagina=1&tam_pagina=10"
        response = requests.get(url_search, timeout=30)

        if response.status_code == 200:
            data = response.json()
            atas = []

            for item in data.get("items", []):
                ata = {
                    "id": item.get("id"),
                    "titulo": item.get("title"),
                    "descricao": item.get("description"),
                    "orgao": item.get("orgao_nome"),
                    "cnpj_orgao": item.get("orgao_cnpj"),
                    "uf": item.get("uf"),
                    "municipio": item.get("municipio_nome"),
                    "modalidade": item.get("modalidade_licitacao_nome"),
                    "data_publicacao": item.get("data_publicacao_pncp"),
                    "data_assinatura": item.get("data_assinatura"),
                    "vigencia_inicio": item.get("data_inicio_vigencia"),
                    "vigencia_fim": item.get("data_fim_vigencia"),
                    "numero_controle": item.get("numero_controle_pncp"),
                    "url_pncp": f"https://pncp.gov.br{item.get('item_url', '')}",
                    "ano": item.get("ano"),
                    "sequencial": item.get("numero_sequencial"),
                }
                atas.append(ata)

            if atas:
                return {
                    "success": True,
                    "fonte": "pncp_api",
                    "termo": termo,
                    "total": data.get("total", len(atas)),
                    "atas": atas
                }
    except Exception as e:
        print(f"[PNCP-ATAS] Erro na API do PNCP: {e}")

    # Método 2: Fallback para busca via Serper (Google)
    try:
        search_query = f"site:pncp.gov.br ata registro preço {termo} filetype:pdf"
        print(f"[PNCP-ATAS] Buscando via Serper: {search_query}")

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

        atas = []
        for result in data.get('organic', []):
            titulo = result.get('title', '')
            link = result.get('link', '')
            snippet = result.get('snippet', '')

            # Verificar se é realmente uma ata
            if any(p in titulo.lower() or p in snippet.lower() for p in ['ata', 'registro de preço', 'homologação']):
                ata = {
                    "titulo": titulo,
                    "descricao": snippet,
                    "url": link,
                    "url_pncp": link,
                    "fonte": "serper"
                }
                atas.append(ata)

        if atas:
            return {
                "success": True,
                "fonte": "serper",
                "termo": termo,
                "total": len(atas),
                "atas": atas
            }

    except Exception as e:
        print(f"[PNCP-ATAS] Erro no Serper: {e}")

    return {
        "success": False,
        "error": f"Não foi possível buscar atas para '{termo}'",
        "termo": termo
    }


def tool_baixar_ata_pncp(url: str, user_id: str = None) -> Dict[str, Any]:
    """
    Baixa uma ata/documento do PNCP e extrai o texto.

    Args:
        url: URL do documento (página do PNCP ou PDF direto)
        user_id: ID do usuário

    Returns:
        Dict com texto extraído e caminho do arquivo
    """
    import tempfile

    print(f"[PNCP-ATAS] Baixando documento: {url}")

    try:
        # Se for URL da página do PNCP, tentar encontrar o PDF
        if 'pncp.gov.br' in url and not url.endswith('.pdf'):
            # Tentar obter link do PDF da página
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                # Procurar links de PDF na página
                import re
                pdf_links = re.findall(r'href=["\']([^"\']*\.pdf)["\']', response.text, re.IGNORECASE)
                if pdf_links:
                    url = pdf_links[0]
                    if not url.startswith('http'):
                        url = f"https://pncp.gov.br{url}"

        # Baixar o arquivo
        response = requests.get(url, timeout=60, stream=True)
        response.raise_for_status()

        # Salvar em arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            for chunk in response.iter_content(chunk_size=8192):
                tmp_file.write(chunk)
            filepath = tmp_file.name

        # Extrair texto do PDF
        texto = ""
        try:
            doc = fitz.open(filepath)
            for page in doc:
                texto += page.get_text()
            doc.close()
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao extrair texto do PDF: {e}"
            }

        if len(texto) < 100:
            return {
                "success": False,
                "error": "PDF vazio ou não foi possível extrair texto (pode ser imagem escaneada)"
            }

        return {
            "success": True,
            "url": url,
            "filepath": filepath,
            "texto": texto,
            "tamanho_texto": len(texto)
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "error": f"Erro ao baixar documento: {e}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro inesperado: {e}"
        }


# ==================== SPRINT 1 - FUNCIONALIDADE 4: BUSCAR PREÇOS NO PNCP ====================

def tool_buscar_precos_pncp(termo: str, meses: int = 12, user_id: str = None) -> Dict[str, Any]:
    """
    Busca preços de contratos no PNCP para alimentar base de preços históricos.

    Args:
        termo: Termo de busca (ex: "hematologia", "analisador bioquímico")
        meses: Período de busca em meses (padrão: 12)
        user_id: ID do usuário

    Returns:
        Dict com contratos encontrados, preços e estatísticas
    """
    from datetime import datetime, timedelta
    from config import SERPER_API_KEY, SERPER_API_URL

    print(f"[PNCP-PRECOS] Buscando preços de '{termo}' nos últimos {meses} meses...")

    data_inicio = (datetime.now() - timedelta(days=meses * 30)).strftime("%Y-%m-%d")
    data_fim = datetime.now().strftime("%Y-%m-%d")

    contratos = []
    precos = []

    # Método 1: Tentar API oficial do PNCP para contratos
    try:
        url_contratos = "https://pncp.gov.br/api/consulta/v1/contratos"
        params = {
            "q": termo,
            "dataInicial": data_inicio,
            "dataFinal": data_fim,
            "pagina": 1,
            "tamanhoPagina": 50
        }

        response = requests.get(url_contratos, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            for item in data.get("data", data.get("items", [])):
                valor = item.get("valorInicial") or item.get("valor") or item.get("valorContrato")
                if valor:
                    contrato = {
                        "id": item.get("id"),
                        "numero": item.get("numeroContrato") or item.get("numero"),
                        "objeto": item.get("objetoContrato") or item.get("objeto") or item.get("description"),
                        "orgao": item.get("nomeOrgao") or item.get("orgao_nome"),
                        "cnpj_orgao": item.get("cnpjOrgao") or item.get("orgao_cnpj"),
                        "fornecedor": item.get("nomeRazaoSocialFornecedor") or item.get("fornecedor_nome"),
                        "cnpj_fornecedor": item.get("cnpjCpfFornecedor") or item.get("fornecedor_cnpj"),
                        "valor": float(valor),
                        "data_assinatura": item.get("dataAssinatura") or item.get("data_assinatura"),
                        "data_publicacao": item.get("dataPublicacaoPncp") or item.get("data_publicacao"),
                        "uf": item.get("uf"),
                        "municipio": item.get("municipio_nome"),
                        "modalidade": item.get("modalidadeLicitacao") or item.get("modalidade"),
                        "url_pncp": f"https://pncp.gov.br/app/contratos/{item.get('id', '')}" if item.get('id') else None,
                        "fonte": "pncp_api"
                    }
                    contratos.append(contrato)
                    precos.append(float(valor))

            if contratos:
                print(f"[PNCP-PRECOS] API PNCP retornou {len(contratos)} contratos")

    except Exception as e:
        print(f"[PNCP-PRECOS] Erro na API do PNCP: {e}")

    # Método 2: Buscar via Serper (Google) se API não retornou resultados
    if not contratos:
        try:
            search_query = f"site:pncp.gov.br contrato {termo} preço valor"
            print(f"[PNCP-PRECOS] Buscando via Serper: {search_query}")

            response = requests.post(
                SERPER_API_URL,
                headers={
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json'
                },
                json={
                    'q': search_query,
                    'num': 20,
                    'gl': 'br',
                    'hl': 'pt'
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            import re
            for result in data.get('organic', []):
                titulo = result.get('title', '')
                link = result.get('link', '')
                snippet = result.get('snippet', '')

                # Tentar extrair valor do snippet
                valores_encontrados = re.findall(r'R\$\s*([\d.,]+)', snippet)
                if valores_encontrados:
                    try:
                        valor_str = valores_encontrados[0].replace('.', '').replace(',', '.')
                        valor = float(valor_str)
                        if valor > 1000:  # Ignorar valores muito pequenos
                            contrato = {
                                "titulo": titulo,
                                "objeto": snippet[:200],
                                "valor": valor,
                                "url_pncp": link,
                                "fonte": "serper"
                            }
                            contratos.append(contrato)
                            precos.append(valor)
                    except ValueError:
                        pass

            if contratos:
                print(f"[PNCP-PRECOS] Serper retornou {len(contratos)} resultados com preços")

        except Exception as e:
            print(f"[PNCP-PRECOS] Erro no Serper: {e}")

    # Calcular estatísticas
    if not contratos:
        return {
            "success": False,
            "error": f"Não foram encontrados preços para '{termo}' no PNCP",
            "termo": termo,
            "periodo_meses": meses
        }

    # Estatísticas de preços
    preco_minimo = min(precos)
    preco_maximo = max(precos)
    preco_medio = sum(precos) / len(precos)
    preco_mediano = sorted(precos)[len(precos) // 2]

    # Agrupar por fornecedor
    fornecedores = {}
    for c in contratos:
        fornecedor = c.get("fornecedor") or c.get("titulo", "Desconhecido")
        if fornecedor not in fornecedores:
            fornecedores[fornecedor] = {"count": 0, "valores": []}
        fornecedores[fornecedor]["count"] += 1
        fornecedores[fornecedor]["valores"].append(c.get("valor", 0))

    # Top fornecedores
    top_fornecedores = sorted(
        [{"nome": k, "contratos": v["count"], "preco_medio": sum(v["valores"]) / len(v["valores"])}
         for k, v in fornecedores.items()],
        key=lambda x: x["contratos"],
        reverse=True
    )[:5]

    return {
        "success": True,
        "termo": termo,
        "periodo_meses": meses,
        "total_contratos": len(contratos),
        "contratos": contratos[:20],  # Limitar a 20 para resposta
        "estatisticas": {
            "preco_minimo": preco_minimo,
            "preco_maximo": preco_maximo,
            "preco_medio": preco_medio,
            "preco_mediano": preco_mediano
        },
        "top_fornecedores": top_fornecedores,
        "fonte": contratos[0].get("fonte", "pncp") if contratos else None
    }


# ==================== SPRINT 1 - FUNCIONALIDADE 5: HISTÓRICO DE PREÇOS ====================

def tool_historico_precos(termo: str = None, produto_id: int = None, user_id: str = None) -> Dict[str, Any]:
    """
    Consulta histórico de preços registrados no banco de dados local.

    Args:
        termo: Termo de busca (nome do produto/equipamento)
        produto_id: ID do produto específico
        user_id: ID do usuário

    Returns:
        Dict com histórico de preços, estatísticas e tendências
    """
    from database import SessionLocal
    from models import PrecoHistorico, Edital, Produto
    from sqlalchemy import func, desc

    db = SessionLocal()

    try:
        # Query base
        query = db.query(PrecoHistorico)

        if produto_id:
            query = query.filter(PrecoHistorico.produto_id == produto_id)

        if user_id:
            query = query.filter(PrecoHistorico.user_id == user_id)

        # Se tem termo, buscar por objeto do edital ou produto
        if termo:
            query = query.join(Edital, PrecoHistorico.edital_id == Edital.id, isouter=True)
            query = query.filter(
                (Edital.objeto.ilike(f"%{termo}%")) |
                (PrecoHistorico.empresa_vencedora.ilike(f"%{termo}%"))
            )

        # Ordenar por data
        query = query.order_by(desc(PrecoHistorico.data_homologacao))

        registros = query.limit(50).all()

        if not registros:
            return {
                "success": False,
                "error": f"Nenhum histórico de preços encontrado para '{termo or 'todos'}'",
                "termo": termo
            }

        # Processar dados
        precos = []
        historico = []

        for r in registros:
            preco = r.preco_vencedor or r.nosso_preco
            if preco:
                precos.append(float(preco))
                historico.append({
                    "id": r.id,
                    "edital_id": r.edital_id,
                    "preco_vencedor": float(r.preco_vencedor) if r.preco_vencedor else None,
                    "nosso_preco": float(r.nosso_preco) if r.nosso_preco else None,
                    "empresa_vencedora": r.empresa_vencedora,
                    "resultado": r.resultado,
                    "data": r.data_homologacao.isoformat() if r.data_homologacao else None,
                    "fonte": r.fonte
                })

        # Estatísticas
        if precos:
            stats = {
                "preco_minimo": min(precos),
                "preco_maximo": max(precos),
                "preco_medio": sum(precos) / len(precos),
                "preco_mediano": sorted(precos)[len(precos) // 2],
                "total_registros": len(precos)
            }
        else:
            stats = {}

        return {
            "success": True,
            "termo": termo,
            "total": len(historico),
            "historico": historico,
            "estatisticas": stats
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


# ==================== SPRINT 1 - FUNCIONALIDADE 6: ANÁLISE DE CONCORRENTES ====================

def tool_listar_concorrentes(user_id: str = None) -> Dict[str, Any]:
    """
    Lista todos os concorrentes cadastrados no sistema.

    Returns:
        Dict com lista de concorrentes e estatísticas
    """
    from database import SessionLocal
    from models import Concorrente
    from sqlalchemy import desc

    db = SessionLocal()

    try:
        query = db.query(Concorrente).order_by(desc(Concorrente.editais_ganhos))
        concorrentes = query.all()

        if not concorrentes:
            return {
                "success": False,
                "error": "Nenhum concorrente cadastrado ainda",
                "dica": "Concorrentes são cadastrados automaticamente ao registrar resultados de editais"
            }

        lista = []
        for c in concorrentes:
            taxa = (c.editais_ganhos / c.editais_participados * 100) if c.editais_participados > 0 else 0
            lista.append({
                "id": c.id,
                "nome": c.nome,
                "cnpj": c.cnpj,
                "editais_participados": c.editais_participados,
                "editais_ganhos": c.editais_ganhos,
                "taxa_vitoria": round(taxa, 1),
                "preco_medio": float(c.preco_medio) if c.preco_medio else None
            })

        return {
            "success": True,
            "total": len(lista),
            "concorrentes": lista
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_analisar_concorrente(nome_concorrente: str, user_id: str = None) -> Dict[str, Any]:
    """
    Analisa um concorrente específico: histórico, taxa de vitória, preços.

    Args:
        nome_concorrente: Nome do concorrente
        user_id: ID do usuário

    Returns:
        Dict com análise detalhada do concorrente
    """
    from database import SessionLocal
    from models import Concorrente, ParticipacaoEdital, PrecoHistorico, Edital
    from sqlalchemy import desc

    db = SessionLocal()

    try:
        # Buscar concorrente
        concorrente = db.query(Concorrente).filter(
            Concorrente.nome.ilike(f"%{nome_concorrente}%")
        ).first()

        if not concorrente:
            return {
                "success": False,
                "error": f"Concorrente '{nome_concorrente}' não encontrado",
                "dica": "Use 'liste concorrentes' para ver os cadastrados"
            }

        # Buscar participações
        participacoes = db.query(ParticipacaoEdital).filter(
            ParticipacaoEdital.concorrente_id == concorrente.id
        ).order_by(desc(ParticipacaoEdital.created_at)).limit(20).all()

        historico = []
        precos = []
        vitorias = 0

        for p in participacoes:
            edital = db.query(Edital).filter(Edital.id == p.edital_id).first()
            if p.preco_proposto:
                precos.append(float(p.preco_proposto))
            if p.posicao_final == 1:
                vitorias += 1

            historico.append({
                "edital": edital.numero if edital else "N/A",
                "orgao": edital.orgao if edital else "N/A",
                "preco": float(p.preco_proposto) if p.preco_proposto else None,
                "posicao": p.posicao_final,
                "venceu": p.posicao_final == 1
            })

        taxa_vitoria = (concorrente.editais_ganhos / concorrente.editais_participados * 100) if concorrente.editais_participados > 0 else 0

        return {
            "success": True,
            "concorrente": {
                "id": concorrente.id,
                "nome": concorrente.nome,
                "cnpj": concorrente.cnpj,
                "editais_participados": concorrente.editais_participados,
                "editais_ganhos": concorrente.editais_ganhos,
                "taxa_vitoria": round(taxa_vitoria, 1)
            },
            "estatisticas_precos": {
                "preco_minimo": min(precos) if precos else None,
                "preco_maximo": max(precos) if precos else None,
                "preco_medio": sum(precos) / len(precos) if precos else None
            },
            "historico_participacoes": historico
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


# ==================== SPRINT 1 - FUNCIONALIDADE 7: RECOMENDAÇÃO DE PREÇOS ====================

def tool_recomendar_preco(termo: str, edital_id: int = None, user_id: str = None) -> Dict[str, Any]:
    """
    Recomenda faixa de preço baseada em histórico e análise de concorrentes.

    Args:
        termo: Termo/produto para buscar referências
        edital_id: ID do edital específico (opcional)
        user_id: ID do usuário

    Returns:
        Dict com recomendação de preço e justificativa
    """
    from database import SessionLocal
    from models import PrecoHistorico, Concorrente, Edital
    from sqlalchemy import desc

    db = SessionLocal()

    try:
        # 1. Buscar histórico de preços similar
        query = db.query(PrecoHistorico).join(
            Edital, PrecoHistorico.edital_id == Edital.id, isouter=True
        ).filter(
            Edital.objeto.ilike(f"%{termo}%")
        ).order_by(desc(PrecoHistorico.data_homologacao)).limit(20)

        registros = query.all()

        precos_vencedores = []
        precos_nossos = []
        concorrentes_frequentes = {}

        for r in registros:
            if r.preco_vencedor:
                precos_vencedores.append(float(r.preco_vencedor))
            if r.nosso_preco:
                precos_nossos.append(float(r.nosso_preco))
            if r.empresa_vencedora:
                if r.empresa_vencedora not in concorrentes_frequentes:
                    concorrentes_frequentes[r.empresa_vencedora] = 0
                concorrentes_frequentes[r.empresa_vencedora] += 1

        if not precos_vencedores:
            # Tentar buscar no PNCP
            resultado_pncp = tool_buscar_precos_pncp(termo, meses=12, user_id=user_id)
            if resultado_pncp.get("success"):
                stats = resultado_pncp.get("estatisticas", {})
                return {
                    "success": True,
                    "termo": termo,
                    "fonte": "pncp",
                    "recomendacao": {
                        "preco_minimo_sugerido": stats.get("preco_minimo", 0) * 0.95,
                        "preco_ideal": stats.get("preco_medio", 0) * 0.97,
                        "preco_maximo_sugerido": stats.get("preco_medio", 0),
                    },
                    "justificativa": f"Baseado em {resultado_pncp.get('total_contratos', 0)} contratos do PNCP",
                    "estatisticas_mercado": stats
                }
            else:
                return {
                    "success": False,
                    "error": f"Não há dados suficientes para recomendar preço para '{termo}'",
                    "dica": "Registre mais resultados de editais ou busque preços no PNCP"
                }

        # Calcular recomendação
        preco_medio_mercado = sum(precos_vencedores) / len(precos_vencedores)
        preco_minimo_mercado = min(precos_vencedores)

        # Estratégia: preço competitivo = média - 3% a 5%
        preco_ideal = preco_medio_mercado * 0.97
        preco_agressivo = preco_medio_mercado * 0.95
        preco_conservador = preco_medio_mercado * 0.99

        # Principal concorrente
        principal_concorrente = max(concorrentes_frequentes.items(), key=lambda x: x[1])[0] if concorrentes_frequentes else None

        return {
            "success": True,
            "termo": termo,
            "fonte": "historico_local",
            "recomendacao": {
                "preco_agressivo": round(preco_agressivo, 2),
                "preco_ideal": round(preco_ideal, 2),
                "preco_conservador": round(preco_conservador, 2)
            },
            "estatisticas_historico": {
                "preco_medio_vencedor": round(preco_medio_mercado, 2),
                "preco_minimo_vencedor": round(preco_minimo_mercado, 2),
                "total_registros": len(precos_vencedores)
            },
            "analise_concorrencia": {
                "principal_concorrente": principal_concorrente,
                "total_concorrentes": len(concorrentes_frequentes)
            },
            "justificativa": f"Baseado em {len(precos_vencedores)} registros históricos. Preço médio vencedor: R$ {preco_medio_mercado:,.2f}"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


# ==================== SPRINT 1 - FUNCIONALIDADE 8: CLASSIFICAÇÃO DE EDITAIS ====================

def tool_classificar_edital(edital_id: int = None, texto_edital: str = None, user_id: str = None) -> Dict[str, Any]:
    """
    Classifica um edital em categorias (comodato, venda, aluguel, etc).

    Args:
        edital_id: ID do edital no banco
        texto_edital: Texto/objeto do edital para classificar
        user_id: ID do usuário

    Returns:
        Dict com categoria identificada e confiança
    """
    from database import SessionLocal
    from models import Edital

    # Categorias e suas keywords
    CATEGORIAS = {
        "comodato": ["comodato", "cessão", "cessao", "empréstimo", "emprestimo", "sem ônus", "sem onus"],
        "aluguel_reagentes": ["locação", "locacao", "aluguel", "reagentes", "com fornecimento"],
        "aluguel_simples": ["locação", "locacao", "aluguel", "equipamento"],
        "venda": ["aquisição", "aquisicao", "compra", "venda", "aquisicao de"],
        "consumo_reagentes": ["reagentes", "kits", "testes", "consumíveis", "consumiveis"],
        "insumos_hospitalares": ["material hospitalar", "insumos hospitalares", "descartáveis"],
        "insumos_laboratoriais": ["material laboratorial", "insumos laboratoriais", "vidraria"]
    }

    texto = ""
    edital_info = None

    # Obter texto do edital
    if edital_id:
        db = SessionLocal()
        try:
            edital = db.query(Edital).filter(Edital.id == edital_id).first()
            if edital:
                texto = f"{edital.objeto or ''} {edital.numero or ''}"
                edital_info = {"id": edital.id, "numero": edital.numero, "objeto": edital.objeto}
        finally:
            db.close()

    if texto_edital:
        texto = texto_edital

    if not texto:
        return {"success": False, "error": "Nenhum texto de edital fornecido"}

    texto_lower = texto.lower()

    # Classificar por keywords
    scores = {}
    for categoria, keywords in CATEGORIAS.items():
        score = sum(1 for kw in keywords if kw in texto_lower)
        if score > 0:
            scores[categoria] = score

    if not scores:
        return {
            "success": True,
            "edital": edital_info,
            "categoria": "outros",
            "confianca": 0,
            "justificativa": "Não foi possível identificar categoria específica"
        }

    # Categoria com maior score
    categoria_principal = max(scores.items(), key=lambda x: x[1])
    total_matches = sum(scores.values())
    confianca = (categoria_principal[1] / len(CATEGORIAS[categoria_principal[0]])) * 100

    return {
        "success": True,
        "edital": edital_info,
        "categoria": categoria_principal[0],
        "confianca": round(min(confianca, 100), 1),
        "todas_categorias": scores,
        "justificativa": f"Identificadas {categoria_principal[1]} palavras-chave da categoria '{categoria_principal[0]}'"
    }


# ==================== SPRINT 1 - FUNCIONALIDADE 9: VERIFICAR COMPLETUDE DO PRODUTO ====================

def tool_verificar_completude_produto(produto_id: int = None, nome_produto: str = None, user_id: str = None) -> Dict[str, Any]:
    """
    Verifica se um produto tem todas as informações necessárias para participar de licitações.

    Args:
        produto_id: ID do produto
        nome_produto: Nome do produto (busca)
        user_id: ID do usuário

    Returns:
        Dict com análise de completude e recomendações
    """
    from database import SessionLocal
    from models import Produto, ProdutoEspecificacao

    db = SessionLocal()

    try:
        # Buscar produto
        if produto_id:
            produto = db.query(Produto).filter(Produto.id == produto_id).first()
        elif nome_produto:
            produto = db.query(Produto).filter(
                (Produto.nome.ilike(f"%{nome_produto}%")) |
                (Produto.modelo.ilike(f"%{nome_produto}%"))
            ).first()
        else:
            return {"success": False, "error": "Informe o ID ou nome do produto"}

        if not produto:
            return {"success": False, "error": f"Produto não encontrado: {nome_produto or produto_id}"}

        # Campos obrigatórios e opcionais
        campos_obrigatorios = {
            "nome": produto.nome,
            "fabricante": produto.fabricante,
            "modelo": produto.modelo,
            "categoria": produto.categoria
        }

        campos_opcionais = {
            "descricao": produto.descricao if hasattr(produto, 'descricao') else None,
            "registro_anvisa": produto.registro_anvisa if hasattr(produto, 'registro_anvisa') else None,
        }

        # Buscar especificações
        specs = db.query(ProdutoEspecificacao).filter(
            ProdutoEspecificacao.produto_id == produto.id
        ).all()

        # Análise
        campos_preenchidos = sum(1 for v in campos_obrigatorios.values() if v)
        total_obrigatorios = len(campos_obrigatorios)
        percentual_completude = (campos_preenchidos / total_obrigatorios) * 100

        campos_faltantes = [k for k, v in campos_obrigatorios.items() if not v]

        # Recomendações
        recomendacoes = []
        if not produto.fabricante:
            recomendacoes.append("Adicione o fabricante do produto")
        if not produto.modelo:
            recomendacoes.append("Adicione o modelo do produto")
        if len(specs) < 5:
            recomendacoes.append(f"Adicione mais especificações técnicas (atual: {len(specs)})")
        if not hasattr(produto, 'registro_anvisa') or not produto.registro_anvisa:
            recomendacoes.append("Adicione o registro ANVISA (se aplicável)")

        # Status
        if percentual_completude >= 100 and len(specs) >= 5:
            status = "completo"
        elif percentual_completude >= 75:
            status = "quase_completo"
        elif percentual_completude >= 50:
            status = "incompleto"
        else:
            status = "muito_incompleto"

        return {
            "success": True,
            "produto": {
                "id": produto.id,
                "nome": produto.nome,
                "fabricante": produto.fabricante,
                "modelo": produto.modelo,
                "categoria": produto.categoria
            },
            "completude": {
                "percentual": round(percentual_completude, 1),
                "status": status,
                "campos_preenchidos": campos_preenchidos,
                "total_campos": total_obrigatorios
            },
            "especificacoes": {
                "total": len(specs),
                "minimo_recomendado": 5
            },
            "campos_faltantes": campos_faltantes,
            "recomendacoes": recomendacoes
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


# ==================== SPRINT 2: ALERTAS E MONITORAMENTO ====================

from models import Alerta, Monitoramento, Notificacao, PreferenciasNotificacao
from datetime import timedelta


def formatar_tempo(minutos: int) -> str:
    """Converte minutos para texto legível."""
    if minutos >= 1440:
        dias = minutos // 1440
        return f"{dias} dia(s)" if dias > 1 else "1 dia"
    elif minutos >= 60:
        horas = minutos // 60
        return f"{horas} hora(s)" if horas > 1 else "1 hora"
    else:
        return f"{minutos} minutos"


def formatar_tempo_restante(delta: timedelta) -> str:
    """Formata timedelta para texto legível."""
    total_seconds = int(delta.total_seconds())
    if total_seconds < 0:
        return "Já passou"

    dias = total_seconds // 86400
    horas = (total_seconds % 86400) // 3600
    minutos = (total_seconds % 3600) // 60

    partes = []
    if dias > 0:
        partes.append(f"{dias}d")
    if horas > 0:
        partes.append(f"{horas}h")
    if minutos > 0 and dias == 0:
        partes.append(f"{minutos}min")

    return " ".join(partes) if partes else "menos de 1 minuto"


def tool_configurar_alertas(user_id: str, edital_numero: str, tempos_minutos: List[int] = None,
                            tipo: str = "abertura", canais: List[str] = None) -> Dict:
    """
    Configura alertas de prazo para um edital.

    Args:
        user_id: ID do usuário
        edital_numero: Número do edital (ex: PE-001/2026)
        tempos_minutos: Lista de tempos em minutos antes do evento [4320, 1440, 60, 15]
        tipo: Tipo de alerta (abertura, impugnacao, recursos, proposta)
        canais: Lista de canais ["email", "push"]
    """
    db = get_db()
    try:
        # Buscar edital
        edital = db.query(Edital).filter(
            Edital.numero.ilike(f"%{edital_numero}%"),
            Edital.user_id == user_id
        ).first()

        if not edital:
            return {"success": False, "error": f"Edital '{edital_numero}' não encontrado."}

        # Determinar data base conforme tipo
        if tipo == "abertura":
            data_evento = edital.data_abertura
        elif tipo == "impugnacao":
            data_evento = edital.data_limite_impugnacao
        elif tipo == "recursos":
            data_evento = edital.data_recursos
        elif tipo == "proposta":
            data_evento = edital.data_limite_proposta
        else:
            data_evento = edital.data_abertura

        if not data_evento:
            return {"success": False, "error": f"Edital não possui data de {tipo} cadastrada."}

        # Buscar preferências do usuário
        prefs = db.query(PreferenciasNotificacao).filter(
            PreferenciasNotificacao.user_id == user_id
        ).first()

        # Tempos padrão se não especificado
        if not tempos_minutos:
            tempos_minutos = prefs.alertas_padrao if prefs else [4320, 1440, 60, 15]

        # Canais padrão
        if not canais:
            canais = ["email", "push"]

        alertas_criados = []
        agora = datetime.now()

        for tempo in tempos_minutos:
            data_disparo = data_evento - timedelta(minutes=tempo)

            # Não criar alerta se já passou
            if data_disparo <= agora:
                continue

            # Verificar se já existe alerta similar
            existente = db.query(Alerta).filter(
                Alerta.user_id == user_id,
                Alerta.edital_id == edital.id,
                Alerta.tipo == tipo,
                Alerta.tempo_antes_minutos == tempo,
                Alerta.status == 'agendado'
            ).first()

            if existente:
                continue

            alerta = Alerta(
                user_id=user_id,
                edital_id=edital.id,
                tipo=tipo,
                data_disparo=data_disparo,
                tempo_antes_minutos=tempo,
                status='agendado',  # Explicitamente definir status
                canal_email="email" in canais,
                canal_push="push" in canais,
                titulo=f"⏰ {edital.numero} - {formatar_tempo(tempo)} para {tipo}",
                mensagem=f"O edital {edital.numero} - {edital.orgao} tem {tipo} em {formatar_tempo(tempo)}."
            )
            db.add(alerta)
            alertas_criados.append({
                "tempo_antes": tempo,
                "tempo_formatado": formatar_tempo(tempo),
                "data_disparo": data_disparo.isoformat(),
                "canais": canais
            })

        db.commit()

        return {
            "success": True,
            "edital": {
                "numero": edital.numero,
                "orgao": edital.orgao,
                "data_evento": data_evento.isoformat(),
                "tipo_evento": tipo
            },
            "alertas_criados": alertas_criados,
            "total_criados": len(alertas_criados)
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_listar_alertas(user_id: str, apenas_agendados: bool = True,
                        periodo_dias: int = 30) -> Dict:
    """
    Lista alertas do usuário.

    Args:
        user_id: ID do usuário
        apenas_agendados: Se True, lista apenas alertas agendados
        periodo_dias: Período em dias para buscar alertas
    """
    db = get_db()
    try:
        data_limite = datetime.now() + timedelta(days=periodo_dias)

        query = db.query(Alerta).filter(
            Alerta.user_id == user_id
        )

        if apenas_agendados:
            query = query.filter(
                Alerta.status == 'agendado',
                Alerta.data_disparo >= datetime.now(),
                Alerta.data_disparo <= data_limite
            )

        alertas = query.order_by(Alerta.data_disparo).all()

        # Agrupar por edital
        editais_alertas = {}
        for alerta in alertas:
            edital = db.query(Edital).filter(Edital.id == alerta.edital_id).first()
            if not edital:
                continue

            if edital.id not in editais_alertas:
                tempo_restante = edital.data_abertura - datetime.now() if edital.data_abertura else None
                editais_alertas[edital.id] = {
                    "edital": {
                        "id": edital.id,
                        "numero": edital.numero,
                        "orgao": edital.orgao,
                        "objeto": edital.objeto[:100] + "..." if edital.objeto and len(edital.objeto) > 100 else edital.objeto,
                        "data_abertura": edital.data_abertura.isoformat() if edital.data_abertura else None,
                        "tempo_restante": formatar_tempo_restante(tempo_restante) if tempo_restante else None,
                        "status": edital.status
                    },
                    "alertas": []
                }

            editais_alertas[edital.id]["alertas"].append({
                "id": alerta.id,
                "tipo": alerta.tipo,
                "tempo_antes": formatar_tempo(alerta.tempo_antes_minutos) if alerta.tempo_antes_minutos else None,
                "data_disparo": alerta.data_disparo.isoformat() if alerta.data_disparo else None,
                "status": alerta.status,
                "canais": {
                    "email": alerta.canal_email,
                    "push": alerta.canal_push
                }
            })

        return {
            "success": True,
            "total_alertas": len(alertas),
            "total_editais": len(editais_alertas),
            "editais": list(editais_alertas.values())
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_dashboard_prazos(user_id: str, dias: int = 30) -> Dict:
    """
    Retorna dashboard de prazos com editais próximos.

    Args:
        user_id: ID do usuário
        dias: Quantidade de dias para frente a considerar
    """
    db = get_db()
    try:
        agora = datetime.now()
        data_limite = agora + timedelta(days=dias)

        # Buscar editais com data de abertura no período
        editais = db.query(Edital).filter(
            Edital.user_id == user_id,
            Edital.data_abertura != None,
            Edital.data_abertura >= agora,
            Edital.data_abertura <= data_limite,
            Edital.status.in_(['novo', 'analisando', 'participando', 'proposta_enviada'])
        ).order_by(Edital.data_abertura).all()

        resultado = []
        for edital in editais:
            tempo_restante = edital.data_abertura - agora

            # Buscar alertas configurados
            alertas = db.query(Alerta).filter(
                Alerta.edital_id == edital.id,
                Alerta.user_id == user_id,
                Alerta.status == 'agendado'
            ).all()

            # Determinar urgência
            dias_restantes = tempo_restante.days
            if dias_restantes <= 1:
                urgencia = "critico"
                emoji = "🔴"
            elif dias_restantes <= 3:
                urgencia = "alto"
                emoji = "🟠"
            elif dias_restantes <= 7:
                urgencia = "medio"
                emoji = "🟡"
            else:
                urgencia = "normal"
                emoji = "🟢"

            resultado.append({
                "edital": {
                    "id": edital.id,
                    "numero": edital.numero,
                    "orgao": edital.orgao,
                    "objeto": edital.objeto[:80] + "..." if edital.objeto and len(edital.objeto) > 80 else edital.objeto,
                    "valor_referencia": float(edital.valor_referencia) if edital.valor_referencia else None,
                    "status": edital.status
                },
                "datas": {
                    "abertura": edital.data_abertura.isoformat() if edital.data_abertura else None,
                    "abertura_formatada": edital.data_abertura.strftime("%d/%m/%Y %H:%M") if edital.data_abertura else None,
                    "impugnacao": edital.data_limite_impugnacao.strftime("%d/%m/%Y %H:%M") if edital.data_limite_impugnacao else None,
                    "proposta": edital.data_limite_proposta.strftime("%d/%m/%Y %H:%M") if edital.data_limite_proposta else None
                },
                "tempo_restante": {
                    "texto": formatar_tempo_restante(tempo_restante),
                    "dias": tempo_restante.days,
                    "horas": tempo_restante.seconds // 3600
                },
                "urgencia": urgencia,
                "emoji": emoji,
                "alertas_configurados": len(alertas),
                "alertas": [formatar_tempo(a.tempo_antes_minutos) for a in alertas if a.tempo_antes_minutos]
            })

        # Estatísticas
        stats = {
            "total": len(resultado),
            "criticos": len([e for e in resultado if e["urgencia"] == "critico"]),
            "altos": len([e for e in resultado if e["urgencia"] == "alto"]),
            "medios": len([e for e in resultado if e["urgencia"] == "medio"]),
            "normais": len([e for e in resultado if e["urgencia"] == "normal"])
        }

        return {
            "success": True,
            "periodo_dias": dias,
            "data_consulta": agora.isoformat(),
            "estatisticas": stats,
            "editais": resultado
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_calendario_editais(user_id: str, mes: int = None, ano: int = None) -> Dict:
    """
    Retorna calendário de editais do mês.

    Args:
        user_id: ID do usuário
        mes: Mês (1-12), padrão = mês atual
        ano: Ano, padrão = ano atual
    """
    db = get_db()
    try:
        agora = datetime.now()
        if not mes:
            mes = agora.month
        if not ano:
            ano = agora.year

        # Início e fim do mês
        inicio = datetime(ano, mes, 1)
        if mes == 12:
            fim = datetime(ano + 1, 1, 1)
        else:
            fim = datetime(ano, mes + 1, 1)

        # Buscar editais no período
        editais = db.query(Edital).filter(
            Edital.user_id == user_id,
            Edital.data_abertura != None,
            Edital.data_abertura >= inicio,
            Edital.data_abertura < fim
        ).order_by(Edital.data_abertura).all()

        # Organizar por dia
        calendario = {}
        for edital in editais:
            dia = edital.data_abertura.day
            if dia not in calendario:
                calendario[dia] = []

            calendario[dia].append({
                "numero": edital.numero,
                "orgao": edital.orgao[:30] + "..." if len(edital.orgao) > 30 else edital.orgao,
                "horario": edital.data_abertura.strftime("%H:%M"),
                "status": edital.status,
                "valor": float(edital.valor_referencia) if edital.valor_referencia else None
            })

        # Nomes dos meses
        meses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

        return {
            "success": True,
            "mes": mes,
            "ano": ano,
            "mes_nome": meses[mes],
            "total_editais": len(editais),
            "dias_com_editais": len(calendario),
            "calendario": calendario
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_configurar_monitoramento(user_id: str, termo: str, fontes: List[str] = None,
                                   ufs: List[str] = None, frequencia_horas: int = 4,
                                   score_minimo: int = 70, valor_minimo: float = None,
                                   valor_maximo: float = None) -> Dict:
    """
    Configura monitoramento automático de editais.

    Args:
        user_id: ID do usuário
        termo: Termo de busca (ex: "hematologia", "equipamento laboratorial")
        fontes: Lista de fontes ["pncp", "comprasnet", "bec"]
        ufs: Lista de UFs ["SP", "RJ"] ou None para todas
        frequencia_horas: Frequência de busca em horas
        score_minimo: Score mínimo para alertar
        valor_minimo: Valor mínimo do edital
        valor_maximo: Valor máximo do edital
    """
    db = get_db()
    try:
        # Verificar se já existe monitoramento similar
        existente = db.query(Monitoramento).filter(
            Monitoramento.user_id == user_id,
            Monitoramento.termo == termo.lower(),
            Monitoramento.ativo == True
        ).first()

        if existente:
            return {"success": False, "error": f"Já existe monitoramento ativo para '{termo}'."}

        # Criar monitoramento
        monitoramento = Monitoramento(
            user_id=user_id,
            termo=termo.lower(),
            fontes=fontes or ["pncp"],
            ufs=ufs,
            valor_minimo=valor_minimo,
            valor_maximo=valor_maximo,
            frequencia_horas=frequencia_horas,
            score_minimo_alerta=score_minimo,
            proximo_check=datetime.now() + timedelta(hours=frequencia_horas),
            notificar_email=True,
            notificar_push=True,
            ativo=True
        )
        db.add(monitoramento)
        db.commit()

        return {
            "success": True,
            "monitoramento": {
                "id": monitoramento.id,
                "termo": termo,
                "fontes": fontes or ["pncp"],
                "ufs": ufs,
                "frequencia_horas": frequencia_horas,
                "score_minimo": score_minimo,
                "proximo_check": monitoramento.proximo_check.isoformat()
            }
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_listar_monitoramentos(user_id: str, apenas_ativos: bool = True) -> Dict:
    """
    Lista monitoramentos do usuário.

    Args:
        user_id: ID do usuário
        apenas_ativos: Se True, lista apenas monitoramentos ativos
    """
    db = get_db()
    try:
        query = db.query(Monitoramento).filter(
            Monitoramento.user_id == user_id
        )

        if apenas_ativos:
            query = query.filter(Monitoramento.ativo == True)

        monitoramentos = query.order_by(Monitoramento.created_at.desc()).all()

        resultado = []
        for m in monitoramentos:
            # Contar notificações geradas
            notifs = db.query(Notificacao).filter(
                Notificacao.monitoramento_id == m.id
            ).count()

            resultado.append({
                "id": m.id,
                "termo": m.termo,
                "fontes": m.fontes,
                "ufs": m.ufs,
                "frequencia_horas": m.frequencia_horas,
                "score_minimo": m.score_minimo_alerta,
                "ativo": m.ativo,
                "ultimo_check": m.ultimo_check.isoformat() if m.ultimo_check else None,
                "proximo_check": m.proximo_check.isoformat() if m.proximo_check else None,
                "notificacoes_geradas": notifs,
                "created_at": m.created_at.isoformat() if m.created_at else None
            })

        return {
            "success": True,
            "total": len(resultado),
            "monitoramentos": resultado
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_desativar_monitoramento(user_id: str, termo: str = None,
                                  monitoramento_id: str = None) -> Dict:
    """
    Desativa um monitoramento.

    Args:
        user_id: ID do usuário
        termo: Termo do monitoramento a desativar
        monitoramento_id: ID do monitoramento (alternativa ao termo)
    """
    db = get_db()
    try:
        query = db.query(Monitoramento).filter(
            Monitoramento.user_id == user_id,
            Monitoramento.ativo == True
        )

        if monitoramento_id:
            query = query.filter(Monitoramento.id == monitoramento_id)
        elif termo:
            query = query.filter(Monitoramento.termo.ilike(f"%{termo}%"))
        else:
            return {"success": False, "error": "Informe o termo ou ID do monitoramento."}

        monitoramento = query.first()
        if not monitoramento:
            return {"success": False, "error": "Monitoramento não encontrado."}

        monitoramento.ativo = False
        db.commit()

        return {
            "success": True,
            "mensagem": f"Monitoramento de '{monitoramento.termo}' desativado.",
            "monitoramento_id": monitoramento.id
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_configurar_preferencias_notificacao(user_id: str, email_habilitado: bool = None,
                                              push_habilitado: bool = None,
                                              email_notificacao: str = None,
                                              horario_inicio: str = None,
                                              horario_fim: str = None,
                                              alertas_padrao: List[int] = None) -> Dict:
    """
    Configura preferências de notificação do usuário.

    Args:
        user_id: ID do usuário
        email_habilitado: Habilitar notificações por email
        push_habilitado: Habilitar notificações push
        email_notificacao: Email alternativo para notificações
        horario_inicio: Horário início permitido (HH:MM)
        horario_fim: Horário fim permitido (HH:MM)
        alertas_padrao: Lista de minutos para alertas padrão
    """
    db = get_db()
    try:
        # Buscar ou criar preferências
        prefs = db.query(PreferenciasNotificacao).filter(
            PreferenciasNotificacao.user_id == user_id
        ).first()

        if not prefs:
            prefs = PreferenciasNotificacao(user_id=user_id)
            db.add(prefs)

        # Atualizar campos informados
        if email_habilitado is not None:
            prefs.email_habilitado = email_habilitado
        if push_habilitado is not None:
            prefs.push_habilitado = push_habilitado
        if email_notificacao:
            prefs.email_notificacao = email_notificacao
        if horario_inicio:
            prefs.horario_inicio = horario_inicio
        if horario_fim:
            prefs.horario_fim = horario_fim
        if alertas_padrao:
            prefs.alertas_padrao = alertas_padrao

        db.commit()

        return {
            "success": True,
            "preferencias": prefs.to_dict()
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_historico_notificacoes(user_id: str, limite: int = 50,
                                 apenas_nao_lidas: bool = False) -> Dict:
    """
    Retorna histórico de notificações do usuário.

    Args:
        user_id: ID do usuário
        limite: Quantidade máxima de notificações
        apenas_nao_lidas: Se True, retorna apenas não lidas
    """
    db = get_db()
    try:
        query = db.query(Notificacao).filter(
            Notificacao.user_id == user_id
        )

        if apenas_nao_lidas:
            query = query.filter(Notificacao.lida == False)

        notificacoes = query.order_by(Notificacao.created_at.desc()).limit(limite).all()

        # Contar não lidas
        nao_lidas = db.query(Notificacao).filter(
            Notificacao.user_id == user_id,
            Notificacao.lida == False
        ).count()

        resultado = []
        for n in notificacoes:
            edital = None
            if n.edital_id:
                ed = db.query(Edital).filter(Edital.id == n.edital_id).first()
                if ed:
                    edital = {"numero": ed.numero, "orgao": ed.orgao}

            resultado.append({
                "id": n.id,
                "tipo": n.tipo,
                "titulo": n.titulo,
                "mensagem": n.mensagem,
                "edital": edital,
                "lida": n.lida,
                "created_at": n.created_at.isoformat() if n.created_at else None
            })

        return {
            "success": True,
            "total": len(resultado),
            "nao_lidas": nao_lidas,
            "notificacoes": resultado
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_marcar_notificacao_lida(user_id: str, notificacao_id: str = None,
                                  marcar_todas: bool = False) -> Dict:
    """
    Marca notificação(ões) como lida(s).

    Args:
        user_id: ID do usuário
        notificacao_id: ID da notificação específica
        marcar_todas: Se True, marca todas como lidas
    """
    db = get_db()
    try:
        if marcar_todas:
            db.query(Notificacao).filter(
                Notificacao.user_id == user_id,
                Notificacao.lida == False
            ).update({"lida": True, "lida_em": datetime.now()})
            db.commit()
            return {"success": True, "mensagem": "Todas as notificações marcadas como lidas."}

        if notificacao_id:
            notif = db.query(Notificacao).filter(
                Notificacao.id == notificacao_id,
                Notificacao.user_id == user_id
            ).first()

            if not notif:
                return {"success": False, "error": "Notificação não encontrada."}

            notif.lida = True
            notif.lida_em = datetime.now()
            db.commit()
            return {"success": True, "mensagem": "Notificação marcada como lida."}

        return {"success": False, "error": "Informe o ID da notificação ou use marcar_todas=True."}

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_extrair_datas_edital(user_id: str, texto_edital: str = None,
                               edital_numero: str = None) -> Dict:
    """
    Extrai datas importantes de um edital usando IA.

    Args:
        user_id: ID do usuário
        texto_edital: Texto extraído do PDF do edital
        edital_numero: Número do edital para atualizar
    """
    db = get_db()
    try:
        if not texto_edital:
            return {"success": False, "error": "Texto do edital não fornecido."}

        # Prompt para extração de datas
        prompt = f"""Analise este edital de licitação e extraia TODAS as datas importantes.

TEXTO DO EDITAL:
{texto_edital[:8000]}

INSTRUÇÕES:
- Converta todas as datas para o formato dd/mm/yyyy HH:MM (se houver horário) ou dd/mm/yyyy (se só data)
- Horários geralmente estão em horário de Brasília
- A "sessão pública" ou "abertura" é a data mais importante
- Impugnação geralmente é 3 dias antes da abertura
- Recursos geralmente é até 3 dias após a sessão

Retorne APENAS um JSON válido:
{{
    "numero": "número do edital (ex: PE-001/2026)",
    "data_publicacao": "dd/mm/yyyy ou null",
    "data_abertura": "dd/mm/yyyy HH:MM ou null",
    "data_impugnacao": "dd/mm/yyyy HH:MM ou null",
    "data_proposta": "dd/mm/yyyy HH:MM ou null",
    "data_recursos": "dd/mm/yyyy HH:MM ou null",
    "fuso": "Brasília",
    "observacoes": "qualquer observação relevante"
}}"""

        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=500)

        # Extrair JSON da resposta
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if not json_match:
            return {"success": False, "error": "Não foi possível extrair datas do texto."}

        dados = json.loads(json_match.group())

        # Função para parsear datas
        def parse_data(data_str):
            if not data_str or data_str == "null":
                return None
            formatos = ["%d/%m/%Y %H:%M", "%d/%m/%Y"]
            for fmt in formatos:
                try:
                    return datetime.strptime(data_str, fmt)
                except:
                    continue
            return None

        # Se tiver número do edital, atualizar no banco
        edital = None
        if edital_numero or dados.get("numero"):
            numero = edital_numero or dados.get("numero")
            edital = db.query(Edital).filter(
                Edital.numero.ilike(f"%{numero}%"),
                Edital.user_id == user_id
            ).first()

            if edital:
                if dados.get("data_abertura"):
                    edital.data_abertura = parse_data(dados["data_abertura"])
                if dados.get("data_impugnacao"):
                    edital.data_limite_impugnacao = parse_data(dados["data_impugnacao"])
                if dados.get("data_proposta"):
                    edital.data_limite_proposta = parse_data(dados["data_proposta"])
                if dados.get("data_recursos"):
                    edital.data_recursos = parse_data(dados["data_recursos"])
                if dados.get("data_publicacao"):
                    dt = parse_data(dados["data_publicacao"])
                    if dt:
                        edital.data_publicacao = dt.date()

                db.commit()

        return {
            "success": True,
            "datas_extraidas": dados,
            "edital_atualizado": edital.numero if edital else None
        }

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def tool_cancelar_alerta(user_id: str, alerta_id: str = None,
                          edital_numero: str = None, cancelar_todos: bool = False) -> Dict:
    """
    Cancela alerta(s).

    Args:
        user_id: ID do usuário
        alerta_id: ID do alerta específico
        edital_numero: Cancelar todos alertas do edital
        cancelar_todos: Cancelar todos alertas agendados
    """
    db = get_db()
    try:
        if cancelar_todos:
            count = db.query(Alerta).filter(
                Alerta.user_id == user_id,
                Alerta.status == 'agendado'
            ).update({"status": "cancelado"})
            db.commit()
            return {"success": True, "mensagem": f"{count} alertas cancelados."}

        if alerta_id:
            alerta = db.query(Alerta).filter(
                Alerta.id == alerta_id,
                Alerta.user_id == user_id,
                Alerta.status == 'agendado'
            ).first()

            if not alerta:
                return {"success": False, "error": "Alerta não encontrado."}

            alerta.status = 'cancelado'
            db.commit()
            return {"success": True, "mensagem": "Alerta cancelado."}

        if edital_numero:
            edital = db.query(Edital).filter(
                Edital.numero.ilike(f"%{edital_numero}%"),
                Edital.user_id == user_id
            ).first()

            if not edital:
                return {"success": False, "error": "Edital não encontrado."}

            count = db.query(Alerta).filter(
                Alerta.edital_id == edital.id,
                Alerta.user_id == user_id,
                Alerta.status == 'agendado'
            ).update({"status": "cancelado"})
            db.commit()
            return {"success": True, "mensagem": f"{count} alertas do edital {edital.numero} cancelados."}

        return {"success": False, "error": "Informe alerta_id, edital_numero ou cancelar_todos."}

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()
