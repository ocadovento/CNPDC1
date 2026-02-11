/*
  # Corrigir política de atualização de admin

  1. Problema
    - A política "Admin can update any user" estava usando u.id = auth.uid()
    - Mas auth.uid() retorna o auth_user_id, não o id da tabela usuarios
    - Isso impedia que admins atualizassem outros usuários

  2. Solução
    - Remover a política incorreta
    - Criar nova política usando u.auth_user_id = auth.uid()
    - Isso permite que admins com tipo 'admin_geral' ou 'admin_auxiliar' atualizem qualquer usuário

  3. Segurança
    - Verifica que o usuário está autenticado
    - Verifica que o tipo_usuario é admin_geral ou admin_auxiliar
    - Usa auth_user_id corretamente para identificar o admin logado
*/

-- Remover política incorreta
DROP POLICY IF EXISTS "Admin can update any user" ON usuarios;

-- Criar política correta usando auth_user_id
CREATE POLICY "Admin can update any user"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
