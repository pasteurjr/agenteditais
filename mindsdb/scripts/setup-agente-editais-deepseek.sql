-- =============================================================================
-- SETUP COMPLETO: AGENTE MINDSDB PARA EDITAIS COM DEEPSEEK
-- =============================================================================
-- Executar no MindsDB Studio (http://192.168.1.100:47334)
-- Data: 2026-02-02
-- =============================================================================

-- =============================================================================
-- PASSO 1: CONECTAR BANCO DE DADOS EDITAIS
-- =============================================================================

-- Remover conexão antiga se existir
DROP DATABASE IF EXISTS editais_db;

-- Criar conexão com MySQL
CREATE DATABASE editais_db
WITH ENGINE = 'mysql',
PARAMETERS = {
    "host": "camerascasas.no-ip.info",
    "port": 3308,
    "user": "producao",
    "password": "112358123",
    "database": "editais"
};

-- Verificar conexão
SHOW TABLES FROM editais_db;

-- =============================================================================
-- PASSO 2: CRIAR ENGINE DEEPSEEK (Compatível OpenAI)
-- =============================================================================

-- Remover engine antigo se existir
DROP ML_ENGINE IF EXISTS deepseek_engine;

-- Criar engine DeepSeek usando compatibilidade OpenAI
CREATE ML_ENGINE deepseek_engine
FROM openai
USING
    openai_api_key = 'sk-bb7d97e4754943a2b6f92a00670c72bc',
    base_url = 'https://api.deepseek.com';

-- Verificar engine criado
SHOW ML_ENGINES;

-- =============================================================================
-- PASSO 3: CRIAR SKILLS SQL (Text-to-SQL)
-- =============================================================================

-- Remover skills antigas se existirem
DROP SKILL IF EXISTS editais_skill_produtos;
DROP SKILL IF EXISTS editais_skill_editais;
DROP SKILL IF EXISTS editais_skill_analises;
DROP SKILL IF EXISTS editais_skill_propostas;

-- Skill 1: Consultas de Produtos
CREATE SKILL editais_skill_produtos
USING
    type = 'text2sql',
    database = 'editais_db',
    tables = ['produtos', 'produtos_especificacoes', 'produtos_documentos'],
    description = 'Consulta produtos cadastrados, suas especificações técnicas e documentos (manuais, datasheets). Use para perguntas sobre portfólio de produtos, specs técnicas, fabricantes, modelos e categorias.';

-- Skill 2: Consultas de Editais
CREATE SKILL editais_skill_editais
USING
    type = 'text2sql',
    database = 'editais_db',
    tables = ['editais', 'editais_requisitos', 'editais_documentos', 'fontes_editais'],
    description = 'Consulta editais de licitação, requisitos técnicos, datas de abertura/vencimento, órgãos, modalidades e status. Use para perguntas sobre oportunidades de licitação, prazos, requisitos e fontes.';

-- Skill 3: Consultas de Análises de Aderência
CREATE SKILL editais_skill_analises
USING
    type = 'text2sql',
    database = 'editais_db',
    tables = ['analises', 'analises_detalhes'],
    description = 'Consulta análises de aderência entre produtos e editais, scores técnicos, requisitos atendidos/parciais/não-atendidos. Use para perguntas sobre compatibilidade, matching e recomendações.';

-- Skill 4: Consultas de Propostas
CREATE SKILL editais_skill_propostas
USING
    type = 'text2sql',
    database = 'editais_db',
    tables = ['propostas'],
    description = 'Consulta propostas técnicas e comerciais geradas, valores, status de envio. Use para perguntas sobre histórico de propostas e resultados.';

-- Verificar skills criadas
SHOW SKILLS;

-- =============================================================================
-- PASSO 4: CRIAR AGENTE PRINCIPAL
-- =============================================================================

-- Remover agente antigo se existir
DROP AGENT IF EXISTS agente_editais;

-- Criar agente com DeepSeek
CREATE AGENT agente_editais
USING
    model = 'deepseek-chat',
    provider = 'deepseek_engine',
    prompt_template = '
Você é um assistente especializado em análise de editais de licitação e gestão de produtos para participação em pregões e concorrências públicas.

## Suas Capacidades:
1. **Produtos**: Consultar produtos cadastrados, especificações técnicas, fabricantes, modelos
2. **Editais**: Buscar editais por data, órgão, modalidade, status, objeto
3. **Análises**: Verificar aderência entre produtos e requisitos de editais, scores de compatibilidade
4. **Propostas**: Consultar histórico de propostas geradas

## Contexto do Banco de Dados:
- **produtos**: id, nome, fabricante, modelo, categoria (equipamento, reagente, insumo_hospitalar, etc)
- **produtos_especificacoes**: specs técnicas dos produtos
- **editais**: numero, orgao, objeto, modalidade, status (novo, analisando, participar, ganho, perdido), data_abertura, valor_referencia
- **editais_requisitos**: requisitos técnicos de cada edital
- **analises**: score_tecnico (0-100), requisitos atendidos/parciais/não-atendidos
- **propostas**: propostas geradas com valor, status

## Instruções:
- Responda sempre em português brasileiro
- Formate datas como DD/MM/YYYY
- Formate valores monetários como R$ X.XXX,XX
- Para scores, use porcentagem (ex: 85%)
- Se não encontrar dados, sugira ações (cadastrar produto, buscar editais, etc)

## Pergunta do Usuário:
{{question}}
',
    skills = ['editais_skill_produtos', 'editais_skill_editais', 'editais_skill_analises', 'editais_skill_propostas'];

-- Verificar agente criado
SHOW AGENTS;

-- =============================================================================
-- PASSO 5: TESTES DO AGENTE
-- =============================================================================

-- Teste 1: Verificar funcionamento básico
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Olá! Você está funcionando? Liste quantos produtos e editais existem no banco.';

-- Teste 2: Consultar editais
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Quais editais estão com status novo?';

-- Teste 3: Consultar produtos
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Liste todos os produtos cadastrados com fabricante e categoria.';

-- Teste 4: Editais por data
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Quais editais têm data de abertura em fevereiro de 2026?';

-- Teste 5: Análise de aderência
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Qual é o score médio de aderência das análises realizadas?';

-- Teste 6: Editais por órgão
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Liste editais do Ministério da Saúde.';

-- Teste 7: Produtos por categoria
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Quantos produtos temos em cada categoria?';

-- Teste 8: Requisitos de edital
SELECT answer FROM mindsdb.agente_editais
WHERE question = 'Quais são os requisitos do edital 90020/2025?';

-- =============================================================================
-- QUERIES ÚTEIS PARA CONSULTA DIRETA (SEM AGENTE)
-- =============================================================================

-- Editais que vencem este mês
SELECT numero, orgao, objeto, data_abertura, status
FROM editais_db.editais
WHERE MONTH(data_abertura) = MONTH(CURRENT_DATE())
  AND YEAR(data_abertura) = YEAR(CURRENT_DATE())
ORDER BY data_abertura;

-- Produtos com melhor aderência média
SELECT p.nome, p.fabricante, AVG(a.score_tecnico) as score_medio, COUNT(*) as analises
FROM editais_db.produtos p
JOIN editais_db.analises a ON a.produto_id = p.id
GROUP BY p.id, p.nome, p.fabricante
ORDER BY score_medio DESC
LIMIT 10;

-- Editais recomendados (com alta aderência)
SELECT e.numero, e.orgao, e.objeto, a.score_tecnico, p.nome as produto
FROM editais_db.editais e
JOIN editais_db.analises a ON a.edital_id = e.id
JOIN editais_db.produtos p ON a.produto_id = p.id
WHERE a.score_tecnico >= 70
  AND e.status = 'novo'
ORDER BY a.score_tecnico DESC;

-- Estatísticas gerais
SELECT
    (SELECT COUNT(*) FROM editais_db.produtos) as total_produtos,
    (SELECT COUNT(*) FROM editais_db.editais) as total_editais,
    (SELECT COUNT(*) FROM editais_db.analises) as total_analises,
    (SELECT COUNT(*) FROM editais_db.propostas) as total_propostas,
    (SELECT AVG(score_tecnico) FROM editais_db.analises) as score_medio;

-- =============================================================================
-- TROUBLESHOOTING
-- =============================================================================

-- Se o agente não funcionar, verificar:

-- 1. Conexão com banco
SELECT * FROM editais_db.produtos LIMIT 1;

-- 2. Engine DeepSeek
SELECT * FROM information_schema.ml_engines WHERE name = 'deepseek_engine';

-- 3. Skills
SELECT * FROM information_schema.skills;

-- 4. Logs do agente (se disponível)
-- SHOW AGENT LOGS agente_editais;

-- =============================================================================
-- ROLLBACK (se necessário)
-- =============================================================================

-- Para remover tudo e começar de novo:
-- DROP AGENT IF EXISTS agente_editais;
-- DROP SKILL IF EXISTS editais_skill_produtos;
-- DROP SKILL IF EXISTS editais_skill_editais;
-- DROP SKILL IF EXISTS editais_skill_analises;
-- DROP SKILL IF EXISTS editais_skill_propostas;
-- DROP ML_ENGINE IF EXISTS deepseek_engine;
-- DROP DATABASE IF EXISTS editais_db;
