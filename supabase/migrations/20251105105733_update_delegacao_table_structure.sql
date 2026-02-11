/*
  # Update Delegation Table Structure

  1. Changes to `delegacao_estado`
    - Add `evento_id` (uuid, foreign key to eventos_teias_foruns)
    - Add `nome_ponto_cultura` (text) - Point of Culture name
    - Add `contato_whatsapp` (text) - WhatsApp contact
    - Add `email` (text) - Email contact
    - Add `cidade` (text) - City name
    - Keep existing fields: nome_completo, cpf, estado_uf, cota_representada, inscricao_completa

  2. Security
    - Update RLS policies to work with new structure
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'evento_id'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN evento_id uuid REFERENCES eventos_teias_foruns(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'nome_ponto_cultura'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN nome_ponto_cultura text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'contato_whatsapp'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN contato_whatsapp text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'email'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'cidade'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN cidade text;
  END IF;
END $$;

DROP POLICY IF EXISTS "Representatives can insert delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives can view delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives can update delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives can delete delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins can view all delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Public can view all delegation members" ON delegacao_estado;

CREATE POLICY "Representatives can insert delegation members"
  ON delegacao_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
    )
    AND EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
      AND eventos_teias_foruns.pode_adicionar_delegacao = true
    )
  );

CREATE POLICY "Representatives can view their delegation members"
  ON delegacao_estado
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Representatives can update their delegation members"
  ON delegacao_estado
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  );

CREATE POLICY "Representatives can delete their delegation members"
  ON delegacao_estado
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM eventos_teias_foruns
      WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
      AND eventos_teias_foruns.representante_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all delegation members"
  ON delegacao_estado
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Public can read delegation for login"
  ON delegacao_estado
  FOR SELECT
  TO anon
  USING (true);
