-- F05-02 / F05-03: Documento de outorga + validade no responsavel
-- Origem: Observações Arnaldo Sprint 1 V6 (06/05/2026)
-- - documento_validade: prazo de vigencia da procuracao/mandato
-- - documento_path: caminho do PDF (procuracao, estatuto, contrato social)
-- - documento_descricao: identificacao livre do documento (ex: "Procuração 2026")

ALTER TABLE empresa_responsaveis
    ADD COLUMN documento_validade DATE NULL AFTER tipo,
    ADD COLUMN documento_path VARCHAR(500) NULL AFTER documento_validade,
    ADD COLUMN documento_descricao VARCHAR(255) NULL AFTER documento_path;
