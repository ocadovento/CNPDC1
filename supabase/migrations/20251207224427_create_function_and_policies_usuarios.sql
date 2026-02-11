/*
  # Create auth function and secure RLS policies for usuarios

  1. Function
    - Create auth_user_is_admin() with SECURITY DEFINER to prevent recursion
    
  2. Policies
    - Authenticated users can read all users
    - First user or admin can create users
    - Only admins can update/delete users
    
  3. Security
    - SECURITY DEFINER bypasses RLS on the function call
    - Prevents infinite recursion when checking admin status
*/

-- Create the admin check function
CREATE OR REPLACE FUNCTION public.auth_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM usuarios
    WHERE auth_user_id = auth.uid()
    AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    AND ativo = true
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.auth_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_is_admin() TO service_role;

-- Create policies
CREATE POLICY "Authenticated users can read all users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow first user or admin to create users"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM usuarios)
    OR auth_user_is_admin()
  );

CREATE POLICY "Only admins can update users"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_user_is_admin())
  WITH CHECK (auth_user_is_admin());

CREATE POLICY "Only admins can delete users"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (auth_user_is_admin());
