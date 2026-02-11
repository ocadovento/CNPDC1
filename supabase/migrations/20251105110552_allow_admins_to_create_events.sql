/*
  # Allow Admins to Create Events

  1. Changes
    - Update RLS policies to allow admins to create events for any representative
    - Admins can create, view, update, and delete all events
    - This allows admins to manage events for states without representatives

  2. Security
    - Maintains existing representative permissions
    - Adds admin permissions for full event management
*/

DROP POLICY IF EXISTS "Representatives can create their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can view all events" ON eventos_teias_foruns;

CREATE POLICY "Representatives and admins can create events"
  ON eventos_teias_foruns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND (
        usuarios.tipo_usuario = 'representante_gt'
        OR usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      )
    )
  );

CREATE POLICY "Admins can view all events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update all events"
  ON eventos_teias_foruns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete all events"
  ON eventos_teias_foruns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Representatives can insert delegation members" ON delegacao_estado;

CREATE POLICY "Representatives and admins can insert delegation members"
  ON delegacao_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = auth.uid()
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

DROP POLICY IF EXISTS "Representatives can update their delegation members" ON delegacao_estado;

CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Representatives can delete their delegation members" ON delegacao_estado;

CREATE POLICY "Representatives and admins can delete delegation members"
  ON delegacao_estado
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  );
