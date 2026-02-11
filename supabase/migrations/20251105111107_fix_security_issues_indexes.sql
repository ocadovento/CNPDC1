/*
  # Fix Security Issues - Add Missing Indexes

  1. Performance Improvements
    - Add indexes for all foreign keys to improve query performance
    - Remove unused indexes that are not being utilized
  
  2. Indexes Added
    - delegacao_estado: evento_id, representante_id
    - documents: created_by
    - eventos_teias_foruns: representante_id
    - teias_estaduais: representante_id
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_delegacao_evento_id ON delegacao_estado(evento_id);
CREATE INDEX IF NOT EXISTS idx_delegacao_representante_id ON delegacao_estado(representante_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_eventos_representante_id ON eventos_teias_foruns(representante_id);
CREATE INDEX IF NOT EXISTS idx_teias_representante_id ON teias_estaduais(representante_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_usuarios_estado;
DROP INDEX IF EXISTS idx_estados_uf;
DROP INDEX IF EXISTS idx_teias_estado;
DROP INDEX IF EXISTS idx_teias_data;
DROP INDEX IF EXISTS idx_delegacao_estado;
DROP INDEX IF EXISTS idx_delegacao_cpf;
DROP INDEX IF EXISTS idx_inscricoes_delegacao;
DROP INDEX IF EXISTS idx_inscricoes_cpf;
