/*
  # Fix All Foreign Key Indexes and Remove Unused Indexes

  1. New Indexes for Foreign Keys
    - Add index for delegacao_estado.evento_id
    - Add index for delegacao_estado.representante_id
    - Add index for documents.created_by
    - Add index for eventos_teias_foruns.representante_id
    - Add index for teias_estaduais.representante_id

  2. Remove Unused Indexes
    - Drop idx_inscricoes_delegacao_id (not being used)
    - Drop idx_teias_estado_uf (not being used)
    - Drop idx_usuarios_estado_uf (not being used)

  3. Performance
    - All foreign keys will have covering indexes for optimal JOIN performance
    - Remove unused indexes to reduce write overhead and storage
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_delegacao_evento_id 
  ON delegacao_estado(evento_id);

CREATE INDEX IF NOT EXISTS idx_delegacao_representante_id 
  ON delegacao_estado(representante_id);

CREATE INDEX IF NOT EXISTS idx_documents_created_by 
  ON documents(created_by);

CREATE INDEX IF NOT EXISTS idx_eventos_representante_id 
  ON eventos_teias_foruns(representante_id);

CREATE INDEX IF NOT EXISTS idx_teias_representante_id 
  ON teias_estaduais(representante_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_inscricoes_delegacao_id;
DROP INDEX IF EXISTS idx_teias_estado_uf;
DROP INDEX IF EXISTS idx_usuarios_estado_uf;
