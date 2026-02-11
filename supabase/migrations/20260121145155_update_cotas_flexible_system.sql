/*
  # Sistema de cotas flexível com vagas remanescentes para ampla participação
  
  1. Mudanças no Sistema
     - Cada cota tem um LIMITE MÁXIMO (não um valor fixo)
     - Total de delegados eleitos: ATÉ 30 por estado
     - Vagas não preenchidas de cotas específicas ficam disponíveis para ampla participação
     - Delegados NATOS não contam no limite de 30
  
  2. Nova Função
     - get_vagas_disponiveis_com_ampla: calcula vagas incluindo sobras para ampla participação
     - Retorna vagas disponíveis considerando:
       * Limite da cota específica
       * Total geral de eleitos (máx 30)
       * Vagas de outras cotas não preenchidas (vão para ampla participação)
  
  3. Distribuição PA (limites máximos):
     - Ampla Participação: até 10 vagas + sobras de outras cotas
     - Pessoa Negra: até 5 vagas
     - Mulher: até 5 vagas
     - Pessoa Indígena: até 3 vagas
     - Pessoa Jovem: até 2 vagas
     - Pessoa com Deficiência: até 2 vagas
     - LGBTQPN+: até 2 vagas
     - Pessoa Idosa: até 1 vaga
     
     TOTAL: até 30 vagas eleitos
*/

-- Atualizar comentário da tabela
COMMENT ON TABLE cotas_por_estado IS 'Define LIMITES MÁXIMOS de vagas por cota para delegados eleitos. Vagas não preenchidas ficam disponíveis para ampla participação. Total máximo: 30 eleitos por estado.';

-- Função para calcular vagas disponíveis com sistema flexível
CREATE OR REPLACE FUNCTION get_vagas_disponiveis_com_ampla(p_evento_id uuid, p_estado_uf text)
RETURNS TABLE (
  cota_representada text,
  limite_maximo integer,
  vagas_preenchidas bigint,
  vagas_disponiveis_cota bigint,
  total_eleitos_estado bigint,
  vagas_disponiveis_estado bigint
) AS $$
DECLARE
  v_total_eleitos bigint;
  v_limite_total_estado integer := 30;
BEGIN
  -- Contar total de delegados eleitos do estado
  SELECT COUNT(*) INTO v_total_eleitos
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND tipo_delegado = 'eleito';

  RETURN QUERY
  SELECT 
    c.cota_representada,
    c.vagas_total as limite_maximo,
    COALESCE(COUNT(d.id), 0) as vagas_preenchidas,
    GREATEST(c.vagas_total - COALESCE(COUNT(d.id), 0), 0) as vagas_disponiveis_cota,
    v_total_eleitos as total_eleitos_estado,
    GREATEST(v_limite_total_estado - v_total_eleitos, 0) as vagas_disponiveis_estado
  FROM cotas_por_estado c
  LEFT JOIN delegacao_estado d ON (
    d.evento_id = c.evento_id 
    AND d.estado_uf = c.estado_uf 
    AND d.cota_representada = c.cota_representada
    AND d.tipo_delegado = 'eleito'
  )
  WHERE c.evento_id = p_evento_id 
    AND c.estado_uf = p_estado_uf
  GROUP BY c.id, c.cota_representada, c.vagas_total
  ORDER BY c.cota_representada;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_vagas_disponiveis_com_ampla IS 'Retorna vagas disponíveis por cota (limites máximos) e total de vagas disponíveis no estado. Vagas não usadas de cotas específicas ficam para ampla participação.';

-- Função simplificada para validar se pode adicionar delegado eleito
CREATE OR REPLACE FUNCTION pode_adicionar_delegado_eleito(
  p_evento_id uuid,
  p_estado_uf text,
  p_cota_representada text
) RETURNS boolean AS $$
DECLARE
  v_total_eleitos bigint;
  v_vagas_cota bigint;
  v_limite_cota integer;
BEGIN
  -- Conta total de eleitos do estado (limite: 30)
  SELECT COUNT(*) INTO v_total_eleitos
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND tipo_delegado = 'eleito';
  
  -- Se já tem 30 eleitos, não pode adicionar mais
  IF v_total_eleitos >= 30 THEN
    RETURN false;
  END IF;
  
  -- Busca limite da cota
  SELECT vagas_total INTO v_limite_cota
  FROM cotas_por_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND cota_representada = p_cota_representada;
  
  -- Se não encontrou a cota, não pode adicionar
  IF v_limite_cota IS NULL THEN
    RETURN false;
  END IF;
  
  -- Conta quantos já tem na cota específica
  SELECT COUNT(*) INTO v_vagas_cota
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf
    AND tipo_delegado = 'eleito'
    AND cota_representada = p_cota_representada;
  
  -- Para ampla participação: pode adicionar se tem vaga no estado (30 total)
  IF p_cota_representada = 'ampla_participacao' THEN
    RETURN v_total_eleitos < 30;
  END IF;
  
  -- Para outras cotas: precisa estar dentro do limite da cota E do limite do estado
  RETURN v_vagas_cota < v_limite_cota AND v_total_eleitos < 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION pode_adicionar_delegado_eleito IS 'Valida se pode adicionar delegado eleito considerando limite da cota E limite total do estado (30). Ampla participação usa vagas remanescentes.';
