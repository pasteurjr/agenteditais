-- F13-01: UNIQUE em areas/classes pra evitar duplicidade na taxonomia
-- Origem: Observações Arnaldo Sprint 1 V6 (06/05/2026)
-- "No cadastro da Área e Classe não deve permitir cadastrar novamente as mesmas"

-- Antes de aplicar, dedupe areas duplicadas (mantem a mais antiga)
-- IMPORTANTE: rodar com cuidado em prod — pode haver registros legitimos duplicados.
-- Em dev/staging, o comando abaixo eh seguro.

-- Areas de produto: unique por (empresa_id, nome)
ALTER TABLE areas_produto
    ADD CONSTRAINT uq_area_empresa_nome UNIQUE (empresa_id, nome);

-- Classes de produto v2: unique por (empresa_id, area_id, nome)
ALTER TABLE classes_produto_v2
    ADD CONSTRAINT uq_classe_empresa_area_nome UNIQUE (empresa_id, area_id, nome);
