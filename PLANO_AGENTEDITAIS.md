# Plano: Agente de Editais - MVP em 4 horas

## Prazo: 12:27 → 16:30 (4 horas)

## Estratégia
- Copiar código do Trabalhista
- Adaptar para editais
- Um único agente (DeepSeek)
- Abordagem híbrida: FAISS + Banco estruturado

---

## Estrutura do Banco de Dados `editais`

### 1. USERS E AUTH (copiar do trabalhista)

```sql
-- Já existe no trabalhista, copiar estrutura
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. PRODUTOS (Portfólio da Empresa)

```sql
-- Produto cadastrado (equipamento, reagente, insumo)
CREATE TABLE produtos (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    codigo_interno VARCHAR(50),          -- código da empresa
    ncm VARCHAR(20),                      -- código NCM para busca
    categoria ENUM('equipamento', 'reagente', 'insumo_hospitalar', 'insumo_laboratorial') NOT NULL,
    fabricante VARCHAR(255),
    modelo VARCHAR(255),
    descricao TEXT,
    preco_referencia DECIMAL(15,2),       -- preço base para cálculos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_ncm (ncm),
    INDEX idx_categoria (categoria)
);

-- Especificações técnicas extraídas do manual (ESTRUTURADO)
CREATE TABLE produtos_especificacoes (
    id VARCHAR(36) PRIMARY KEY,
    produto_id VARCHAR(36) NOT NULL,
    nome_especificacao VARCHAR(255) NOT NULL,  -- ex: "Sensibilidade", "Faixa de medição"
    valor VARCHAR(500) NOT NULL,               -- ex: "0.03 mg/dL", "10-500 mg/dL"
    unidade VARCHAR(50),                       -- ex: "mg/dL", "mm", "°C"
    valor_numerico DECIMAL(15,6),              -- valor convertido para comparação
    operador VARCHAR(10),                      -- "<", "<=", "=", ">=", ">", "range"
    valor_min DECIMAL(15,6),                   -- para ranges
    valor_max DECIMAL(15,6),                   -- para ranges
    pagina_origem INT,                         -- página do manual onde foi extraído
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_nome_spec (nome_especificacao)
);

-- Documentos do produto (manuais, fichas, certificados)
CREATE TABLE produtos_documentos (
    id VARCHAR(36) PRIMARY KEY,
    produto_id VARCHAR(36) NOT NULL,
    tipo ENUM('manual', 'ficha_tecnica', 'certificado_anvisa', 'certificado_outro') NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    path_arquivo VARCHAR(500) NOT NULL,        -- caminho no storage
    texto_extraido LONGTEXT,                   -- texto completo extraído
    embedding_ids JSON,                        -- IDs dos chunks no FAISS
    processado BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);
```

### 3. EDITAIS (Oportunidades)

```sql
-- Edital capturado
CREATE TABLE editais (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    numero VARCHAR(100) NOT NULL,              -- número do edital
    orgao VARCHAR(255) NOT NULL,               -- nome do órgão
    orgao_tipo ENUM('federal', 'estadual', 'municipal', 'autarquia', 'fundacao') DEFAULT 'municipal',
    uf CHAR(2),
    cidade VARCHAR(100),
    objeto TEXT NOT NULL,                      -- descrição do objeto
    modalidade ENUM('pregao_eletronico', 'pregao_presencial', 'concorrencia', 'tomada_precos', 'convite', 'dispensa', 'inexigibilidade') DEFAULT 'pregao_eletronico',
    categoria ENUM('comodato', 'venda_equipamento', 'aluguel_com_consumo', 'aluguel_sem_consumo', 'consumo_reagentes', 'consumo_insumos', 'servicos') DEFAULT NULL,
    valor_referencia DECIMAL(15,2),            -- valor estimado
    data_publicacao DATE,
    data_abertura DATETIME,                    -- data/hora da sessão
    data_limite_proposta DATETIME,
    data_limite_impugnacao DATETIME,
    status ENUM('novo', 'analisando', 'participando', 'proposta_enviada', 'em_pregao', 'vencedor', 'perdedor', 'cancelado', 'desistido') DEFAULT 'novo',
    fonte VARCHAR(50),                         -- PNCP, ComprasNet, BEC, etc.
    url VARCHAR(500),                          -- link do edital
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_data_abertura (data_abertura),
    INDEX idx_categoria (categoria)
);

-- Requisitos extraídos do edital (ESTRUTURADO)
CREATE TABLE editais_requisitos (
    id VARCHAR(36) PRIMARY KEY,
    edital_id VARCHAR(36) NOT NULL,
    tipo ENUM('tecnico', 'documental', 'comercial') NOT NULL,
    descricao TEXT NOT NULL,                   -- descrição do requisito
    nome_especificacao VARCHAR(255),           -- ex: "Sensibilidade" (para matching)
    valor_exigido VARCHAR(500),                -- ex: "≤ 0.05 mg/dL"
    operador VARCHAR(10),                      -- "<", "<=", "=", ">=", ">"
    valor_numerico DECIMAL(15,6),              -- valor para comparação
    obrigatorio BOOLEAN DEFAULT TRUE,
    pagina_origem INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edital_id) REFERENCES editais(id) ON DELETE CASCADE,
    INDEX idx_tipo (tipo),
    INDEX idx_nome_spec (nome_especificacao)
);

-- Documentos do edital (PDF, anexos)
CREATE TABLE editais_documentos (
    id VARCHAR(36) PRIMARY KEY,
    edital_id VARCHAR(36) NOT NULL,
    tipo ENUM('edital_principal', 'termo_referencia', 'anexo', 'planilha', 'outro') NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    path_arquivo VARCHAR(500) NOT NULL,
    texto_extraido LONGTEXT,
    processado BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edital_id) REFERENCES editais(id) ON DELETE CASCADE
);
```

### 4. ANÁLISES E SCORES

```sql
-- Análise de aderência produto x edital
CREATE TABLE analises (
    id VARCHAR(36) PRIMARY KEY,
    edital_id VARCHAR(36) NOT NULL,
    produto_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,

    -- Scores (0 a 100)
    score_tecnico DECIMAL(5,2),                -- % requisitos técnicos atendidos
    score_comercial DECIMAL(5,2),              -- viabilidade comercial
    score_potencial DECIMAL(5,2),              -- probabilidade de ganho
    score_final DECIMAL(5,2),                  -- média ponderada

    -- Contadores
    requisitos_total INT DEFAULT 0,
    requisitos_atendidos INT DEFAULT 0,
    requisitos_parciais INT DEFAULT 0,
    requisitos_nao_atendidos INT DEFAULT 0,

    -- Preços
    preco_sugerido_min DECIMAL(15,2),
    preco_sugerido_max DECIMAL(15,2),
    preco_sugerido DECIMAL(15,2),

    recomendacao TEXT,                         -- texto da IA explicando
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_edital_produto (edital_id, produto_id)
);

-- Detalhes da análise: cada requisito comparado
CREATE TABLE analises_detalhes (
    id VARCHAR(36) PRIMARY KEY,
    analise_id VARCHAR(36) NOT NULL,
    requisito_id VARCHAR(36) NOT NULL,         -- editais_requisitos.id
    especificacao_id VARCHAR(36),              -- produtos_especificacoes.id (se encontrou match)

    status ENUM('atendido', 'parcial', 'nao_atendido', 'nao_aplicavel') NOT NULL,
    valor_exigido VARCHAR(500),
    valor_produto VARCHAR(500),
    justificativa TEXT,                        -- explicação da IA
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analise_id) REFERENCES analises(id) ON DELETE CASCADE,
    FOREIGN KEY (requisito_id) REFERENCES editais_requisitos(id)
);
```

### 5. PROPOSTAS

```sql
-- Proposta gerada
CREATE TABLE propostas (
    id VARCHAR(36) PRIMARY KEY,
    edital_id VARCHAR(36) NOT NULL,
    produto_id VARCHAR(36) NOT NULL,
    analise_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,

    texto_tecnico LONGTEXT,                    -- proposta técnica gerada
    preco_unitario DECIMAL(15,2),
    preco_total DECIMAL(15,2),
    quantidade INT DEFAULT 1,

    status ENUM('rascunho', 'revisao', 'aprovada', 'enviada') DEFAULT 'rascunho',
    arquivo_path VARCHAR(500),                 -- PDF gerado

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (analise_id) REFERENCES analises(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6. CHAT E SESSÕES (copiar do trabalhista)

```sql
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) DEFAULT 'Nova conversa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content LONGTEXT NOT NULL,
    sources JSON,                              -- fontes do RAG
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

### 7. DOCUMENTOS GERADOS (copiar do trabalhista)

```sql
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    tipo VARCHAR(50) NOT NULL,                 -- proposta_tecnica, recurso, etc.
    titulo VARCHAR(255),
    conteudo LONGTEXT,
    dados JSON,                                -- dados usados na geração
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Fluxo de Dados

### Upload de Manual
```
1. POST /api/portfolio/upload (PDF)
2. PyMuPDF extrai texto
3. DeepSeek extrai especificações → produtos_especificacoes
4. Texto chunkado → FAISS (embedding_ids salvo em produtos_documentos)
5. Retorna produto com specs extraídas
```

### Busca de Editais
```
1. GET /api/editais/buscar?palavras=reagente,glicose
2. Busca no PNCP (API) ou scraping
3. Para cada edital encontrado:
   - Salva em editais
   - DeepSeek extrai requisitos → editais_requisitos
4. Retorna lista de editais
```

### Análise de Aderência
```
1. POST /api/analises {edital_id, produto_id}
2. Busca requisitos do edital (editais_requisitos)
3. Busca specs do produto (produtos_especificacoes)
4. DeepSeek compara cada requisito vs. spec:
   - Salva em analises_detalhes
   - Calcula scores
5. Salva em analises
6. Retorna análise com recomendação
```

### Geração de Proposta
```
1. POST /api/propostas/gerar {edital_id, produto_id, preco}
2. Busca edital, produto, análise
3. DeepSeek gera texto técnico
4. Salva em propostas
5. Gera PDF (opcional)
6. Retorna proposta
```

---

## Cronograma (4 horas)

| Hora | Fase | Tarefas |
|------|------|---------|
| 12:30-13:00 | Fase 0 | Copiar trabalhista, criar banco, adaptar configs |
| 13:00-13:45 | Fase 1 | Models.py, criar tabelas, adaptar prompts |
| 13:45-14:30 | Fase 2 | Endpoints portfolio (upload, extração specs) |
| 14:30-15:15 | Fase 3 | Endpoints editais (busca PNCP, extração requisitos) |
| 15:15-16:00 | Fase 4 | Endpoints análise (matching, scores) |
| 16:00-16:30 | Fase 5 | Frontend básico, testes |

---

## MVP Mínimo (se faltar tempo)

Se não der tempo de tudo, priorizar:
1. ✅ Banco de dados criado
2. ✅ Upload de produto com extração de specs
3. ✅ Cadastro manual de edital
4. ✅ Análise de aderência (matching)
5. ⏳ Busca automática no PNCP (pode ser manual no MVP)
6. ⏳ Geração de proposta (pode deixar para depois)

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/config.py` | Porta 5007, banco editais |
| `backend/models.py` | Novos models (Produto, Edital, Analise, etc.) |
| `backend/prompts.py` | Prompts para extração e análise |
| `backend/portfolio.py` | NOVO: Upload e extração de specs |
| `backend/editais.py` | NOVO: Busca e extração de requisitos |
| `backend/analises.py` | NOVO: Matching e scores |
| `backend/app.py` | Novos endpoints |
| `frontend/src/api/client.ts` | Porta 5007 |
| `frontend/src/components/Sidebar.tsx` | Menu editais |

---

**Pronto para começar!**
