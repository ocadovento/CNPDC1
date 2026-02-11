/*
  # Fix eventos_teias_foruns INSERT policy

  1. Changes
    - Drop incorrect INSERT policy that uses usuarios.id
    - Create correct INSERT policy that uses usuarios.auth_user_id
    
  2. Security
    - Only authenticated users with tipo_usuario as representante_gt, admin_geral, or admin_auxiliar can create events
    - Uses correct auth_user_id field to match with auth.uid()
*/

-- Drop old incorrect policy
DROP POLICY IF EXISTS "Representatives and admins can create events" ON eventos_teias_foruns;

-- Create correct INSERT policy
CREATE POLICY "Representatives and admins can create events"
  ON eventos_teias_foruns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('representante_gt', 'admin_geral', 'admin_auxiliar')
    )
  );
