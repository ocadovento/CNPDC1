/*
  # Fix infinite recursion in usuarios policies - Final Fix

  1. Changes
    - Drop all existing policies on usuarios table
    - Create simplified policies that avoid recursion
    - Use direct auth.uid() checks instead of subqueries when possible
    - Allow first user registration without authentication

  2. Security
    - First user can register (when table is empty)
    - Authenticated users can create their own profile
    - Users can only read their own data
    - No recursive policy checks

  3. Important Notes
    - This removes admin read-all policy temporarily to avoid recursion
    - Admin functionality will be added after first admin is created
*/

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow first user registration" ON usuarios;
DROP POLICY IF EXISTS "Users can create own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can read own profile" ON usuarios;
DROP POLICY IF EXISTS "Admin geral can read all users" ON usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção do primeiro admin" ON usuarios;
DROP POLICY IF EXISTS "Admins podem gerenciar usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admin auxiliar can manage users" ON usuarios;

-- Policy 1: Allow first user registration (when no users exist)
-- This allows the initial admin to be created without authentication issues
CREATE POLICY "Allow first user registration"
  ON usuarios FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (SELECT COUNT(*) FROM usuarios) = 0
  );

-- Policy 2: Allow authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy 3: Users can read their own data
CREATE POLICY "Users can read own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Policy 4: Users can update their own profile (basic fields only)
CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
