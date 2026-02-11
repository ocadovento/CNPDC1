/*
  # Criar Funções para Cálculo de Paridade de Gênero e Estatísticas

  1. Funções Criadas
    
    A. `calcular_paridade_genero(evento_id, estado_uf, cota_representada)`
       - Calcula estatísticas de gênero para uma delegação
       - Retorna: total, mulheres, homens, percentual, status, cor do indicador
    
    B. `calcular_vagas_por_cota(evento_id, estado_uf)`
       - Calcula vagas disponíveis para cada cota
       - Retorna: cota, limite, preenchidas, disponíveis, por gênero
    
    C. `calcular_ampla_concorrencia(evento_id, estado_uf)`
       - Calcula vagas de ampla concorrência incluindo remanescentes
       - Retorna: total estado, vagas cotas, vagas ampla concorrência
  
  2. Regras de Negócio
    - Paridade verde (≥50% mulheres): #10B981
    - Paridade amarela (40-49%): #F59E0B
    - Paridade vermelha (<40%): #EF4444
    - Limites de cotas: Negra(6), LGBTQPN+(2), Indígena(3), Jovem(3), PcD(3), Idosa(3)
  
  3. Segurança
    - Funções são SECURITY DEFINER para acesso consistente
    - Respeitam RLS nas consultas internas
*/

-- ============================================================================
-- Função 1: Calcular Paridade de Gênero
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
AS $$
BEGIN
  RETURN QUERY
  WITH contagem AS (
    SELECT 
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE genero = 'mulher')::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE genero = 'homem')::INTEGER AS homens,
      COUNT(*) FILTER (WHERE genero IS NULL OR genero = '')::INTEGER AS sem_genero
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
-- Função 2: Calcular Vagas por Cota
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
AS $$
BEGIN
  RETURN QUERY
  WITH limites_cotas AS (
    SELECT 
      'pessoa_negra'::TEXT AS cota, 
      'Pessoa Negra'::TEXT AS label, 
      6 AS limite,
      '#1E40AF'::TEXT AS cor
    UNION ALL SELECT 'lgbtqpn', 'LGBTQPN+', 2, '#7C3AED'
    UNION ALL SELECT 'pessoa_indigena', 'Pessoa Indígena', 3, '#059669'
    UNION ALL SELECT 'pessoa_jovem', 'Pessoa Jovem', 3, '#F59E0B'
    UNION ALL SELECT 'pessoa_com_deficiencia', 'Pessoa com Deficiência', 3, '#DC2626'
    UNION ALL SELECT 'pessoa_idosa', 'Pessoa Idosa', 3, '#EA580C'
  ),
  contagem_atual AS (
    SELECT 
      cota_representada,
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE genero = 'mulher')::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE genero = 'homem')::INTEGER AS homens
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada IN ('pessoa_negra', 'lgbtqpn', 'pessoa_indigena', 
                                'pessoa_jovem', 'pessoa_com_deficiencia', 'pessoa_idosa')
    GROUP BY cota_representada
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
  LEFT JOIN contagem_atual ca ON ca.cota_representada = lc.cota
  ORDER BY lc.limite DESC, lc.label;
END;
$$;

-- ============================================================================
-- Função 3: Calcular Ampla Concorrência (com vagas remanescentes)
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
AS $$
BEGIN
  RETURN QUERY
  WITH limites AS (
    SELECT 
      (6 + 2 + 3 + 3 + 3 + 3)::INTEGER AS total_vagas_cotas
  ),
  cotas_preenchidas AS (
    SELECT 
      COUNT(*)::INTEGER AS total_cotas
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada IN ('pessoa_negra', 'lgbtqpn', 'pessoa_indigena', 
                                'pessoa_jovem', 'pessoa_com_deficiencia', 'pessoa_idosa')
  ),
  ampla_preenchida AS (
    SELECT 
      COUNT(*)::INTEGER AS total_ampla,
      COUNT(*) FILTER (WHERE genero = 'mulher')::INTEGER AS mulheres,
      COUNT(*) FILTER (WHERE genero = 'homem')::INTEGER AS homens
    FROM delegacao_estado
    WHERE evento_id = p_evento_id
      AND estado_uf = p_estado_uf
      AND cota_representada = 'ampla_concorrencia'
  )
  SELECT 
    p_total_delegados_eleitos,
    l.total_vagas_cotas,
    COALESCE(cp.total_cotas, 0)::INTEGER,
    (l.total_vagas_cotas - COALESCE(cp.total_cotas, 0))::INTEGER,
    (p_total_delegados_eleitos - l.total_vagas_cotas)::INTEGER,
    (p_total_delegados_eleitos - COALESCE(cp.total_cotas, 0))::INTEGER,
    COALESCE(ap.total_ampla, 0)::INTEGER,
    (p_total_delegados_eleitos - COALESCE(cp.total_cotas, 0) - COALESCE(ap.total_ampla, 0))::INTEGER,
    COALESCE(ap.mulheres, 0)::INTEGER,
    COALESCE(ap.homens, 0)::INTEGER
  FROM limites l
  CROSS JOIN cotas_preenchidas cp
  CROSS JOIN ampla_preenchida ap;
END;
$$;

-- Comentários de documentação
COMMENT ON FUNCTION calcular_paridade_genero IS 'Calcula estatísticas de paridade de gênero para uma delegação estadual. Retorna totais, percentuais e status visual (verde/amarelo/vermelho).';
COMMENT ON FUNCTION calcular_vagas_por_cota IS 'Calcula disponibilidade de vagas para cada cota específica (Negra, LGBTQPN+, Indígena, Jovem, PcD, Idosa) incluindo distribuição por gênero.';
COMMENT ON FUNCTION calcular_ampla_concorrencia IS 'Calcula vagas de Ampla Concorrência considerando vagas remanescentes das cotas não preenchidas.';
