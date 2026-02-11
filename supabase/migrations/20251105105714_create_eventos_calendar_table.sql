/*
  # Create Calendar Events Table for Teias and Forums

  1. New Tables
    - `eventos_teias_foruns`
      - `id` (uuid, primary key)
      - `representante_id` (uuid, foreign key to usuarios)
      - `tipo_evento` (text) - 'teia' or 'forum'
      - `data_evento` (date) - Event date
      - `cidade` (text) - City name
      - `estado_uf` (text) - State UF code
      - `temas` (text) - Event themes
      - `quantidade_pontos_estimada` (integer) - Estimated number of participating points
      - `pode_adicionar_delegacao` (boolean) - Whether delegation can be added (3 days after event)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `eventos_teias_foruns` table
    - Add policies for representatives to manage their events
    - Add policies for admins to view all events
*/

CREATE TABLE IF NOT EXISTS eventos_teias_foruns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  representante_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_evento text NOT NULL CHECK (tipo_evento IN ('teia', 'forum')),
  data_evento date NOT NULL,
  cidade text NOT NULL,
  estado_uf text NOT NULL,
  temas text NOT NULL,
  quantidade_pontos_estimada integer DEFAULT 0,
  pode_adicionar_delegacao boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE eventos_teias_foruns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Representatives can create their own events"
  ON eventos_teias_foruns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
    )
    AND representante_id = auth.uid()
  );

CREATE POLICY "Representatives can view their own events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (
    representante_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Representatives can update their own events"
  ON eventos_teias_foruns
  FOR UPDATE
  TO authenticated
  USING (representante_id = auth.uid())
  WITH CHECK (representante_id = auth.uid());

CREATE POLICY "Representatives can delete their own events"
  ON eventos_teias_foruns
  FOR DELETE
  TO authenticated
  USING (representante_id = auth.uid());

CREATE POLICY "Admins can view all events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE OR REPLACE FUNCTION update_eventos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER eventos_teias_foruns_updated_at
  BEFORE UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION update_eventos_updated_at();

CREATE OR REPLACE FUNCTION check_delegacao_availability()
RETURNS TRIGGER AS $$
BEGIN
  NEW.pode_adicionar_delegacao = (CURRENT_DATE >= NEW.data_evento + INTERVAL '3 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER eventos_check_delegacao_availability
  BEFORE INSERT OR UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION check_delegacao_availability();
