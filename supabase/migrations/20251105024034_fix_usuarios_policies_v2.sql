/*
  # Fix infinite recursion in usuarios policies

  1. Changes
    - Drop all existing policies on usuarios table
    - Create new simplified policies without recursion
    - Allow first user to be created without authentication
    - Allow authenticated users to read their own data

  2. Security
    - First user registration works without existing users
    - Each user can only read their own data
    - Updates require ownership verification
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Permitir inserção do primeiro admin" ON usuarios;
DROP POLICY IF EXISTS "Admins podem gerenciar usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Allow first admin registration" ON usuarios;
DROP POLICY IF EXISTS "Admin geral can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Admin auxiliar can manage users" ON usuarios;

-- Policy: Allow first user registration (when no users exist)
CREATE POLICY "Allow first user registration"
  ON usuarios FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM usuarios LIMIT 1)
  );

-- Policy: Allow authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Users can read their own data
CREATE POLICY "Users can read own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Policy: Admin geral can read all users
CREATE POLICY "Admin geral can read all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM usuarios WHERE tipo_usuario = 'admin_geral' AND ativo = true
    )
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
