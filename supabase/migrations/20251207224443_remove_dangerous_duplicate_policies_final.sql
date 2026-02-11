/*
  # Remove dangerous and duplicate policies from usuarios table

  1. Changes
    - Remove "Allow user registration" (public) - DANGEROUS! Allows anyone to create users
    - Remove "Authenticated users can view all users" - duplicate of our secure policy
    - Remove "Users can update own profile" - only admins should update users
    
  2. Final Security State
    - Only authenticated users can read users
    - Only first user or admins can create users
    - Only admins can update/delete users
*/

-- Remove the dangerous public policy that allows anyone to register
DROP POLICY IF EXISTS "Allow user registration" ON usuarios;

-- Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all users" ON usuarios;

-- Remove user self-update policy (only admins should update)
DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;
