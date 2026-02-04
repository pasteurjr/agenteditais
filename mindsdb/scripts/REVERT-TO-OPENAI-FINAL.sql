-- =============================================================================
-- SCRIPT DE REVERSÃO COMPLETA: Voltar para OpenAI (Configuração Original)
-- =============================================================================
-- Arquivo: REVERT-TO-OPENAI-FINAL.sql
-- Baseado em: exportagents.csv + configuracao-mindsdb.md
-- Data: 2026-01-05
-- =============================================================================

-- IMPORTANTE: Este script restaura a configuração ORIGINAL dos agentes
-- baseada no backup exportagents.csv

-- =============================================================================
-- PASSO 1: Limpar agentes e modelos de teste
-- =============================================================================

-- Dropar agentes atuais (podem estar com configuração errada)
DROP AGENT IF EXISTS natural_language_check_stock;
DROP AGENT IF EXISTS natural_language_database_searcher;
DROP AGENT IF EXISTS test_qwen_simples;

-- Dropar modelos de teste
DROP MODEL IF EXISTS teste_lmstudio;
DROP MODEL IF EXISTS testelmstudio;
DROP MODEL IF EXISTS qwen_test;
DROP MODEL IF EXISTS qwen_coder;
DROP MODEL IF EXISTS qwen_coder_model;

-- =============================================================================
-- PASSO 2: Limpar engine LM Studio (se existir)
-- =============================================================================

-- Ver engines existentes
SHOW ML_ENGINES;

-- Dropar engine lmstudio se foi criado
DROP ML_ENGINE IF EXISTS lmstudio;
DROP ML_ENGINE IF EXISTS qwen_local;

-- =============================================================================
-- PASSO 3: Verificar/Garantir engine OpenAI está configurado
-- =============================================================================

-- O engine OpenAI já deve existir, mas vamos verificar
SELECT * FROM information_schema.ml_engines WHERE name = 'openai';

-- Se não existir, criar (descomente se necessário):
/*
CREATE ML_ENGINE openai
FROM openai
USING
    openai_api_key = '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';
*/

-- =============================================================================
-- PASSO 4: Recriar Agente 1 - natural_language_check_stock
-- =============================================================================
-- Configuração ORIGINAL do exportagents.csv:
-- - Model: gpt-4o
-- - Skill: producao_tropical_sql_skill_f72ddc92be4d4ce7b9a537412f5f511b
-- - Prompt: "Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}"
-- =============================================================================

CREATE AGENT natural_language_check_stock
USING
  model = 'gpt-4o',
  provider = 'openai',
  openai_api_key = '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',
  prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
  skills = ['producao_tropical_sql_skill_f72ddc92be4d4ce7b9a537412f5f511b'];

-- =============================================================================
-- PASSO 5: Recriar Agente 2 - natural_language_database_searcher
-- =============================================================================
-- Configuração ORIGINAL do exportagents.csv:
-- - Model: gpt-4o
-- - Skill: producao_tropical_sql_skill_1a05114b1c9d41f2b156643915e2eea1
-- - Prompt: "Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}"
-- =============================================================================

CREATE AGENT natural_language_database_searcher
USING
  model = 'gpt-4o',
  provider = 'openai',
  openai_api_key = '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',
  prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
  skills = ['producao_tropical_sql_skill_1a05114b1c9d41f2b156643915e2eea1'];

-- =============================================================================
-- PASSO 6: Verificar se foram criados corretamente
-- =============================================================================

-- Ver todos os agentes
SHOW AGENTS;

-- Ver detalhes dos agentes
SELECT
    name,
    model_name,
    project_name,
    skills
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- PASSO 7: Testar Agentes
-- =============================================================================

-- Teste Agente 1: natural_language_check_stock
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantas máquinas existem na tabela maquinas?';

-- Teste Agente 2: natural_language_database_searcher
SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Liste as tabelas do banco de dados producao_tropical';

-- =============================================================================
-- PASSO 8: Verificação Final
-- =============================================================================

-- Confirmar que estão usando GPT-4o (OpenAI)
SELECT
    name AS agente,
    model_name AS modelo,
    CASE
        WHEN params LIKE '%openai%' THEN '✅ OpenAI'
        WHEN params LIKE '%192.168.1.115%' THEN '❌ LM Studio (ERRO!)'
        ELSE '⚠️ Desconhecido'
    END AS provedor_atual
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- FIM DO SCRIPT DE REVERSÃO
-- =============================================================================
-- ✅ Agentes restaurados para configuração original OpenAI
-- ✅ Modelos de teste removidos
-- ✅ Engine LM Studio removido
--
-- Próximos passos:
-- 1. Se funcionou: Documentar tentativa de migração LM Studio como "não suportado na versão atual"
-- 2. Considerar Ollama como alternativa futura (suporte oficial MindsDB)
-- 3. Considerar atualizar MindsDB se migração local for crítica
-- =============================================================================
