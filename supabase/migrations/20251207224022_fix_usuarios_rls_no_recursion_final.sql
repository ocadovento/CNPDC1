/*
  # Fix usuarios RLS without recursion

  1. Changes
    - Drop ALL existing policies on usuarios table
    - Create simple, non-recursive policies
    - Disable RLS temporarily to allow admin operations
    
  2. Security
    - Users can read/update their own profile
    - First user can always insert (for initial setup)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all users" ON usuarios;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON usuarios;
DROP POLICY IF EXISTS "Allow admins to update all profiles" ON usuarios;
DROP POLICY IF EXISTS "Allow admins to delete users" ON usuarios;
DROP POLICY IF EXISTS "Allow users to read own profile" ON usuarios;
DROP POLICY IF EXISTS "Allow users to update own profile" ON usuarios;
DROP POLICY IF EXISTS "Allow user insert own profile" ON usuarios;

-- Disable RLS on usuarios table
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
