-- =============================================================================
-- SETUP AGENTE EDITAIS - PADRÃO natural_language_database_searcher
-- =============================================================================
-- Executar no MindsDB Studio (http://192.168.1.100:47334)
-- Data: 2026-02-02
-- Padrão: Idêntico ao natural_language_database_searcher (GPT-4o + OpenAI)
-- =============================================================================

-- =============================================================================
-- PASSO 1: CONECTAR BANCO DE DADOS EDITAIS (se ainda não existir)
-- =============================================================================

-- Verificar se já existe
SHOW DATABASES;

-- Se não existir, criar:
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
    description = 'A base de dados contém informações sobre editais de licitação e produtos para participação em pregões públicos.

TABELAS PRINCIPAIS:
- **produtos**: id, user_id, nome, fabricante, modelo, categoria (equipamento, reagente, insumo_hospitalar, insumo_laboratorial, informatica, redes, mobiliario, eletronico, outro)
- **produtos_especificacoes**: id, produto_id, nome_especificacao, valor, unidade - especificações técnicas dos produtos
- **editais**: id, user_id, numero, orgao, objeto, modalidade (pregao_eletronico, pregao_presencial, concorrencia, etc), status (novo, analisando, participar, nao_participar, proposta_enviada, ganho, perdido, cancelado), data_abertura, data_publicacao, valor_referencia, uf, cidade, url, fonte
- **editais_requisitos**: id, edital_id, descricao, tipo, obrigatorio - requisitos técnicos de cada edital
- **analises**: id, edital_id, produto_id, user_id, score_tecnico (0-100), recomendacao - análises de aderência entre produtos e editais
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

INSTRUÇÕES:
- As datas nas perguntas seguem formato dd/mm/yyyy, converter para yyyy-mm-dd nas queries
- Responder sempre em português brasileiro
- Para scores, usar porcentagem (ex: 85%)
- Para valores monetários, formatar como R$ X.XXX,XX
- status dos editais: novo, analisando, participar, nao_participar, proposta_enviada, ganho, perdido, cancelado';

-- =============================================================================
-- PASSO 3: VERIFICAR SKILL E ANOTAR ID
-- =============================================================================

SHOW SKILLS;

-- ⚠️ IMPORTANTE: Copie o ID COMPLETO da skill criada
-- Exemplo: editais_sql_skill_searcher_abc123def456...
-- Você precisará desse ID no próximo passo!

-- =============================================================================
-- PASSO 4: CRIAR AGENTE (usar ID da skill do passo anterior)
-- =============================================================================

-- ⚠️ SUBSTITUIR <SKILL_ID> pelo ID real da skill do PASSO 3

CREATE AGENT editais_database_searcher
USING
    model = 'gpt-4o',
    provider = 'openai',
    openai_api_key = '<SUA_OPENAI_API_KEY>',  -- Usar mesma chave dos outros agentes
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
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
WHERE question = 'Quais editais estão com status novo?';

-- Teste 3: Editais por órgão
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Liste editais do Ministério da Saúde';

-- Teste 4: Editais que vencem no mês
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quais editais têm data de abertura em fevereiro de 2026?';

-- Teste 5: Score de aderência
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Qual é o score médio de aderência das análises?';

-- Teste 6: Produtos por categoria
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quantos produtos temos em cada categoria?';

-- Teste 7: Editais e produtos compatíveis
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quais produtos têm aderência acima de 70% em algum edital?';

-- Teste 8: Propostas geradas
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quantas propostas foram geradas?';

-- =============================================================================
-- CONSULTAS ADICIONAIS ÚTEIS
-- =============================================================================

-- Editais que vencem esta semana
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quais editais vencem esta semana?';

-- Produto com melhor score
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Qual produto tem o melhor score de aderência?';

-- Editais por estado
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Quantos editais temos por estado (UF)?';

-- Editais de equipamentos médicos
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Liste editais que mencionam equipamentos médicos ou hospitalares no objeto';

-- Resumo geral
SELECT *
FROM mindsdb.editais_database_searcher
WHERE question = 'Faça um resumo do banco: total de produtos, editais, análises e propostas';

-- =============================================================================
-- FIM
-- =============================================================================
-- ✅ Banco: editais_db (camerascasas.no-ip.info:3308/editais)
-- ✅ Provider: OpenAI (GPT-4o) - mesmo dos outros agentes
-- ✅ Padrão: Idêntico ao natural_language_database_searcher
-- =============================================================================
