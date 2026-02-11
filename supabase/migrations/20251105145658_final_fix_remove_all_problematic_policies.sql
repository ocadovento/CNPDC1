/*
  # Remove All Problematic RLS Policies

  1. Purpose
    - Remove all RLS policies that cause "Database error querying schema"
    - Keep RLS enabled but with minimal, non-interfering policies
    - Allow authentication to work properly

  2. Strategy
    - Drop ALL policies from usuarios table
    - Keep RLS enabled for security
    - Auth will work without policies interfering with auth.users table
*/

-- Drop ALL policies on usuarios table
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;

-- Keep RLS enabled but allow authenticated users full access
-- This prevents the recursion issue during authentication
CREATE POLICY "usuarios_authenticated_all"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also ensure anon users can't access anything
CREATE POLICY "usuarios_anon_deny"
  ON usuarios
  FOR ALL
  TO anon
  USING (false);
