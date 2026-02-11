/*
  # Fix admin read policy for usuarios table

  1. Changes
    - Drop incorrect "Allow admins to read all profiles" policy
    - Create new policy that allows admins to read ALL user profiles
    - Admin can see their own profile + all other users (admin_auxiliar, representante_gt, etc)
    
  2. Security
    - Only authenticated users who are admins (admin_geral or admin_auxiliar) can read all profiles
    - Regular users can still only read their own profile
*/

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON usuarios;

-- Create the correct policy: if logged user is admin, they can read ALL profiles
CREATE POLICY "Admins can view all users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM usuarios adm 
      WHERE adm.auth_user_id = auth.uid() 
      AND adm.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
