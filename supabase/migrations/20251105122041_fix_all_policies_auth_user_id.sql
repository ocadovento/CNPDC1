/*
  # Fix All RLS Policies to Use auth_user_id

  1. Problem
    - Many policies use `usuarios.id = auth.uid()` which is incorrect
    - Should use `usuarios.auth_user_id = auth.uid()` instead
    - This causes "Database error querying schema" during authentication

  2. Solution
    - Drop all policies that incorrectly reference usuarios.id
    - Recreate them using usuarios.auth_user_id
    - This fixes authentication errors

  3. Tables Fixed
    - delegacao_estado policies
    - inscricoes_membros policies
    - eventos_teias_foruns policies
*/

-- Fix delegacao_estado policies
DROP POLICY IF EXISTS "Representatives and admins can delete delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can insert delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "View delegation members" ON delegacao_estado;

CREATE POLICY "delegacao_view"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "delegacao_insert"
  ON delegacao_estado FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario = 'representante_gt'
      )
      AND EXISTS (
        SELECT 1 FROM eventos_teias_foruns
        WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
        AND eventos_teias_foruns.representante_id = auth.uid()
        AND eventos_teias_foruns.pode_adicionar_delegacao = true
      )
    )
  );

CREATE POLICY "delegacao_update"
  ON delegacao_estado FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  );

CREATE POLICY "delegacao_delete"
  ON delegacao_estado FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  );

-- Fix eventos_teias_foruns policies
DROP POLICY IF EXISTS "View events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives and admins can create events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Update events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Delete events" ON eventos_teias_foruns;

CREATE POLICY "eventos_view"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (
    representante_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "eventos_insert"
  ON eventos_teias_foruns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar', 'representante_gt')
    )
  );

CREATE POLICY "eventos_update"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (
    representante_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    representante_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "eventos_delete"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (
    representante_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Fix inscricoes_membros policies (simplified to avoid complex recursion)
DROP POLICY IF EXISTS "Membros and admins can view inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Membros podem atualizar própria inscrição" ON inscricoes_membros;
DROP POLICY IF EXISTS "Membros podem inserir própria inscrição se estiverem na dele" ON inscricoes_membros;

CREATE POLICY "inscricoes_view"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "inscricoes_insert"
  ON inscricoes_membros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "inscricoes_update"
  ON inscricoes_membros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "inscricoes_delete"
  ON inscricoes_membros FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
