/*
  # Fix Comprehensive Security and Performance Issues v2

  ## Changes Made

  1. **Indexes**
     - Add missing index for foreign key `eventos_teias_foruns.representante_id`
     - Remove unused indexes to improve write performance

  2. **RLS Performance Optimization**
     - Fix `cotas_por_estado` policies to use `(select auth.uid())`
     - This prevents re-evaluation for each row

  3. **Multiple Permissive Policies**
     - Consolidate UPDATE policies on `inscricoes_membros` table

  4. **Function Search Path Security**
     - Add `SET search_path = public` to all functions

  ## Notes
  - Auth DB Connection Strategy requires server configuration change
  - All changes are safe and backwards compatible
*/

-- ============================================
-- 1. ADD MISSING INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_eventos_representante_id 
ON eventos_teias_foruns(representante_id);

-- ============================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_delegacao_estado_genero;
DROP INDEX IF EXISTS idx_delegacao_estado_cota_genero;
DROP INDEX IF EXISTS idx_delegacao_estado_evento_genero;
DROP INDEX IF EXISTS idx_cotas_estado_cota;
DROP INDEX IF EXISTS idx_teias_estaduais_estado_uf;
DROP INDEX IF EXISTS idx_usuarios_estado_uf;

-- ============================================
-- 3. FIX RLS POLICIES ON cotas_por_estado
-- ============================================

DROP POLICY IF EXISTS "Admins can update cotas" ON cotas_por_estado;
DROP POLICY IF EXISTS "Admins can delete cotas" ON cotas_por_estado;
DROP POLICY IF EXISTS "Admins can insert cotas" ON cotas_por_estado;

CREATE POLICY "Admins can update cotas"
  ON cotas_por_estado
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins can delete cotas"
  ON cotas_por_estado
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins can insert cotas"
  ON cotas_por_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario = 'admin'
    )
  );

-- ============================================
-- 4. FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================

DROP POLICY IF EXISTS "admin_update_inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "participant_update_inscricoes" ON inscricoes_membros;

CREATE POLICY "update_inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    delegacao_id IN (
      SELECT id FROM delegacao_estado
      WHERE cpf = (
        SELECT cpf FROM usuarios
        WHERE auth_user_id = (select auth.uid())
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = (select auth.uid())
      AND tipo_usuario = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN delegacao_estado d ON d.estado_uf = u.estado_uf
      WHERE u.auth_user_id = (select auth.uid())
      AND u.tipo_usuario = 'representante'
      AND d.id = inscricoes_membros.delegacao_id
    )
  )
  WITH CHECK (
    delegacao_id IN (
      SELECT id FROM delegacao_estado
      WHERE cpf = (
        SELECT cpf FROM usuarios
        WHERE auth_user_id = (select auth.uid())
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = (select auth.uid())
      AND tipo_usuario = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN delegacao_estado d ON d.estado_uf = u.estado_uf
      WHERE u.auth_user_id = (select auth.uid())
      AND u.tipo_usuario = 'representante'
      AND d.id = inscricoes_membros.delegacao_id
    )
  );

-- ============================================
-- 5. FIX FUNCTION SEARCH PATHS
-- ============================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS clean_delegacao_espacos() CASCADE;
DROP FUNCTION IF EXISTS get_cotas_disponiveis(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_vagas_disponiveis_com_ampla(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS pode_adicionar_delegado_eleito(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calcular_paridade_genero(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calcular_vagas_por_cota(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calcular_ampla_concorrencia(UUID, TEXT) CASCADE;

-- Recreate with secure search_path

CREATE FUNCTION clean_delegacao_espacos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.nome_completo := TRIM(REGEXP_REPLACE(NEW.nome_completo, '\s+', ' ', 'g'));
  NEW.nome_mae := TRIM(REGEXP_REPLACE(NEW.nome_mae, '\s+', ' ', 'g'));
  NEW.cpf := REGEXP_REPLACE(NEW.cpf, '\D', '', 'g');
  RETURN NEW;
END;
$$;

CREATE FUNCTION get_cotas_disponiveis(
  p_evento_id UUID,
  p_estado_uf TEXT
)
RETURNS TABLE (
  cota_representada TEXT,
  vagas_total INTEGER,
  vagas_preenchidas BIGINT,
  vagas_disponiveis INTEGER
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
  LEFT JOIN delegacao_estado d 
    ON d.cota_representada = c.cota_representada 
    AND d.evento_id = p_evento_id
    AND d.estado_uf = p_estado_uf
  WHERE c.estado_uf = p_estado_uf
  GROUP BY c.cota_representada, c.vagas_total, c.id
  ORDER BY c.id;
END;
$$;

CREATE FUNCTION get_vagas_disponiveis_com_ampla(
  p_evento_id UUID,
  p_estado_uf TEXT,
  p_cota_especifica TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vagas_cota_especifica INTEGER := 0;
  v_vagas_ampla INTEGER := 0;
  v_total_vagas INTEGER := 0;
BEGIN
  IF p_cota_especifica IS NOT NULL AND p_cota_especifica != 'ampla_participacao' THEN
    SELECT COALESCE(vagas_disponiveis, 0)
    INTO v_vagas_cota_especifica
    FROM get_cotas_disponiveis(p_evento_id, p_estado_uf)
    WHERE cota_representada = p_cota_especifica;
  END IF;

  SELECT COALESCE(vagas_disponiveis, 0)
  INTO v_vagas_ampla
  FROM get_cotas_disponiveis(p_evento_id, p_estado_uf)
  WHERE cota_representada = 'ampla_participacao';

  v_total_vagas := v_vagas_cota_especifica + v_vagas_ampla;

  RETURN v_total_vagas;
END;
$$;

CREATE FUNCTION pode_adicionar_delegado_eleito(
  p_evento_id UUID,
  p_estado_uf TEXT,
  p_cota TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vagas_disponiveis INTEGER;
BEGIN
  v_vagas_disponiveis := get_vagas_disponiveis_com_ampla(
    p_evento_id,
    p_estado_uf,
    p_cota
  );

  RETURN v_vagas_disponiveis > 0;
END;
$$;

CREATE FUNCTION calcular_paridade_genero(
  p_evento_id UUID,
  p_estado_uf TEXT
)
RETURNS TABLE (
  total_delegados BIGINT,
  total_mulheres BIGINT,
  total_homens BIGINT,
  percentual_mulheres NUMERIC,
  percentual_homens NUMERIC,
  tem_paridade BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT;
  v_mulheres BIGINT;
  v_homens BIGINT;
  v_perc_mulheres NUMERIC;
  v_perc_homens NUMERIC;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE genero = 'mulher'),
    COUNT(*) FILTER (WHERE genero = 'homem')
  INTO v_total, v_mulheres, v_homens
  FROM delegacao_estado
  WHERE evento_id = p_evento_id
    AND estado_uf = p_estado_uf;

  IF v_total = 0 THEN
    RETURN QUERY SELECT 
      0::BIGINT, 0::BIGINT, 0::BIGINT, 
      0::NUMERIC, 0::NUMERIC, 
      false;
    RETURN;
  END IF;

  v_perc_mulheres := (v_mulheres::NUMERIC / v_total::NUMERIC) * 100;
  v_perc_homens := (v_homens::NUMERIC / v_total::NUMERIC) * 100;

  RETURN QUERY SELECT 
    v_total,
    v_mulheres,
    v_homens,
    v_perc_mulheres,
    v_perc_homens,
    v_perc_mulheres >= 50;
END;
$$;

CREATE FUNCTION calcular_vagas_por_cota(
  p_evento_id UUID,
  p_estado_uf TEXT
)
RETURNS TABLE (
  cota_representada TEXT,
  label_cota TEXT,
  vagas_total INTEGER,
  vagas_preenchidas BIGINT,
  vagas_disponiveis INTEGER,
  vagas_mulheres BIGINT,
  vagas_homens BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.cota_representada,
    cd.cota_representada,
    cd.vagas_total,
    cd.vagas_preenchidas,
    cd.vagas_disponiveis,
    COALESCE(COUNT(*) FILTER (WHERE d.genero = 'mulher'), 0) as vagas_mulheres,
    COALESCE(COUNT(*) FILTER (WHERE d.genero = 'homem'), 0) as vagas_homens
  FROM get_cotas_disponiveis(p_evento_id, p_estado_uf) cd
  LEFT JOIN delegacao_estado d 
    ON d.cota_representada = cd.cota_representada 
    AND d.evento_id = p_evento_id
    AND d.estado_uf = p_estado_uf
  GROUP BY 
    cd.cota_representada,
    cd.vagas_total,
    cd.vagas_preenchidas,
    cd.vagas_disponiveis
  ORDER BY cd.cota_representada;
END;
$$;

CREATE FUNCTION calcular_ampla_concorrencia(
  p_evento_id UUID,
  p_estado_uf TEXT
)
RETURNS TABLE (
  cota_representada TEXT,
  vagas_nao_preenchidas INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.cota_representada,
    cd.vagas_disponiveis
  FROM get_cotas_disponiveis(p_evento_id, p_estado_uf) cd
  WHERE cd.cota_representada != 'ampla_participacao'
    AND cd.vagas_disponiveis > 0;
END;
$$;

-- Recreate trigger
CREATE TRIGGER clean_delegacao_espacos_trigger
  BEFORE INSERT OR UPDATE ON delegacao_estado
  FOR EACH ROW
  EXECUTE FUNCTION clean_delegacao_espacos();
