-- Migration 008: testes.teste_base_id (FK para outro teste)
-- Permite que um teste de Sprint N declare como base um teste Sprint N-1 ja
-- concluido, herdando user/empresa sintetica e dados criados.
--
-- Idempotente: usa INFORMATION_SCHEMA pra checar antes de criar.

SET @col_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'testes'
      AND COLUMN_NAME = 'teste_base_id'
);

SET @sql := IF(@col_exists = 0,
    'ALTER TABLE testes ADD COLUMN teste_base_id VARCHAR(36) NULL',
    'SELECT "teste_base_id ja existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK: cria so se nao existe
SET @fk_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'testes'
      AND CONSTRAINT_NAME = 'fk_teste_base'
);

SET @sql := IF(@fk_exists = 0,
    'ALTER TABLE testes ADD CONSTRAINT fk_teste_base FOREIGN KEY (teste_base_id) REFERENCES testes(id) ON DELETE SET NULL',
    'SELECT "fk_teste_base ja existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index para join rapido
SET @idx_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'testes'
      AND INDEX_NAME = 'idx_testes_teste_base_id'
);

SET @sql := IF(@idx_exists = 0,
    'CREATE INDEX idx_testes_teste_base_id ON testes(teste_base_id)',
    'SELECT "idx_testes_teste_base_id ja existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
