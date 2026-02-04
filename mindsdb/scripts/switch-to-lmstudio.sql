-- =============================================================================
-- SCRIPT DE MIGRAÇÃO: OpenAI → LM Studio (Qwen)
-- =============================================================================
-- Arquivo: switch-to-lmstudio.sql
-- Propósito: Migrar ambos os agentes para usar Qwen2.5-Coder-32B local
-- Autor: Gerado automaticamente
-- Data: 2026-01-05
-- =============================================================================

-- IMPORTANTE: Execute este script no MindsDB Studio
-- Certifique-se de que o servidor LM Studio está rodando em 192.168.1.115:1234

-- =============================================================================
-- PASSO 1: Verificar conectividade com LM Studio
-- =============================================================================
-- Execute no terminal antes de rodar este script:
-- ping -c 2 192.168.1.115
-- curl http://192.168.1.115:1234/v1/models

-- =============================================================================
-- PASSO 2: Criar/Verificar ML_ENGINE LM Studio
-- =============================================================================

-- Verificar se engine lmstudio já existe
-- SHOW ML_ENGINES;

-- Se não existir, criar:
CREATE ML_ENGINE IF NOT EXISTS lmstudio
FROM openai
USING
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'lm-studio';

-- =============================================================================
-- PASSO 3: Migrar Agente 1 - natural_language_check_stock
-- =============================================================================

DROP AGENT IF EXISTS natural_language_check_stock;

CREATE AGENT natural_language_check_stock
USING
  model = 'qwen2.5-coder-32b-instruct',
  provider = 'openai',
  openai_api_base = 'http://192.168.1.115:1234/v1',
  openai_api_key = 'lm-studio',
  prompt_template = 'Você é um assistente SQL especializado no banco de dados producao_tropical. Use a skill SQL para gerar e executar queries que respondam às perguntas do usuário em português. Lembre-se: converta datas de dd/mm/yyyy para yyyy-mm-dd, use a tabela producaoproduto (NÃO registroproducao), e consulte saco e movimentacaoestoque para estoque. Pergunta: {{question}}',
  skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];

-- =============================================================================
-- PASSO 4: Migrar Agente 2 - natural_language_database_searcher
-- =============================================================================

-- NOTA: Ajuste prompt_template e skills conforme configuração original do agente
-- Execute primeiro: SELECT * FROM information_schema.agents WHERE name = 'natural_language_database_searcher';

DROP AGENT IF EXISTS natural_language_database_searcher;

CREATE AGENT natural_language_database_searcher
USING
  model = 'qwen2.5-coder-32b-instruct',
  provider = 'openai',
  openai_api_base = 'http://192.168.1.115:1234/v1',
  openai_api_key = 'lm-studio',
  prompt_template = 'Você é um assistente especializado em buscar informações no banco de dados. Responda em português: {{question}}',
  skills = [];

-- =============================================================================
-- PASSO 5: Verificar Migração
-- =============================================================================

-- Ver todos os agentes
SHOW AGENTS;

-- Ver detalhes dos agentes migrados
SELECT name, model_name, params
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- PASSO 6: Testes Básicos
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
-- FIM DO SCRIPT
-- =============================================================================
-- Se houver erros, execute: scripts/switch-to-openai.sql para reverter
-- Para verificar status: scripts/check-agents-status.sql
-- =============================================================================
