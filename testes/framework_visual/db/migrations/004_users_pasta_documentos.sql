-- Migration 004: adicionar pasta_documentos_teste em users
-- Cada tester guarda o path absoluto da pasta onde descompactou documentos_sintetizados.zip
-- Path eh por user (cada um tem sua maquina/local).

ALTER TABLE users
  ADD COLUMN pasta_documentos_teste VARCHAR(500) NULL
  AFTER administrador;
