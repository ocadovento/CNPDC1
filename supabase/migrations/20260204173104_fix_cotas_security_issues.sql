/*
  # Corrigir Problemas de Segurança na Tabela cotas_por_estado

  1. Problema: Índice Não Utilizado
    - O índice idx_cotas_evento_estado não está sendo usado
    - Remover para melhorar performance e reduzir overhead

  2. Problema: Função com Search Path Mutável
    - A função get_cotas_disponiveis tem search_path mutável
    - Recriar com search_path fixo para segurança

  3. Alterações
    - DROP do índice não utilizado
    - DROP e recreação da função com SET search_path = public

  Nota: Auth DB Connection Strategy é uma configuração de projeto
  que deve ser ajustada no painel do Supabase (Database Settings)
  para usar percentagem ao invés de número fixo de conexões.
*/

-- Remover índice não utilizado
DROP INDEX IF EXISTS idx_cotas_evento_estado;

-- Recriar função com search_path fixo
DROP FUNCTION IF EXISTS get_cotas_disponiveis(uuid, text);

CREATE OR REPLACE FUNCTION get_cotas_disponiveis(p_evento_id uuid, p_estado_uf text)
RETURNS TABLE (
  cota_representada text,
  vagas_total integer,
  vagas_preenchidas bigint,
  vagas_disponiveis bigint
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Verificar que o índice foi removido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_cotas_evento_estado'
  ) THEN
    RAISE NOTICE 'Índice idx_cotas_evento_estado removido com sucesso';
  ELSE
    RAISE WARNING 'Índice idx_cotas_evento_estado ainda existe';
  END IF;
END $$;

-- Verificar que a função foi recriada com search_path fixo
DO $$
DECLARE
  v_prosrc text;
BEGIN
  SELECT pg_get_functiondef(oid) INTO v_prosrc
  FROM pg_proc
  WHERE proname = 'get_cotas_disponiveis'
  LIMIT 1;

  IF v_prosrc LIKE '%SET search_path%' THEN
    RAISE NOTICE 'Função get_cotas_disponiveis recriada com search_path fixo';
  ELSE
    RAISE WARNING 'Função get_cotas_disponiveis pode não ter search_path fixo';
  END IF;
END $$;
