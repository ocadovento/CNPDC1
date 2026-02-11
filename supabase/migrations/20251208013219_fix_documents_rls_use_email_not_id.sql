/*
  # Fix Documents RLS - Use Email Instead of ID

  1. Root Cause Identified
    - IDs in auth.users DO NOT match IDs in usuarios table
    - When user authenticates, auth.uid() returns auth.users ID
    - But usuarios table has different UUIDs for the same users
    - This causes ALL admin checks to fail
    
  2. Example of the Problem
    - executivo@cultur.top in auth.users: 6a4d6f25-9a1d-4350-b4d8-522ea47fd8c4
    - executivo@cultur.top in usuarios: f7aeace4-67f8-4caf-9b16-6b139e52adc4
    - These are DIFFERENT IDs for the same person!

  3. Solution
    - Check admin status by EMAIL, not ID
    - Email is unique and consistent across both tables
    - Create new function that uses email from auth.users

  4. Changes
    - Drop old function that checked by ID
    - Create new function that checks by email
    - Update all policies to use the new function
*/

-- Drop the old function
DROP FUNCTION IF EXISTS public.is_admin_user_safe() CASCADE;

-- Create new function that checks by email
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_email text;
  user_type text;
BEGIN
  -- Get current authenticated user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- If no email found, user is not authenticated
  IF user_email IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user with this email is admin in usuarios table
  SELECT tipo_usuario INTO user_type
  FROM public.usuarios
  WHERE email = user_email;

  -- Return true if user is admin
  RETURN user_type IN ('admin_geral', 'admin_auxiliar');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Drop all existing policies on documents
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
DROP POLICY IF EXISTS "Public can view documents" ON documents;

-- Create new policies using email-based function
CREATE POLICY "Admins can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_by_email());

CREATE POLICY "Admins can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (is_admin_by_email())
  WITH CHECK (is_admin_by_email());

CREATE POLICY "Admins can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (is_admin_by_email());

CREATE POLICY "Public can view documents"
  ON documents
  FOR SELECT
  TO public
  USING (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_by_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_by_email() TO anon;

-- Create index on email in usuarios table for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
