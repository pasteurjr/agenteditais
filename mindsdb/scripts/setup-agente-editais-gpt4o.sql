-- =============================================================================
-- SETUP AGENTE EDITAIS - PADRAO natural_language_database_searcher (GPT-4o)
-- =============================================================================
-- Executar no MindsDB Studio (http://192.168.1.100:47334)
-- Data: 2026-02-02
-- Padrao: Identico ao natural_language_database_searcher
-- =============================================================================

-- =============================================================================
-- PASSO 1: CONECTAR BANCO DE DADOS EDITAIS (se ainda nao existir)
-- =============================================================================

-- Verificar se ja existe
SHOW DATABASES;

-- Se nao existir, criar:
CREATE DATABASE editais_db
WITH ENGINE = 'mysql',
PARAMETERS = {
    "host": "camerascasas.no-ip.info",
    "port": 3308,
    "user": "producao",
    "password": "112358123",
    "database": "editais"
};

-- Verificar tabelas
SHOW TABLES FROM editais_db;

-- =============================================================================
-- PASSO 2: CRIAR SKILL SQL PARA EDITAIS
-- =============================================================================

CREATE SKILL editais_sql_skill_searcher
USING
    type = 'sql',
    database = 'editais_db',
    description = 'A base de dados contem informacoes sobre editais de licitacao e produtos para participacao em pregoes publicos.

TABELAS PRINCIPAIS:
- **produtos**: id, user_id, nome, fabricante, modelo, categoria (equipamento, reagente, insumo_hospitalar, insumo_laboratorial, informatica, redes, mobiliario, eletronico, outro)
- **produtos_especificacoes**: id, produto_id, nome_especificacao, valor, unidade - especificacoes tecnicas dos produtos
- **editais**: id, user_id, numero, orgao, objeto, modalidade (pregao_eletronico, pregao_presencial, concorrencia, etc), status (novo, analisando, participar, nao_participar, proposta_enviada, ganho, perdido, cancelado), data_abertura, data_publicacao, valor_referencia, uf, cidade, url, fonte
- **editais_requisitos**: id, edital_id, descricao, tipo, obrigatorio - requisitos tecnicos de cada edital
- **analises**: id, edital_id, produto_id, user_id, score_tecnico (0-100), recomendacao - analises de aderencia entre produtos e editais
- **analises_detalhes**: id, analise_id, requisito_id, status (atendido, parcial, nao_atendido), observacao
- **propostas**: id, edital_id, produto_id, user_id, conteudo, valor_proposto, status, created_at
- **fontes_editais**: id, nome, tipo, url_base, ativo - fontes de editais (PNCP, ComprasNet, BEC, etc)

RELACIONAMENTOS:
- produtos_especificacoes.produto_id -> produtos.id
- editais_requisitos.edital_id -> editais.id
- analises.edital_id -> editais.id
- analises.produto_id -> produtos.id
- analises_detalhes.analise_id -> analises.id
- propostas.edital_id -> editais.id
- propostas.produto_id -> produtos.id

INSTRUCOES:
- As datas nas perguntas seguem formato dd/mm/yyyy, converter para yyyy-mm-dd nas queries
- Responder sempre em portugues brasileiro
- Para scores, usar porcentagem (ex: 85%)
- Para valores monetarios, formatar como R$ X.XXX,XX
- status dos editais: novo, analisando, participar, nao_participar, proposta_enviada, ganho, perdido, cancelado';

-- =============================================================================
-- PASSO 3: VERIFICAR SKILL E ANOTAR ID
-- =============================================================================

SHOW SKILLS;

-- IMPORTANTE: Copie o ID COMPLETO da skill criada
-- Exemplo: editais_sql_skill_searcher_abc123def456...
-- Voce precisara desse ID no proximo passo!

-- =============================================================================
-- PASSO 4: CRIAR AGENTE (usar ID da skill do passo anterior)
-- =============================================================================

-- SUBSTITUIR <SKILL_ID> pelo ID real da skill do PASSO 3
-- SUBSTITUIR <SUA_OPENAI_API_KEY> pela sua chave OpenAI

CREATE AGENT editais_database_searcher
USING
    model = 'gpt-4o',
    provider = 'openai',
    openai_api_key = '<SUA_OPENAI_API_KEY>',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em portugues: {{question}}',
    skills = ['<SKILL_ID>'];

-- =============================================================================
-- PASSO 5: VERIFICAR AGENTE CRIADO
-- =============================================================================

SHOW AGENTS;

SELECT name, model_name, project_name, skills
FROM information_schema.agents
WHERE name = 'editais_database_searcher';

-- =============================================================================
-- PASSO 6: TESTES DO AGENTE
-- =============================================================================

-- Teste 1: Contar registros
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quantos produtos e editais existem no banco?';

-- Teste 2: Listar editais novos
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quais editais estao com status novo?';

-- Teste 3: Editais por orgao
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Liste editais do Ministerio da Saude';

-- Teste 4: Editais que vencem no mes
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quais editais tem data de abertura em fevereiro de 2026?';

-- Teste 5: Score de aderencia
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Qual e o score medio de aderencia das analises?';

-- Teste 6: Produtos por categoria
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quantos produtos temos em cada categoria?';

-- Teste 7: Editais e produtos compativeis
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quais produtos tem aderencia acima de 70% em algum edital?';

-- Teste 8: Propostas geradas
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quantas propostas foram geradas?';

-- =============================================================================
-- FIM
-- =============================================================================
-- Banco: editais_db (camerascasas.no-ip.info:3308/editais)
-- Provider: OpenAI (GPT-4o) - mesmo dos outros agentes
-- Padrao: Identico ao natural_language_database_searcher
-- =============================================================================
