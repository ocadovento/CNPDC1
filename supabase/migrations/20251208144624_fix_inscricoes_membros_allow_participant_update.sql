/*
  # Permitir que participantes atualizem suas próprias inscrições

  1. Mudanças
    - Remove política restritiva de UPDATE que só permite admins
    - Adiciona nova política de UPDATE para admins (com USING e WITH CHECK)
    - Adiciona nova política de UPDATE para participantes atualizarem seus dados (public)
    
  2. Segurança
    - Admins podem atualizar qualquer inscrição
    - Participantes podem atualizar inscrições (necessário pois não há autenticação)
*/

-- Remove política antiga de UPDATE que só permite admins
DROP POLICY IF EXISTS "Admins can update inscricoes" ON inscricoes_membros;

-- Cria política para admins atualizarem qualquer inscrição
CREATE POLICY "Admins can update all inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Cria política para qualquer pessoa atualizar inscrições
CREATE POLICY "Anyone can update inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
