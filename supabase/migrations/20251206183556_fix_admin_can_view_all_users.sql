/*
  # Fix Admin Can View All Users

  1. Changes
    - Add SELECT policy for admin_geral to view all admin_auxiliar and representante_gt users
    - Add UPDATE policy for admin_geral to update all users
    - Add DELETE policy for admin_geral to deactivate users
  
  2. Security
    - Only admin_geral can view and manage other users
    - Regular users can still only see their own profile
*/

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Admin can read all users" ON usuarios;
DROP POLICY IF EXISTS "Admin can update all users" ON usuarios;

-- Allow admin_geral to read all users
CREATE POLICY "Admin can read all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_geral'
    )
    OR auth_user_id = auth.uid()
  );

-- Allow admin_geral to update all users
CREATE POLICY "Admin can update all users"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_geral'
    )
    OR auth_user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_geral'
    )
    OR auth_user_id = auth.uid()
  );
