/*
  # Create RPC functions for evento handling without timezone conversion

  Creates two stored functions to handle INSERT and UPDATE operations on eventos_teias_foruns
  table, ensuring date values are handled correctly without timezone conversion issues.

  Functions:
    - insert_evento_teia: Inserts a new event with proper date handling
    - update_evento_teia: Updates an existing event with proper date handling

  Security:
    - Functions execute with caller's privileges (security definer not needed)
    - RLS policies on eventos_teias_foruns table still apply
*/

-- Function to insert evento
CREATE OR REPLACE FUNCTION insert_evento_teia(
  p_tipo_evento TEXT,
  p_data_evento TEXT,
  p_data_fim TEXT,
  p_cidade TEXT,
  p_estado_uf TEXT,
  p_temas TEXT,
  p_quantidade_pontos_estimada INTEGER,
  p_representante_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO eventos_teias_foruns (
    tipo_evento,
    data_evento,
    data_fim,
    cidade,
    estado_uf,
    temas,
    quantidade_pontos_estimada,
    representante_id
  ) VALUES (
    p_tipo_evento,
    p_data_evento::date,
    CASE WHEN p_data_fim IS NOT NULL AND p_data_fim != '' THEN p_data_fim::date ELSE NULL END,
    p_cidade,
    p_estado_uf,
    p_temas,
    p_quantidade_pontos_estimada,
    p_representante_id
  );
END;
$$;

-- Function to update evento
CREATE OR REPLACE FUNCTION update_evento_teia(
  p_id UUID,
  p_tipo_evento TEXT,
  p_data_evento TEXT,
  p_data_fim TEXT,
  p_cidade TEXT,
  p_estado_uf TEXT,
  p_temas TEXT,
  p_quantidade_pontos_estimada INTEGER,
  p_representante_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE eventos_teias_foruns
  SET
    tipo_evento = p_tipo_evento,
    data_evento = p_data_evento::date,
    data_fim = CASE WHEN p_data_fim IS NOT NULL AND p_data_fim != '' THEN p_data_fim::date ELSE NULL END,
    cidade = p_cidade,
    estado_uf = p_estado_uf,
    temas = p_temas,
    quantidade_pontos_estimada = p_quantidade_pontos_estimada,
    representante_id = p_representante_id
  WHERE id = p_id;
END;
$$;