/*
  # Adicionar política de atualização para admins

  1. Mudanças
    - Adiciona política para admins poderem atualizar outros usuários
    - Admins gerais e auxiliares podem atualizar qualquer usuário
    - Mantém a política existente para usuários atualizarem a si mesmos

  2. Segurança
    - Apenas admins autenticados com tipo 'admin_geral' ou 'admin_auxiliar' podem atualizar outros usuários
    - Usuários comuns continuam podendo atualizar apenas seus próprios dados
*/

-- Adicionar política para admins atualizarem outros usuários
CREATE POLICY "Admin can update any user"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
