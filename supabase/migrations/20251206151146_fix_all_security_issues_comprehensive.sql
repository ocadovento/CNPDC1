/*
  # Fix All Security Issues - Comprehensive Security Update

  ## Changes Made

  ### 1. Add Missing Indexes for Foreign Keys
  - Add index on `inscricoes_membros.delegacao_id`
  - Add index on `teias_estaduais.estado_uf`
  - Add index on `usuarios.estado_uf`

  ### 2. Remove Unused Indexes
  - Remove `idx_delegacao_evento_id`
  - Remove `idx_delegacao_representante_id`
  - Remove `idx_eventos_representante_id`
  - Remove `idx_teias_representante_id`

  ### 3. Optimize RLS Policies for Performance
  - Replace `auth.uid()` with `(select auth.uid())` in all usuarios table policies
  - Consolidate multiple permissive policies into single efficient policies

  ### 4. Fix Function Search Paths
  - Set immutable search_path for `is_admin` function
  - Set immutable search_path for `update_eventos_updated_at` function

  ### 5. Security Notes
  - Leaked Password Protection must be enabled in Supabase Dashboard under Authentication settings
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Index for inscricoes_membros.delegacao_id
CREATE INDEX IF NOT EXISTS idx_inscricoes_membros_delegacao_id 
ON inscricoes_membros(delegacao_id);

-- Index for teias_estaduais.estado_uf
CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf 
ON teias_estaduais(estado_uf);

-- Index for usuarios.estado_uf
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
ON usuarios(estado_uf);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_delegacao_evento_id;
DROP INDEX IF EXISTS idx_delegacao_representante_id;
DROP INDEX IF EXISTS idx_eventos_representante_id;
DROP INDEX IF EXISTS idx_teias_representante_id;

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - TABLE: usuarios
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow user read own profile" ON usuarios;
DROP POLICY IF EXISTS "Allow user insert own profile" ON usuarios;
DROP POLICY IF EXISTS "Allow user update own profile" ON usuarios;
DROP POLICY IF EXISTS "Allow user delete own profile" ON usuarios;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Allow user read own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

CREATE POLICY "Allow user insert own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "Allow user update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "Allow user delete own profile"
  ON usuarios FOR DELETE
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

-- =====================================================
-- 4. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- TABLE: delegacao_estado - Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives can view their delegation members" ON delegacao_estado;

CREATE POLICY "Authenticated users can view delegation"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.id = delegacao_estado.representante_id)
      )
    )
  );

-- TABLE: eventos_teias_foruns - Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can view their own events" ON eventos_teias_foruns;

CREATE POLICY "Authenticated users can view events"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.id = eventos_teias_foruns.representante_id)
      )
    )
  );

-- TABLE: eventos_teias_foruns - Consolidate UPDATE policies
DROP POLICY IF EXISTS "Admins can update all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can update their own events" ON eventos_teias_foruns;

CREATE POLICY "Authenticated users can update events"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.id = eventos_teias_foruns.representante_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.id = eventos_teias_foruns.representante_id)
      )
    )
  );

-- TABLE: eventos_teias_foruns - Consolidate DELETE policies
DROP POLICY IF EXISTS "Admins can delete all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can delete their own events" ON eventos_teias_foruns;

CREATE POLICY "Authenticated users can delete events"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.id = eventos_teias_foruns.representante_id)
      )
    )
  );

-- TABLE: inscricoes_membros - Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins podem ver todas inscrições" ON inscricoes_membros;
DROP POLICY IF EXISTS "Membros and admins can view inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Membros podem ver própria inscrição" ON inscricoes_membros;

CREATE POLICY "Authenticated users can view inscricoes"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar', 'membro')
      )
    )
  );

-- TABLE: teias_estaduais - Consolidate INSERT policies
DROP POLICY IF EXISTS "Admins auxiliares podem criar teias" ON teias_estaduais;
DROP POLICY IF EXISTS "Representantes GT podem criar teia do seu estado" ON teias_estaduais;

CREATE POLICY "Authenticated users can create teias"
  ON teias_estaduais FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.estado_uf = teias_estaduais.estado_uf)
      )
    )
  );

-- TABLE: teias_estaduais - Consolidate UPDATE policies
DROP POLICY IF EXISTS "Admins auxiliares podem atualizar teias" ON teias_estaduais;
DROP POLICY IF EXISTS "Representantes GT podem atualizar teia do seu estado" ON teias_estaduais;

CREATE POLICY "Authenticated users can update teias"
  ON teias_estaduais FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.estado_uf = teias_estaduais.estado_uf)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.estado_uf = teias_estaduais.estado_uf)
      )
    )
  );

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Drop and recreate is_admin function with secure search_path
DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM usuarios
    WHERE auth_user_id = auth.uid()
    AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
  );
$$;

-- Drop and recreate update_eventos_updated_at trigger function with secure search_path
DROP FUNCTION IF EXISTS update_eventos_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_eventos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger since we dropped the function
DROP TRIGGER IF EXISTS set_eventos_updated_at ON eventos_teias_foruns;

CREATE TRIGGER set_eventos_updated_at
  BEFORE UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION update_eventos_updated_at();
