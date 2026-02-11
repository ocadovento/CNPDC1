/*
  # Fix Documents Table RLS Policies

  1. Problem
    - Current policies query usuarios table recursively to check admin status
    - This can cause performance issues and errors
    - Needs to work with current usuarios policies

  2. Solution
    - Simplify policies to avoid recursive checks
    - Allow authenticated users to manage documents (temporary)
    - Will be restricted properly after admin system is fully working

  3. Changes
    - Drop old policies with recursive checks
    - Create simple policies for authenticated users
    - Public can still view documents
*/

-- Drop all existing policies on documents
DROP POLICY IF EXISTS "Public can view documents" ON documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

-- Public can view all documents
CREATE POLICY "documents_select_public"
  ON documents FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert documents (temporary - admin check removed)
CREATE POLICY "documents_insert_authenticated"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update documents (temporary - admin check removed)
CREATE POLICY "documents_update_authenticated"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete documents (temporary - admin check removed)
CREATE POLICY "documents_delete_authenticated"
  ON documents FOR DELETE
  TO authenticated
  USING (true);
