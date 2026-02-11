/*
  # Fix: Allow admins to create users
  
  1. Changes
    - Add policy allowing admin_geral and admin_auxiliar to INSERT new users in the usuarios table
    - This enables the admin dashboard to create representative and other user accounts
  
  2. Security
    - Only authenticated users with tipo_usuario = 'admin_geral' or 'admin_auxiliar' can insert
    - Maintains RLS security while enabling proper admin functionality
*/

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;

-- Create new policy: users can insert their own record (for self-registration if needed)
CREATE POLICY "usuarios_insert_own" 
  ON usuarios 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = auth_user_id);

-- Create new policy: admins can insert any user record
CREATE POLICY "admins_can_insert_users" 
  ON usuarios 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND ativo = true
    )
  );
