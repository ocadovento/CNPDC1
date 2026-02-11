/*
  # Fix RLS Policies Performance Issues

  1. Changes
    - Replace all auth.uid() calls with (select auth.uid()) for better performance
    - This prevents re-evaluation of auth functions for each row

  2. Security
    - Maintains exact same security model
    - Only improves performance by caching auth.uid() result
*/

-- Fix usuarios table policies
DROP POLICY IF EXISTS "Users read own profile" ON usuarios;
DROP POLICY IF EXISTS "Users update own profile" ON usuarios;
DROP POLICY IF EXISTS "Users insert own profile" ON usuarios;

CREATE POLICY "Users read own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users insert own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Fix eventos_teias_foruns table policies
DROP POLICY IF EXISTS "Representatives can view their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can update their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can delete their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives and admins can create events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can view all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can update all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can delete all events" ON eventos_teias_foruns;

CREATE POLICY "Representatives can view their own events"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (representante_id = (select auth.uid()));

CREATE POLICY "Representatives can update their own events"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (representante_id = (select auth.uid()))
  WITH CHECK (representante_id = (select auth.uid()));

CREATE POLICY "Representatives can delete their own events"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (representante_id = (select auth.uid()));

CREATE POLICY "Representatives and admins can create events"
  ON eventos_teias_foruns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND (
        usuarios.tipo_usuario = 'representante_gt'
        OR usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      )
    )
  );

CREATE POLICY "Admins can view all events"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update all events"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete all events"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Fix delegacao_estado policies
DROP POLICY IF EXISTS "Representatives can view their delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins can view all delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can insert delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can delete delegation members" ON delegacao_estado;

CREATE POLICY "Representatives can view their delegation members"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can view all delegation members"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Representatives and admins can insert delegation members"
  ON delegacao_estado FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = (select auth.uid())
        AND usuarios.tipo_usuario = 'representante_gt'
      )
      AND EXISTS (
        SELECT 1 FROM eventos_teias_foruns
        WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
        AND eventos_teias_foruns.representante_id = (select auth.uid())
        AND eventos_teias_foruns.pode_adicionar_delegacao = true
      )
    )
  );

CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  );

CREATE POLICY "Representatives and admins can delete delegation members"
  ON delegacao_estado FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  );

-- Fix documents table policies
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
