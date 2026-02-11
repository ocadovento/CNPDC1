/*
  # Adicionar política para admins criarem eventos

  ## Alterações

  1. Adiciona policy para permitir que administradores criem eventos para qualquer estado
     - Admins gerais e auxiliares podem criar eventos
     - Permite criar eventos de qualquer estado (não restrito ao estado do admin)
     - Permite criar eventos nacionais da CNPDC (ES)

  2. Adiciona policy para permitir que administradores atualizem eventos

  3. Adiciona policy para permitir que administradores excluam eventos

  ## Notas Importantes

  - Esta funcionalidade é exclusiva para administradores (admin_geral e admin_auxiliar)
  - Representantes GT só podem criar eventos do seu próprio estado (política existente)
*/

-- Policy para admins criarem eventos de qualquer estado
CREATE POLICY "Admins can create events for any state"
  ON eventos_teias_foruns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND usuarios.ativo = true
    )
  );

-- Policy para admins atualizarem eventos
CREATE POLICY "Admins can update all events"
  ON eventos_teias_foruns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND usuarios.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND usuarios.ativo = true
    )
  );

-- Policy para admins excluírem eventos
CREATE POLICY "Admins can delete all events"
  ON eventos_teias_foruns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND usuarios.ativo = true
    )
  );
