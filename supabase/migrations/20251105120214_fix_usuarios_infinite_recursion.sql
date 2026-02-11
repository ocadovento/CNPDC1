/*
  # Fix Infinite Recursion in Usuarios Policies

  1. Problem
    - Current policies query the usuarios table from within usuarios policies
    - This creates infinite recursion when checking admin permissions
    - Causes "infinite recursion detected in policy" error

  2. Solution
    - Use auth_user_id column instead of id for self-reference
    - Query usuarios table only when absolutely necessary
    - Use direct column checks to avoid recursion

  3. Changes
    - Drop all existing usuarios policies
    - Create new policies that avoid self-referencing queries
    - Use auth_user_id for user identity checks
*/

-- Drop all existing policies on usuarios
DROP POLICY IF EXISTS "Select profiles" ON usuarios;
DROP POLICY IF EXISTS "Update profiles" ON usuarios;
DROP POLICY IF EXISTS "Insert profiles" ON usuarios;
DROP POLICY IF EXISTS "Delete profiles" ON usuarios;
DROP POLICY IF EXISTS "Admins manage all profiles" ON usuarios;
DROP POLICY IF EXISTS "Users and admins read profiles" ON usuarios;
DROP POLICY IF EXISTS "Users and admins update profiles" ON usuarios;
DROP POLICY IF EXISTS "Users can insert own profile" ON usuarios;

-- Create a function to check if current user is admin (without recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_user_id = auth.uid()
    AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    AND ativo = true
  );
$$;

-- Policy for SELECT: Users can read own profile, admins can read all
CREATE POLICY "Select own or admin reads all"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR is_admin()
  );

-- Policy for UPDATE: Users can update own profile, admins can update all
CREATE POLICY "Update own or admin updates all"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR is_admin()
  )
  WITH CHECK (
    auth_user_id = auth.uid()
    OR is_admin()
  );

-- Policy for INSERT: Users can insert own profile, admins can insert any
CREATE POLICY "Insert own or admin inserts any"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    OR is_admin()
  );

-- Policy for DELETE: Only admins can delete
CREATE POLICY "Only admins can delete"
  ON usuarios FOR DELETE
  TO authenticated
  USING (is_admin());
