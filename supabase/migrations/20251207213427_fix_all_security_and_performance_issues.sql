/*
  # Correção Completa de Segurança e Performance

  1. Índices para Foreign Keys
    - Adicionar índices para melhorar performance de JOINs
    - delegacao_estado: evento_id, representante_id
    - eventos_teias_foruns: representante_id
    - teias_estaduais: representante_id

  2. Otimização de Policies RLS
    - Substituir auth.uid() por (select auth.uid()) para melhor performance
    - Corrigir todas as policies problemáticas

  3. Remover Índices Não Utilizados
    - Índices que não estão sendo usados pelas queries

  4. Consolidar Policies Duplicadas
    - Remover policies permissivas múltiplas na tabela usuarios

  5. Corrigir Search Path de Funções
    - Garantir search_path imutável
*/

-- ============================================================
-- 1. ADICIONAR ÍNDICES PARA FOREIGN KEYS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_delegacao_estado_evento_id 
  ON delegacao_estado(evento_id);

CREATE INDEX IF NOT EXISTS idx_delegacao_estado_representante_id 
  ON delegacao_estado(representante_id);

CREATE INDEX IF NOT EXISTS idx_eventos_teias_foruns_representante_id 
  ON eventos_teias_foruns(representante_id);

CREATE INDEX IF NOT EXISTS idx_teias_estaduais_representante_id 
  ON teias_estaduais(representante_id);

-- ============================================================
-- 2. REMOVER ÍNDICES NÃO UTILIZADOS
-- ============================================================

DROP INDEX IF EXISTS idx_teias_estaduais_estado_uf;
DROP INDEX IF EXISTS idx_usuarios_estado_uf;
DROP INDEX IF EXISTS idx_relatorios_estado_uf;
DROP INDEX IF EXISTS idx_relatorios_tipo_evento;

-- ============================================================
-- 3. OTIMIZAR POLICIES RLS - INSCRICOES_MEMBROS
-- ============================================================

DROP POLICY IF EXISTS "Admins can update inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins can delete inscricoes" ON inscricoes_membros;

CREATE POLICY "Admins can update inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete inscricoes"
  ON inscricoes_membros
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- ============================================================
-- 4. OTIMIZAR POLICIES RLS - RELATORIOS_ESTADUAIS
-- ============================================================

DROP POLICY IF EXISTS "Usuários autenticados podem criar relatórios" ON relatorios_estaduais;
DROP POLICY IF EXISTS "Criador pode atualizar seus relatórios" ON relatorios_estaduais;
DROP POLICY IF EXISTS "Criador pode deletar seus relatórios" ON relatorios_estaduais;

CREATE POLICY "Usuários autenticados podem criar relatórios"
  ON relatorios_estaduais
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Criador pode atualizar seus relatórios"
  ON relatorios_estaduais
  FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()));

CREATE POLICY "Criador pode deletar seus relatórios"
  ON relatorios_estaduais
  FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

-- ============================================================
-- 5. CONSOLIDAR POLICIES DUPLICADAS - USUARIOS
-- ============================================================

-- Remover todas as policies antigas
DROP POLICY IF EXISTS "Admin can read all users" ON usuarios;
DROP POLICY IF EXISTS "Allow user read own profile" ON usuarios;
DROP POLICY IF EXISTS "Admin can update all users" ON usuarios;
DROP POLICY IF EXISTS "Allow user update own profile" ON usuarios;
DROP POLICY IF EXISTS "Admin can delete users" ON usuarios;
DROP POLICY IF EXISTS "Allow user delete own profile" ON usuarios;

-- SELECT: Usuário vê próprio perfil OU admin vê todos
CREATE POLICY "Users can view profiles"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth_user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- UPDATE: Usuário atualiza próprio perfil OU admin atualiza todos
CREATE POLICY "Users can update profiles"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    auth_user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- DELETE: Apenas admins podem deletar
CREATE POLICY "Admins can delete users"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- ============================================================
-- 6. OTIMIZAR POLICIES RLS - EVENTOS_TEIAS_FORUNS
-- ============================================================

DROP POLICY IF EXISTS "Representatives and admins can create events" ON eventos_teias_foruns;
DROP POLICY IF EXISTS "Authenticated users can view events" ON eventos_teias_foruns;

CREATE POLICY "Representatives and admins can create events"
  ON eventos_teias_foruns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar', 'representante_gt')
    )
  );

CREATE POLICY "Authenticated users can view events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
    )
  );

-- ============================================================
-- 7. OTIMIZAR POLICIES RLS - DELEGACAO_ESTADO
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view delegation" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can insert delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can delete delegation members" ON delegacao_estado;

CREATE POLICY "Authenticated users can view delegation"
  ON delegacao_estado
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
    )
  );

CREATE POLICY "Representatives and admins can insert delegation members"
  ON delegacao_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.estado_uf = delegacao_estado.estado_uf)
      )
    )
  );

CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.estado_uf = delegacao_estado.estado_uf)
      )
    )
  );

CREATE POLICY "Representatives and admins can delete delegation members"
  ON delegacao_estado
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = (select auth.uid())
      AND (
        usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
        OR (usuarios.tipo_usuario = 'representante_gt' AND usuarios.estado_uf = delegacao_estado.estado_uf)
      )
    )
  );

-- ============================================================
-- 8. CORRIGIR SEARCH PATH DA FUNÇÃO
-- ============================================================

-- Recriar função com search_path imutável
DROP FUNCTION IF EXISTS atualizar_inscricao_completa() CASCADE;

CREATE OR REPLACE FUNCTION atualizar_inscricao_completa()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE delegacao_estado
  SET inscricao_completa = true
  WHERE id = NEW.delegacao_id;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger se existir
DROP TRIGGER IF EXISTS trigger_atualizar_inscricao_completa ON inscricoes_membros;

CREATE TRIGGER trigger_atualizar_inscricao_completa
  AFTER INSERT ON inscricoes_membros
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_inscricao_completa();

-- ============================================================
-- 9. ADICIONAR ÍNDICE PARA QUERY COMUM DE INSCRICOES
-- ============================================================

-- Índice para a query comum de buscar inscrições por delegacao_id
CREATE INDEX IF NOT EXISTS idx_inscricoes_membros_delegacao_id 
  ON inscricoes_membros(delegacao_id);

-- Índice composto para queries de admin filtrando por evento e status
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_evento_status 
  ON delegacao_estado(evento_id, inscricao_completa);
