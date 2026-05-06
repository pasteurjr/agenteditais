-- F01-07: Endereço estruturado da empresa
-- Origem: Observações Arnaldo Sprint 1 V6 (06/05/2026)
-- Adiciona 3 campos pra estruturar o endereço:
--   * endereco_numero — número da rua (ex: "123", "S/N")
--   * endereco_complemento — apto, sala, bloco (opcional)
--   * bairro — bairro/distrito
-- O campo legado `endereco` continua existindo (vira "Logradouro").

ALTER TABLE empresas
    ADD COLUMN endereco_numero VARCHAR(20) NULL AFTER endereco,
    ADD COLUMN endereco_complemento VARCHAR(100) NULL AFTER endereco_numero,
    ADD COLUMN bairro VARCHAR(100) NULL AFTER endereco_complemento;

-- Heuristica simples de migracao: tenta extrair numero/bairro do campo legado
-- se ele tiver virgulas. Conservador — em caso de duvida deixa NULL.
-- (Aplicacao manual recomendada para empresas com dados ja preenchidos)
