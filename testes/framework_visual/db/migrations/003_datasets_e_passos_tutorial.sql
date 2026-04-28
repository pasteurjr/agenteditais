-- Migration 003 — datasets + passos_tutorial no banco
USE testesvalidacoes;

-- 1. datasets: 1 por (UC, trilha) — dados em JSON
CREATE TABLE IF NOT EXISTS datasets (
  id              VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  caso_de_uso_id  VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  trilha          ENUM('visual','e2e','humana') NOT NULL DEFAULT 'visual',
  dados_json      JSON     NOT NULL,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dataset_uc_trilha (caso_de_uso_id, trilha),
  CONSTRAINT fk_dataset_uc FOREIGN KEY (caso_de_uso_id) REFERENCES casos_de_uso(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. passos_tutorial: N por CT, com acoes_json + asserts_json
CREATE TABLE IF NOT EXISTS passos_tutorial (
  id                VARCHAR(36)     NOT NULL,
  caso_de_teste_id  VARCHAR(36)     NOT NULL,
  ordem             INT          NOT NULL,
  passo_id          VARCHAR(120) NOT NULL,         -- "passo_03_preencher_cnpj"
  titulo            VARCHAR(255) NOT NULL,
  descricao_painel  TEXT         NULL,             -- markdown que aparece pro tester
  pontos_observacao JSON         NULL,             -- ["Asterisco vermelho?", "Mascara aplicada?"]
  acoes_json        JSON         NOT NULL,         -- lista de acoes Playwright
  asserts_json      JSON         NULL,             -- lista de asserts (DOM/Rede)
  criado_em         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_passo_ct_ordem (caso_de_teste_id, ordem),
  KEY ix_passo_ct (caso_de_teste_id),
  CONSTRAINT fk_passo_tutorial_ct FOREIGN KEY (caso_de_teste_id) REFERENCES casos_de_teste(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
