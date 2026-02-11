/*
  # Criar tabela de cotas fixas por estado
  
  1. Nova Tabela: cotas_por_estado
    - Define quantas vagas cada estado tem por cota
    - Campos:
      - id (uuid, PK)
      - evento_id (uuid, FK) - evento da Teia
      - estado_uf (text, FK) - UF do estado
      - cota_representada (text) - tipo de cota
      - vagas_total (int) - total de vagas para essa cota
      - created_at, updated_at
  
  2. Security
    - Enable RLS
    - Policies: admins podem gerenciar, representantes e anônimos podem ler
*/

-- Criar tabela de cotas por estado
CREATE TABLE IF NOT EXISTS cotas_por_estado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES eventos_teias_foruns(id) ON DELETE CASCADE,
  estado_uf text NOT NULL REFERENCES estados_brasil(uf),
  cota_representada text NOT NULL CHECK (
    cota_representada IN (
      'pessoa_negra',
      'pessoa_indigena', 
      'pessoa_com_deficiencia',
      'pessoa_jovem',
      'pessoa_idosa',
      'mulher',
      'lgbtqpn',
      'ampla_participacao'
    )
  ),
  vagas_total integer NOT NULL CHECK (vagas_total > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(evento_id, estado_uf, cota_representada)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_cotas_evento_estado ON cotas_por_estado(evento_id, estado_uf);
CREATE INDEX IF NOT EXISTS idx_cotas_estado_cota ON cotas_por_estado(estado_uf, cota_representada);

-- Enable RLS
ALTER TABLE cotas_por_estado ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler as cotas
CREATE POLICY "Anyone can view cotas"
  ON cotas_por_estado
  FOR SELECT
  USING (true);

-- Policy: Admins podem inserir cotas
CREATE POLICY "Admins can insert cotas"
  ON cotas_por_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Policy: Admins podem atualizar cotas
CREATE POLICY "Admins can update cotas"
  ON cotas_por_estado
  FOR UPDATE
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

-- Policy: Admins podem deletar cotas
CREATE POLICY "Admins can delete cotas"
  ON cotas_por_estado
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Criar função para obter cotas disponíveis
CREATE OR REPLACE FUNCTION get_cotas_disponiveis(p_evento_id uuid, p_estado_uf text)
RETURNS TABLE (
  cota_representada text,
  vagas_total integer,
  vagas_preenchidas bigint,
  vagas_disponiveis bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cota_representada,
    c.vagas_total,
    COALESCE(COUNT(d.id), 0) as vagas_preenchidas,
    GREATEST(c.vagas_total - COALESCE(COUNT(d.id), 0), 0) as vagas_disponiveis
  FROM cotas_por_estado c
  LEFT JOIN delegacao_estado d ON (
    d.evento_id = c.evento_id 
    AND d.estado_uf = c.estado_uf 
    AND d.cota_representada = c.cota_representada
  )
  WHERE c.evento_id = p_evento_id 
    AND c.estado_uf = p_estado_uf
  GROUP BY c.id, c.cota_representada, c.vagas_total
  ORDER BY c.cota_representada;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
