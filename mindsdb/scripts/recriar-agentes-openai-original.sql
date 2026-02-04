-- =============================================================================
-- RECRIAR AGENTES OPENAI ORIGINAIS (Configuração EXATA do backup)
-- =============================================================================
-- Arquivo: recriar-agentes-openai-original.sql
-- Data: 2026-01-05
-- Baseado em: skills.csv + exportagents.csv
-- =============================================================================

-- IMPORTANTE: Executar COMANDO POR COMANDO no MindsDB Studio (http://localhost:47334)

-- =============================================================================
-- PASSO 1: Dropar agentes existentes
-- =============================================================================

DROP AGENT IF EXISTS natural_language_check_stock;

DROP AGENT IF EXISTS natural_language_database_searcher;

-- =============================================================================
-- PASSO 2: Criar Skill 1 - Para natural_language_check_stock (ESTOQUE)
-- =============================================================================

CREATE SKILL producao_tropical_sql_skill_check_stock
USING
    type = 'sql',
    database = 'producao_tropical',
    tables = ['produto'],
    description = 'Você é um especialista em gerar queries que procure pela quantidade em estoque de um produto. Para tal voce vai criar uma query select descprod, quantestoque from produto where descprod deve ter um LIKE para o nome do produto completo, um LIKE para cada cada palavra do nome do produto e um LIKE para cada combinação da  primera palavra com as outras seguintes, um like para cada combinação da segunda palavra do nome com as seguintes e assim por diante. Execute a query e forneça um unico resultado com o DEScPROD que seja mais semelhante ao nome do produto dersejado';

-- =============================================================================
-- PASSO 3: Criar Skill 2 - Para natural_language_database_searcher (GERAL)
-- =============================================================================

CREATE SKILL producao_tropical_sql_skill_searcher
USING
    type = 'sql',
    database = 'producao_tropical',
    description = 'A base de dados contém informações sobre a produção industrial de máquinas que fabricam produtos que sao embalagens plásticas. Cada máquina está associada a um molde específico e possui registros de produção com datas, status (se a máquina está produzindo ou não), e ciclos de checagem de qualidade de peso durante a produção. Também existem registros de manutenção preventiva e corretiva das máquinas, segmentados por turnos. A produção de cada produto é contada em sacos, e registram o estoque. cada produto possui uma quantidade por saco.para saber a quantidade em estoque de um produto deve-se consultar a tabela saco e a tabela movimentacaoestoque. As respostas devem ser fortnecidas em portugues As datas fornecidas nas perguntas seguem o formato **dd/mm/yyyy** e devem ser convertidas para o formato **yyyy-mm-dd** para realizar consultas. A base de dados é usada para responder perguntas relacionadas a: - **Produção das máquinas**, como status de produção, intervalo de datas e dados de peso. tabelas relacionadas a producao tem prod em seu nome - **Manutenção das máquinas**, incluindo registros diários e por turno. as tabelas de manutencao tem manut em seu nome - **Controle de qualidade**, com base em checagens de peso durante os ciclos de produção. A tabela de nome producaoproduto contem a producao de cada maquina. o campoquantproduzida é o que indica a quantidade de sacos produzida pela máquina. O modelo deve correlacionar as informações para responder perguntas em linguagem natural sobre a produção, qualidade e manutenção das máquinas. nao use a tabela registroproducao!! Essa tabela não existe. Use a tabela producaoproduto, que contẽm o registro de produção!!!';

-- =============================================================================
-- PASSO 4: Verificar Skills Criadas e ANOTAR IDs
-- =============================================================================

SHOW SKILLS;

-- ⚠️ IMPORTANTE: Copie os IDs COMPLETOS das duas skills acima
-- Exemplo: producao_tropical_sql_skill_check_stock_abc123def456...
-- Você precisará desses IDs nos próximos passos!

-- =============================================================================
-- PASSO 5: Criar Agente 1 - natural_language_check_stock (OpenAI GPT-4o)
-- =============================================================================
-- ⚠️ SUBSTITUIR <SKILL_ID_CHECK_STOCK> pelo ID real da skill do PASSO 4

CREATE AGENT natural_language_check_stock
USING
    model = 'gpt-4o',
    provider = 'openai',
    openai_api_key = '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',
    prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
    skills = ['<SKILL_ID_CHECK_STOCK>'];

-- EXEMPLO COM ID REAL (DESCOMENTE E AJUSTE):
-- CREATE AGENT natural_language_check_stock
-- USING
--     model = 'gpt-4o',
--     provider = 'openai',
--     openai_api_key = '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',
--     prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
--     skills = ['producao_tropical_sql_skill_check_stock_f72ddc92be4d4ce7b9a537412f5f511b'];

-- =============================================================================
-- PASSO 6: Criar Agente 2 - natural_language_database_searcher (OpenAI GPT-4o)
-- =============================================================================
-- ⚠️ SUBSTITUIR <SKILL_ID_SEARCHER> pelo ID real da skill do PASSO 4

CREATE AGENT natural_language_database_searcher
USING
    model = 'gpt-4o',
    provider = 'openai',
    openai_api_key = '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',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
    skills = ['<SKILL_ID_SEARCHER>'];

-- EXEMPLO COM ID REAL (DESCOMENTE E AJUSTE):
-- CREATE AGENT natural_language_database_searcher
-- USING
--     model = 'gpt-4o',
--     provider = 'openai',
--     openai_api_key = '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',
--     prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
--     skills = ['producao_tropical_sql_skill_searcher_1a05114b1c9d41f2b156643915e2eea1'];

-- =============================================================================
-- PASSO 7: Verificar Agentes Criados
-- =============================================================================

SHOW AGENTS;

SELECT name, model_name, project_name, skills
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- PASSO 8: Testar Agente 1 (Estoque)
-- =============================================================================

SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Qual o estoque de BOMBONA 05 L RET NAT?';

-- =============================================================================
-- PASSO 9: Testar Agente 2 (Consultas Gerais)
-- =============================================================================

SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Quantas máquinas existem na tabela maquinas?';

-- =============================================================================
-- PASSO 10: Teste de Produção
-- =============================================================================

SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Qual foi a produção total de BOMBONA 05 L RET NAT em dezembro de 2025?';

-- =============================================================================
-- FIM - AGENTES OPENAI RECRIADOS
-- =============================================================================
-- ✅ Skills IDÊNTICAS ao backup (skills.csv)
-- ✅ Prompts IDÊNTICOS ao backup (exportagents.csv)
-- ✅ Provider: OpenAI (GPT-4o)
-- ✅ Custo: ~$0.15/1M tokens
-- =============================================================================
