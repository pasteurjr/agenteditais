-- =============================================================================
-- SCRIPT DE REVERSÃO: LM Studio → OpenAI
-- =============================================================================
-- Arquivo: switch-to-openai.sql
-- Propósito: Reverter ambos os agentes para usar modelos OpenAI (GPT-4o/GPT-4o-mini)
-- Autor: Gerado automaticamente
-- Data: 2026-01-05
-- =============================================================================

-- IMPORTANTE: Execute este script no MindsDB Studio
-- Use este script para reverter a migração ou em caso de problemas com LM Studio

-- =============================================================================
-- PASSO 1: Verificar API Key OpenAI
-- =============================================================================
-- Certifique-se de que a API key está válida e tem créditos

-- =============================================================================
-- PASSO 2: Reverter Agente 1 - natural_language_check_stock (GPT-4o)
-- =============================================================================

DROP AGENT IF EXISTS natural_language_check_stock;

CREATE AGENT natural_language_check_stock
USING
  model = 'gpt-4o',
  provider = 'openai',
  openai_api_key = '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',
  prompt_template = 'Você é um assistente SQL especializado no banco de dados producao_tropical. Use a skill SQL para gerar e executar queries que respondam às perguntas do usuário em português. Lembre-se: converta datas de dd/mm/yyyy para yyyy-mm-dd, use a tabela producaoproduto (NÃO registroproducao), e consulte saco e movimentacaoestoque para estoque. Pergunta: {{question}}',
  skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];

-- =============================================================================
-- PASSO 3: Reverter Agente 2 - natural_language_database_searcher (GPT-4o-mini)
-- =============================================================================

-- NOTA: Ajuste prompt_template e skills conforme configuração original do agente
-- Se não souber a configuração original, consulte o backup antes de executar

DROP AGENT IF EXISTS natural_language_database_searcher;

CREATE AGENT natural_language_database_searcher
USING
  model = 'gpt-4o-mini',
  provider = 'openai',
  openai_api_key = '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',
  prompt_template = 'Você é um assistente especializado em buscar informações no banco de dados. Responda em português: {{question}}',
  skills = [];

-- =============================================================================
-- PASSO 4: Verificar Reversão
-- =============================================================================

-- Ver todos os agentes
SHOW AGENTS;

-- Ver detalhes dos agentes revertidos
SELECT name, model_name, params
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- PASSO 5: Testes Básicos
-- =============================================================================

-- Teste Agente 1
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantos registros existem na tabela maquinas?';

-- Teste Agente 2
SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Liste as tabelas disponíveis no banco de dados';

-- =============================================================================
-- ALTERNATIVA: Usar GPT-4o-mini em AMBOS (mais econômico)
-- =============================================================================

-- Se quiser economizar, use GPT-4o-mini em ambos os agentes:
-- Descomente e execute as linhas abaixo:

/*
DROP AGENT IF EXISTS natural_language_check_stock;
CREATE AGENT natural_language_check_stock
USING
  model = 'gpt-4o-mini',
  provider = 'openai',
  openai_api_key = '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',
  prompt_template = 'Você é um assistente SQL especializado no banco de dados producao_tropical. Use a skill SQL para gerar e executar queries que respondam às perguntas do usuário em português. Lembre-se: converta datas de dd/mm/yyyy para yyyy-mm-dd, use a tabela producaoproduto (NÃO registroproducao), e consulte saco e movimentacaoestoque para estoque. Pergunta: {{question}}',
  skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];
*/

-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
-- Agentes revertidos para OpenAI com sucesso!
-- Para migrar novamente para LM Studio: scripts/switch-to-lmstudio.sql
-- Para verificar status: scripts/check-agents-status.sql
-- =============================================================================
