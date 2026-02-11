/*
  # Fix Remaining Security Issues

  1. Changes
    - Add missing indexes for foreign keys
    - Remove unused indexes
    - Consolidate multiple permissive policies into single policies

  2. Security
    - Improves query performance with proper indexes
    - Simplifies policy management
    - Maintains exact same security model
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_inscricoes_delegacao_id ON inscricoes_membros(delegacao_id);
CREATE INDEX IF NOT EXISTS idx_teias_estado_uf ON teias_estaduais(estado_uf);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf ON usuarios(estado_uf);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_documents_created_by;
DROP INDEX IF EXISTS idx_delegacao_evento_id;
DROP INDEX IF EXISTS idx_delegacao_representante_id;
DROP INDEX IF EXISTS idx_eventos_representante_id;
DROP INDEX IF EXISTS idx_teias_representante_id;

-- Consolidate delegacao_estado SELECT policies
DROP POLICY IF EXISTS "Representatives can view their delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins can view all delegation members" ON delegacao_estado;

CREATE POLICY "View delegation members"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    -- Representatives can view their own delegation members
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
    OR
    -- Admins can view all delegation members
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Consolidate eventos_teias_foruns SELECT policies
DROP POLICY IF EXISTS "Representatives can view their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can view all events" ON eventos_teias_foruns;

CREATE POLICY "View events"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (
    -- Representatives can view their own events
    representante_id = (select auth.uid())
    OR
    -- Admins can view all events
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Consolidate eventos_teias_foruns UPDATE policies
DROP POLICY IF EXISTS "Representatives can update their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can update all events" ON eventos_teias_foruns;

CREATE POLICY "Update events"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (
    -- Representatives can update their own events
    representante_id = (select auth.uid())
    OR
    -- Admins can update all events
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    -- Representatives can update their own events
    representante_id = (select auth.uid())
    OR
    -- Admins can update all events
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Consolidate eventos_teias_foruns DELETE policies
DROP POLICY IF EXISTS "Representatives can delete their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can delete all events" ON eventos_teias_foruns;

CREATE POLICY "Delete events"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (
    -- Representatives can delete their own events
    representante_id = (select auth.uid())
    OR
    -- Admins can delete all events
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Consolidate usuarios policies - remove duplicate admin policy
DROP POLICY IF EXISTS "Admins manage all profiles" ON usuarios;
DROP POLICY IF EXISTS "Users and admins read profiles" ON usuarios;
DROP POLICY IF EXISTS "Users and admins update profiles" ON usuarios;
DROP POLICY IF EXISTS "Users can insert own profile" ON usuarios;

-- Create single consolidated policies for usuarios
CREATE POLICY "Select profiles"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    -- Users can read own profile
    id = (select auth.uid())
    OR
    -- Admins can read all profiles
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Update profiles"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    -- Users can update own profile
    id = (select auth.uid())
    OR
    -- Admins can update all profiles
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    -- Users can update own profile
    id = (select auth.uid())
    OR
    -- Admins can update all profiles
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Insert profiles"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can insert own profile
    id = (select auth.uid())
    OR
    -- Admins can insert any profile
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Delete profiles"
  ON usuarios FOR DELETE
  TO authenticated
  USING (
    -- Only admins can delete profiles
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
