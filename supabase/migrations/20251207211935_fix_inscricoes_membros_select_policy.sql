/*
  # Corrigir Policies de SELECT em inscricoes_membros

  1. Problema Identificado
    - Existem policies duplicadas
    - Policy antiga verifica estado_forum que pode ser NULL
    - Admins não conseguem ver inscrições com estado_forum NULL

  2. Solução
    - Remover todas as policies antigas
    - Criar policy simples: admins veem tudo, public também

  3. Segurança
    - SELECT: Público (para exibir listas de delegados)
    - INSERT: Público (para inscrições)
    - UPDATE/DELETE: Apenas admins
*/

-- Remover todas as policies antigas
DROP POLICY IF EXISTS "Admins and representatives can view inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Public can view inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Public can insert inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Anyone can create inscricao" ON inscricoes_membros;
DROP POLICY IF EXISTS "Only admins can update inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Only admins can delete inscricoes" ON inscricoes_membros;

-- SELECT: Todos podem ver (para listas públicas de delegados)
CREATE POLICY "Public can view all inscricoes"
  ON inscricoes_membros
  FOR SELECT
  TO public
  USING (true);

-- INSERT: Qualquer um pode criar inscrição
CREATE POLICY "Anyone can insert inscricao"
  ON inscricoes_membros
  FOR INSERT
  TO public
  WITH CHECK (true);

-- UPDATE: Apenas admins
CREATE POLICY "Admins can update inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- DELETE: Apenas admins
CREATE POLICY "Admins can delete inscricoes"
  ON inscricoes_membros
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
