/*
  # Fix delegacao_estado UPDATE policy - Add WITH CHECK clause

  ## Problem
  - The UPDATE policy for delegacao_estado has USING but no WITH CHECK
  - PostgreSQL requires WITH CHECK for UPDATE policies to validate new values
  - This causes updates to fail silently without error messages

  ## Solution
  - Drop the existing UPDATE policy
  - Recreate it with both USING and WITH CHECK clauses
  - Both clauses will have the same logic: admins and state representatives can update

  ## Changes
  1. Drop policy "Representatives and admins can update delegation members"
  2. Recreate with WITH CHECK clause
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (
          usuarios.tipo_usuario = 'representante_gt'
          AND usuarios.estado_uf = delegacao_estado.estado_uf
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (
          usuarios.tipo_usuario = 'representante_gt'
          AND usuarios.estado_uf = delegacao_estado.estado_uf
        )
      )
    )
  );
