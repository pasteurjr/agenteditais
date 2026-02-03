# Implementação Sprint 1 - Detalhamento Técnico

## 1. Recomendação de Preços (`recomendar_preco`)

### Fluxo de Implementação

```
USUÁRIO: "Qual preço sugerir para o edital PE-001/2026?"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO                                        │
│    detectar_intencao_ia() → "recomendar_preco"              │
│    Extrai: edital = "PE-001/2026"                           │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PROCESSAR (app.py)                                       │
│    processar_recomendar_preco(edital_id, user_id)           │
│    - Busca edital no banco                                  │
│    - Identifica categoria e produtos relacionados           │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TOOL (tools.py)                                          │
│    tool_recomendar_preco(edital_id, produto_id)             │
│                                                             │
│    3.1 Buscar editais similares (mesma categoria/produto)   │
│        SELECT * FROM precos_historicos                      │
│        WHERE categoria = X AND produto similar              │
│                                                             │
│    3.2 Calcular estatísticas                                │
│        - Preço médio vencedor                               │
│        - Preço mínimo/máximo                                │
│        - Desconto médio sobre referência                    │
│                                                             │
│    3.3 Buscar concorrentes frequentes                       │
│        SELECT * FROM concorrentes                           │
│        WHERE participou em editais similares                │
│                                                             │
│    3.4 Chamar LLM para análise inteligente                  │
│        PROMPT: "Com base no histórico: {dados}              │
│        Recomende faixas de preço com probabilidade"         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RESPOSTA                                                 │
│    💰 Recomendação de Preço - PE-001/2026:                  │
│    - Preço Agressivo: R$ 360k (78% chance)                  │
│    - Preço Moderado: R$ 385k (65% chance)                   │
│    - Preço Conservador: R$ 410k (42% chance)                │
│    Concorrente principal: MedLab (40% taxa vitória)         │
└─────────────────────────────────────────────────────────────┘
```

### Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `models.py` | Adicionar modelo `PrecoHistorico` |
| `tools.py` | Adicionar `tool_recomendar_preco()` |
| `app.py` | Adicionar intenção + `processar_recomendar_preco()` |

### Código Resumido

```python
# models.py
class PrecoHistorico(Base):
    __tablename__ = 'precos_historicos'
    id = Column(Integer, primary_key=True)
    edital_id = Column(Integer, ForeignKey('editais.id'))
    produto_id = Column(Integer, ForeignKey('produtos.id'))
    preco_referencia = Column(Numeric(15, 2))
    preco_vencedor = Column(Numeric(15, 2))
    empresa_vencedora = Column(String(255))
    data_homologacao = Column(Date)

# tools.py
def tool_recomendar_preco(edital_id: int, produto_id: int, db) -> dict:
    # 1. Buscar histórico de editais similares
    historico = db.query(PrecoHistorico).filter(
        PrecoHistorico.categoria == edital.categoria
    ).all()

    # 2. Calcular estatísticas
    precos = [h.preco_vencedor for h in historico]
    media = sum(precos) / len(precos)
    desconto_medio = calcular_desconto_medio(historico)

    # 3. Gerar recomendação via LLM
    prompt = f"""Histórico de {len(historico)} editais similares:
    - Preço médio: R$ {media}
    - Desconto médio: {desconto_medio}%
    - Valor referência atual: R$ {edital.valor_referencia}

    Recomende 3 faixas de preço com probabilidade de ganho."""

    resposta = call_deepseek([{"role": "user", "content": prompt}])
    return {"recomendacao": resposta, "historico": historico}

# app.py
def processar_recomendar_preco(message, user_id, db):
    edital = encontrar_edital(message, user_id, db)
    produto = encontrar_melhor_produto(edital, user_id, db)
    resultado = tool_recomendar_preco(edital.id, produto.id, db)
    return formatar_resposta_preco(resultado)
```

---

## 2. Histórico de Preços (`historico_precos`)

### Fluxo de Implementação

```
USUÁRIO: "Mostre o histórico de preços para equipamentos de hematologia"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO                                        │
│    detectar_intencao_ia() → "historico_precos"              │
│    Extrai: termo = "hematologia"                            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PROCESSAR (app.py)                                       │
│    processar_historico_precos(termo, user_id)               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TOOL (tools.py)                                          │
│    tool_historico_precos(termo, meses=12)                   │
│                                                             │
│    SELECT e.numero, e.orgao, e.data_abertura,               │
│           ph.preco_referencia, ph.preco_vencedor,           │
│           ph.empresa_vencedora                              │
│    FROM precos_historicos ph                                │
│    JOIN editais e ON ph.edital_id = e.id                    │
│    WHERE e.objeto LIKE '%hematologia%'                      │
│    ORDER BY e.data_abertura DESC                            │
│    LIMIT 20                                                 │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RESPOSTA (tabela formatada)                              │
│    📈 Histórico de Preços - Hematologia:                    │
│    | Data    | Edital | Órgão  | Ref.  | Venc. | Δ%   |     │
│    | Jan/26  | PE-123 | HC-SP  | 450k  | 398k  | -12% |     │
│    | Dez/25  | PE-456 | UNICAMP| 480k  | 425k  | -11% |     │
│    Tendência: Desconto médio de 10%                         │
└─────────────────────────────────────────────────────────────┘
```

### Diferença para Recomendação de Preços

| Histórico de Preços | Recomendação de Preços |
|---------------------|------------------------|
| Lista dados brutos | Analisa e sugere valor |
| Qualquer termo de busca | Edital específico |
| Não usa LLM | Usa LLM para análise |
| Informativo | Decisório |

### Código Resumido

```python
# tools.py
def tool_historico_precos(termo: str, meses: int = 12, db=None) -> list:
    data_limite = datetime.now() - timedelta(days=meses * 30)

    historico = db.query(
        Edital.numero, Edital.orgao, Edital.data_abertura,
        PrecoHistorico.preco_referencia, PrecoHistorico.preco_vencedor,
        PrecoHistorico.empresa_vencedora
    ).join(PrecoHistorico).filter(
        Edital.objeto.ilike(f'%{termo}%'),
        Edital.data_abertura >= data_limite
    ).order_by(Edital.data_abertura.desc()).limit(20).all()

    return [{
        "edital": h.numero,
        "orgao": h.orgao,
        "data": h.data_abertura,
        "referencia": h.preco_referencia,
        "vencedor": h.preco_vencedor,
        "desconto": calcular_desconto(h.preco_referencia, h.preco_vencedor)
    } for h in historico]

# app.py
def processar_historico_precos(message, user_id, db):
    termo = extrair_termo_busca(message)
    historico = tool_historico_precos(termo, db=db)

    if not historico:
        return "Não encontrei histórico de preços para esse termo."

    # Formatar como tabela markdown
    resposta = f"📈 **Histórico de Preços - {termo.title()}:**\n\n"
    resposta += "| Data | Edital | Órgão | Ref. | Vencedor | Δ% |\n"
    resposta += "|------|--------|-------|------|----------|----|\n"

    for h in historico:
        resposta += f"| {h['data']} | {h['edital']} | {h['orgao']} | {h['referencia']} | {h['vencedor']} | {h['desconto']}% |\n"

    return resposta
```

---

## 3. Lista de Concorrentes (`analisar_concorrentes`)

### Fluxo de Implementação

```
USUÁRIO: "Quem são os concorrentes em editais de hematologia?"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO                                        │
│    detectar_intencao_ia() → "analisar_concorrentes"         │
│    Extrai: segmento = "hematologia"                         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. TOOL (tools.py)                                          │
│    tool_analisar_concorrentes(segmento)                     │
│                                                             │
│    SELECT c.nome, c.cnpj,                                   │
│           COUNT(*) as participacoes,                        │
│           SUM(CASE WHEN ph.empresa_vencedora = c.nome       │
│               THEN 1 ELSE 0 END) as vitorias,               │
│           AVG(ph.preco_vencedor) as preco_medio             │
│    FROM concorrentes c                                      │
│    JOIN precos_historicos ph ON ...                         │
│    JOIN editais e ON e.id = ph.edital_id                    │
│    WHERE e.objeto LIKE '%hematologia%'                      │
│    GROUP BY c.id                                            │
│    ORDER BY vitorias DESC                                   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ANÁLISE COM LLM (opcional)                               │
│    Gerar insights sobre padrões dos concorrentes            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RESPOSTA                                                 │
│    🏆 Concorrentes em Hematologia:                          │
│    | Empresa     | Part. | Vitórias | Taxa | Preço Médio |  │
│    | MedLab      | 15    | 6        | 40%  | R$ 372k     |  │
│    | TechSaúde   | 12    | 4        | 33%  | R$ 389k     |  │
│    Insight: MedLab pratica preços 5% abaixo da média        │
└─────────────────────────────────────────────────────────────┘
```

### Modelo de Dados

```python
# models.py
class Concorrente(Base):
    __tablename__ = 'concorrentes'
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(20), unique=True)
    editais_participados = Column(Integer, default=0)
    editais_ganhos = Column(Integer, default=0)
    preco_medio = Column(Numeric(15, 2))
    segmentos = Column(Text)  # JSON com segmentos de atuação
    created_at = Column(DateTime, default=datetime.utcnow)

# Tabela de relacionamento concorrente <-> edital
class ParticipacaoEdital(Base):
    __tablename__ = 'participacoes_editais'
    id = Column(Integer, primary_key=True)
    concorrente_id = Column(Integer, ForeignKey('concorrentes.id'))
    edital_id = Column(Integer, ForeignKey('editais.id'))
    preco_proposto = Column(Numeric(15, 2))
    posicao_final = Column(Integer)  # 1 = vencedor
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Código Resumido

```python
# tools.py
def tool_analisar_concorrentes(segmento: str, db) -> dict:
    # Query com agregação
    concorrentes = db.execute(text("""
        SELECT
            c.nome,
            c.cnpj,
            COUNT(pe.id) as participacoes,
            SUM(CASE WHEN pe.posicao_final = 1 THEN 1 ELSE 0 END) as vitorias,
            AVG(pe.preco_proposto) as preco_medio
        FROM concorrentes c
        JOIN participacoes_editais pe ON c.id = pe.concorrente_id
        JOIN editais e ON e.id = pe.edital_id
        WHERE e.objeto LIKE :segmento
        GROUP BY c.id
        ORDER BY vitorias DESC
        LIMIT 10
    """), {"segmento": f"%{segmento}%"}).fetchall()

    # Calcular insights
    lista = []
    for c in concorrentes:
        taxa = (c.vitorias / c.participacoes * 100) if c.participacoes > 0 else 0
        lista.append({
            "nome": c.nome,
            "participacoes": c.participacoes,
            "vitorias": c.vitorias,
            "taxa": round(taxa, 1),
            "preco_medio": float(c.preco_medio) if c.preco_medio else 0
        })

    return {"concorrentes": lista, "segmento": segmento}
```

---

## 4. Classificação de Editais (`classificar_edital`)

### Fluxo de Implementação

```
USUÁRIO: "Classifique o edital PE-001/2026"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO                                        │
│    detectar_intencao_ia() → "classificar_edital"            │
│    Extrai: edital = "PE-001/2026"                           │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BUSCAR EDITAL E CONTEÚDO                                 │
│    - Carregar edital do banco                               │
│    - Carregar texto do termo de referência (se disponível)  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CLASSIFICAÇÃO EM 2 ETAPAS                                │
│                                                             │
│    ETAPA 1: Keyword Matching (rápido, sem LLM)              │
│    ┌─────────────────────────────────────────┐              │
│    │ Buscar palavras-chave no objeto/TR:     │              │
│    │ - "comodato", "cessão" → Comodato       │              │
│    │ - "aquisição", "compra" → Venda         │              │
│    │ - "locação", "aluguel" → Aluguel        │              │
│    │ - "reagentes", "consumo" → Consumo      │              │
│    │                                         │              │
│    │ Se confiança >= 85% → Retornar          │              │
│    │ Se confiança < 85% → ETAPA 2            │              │
│    └─────────────────────────────────────────┘              │
│                                                             │
│    ETAPA 2: Classificação por IA (apenas se ambíguo)        │
│    ┌─────────────────────────────────────────┐              │
│    │ PROMPT para LLM:                        │              │
│    │ "Classifique este edital em uma das     │              │
│    │ categorias: Comodato, Venda, Aluguel... │              │
│    │                                         │              │
│    │ Objeto: {objeto}                        │              │
│    │ Termo de Referência: {tr_resumido}      │              │
│    │                                         │              │
│    │ Retorne: categoria, confiança, motivo"  │              │
│    └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SALVAR E RESPONDER                                       │
│    - Atualizar edital.categoria_id no banco                 │
│    - Retornar classificação ao usuário                      │
│                                                             │
│    📊 Classificação do Edital PE-001/2026:                  │
│    - Categoria: Comodato de Equipamentos                    │
│    - Confiança: 92%                                         │
│    - Método: Keyword matching                               │
│    - Keywords: comodato, cessão, reagentes                  │
└─────────────────────────────────────────────────────────────┘
```

### Categorias Suportadas

| ID | Categoria | Keywords |
|----|-----------|----------|
| 1 | Comodato de Equipamentos | comodato, cessão, empréstimo |
| 2 | Aluguel com Reagentes | locação, aluguel, reagentes |
| 3 | Aluguel Simples | locação, aluguel (sem reagentes) |
| 4 | Venda de Equipamentos | aquisição, compra, venda |
| 5 | Consumo de Reagentes | reagentes, consumíveis, kits |
| 6 | Insumos Hospitalares | material hospitalar, insumos |
| 7 | Insumos Laboratoriais | material laboratorial |

### Código Resumido

```python
# models.py
class CategoriaEdital(Base):
    __tablename__ = 'categorias_editais'
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    keywords = Column(Text)  # JSON: ["comodato", "cessão", ...]

# tools.py
CATEGORIAS_KEYWORDS = {
    "comodato": {
        "keywords": ["comodato", "cessão", "cessao", "empréstimo", "emprestimo"],
        "anti_keywords": [],
        "peso": 1.0
    },
    "aluguel_reagentes": {
        "keywords": ["locação", "locacao", "aluguel", "reagentes"],
        "anti_keywords": [],
        "peso": 0.9
    },
    # ...
}

def tool_classificar_edital(edital_id: int, db) -> dict:
    edital = db.query(Edital).get(edital_id)
    texto = f"{edital.objeto} {edital.termo_referencia or ''}"
    texto_lower = texto.lower()

    # ETAPA 1: Keyword matching
    scores = {}
    for categoria, config in CATEGORIAS_KEYWORDS.items():
        score = 0
        keywords_encontradas = []
        for kw in config["keywords"]:
            if kw in texto_lower:
                score += config["peso"]
                keywords_encontradas.append(kw)
        scores[categoria] = {
            "score": score,
            "keywords": keywords_encontradas
        }

    # Encontrar melhor categoria
    melhor = max(scores.items(), key=lambda x: x[1]["score"])
    confianca = min(melhor[1]["score"] * 25, 100)  # Normalizar para 0-100

    # Se confiança < 85%, usar IA
    if confianca < 85:
        resultado_ia = classificar_com_ia(edital, texto)
        return resultado_ia

    return {
        "categoria": melhor[0],
        "confianca": confianca,
        "metodo": "keyword",
        "keywords": melhor[1]["keywords"]
    }

def classificar_com_ia(edital, texto: str) -> dict:
    prompt = f"""Classifique este edital de licitação em UMA das categorias:
    1. Comodato de Equipamentos
    2. Aluguel com Reagentes
    3. Aluguel Simples
    4. Venda de Equipamentos
    5. Consumo de Reagentes
    6. Insumos Hospitalares
    7. Insumos Laboratoriais

    OBJETO: {edital.objeto}

    TEXTO DO EDITAL (resumo):
    {texto[:3000]}

    Responda em JSON:
    {{"categoria": "nome", "confianca": 0-100, "justificativa": "motivo"}}
    """

    resposta = call_deepseek([{"role": "user", "content": prompt}])
    return json.loads(extrair_json(resposta))
```

---

## 5. Verificar Completude do Produto (`verificar_completude`)

### Fluxo de Implementação

```
USUÁRIO: "O que falta no cadastro do produto XN-1000?"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO                                        │
│    detectar_intencao_ia() → "verificar_completude"          │
│    Extrai: produto = "XN-1000"                              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BUSCAR PRODUTO E SPECS                                   │
│    SELECT * FROM produtos WHERE nome LIKE '%XN-1000%'       │
│    SELECT * FROM produtos_especificacoes WHERE produto_id=X │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. COMPARAR COM TEMPLATE DA CATEGORIA                       │
│                                                             │
│    Template "Equipamento Laboratorial":                     │
│    ┌─────────────────────────────────────┐                  │
│    │ OBRIGATÓRIOS:                       │                  │
│    │ - Fabricante ✅                     │                  │
│    │ - Modelo ✅                         │                  │
│    │ - Registro ANVISA ✅                │                  │
│    │ - Tensão ❌ (faltando!)             │                  │
│    │                                     │                  │
│    │ RECOMENDADOS:                       │                  │
│    │ - Peso ❌                           │                  │
│    │ - Dimensões ❌                      │                  │
│    │ - Consumo elétrico ❌               │                  │
│    │ - Processamento/hora ✅             │                  │
│    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ANÁLISE VIA LLM (buscar em editais anteriores)           │
│    "Quais specs são mais pedidas em editais dessa           │
│    categoria que não estão cadastradas no produto?"         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RESPOSTA                                                 │
│    📋 Análise do Produto XN-1000:                           │
│    - Specs cadastradas: 45                                  │
│    - Score completude: 78%                                  │
│                                                             │
│    ❌ Campos Faltantes (Alta Prioridade):                   │
│    1. Tensão de alimentação - Exigido em 92% dos editais    │
│    2. Peso (kg) - Exigido em 85% dos editais                │
│                                                             │
│    ⚠️ Campos Recomendados:                                  │
│    3. Dimensões (LxAxP) - Exigido em 60% dos editais        │
│    4. Consumo elétrico - Exigido em 45% dos editais         │
└─────────────────────────────────────────────────────────────┘
```

### Template de Especificações por Categoria

```python
# config.py ou templates_specs.py
TEMPLATES_SPECS = {
    "equipamento_laboratorial": {
        "obrigatorios": [
            {"nome": "fabricante", "label": "Fabricante"},
            {"nome": "modelo", "label": "Modelo"},
            {"nome": "registro_anvisa", "label": "Registro ANVISA"},
            {"nome": "tensao", "label": "Tensão de Alimentação"},
            {"nome": "processamento", "label": "Capacidade de Processamento"},
        ],
        "recomendados": [
            {"nome": "peso", "label": "Peso (kg)"},
            {"nome": "dimensoes", "label": "Dimensões (LxAxP)"},
            {"nome": "consumo", "label": "Consumo Elétrico (W)"},
            {"nome": "garantia", "label": "Garantia"},
            {"nome": "assistencia", "label": "Assistência Técnica"},
        ]
    },
    "reagente": {
        "obrigatorios": [
            {"nome": "fabricante", "label": "Fabricante"},
            {"nome": "registro_anvisa", "label": "Registro ANVISA"},
            {"nome": "apresentacao", "label": "Apresentação"},
            {"nome": "testes_kit", "label": "Testes por Kit"},
        ],
        # ...
    }
}
```

### Código Resumido

```python
# tools.py
def tool_verificar_completude(produto_id: int, db) -> dict:
    produto = db.query(Produto).get(produto_id)
    specs = db.query(ProdutoEspecificacao).filter_by(produto_id=produto_id).all()

    # Mapear specs existentes
    specs_existentes = {s.nome_especificacao.lower(): s.valor for s in specs}

    # Pegar template da categoria
    template = TEMPLATES_SPECS.get(produto.categoria, TEMPLATES_SPECS["equipamento_laboratorial"])

    # Verificar campos obrigatórios
    faltantes_obrig = []
    for campo in template["obrigatorios"]:
        if campo["nome"] not in specs_existentes:
            faltantes_obrig.append(campo)

    # Verificar campos recomendados
    faltantes_recom = []
    for campo in template["recomendados"]:
        if campo["nome"] not in specs_existentes:
            faltantes_recom.append(campo)

    # Calcular score
    total_campos = len(template["obrigatorios"]) + len(template["recomendados"])
    campos_preenchidos = total_campos - len(faltantes_obrig) - len(faltantes_recom)
    score = int((campos_preenchidos / total_campos) * 100)

    # Buscar frequência em editais (quais specs são mais pedidas)
    frequencias = calcular_frequencia_specs_editais(produto.categoria, db)

    return {
        "produto": produto.nome,
        "specs_cadastradas": len(specs),
        "score_completude": score,
        "faltantes_obrigatorios": faltantes_obrig,
        "faltantes_recomendados": faltantes_recom,
        "frequencias": frequencias
    }

def calcular_frequencia_specs_editais(categoria: str, db) -> dict:
    """Analisa editais da categoria para ver quais specs são mais pedidas."""
    requisitos = db.query(EditalRequisito).join(Edital).filter(
        Edital.categoria == categoria
    ).all()

    # Contar frequência de cada tipo de requisito
    contador = {}
    for req in requisitos:
        tipo = identificar_tipo_spec(req.descricao)
        contador[tipo] = contador.get(tipo, 0) + 1

    total = len(requisitos)
    return {k: round(v/total*100) for k, v in contador.items()}
```

---

## Resumo da Sprint 1

| Funcionalidade | Complexidade | Novos Models | Nova Tool | Usa LLM |
|----------------|--------------|--------------|-----------|---------|
| Recomendação de Preços | Alta | `PrecoHistorico` | `tool_recomendar_preco` | ✅ Sim |
| Histórico de Preços | Média | (usa PrecoHistorico) | `tool_historico_precos` | ❌ Não |
| Lista de Concorrentes | Alta | `Concorrente`, `ParticipacaoEdital` | `tool_analisar_concorrentes` | ⚡ Opcional |
| Classificação de Editais | Média | `CategoriaEdital` | `tool_classificar_edital` | ⚡ Condicional |
| Verificar Completude | Baixa | - | `tool_verificar_completude` | ❌ Não |

---

## Fontes de Dados de Preços Vencedores

### 1. API do PNCP (Portal Nacional de Contratações Públicas)

O PNCP possui endpoints que retornam resultados de licitações:

```
GET /contratos - Contratos firmados (contém valor)
GET /atas - Atas de registro de preço (contém preços unitários)
```

**Vantagens:** Dados oficiais, estruturados, API REST
**Desvantagens:** Nem todos os órgãos publicam, cobertura parcial

### 2. Scraping de Atas de Sessão

Após o pregão, é publicada a **Ata da Sessão Pública** com:
- Lances de todos os participantes
- Vencedor e valor final
- Empresas desclassificadas

### 3. Consulta ao Painel de Preços do Governo

O **Painel de Preços** (paineldeprecos.planejamento.gov.br) agrega preços praticados:

```
https://paineldeprecos.planejamento.gov.br/api/...
```

### 4. Entrada Manual pelo Usuário

O usuário registra o resultado após cada certame que participa.

---

## Proposta de Implementação Híbrida

```
┌─────────────────────────────────────────────────────────────────┐
│                    FONTES DE PREÇOS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AUTOMÁTICO  │  │ SEMI-AUTOM.  │  │   MANUAL     │          │
│  │              │  │              │  │              │          │
│  │ • API PNCP   │  │ • Scraping   │  │ • Usuário    │          │
│  │ • Painel de  │  │   de Atas    │  │   registra   │          │
│  │   Preços     │  │ • Extração   │  │   resultado  │          │
│  │              │  │   de PDF     │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴─────────────────┘                   │
│                      ▼                                          │
│         ┌────────────────────────┐                              │
│         │   precos_historicos    │                              │
│         │   concorrentes         │                              │
│         │   participacoes        │                              │
│         └────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Coleta via API PNCP (Automático)

A API do PNCP tem endpoint de contratos:

```python
# tools.py
def tool_buscar_precos_pncp(termo: str, meses: int = 12) -> list:
    """Busca contratos/atas no PNCP para obter preços praticados."""

    url = "https://pncp.gov.br/api/consulta/v1/contratos"
    params = {
        "q": termo,
        "dataInicial": (datetime.now() - timedelta(days=meses*30)).strftime("%Y-%m-%d"),
        "dataFinal": datetime.now().strftime("%Y-%m-%d"),
        "pagina": 1,
        "tamanhoPagina": 50
    }

    response = requests.get(url, params=params, timeout=30)
    contratos = response.json().get("data", [])

    precos = []
    for c in contratos:
        precos.append({
            "edital_numero": c.get("numeroCompra"),
            "orgao": c.get("orgaoEntidade", {}).get("razaoSocial"),
            "objeto": c.get("objetoCompra"),
            "valor_contrato": c.get("valorInicial"),
            "fornecedor": c.get("nomeRazaoSocialFornecedor"),
            "cnpj": c.get("cnpjCpfFornecedor"),
            "data": c.get("dataAssinatura")
        })

    return precos
```

### Endpoint de Atas de Registro de Preço

```python
def tool_buscar_atas_pncp(termo: str) -> list:
    """Busca atas de registro de preço (preços unitários)."""

    url = "https://pncp.gov.br/api/consulta/v1/atas"
    params = {"q": termo, "pagina": 1, "tamanhoPagina": 50}

    response = requests.get(url, params=params, timeout=30)
    atas = response.json().get("data", [])

    resultados = []
    for ata in atas:
        # Buscar itens da ata (preços unitários)
        itens_url = f"https://pncp.gov.br/api/consulta/v1/atas/{ata['id']}/itens"
        itens = requests.get(itens_url).json()

        for item in itens:
            resultados.append({
                "ata_numero": ata.get("numeroAta"),
                "orgao": ata.get("orgaoEntidade"),
                "item_descricao": item.get("descricao"),
                "preco_unitario": item.get("valorUnitario"),
                "quantidade": item.get("quantidade"),
                "fornecedor": item.get("fornecedor"),
                "vigencia": ata.get("dataFimVigencia")
            })

    return resultados
```

---

## 2. Registro Manual pelo Usuário (Mais Confiável)

O usuário registra o resultado após cada certame:

```
USUÁRIO: "Perdemos o edital PE-001/2026 por preço. Vencedor foi MedLab com R$ 365.000"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ DETECTAR INTENÇÃO: "registrar_resultado"                    │
│ Extrair:                                                    │
│   - edital: PE-001/2026                                     │
│   - resultado: derrota                                      │
│   - motivo: preço                                           │
│   - vencedor: MedLab                                        │
│   - preco_vencedor: R$ 365.000                              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ SALVAR:                                                     │
│                                                             │
│ INSERT INTO precos_historicos (                             │
│   edital_id, preco_vencedor, empresa_vencedora, ...         │
│ ) VALUES (123, 365000, 'MedLab', ...)                       │
│                                                             │
│ INSERT INTO concorrentes (nome, cnpj, ...)                  │
│ ON DUPLICATE KEY UPDATE editais_ganhos = editais_ganhos + 1 │
└─────────────────────────────────────────────────────────────┘
```

### Prompts para Registro de Resultado

| Prompt do Usuário | Dados Extraídos |
|-------------------|-----------------|
| "Perdemos o PE-001 por preço, vencedor MedLab R$ 365k" | edital, resultado=derrota, vencedor, preço |
| "Ganhamos o edital PE-002/2026 com R$ 290.000" | edital, resultado=vitória, nosso_preço |
| "Registre: PE-003 cancelado" | edital, resultado=cancelado |
| "O edital PE-004 foi para MedLab por R$ 400k, segundo lugar TechSaúde R$ 412k" | múltiplos participantes |

### Código de Registro

```python
# app.py
def processar_registrar_resultado(message: str, user_id: int, db):
    """Registra resultado de certame e alimenta base de preços."""

    # Extrair dados via LLM
    prompt = f"""Extraia os dados deste registro de resultado de licitação:

    Mensagem: "{message}"

    Retorne JSON:
    {{
        "edital": "número do edital",
        "resultado": "vitoria|derrota|cancelado|deserto",
        "nosso_preco": valor ou null,
        "preco_vencedor": valor ou null,
        "empresa_vencedora": "nome" ou null,
        "cnpj_vencedor": "cnpj" ou null,
        "motivo": "preco|tecnica|documentacao|prazo" ou null,
        "outros_participantes": [
            {{"empresa": "nome", "preco": valor, "posicao": 2}},
            ...
        ]
    }}"""

    resposta = call_deepseek([{"role": "user", "content": prompt}])
    dados = json.loads(extrair_json(resposta))

    # Buscar edital
    edital = db.query(Edital).filter(
        Edital.numero.ilike(f"%{dados['edital']}%"),
        Edital.user_id == user_id
    ).first()

    if not edital:
        return "❌ Edital não encontrado. Verifique o número."

    # Registrar preço histórico
    if dados.get("preco_vencedor"):
        preco_hist = PrecoHistorico(
            edital_id=edital.id,
            preco_referencia=edital.valor_referencia,
            preco_vencedor=dados["preco_vencedor"],
            empresa_vencedora=dados.get("empresa_vencedora"),
            cnpj_vencedor=dados.get("cnpj_vencedor"),
            data_homologacao=datetime.now()
        )
        db.add(preco_hist)

    # Registrar/atualizar concorrente
    if dados.get("empresa_vencedora"):
        concorrente = db.query(Concorrente).filter(
            Concorrente.nome == dados["empresa_vencedora"]
        ).first()

        if not concorrente:
            concorrente = Concorrente(
                nome=dados["empresa_vencedora"],
                cnpj=dados.get("cnpj_vencedor")
            )
            db.add(concorrente)

        concorrente.editais_participados += 1
        concorrente.editais_ganhos += 1

        # Recalcular preço médio
        concorrente.preco_medio = calcular_preco_medio(concorrente.id, db)

    # Registrar outros participantes
    for part in dados.get("outros_participantes", []):
        registrar_participante(edital.id, part, db)

    # Atualizar status do edital
    edital.status = "ganho" if dados["resultado"] == "vitoria" else "perdido"

    db.commit()

    return formatar_resposta_registro(dados, edital)
```

---

## 3. Extração Automática de Atas (Semi-automático)

Quando o usuário faz upload da ata da sessão:

```
USUÁRIO: [Upload ATA_SESSAO_PE001.pdf] "Extraia os resultados desta ata"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Extrair texto do PDF                                     │
│ 2. Enviar para LLM com prompt especializado                 │
│ 3. Extrair:                                                 │
│    - Vencedor de cada item/lote                             │
│    - Preço vencedor                                         │
│    - Lances de todos os participantes                       │
│    - Empresas desclassificadas e motivos                    │
└─────────────────────────────────────────────────────────────┘
```

```python
PROMPT_EXTRAIR_ATA = """Analise esta ata de sessão de pregão eletrônico e extraia:

1. Para CADA ITEM/LOTE, extraia:
   - Número do item
   - Descrição
   - Empresa vencedora
   - CNPJ do vencedor
   - Preço vencedor
   - Lista de participantes com seus lances

2. Empresas desclassificadas e motivos

TEXTO DA ATA:
{texto_ata}

Retorne em JSON:
{{
    "edital": "número",
    "data_sessao": "dd/mm/yyyy",
    "itens": [
        {{
            "item": 1,
            "descricao": "...",
            "vencedor": "empresa",
            "cnpj_vencedor": "...",
            "preco_vencedor": 123.45,
            "participantes": [
                {{"empresa": "...", "lance_final": 123.45, "posicao": 1}},
                ...
            ]
        }}
    ],
    "desclassificados": [
        {{"empresa": "...", "motivo": "..."}}
    ]
}}"""
```

---

## 4. Painel de Preços do Governo

```python
def tool_consultar_painel_precos(descricao: str, catmat: str = None) -> list:
    """Consulta o Painel de Preços do Governo Federal."""

    # O Painel de Preços usa códigos CATMAT/CATSER
    url = "https://paineldeprecos.planejamento.gov.br/api/v1/precos"

    params = {
        "descricao": descricao,
        "catmat": catmat,  # Código do material no SIASG
        "dataInicio": (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
        "dataFim": datetime.now().strftime("%Y-%m-%d")
    }

    response = requests.get(url, params=params)
    dados = response.json()

    return [{
        "descricao": item["descricao"],
        "preco_medio": item["precoMedio"],
        "preco_minimo": item["precoMinimo"],
        "preco_maximo": item["precoMaximo"],
        "quantidade_compras": item["quantidadeCompras"],
        "orgaos": item["orgaos"]
    } for item in dados.get("items", [])]
```

---

## Estratégia Recomendada para Sprint 1

| Prioridade | Fonte | Implementação |
|------------|-------|---------------|
| 🥇 1º | **Registro Manual** | Prompt "Registre resultado do edital X" |
| 🥈 2º | **API PNCP** | Job periódico buscando contratos |
| 🥉 3º | **Upload de Ata** | Extração com LLM quando usuário enviar |
| 4º | Painel de Preços | Consulta sob demanda |

### Fluxo Inicial (MVP da Sprint 1)

```
1. Usuário participa de edital
2. Após resultado, usuário digita:
   "Perdemos o PE-001 para MedLab com R$ 365k"
3. Sistema registra automaticamente:
   - precos_historicos
   - concorrentes
   - participacoes
4. Dados alimentam recomendação de preços futuros
```

---

*Documento gerado em: 03/02/2026*
