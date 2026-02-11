/*
  # Sistema Dinâmico de Disponibilidade de Vagas

  1. Função para Calcular Vagas Disponíveis por Cota
    - Calcula quantas vagas estão realmente disponíveis em cada cota
    - Considera delegados já inscritos
    - Para ampla participação, adiciona vagas não preenchidas das cotas específicas
    
  2. Lógica de Ampla Participação Flexível
    - Ampla participação começa com 10 vagas (mínimo)
    - Cada vaga não preenchida em cota específica vai para ampla participação
    - Exemplo: Se 5 pessoas negras se inscrevem (limite 6), ampla fica com 11 vagas
    - Limite máximo total por estado: 30 vagas
    
  3. Exemplo de Cálculo (PA com 30 vagas totais)
    - Cotas específicas têm 20 vagas no máximo
    - Se todas as 20 vagas de cotas forem preenchidas: ampla tem 10 vagas
    - Se apenas 15 vagas de cotas forem preenchidas: ampla tem 15 vagas (10 + 5 não usadas)
*/

-- Função para calcular vagas disponíveis de uma cota específica
CREATE OR REPLACE FUNCTION calcular_vagas_disponiveis_cota(
  p_evento_id uuid,
  p_estado_uf text,
  p_cota_representada text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vagas_total integer;
  v_vagas_ocupadas integer;
  v_vagas_disponiveis integer;
BEGIN
  -- Buscar o total de vagas definido para esta cota
  SELECT vagas_total INTO v_vagas_total
  FROM cotas_por_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada = p_cota_representada;
  
  -- Se não encontrou a cota, retornar 0
  IF v_vagas_total IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Contar quantos delegados já estão inscritos nesta cota
  SELECT COUNT(*) INTO v_vagas_ocupadas
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada = p_cota_representada;
  
  -- Calcular vagas disponíveis
  v_vagas_disponiveis := v_vagas_total - COALESCE(v_vagas_ocupadas, 0);
  
  RETURN GREATEST(v_vagas_disponiveis, 0);
END;
$$;

-- Função para calcular vagas disponíveis de AMPLA PARTICIPAÇÃO (dinâmica)
CREATE OR REPLACE FUNCTION calcular_vagas_ampla_participacao(
  p_evento_id uuid,
  p_estado_uf text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vagas_ampla_minimo integer;
  v_total_cotas_especificas_limite integer;
  v_total_cotas_especificas_ocupadas integer;
  v_vagas_cotas_nao_preenchidas integer;
  v_vagas_ampla_ocupadas integer;
  v_vagas_ampla_disponiveis integer;
BEGIN
  -- Buscar o mínimo de vagas de ampla participação (geralmente 10)
  SELECT vagas_total INTO v_vagas_ampla_minimo
  FROM cotas_por_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada = 'ampla_participacao';
  
  IF v_vagas_ampla_minimo IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calcular total de vagas definidas para cotas específicas (exceto ampla participação)
  SELECT SUM(vagas_total) INTO v_total_cotas_especificas_limite
  FROM cotas_por_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada != 'ampla_participacao';
  
  -- Contar quantos delegados já estão nas cotas específicas
  SELECT COUNT(*) INTO v_total_cotas_especificas_ocupadas
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada != 'ampla_participacao';
  
  -- Calcular vagas de cotas não preenchidas
  v_vagas_cotas_nao_preenchidas := COALESCE(v_total_cotas_especificas_limite, 0) - COALESCE(v_total_cotas_especificas_ocupadas, 0);
  
  -- Contar quantos delegados já estão em ampla participação
  SELECT COUNT(*) INTO v_vagas_ampla_ocupadas
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada = 'ampla_participacao';
  
  -- Calcular vagas disponíveis de ampla participação
  -- = mínimo de ampla + vagas não preenchidas nas cotas - já ocupadas em ampla
  v_vagas_ampla_disponiveis := v_vagas_ampla_minimo + v_vagas_cotas_nao_preenchidas - COALESCE(v_vagas_ampla_ocupadas, 0);
  
  RETURN GREATEST(v_vagas_ampla_disponiveis, 0);
END;
$$;

-- Função para calcular o total de vagas disponíveis no estado (deve ser no máximo 30)
CREATE OR REPLACE FUNCTION calcular_total_vagas_disponiveis_estado(
  p_evento_id uuid,
  p_estado_uf text
)
RETURNS TABLE (
  estado text,
  total_delegados_inscritos integer,
  total_vagas_limite integer,
  total_vagas_disponiveis integer,
  vagas_ampla_disponiveis integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_inscritos integer;
  v_total_limite integer;
  v_vagas_ampla integer;
BEGIN
  -- Contar total de delegados já inscritos no estado
  SELECT COUNT(*) INTO v_total_inscritos
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf;
  
  -- Calcular limite total de vagas (soma de todas as cotas específicas + ampla mínimo)
  SELECT SUM(vagas_total) INTO v_total_limite
  FROM cotas_por_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf;
  
  -- Calcular vagas disponíveis de ampla participação
  v_vagas_ampla := calcular_vagas_ampla_participacao(p_evento_id, p_estado_uf);
  
  RETURN QUERY
  SELECT 
    p_estado_uf,
    COALESCE(v_total_inscritos, 0),
    COALESCE(v_total_limite, 0),
    GREATEST(COALESCE(v_total_limite, 0) - COALESCE(v_total_inscritos, 0), 0),
    v_vagas_ampla;
END;
$$;

-- Comentários nas funções
COMMENT ON FUNCTION calcular_vagas_disponiveis_cota IS 'Calcula vagas disponíveis para uma cota específica (limite - ocupadas)';
COMMENT ON FUNCTION calcular_vagas_ampla_participacao IS 'Calcula vagas disponíveis de ampla participação (mínimo + vagas não usadas nas cotas - ocupadas)';
COMMENT ON FUNCTION calcular_total_vagas_disponiveis_estado IS 'Retorna resumo completo de vagas disponíveis no estado';
