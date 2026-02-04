-- =============================================================================
-- SCRIPT DE DIAGNÓSTICO: Status dos Agentes MindsDB
-- =============================================================================
-- Arquivo: check-agents-status.sql
-- Propósito: Verificar configuração e status dos agentes
-- Autor: Gerado automaticamente
-- Data: 2026-01-05
-- =============================================================================

-- =============================================================================
-- SEÇÃO 1: Visão Geral dos Agentes
-- =============================================================================

-- Listar todos os agentes
SHOW AGENTS;

-- =============================================================================
-- SEÇÃO 2: Detalhes dos Agentes Principais
-- =============================================================================

-- Agente 1: natural_language_check_stock
SELECT
    name,
    model_name,
    project_name,
    skills,
    params
FROM information_schema.agents
WHERE name = 'natural_language_check_stock';

-- Agente 2: natural_language_database_searcher
SELECT
    name,
    model_name,
    project_name,
    skills,
    params
FROM information_schema.agents
WHERE name = 'natural_language_database_searcher';

-- =============================================================================
-- SEÇÃO 3: ML_ENGINEs Disponíveis
-- =============================================================================

SHOW ML_ENGINES;

-- Detalhes do engine OpenAI
SELECT * FROM information_schema.ml_engines
WHERE name = 'openai';

-- Detalhes do engine LM Studio
SELECT * FROM information_schema.ml_engines
WHERE name = 'lmstudio';

-- =============================================================================
-- SEÇÃO 4: Skills Configuradas
-- =============================================================================

SHOW SKILLS;

-- Detalhes da skill SQL principal
SELECT * FROM information_schema.skills
WHERE name LIKE '%producao_tropical%';

-- =============================================================================
-- SEÇÃO 5: Histórico de Conversas Recentes
-- =============================================================================

-- Últimas 10 conversas do agente 1
SELECT
    agent_name,
    created_at,
    question,
    answer
FROM mindsdb.agents_conversations
WHERE agent_name = 'natural_language_check_stock'
ORDER BY created_at DESC
LIMIT 10;

-- Últimas 10 conversas do agente 2
SELECT
    agent_name,
    created_at,
    question,
    answer
FROM mindsdb.agents_conversations
WHERE agent_name = 'natural_language_database_searcher'
ORDER BY created_at DESC
LIMIT 10;

-- =============================================================================
-- SEÇÃO 6: Modelos Disponíveis
-- =============================================================================

SHOW MODELS;

-- =============================================================================
-- SEÇÃO 7: Databases Conectados
-- =============================================================================

SHOW DATABASES;

-- Detalhes do database producao_tropical
SELECT * FROM information_schema.databases
WHERE name = 'producao_tropical';

-- =============================================================================
-- SEÇÃO 8: Teste de Conectividade (Executar no Terminal)
-- =============================================================================

-- Para testar conectividade com LM Studio, execute no terminal:
-- ping -c 2 192.168.1.115
-- curl http://192.168.1.115:1234/v1/models

-- Para testar conectividade com OpenAI, execute no terminal:
-- curl https://api.openai.com/v1/models \
--   -H "Authorization: Bearer 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"

-- =============================================================================
-- SEÇÃO 9: Resumo da Configuração Atual
-- =============================================================================

-- Identificar qual modelo está sendo usado atualmente
SELECT
    name AS agente,
    model_name AS modelo_atual,
    CASE
        WHEN params LIKE '%192.168.1.115%' THEN 'LM Studio (Qwen Local)'
        WHEN params LIKE '%openai%' THEN 'OpenAI'
        ELSE 'Desconhecido'
    END AS provedor
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
-- Use este script para diagnosticar problemas ou verificar a configuração atual
-- =============================================================================
