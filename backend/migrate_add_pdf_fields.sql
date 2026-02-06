-- Migração: Adicionar campos de PDF ao modelo Edital
-- Executar no MySQL para adicionar os novos campos

ALTER TABLE editais
ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500) NULL AFTER situacao_pncp,
ADD COLUMN IF NOT EXISTS pdf_titulo VARCHAR(255) NULL AFTER pdf_url,
ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(500) NULL AFTER pdf_titulo,
ADD COLUMN IF NOT EXISTS dados_completos BOOLEAN DEFAULT FALSE AFTER pdf_path,
ADD COLUMN IF NOT EXISTS fonte_tipo VARCHAR(20) NULL AFTER dados_completos;

-- Para MySQL < 8.0.1, use essa versão alternativa se o IF NOT EXISTS não funcionar:
-- ALTER TABLE editais ADD COLUMN pdf_url VARCHAR(500) NULL;
-- ALTER TABLE editais ADD COLUMN pdf_titulo VARCHAR(255) NULL;
-- ALTER TABLE editais ADD COLUMN pdf_path VARCHAR(500) NULL;
-- ALTER TABLE editais ADD COLUMN dados_completos BOOLEAN DEFAULT FALSE;
-- ALTER TABLE editais ADD COLUMN fonte_tipo VARCHAR(20) NULL;
