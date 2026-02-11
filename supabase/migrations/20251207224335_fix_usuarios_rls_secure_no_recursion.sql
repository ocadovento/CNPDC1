/*
  # Fix usuarios RLS with secure policies (no recursion)

  1. Problem
    - RLS is currently disabled on usuarios table (SECURITY RISK!)
    - Previous policies caused infinite recursion
    
  2. Solution
    - Create a SECURITY DEFINER function to check if user is admin
    - This function bypasses RLS when checking, preventing recursion
    - Enable RLS with simple, secure policies
    
  3. Security
    - Authenticated users can read all users (needed for app to work)
    - Only admins can create new users (except first user)
    - Only admins can update/delete users
    - Users can read their own profile
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.auth_user_is_admin();

-- Create a function that checks if the current user is an admin
-- SECURITY DEFINER means it runs with the privileges of the function owner
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.auth_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM usuarios
    WHERE auth_user_id = auth.uid()
    AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    AND ativo = true
  );
$$;

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can read all users
-- This is needed for the app to function properly
CREATE POLICY "Authenticated users can read all users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow first user registration (when no users exist)
-- OR allow admins to create new users
CREATE POLICY "Allow first user or admin to create users"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if no users exist yet (first user)
    NOT EXISTS (SELECT 1 FROM usuarios)
    OR
    -- Allow if current user is admin
    auth_user_is_admin()
  );

-- Policy 3: Only admins can update users
CREATE POLICY "Only admins can update users"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_user_is_admin())
  WITH CHECK (auth_user_is_admin());

-- Policy 4: Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (auth_user_is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.auth_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_is_admin() TO service_role;
