/*
  # Fix Infinite Recursion in usuarios Table Policies

  1. Problem
    - Current policies query the usuarios table within their own conditions
    - This creates infinite recursion when Postgres tries to evaluate the policies
    
  2. Solution
    - Remove ALL existing policies
    - Create simple, non-recursive policies
    - Users can only access their own data (id = auth.uid())
    - Admin access should be handled at application level or via service role
    
  3. Security
    - Each user can only read/update their own profile
    - Users can insert their own profile on first login
    - No recursive queries in policy definitions
*/

-- Drop all existing policies on usuarios table
DROP POLICY IF EXISTS "Users and admins read profiles" ON usuarios;
DROP POLICY IF EXISTS "Users and admins update profiles" ON usuarios;
DROP POLICY IF EXISTS "Users can insert own profile" ON usuarios;
DROP POLICY IF EXISTS "Users insert own profile" ON usuarios;
DROP POLICY IF EXISTS "Users read own profile" ON usuarios;
DROP POLICY IF EXISTS "Users update own profile" ON usuarios;

-- Create simple, non-recursive policies

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow user insert own profile"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow users to read their own profile
CREATE POLICY "Allow user read own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Allow user update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow users to delete their own profile
CREATE POLICY "Allow user delete own profile"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());
