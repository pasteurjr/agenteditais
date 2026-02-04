-- =============================================================================
-- MIGRAÇÃO PARA OLLAMA (QWEN 2.5 CODER 32B) - VERSÃO FINAL
-- =============================================================================
-- Arquivo: switch-to-ollama-FINAL.sql
-- Data: 2026-01-05
-- Solução: host.docker.internal:11434 (Docker -> Host SSH tunnel)
-- =============================================================================

-- IMPORTANTE: Executar COMANDO POR COMANDO no MindsDB Studio (não suporta batch)

-- =============================================================================
-- PASSO 1: Dropar agentes existentes
-- =============================================================================

DROP AGENT IF EXISTS natural_language_check_stock;

-- =============================================================================
-- PASSO 2: Criar Agente 1 com Ollama
-- =============================================================================

CREATE AGENT natural_language_check_stock
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://host.docker.internal:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
    skills = ['producao_tropical_sql_skill_f72ddc92be4d4ce7b9a537412f5f511b'];

-- =============================================================================
-- PASSO 3: Dropar segundo agente
-- =============================================================================

DROP AGENT IF EXISTS natural_language_database_searcher;

-- =============================================================================
-- PASSO 4: Criar Agente 2 com Ollama
-- =============================================================================

CREATE AGENT natural_language_database_searcher
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://host.docker.internal:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
    skills = ['producao_tropical_sql_skill_1a05114b1c9d41f2b156643915e2eea1'];

-- =============================================================================
-- PASSO 5: Verificar agentes criados
-- =============================================================================

SHOW AGENTS;

-- =============================================================================
-- PASSO 6: Testar Agente 1
-- =============================================================================

SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantas máquinas existem na tabela maquinas?';

-- =============================================================================
-- PASSO 7: Testar Agente 2
-- =============================================================================

SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Liste as 5 primeiras tabelas do banco de dados producao_tropical';

-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================
--
-- 1. SSH Tunnel DEVE estar rodando:
--    ssh -p71 -N -L 11434:localhost:11434 pasteurjr@192.168.1.115
--
-- 2. Verificar se tunnel está ativo:
--    ps aux | grep "ssh.*11434"
--
-- 3. Testar Ollama via tunnel:
--    curl http://localhost:11434/api/tags
--
-- 4. host.docker.internal resolve para o IP do host a partir do container Docker
--
-- 5. Para reverter para OpenAI:
--    Execute: scripts/REVERT-TO-OPENAI-FINAL.sql
--
-- =============================================================================
