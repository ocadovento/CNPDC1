/*
  # Recriar Funções RPC com Valores Corretos
  
  1. Problemas Identificados
    - Funções buscam genero='mulher' e genero='homem'
    - Dados reais usam genero='feminino' e genero='masculino'
    - Funções usam limites fixos de cotas
    - Devem buscar limites da tabela cotas_por_estado
  
  2. Solução
    - Dropar funções existentes
    - Recriar com valores corretos
    - Usar tabela cotas_por_estado para limites dinâmicos
*/

-- Dropar funções antigas
DROP FUNCTION IF EXISTS calcular_paridade_genero(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS calcular_paridade_genero(UUID, TEXT);
DROP FUNCTION IF EXISTS calcular_vagas_por_cota(UUID, TEXT);
DROP FUNCTION IF EXISTS calcular_ampla_concorrencia(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS calcular_ampla_concorrencia(UUID, TEXT);

-- ============================================================================
-- Função 1: Calcular Paridade de Gênero (CORRIGIDA)
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_paridade_genero(
  p_evento_id UUID,
  p_estado_uf TEXT,
  p_cota_representada TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_delegados INTEGER,
  total_mulheres INTEGER,
  total_homens INTEGER,
  total_sem_genero INTEGER,
  percentual_mulheres NUMERIC,
  percentual_homens NUMERIC,
  status_paridade TEXT,
  cor_indicador TEXT,
  mensagem TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH contagem AS (
    SELECT 
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE genero IN ('feminino', 'mulher_cis'))::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE genero IN ('masculino', 'homem_cis'))::INTEGER AS homens,
      COUNT(*) FILTER (WHERE genero IS NULL OR genero = '' OR genero NOT IN ('feminino', 'mulher_cis', 'masculino', 'homem_cis'))::INTEGER AS sem_genero
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND (p_cota_representada IS NULL OR cota_representada = p_cota_representada)
  ),
  calculos AS (
    SELECT 
      total,
      mulheres,
      homens,
      sem_genero,
      CASE 
        WHEN total > 0 THEN ROUND((mulheres::NUMERIC / total::NUMERIC * 100), 2)
        ELSE 0
      END AS perc_mulheres,
      CASE 
        WHEN total > 0 THEN ROUND((homens::NUMERIC / total::NUMERIC * 100), 2)
        ELSE 0
      END AS perc_homens
    FROM contagem
  )
  SELECT 
    c.total,
    c.mulheres,
    c.homens,
    c.sem_genero,
    c.perc_mulheres,
    c.perc_homens,
    CASE 
      WHEN c.total = 0 THEN 'sem_delegados'
      WHEN c.perc_mulheres >= 50 THEN 'paridade_ok'
      WHEN c.perc_mulheres >= 40 THEN 'paridade_baixa'
      ELSE 'paridade_critica'
    END AS status,
    CASE 
      WHEN c.total = 0 THEN '#6B7280'
      WHEN c.perc_mulheres >= 50 THEN '#10B981'
      WHEN c.perc_mulheres >= 40 THEN '#F59E0B'
      ELSE '#EF4444'
    END AS cor,
    CASE 
      WHEN c.total = 0 THEN 'Nenhum delegado cadastrado'
      WHEN c.perc_mulheres >= 50 THEN '✓ Paridade alcançada! Delegação tem ' || c.perc_mulheres || '% de mulheres'
      WHEN c.perc_mulheres >= 40 THEN '⚠ Atenção: Apenas ' || c.perc_mulheres || '% de mulheres. Meta: 50%'
      ELSE '✗ Crítico: Apenas ' || c.perc_mulheres || '% de mulheres. Necessário adicionar mais mulheres!'
    END AS msg
  FROM calculos c;
END;
$$;

-- ============================================================================
-- Função 2: Calcular Vagas por Cota (CORRIGIDA)
-- ============================================================================

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
      c.cota_representada,
      CASE c.cota_representada
        WHEN 'pessoa_negra' THEN 'Pessoa Negra'
        WHEN 'lgbtqpn' THEN 'LGBTQPN+'
        WHEN 'pessoa_indigena' THEN 'Pessoa Indígena'
        WHEN 'pessoa_jovem' THEN 'Pessoa Jovem'
        WHEN 'pessoa_com_deficiencia' THEN 'Pessoa com Deficiência'
        WHEN 'pessoa_idosa' THEN 'Pessoa Idosa'
        WHEN 'ampla_participacao' THEN 'Ampla Participação'
        ELSE c.cota_representada
      END AS label_cota,
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
      cota_representada,
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE genero IN ('feminino', 'mulher_cis'))::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE genero IN ('masculino', 'homem_cis'))::INTEGER AS homens
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
    GROUP BY cota_representada
  )
  SELECT 
    lc.cota_representada,
    lc.label_cota,
    lc.limite,
    COALESCE(ca.total, 0)::INTEGER,
    (lc.limite - COALESCE(ca.total, 0))::INTEGER,
    COALESCE(ca.mulheres, 0)::INTEGER,
    COALESCE(ca.homens, 0)::INTEGER,
    lc.cor
  FROM limites_cotas lc
  LEFT JOIN contagem_atual ca ON ca.cota_representada = lc.cota_representada
  ORDER BY lc.limite DESC, lc.label_cota;
END;
$$;

-- ============================================================================
-- Função 3: Calcular Ampla Participação (CORRIGIDA)
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_ampla_concorrencia(
  p_evento_id UUID,
  p_estado_uf TEXT,
  p_total_delegados_eleitos INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_estado INTEGER,
  vagas_cotas_especificas INTEGER,
  vagas_cotas_preenchidas INTEGER,
  vagas_cotas_remanescentes INTEGER,
  limite_ampla_base INTEGER,
  limite_ampla_com_remanescentes INTEGER,
  ampla_preenchidas INTEGER,
  ampla_disponiveis INTEGER,
  ampla_mulheres INTEGER,
  ampla_homens INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH limites AS (
    SELECT 
      COALESCE(SUM(vagas_total), 0)::INTEGER AS total_vagas_cotas
    FROM cotas_por_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada != 'ampla_participacao'
  ),
  cotas_preenchidas AS (
    SELECT 
      COUNT(*)::INTEGER AS total_cotas
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada != 'ampla_participacao'
  ),
  ampla_preenchida AS (
    SELECT 
      COUNT(*)::INTEGER AS total_ampla,
      COUNT(*) FILTER (WHERE genero IN ('feminino', 'mulher_cis'))::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE genero IN ('masculino', 'homem_cis'))::INTEGER AS homens
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada = 'ampla_participacao'
  ),
  limite_ampla AS (
    SELECT 
      COALESCE(vagas_total, 10)::INTEGER AS limite_base
    FROM cotas_por_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada = 'ampla_participacao'
    LIMIT 1
  )
  SELECT 
    p_total_delegados_eleitos,
    l.total_vagas_cotas,
    COALESCE(cp.total_cotas, 0)::INTEGER,
    (l.total_vagas_cotas - COALESCE(cp.total_cotas, 0))::INTEGER,
    COALESCE(la.limite_base, 10)::INTEGER,
    (COALESCE(la.limite_base, 10) + (l.total_vagas_cotas - COALESCE(cp.total_cotas, 0)))::INTEGER,
    COALESCE(ap.total_ampla, 0)::INTEGER,
    (COALESCE(la.limite_base, 10) + (l.total_vagas_cotas - COALESCE(cp.total_cotas, 0)) - COALESCE(ap.total_ampla, 0))::INTEGER,
    COALESCE(ap.mulheres, 0)::INTEGER,
    COALESCE(ap.homens, 0)::INTEGER
  FROM limites l
  CROSS JOIN cotas_preenchidas cp
  CROSS JOIN ampla_preenchida ap
  CROSS JOIN limite_ampla la;
END;
$$;

-- Comentários
COMMENT ON FUNCTION calcular_paridade_genero IS 'Calcula paridade de gênero usando valores reais: feminino/masculino';
COMMENT ON FUNCTION calcular_vagas_por_cota IS 'Calcula vagas por cota a partir da tabela cotas_por_estado';
COMMENT ON FUNCTION calcular_ampla_concorrencia IS 'Calcula vagas de ampla participação com remanescentes';
