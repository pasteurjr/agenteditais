-- Migration: Add columns for WORKFLOW SISTEMA gaps
-- B6: FK edital_requisito_id para vincular documentos a requisitos do edital

ALTER TABLE empresa_documentos
ADD COLUMN IF NOT EXISTS edital_requisito_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS path_arquivo VARCHAR(500) NULL;

ALTER TABLE empresa_certidoes
ADD COLUMN IF NOT EXISTS edital_requisito_id VARCHAR(36) NULL;

-- B7: SICONV como fonte de busca
INSERT IGNORE INTO fontes_editais (id, nome, tipo, url_base, ativo, descricao)
VALUES ('siconv', 'SICONV / +Brasil', 'scraper', 'https://transferegov.sistema.gov.br', 1, 'Plataforma +Brasil (antigo SICONV) - Convênios e Contratos de Repasse');
