-- Migration 050: Simulador de Pregao Eletronico (Sprint 9/10)
-- Cria 4 tabelas no banco `editais` para estado das sessoes do simulador.
-- A Petri Net fica no banco `langnet.projects` (campo project_data JSON).

CREATE TABLE IF NOT EXISTS simulador_sessoes (
  id VARCHAR(36) PRIMARY KEY,
  langnet_project_id VARCHAR(36) NOT NULL,
  edital_id VARCHAR(36) NULL,
  empresa_id VARCHAR(36) NULL,
  modalidade ENUM('aberto','aberto_fechado') DEFAULT 'aberto',
  estado ENUM('iniciado','propostas','classificacao','lances','negociacao','habilitacao','adjudicado','encerrado') DEFAULT 'iniciado',
  config_json JSON NULL,
  resultado_json JSON NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  encerrado_em TIMESTAMP NULL,
  INDEX idx_estado (estado),
  INDEX idx_edital (edital_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulador_agentes (
  id VARCHAR(36) PRIMARY KEY,
  sessao_id VARCHAR(36) NOT NULL,
  personalidade ENUM('agressivo','conservador','erratico','calculista','reativo'),
  nome_ficticio VARCHAR(255),
  cnpj_ficticio VARCHAR(20),
  proposta_inicial DECIMAL(15,2),
  estado JSON NULL,
  INDEX idx_sessao (sessao_id),
  FOREIGN KEY (sessao_id) REFERENCES simulador_sessoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulador_lances (
  id VARCHAR(36) PRIMARY KEY,
  sessao_id VARCHAR(36) NOT NULL,
  agente_id VARCHAR(36) NULL,
  rodada INT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  tipo ENUM('proposta','lance_aberto','lance_fechado','negociacao') DEFAULT 'lance_aberto',
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessao_rodada (sessao_id, rodada),
  INDEX idx_agente (agente_id),
  FOREIGN KEY (sessao_id) REFERENCES simulador_sessoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulador_petri_estados (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sessao_id VARCHAR(36) NOT NULL,
  place_id VARCHAR(50),
  tokens INT,
  transicao_disparada VARCHAR(50) NULL,
  estado_global JSON NULL,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessao_ts (sessao_id, ts),
  FOREIGN KEY (sessao_id) REFERENCES simulador_sessoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
