-- Migration 005: predecessores entre UCs + registro de execucoes satisfatorias
-- Permite pre-flight no /iniciar: bloquea teste se UC tem predecessor nao satisfeito.

CREATE TABLE IF NOT EXISTS uc_predecessores (
  id              VARCHAR(36) NOT NULL,
  uc_id           VARCHAR(36) NOT NULL,                  -- UC dependente (ex: UC-F02)
  predecessor_id  VARCHAR(36) NULL,                      -- UC que satisfaz (NULL se for marcador)
  marcador        VARCHAR(20) NULL,                      -- '[login]'|'[infra]'|'[seed]' (NULL se for UC)
  grupo_or        INT NOT NULL DEFAULT 0,                -- 0=AND. N>0=OR (mesmo N = alternativas)
  ordem           INT NOT NULL DEFAULT 0,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_predecessor_uc (uc_id),
  CONSTRAINT fk_pred_uc FOREIGN KEY (uc_id) REFERENCES casos_de_uso(id) ON DELETE CASCADE,
  CONSTRAINT fk_pred_predecessor FOREIGN KEY (predecessor_id) REFERENCES casos_de_uso(id) ON DELETE SET NULL
  -- Validacao "predecessor_id XOR marcador" feita na camada de aplicacao
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS uc_execucoes_satisfatorias (
  id              VARCHAR(36) NOT NULL,
  user_id         VARCHAR(36) NOT NULL,                  -- quem executou
  uc_id           VARCHAR(36) NOT NULL,                  -- UC executado com APROVADO
  ambiente        VARCHAR(50) NOT NULL DEFAULT 'agenteditais',
  ciclo_id        VARCHAR(120) NULL,                     -- ciclo em que rodou
  execucao_id     VARCHAR(36) NOT NULL,                  -- FK pra execucao concreta
  satisfeito_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expirado        TINYINT(1) NOT NULL DEFAULT 0,
  motivo_expiracao VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY ix_satisfacao_lookup (user_id, uc_id, ambiente, expirado),
  KEY ix_satisfacao_exec (execucao_id),
  CONSTRAINT fk_satis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_satis_uc FOREIGN KEY (uc_id) REFERENCES casos_de_uso(id) ON DELETE CASCADE,
  CONSTRAINT fk_satis_exec FOREIGN KEY (execucao_id) REFERENCES execucoes_caso_de_teste(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
