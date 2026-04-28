-- ============================================================
-- DDL: testesvalidacoes
-- Banco do app de validacao visual acompanhada — Sprint 1
-- ============================================================
-- Execute no MySQL como root/admin:
--   mysql -h camerascasas.no-ip.info -P 3308 -u producao -p112358123 < ddl.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS testesvalidacoes
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE testesvalidacoes;

-- ============================================================
-- 1. users — testers (login no app)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  administrador TINYINT(1)   NOT NULL DEFAULT 0,
  ativo         TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_admin (administrador, ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. projetos
-- ============================================================
CREATE TABLE IF NOT EXISTS projetos (
  id        CHAR(36)     NOT NULL,
  nome      VARCHAR(255) NOT NULL,
  descricao TEXT         NULL,
  ativo     TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projetos_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. sprints
-- ============================================================
CREATE TABLE IF NOT EXISTS sprints (
  id          CHAR(36)     NOT NULL,
  projeto_id  CHAR(36)     NOT NULL,
  numero      INT          NOT NULL,
  nome        VARCHAR(255) NOT NULL,
  descricao   TEXT         NULL,
  ativo       TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sprints_projeto_numero (projeto_id, numero),
  CONSTRAINT fk_sprints_projeto FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. casos_de_uso
-- ============================================================
CREATE TABLE IF NOT EXISTS casos_de_uso (
  id           CHAR(36)     NOT NULL,
  sprint_id    CHAR(36)     NOT NULL,
  uc_id        VARCHAR(20)  NOT NULL,    -- "UC-F01"
  nome         VARCHAR(255) NOT NULL,
  doc_origem   VARCHAR(500) NULL,
  conteudo_md  LONGTEXT     NULL,
  ativo        TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_uc_sprint (sprint_id, uc_id),
  KEY ix_uc_id (uc_id),
  CONSTRAINT fk_uc_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. casos_de_teste
-- ============================================================
CREATE TABLE IF NOT EXISTS casos_de_teste (
  id                CHAR(36)     NOT NULL,
  caso_de_uso_id    CHAR(36)     NOT NULL,
  ct_id             VARCHAR(60)  NOT NULL,
  descricao         VARCHAR(500) NOT NULL,
  pre_condicoes     TEXT         NULL,
  acoes             TEXT         NULL,
  saida_esperada    TEXT         NULL,
  tipo              ENUM('Positivo','Negativo','Limite') NOT NULL DEFAULT 'Positivo',
  categoria         ENUM('Cenário','Classe','Fronteira','Combinado') NOT NULL,
  trilha_sugerida   ENUM('visual','e2e','humana') NOT NULL DEFAULT 'visual',
  rns_aplicadas     VARCHAR(500) NULL,
  fonte_doc         VARCHAR(500) NULL,
  variacao_tutorial VARCHAR(50)  NULL,
  ativo             TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ct_uc (caso_de_uso_id, ct_id),
  KEY ix_ct_id (ct_id),
  KEY ix_categoria_trilha (categoria, trilha_sugerida),
  CONSTRAINT fk_ct_uc FOREIGN KEY (caso_de_uso_id) REFERENCES casos_de_uso(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. testes — sessao de teste
-- ============================================================
CREATE TABLE IF NOT EXISTS testes (
  id            CHAR(36)     NOT NULL,
  projeto_id    CHAR(36)     NOT NULL,
  sprint_id     CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NOT NULL,
  titulo        VARCHAR(255) NOT NULL,
  descricao     TEXT         NULL,
  ciclo_id      VARCHAR(120) NULL,
  estado        ENUM('criado','em_andamento','pausado','concluido','cancelado') NOT NULL DEFAULT 'criado',
  pid_executor  INT          NULL,
  porta_painel  INT          NULL,
  iniciado_em   DATETIME     NULL,
  atualizado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  concluido_em  DATETIME     NULL,
  ativo         TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_testes_user_estado (user_id, estado),
  KEY ix_testes_sprint (sprint_id),
  CONSTRAINT fk_testes_projeto FOREIGN KEY (projeto_id) REFERENCES projetos(id),
  CONSTRAINT fk_testes_sprint  FOREIGN KEY (sprint_id)  REFERENCES sprints(id),
  CONSTRAINT fk_testes_user    FOREIGN KEY (user_id)    REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. conjuntos_de_teste
-- ============================================================
CREATE TABLE IF NOT EXISTS conjuntos_de_teste (
  id        CHAR(36)     NOT NULL,
  teste_id  CHAR(36)     NOT NULL,
  nome      VARCHAR(255) NOT NULL,
  descricao TEXT         NULL,
  criado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_conjuntos_teste (teste_id),
  CONSTRAINT fk_conjuntos_teste FOREIGN KEY (teste_id) REFERENCES testes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. conjunto_casos_de_teste — juncao ordenada
-- ============================================================
CREATE TABLE IF NOT EXISTS conjunto_casos_de_teste (
  id               CHAR(36) NOT NULL,
  conjunto_id      CHAR(36) NOT NULL,
  caso_de_teste_id CHAR(36) NOT NULL,
  ordem            INT      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conjunto_ordem (conjunto_id, ordem),
  UNIQUE KEY uq_conjunto_ct (conjunto_id, caso_de_teste_id),
  CONSTRAINT fk_conj_cdt_conjunto FOREIGN KEY (conjunto_id)      REFERENCES conjuntos_de_teste(id) ON DELETE CASCADE,
  CONSTRAINT fk_conj_cdt_ct       FOREIGN KEY (caso_de_teste_id) REFERENCES casos_de_teste(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. execucoes_caso_de_teste — resultado consolidado por CT
-- ============================================================
CREATE TABLE IF NOT EXISTS execucoes_caso_de_teste (
  id                       CHAR(36)     NOT NULL,
  teste_id                 CHAR(36)     NOT NULL,
  caso_de_teste_id         CHAR(36)     NOT NULL,
  ordem                    INT          NOT NULL,
  estado                   ENUM('pendente','em_execucao','aprovado','reprovado','pulado','erro') NOT NULL DEFAULT 'pendente',
  veredito_automatico      ENUM('PENDENTE','APROVADO','REPROVADO','INCONCLUSIVO') NOT NULL DEFAULT 'PENDENTE',
  veredicto_po             ENUM('APROVADO','REPROVADO') NULL,
  iniciado_em              DATETIME     NULL,
  concluido_em             DATETIME     NULL,
  duracao_ms               INT          NULL,
  -- Resumo (primeira/ultima tela do CT) — detalhes em passos_execucao
  screenshot_antes_path    VARCHAR(500) NULL,
  screenshot_depois_path   VARCHAR(500) NULL,
  detalhes_validacao_json  JSON         NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exec_teste_ct (teste_id, caso_de_teste_id),
  UNIQUE KEY uq_exec_teste_ordem (teste_id, ordem),
  KEY ix_exec_estado (estado),
  CONSTRAINT fk_exec_teste FOREIGN KEY (teste_id) REFERENCES testes(id) ON DELETE CASCADE,
  CONSTRAINT fk_exec_ct    FOREIGN KEY (caso_de_teste_id) REFERENCES casos_de_teste(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9b. passos_execucao — granularidade por passo do tutorial (D5)
-- ============================================================
CREATE TABLE IF NOT EXISTS passos_execucao (
  id                       CHAR(36)     NOT NULL,
  execucao_id              CHAR(36)     NOT NULL,
  ordem                    INT          NOT NULL,
  passo_id                 VARCHAR(120) NOT NULL,
  passo_titulo             VARCHAR(255) NULL,
  descricao_painel         TEXT         NULL,
  screenshot_antes_path    VARCHAR(500) NULL,
  screenshot_depois_path   VARCHAR(500) NULL,
  screenshot_antes_url     VARCHAR(500) NULL,
  screenshot_depois_url    VARCHAR(500) NULL,
  veredito_automatico      ENUM('PENDENTE','APROVADO','REPROVADO','INCONCLUSIVO') NOT NULL DEFAULT 'PENDENTE',
  veredicto_po             ENUM('APROVADO','REPROVADO') NULL,
  pediu_continuar          TINYINT(1)   NOT NULL DEFAULT 0,
  duracao_ms               INT          NULL,
  detalhes_validacao_json  JSON         NULL,
  correcao_necessaria      TINYINT(1)   NOT NULL DEFAULT 0,
  correcao_descricao       TEXT         NULL,
  iniciado_em              DATETIME     NULL,
  concluido_em             DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_passo_execucao_ordem (execucao_id, ordem),
  KEY ix_passo_execucao (execucao_id),
  KEY ix_passo_id (passo_id),
  CONSTRAINT fk_passo_exec FOREIGN KEY (execucao_id) REFERENCES execucoes_caso_de_teste(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. observacoes — texto livre vinculado a passo (D5)
-- ============================================================
CREATE TABLE IF NOT EXISTS observacoes (
  id                CHAR(36)  NOT NULL,
  passo_execucao_id CHAR(36)  NOT NULL,
  user_id           CHAR(36)  NOT NULL,
  texto             TEXT      NOT NULL,
  criado_em         DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_obs_passo (passo_execucao_id),
  CONSTRAINT fk_obs_passo FOREIGN KEY (passo_execucao_id) REFERENCES passos_execucao(id) ON DELETE CASCADE,
  CONSTRAINT fk_obs_user  FOREIGN KEY (user_id)           REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. relatorios
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios (
  id           CHAR(36)     NOT NULL,
  teste_id     CHAR(36)     NOT NULL,
  formato      ENUM('md','pdf','html') NOT NULL DEFAULT 'md',
  conteudo_md  LONGTEXT     NULL,
  path_arquivo VARCHAR(500) NULL,
  gerado_em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_rel_teste (teste_id),
  CONSTRAINT fk_rel_teste FOREIGN KEY (teste_id) REFERENCES testes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. log_auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS log_auditoria (
  id            CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NULL,
  acao          VARCHAR(50)  NOT NULL,
  recurso       VARCHAR(50)  NOT NULL,
  recurso_id    CHAR(36)     NULL,
  metadata_json JSON         NULL,
  ip_address    VARCHAR(45)  NULL,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_audit_user (user_id, criado_em),
  KEY ix_audit_recurso (recurso, recurso_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 13. anexos
-- ============================================================
CREATE TABLE IF NOT EXISTS anexos (
  id            CHAR(36)     NOT NULL,
  execucao_id   CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NOT NULL,
  nome          VARCHAR(255) NOT NULL,
  mime_type     VARCHAR(100) NULL,
  tamanho_bytes BIGINT       NULL,
  path_arquivo  VARCHAR(500) NOT NULL,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_anexos_execucao (execucao_id),
  CONSTRAINT fk_anexos_exec FOREIGN KEY (execucao_id) REFERENCES execucoes_caso_de_teste(id) ON DELETE CASCADE,
  CONSTRAINT fk_anexos_user FOREIGN KEY (user_id)     REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 14. tags + testes_tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id    CHAR(36)    NOT NULL,
  nome  VARCHAR(50) NOT NULL,
  cor   VARCHAR(7)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testes_tags (
  teste_id CHAR(36) NOT NULL,
  tag_id   CHAR(36) NOT NULL,
  PRIMARY KEY (teste_id, tag_id),
  CONSTRAINT fk_tt_teste FOREIGN KEY (teste_id) REFERENCES testes(id) ON DELETE CASCADE,
  CONSTRAINT fk_tt_tag   FOREIGN KEY (tag_id)   REFERENCES tags(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
