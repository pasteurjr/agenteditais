-- Migration 006: tipo de relacao (uses vs depends) em uc_predecessores
-- 'depends' (default): predecessor cria estado pre-requisito (UC-F02 depende de UC-F01)
-- 'uses' (UML <<uses>>): UC reusa outro como subfluxo interno (UC-F01 uses UC-F18)
--
-- Pre-flight trata diferente:
--   - 'depends': predecessor deve ter rodado (no proprio teste OU historico)
--   - 'uses': predecessor eh executado como subfluxo automatico, nao precisa
--             estar listado separadamente no teste

ALTER TABLE uc_predecessores
  ADD COLUMN tipo ENUM('depends', 'uses') NOT NULL DEFAULT 'depends'
  AFTER ordem;
