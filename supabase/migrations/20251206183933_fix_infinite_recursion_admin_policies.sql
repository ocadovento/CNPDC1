/*
  # Fix Infinite Recursion in Admin Policies

  1. Changes
    - Remove policies causing infinite recursion
    - Create a helper function with SECURITY DEFINER to check if user is admin
    - Add new policies using the helper function to avoid recursion
  
  2. Security
    - Only admin_geral can view and manage other users
    - Regular users can still only see their own profile
    - Function uses SECURITY DEFINER to bypass RLS during check
*/

-- Drop problematic policies
DROP POLICY IF EXISTS "Admin can read all users" ON usuarios;
DROP POLICY IF EXISTS "Admin can update all users" ON usuarios;

-- Create helper function to check if user is admin (with SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION is_admin_geral()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_user_id = auth.uid()
    AND tipo_usuario = 'admin_geral'
  );
END;
$$;

-- Allow admin_geral to read all users
CREATE POLICY "Admin can read all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    is_admin_geral() OR auth_user_id = auth.uid()
  );

-- Allow admin_geral to update all users
CREATE POLICY "Admin can update all users"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    is_admin_geral() OR auth_user_id = auth.uid()
  )
  WITH CHECK (
    is_admin_geral() OR auth_user_id = auth.uid()
  );
