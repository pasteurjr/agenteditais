-- Migração: Campo super em users + tabela usuario_empresa (N:N)
-- Executar uma vez no banco MySQL

-- 1. Adicionar campo super em users
ALTER TABLE users ADD COLUMN IF NOT EXISTS `super` BOOLEAN NOT NULL DEFAULT 0;

-- 2. Criar tabela de junção N:N
CREATE TABLE IF NOT EXISTS usuario_empresa (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id    VARCHAR(36)  NOT NULL,
    empresa_id VARCHAR(36)  NOT NULL,
    papel      VARCHAR(50)  NOT NULL DEFAULT 'operador',
    ativo      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ue_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_ue_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_empresa (user_id, empresa_id)
);

-- 3. Migrar vínculos existentes (cada empresa tinha user_id direto → inserir em usuario_empresa)
INSERT IGNORE INTO usuario_empresa (id, user_id, empresa_id, papel)
    SELECT UUID(), user_id, id, 'admin'
    FROM empresas WHERE user_id IS NOT NULL;

-- Nota: a coluna user_id em empresas é mantida para compatibilidade retroativa
