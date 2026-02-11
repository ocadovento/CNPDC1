/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key) - Unique identifier for the document
      - `title` (text) - Document title/name
      - `file_name` (text) - Original filename
      - `file_url` (text) - URL to the stored document
      - `description` (text, nullable) - Optional document description
      - `category` (text, nullable) - Optional category for organizing documents
      - `created_at` (timestamptz) - When the document was uploaded
      - `created_by` (uuid) - User who uploaded the document
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `documents` table
    - Add policy for public read access (anyone can download documents)
    - Add policy for authenticated admin users to insert documents
    - Add policy for authenticated admin users to update documents
    - Add policy for authenticated admin users to delete documents
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  description text,
  category text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Anyone can view documents (public access)
CREATE POLICY "Public can view documents"
  ON documents FOR SELECT
  TO public
  USING (true);

-- Only admins can insert documents
CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Only admins can update documents
CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );