/*
  # Corrigir Ambiguidade na Função calcular_vagas_por_cota
  
  1. Problema
    - Nome da coluna 'cota_representada' conflita com variáveis no SQL
    - Causa erro "column reference is ambiguous"
  
  2. Solução
    - Qualificar todos os nomes de colunas com aliases de tabela
    - Usar nomes de tabela explícitos em todas as referências
*/

DROP FUNCTION IF EXISTS calcular_vagas_por_cota(UUID, TEXT);

CREATE OR REPLACE FUNCTION calcular_vagas_por_cota(
  p_evento_id UUID,
  p_estado_uf TEXT
)
RETURNS TABLE (
  cota_representada TEXT,
  label_cota TEXT,
  limite_maximo INTEGER,
  vagas_preenchidas INTEGER,
  vagas_disponiveis INTEGER,
  vagas_mulheres INTEGER,
  vagas_homens INTEGER,
  cor_cota TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH limites_cotas AS (
    SELECT 
      c.cota_representada AS cota,
      CASE c.cota_representada
        WHEN 'pessoa_negra' THEN 'Pessoa Negra'
        WHEN 'lgbtqpn' THEN 'LGBTQPN+'
        WHEN 'pessoa_indigena' THEN 'Pessoa Indígena'
        WHEN 'pessoa_jovem' THEN 'Pessoa Jovem'
        WHEN 'pessoa_com_deficiencia' THEN 'Pessoa com Deficiência'
        WHEN 'pessoa_idosa' THEN 'Pessoa Idosa'
        WHEN 'ampla_participacao' THEN 'Ampla Participação'
        ELSE c.cota_representada
      END AS label,
      c.vagas_total AS limite,
      CASE c.cota_representada
        WHEN 'pessoa_negra' THEN '#1E40AF'
        WHEN 'lgbtqpn' THEN '#7C3AED'
        WHEN 'pessoa_indigena' THEN '#059669'
        WHEN 'pessoa_jovem' THEN '#F59E0B'
        WHEN 'pessoa_com_deficiencia' THEN '#DC2626'
        WHEN 'pessoa_idosa' THEN '#EA580C'
        WHEN 'ampla_participacao' THEN '#6B7280'
        ELSE '#6B7280'
      END AS cor
    FROM cotas_por_estado c
    WHERE c.evento_id = p_evento_id
      AND c.estado_uf = p_estado_uf
  ),
  contagem_atual AS (
    SELECT 
      d.cota_representada AS cota,
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE d.genero IN ('feminino', 'mulher_cis'))::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE d.genero IN ('masculino', 'homem_cis'))::INTEGER AS homens
    FROM delegacao_estado d
    WHERE d.evento_id = p_evento_id
      AND d.estado_uf = p_estado_uf
    GROUP BY d.cota_representada
  )
  SELECT 
    lc.cota,
    lc.label,
    lc.limite,
    COALESCE(ca.total, 0)::INTEGER,
    (lc.limite - COALESCE(ca.total, 0))::INTEGER,
    COALESCE(ca.mulheres, 0)::INTEGER,
    COALESCE(ca.homens, 0)::INTEGER,
    lc.cor
  FROM limites_cotas lc
  LEFT JOIN contagem_atual ca ON ca.cota = lc.cota
  ORDER BY lc.limite DESC, lc.label;
END;
$$;

COMMENT ON FUNCTION calcular_vagas_por_cota IS 'Calcula vagas por cota a partir da tabela cotas_por_estado';
