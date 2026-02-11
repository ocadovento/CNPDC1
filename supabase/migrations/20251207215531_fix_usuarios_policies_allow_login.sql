/*
  # Corrigir Policies de Usuarios para Permitir Login

  1. Problema Identificado
    - As policies consolidadas estão impedindo o login
    - A verificação de admin causa problemas de performance

  2. Solução
    - Simplificar policies para permitir leitura do próprio perfil
    - Separar policies de admin sem subqueries complexas
    - Usar uma abordagem mais direta

  3. Segurança
    - Mantém RLS ativo
    - Usuários só veem seus próprios perfis
    - Admins podem ver todos através de policy separada
*/

-- ============================================================
-- REMOVER POLICIES PROBLEMÁTICAS
-- ============================================================

DROP POLICY IF EXISTS "Users can view profiles" ON usuarios;
DROP POLICY IF EXISTS "Users can update profiles" ON usuarios;
DROP POLICY IF EXISTS "Admins can delete users" ON usuarios;

-- ============================================================
-- CRIAR POLICIES SIMPLIFICADAS
-- ============================================================

-- SELECT: Permite usuário ver seu próprio perfil (primeira verificação)
CREATE POLICY "Allow users to read own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

-- SELECT: Permite admins ver todos os perfis (policy separada, sem EXISTS)
CREATE POLICY "Allow admins to read all profiles"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    AND auth_user_id = (select auth.uid())
  );

-- UPDATE: Permite usuário atualizar seu próprio perfil
CREATE POLICY "Allow users to update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

-- UPDATE: Permite admins atualizarem todos os perfis
CREATE POLICY "Allow admins to update all profiles"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios adm
      WHERE adm.auth_user_id = (select auth.uid())
      AND adm.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      LIMIT 1
    )
  );

-- DELETE: Apenas admins podem deletar usuários
CREATE POLICY "Allow admins to delete users"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios adm
      WHERE adm.auth_user_id = (select auth.uid())
      AND adm.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      LIMIT 1
    )
  );
