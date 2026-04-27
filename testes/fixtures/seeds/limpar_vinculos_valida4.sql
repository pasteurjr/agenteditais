-- Limpa vinculos de usuario_empresa do valida4 antes de rodar UC-F01 visual fp.
-- Cenario: super sem vinculos cai na tela "Sem Empresa Vinculada" (FA-07).
-- Tambem remove eventuais empresas DEMO 002 sobrando de execucoes anteriores.

DELETE FROM usuario_empresa
WHERE user_id = (SELECT id FROM users WHERE email = 'valida4@valida.com.br');

-- Limpa empresas com prefixo DEMO 002 que sobraram de execucoes anteriores
DELETE FROM empresas WHERE razao_social LIKE 'DEMO 002%';
