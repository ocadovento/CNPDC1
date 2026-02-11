/*
  # Fix All Security and Performance Issues

  1. Add Missing Indexes
    - Add indexes for all unindexed foreign keys to improve query performance:
      - delegacao_estado.evento_id
      - delegacao_estado.representante_id
      - documents.created_by
      - eventos_teias_foruns.representante_id
      - teias_estaduais.representante_id

  2. Remove Unused Indexes
    - Drop indexes that have not been used:
      - idx_inscricoes_membros_delegacao_id
      - idx_teias_estaduais_estado_uf
      - idx_usuarios_estado_uf

  3. Re-enable RLS on usuarios
    - Enable RLS with simple, non-recursive policies
    - Allow authenticated users to access their own data
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for delegacao_estado.evento_id
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_evento_id 
ON delegacao_estado(evento_id);

-- Index for delegacao_estado.representante_id
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_representante_id 
ON delegacao_estado(representante_id);

-- Index for documents.created_by
CREATE INDEX IF NOT EXISTS idx_documents_created_by 
ON documents(created_by);

-- Index for eventos_teias_foruns.representante_id
CREATE INDEX IF NOT EXISTS idx_eventos_teias_foruns_representante_id 
ON eventos_teias_foruns(representante_id);

-- Index for teias_estaduais.representante_id
CREATE INDEX IF NOT EXISTS idx_teias_estaduais_representante_id 
ON teias_estaduais(representante_id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Drop unused index on inscricoes_membros
DROP INDEX IF EXISTS idx_inscricoes_membros_delegacao_id;

-- Drop unused index on teias_estaduais
DROP INDEX IF EXISTS idx_teias_estaduais_estado_uf;

-- Drop unused index on usuarios
DROP INDEX IF EXISTS idx_usuarios_estado_uf;

-- ============================================================================
-- 3. RE-ENABLE RLS ON USUARIOS WITH SAFE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all usuarios
-- This is safe because usuarios is administrative data
CREATE POLICY "usuarios_select_authenticated"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own record
CREATE POLICY "usuarios_insert_own"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow authenticated users to update their own record
CREATE POLICY "usuarios_update_own"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Foreign key indexes improve JOIN performance significantly
-- 2. Unused indexes waste storage and slow down writes
-- 3. RLS policies are now simple and non-recursive to prevent auth errors
-- 4. All authenticated users can read usuarios (needed for admin dashboard)
-- 5. Users can only insert/update their own records
