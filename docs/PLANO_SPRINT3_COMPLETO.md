# Plano Sprint 3 - Inteligencia de Mercado e Propostas (Completo)

## Visao Geral

A Sprint 3 implementa **inteligencia competitiva avancada e geracao de propostas comerciais**, permitindo que o usuario tome decisoes estrategicas baseadas em dados de mercado e gere documentos profissionais para participacao em licitacoes.

### Objetivo Principal
Transformar dados de mercado em inteligencia acionavel e automatizar a geracao de propostas comerciais competitivas.

### Entregaveis

| # | Funcionalidade | Intencao | Prioridade | Status |
|---|----------------|----------|------------|--------|
| 1 | Analise de Concorrentes Detalhada | `analisar_concorrente` | Alta | Pendente |
| 2 | Recomendacao Inteligente de Precos | `recomendar_preco_inteligente` | Alta | Pendente |
| 3 | Geracao de Proposta Comercial Completa | `gerar_proposta_comercial` | Alta | Pendente |
| 4 | Simulador de Cenarios de Precos | `simular_cenarios` | Alta | Pendente |
| 5 | Dashboard de Performance | `dashboard_performance` | Media | Pendente |
| 6 | Exportacao de Relatorios | `exportar_relatorio` | Media | Pendente |
| 7 | Comparativo de Precos de Mercado | `comparar_precos_mercado` | Media | Pendente |
| 8 | Historico de Propostas | `historico_propostas` | Baixa | Pendente |
| 9 | Templates de Proposta | `gerenciar_templates` | Baixa | Pendente |

---

## Arquitetura de Dados

### Novas Tabelas

```sql
-- =====================================================
-- TABELA: propostas_comerciais
-- Propostas comerciais geradas pelo sistema
-- =====================================================
CREATE TABLE propostas_comerciais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    edital_id INT NOT NULL,
    produto_id INT,

    -- Dados da proposta
    numero_proposta VARCHAR(50),  -- PRP-001/2026
    versao INT DEFAULT 1,
    status ENUM('rascunho', 'revisao', 'finalizada', 'enviada', 'aceita', 'recusada') DEFAULT 'rascunho',

    -- Valores
    valor_proposto DECIMAL(15, 2) NOT NULL,
    valor_referencia DECIMAL(15, 2),
    desconto_percentual DECIMAL(5, 2),
    margem_estimada DECIMAL(5, 2),

    -- Estrategia
    estrategia_preco ENUM('agressivo', 'moderado', 'conservador') DEFAULT 'moderado',
    justificativa_preco TEXT,

    -- Conteudo
    conteudo_proposta LONGTEXT,  -- JSON ou Markdown com toda proposta
    observacoes TEXT,

    -- Arquivos gerados
    arquivo_pdf VARCHAR(255),
    arquivo_docx VARCHAR(255),

    -- Metadados
    data_validade DATE,
    enviada_em DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    INDEX idx_propostas_user (user_id),
    INDEX idx_propostas_edital (edital_id),
    INDEX idx_propostas_status (status)
);

-- =====================================================
-- TABELA: templates_proposta
-- Templates reutilizaveis para propostas
-- =====================================================
CREATE TABLE templates_proposta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,

    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria ENUM('equipamento', 'reagente', 'servico', 'misto', 'outro') DEFAULT 'equipamento',

    -- Template
    conteudo_template LONGTEXT NOT NULL,  -- Markdown com placeholders
    campos_obrigatorios JSON,  -- ["empresa", "cnpj", "produto", ...]

    -- Customizacao
    cabecalho TEXT,
    rodape TEXT,
    logo_path VARCHAR(255),

    -- Status
    ativo BOOLEAN DEFAULT TRUE,
    padrao BOOLEAN DEFAULT FALSE,  -- Template padrao da categoria

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_template_nome (user_id, nome),
    INDEX idx_templates_user (user_id),
    INDEX idx_templates_categoria (categoria)
);

-- =====================================================
-- TABELA: simulacoes_preco
-- Simulacoes de cenarios de preco
-- =====================================================
CREATE TABLE simulacoes_preco (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    edital_id INT,

    -- Dados da simulacao
    nome_simulacao VARCHAR(100),
    termo_busca VARCHAR(255),

    -- Cenarios (JSON array)
    cenarios JSON,  -- [{"nome": "Agressivo", "valor": 350000, "prob_vitoria": 85, "margem": 8}, ...]

    -- Parametros usados
    preco_referencia DECIMAL(15, 2),
    preco_medio_mercado DECIMAL(15, 2),
    preco_minimo_historico DECIMAL(15, 2),
    concorrentes_analisados INT,

    -- Recomendacao
    cenario_recomendado VARCHAR(50),
    justificativa TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (edital_id) REFERENCES editais(id),
    INDEX idx_simulacoes_user (user_id)
);

-- =====================================================
-- TABELA: relatorios_exportados
-- Historico de relatorios gerados
-- =====================================================
CREATE TABLE relatorios_exportados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,

    tipo ENUM('performance', 'concorrentes', 'precos', 'editais', 'propostas', 'completo') NOT NULL,
    nome VARCHAR(255),

    -- Parametros
    filtros JSON,  -- {"periodo": "30d", "status": ["ganho", "perdido"], ...}

    -- Arquivo
    formato ENUM('pdf', 'xlsx', 'csv', 'docx') NOT NULL,
    arquivo_path VARCHAR(255),
    tamanho_bytes INT,

    -- Status
    status ENUM('gerando', 'concluido', 'erro') DEFAULT 'gerando',
    erro_msg TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_relatorios_user (user_id),
    INDEX idx_relatorios_tipo (tipo)
);

-- =====================================================
-- TABELA: analises_concorrentes
-- Analises detalhadas de concorrentes
-- =====================================================
CREATE TABLE analises_concorrentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    concorrente_id INT NOT NULL,

    -- Periodo da analise
    periodo_inicio DATE,
    periodo_fim DATE,

    -- Metricas
    total_participacoes INT DEFAULT 0,
    total_vitorias INT DEFAULT 0,
    taxa_vitoria DECIMAL(5, 2),

    -- Precos
    preco_medio DECIMAL(15, 2),
    desconto_medio DECIMAL(5, 2),
    preco_minimo DECIMAL(15, 2),
    preco_maximo DECIMAL(15, 2),

    -- Comportamento
    segmentos_atuacao JSON,  -- ["hematologia", "bioquimica", ...]
    orgaos_frequentes JSON,  -- [{"orgao": "Hospital X", "qtd": 5}, ...]
    faixa_valor_preferida ENUM('pequeno', 'medio', 'grande') DEFAULT 'medio',

    -- Analise IA
    perfil_comportamental TEXT,  -- Descricao gerada por IA
    pontos_fortes JSON,
    pontos_fracos JSON,
    estrategia_sugerida TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (concorrente_id) REFERENCES concorrentes(id),
    INDEX idx_analises_conc_user (user_id),
    INDEX idx_analises_conc_concorrente (concorrente_id)
);

-- =====================================================
-- INDICES para performance
-- =====================================================
CREATE INDEX idx_precos_termo ON precos_historicos(termo_busca(50));
CREATE INDEX idx_participacoes_preco ON participacoes_editais(preco_proposto);

-- =====================================================
-- ALTERACOES em tabelas existentes
-- =====================================================
ALTER TABLE precos_historicos ADD COLUMN termo_busca VARCHAR(255);
ALTER TABLE precos_historicos ADD COLUMN regiao VARCHAR(50);

ALTER TABLE concorrentes ADD COLUMN perfil_competitivo TEXT;
ALTER TABLE concorrentes ADD COLUMN ultima_analise DATE;
```

### Diagrama de Relacionamentos

```
+------------------+     +------------------+     +------------------+
|      users       |---->|     editais      |<----|propostas_comerciais|
|                  |     |                  |     |                  |
|  - id            |     | - id             |     | - id             |
|  - email         |     | - numero         |     | - valor_proposto |
+--------+---------+     | - valor_ref      |     | - status         |
         |               +--------+---------+     | - arquivo_pdf    |
         |                        |               +------------------+
         |                        |
         |               +--------v---------+     +------------------+
         +-------------->| precos_historicos|<----|   concorrentes   |
         |               |                  |     |                  |
         |               | - preco_vencedor |     | - nome           |
         |               | - desconto_%     |     | - taxa_vitoria   |
         |               +------------------+     | - preco_medio    |
         |                                        +--------+---------+
         |                                                 |
         |               +------------------+              |
         +-------------->|simulacoes_preco  |              |
         |               |                  |     +--------v---------+
         |               | - cenarios       |     |analises_concorr. |
         |               | - recomendacao   |     |                  |
         |               +------------------+     | - perfil_comport |
         |                                        | - estrategia     |
         |               +------------------+     +------------------+
         +-------------->|templates_proposta|
                         |                  |
                         | - conteudo       |
                         | - campos_obrig   |
                         +------------------+
```

---

## Funcionalidade 1: Analise de Concorrentes Detalhada

### Intencao: `analisar_concorrente`

### Prompts do Usuario

| Exemplo de Prompt | Dados Extraidos |
|-------------------|-----------------|
| "Analise o concorrente MedLab" | nome_concorrente |
| "Qual o historico da empresa TechSaude em hematologia?" | nome, segmento |
| "Como a DiagnosticaBR se comporta em pregoes?" | nome |
| "Quais sao os principais concorrentes em equipamentos?" | segmento |
| "Compare MedLab vs TechSaude" | dois concorrentes |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: "Analise detalhadamente o concorrente MedLab"                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. DETECTAR INTENCAO                                                    |
|    Palavras-chave: "analise", "concorrente", "empresa", "historico"     |
|    -> intencao = "analisar_concorrente"                                 |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. BUSCAR DADOS DO CONCORRENTE                                          |
|                                                                         |
|    SELECT c.*, COUNT(p.id) as participacoes,                            |
|           SUM(CASE WHEN p.posicao_final = 1 THEN 1 ELSE 0 END) as ganhos|
|    FROM concorrentes c                                                  |
|    LEFT JOIN participacoes_editais p ON c.id = p.concorrente_id         |
|    WHERE c.nome LIKE '%MedLab%'                                         |
|    GROUP BY c.id                                                        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. BUSCAR HISTORICO DE PRECOS                                           |
|                                                                         |
|    SELECT ph.*, e.numero, e.orgao, e.objeto                             |
|    FROM precos_historicos ph                                            |
|    JOIN editais e ON ph.edital_id = e.id                                |
|    WHERE ph.concorrente_id = :id OR ph.empresa_vencedora LIKE '%MedLab%'|
|    ORDER BY ph.data_homologacao DESC                                    |
|    LIMIT 50                                                             |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 4. CALCULAR METRICAS                                                    |
|                                                                         |
|    - Taxa de vitoria = ganhos / participacoes * 100                     |
|    - Preco medio = AVG(preco_proposto)                                  |
|    - Desconto medio = AVG(desconto_percentual)                          |
|    - Segmentos = COUNT por categoria de edital                          |
|    - Orgaos frequentes = TOP 5 orgaos                                   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 5. GERAR ANALISE COM IA                                                 |
|                                                                         |
|    PROMPT:                                                              |
|    "Analise o perfil competitivo deste concorrente:                     |
|                                                                         |
|     DADOS:                                                              |
|     - Nome: MedLab                                                      |
|     - Participacoes: 45                                                 |
|     - Vitorias: 28 (62%)                                                |
|     - Preco medio: R$ 372.000                                           |
|     - Desconto medio: 15%                                               |
|     - Segmentos: hematologia (60%), bioquimica (30%), outros (10%)      |
|                                                                         |
|     Gere:                                                               |
|     1. Perfil comportamental (2-3 paragrafos)                           |
|     2. Pontos fortes (lista)                                            |
|     3. Pontos fracos (lista)                                            |
|     4. Estrategia para competir (recomendacoes)"                        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 6. SALVAR ANALISE                                                       |
|                                                                         |
|    INSERT INTO analises_concorrentes (...)                              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 7. RESPOSTA                                                             |
|                                                                         |
|    ## Analise do Concorrente: MedLab                                    |
|                                                                         |
|    ### Metricas                                                         |
|    | Indicador | Valor |                                                |
|    |-----------|-------|                                                |
|    | Participacoes | 45 |                                               |
|    | Vitorias | 28 (62%) |                                              |
|    | Preco Medio | R$ 372.000 |                                         |
|    | Desconto Medio | 15% |                                             |
|                                                                         |
|    ### Perfil Comportamental                                            |
|    MedLab e um concorrente agressivo no segmento de hematologia...      |
|                                                                         |
|    ### Pontos Fortes                                                    |
|    - Alta taxa de vitoria em pregoes                                    |
|    - Precos competitivos consistentes                                   |
|                                                                         |
|    ### Pontos Fracos                                                    |
|    - Menor presenca em bioquimica                                       |
|    - Documentacao tecnica menos detalhada                               |
|                                                                         |
|    ### Estrategia para Competir                                         |
|    Para vencer a MedLab, recomenda-se...                                |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
PROMPT_ANALISAR_CONCORRENTE = """Analise o perfil competitivo deste concorrente em licitacoes.

DADOS DO CONCORRENTE:
- Nome: {nome}
- CNPJ: {cnpj}
- Participacoes: {participacoes}
- Vitorias: {vitorias} ({taxa_vitoria:.1f}%)
- Preco medio: R$ {preco_medio:,.2f}
- Desconto medio sobre referencia: {desconto_medio:.1f}%
- Preco minimo praticado: R$ {preco_minimo:,.2f}
- Preco maximo praticado: R$ {preco_maximo:,.2f}

SEGMENTOS DE ATUACAO:
{segmentos}

ORGAOS MAIS FREQUENTES:
{orgaos}

HISTORICO RECENTE (ultimas 10 participacoes):
{historico}

INSTRUCOES:
Gere uma analise profissional e acionavel. Seja especifico e baseie-se nos dados.

Retorne JSON:
{{
    "perfil_comportamental": "2-3 paragrafos descrevendo o comportamento competitivo",
    "pontos_fortes": ["ponto 1", "ponto 2", ...],
    "pontos_fracos": ["ponto 1", "ponto 2", ...],
    "estrategia_sugerida": "Recomendacoes especificas para competir com este concorrente",
    "nivel_ameaca": "alto|medio|baixo",
    "observacoes": "qualquer observacao adicional relevante"
}}"""

def tool_analisar_concorrente_detalhado(nome_concorrente: str, user_id: str,
                                        segmento: str = None) -> Dict[str, Any]:
    """Gera analise detalhada de um concorrente."""

    db = get_db()
    try:
        # 1. Buscar concorrente
        concorrente = db.query(Concorrente).filter(
            Concorrente.nome.ilike(f"%{nome_concorrente}%")
        ).first()

        if not concorrente:
            return {"success": False, "error": f"Concorrente '{nome_concorrente}' nao encontrado."}

        # 2. Buscar participacoes
        query_part = db.query(ParticipacaoEdital).filter(
            ParticipacaoEdital.concorrente_id == concorrente.id
        )

        participacoes = query_part.all()
        vitorias = [p for p in participacoes if p.posicao_final == 1]

        # 3. Calcular metricas de preco
        precos = [p.preco_proposto for p in participacoes if p.preco_proposto]
        preco_medio = sum(precos) / len(precos) if precos else 0
        preco_minimo = min(precos) if precos else 0
        preco_maximo = max(precos) if precos else 0

        # 4. Buscar precos historicos com desconto
        precos_hist = db.query(PrecoHistorico).filter(
            PrecoHistorico.concorrente_id == concorrente.id
        ).all()

        descontos = [p.desconto_percentual for p in precos_hist if p.desconto_percentual]
        desconto_medio = sum(descontos) / len(descontos) if descontos else 0

        # 5. Identificar segmentos
        segmentos_dict = {}
        for p in participacoes:
            edital = db.query(Edital).filter(Edital.id == p.edital_id).first()
            if edital and edital.objeto:
                # Simplificar: usar primeiras palavras do objeto
                seg = edital.objeto[:50].split()[0] if edital.objeto else "outros"
                segmentos_dict[seg] = segmentos_dict.get(seg, 0) + 1

        segmentos_texto = "\n".join([f"- {k}: {v} participacoes" for k, v in
                                     sorted(segmentos_dict.items(), key=lambda x: -x[1])[:5]])

        # 6. Identificar orgaos frequentes
        orgaos_dict = {}
        for p in participacoes:
            edital = db.query(Edital).filter(Edital.id == p.edital_id).first()
            if edital and edital.orgao:
                orgaos_dict[edital.orgao] = orgaos_dict.get(edital.orgao, 0) + 1

        orgaos_texto = "\n".join([f"- {k}: {v} editais" for k, v in
                                  sorted(orgaos_dict.items(), key=lambda x: -x[1])[:5]])

        # 7. Montar historico recente
        historico_recente = db.query(ParticipacaoEdital).filter(
            ParticipacaoEdital.concorrente_id == concorrente.id
        ).order_by(ParticipacaoEdital.created_at.desc()).limit(10).all()

        historico_texto = ""
        for p in historico_recente:
            edital = db.query(Edital).filter(Edital.id == p.edital_id).first()
            if edital:
                resultado = "VENCEU" if p.posicao_final == 1 else f"{p.posicao_final}o lugar"
                historico_texto += f"- {edital.numero}: R$ {p.preco_proposto:,.2f} ({resultado})\n"

        # 8. Chamar IA para gerar analise
        taxa_vitoria = (len(vitorias) / len(participacoes) * 100) if participacoes else 0

        prompt = PROMPT_ANALISAR_CONCORRENTE.format(
            nome=concorrente.nome,
            cnpj=concorrente.cnpj or "N/A",
            participacoes=len(participacoes),
            vitorias=len(vitorias),
            taxa_vitoria=taxa_vitoria,
            preco_medio=preco_medio,
            desconto_medio=desconto_medio,
            preco_minimo=preco_minimo,
            preco_maximo=preco_maximo,
            segmentos=segmentos_texto or "Nao identificados",
            orgaos=orgaos_texto or "Nao identificados",
            historico=historico_texto or "Sem historico recente"
        )

        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=1500)

        try:
            analise_ia = json.loads(extrair_json(resposta))
        except:
            analise_ia = {
                "perfil_comportamental": "Analise nao disponivel",
                "pontos_fortes": [],
                "pontos_fracos": [],
                "estrategia_sugerida": "",
                "nivel_ameaca": "medio"
            }

        # 9. Salvar analise
        analise = AnaliseConcorrente(
            user_id=user_id,
            concorrente_id=concorrente.id,
            periodo_inicio=datetime.now() - timedelta(days=365),
            periodo_fim=datetime.now(),
            total_participacoes=len(participacoes),
            total_vitorias=len(vitorias),
            taxa_vitoria=taxa_vitoria,
            preco_medio=preco_medio,
            desconto_medio=desconto_medio,
            preco_minimo=preco_minimo,
            preco_maximo=preco_maximo,
            segmentos_atuacao=json.dumps(segmentos_dict),
            orgaos_frequentes=json.dumps(orgaos_dict),
            perfil_comportamental=analise_ia.get("perfil_comportamental"),
            pontos_fortes=json.dumps(analise_ia.get("pontos_fortes", [])),
            pontos_fracos=json.dumps(analise_ia.get("pontos_fracos", [])),
            estrategia_sugerida=analise_ia.get("estrategia_sugerida")
        )
        db.add(analise)

        # Atualizar concorrente
        concorrente.ultima_analise = datetime.now().date()
        concorrente.perfil_competitivo = analise_ia.get("perfil_comportamental")

        db.commit()

        return {
            "success": True,
            "concorrente": {
                "id": concorrente.id,
                "nome": concorrente.nome,
                "cnpj": concorrente.cnpj
            },
            "metricas": {
                "participacoes": len(participacoes),
                "vitorias": len(vitorias),
                "taxa_vitoria": taxa_vitoria,
                "preco_medio": preco_medio,
                "desconto_medio": desconto_medio,
                "preco_minimo": preco_minimo,
                "preco_maximo": preco_maximo
            },
            "segmentos": segmentos_dict,
            "orgaos_frequentes": orgaos_dict,
            "analise_ia": analise_ia
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()
```

---

## Funcionalidade 2: Recomendacao Inteligente de Precos

### Intencao: `recomendar_preco_inteligente`

### Prompts do Usuario

| Exemplo de Prompt | Dados Extraidos |
|-------------------|-----------------|
| "Qual preco devo colocar no PE-001/2026?" | edital |
| "Recomende preco para hematologia" | termo |
| "Quanto cobrar para vencer a MedLab?" | concorrente |
| "Preco competitivo para equipamento de R$ 500k" | valor_referencia |
| "Estrategia de preco agressiva para PE-002" | edital, estrategia |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: "Recomende um preco competitivo para o PE-001/2026"            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. BUSCAR DADOS DO EDITAL                                               |
|                                                                         |
|    SELECT * FROM editais WHERE numero LIKE '%PE-001%'                   |
|    -> valor_referencia, orgao, objeto, categoria                        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. BUSCAR HISTORICO DE PRECOS SIMILARES                                 |
|                                                                         |
|    SELECT * FROM precos_historicos                                      |
|    WHERE termo_busca LIKE '%hematologia%'                               |
|       OR edital_id IN (SELECT id FROM editais WHERE objeto LIKE '%...%')|
|    AND data_homologacao >= DATE_SUB(NOW(), INTERVAL 12 MONTH)           |
|    ORDER BY data_homologacao DESC                                       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. IDENTIFICAR CONCORRENTES PROVAVEIS                                   |
|                                                                         |
|    - Buscar concorrentes ativos no segmento                             |
|    - Calcular preco medio de cada um                                    |
|    - Estimar probabilidade de participacao                              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 4. CALCULAR FAIXAS DE PRECO                                             |
|                                                                         |
|    - Agressivo: preco_minimo_historico - 5%                             |
|    - Moderado: preco_medio_mercado                                      |
|    - Conservador: preco_medio + 10%                                     |
|                                                                         |
|    Para cada faixa, estimar:                                            |
|    - Probabilidade de vitoria                                           |
|    - Margem estimada                                                    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 5. GERAR RECOMENDACAO COM IA                                            |
|                                                                         |
|    PROMPT com todos os dados + pedir recomendacao justificada           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 6. RESPOSTA                                                             |
|                                                                         |
|    ## Recomendacao de Preco - PE-001/2026                               |
|                                                                         |
|    ### Dados do Edital                                                  |
|    - Valor Referencia: R$ 450.000                                       |
|    - Orgao: Hospital das Clinicas                                       |
|    - Concorrentes provaveis: MedLab, TechSaude, DiagnosticaBR           |
|                                                                         |
|    ### Analise de Mercado                                               |
|    - Preco medio praticado: R$ 372.000                                  |
|    - Desconto medio: 17%                                                |
|    - Preco vencedor tipico: R$ 350.000 - R$ 380.000                     |
|                                                                         |
|    ### Cenarios de Preco                                                |
|                                                                         |
|    | Estrategia | Preco | Prob. Vitoria | Margem |                       |
|    |------------|-------|---------------|--------|                       |
|    | Agressivo  | R$ 340k | 85% | 8% |                                  |
|    | Moderado   | R$ 365k | 65% | 15% |                                 |
|    | Conservador| R$ 395k | 35% | 22% |                                 |
|                                                                         |
|    ### Recomendacao                                                     |
|    **Preco sugerido: R$ 358.000 (Moderado-Agressivo)**                  |
|                                                                         |
|    Justificativa: Considerando o historico do Hospital das Clinicas...  |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
PROMPT_RECOMENDAR_PRECO = """Voce e um especialista em precificacao de licitacoes.

DADOS DO EDITAL:
- Numero: {numero}
- Orgao: {orgao}
- Objeto: {objeto}
- Valor de Referencia: R$ {valor_referencia:,.2f}

HISTORICO DE MERCADO (ultimos 12 meses):
- Precos vencedores: {precos_vencedores}
- Preco medio: R$ {preco_medio:,.2f}
- Preco minimo: R$ {preco_minimo:,.2f}
- Desconto medio sobre referencia: {desconto_medio:.1f}%

CONCORRENTES PROVAVEIS:
{concorrentes}

NOSSO HISTORICO:
- Participacoes similares: {nossas_participacoes}
- Taxa de vitoria: {nossa_taxa_vitoria:.1f}%
- Nosso preco medio: R$ {nosso_preco_medio:,.2f}

INSTRUCOES:
Analise os dados e recomende uma estrategia de preco.

Retorne JSON:
{{
    "preco_recomendado": numero,
    "estrategia": "agressivo|moderado|conservador",
    "probabilidade_vitoria": numero (0-100),
    "margem_estimada": numero (percentual),
    "justificativa": "Justificativa detalhada da recomendacao",
    "riscos": ["risco 1", "risco 2"],
    "alternativas": [
        {{"preco": numero, "probabilidade": numero, "margem": numero, "descricao": "..."}},
        ...
    ]
}}"""

def tool_recomendar_preco_inteligente(user_id: str, edital_id: int = None,
                                       termo: str = None,
                                       estrategia: str = "moderado") -> Dict[str, Any]:
    """Gera recomendacao inteligente de preco baseada em dados de mercado."""

    db = get_db()
    try:
        # 1. Buscar dados do edital
        edital = None
        if edital_id:
            edital = db.query(Edital).filter(
                Edital.id == edital_id,
                Edital.user_id == user_id
            ).first()

        if not edital and not termo:
            return {"success": False, "error": "Informe o edital ou termo de busca."}

        termo_busca = termo or edital.objeto[:50] if edital else termo

        # 2. Buscar historico de precos similares
        precos_hist = db.query(PrecoHistorico).filter(
            PrecoHistorico.data_homologacao >= datetime.now() - timedelta(days=365)
        ).all()

        # Filtrar por similaridade (simplificado)
        precos_relevantes = []
        for p in precos_hist:
            if termo_busca.lower() in (p.termo_busca or "").lower():
                precos_relevantes.append(p)

        if not precos_relevantes:
            # Usar todos os precos como fallback
            precos_relevantes = precos_hist[:50]

        precos_vencedores = [p.preco_vencedor for p in precos_relevantes if p.preco_vencedor]
        preco_medio = sum(precos_vencedores) / len(precos_vencedores) if precos_vencedores else 0
        preco_minimo = min(precos_vencedores) if precos_vencedores else 0

        descontos = [p.desconto_percentual for p in precos_relevantes if p.desconto_percentual]
        desconto_medio = sum(descontos) / len(descontos) if descontos else 15

        # 3. Identificar concorrentes provaveis
        concorrentes_freq = {}
        for p in precos_relevantes:
            if p.empresa_vencedora:
                concorrentes_freq[p.empresa_vencedora] = concorrentes_freq.get(p.empresa_vencedora, 0) + 1

        top_concorrentes = sorted(concorrentes_freq.items(), key=lambda x: -x[1])[:5]
        concorrentes_texto = "\n".join([f"- {nome}: {qtd} vitorias, preco medio R$ ..."
                                        for nome, qtd in top_concorrentes])

        # 4. Buscar nosso historico
        nossas_part = db.query(PrecoHistorico).filter(
            PrecoHistorico.user_id == user_id,
            PrecoHistorico.resultado.in_(['vitoria', 'derrota'])
        ).all()

        nossas_vitorias = [p for p in nossas_part if p.resultado == 'vitoria']
        nossa_taxa = (len(nossas_vitorias) / len(nossas_part) * 100) if nossas_part else 0
        nossos_precos = [p.nosso_preco for p in nossas_part if p.nosso_preco]
        nosso_preco_medio = sum(nossos_precos) / len(nossos_precos) if nossos_precos else 0

        # 5. Gerar recomendacao com IA
        valor_ref = edital.valor_referencia if edital else preco_medio * 1.2

        prompt = PROMPT_RECOMENDAR_PRECO.format(
            numero=edital.numero if edital else "N/A",
            orgao=edital.orgao if edital else "N/A",
            objeto=edital.objeto if edital else termo_busca,
            valor_referencia=valor_ref or 0,
            precos_vencedores=f"R$ {preco_minimo:,.0f} a R$ {max(precos_vencedores) if precos_vencedores else 0:,.0f}",
            preco_medio=preco_medio,
            preco_minimo=preco_minimo,
            desconto_medio=desconto_medio,
            concorrentes=concorrentes_texto or "Nao identificados",
            nossas_participacoes=len(nossas_part),
            nossa_taxa_vitoria=nossa_taxa,
            nosso_preco_medio=nosso_preco_medio
        )

        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=1500)

        try:
            recomendacao = json.loads(extrair_json(resposta))
        except:
            # Fallback: calcular manualmente
            if estrategia == "agressivo":
                preco_rec = preco_minimo * 0.98
                prob = 80
                margem = 5
            elif estrategia == "conservador":
                preco_rec = preco_medio * 1.05
                prob = 40
                margem = 20
            else:
                preco_rec = preco_medio * 0.95
                prob = 60
                margem = 12

            recomendacao = {
                "preco_recomendado": preco_rec,
                "estrategia": estrategia,
                "probabilidade_vitoria": prob,
                "margem_estimada": margem,
                "justificativa": "Recomendacao baseada em historico de precos",
                "riscos": [],
                "alternativas": []
            }

        # 6. Salvar simulacao
        simulacao = SimulacaoPreco(
            user_id=user_id,
            edital_id=edital.id if edital else None,
            nome_simulacao=f"Recomendacao {termo_busca[:30]}",
            termo_busca=termo_busca,
            cenarios=json.dumps(recomendacao.get("alternativas", [])),
            preco_referencia=valor_ref,
            preco_medio_mercado=preco_medio,
            preco_minimo_historico=preco_minimo,
            concorrentes_analisados=len(concorrentes_freq),
            cenario_recomendado=recomendacao.get("estrategia"),
            justificativa=recomendacao.get("justificativa")
        )
        db.add(simulacao)
        db.commit()

        return {
            "success": True,
            "edital": {
                "numero": edital.numero if edital else None,
                "orgao": edital.orgao if edital else None,
                "valor_referencia": valor_ref
            },
            "mercado": {
                "preco_medio": preco_medio,
                "preco_minimo": preco_minimo,
                "desconto_medio": desconto_medio,
                "amostras": len(precos_relevantes)
            },
            "concorrentes_provaveis": top_concorrentes,
            "recomendacao": recomendacao
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()
```

---

## Funcionalidade 3: Geracao de Proposta Comercial Completa

### Intencao: `gerar_proposta_comercial`

### Prompts do Usuario

| Exemplo de Prompt | Dados Extraidos |
|-------------------|-----------------|
| "Gere uma proposta para o PE-001/2026" | edital |
| "Crie proposta comercial para o edital X com preco de R$ 350k" | edital, preco |
| "Monte proposta com estrategia agressiva para PE-002" | edital, estrategia |
| "Proposta para Sysmex XN-1000 no edital PE-003" | produto, edital |
| "Gere proposta e exporte em PDF" | edital, formato |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: "Gere uma proposta comercial para o PE-001/2026"               |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. BUSCAR DADOS NECESSARIOS                                             |
|                                                                         |
|    - Edital: numero, orgao, objeto, valor_referencia, requisitos        |
|    - Produto: especificacoes, documentos                                |
|    - Empresa: dados cadastrais, certidoes                               |
|    - Historico: proposta anterior se existir                            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. BUSCAR/SELECIONAR TEMPLATE                                           |
|                                                                         |
|    SELECT * FROM templates_proposta                                     |
|    WHERE user_id = :user_id                                             |
|    AND categoria = :categoria_edital                                    |
|    AND (padrao = TRUE OR ativo = TRUE)                                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. CALCULAR/CONFIRMAR PRECO                                             |
|                                                                         |
|    Se usuario informou preco -> usar                                    |
|    Senao -> chamar tool_recomendar_preco_inteligente                    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 4. GERAR CONTEUDO DA PROPOSTA                                           |
|                                                                         |
|    PROMPT_GERAR_PROPOSTA:                                               |
|    "Gere uma proposta comercial profissional.                           |
|                                                                         |
|     EDITAL: {dados_edital}                                              |
|     PRODUTO: {dados_produto}                                            |
|     EMPRESA: {dados_empresa}                                            |
|     PRECO: {preco_proposto}                                             |
|     TEMPLATE: {template}                                                |
|                                                                         |
|     Gere:                                                               |
|     1. Carta de apresentacao                                            |
|     2. Especificacoes tecnicas (conforme requisitos)                    |
|     3. Condicoes comerciais                                             |
|     4. Prazo de entrega e garantia                                      |
|     5. Qualificacao tecnica"                                            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 5. SALVAR PROPOSTA                                                      |
|                                                                         |
|    INSERT INTO propostas_comerciais (                                   |
|      user_id, edital_id, produto_id, numero_proposta,                   |
|      valor_proposto, conteudo_proposta, status, ...                     |
|    )                                                                    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 6. GERAR ARQUIVOS (se solicitado)                                       |
|                                                                         |
|    - Converter Markdown para PDF                                        |
|    - Converter Markdown para DOCX                                       |
|    - Salvar paths dos arquivos                                          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 7. RESPOSTA                                                             |
|                                                                         |
|    ## Proposta Comercial Gerada                                         |
|                                                                         |
|    **Numero:** PRP-001/2026                                             |
|    **Edital:** PE-001/2026 - Hospital das Clinicas                      |
|    **Valor:** R$ 358.000,00                                             |
|    **Status:** Rascunho                                                 |
|                                                                         |
|    ### Preview da Proposta                                              |
|    [Primeiros paragrafos...]                                            |
|                                                                         |
|    ### Acoes Disponiveis                                                |
|    - "Exporte esta proposta em PDF"                                     |
|    - "Altere o preco para R$ 350.000"                                   |
|    - "Revise a secao de especificacoes"                                 |
|    - "Marque como finalizada"                                           |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
PROMPT_GERAR_PROPOSTA = """Gere uma proposta comercial profissional para esta licitacao.

DADOS DO EDITAL:
- Numero: {numero_edital}
- Orgao: {orgao}
- Objeto: {objeto}
- Valor de Referencia: R$ {valor_referencia:,.2f}
- Requisitos Tecnicos:
{requisitos}

DADOS DO PRODUTO:
- Nome: {nome_produto}
- Fabricante: {fabricante}
- Modelo: {modelo}
- Especificacoes:
{especificacoes}

DADOS DA EMPRESA PROPONENTE:
- Razao Social: {razao_social}
- CNPJ: {cnpj}
- Endereco: {endereco}
- Contato: {contato}

PRECO PROPOSTO: R$ {preco_proposto:,.2f}
DESCONTO: {desconto:.1f}% sobre referencia
VALIDADE: {validade_dias} dias
PRAZO DE ENTREGA: {prazo_entrega} dias

INSTRUCOES:
1. Gere uma proposta comercial formal e profissional
2. Inclua todas as secoes necessarias
3. Destaque os diferenciais tecnicos
4. Seja objetivo e direto
5. Use linguagem formal de licitacoes

Retorne a proposta em formato Markdown estruturado."""

def tool_gerar_proposta_comercial(user_id: str, edital_id: int,
                                   produto_id: int = None,
                                   preco: float = None,
                                   estrategia: str = "moderado",
                                   exportar_pdf: bool = False) -> Dict[str, Any]:
    """Gera proposta comercial completa para um edital."""

    db = get_db()
    try:
        # 1. Buscar edital
        edital = db.query(Edital).filter(
            Edital.id == edital_id,
            Edital.user_id == user_id
        ).first()

        if not edital:
            return {"success": False, "error": "Edital nao encontrado."}

        # 2. Buscar produto (se informado)
        produto = None
        if produto_id:
            produto = db.query(Produto).filter(
                Produto.id == produto_id,
                Produto.user_id == user_id
            ).first()

        # 3. Buscar requisitos do edital
        requisitos = db.query(EditalRequisito).filter(
            EditalRequisito.edital_id == edital_id
        ).all()

        requisitos_texto = "\n".join([f"- {r.descricao}" for r in requisitos]) or "Nao especificados"

        # 4. Buscar especificacoes do produto
        especificacoes = []
        if produto:
            especs = db.query(ProdutoEspecificacao).filter(
                ProdutoEspecificacao.produto_id == produto_id
            ).all()
            especificacoes = [f"- {e.nome_especificacao}: {e.valor} {e.unidade or ''}" for e in especs]

        especificacoes_texto = "\n".join(especificacoes) or "Ver catalogo anexo"

        # 5. Buscar dados da empresa (usuario)
        user = db.query(User).filter(User.id == user_id).first()

        # 6. Calcular preco se nao informado
        if not preco:
            rec = tool_recomendar_preco_inteligente(user_id, edital_id=edital_id, estrategia=estrategia)
            if rec.get("success"):
                preco = rec["recomendacao"]["preco_recomendado"]
            else:
                # Usar valor de referencia com desconto padrao
                preco = edital.valor_referencia * 0.85 if edital.valor_referencia else 0

        desconto = ((edital.valor_referencia - preco) / edital.valor_referencia * 100) if edital.valor_referencia else 0

        # 7. Gerar numero da proposta
        ultima_proposta = db.query(PropostaComercial).filter(
            PropostaComercial.user_id == user_id
        ).order_by(PropostaComercial.id.desc()).first()

        num_seq = (ultima_proposta.id + 1) if ultima_proposta else 1
        numero_proposta = f"PRP-{num_seq:03d}/{datetime.now().year}"

        # 8. Gerar conteudo com IA
        prompt = PROMPT_GERAR_PROPOSTA.format(
            numero_edital=edital.numero,
            orgao=edital.orgao,
            objeto=edital.objeto,
            valor_referencia=edital.valor_referencia or 0,
            requisitos=requisitos_texto,
            nome_produto=produto.nome if produto else "Conforme edital",
            fabricante=produto.fabricante if produto else "A definir",
            modelo=produto.modelo if produto else "A definir",
            especificacoes=especificacoes_texto,
            razao_social=user.nome if user else "Empresa",
            cnpj=user.cpf_cnpj if hasattr(user, 'cpf_cnpj') else "00.000.000/0001-00",
            endereco="A definir",
            contato=user.email if user else "contato@empresa.com",
            preco_proposto=preco,
            desconto=desconto,
            validade_dias=60,
            prazo_entrega=30
        )

        conteudo = call_deepseek([{"role": "user", "content": prompt}], max_tokens=3000)

        # 9. Salvar proposta
        proposta = PropostaComercial(
            user_id=user_id,
            edital_id=edital_id,
            produto_id=produto_id,
            numero_proposta=numero_proposta,
            versao=1,
            status="rascunho",
            valor_proposto=preco,
            valor_referencia=edital.valor_referencia,
            desconto_percentual=desconto,
            estrategia_preco=estrategia,
            conteudo_proposta=conteudo,
            data_validade=datetime.now() + timedelta(days=60)
        )
        db.add(proposta)
        db.flush()

        # 10. Gerar PDF se solicitado
        arquivo_pdf = None
        if exportar_pdf:
            arquivo_pdf = gerar_pdf_proposta(proposta, conteudo)
            proposta.arquivo_pdf = arquivo_pdf

        db.commit()

        return {
            "success": True,
            "proposta": {
                "id": proposta.id,
                "numero": numero_proposta,
                "edital": edital.numero,
                "orgao": edital.orgao,
                "valor_proposto": preco,
                "desconto": desconto,
                "status": "rascunho",
                "arquivo_pdf": arquivo_pdf
            },
            "conteudo_preview": conteudo[:1500] + "..." if len(conteudo) > 1500 else conteudo
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()

def gerar_pdf_proposta(proposta, conteudo_markdown: str) -> str:
    """Converte proposta Markdown para PDF."""
    import markdown
    from weasyprint import HTML

    # Converter Markdown para HTML
    html_content = markdown.markdown(conteudo_markdown, extensions=['tables', 'fenced_code'])

    # Template HTML
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; }}
            h2 {{ color: #34495e; }}
            table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #3498db; color: white; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .footer {{ margin-top: 50px; font-size: 10px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>PROPOSTA COMERCIAL</h1>
            <p><strong>{proposta.numero_proposta}</strong></p>
        </div>
        {html_content}
        <div class="footer">
            <p>Documento gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}</p>
        </div>
    </body>
    </html>
    """

    # Gerar PDF
    output_path = f"uploads/propostas/{proposta.numero_proposta.replace('/', '-')}.pdf"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    HTML(string=html_template).write_pdf(output_path)

    return output_path
```

---

## Funcionalidade 4: Simulador de Cenarios de Precos

### Intencao: `simular_cenarios`

### Prompts do Usuario

| Exemplo de Prompt | Dados Extraidos |
|-------------------|-----------------|
| "Simule cenarios de preco para PE-001" | edital |
| "Compare estrategias agressiva, moderada e conservadora" | estrategias |
| "Qual a chance de ganhar com R$ 340k?" | preco_especifico |
| "Simule precos de 300k a 400k com intervalos de 20k" | faixa, intervalo |

### Codigo

```python
# tools.py
def tool_simular_cenarios(user_id: str, edital_id: int = None,
                          termo: str = None,
                          precos_simular: List[float] = None,
                          faixa_min: float = None,
                          faixa_max: float = None,
                          intervalo: float = None) -> Dict[str, Any]:
    """Simula multiplos cenarios de preco e calcula probabilidades."""

    db = get_db()
    try:
        # Buscar dados de mercado
        dados_mercado = tool_recomendar_preco_inteligente(user_id, edital_id, termo)
        if not dados_mercado.get("success"):
            return dados_mercado

        mercado = dados_mercado["mercado"]
        preco_medio = mercado["preco_medio"]
        preco_minimo = mercado["preco_minimo"]

        # Definir precos a simular
        if precos_simular:
            precos = precos_simular
        elif faixa_min and faixa_max:
            intervalo = intervalo or (faixa_max - faixa_min) / 5
            precos = []
            p = faixa_min
            while p <= faixa_max:
                precos.append(p)
                p += intervalo
        else:
            # Simular 5 cenarios padrao
            precos = [
                preco_minimo * 0.95,  # Super agressivo
                preco_minimo,          # Agressivo
                preco_medio * 0.95,    # Moderado
                preco_medio,           # Conservador
                preco_medio * 1.05     # Premium
            ]

        # Calcular cenarios
        cenarios = []
        for preco in precos:
            # Estimar probabilidade (simplificado)
            if preco <= preco_minimo * 0.9:
                prob = 95
                estrategia = "super_agressivo"
            elif preco <= preco_minimo:
                prob = 85
                estrategia = "agressivo"
            elif preco <= preco_medio * 0.95:
                prob = 70
                estrategia = "moderado_agressivo"
            elif preco <= preco_medio:
                prob = 55
                estrategia = "moderado"
            elif preco <= preco_medio * 1.05:
                prob = 40
                estrategia = "conservador"
            else:
                prob = 25
                estrategia = "premium"

            # Estimar margem (considerando custo como 70% do preco medio)
            custo_estimado = preco_medio * 0.7
            margem = ((preco - custo_estimado) / preco) * 100

            # Calcular valor esperado
            valor_esperado = preco * (prob / 100)

            cenarios.append({
                "preco": preco,
                "estrategia": estrategia,
                "probabilidade_vitoria": prob,
                "margem_estimada": margem,
                "valor_esperado": valor_esperado,
                "risco": "alto" if margem < 10 else "medio" if margem < 15 else "baixo"
            })

        # Identificar melhor cenario (maior valor esperado com margem aceitavel)
        cenarios_validos = [c for c in cenarios if c["margem_estimada"] >= 8]
        melhor = max(cenarios_validos, key=lambda x: x["valor_esperado"]) if cenarios_validos else cenarios[0]

        # Salvar simulacao
        simulacao = SimulacaoPreco(
            user_id=user_id,
            edital_id=edital_id,
            nome_simulacao=f"Simulacao {termo or 'edital'}",
            termo_busca=termo,
            cenarios=json.dumps(cenarios),
            preco_medio_mercado=preco_medio,
            preco_minimo_historico=preco_minimo,
            cenario_recomendado=melhor["estrategia"],
            justificativa=f"Melhor valor esperado: R$ {melhor['valor_esperado']:,.2f}"
        )
        db.add(simulacao)
        db.commit()

        return {
            "success": True,
            "mercado": mercado,
            "cenarios": cenarios,
            "recomendacao": {
                "cenario": melhor,
                "justificativa": f"Este cenario oferece o melhor equilibrio entre probabilidade de vitoria ({melhor['probabilidade_vitoria']}%) e margem ({melhor['margem_estimada']:.1f}%)."
            }
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()
```

---

## Funcionalidade 5: Dashboard de Performance

### Intencao: `dashboard_performance`

### Prompts do Usuario

| Exemplo de Prompt | Dados Extraidos |
|-------------------|-----------------|
| "Mostre minha performance" | periodo_padrao |
| "Dashboard dos ultimos 6 meses" | periodo |
| "Como estamos em hematologia?" | segmento |
| "Metricas de vitorias e derrotas" | tipo_metrica |

### Codigo

```python
# tools.py
def tool_dashboard_performance(user_id: str, periodo_dias: int = 180,
                               segmento: str = None) -> Dict[str, Any]:
    """Gera dashboard de performance em licitacoes."""

    db = get_db()
    try:
        data_inicio = datetime.now() - timedelta(days=periodo_dias)

        # Buscar resultados do periodo
        resultados = db.query(PrecoHistorico).filter(
            PrecoHistorico.user_id == user_id,
            PrecoHistorico.data_homologacao >= data_inicio.date()
        ).all()

        # Metricas gerais
        total = len(resultados)
        vitorias = len([r for r in resultados if r.resultado == 'vitoria'])
        derrotas = len([r for r in resultados if r.resultado == 'derrota'])
        outros = total - vitorias - derrotas

        taxa_vitoria = (vitorias / total * 100) if total > 0 else 0

        # Valor total
        valor_vitorias = sum([r.preco_vencedor or 0 for r in resultados if r.resultado == 'vitoria'])
        valor_perdido = sum([r.preco_vencedor or 0 for r in resultados if r.resultado == 'derrota'])

        # Analise de precos
        nossos_precos = [r.nosso_preco for r in resultados if r.nosso_preco]
        precos_vencedores = [r.preco_vencedor for r in resultados if r.preco_vencedor]

        preco_medio_nosso = sum(nossos_precos) / len(nossos_precos) if nossos_precos else 0
        preco_medio_vencedor = sum(precos_vencedores) / len(precos_vencedores) if precos_vencedores else 0

        # Gap de preco nas derrotas
        derrotas_dados = [r for r in resultados if r.resultado == 'derrota' and r.nosso_preco and r.preco_vencedor]
        gaps = [(r.nosso_preco - r.preco_vencedor) for r in derrotas_dados]
        gap_medio = sum(gaps) / len(gaps) if gaps else 0

        # Principais concorrentes que nos venceram
        vencedores = {}
        for r in resultados:
            if r.resultado == 'derrota' and r.empresa_vencedora:
                vencedores[r.empresa_vencedora] = vencedores.get(r.empresa_vencedora, 0) + 1

        top_vencedores = sorted(vencedores.items(), key=lambda x: -x[1])[:5]

        # Evolucao mensal
        evolucao = {}
        for r in resultados:
            if r.data_homologacao:
                mes = r.data_homologacao.strftime("%Y-%m")
                if mes not in evolucao:
                    evolucao[mes] = {"vitorias": 0, "derrotas": 0}
                if r.resultado == 'vitoria':
                    evolucao[mes]["vitorias"] += 1
                elif r.resultado == 'derrota':
                    evolucao[mes]["derrotas"] += 1

        return {
            "success": True,
            "periodo": {
                "dias": periodo_dias,
                "inicio": data_inicio.strftime("%d/%m/%Y"),
                "fim": datetime.now().strftime("%d/%m/%Y")
            },
            "metricas_gerais": {
                "total_participacoes": total,
                "vitorias": vitorias,
                "derrotas": derrotas,
                "outros": outros,
                "taxa_vitoria": taxa_vitoria
            },
            "valores": {
                "total_ganho": valor_vitorias,
                "total_perdido": valor_perdido,
                "preco_medio_nosso": preco_medio_nosso,
                "preco_medio_vencedor": preco_medio_vencedor,
                "gap_medio_derrotas": gap_medio
            },
            "competicao": {
                "principais_concorrentes": top_vencedores
            },
            "evolucao_mensal": evolucao,
            "insights": gerar_insights_performance(taxa_vitoria, gap_medio, top_vencedores)
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()

def gerar_insights_performance(taxa_vitoria: float, gap_medio: float,
                               top_vencedores: list) -> List[str]:
    """Gera insights baseados nos dados de performance."""
    insights = []

    if taxa_vitoria >= 60:
        insights.append("Excelente taxa de vitoria! Continue com a estrategia atual.")
    elif taxa_vitoria >= 40:
        insights.append("Taxa de vitoria mediana. Considere ajustar precos em 5-10%.")
    else:
        insights.append("Taxa de vitoria baixa. Revise sua estrategia de precificacao.")

    if gap_medio > 0:
        insights.append(f"Nas derrotas, seus precos estao em media R$ {gap_medio:,.2f} acima dos vencedores.")

    if top_vencedores:
        principal = top_vencedores[0][0]
        insights.append(f"Seu principal concorrente e {principal}. Analise sua estrategia.")

    return insights
```

---

## Funcionalidade 6: Exportacao de Relatorios

### Intencao: `exportar_relatorio`

### Codigo

```python
# tools.py
def tool_exportar_relatorio(user_id: str, tipo: str,
                            formato: str = "pdf",
                            filtros: dict = None) -> Dict[str, Any]:
    """Exporta relatorio em diversos formatos."""

    db = get_db()
    try:
        # Gerar dados conforme tipo
        if tipo == "performance":
            dados = tool_dashboard_performance(user_id)
        elif tipo == "concorrentes":
            dados = tool_listar_concorrentes(user_id)
        elif tipo == "precos":
            dados = tool_historico_precos(user_id=user_id)
        elif tipo == "propostas":
            dados = tool_historico_propostas(user_id)
        else:
            return {"success": False, "error": f"Tipo de relatorio invalido: {tipo}"}

        if not dados.get("success"):
            return dados

        # Gerar arquivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nome_arquivo = f"relatorio_{tipo}_{timestamp}"

        if formato == "pdf":
            arquivo_path = gerar_relatorio_pdf(nome_arquivo, tipo, dados)
        elif formato == "xlsx":
            arquivo_path = gerar_relatorio_xlsx(nome_arquivo, tipo, dados)
        elif formato == "csv":
            arquivo_path = gerar_relatorio_csv(nome_arquivo, tipo, dados)
        else:
            return {"success": False, "error": f"Formato invalido: {formato}"}

        # Registrar exportacao
        relatorio = RelatorioExportado(
            user_id=user_id,
            tipo=tipo,
            nome=nome_arquivo,
            filtros=json.dumps(filtros) if filtros else None,
            formato=formato,
            arquivo_path=arquivo_path,
            tamanho_bytes=os.path.getsize(arquivo_path),
            status="concluido"
        )
        db.add(relatorio)
        db.commit()

        return {
            "success": True,
            "arquivo": arquivo_path,
            "formato": formato,
            "tamanho": relatorio.tamanho_bytes
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()
```

---

## Processadores (app.py)

```python
# app.py - Adicionar aos processadores

def processar_analisar_concorrente(message: str, user_id: str):
    """Processa analise de concorrente."""
    from tools import tool_analisar_concorrente_detalhado

    # Extrair nome do concorrente
    prompt = f"""Extraia o nome do concorrente desta mensagem: "{message}"
    Retorne apenas o nome, sem explicacoes."""
    nome = call_deepseek([{"role": "user", "content": prompt}], max_tokens=50).strip()

    resultado = tool_analisar_concorrente_detalhado(nome, user_id)

    if resultado.get("success"):
        c = resultado["concorrente"]
        m = resultado["metricas"]
        a = resultado["analise_ia"]

        msg = f"## Analise do Concorrente: {c['nome']}\n\n"
        msg += "### Metricas\n"
        msg += f"| Indicador | Valor |\n|---|---|\n"
        msg += f"| Participacoes | {m['participacoes']} |\n"
        msg += f"| Vitorias | {m['vitorias']} ({m['taxa_vitoria']:.1f}%) |\n"
        msg += f"| Preco Medio | R$ {m['preco_medio']:,.2f} |\n"
        msg += f"| Desconto Medio | {m['desconto_medio']:.1f}% |\n\n"

        msg += f"### Perfil Comportamental\n{a.get('perfil_comportamental', 'N/A')}\n\n"

        if a.get('pontos_fortes'):
            msg += "### Pontos Fortes\n"
            for p in a['pontos_fortes']:
                msg += f"- {p}\n"
            msg += "\n"

        if a.get('pontos_fracos'):
            msg += "### Pontos Fracos\n"
            for p in a['pontos_fracos']:
                msg += f"- {p}\n"
            msg += "\n"

        if a.get('estrategia_sugerida'):
            msg += f"### Estrategia para Competir\n{a['estrategia_sugerida']}\n"

        return msg
    else:
        return f"Erro: {resultado.get('error', 'Erro desconhecido')}"


def processar_recomendar_preco(message: str, user_id: str):
    """Processa recomendacao de preco."""
    from tools import tool_recomendar_preco_inteligente

    # Extrair edital ou termo
    # ... codigo de extracao ...

    resultado = tool_recomendar_preco_inteligente(user_id, edital_id=edital_id)

    if resultado.get("success"):
        e = resultado["edital"]
        m = resultado["mercado"]
        r = resultado["recomendacao"]

        msg = f"## Recomendacao de Preco"
        if e.get("numero"):
            msg += f" - {e['numero']}"
        msg += "\n\n"

        msg += "### Dados do Edital\n"
        msg += f"- Orgao: {e.get('orgao', 'N/A')}\n"
        msg += f"- Valor Referencia: R$ {e.get('valor_referencia', 0):,.2f}\n\n"

        msg += "### Analise de Mercado\n"
        msg += f"- Preco medio praticado: R$ {m['preco_medio']:,.2f}\n"
        msg += f"- Preco minimo historico: R$ {m['preco_minimo']:,.2f}\n"
        msg += f"- Desconto medio: {m['desconto_medio']:.1f}%\n\n"

        msg += "### Recomendacao\n"
        msg += f"**Preco sugerido: R$ {r['preco_recomendado']:,.2f}**\n"
        msg += f"- Estrategia: {r['estrategia'].title()}\n"
        msg += f"- Probabilidade de vitoria: {r['probabilidade_vitoria']}%\n"
        msg += f"- Margem estimada: {r['margem_estimada']:.1f}%\n\n"
        msg += f"**Justificativa:** {r['justificativa']}\n"

        return msg
    else:
        return f"Erro: {resultado.get('error', 'Erro desconhecido')}"


def processar_gerar_proposta(message: str, user_id: str):
    """Processa geracao de proposta comercial."""
    from tools import tool_gerar_proposta_comercial

    # ... extracao de parametros ...

    resultado = tool_gerar_proposta_comercial(
        user_id=user_id,
        edital_id=edital_id,
        preco=preco,
        exportar_pdf="pdf" in message.lower()
    )

    if resultado.get("success"):
        p = resultado["proposta"]

        msg = f"## Proposta Comercial Gerada\n\n"
        msg += f"**Numero:** {p['numero']}\n"
        msg += f"**Edital:** {p['edital']} - {p['orgao']}\n"
        msg += f"**Valor:** R$ {p['valor_proposto']:,.2f}\n"
        msg += f"**Desconto:** {p['desconto']:.1f}%\n"
        msg += f"**Status:** {p['status'].title()}\n\n"

        if p.get('arquivo_pdf'):
            msg += f"**Arquivo PDF:** [Download]({p['arquivo_pdf']})\n\n"

        msg += "### Preview\n"
        msg += resultado.get("conteudo_preview", "")[:1000]
        msg += "\n\n"

        msg += "### Acoes Disponiveis\n"
        msg += "- *\"Exporte esta proposta em PDF\"*\n"
        msg += "- *\"Altere o preco para R$ XXX\"*\n"
        msg += "- *\"Marque como finalizada\"*\n"

        return msg
    else:
        return f"Erro: {resultado.get('error', 'Erro desconhecido')}"


def processar_simular_cenarios(message: str, user_id: str):
    """Processa simulacao de cenarios de preco."""
    from tools import tool_simular_cenarios

    # ... extracao de parametros ...

    resultado = tool_simular_cenarios(user_id, edital_id=edital_id)

    if resultado.get("success"):
        msg = "## Simulacao de Cenarios de Preco\n\n"

        m = resultado["mercado"]
        msg += f"**Preco medio de mercado:** R$ {m['preco_medio']:,.2f}\n"
        msg += f"**Preco minimo historico:** R$ {m['preco_minimo']:,.2f}\n\n"

        msg += "### Cenarios\n\n"
        msg += "| Preco | Estrategia | Prob. Vitoria | Margem | Risco |\n"
        msg += "|-------|------------|---------------|--------|-------|\n"

        for c in resultado["cenarios"]:
            msg += f"| R$ {c['preco']:,.0f} | {c['estrategia'].title()} | "
            msg += f"{c['probabilidade_vitoria']}% | {c['margem_estimada']:.1f}% | "
            msg += f"{c['risco'].title()} |\n"

        msg += "\n"

        rec = resultado["recomendacao"]
        msg += f"### Recomendacao\n"
        msg += f"**Cenario sugerido:** {rec['cenario']['estrategia'].title()}\n"
        msg += f"**Preco:** R$ {rec['cenario']['preco']:,.2f}\n"
        msg += f"**Justificativa:** {rec['justificativa']}\n"

        return msg
    else:
        return f"Erro: {resultado.get('error', 'Erro desconhecido')}"


def processar_dashboard_performance(message: str, user_id: str):
    """Processa dashboard de performance."""
    from tools import tool_dashboard_performance

    # Extrair periodo
    periodo = 180  # padrao 6 meses
    if "ano" in message.lower():
        periodo = 365
    elif "3 meses" in message.lower():
        periodo = 90
    elif "mes" in message.lower():
        periodo = 30

    resultado = tool_dashboard_performance(user_id, periodo_dias=periodo)

    if resultado.get("success"):
        p = resultado["periodo"]
        m = resultado["metricas_gerais"]
        v = resultado["valores"]

        msg = f"## Dashboard de Performance\n"
        msg += f"*Periodo: {p['inicio']} a {p['fim']}*\n\n"

        msg += "### Resumo\n"
        msg += f"| Metrica | Valor |\n|---|---|\n"
        msg += f"| Total de Participacoes | {m['total_participacoes']} |\n"
        msg += f"| Vitorias | {m['vitorias']} |\n"
        msg += f"| Derrotas | {m['derrotas']} |\n"
        msg += f"| Taxa de Vitoria | {m['taxa_vitoria']:.1f}% |\n\n"

        msg += "### Valores\n"
        msg += f"- Total Ganho: **R$ {v['total_ganho']:,.2f}**\n"
        msg += f"- Total Perdido: R$ {v['total_perdido']:,.2f}\n"
        msg += f"- Gap Medio nas Derrotas: R$ {v['gap_medio_derrotas']:,.2f}\n\n"

        if resultado.get("competicao", {}).get("principais_concorrentes"):
            msg += "### Principais Concorrentes\n"
            for nome, qtd in resultado["competicao"]["principais_concorrentes"]:
                msg += f"- {nome}: {qtd} vitoria(s) sobre nos\n"
            msg += "\n"

        if resultado.get("insights"):
            msg += "### Insights\n"
            for insight in resultado["insights"]:
                msg += f"- {insight}\n"

        return msg
    else:
        return f"Erro: {resultado.get('error', 'Erro desconhecido')}"
```

---

## Deteccao de Intencoes (Fallback)

```python
# app.py - Adicionar ao detectar_intencao_fallback

def detectar_intencao_fallback(message: str) -> str:
    msg = message.lower()

    # Sprint 3 - Inteligencia de Mercado e Propostas

    # Analise de concorrente
    if any(p in msg for p in ["analise o concorrente", "analisar concorrente", "perfil do concorrente",
                               "historico da empresa", "como a empresa", "comportamento competitivo"]):
        return "analisar_concorrente_detalhado"

    # Recomendacao de preco
    if any(p in msg for p in ["recomende preco", "recomendar preco", "qual preco", "quanto cobrar",
                               "preco competitivo", "estrategia de preco", "preco para vencer"]):
        return "recomendar_preco_inteligente"

    # Gerar proposta
    if any(p in msg for p in ["gere proposta", "gerar proposta", "crie proposta", "criar proposta",
                               "monte proposta", "proposta comercial", "proposta para o edital"]):
        return "gerar_proposta_comercial"

    # Simular cenarios
    if any(p in msg for p in ["simule cenario", "simular cenario", "simulacao de preco",
                               "compare estrategia", "comparar estrategias", "chance de ganhar com"]):
        return "simular_cenarios"

    # Dashboard performance
    if any(p in msg for p in ["dashboard performance", "minha performance", "metricas de vitoria",
                               "taxa de vitoria", "como estamos", "resultados gerais"]):
        return "dashboard_performance"

    # Exportar relatorio
    if any(p in msg for p in ["exportar relatorio", "gerar relatorio", "relatorio em pdf",
                               "exportar em excel", "baixar relatorio"]):
        return "exportar_relatorio"

    # Comparar precos mercado
    if any(p in msg for p in ["comparar precos", "precos de mercado", "benchmark de precos",
                               "comparativo de precos"]):
        return "comparar_precos_mercado"

    # Historico propostas
    if any(p in msg for p in ["historico de propostas", "minhas propostas", "propostas enviadas",
                               "propostas anteriores"]):
        return "historico_propostas"

    # Templates
    if any(p in msg for p in ["template de proposta", "gerenciar template", "criar template",
                               "listar templates"]):
        return "gerenciar_templates"

    # ... resto do fallback existente ...
```

---

## Cronograma de Implementacao

### Semana 1: Base de Dados e Analise de Concorrentes

| Dia | Tarefa |
|-----|--------|
| 1 | Criar tabelas no banco (propostas_comerciais, templates, simulacoes, relatorios, analises_concorrentes) |
| 2 | Implementar models SQLAlchemy para novas tabelas |
| 3 | Implementar `analisar_concorrente_detalhado` (tool + processador) |
| 4 | Implementar `recomendar_preco_inteligente` |
| 5 | Testes das funcionalidades de analise |

### Semana 2: Propostas Comerciais

| Dia | Tarefa |
|-----|--------|
| 1 | Implementar `gerar_proposta_comercial` |
| 2 | Implementar geracao de PDF (weasyprint) |
| 3 | Implementar `gerenciar_templates` |
| 4 | Implementar `historico_propostas` |
| 5 | Testes de geracao de propostas |

### Semana 3: Simulacao e Dashboard

| Dia | Tarefa |
|-----|--------|
| 1 | Implementar `simular_cenarios` |
| 2 | Implementar `dashboard_performance` |
| 3 | Implementar `comparar_precos_mercado` |
| 4 | Implementar `exportar_relatorio` (PDF, XLSX, CSV) |
| 5 | Testes integrados |

### Semana 4: Frontend e Polimento

| Dia | Tarefa |
|-----|--------|
| 1-2 | Adicionar novos prompts no dropdown do frontend |
| 3 | Criar visualizacoes de dashboard (graficos) |
| 4 | Documentacao e testes finais |
| 5 | Deploy e validacao |

---

## Metricas de Sucesso da Sprint

| Metrica | Meta |
|---------|------|
| Analise de concorrentes com insights IA | >= 90% dos casos |
| Recomendacao de preco com justificativa | >= 95% dos casos |
| Geracao de proposta em PDF | Funcional em 100% |
| Simulacao com multiplos cenarios | >= 5 cenarios por simulacao |
| Dashboard com metricas calculadas | 100% das metricas |
| Exportacao em PDF/XLSX | Funcional |

---

## Testes da Sprint 3

### Prompts de Teste por Funcionalidade

#### 1. Analisar Concorrente
```
Analise o concorrente MedLab
Qual o historico da empresa TechSaude?
Compare MedLab vs DiagnosticaBR
Quem sao os principais concorrentes em hematologia?
```

#### 2. Recomendar Preco
```
Qual preco devo colocar no PE-001/2026?
Recomende preco competitivo para hematologia
Quanto cobrar para vencer a MedLab neste edital?
Estrategia de preco agressiva para PE-002
```

#### 3. Gerar Proposta
```
Gere uma proposta para o PE-001/2026
Crie proposta comercial com preco de R$ 350k
Monte proposta e exporte em PDF
Proposta para Sysmex XN-1000 no edital PE-003
```

#### 4. Simular Cenarios
```
Simule cenarios de preco para PE-001
Compare estrategias agressiva, moderada e conservadora
Qual a chance de ganhar com R$ 340k?
Simule precos de 300k a 400k
```

#### 5. Dashboard Performance
```
Mostre minha performance
Dashboard dos ultimos 6 meses
Como estamos em hematologia?
Metricas de vitorias e derrotas
```

#### 6. Exportar Relatorio
```
Exporte relatorio de performance em PDF
Gere relatorio de concorrentes em Excel
Baixar relatorio de precos em CSV
```

---

*Documento gerado em: 04/02/2026*
*Sprint 3 - Sistema de Editais - Inteligencia de Mercado e Propostas*
