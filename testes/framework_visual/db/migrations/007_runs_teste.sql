-- ============================================================
-- Migration 007 — Rodadas (runs) de teste
-- Data: 2026-04-30
-- Plano: docs/PLANO_RETOMADA_TESTES.md
-- ============================================================
-- Permite que um Teste tenha N rodadas (runs). Cada rodada eh
-- uma execucao completa com ciclo isolado proprio (novo usuario
-- sintetico + nova empresa DEMO).
--
-- Compat: testes existentes ganham 1 rodada (numero=1) com os
-- dados ja gravados em testes.ciclo_id/estado/pid_executor/etc.
-- ============================================================

-- 1. Tabela nova runs_teste
CREATE TABLE IF NOT EXISTS runs_teste (
  id VARCHAR(36) PRIMARY KEY,
  teste_id VARCHAR(36) NOT NULL,
  numero INT NOT NULL,
  ciclo_id VARCHAR(120) NOT NULL,
  user_sintetico_id VARCHAR(36) NULL,
  user_sintetico_email VARCHAR(255) NULL,
  empresa_demo_cnpj VARCHAR(18) NULL,
  empresa_demo_razao VARCHAR(255) NULL,
  estado ENUM('criado','em_andamento','pausado','concluido','cancelado') NOT NULL DEFAULT 'criado',
  pid_executor INT NULL,
  iniciado_em DATETIME NULL,
  concluido_em DATETIME NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_run_teste FOREIGN KEY (teste_id) REFERENCES testes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_run_teste_numero (teste_id, numero),
  INDEX idx_run_teste (teste_id),
  INDEX idx_run_estado (estado),
  INDEX idx_run_ciclo (ciclo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Nota: ciclo_id NAO eh unico globalmente. Testes legados podem ter
-- compartilhado ciclo_id (ex: piloto-ucf01). UNIQUE eh apenas (teste_id, numero).

-- 2. Coluna run_id em execucoes_caso_de_teste
ALTER TABLE execucoes_caso_de_teste
  ADD COLUMN IF NOT EXISTS run_id VARCHAR(36) NULL AFTER teste_id;

ALTER TABLE execucoes_caso_de_teste
  ADD INDEX IF NOT EXISTS idx_exec_run (run_id);

-- 3. Coluna uc_ids_canonicos em testes (lista canonica de UCs do teste)
ALTER TABLE testes
  ADD COLUMN IF NOT EXISTS uc_ids_canonicos JSON NULL AFTER descricao;

-- 4. Migrar dados existentes — cada teste vira 1 rodada (numero=1)
INSERT INTO runs_teste (id, teste_id, numero, ciclo_id, estado, pid_executor, iniciado_em, concluido_em, criado_em)
SELECT
  UUID() AS id,
  t.id AS teste_id,
  1 AS numero,
  COALESCE(t.ciclo_id, CONCAT('legacy-', SUBSTRING(t.id, 1, 8))) AS ciclo_id,
  t.estado,
  t.pid_executor,
  t.iniciado_em,
  t.concluido_em,
  t.criado_em
FROM testes t
WHERE NOT EXISTS (
  SELECT 1 FROM runs_teste r WHERE r.teste_id = t.id
);

-- 5. Popular execucoes_caso_de_teste.run_id apontando para a rodada 1 do seu teste
UPDATE execucoes_caso_de_teste ec
JOIN runs_teste r ON r.teste_id = ec.teste_id AND r.numero = 1
SET ec.run_id = r.id
WHERE ec.run_id IS NULL;

-- 6. Popular testes.uc_ids_canonicos com a lista distinta de UCs ja em execucoes
UPDATE testes t
SET t.uc_ids_canonicos = (
  SELECT JSON_ARRAYAGG(DISTINCT ct.caso_de_uso_id)
  FROM execucoes_caso_de_teste ec
  JOIN casos_de_teste ct ON ct.id = ec.caso_de_teste_id
  WHERE ec.teste_id = t.id
)
WHERE t.uc_ids_canonicos IS NULL;

-- 7. Trocar UNIQUE constraints de execucoes_caso_de_teste — antes baseadas em
-- teste_id, agora baseadas em run_id (permite mesmo CT em rodadas diferentes)
ALTER TABLE execucoes_caso_de_teste ADD INDEX idx_exec_teste (teste_id);
ALTER TABLE execucoes_caso_de_teste DROP INDEX uq_exec_teste_ct;
ALTER TABLE execucoes_caso_de_teste DROP INDEX uq_exec_teste_ordem;
ALTER TABLE execucoes_caso_de_teste ADD UNIQUE KEY uq_exec_run_ct (run_id, caso_de_teste_id);
ALTER TABLE execucoes_caso_de_teste ADD UNIQUE KEY uq_exec_run_ordem (run_id, ordem);

-- 8. FK de execucoes_caso_de_teste.run_id -> runs_teste.id
ALTER TABLE execucoes_caso_de_teste
  ADD CONSTRAINT fk_exec_run FOREIGN KEY (run_id) REFERENCES runs_teste(id) ON DELETE CASCADE;
