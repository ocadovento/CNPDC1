/*
  # Fix RLS Policies for usuarios Table - Allow Signup

  ## Problem
  The current INSERT policy uses `id = auth.uid()` which is incorrect because:
  - `id` is the primary key in the usuarios table (UUID)
  - `auth.uid()` returns the user's ID from auth.users
  - We should compare `auth_user_id = auth.uid()` instead

  ## Changes
  1. Drop existing INSERT policy
  2. Create new INSERT policy that checks `auth_user_id = auth.uid()`
  3. This allows users to insert their own profile after signup
  
  ## Security
  - Users can only insert their own profile (auth_user_id matches their auth.uid())
  - RLS remains enabled and restrictive
*/

-- Drop the incorrect INSERT policy
DROP POLICY IF EXISTS "Allow user insert own profile" ON usuarios;

-- Create correct INSERT policy
CREATE POLICY "Allow user insert own profile"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Also fix the UPDATE policy for consistency
DROP POLICY IF EXISTS "Allow user update own profile" ON usuarios;

CREATE POLICY "Allow user update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Fix SELECT policy
DROP POLICY IF EXISTS "Allow user read own profile" ON usuarios;

CREATE POLICY "Allow user read own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Fix DELETE policy
DROP POLICY IF EXISTS "Allow user delete own profile" ON usuarios;

CREATE POLICY "Allow user delete own profile"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (auth_user_id = auth.uid());
