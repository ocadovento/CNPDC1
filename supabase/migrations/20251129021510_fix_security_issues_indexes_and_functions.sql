/*
  # Fix Security Issues - Unused Indexes and Function Search Paths

  ## Changes Made
  
  1. **Unused Indexes Removal**
     - Drop `idx_inscricoes_membros_delegacao_id` (unused)
     - Drop `idx_teias_estaduais_estado_uf` (unused)
     - Drop `idx_usuarios_estado_uf` (unused)

  2. **Function Search Path Security**
     - Fix `insert_evento_teia` function with immutable search_path
     - Fix `update_evento_teia` function with immutable search_path
     - Add SECURITY DEFINER and SET search_path for security

  ## Security Notes
  - Removing unused indexes improves database performance
  - Setting immutable search_path prevents search path injection attacks
  - Functions now execute with secure, predictable schema resolution
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_inscricoes_membros_delegacao_id;
DROP INDEX IF EXISTS idx_teias_estaduais_estado_uf;
DROP INDEX IF EXISTS idx_usuarios_estado_uf;

-- Recreate insert_evento_teia function with secure search_path
CREATE OR REPLACE FUNCTION public.insert_evento_teia(
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
SECURITY DEFINER
SET search_path = public
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

-- Recreate update_evento_teia function with secure search_path
CREATE OR REPLACE FUNCTION public.update_evento_teia(
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
SECURITY DEFINER
SET search_path = public
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