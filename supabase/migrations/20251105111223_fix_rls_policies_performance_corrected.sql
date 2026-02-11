/*
  # Fix RLS Policies Performance - Corrected

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) in all RLS policies
    - This prevents re-evaluation for each row and improves query performance at scale
  
  2. Tables Updated
    - usuarios
    - eventos_teias_foruns
    - delegacao_estado
    - teias_estaduais
    - inscricoes_membros
    - documents
*/

-- usuarios table policies
DROP POLICY IF EXISTS "Users read own profile" ON usuarios;
DROP POLICY IF EXISTS "Users update own profile" ON usuarios;
DROP POLICY IF EXISTS "Users insert own profile" ON usuarios;

CREATE POLICY "Users read own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users insert own profile"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- eventos_teias_foruns table policies
DROP POLICY IF EXISTS "Representatives can view their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can update their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives can delete their own events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Representatives and admins can create events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can view all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can update all events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Admins can delete all events" ON eventos_teias_foruns;

CREATE POLICY "Representatives can view their own events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (representante_id = (select auth.uid()));

CREATE POLICY "Representatives can update their own events"
  ON eventos_teias_foruns
  FOR UPDATE
  TO authenticated
  USING (representante_id = (select auth.uid()))
  WITH CHECK (representante_id = (select auth.uid()));

CREATE POLICY "Representatives can delete their own events"
  ON eventos_teias_foruns
  FOR DELETE
  TO authenticated
  USING (representante_id = (select auth.uid()));

CREATE POLICY "Representatives and admins can create events"
  ON eventos_teias_foruns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND (
        usuarios.tipo_usuario = 'representante_gt'
        OR usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      )
    )
  );

CREATE POLICY "Admins can view all events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update all events"
  ON eventos_teias_foruns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete all events"
  ON eventos_teias_foruns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- delegacao_estado table policies
DROP POLICY IF EXISTS "Representatives can view their delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins can view all delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can insert delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can delete delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representantes GT podem inscrever delegação do seu estado" ON delegacao_estado;
DROP POLICY IF EXISTS "Representantes GT podem atualizar delegação do seu estado" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins auxiliares podem ver todas delegações" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins auxiliares podem inserir delegações" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins auxiliares podem atualizar delegações" ON delegacao_estado;

CREATE POLICY "Representatives can view their delegation members"
  ON delegacao_estado
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all delegation members"
  ON delegacao_estado
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Representatives and admins can insert delegation members"
  ON delegacao_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = (select auth.uid())
        AND usuarios.tipo_usuario = 'representante_gt'
      )
      AND EXISTS (
        SELECT 1 FROM eventos_teias_foruns
        WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
        AND eventos_teias_foruns.representante_id = (select auth.uid())
        AND eventos_teias_foruns.pode_adicionar_delegacao = true
      )
    )
  );

CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  );

CREATE POLICY "Representatives and admins can delete delegation members"
  ON delegacao_estado
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  );

-- teias_estaduais table policies
DROP POLICY IF EXISTS "Representantes GT podem criar teia do seu estado" ON teias_estaduais;
DROP POLICY IF EXISTS "Representantes GT podem atualizar teia do seu estado" ON teias_estaduais;
DROP POLICY IF EXISTS "Admins auxiliares podem criar teias" ON teias_estaduais;
DROP POLICY IF EXISTS "Admins auxiliares podem atualizar teias" ON teias_estaduais;

CREATE POLICY "Representantes GT podem criar teia do seu estado"
  ON teias_estaduais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = teias_estaduais.estado_uf
    )
  );

CREATE POLICY "Representantes GT podem atualizar teia do seu estado"
  ON teias_estaduais
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = teias_estaduais.estado_uf
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = teias_estaduais.estado_uf
    )
  );

CREATE POLICY "Admins auxiliares podem criar teias"
  ON teias_estaduais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins auxiliares podem atualizar teias"
  ON teias_estaduais
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- inscricoes_membros table policies
DROP POLICY IF EXISTS "Membros podem ver própria inscrição" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins podem ver todas inscrições" ON inscricoes_membros;

CREATE POLICY "Membros podem ver própria inscrição"
  ON inscricoes_membros
  FOR SELECT
  TO authenticated
  USING (delegacao_id IN (
    SELECT id FROM delegacao_estado WHERE cpf = (
      SELECT cpf FROM usuarios WHERE id = (select auth.uid())
    )
  ));

CREATE POLICY "Admins podem ver todas inscrições"
  ON inscricoes_membros
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- documents table policies
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Admins can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
