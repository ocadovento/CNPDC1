/*
  # Remove is_admin Function with CASCADE

  1. Problem
    - The is_admin() function has dependent policies
    - Need to use CASCADE to drop everything

  2. Solution
    - Drop function with CASCADE
    - Recreate simple policies without recursion
*/

-- Drop the function and all dependent policies
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Drop any remaining policies on usuarios
DROP POLICY IF EXISTS "Admin geral pode ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin geral pode inserir usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin geral pode atualizar usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Select profiles" ON usuarios;
DROP POLICY IF EXISTS "Update profiles" ON usuarios;
DROP POLICY IF EXISTS "Insert profiles" ON usuarios;
DROP POLICY IF EXISTS "Delete profiles" ON usuarios;

-- Create simple policies without recursion

-- SELECT: Users can read own profile only
CREATE POLICY "usuarios_select_own"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- UPDATE: Users can update own profile only  
CREATE POLICY "usuarios_update_own"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- INSERT: Users can insert their own profile
CREATE POLICY "usuarios_insert_own"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- DELETE: Disabled for safety
CREATE POLICY "usuarios_delete_disabled"
  ON usuarios FOR DELETE
  TO authenticated
  USING (false);
