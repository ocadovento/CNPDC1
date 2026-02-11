/*
  # Fix All Security and Performance Issues

  1. Add Missing Indexes for Foreign Keys
    - inscricoes_membros.delegacao_id
    - teias_estaduais.estado_uf
    - usuarios.estado_uf

  2. Remove Unused Indexes
    - idx_delegacao_evento_id
    - idx_delegacao_representante_id
    - idx_documents_created_by
    - idx_eventos_representante_id
    - idx_teias_representante_id

  3. Optimize RLS Policies
    - Replace auth.uid() with (select auth.uid())
    - Improves performance at scale

  4. Add RLS Policies for teias_estaduais
    - Enable proper access control
*/

-- ============================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inscricoes_membros_delegacao_id 
  ON inscricoes_membros(delegacao_id);

CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf 
  ON teias_estaduais(estado_uf);

CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
  ON usuarios(estado_uf);

-- ============================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_delegacao_evento_id;
DROP INDEX IF EXISTS idx_delegacao_representante_id;
DROP INDEX IF EXISTS idx_documents_created_by;
DROP INDEX IF EXISTS idx_eventos_representante_id;
DROP INDEX IF EXISTS idx_teias_representante_id;

-- ============================================
-- 3. OPTIMIZE RLS POLICIES ON USUARIOS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;

-- Recreate with optimized (select auth.uid())
CREATE POLICY "usuarios_select_own"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

CREATE POLICY "usuarios_insert_own"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "usuarios_update_own"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

-- ============================================
-- 4. ADD RLS POLICIES FOR TEIAS_ESTADUAIS
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE teias_estaduais ENABLE ROW LEVEL SECURITY;

-- Public can view teias
CREATE POLICY "teias_estaduais_public_read"
  ON teias_estaduais FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert
CREATE POLICY "teias_estaduais_authenticated_insert"
  ON teias_estaduais FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "teias_estaduais_authenticated_update"
  ON teias_estaduais FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete
CREATE POLICY "teias_estaduais_authenticated_delete"
  ON teias_estaduais FOR DELETE
  TO authenticated
  USING (true);
