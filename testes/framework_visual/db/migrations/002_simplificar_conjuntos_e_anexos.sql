-- ============================================================
-- Migration 002 — simplificacao do schema apos auditoria
-- ============================================================
-- 1. Remover conjuntos_de_teste + conjunto_casos_de_teste
--    (redundantes: execucoes_caso_de_teste ja tem teste_id+ct_id+ordem)
-- 2. Mudar FK de anexos: execucao_id -> passo_execucao_id
--    (coerencia com observacoes)
-- 3. Adicionar indice em testes(ciclo_id)
-- ============================================================

USE testesvalidacoes;

-- 1. Drop conjuntos (cascade ja apaga conjunto_casos_de_teste)
DROP TABLE IF EXISTS conjunto_casos_de_teste;
DROP TABLE IF EXISTS conjuntos_de_teste;

-- 2. Anexos: trocar FK execucao_id -> passo_execucao_id
ALTER TABLE anexos DROP FOREIGN KEY anexos_ibfk_1;
ALTER TABLE anexos CHANGE COLUMN execucao_id passo_execucao_id CHAR(36) NOT NULL;
ALTER TABLE anexos ADD CONSTRAINT fk_anexos_passo FOREIGN KEY (passo_execucao_id) REFERENCES passos_execucao(id) ON DELETE CASCADE;

-- 3. Indice em testes(ciclo_id)
ALTER TABLE testes ADD KEY ix_testes_ciclo (ciclo_id);
