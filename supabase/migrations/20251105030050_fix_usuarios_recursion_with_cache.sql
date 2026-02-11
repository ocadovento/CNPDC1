/*
  # Fix infinite recursion in usuarios policies with session cache
  
  1. Changes
    - Drop all existing policies on usuarios table
    - Create a simple, non-recursive set of policies:
      - Allow users to read their own profile directly (no subquery)
      - Allow users to update their own profile directly
      - Allow first user registration
      - Create separate admin verification function to avoid recursion
  
  2. Security
    - Maintains RLS protection
    - Uses function-based admin check to prevent recursion
    - Ensures users can only access their own data unless they are admin
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can create own profile" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio registro" ON usuarios;
DROP POLICY IF EXISTS "Allow first user registration" ON usuarios;
DROP POLICY IF EXISTS "Admin geral pode ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin geral pode atualizar usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin auxiliar pode ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin auxiliar pode atualizar usuários" ON usuarios;

-- Create a function to check if user is admin (cached during transaction)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_user_id = auth.uid()
    AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    AND ativo = true
  );
$$;

-- Simple policy: users can read their own profile
CREATE POLICY "Users read own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Policy: admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON usuarios FOR SELECT
  TO authenticated
  USING (is_admin());

-- Simple policy: users can update their own profile
CREATE POLICY "Users update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy: admins can update all profiles
CREATE POLICY "Admins update all profiles"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: allow first user registration
CREATE POLICY "Allow first user registration"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT COUNT(*) FROM usuarios) = 0
  );

-- Policy: users can insert their own profile
CREATE POLICY "Users insert own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());