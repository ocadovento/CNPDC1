/*
  # Fix All Security and Performance Issues

  ## Changes
  
  1. **Foreign Key Indexes**
     - Add index on `teias_estaduais(estado_uf)` for foreign key constraint
     - Add index on `usuarios(estado_uf)` for foreign key constraint
  
  2. **Auth RLS Performance Optimization**
     - Update all policies using `auth.uid()` to use `(select auth.uid())` for better performance
     - Policies affected in inscricoes_membros table
  
  3. **Remove Unused Index**
     - Drop unused index `idx_eventos_teias_foruns_representante_id`
  
  4. **Consolidate Duplicate Policies**
     - Remove all duplicate policies from `inscricoes_membros`
     - Create clean, optimized policies with proper naming
  
  5. **Fix Overly Permissive Policy**
     - Replace unrestricted INSERT policy with proper validation
     - Require valid delegacao_id and required fields
  
  ## Security Notes
  - All policies now use optimized `(select auth.uid())` pattern
  - Removed unrestricted INSERT access
  - Consolidated duplicate policies to prevent conflicts
  - Improved performance with proper indexes
*/

-- ============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

-- Index for teias_estaduais foreign key
CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf 
ON teias_estaduais(estado_uf);

-- Index for usuarios foreign key
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
ON usuarios(estado_uf);

-- ============================================
-- 2. REMOVE UNUSED INDEX
-- ============================================

DROP INDEX IF EXISTS idx_eventos_teias_foruns_representante_id;

-- ============================================
-- 3. CONSOLIDATE DUPLICATE POLICIES
-- ============================================

-- Drop all existing policies on inscricoes_membros
DROP POLICY IF EXISTS "Public can view all inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Public can view inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Authenticated users can view inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins can delete inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins can delete inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins can update inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Public can register inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Participants can update their inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins can update" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins can delete" ON inscricoes_membros;
DROP POLICY IF EXISTS "Participants can update own inscription" ON inscricoes_membros;
DROP POLICY IF EXISTS "Authenticated can view inscriptions" ON inscricoes_membros;
DROP POLICY IF EXISTS "Public can register with valid data" ON inscricoes_membros;
DROP POLICY IF EXISTS "anon_select_inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "auth_select_inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "anon_insert_inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "admin_update_inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "admin_delete_inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "participant_update_own_inscricoes" ON inscricoes_membros;

-- ============================================
-- 4. CREATE OPTIMIZED POLICIES
-- ============================================

-- Allow anonymous users to view all inscriptions
CREATE POLICY "anon_select_inscricoes"
  ON inscricoes_membros
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to view all inscriptions
CREATE POLICY "auth_select_inscricoes"
  ON inscricoes_membros
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to register with validation (optimized)
CREATE POLICY "anon_insert_inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO anon
  WITH CHECK (
    delegacao_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM delegacao_estado 
      WHERE id = delegacao_id
    )
    AND nome_completo IS NOT NULL
    AND email IS NOT NULL
  );

-- Allow admins to update inscriptions (optimized with select)
CREATE POLICY "admin_update_inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = (select auth.uid())
      AND tipo_usuario = 'admin_geral'
      AND ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = (select auth.uid())
      AND tipo_usuario = 'admin_geral'
      AND ativo = true
    )
  );

-- Allow admins to delete inscriptions (optimized with select)
CREATE POLICY "admin_delete_inscricoes"
  ON inscricoes_membros
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = (select auth.uid())
      AND tipo_usuario = 'admin_geral'
      AND ativo = true
    )
  );

-- Allow participants to update their own inscriptions (optimized)
CREATE POLICY "participant_update_inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    email IN (
      SELECT email FROM usuarios 
      WHERE auth_user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    email IN (
      SELECT email FROM usuarios 
      WHERE auth_user_id = (select auth.uid())
    )
  );
