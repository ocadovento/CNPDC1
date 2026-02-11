/*
  # Fix Security Issues - Indexes and RLS Policies

  1. Add Missing Foreign Key Indexes
    - Add index on inscricoes_membros.delegacao_id
    - Add index on teias_estaduais.estado_uf
    - Add index on usuarios.estado_uf

  2. Fix Auth RLS Initialization (Performance)
    - Replace auth.uid() with (SELECT auth.uid()) in all RLS policies
    - Prevents re-evaluation for each row

  3. Remove Unused Indexes
    - Drop idx_relatorios_estado_uf
    - Drop idx_relatorios_tipo_evento

  4. Fix Function Search Path
    - Set search_path for promover_delegado_para_evento_nacional function

  5. Consolidate Multiple Permissive Policies
    - Merge admins_can_insert_users and usuarios_insert_own into single policy
*/

-- ============================================
-- 1. Add Missing Foreign Key Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inscricoes_membros_delegacao_id 
  ON inscricoes_membros(delegacao_id);

CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf 
  ON teias_estaduais(estado_uf);

CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
  ON usuarios(estado_uf);

-- ============================================
-- 2. Remove Unused Indexes
-- ============================================

DROP INDEX IF EXISTS idx_relatorios_estado_uf;
DROP INDEX IF EXISTS idx_relatorios_tipo_evento;

-- ============================================
-- 3. Fix RLS Policies - usuarios table
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "admins_can_insert_users" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;

-- Create consolidated INSERT policy (replaces both admins_can_insert_users and usuarios_insert_own)
CREATE POLICY "usuarios_can_insert"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User inserting their own record
    id = (SELECT auth.uid())
    OR
    -- Admin can insert any user
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (SELECT auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Recreate UPDATE policy with SELECT wrapper
CREATE POLICY "usuarios_update_own"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================
-- 4. Fix RLS Policies - relatorios_estaduais table
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem criar relatórios" ON relatorios_estaduais;
DROP POLICY IF EXISTS "Criador pode atualizar seus relatórios" ON relatorios_estaduais;
DROP POLICY IF EXISTS "Criador pode deletar seus relatórios" ON relatorios_estaduais;

CREATE POLICY "Usuários autenticados podem criar relatórios"
  ON relatorios_estaduais
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Criador pode atualizar seus relatórios"
  ON relatorios_estaduais
  FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Criador pode deletar seus relatórios"
  ON relatorios_estaduais
  FOR DELETE
  TO authenticated
  USING (created_by = (SELECT auth.uid()));

-- ============================================
-- 5. Fix Function Search Path
-- ============================================

CREATE OR REPLACE FUNCTION promover_delegado_para_evento_nacional()
RETURNS TRIGGER AS $$
DECLARE
  evento_nacional_id uuid;
BEGIN
  -- Verificar se inscricao_completa mudou de false para true
  IF NEW.inscricao_completa = true AND (OLD.inscricao_completa = false OR OLD.inscricao_completa IS NULL) THEN
    
    -- Verificar se já foi promovido
    IF NEW.promovido_evento_nacional = false OR NEW.promovido_evento_nacional IS NULL THEN
      
      -- Buscar ID do evento Teia Nacional 2026 (Aracruz/ES)
      SELECT id INTO evento_nacional_id
      FROM eventos_teias_foruns
      WHERE tipo_evento = 'teia'
        AND data_evento >= '2026-01-01'
        AND cidade = 'Aracruz'
        AND estado_uf = 'ES'
      LIMIT 1;
      
      -- Se encontrou o evento nacional, criar registro duplicado
      IF evento_nacional_id IS NOT NULL THEN
        
        -- Inserir novo registro no evento nacional
        INSERT INTO delegacao_estado (
          estado_uf,
          representante_id,
          nome_completo,
          cpf,
          inscricao_completa,
          evento_id,
          nome_ponto_cultura,
          contato_whatsapp,
          email,
          cidade,
          cota_identidade_genero,
          cota_social,
          promovido_evento_nacional
        ) VALUES (
          NEW.estado_uf,
          NEW.representante_id,
          NEW.nome_completo,
          NEW.cpf,
          true,
          evento_nacional_id,
          NEW.nome_ponto_cultura,
          NEW.contato_whatsapp,
          NEW.email,
          NEW.cidade,
          NEW.cota_identidade_genero,
          NEW.cota_social,
          true
        );
        
        -- Marcar registro original como promovido
        NEW.promovido_evento_nacional = true;
        
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = public, pg_temp;
