/*
  # Re-enable RLS with Simple, Non-Recursive Policies

  1. Purpose
    - Re-enable RLS on all tables
    - Create simple policies that don't cause recursion
    - Ensure authentication works properly

  2. Strategy
    - Use direct auth.uid() checks where possible
    - Avoid complex subqueries during authentication
    - Keep policies simple and performant

  3. Tables
    - usuarios: Users can view/update their own data
    - estados_brasil: Public read access
    - documents: Public read, authenticated write
    - delegacao_estado: Authenticated users can manage
    - eventos_teias_foruns: Authenticated users can manage
    - inscricoes_membros: Authenticated users can manage
*/

-- Re-enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados_brasil ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegacao_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_teias_foruns ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes_membros ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- USUARIOS TABLE POLICIES
CREATE POLICY "usuarios_select_own"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "usuarios_insert_own"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "usuarios_update_own"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ESTADOS_BRASIL TABLE POLICIES
CREATE POLICY "estados_public_read"
  ON estados_brasil FOR SELECT
  TO public
  USING (true);

-- DOCUMENTS TABLE POLICIES
CREATE POLICY "documents_public_read"
  ON documents FOR SELECT
  TO public
  USING (true);

CREATE POLICY "documents_authenticated_insert"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "documents_authenticated_update"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "documents_authenticated_delete"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

-- DELEGACAO_ESTADO TABLE POLICIES
CREATE POLICY "delegacao_authenticated_select"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "delegacao_authenticated_insert"
  ON delegacao_estado FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "delegacao_authenticated_update"
  ON delegacao_estado FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "delegacao_authenticated_delete"
  ON delegacao_estado FOR DELETE
  TO authenticated
  USING (true);

-- EVENTOS_TEIAS_FORUNS TABLE POLICIES
CREATE POLICY "eventos_authenticated_select"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "eventos_authenticated_insert"
  ON eventos_teias_foruns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "eventos_authenticated_update"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "eventos_authenticated_delete"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (true);

-- INSCRICOES_MEMBROS TABLE POLICIES
CREATE POLICY "inscricoes_authenticated_select"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "inscricoes_authenticated_insert"
  ON inscricoes_membros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "inscricoes_authenticated_update"
  ON inscricoes_membros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "inscricoes_authenticated_delete"
  ON inscricoes_membros FOR DELETE
  TO authenticated
  USING (true);
