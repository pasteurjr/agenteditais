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

PROMPT_EXTRAIR_SPECS = """Você é um especialista em extração de especificações técnicas de manuais de equipamentos médicos/laboratoriais.

Analise o texto do manual abaixo e extraia TODAS as especificações técnicas encontradas.

Para cada especificação, retorne um objeto JSON com:
- nome_especificacao: nome da especificação (ex: "Sensibilidade", "Faixa de medição", "Precisão")
- valor: valor completo como está no texto (ex: "0.03 mg/dL", "10-500 mg/dL")
- unidade: unidade de medida se houver (ex: "mg/dL", "mm", "°C")
- valor_numerico: valor numérico extraído (null se não for numérico)
- operador: operador se houver ("<", "<=", "=", ">=", ">", "range")
- valor_min: valor mínimo se for range
- valor_max: valor máximo se for range

Retorne APENAS um array JSON válido, sem texto adicional.

TEXTO DO MANUAL:
{texto}

ESPECIFICAÇÕES EXTRAÍDAS (JSON):
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


# ==================== TOOLS ====================

def tool_web_search(query: str, user_id: str) -> Dict[str, Any]:
    """
    Busca informações na web.
    Retorna resultados de busca que podem conter links para PDFs/manuais.
    """
    # Simulação de busca web - em produção, usar API de busca real
    # Por enquanto, retorna instruções para o usuário
    return {
        "success": True,
        "message": f"Busca por: {query}",
        "instrucao": "Para baixar manuais, forneça a URL direta do PDF ou faça upload do arquivo.",
        "sugestao": f"Tente buscar em: Google '{query} filetype:pdf' ou no site do fabricante"
    }


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


def tool_processar_upload(filepath: str, user_id: str, nome_produto: str,
                          categoria: str, fabricante: str = None,
                          modelo: str = None) -> Dict[str, Any]:
    """
    Processa um arquivo PDF uploadado:
    1. Extrai texto com PyMuPDF
    2. Usa IA para extrair especificações
    3. Salva produto e specs no banco
    """
    db = get_db()
    try:
        # 1. Extrair texto do PDF
        texto = ""
        doc = fitz.open(filepath)
        for page in doc:
            texto += page.get_text()
        doc.close()

        if not texto.strip():
            return {"success": False, "error": "Não foi possível extrair texto do PDF"}

        # 2. Criar produto no banco
        produto = Produto(
            user_id=user_id,
            nome=nome_produto,
            categoria=categoria,
            fabricante=fabricante,
            modelo=modelo
        )
        db.add(produto)
        db.flush()

        # 3. Salvar documento
        doc_registro = ProdutoDocumento(
            produto_id=produto.id,
            tipo='manual',
            nome_arquivo=os.path.basename(filepath),
            path_arquivo=filepath,
            texto_extraido=texto[:50000],  # Limitar tamanho
            processado=False
        )
        db.add(doc_registro)

        # 4. Extrair especificações com IA
        # Limitar texto para não exceder contexto
        texto_limitado = texto[:15000]
        prompt = PROMPT_EXTRAIR_SPECS.format(texto=texto_limitado)

        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=8000)

        # 5. Parsear resposta e salvar specs
        specs_salvas = []
        try:
            # Tentar extrair JSON da resposta
            json_match = re.search(r'\[[\s\S]*\]', resposta)
            if json_match:
                specs = json.loads(json_match.group())
                for spec in specs:
                    spec_obj = ProdutoEspecificacao(
                        produto_id=produto.id,
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
        except json.JSONDecodeError:
            print(f"[TOOLS] Erro ao parsear specs: {resposta[:200]}")

        # 6. Marcar documento como processado
        doc_registro.processado = True
        db.commit()

        return {
            "success": True,
            "produto_id": produto.id,
            "nome": nome_produto,
            "specs_extraidas": len(specs_salvas),
            "specs": specs_salvas[:10]  # Retornar primeiras 10
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
            json_match = re.search(r'\[[\s\S]*\]', resposta)
            if json_match:
                specs = json.loads(json_match.group())
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


def tool_cadastrar_fonte(nome: str, tipo: str, url_base: str,
                         descricao: str = None, api_key: str = None) -> Dict[str, Any]:
    """
    Cadastra uma nova fonte de editais no banco.
    """
    db = get_db()
    try:
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
                # Datas: últimos 90 dias
                data_final = datetime.now()
                data_inicial = data_final - timedelta(days=90)

                base_params = {
                    "dataInicial": data_inicial.strftime("%Y%m%d"),
                    "dataFinal": data_final.strftime("%Y%m%d"),
                    "codigoModalidadeContratacao": 6,  # 6 = Pregão Eletrônico
                    "tamanhoPagina": 50
                }
                if uf:
                    base_params["uf"] = uf.upper()

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
                if any(t in termo_lower for t in ['médico', 'medico', 'hospital', 'saúde', 'saude', 'reagente']):
                    termos_busca.extend([
                        'médico', 'medico', 'hospitalar', 'hospital',
                        'saúde', 'saude', 'reagente', 'reagentes',
                        'laboratorio', 'laboratório', 'medicamento', 'medicamentos',
                        'equipamento médico', 'equipamento hospitalar',
                        'material hospitalar', 'insumo hospitalar'
                    ])

                print(f"[TOOLS] Termos de busca expandidos: {termos_busca[:8]}...")

                # Filtrar por termos de busca no objeto
                for item in items:
                    objeto = (item.get('objetoCompra', '') or '').lower()

                    # Verificar se algum termo está no objeto
                    match = any(t in objeto for t in termos_busca)
                    if termo and not match:
                        continue

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

                    edital = Edital(
                        user_id=user_id,
                        numero=item.get('numeroCompra', 'N/A'),
                        orgao=orgao_data.get('razaoSocial', 'N/A'),
                        orgao_tipo='municipal' if orgao_data.get('esferaId') == 'M' else 'federal',
                        uf=orgao_data.get('uf'),
                        objeto=objeto[:500] if objeto else f"Contratação - {termo}",
                        modalidade=modalidade_db,
                        valor_referencia=item.get('valorTotalEstimado'),
                        data_publicacao=item.get('dataPublicacaoPncp'),
                        data_abertura=item.get('dataAberturaProposta'),
                        fonte='PNCP',
                        url=link,
                        status='novo'
                    )
                    db.add(edital)
                    editais_encontrados.append(edital)
                    print(f"[TOOLS] + Edital: {edital.numero} - {edital.orgao[:30]}")

                    if len(editais_encontrados) >= 10:
                        break

                print(f"[TOOLS] Encontrados {len(editais_encontrados)} editais após filtro por '{termo}'")

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
                editais_encontrados = editais_db
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

        db.commit()

        return {
            "success": True,
            "fonte": fonte_obj.nome,
            "termo": termo,
            "editais": [e.to_dict() if hasattr(e, 'to_dict') else e for e in editais_encontrados],
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
            json_match = re.search(r'\[[\s\S]*\]', resposta)
            if json_match:
                requisitos = json.loads(json_match.group())
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
