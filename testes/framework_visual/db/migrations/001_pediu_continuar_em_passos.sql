-- ============================================================
-- Migration 001 — mover pediu_continuar de testes para passos_execucao
-- Resolve F6 do FUROS_E_PENDENCIAS_FASE_A.md
-- ============================================================
USE testesvalidacoes;

ALTER TABLE passos_execucao
  ADD COLUMN pediu_continuar TINYINT(1) NOT NULL DEFAULT 0 AFTER veredicto_po;

ALTER TABLE testes
  DROP COLUMN pediu_continuar;
