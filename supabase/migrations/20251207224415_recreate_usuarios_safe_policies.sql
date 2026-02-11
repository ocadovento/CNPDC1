/*
  # Recreate Safe RLS Policies for usuarios

  1. Changes
    - Recreate simple, non-recursive RLS policies
    - Enable RLS if not already enabled
    
  2. Security
    - Allow public registration (necessary for signup)
    - Allow authenticated users to view all users (necessary for admin dashboard)
    - Allow users to update only their own profile
    - No delete policy (deletions handled through application logic)
*/

-- Ensure RLS is enabled
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert users (for registration and initial setup)
CREATE POLICY "Allow user registration"
  ON usuarios
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to view all users
CREATE POLICY "Authenticated users can view all users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow users to update their own profile only
CREATE POLICY "Users can update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
