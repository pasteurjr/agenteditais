-- =============================================================================
-- EXPORTAR CONFIGURAÇÃO COMPLETA DAS SKILLS
-- =============================================================================
-- Execute no MindsDB Studio (http://localhost:47334) para ver detalhes das skills
-- =============================================================================

-- =============================================================================
-- VER TODAS AS SKILLS (Resumo)
-- =============================================================================

SHOW SKILLS;

-- =============================================================================
-- VER DETALHES COMPLETOS DAS SKILLS
-- =============================================================================

SELECT * FROM information_schema.skills;

-- =============================================================================
-- VER SKILLS ESPECÍFICAS DOS AGENTES
-- =============================================================================

-- Skill do agente natural_language_check_stock
SELECT * FROM information_schema.skills
WHERE name LIKE '%producao_tropical_sql_skill%';

-- =============================================================================
-- VER SKILLS + AGENTES (Relacionamento)
-- =============================================================================

SELECT
    a.name AS agente_nome,
    a.model_name AS modelo,
    a.skills AS skill_ids,
    a.params AS parametros
FROM information_schema.agents a
WHERE a.name IN ('natural_language_check_stock', 'natural_language_database_searcher');

-- =============================================================================
-- VER DETALHES ESPECÍFICOS DE CADA SKILL
-- =============================================================================

-- Todas as colunas da tabela skills
SELECT
    name,
    type,
    params,
    project_name,
    created_at,
    updated_at
FROM information_schema.skills
ORDER BY created_at DESC;

-- =============================================================================
-- FORMATO JSON DOS PARAMS
-- =============================================================================

-- Se quiser ver os params formatados (dependendo da versão do MindsDB)
SELECT
    name AS skill_name,
    type AS skill_type,
    JSON_EXTRACT(params, '$') AS skill_params_json
FROM information_schema.skills
WHERE name LIKE '%producao_tropical%';

-- =============================================================================
-- INFORMAÇÕES ÚTEIS PARA RECRIAR
-- =============================================================================

-- IDs completos das skills
SELECT
    name AS skill_id_completo,
    type,
    params
FROM information_schema.skills
WHERE name LIKE '%f72ddc92be4d4ce7b9a537412f5f511b%'
   OR name LIKE '%1a05114b1c9d41f2b156643915e2eea1%';
