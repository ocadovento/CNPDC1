/*
  # Final Security Fixes - Complete

  1. Changes
    - Remove duplicate indexes (keep the most recent ones)
    - Ensure all RLS policies use (select auth.uid()) for performance
    - Remove any remaining unused indexes

  2. Security
    - All policies optimized for performance
    - No functional changes, only performance improvements
*/

-- Remove duplicate indexes, keep the ones created by the latest migration
DROP INDEX IF EXISTS idx_delegacao_estado_evento_id;
DROP INDEX IF EXISTS idx_delegacao_estado_representante_id;
DROP INDEX IF EXISTS idx_eventos_teias_foruns_representante_id;
DROP INDEX IF EXISTS idx_teias_estaduais_representante_id;

-- These are the correct index names from our migration
-- They should already exist, but we ensure they're there
CREATE INDEX IF NOT EXISTS idx_delegacao_evento_id ON delegacao_estado(evento_id);
CREATE INDEX IF NOT EXISTS idx_delegacao_representante_id ON delegacao_estado(representante_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_eventos_representante_id ON eventos_teias_foruns(representante_id);
CREATE INDEX IF NOT EXISTS idx_teias_representante_id ON teias_estaduais(representante_id);

-- Fix all remaining RLS policies to use (select auth.uid())
-- This ensures they are evaluated once per query, not per row

-- Fix usuarios policies
DROP POLICY IF EXISTS "Users and admins read profiles" ON usuarios;
CREATE POLICY "Users and admins read profiles"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Users and admins update profiles" ON usuarios;
CREATE POLICY "Users and admins update profiles"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON usuarios;
CREATE POLICY "Users can insert own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins manage all profiles" ON usuarios;
CREATE POLICY "Admins manage all profiles"
  ON usuarios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Fix eventos_teias_foruns policies
DROP POLICY IF EXISTS "Representatives can view their own events" ON eventos_teias_foruns;
CREATE POLICY "Representatives can view their own events"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (representante_id = (select auth.uid()));

DROP POLICY IF EXISTS "Representatives can update their own events" ON eventos_teias_foruns;
CREATE POLICY "Representatives can update their own events"
  ON eventos_teias_foruns FOR UPDATE
  TO authenticated
  USING (representante_id = (select auth.uid()))
  WITH CHECK (representante_id = (select auth.uid()));

DROP POLICY IF EXISTS "Representatives can delete their own events" ON eventos_teias_foruns;
CREATE POLICY "Representatives can delete their own events"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (representante_id = (select auth.uid()));

DROP POLICY IF EXISTS "Representatives and admins can create events" ON eventos_teias_foruns;
CREATE POLICY "Representatives and admins can create events"
  ON eventos_teias_foruns FOR INSERT
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

DROP POLICY IF EXISTS "Admins can view all events" ON eventos_teias_foruns;
CREATE POLICY "Admins can view all events"
  ON eventos_teias_foruns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Admins can update all events" ON eventos_teias_foruns;
CREATE POLICY "Admins can update all events"
  ON eventos_teias_foruns FOR UPDATE
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

DROP POLICY IF EXISTS "Admins can delete all events" ON eventos_teias_foruns;
CREATE POLICY "Admins can delete all events"
  ON eventos_teias_foruns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Fix delegacao_estado policies
DROP POLICY IF EXISTS "Representatives can view their delegation members" ON delegacao_estado;
CREATE POLICY "Representatives can view their delegation members"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all delegation members" ON delegacao_estado;
CREATE POLICY "Admins can view all delegation members"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Representatives and admins can insert delegation members" ON delegacao_estado;
CREATE POLICY "Representatives and admins can insert delegation members"
  ON delegacao_estado FOR INSERT
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

DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;
CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado FOR UPDATE
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

DROP POLICY IF EXISTS "Representatives and admins can delete delegation members" ON delegacao_estado;
CREATE POLICY "Representatives and admins can delete delegation members"
  ON delegacao_estado FOR DELETE
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

-- Fix documents policies
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Admins can update documents" ON documents;
CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
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

DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Fix inscricoes_membros policies
DROP POLICY IF EXISTS "Membros and admins can view inscricoes" ON inscricoes_membros;
CREATE POLICY "Membros and admins can view inscricoes"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (
    delegacao_id IN (
      SELECT id FROM delegacao_estado WHERE cpf = (
        SELECT cpf FROM usuarios WHERE id = (select auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Membros podem atualizar própria inscrição" ON inscricoes_membros;
CREATE POLICY "Membros podem atualizar própria inscrição"
  ON inscricoes_membros FOR UPDATE
  TO authenticated
  USING (
    delegacao_id IN (
      SELECT id FROM delegacao_estado WHERE cpf = (
        SELECT cpf FROM usuarios WHERE id = (select auth.uid())
      )
    )
  )
  WITH CHECK (
    delegacao_id IN (
      SELECT id FROM delegacao_estado WHERE cpf = (
        SELECT cpf FROM usuarios WHERE id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Membros podem inserir própria inscrição se estiverem na dele" ON inscricoes_membros;
CREATE POLICY "Membros podem inserir própria inscrição se estiverem na dele"
  ON inscricoes_membros FOR INSERT
  TO authenticated
  WITH CHECK (
    delegacao_id IN (
      SELECT id FROM delegacao_estado WHERE cpf = (
        SELECT cpf FROM usuarios WHERE id = (select auth.uid())
      )
    )
  );
