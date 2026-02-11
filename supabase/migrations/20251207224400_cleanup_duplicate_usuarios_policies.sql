/*
  # Cleanup Duplicate Policies on usuarios Table

  1. Changes
    - Remove all old policies that cause recursion
    - Keep only the new safe policies created in the previous migration
    
  2. Security
    - Maintains secure access through simple, non-recursive policies
    - Admin operations handled through application logic
*/

-- Drop all old policies that may cause recursion
DROP POLICY IF EXISTS "Allow first user or admin to create users" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON usuarios;
DROP POLICY IF EXISTS "Only admins can delete users" ON usuarios;
DROP POLICY IF EXISTS "Only admins can update users" ON usuarios;

-- Drop the function that causes recursion if it exists
DROP FUNCTION IF EXISTS auth_user_is_admin() CASCADE;

-- Keep these policies (created in previous migration):
-- 1. "Allow user registration" - FOR INSERT TO public
-- 2. "Authenticated users can view all users" - FOR SELECT TO authenticated  
-- 3. "Users can update own profile" - FOR UPDATE TO authenticated
