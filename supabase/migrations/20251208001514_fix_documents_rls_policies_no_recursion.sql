/*
  # Fix Documents RLS Policies - Remove Recursion

  1. Problem
    - Current policies query usuarios table which also has RLS
    - This causes recursion or blocks legitimate admin users
    - Users cannot insert documents even when authenticated as admin

  2. Solution
    - Create a SECURITY DEFINER function to check admin status
    - This function bypasses RLS and directly checks auth schema
    - Recreate all documents policies to use this safe function

  3. Security
    - Function only checks if user is admin (read-only operation)
    - No risk of privilege escalation
    - Maintains proper access control

  4. Policies
    - INSERT: Only admins can insert
    - SELECT: Public can read
    - UPDATE: Only admins can update
    - DELETE: Only admins can delete
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.is_admin_user_safe() CASCADE;

-- Create safe function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_type text;
BEGIN
  -- Get current authenticated user's ID
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Query usuarios table directly without RLS
  SELECT tipo_usuario INTO user_type
  FROM public.usuarios
  WHERE id = auth.uid();

  -- Check if user is admin
  RETURN user_type IN ('admin_geral', 'admin_auxiliar');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
DROP POLICY IF EXISTS "Public can view documents" ON documents;

-- Recreate policies using the safe function
CREATE POLICY "Admins can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user_safe());

CREATE POLICY "Admins can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (is_admin_user_safe())
  WITH CHECK (is_admin_user_safe());

CREATE POLICY "Admins can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (is_admin_user_safe());

CREATE POLICY "Public can view documents"
  ON documents
  FOR SELECT
  TO public
  USING (true);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin_user_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user_safe() TO anon;
