/*
  # Clean duplicate policies on usuarios table

  1. Changes
    - Remove duplicate SELECT policies
    - Remove dangerous public INSERT policy
    - Keep only the secure policies we just created
    
  2. Security
    - Only authenticated users can read users
    - Only first user or admins can create users
    - Only admins can update/delete users
*/

-- Drop duplicate and dangerous policies
DROP POLICY IF EXISTS "Allow user registration" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;
