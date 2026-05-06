-- F03-03: Auditoria de aceite de resultado de IA
-- Origem: Observações Arnaldo Sprint 1 V6 (06/05/2026)
-- "Para mitigar responsabilidades imputadas em ações automáticas do nosso sistema,
--  seria viável ter algum campo onde o usuário tenha que marcar que leu e conferiu
--  os comandos executados ou documentos analisados pelo sistema, antes de salvar"

CREATE TABLE auditoria_aceite_ia (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    user_email_snapshot VARCHAR(255) NULL,
    empresa_id VARCHAR(36) NULL,
    contexto VARCHAR(100) NOT NULL,
    recurso_id VARCHAR(36) NULL,
    dados_extraidos_ia JSON NULL,
    dados_aceitos_user JSON NULL,
    aceito_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(64) NULL,
    user_agent VARCHAR(500) NULL,
    INDEX idx_aceite_user (user_id, aceito_em),
    INDEX idx_aceite_empresa (empresa_id, aceito_em),
    INDEX idx_aceite_contexto (contexto, aceito_em),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
