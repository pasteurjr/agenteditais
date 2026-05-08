-- Migration 009: sprints.independente (BOOL DEFAULT 0)
-- Sprint marcada como independente nao exige teste_base_id mesmo sendo Sprint > 1.
-- Caso de uso: Sprint 10 (Correcoes Arnaldo) - cada UC eh isolado, nao herda contexto.

SET @col_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sprints'
      AND COLUMN_NAME = 'independente'
);

SET @sql := IF(@col_exists = 0,
    'ALTER TABLE sprints ADD COLUMN independente TINYINT(1) NOT NULL DEFAULT 0 COMMENT "1=nao exige teste_base_id mesmo sendo Sprint > 1"',
    'SELECT "independente ja existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Marca Sprint 10 como independente (UCs ARN sao isolados)
UPDATE sprints SET independente=1 WHERE numero=10;
