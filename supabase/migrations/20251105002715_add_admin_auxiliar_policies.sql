/*
  # Adicionar políticas para Admin Auxiliar

  ## Resumo
  Esta migração adiciona políticas para permitir que admin_auxiliar tenha os mesmos
  poderes que admin_geral para gerenciar usuários e dados.

  ## Alterações
  
  1. Políticas para tabela `usuarios`:
     - Admin auxiliar pode ver todos os usuários
     - Admin auxiliar pode inserir novos usuários
     - Admin auxiliar pode atualizar usuários
  
  2. Políticas para tabela `delegacao_estado`:
     - Admin auxiliar pode ver todas as delegações
     - Admin auxiliar pode inserir delegações
     - Admin auxiliar pode atualizar delegações
  
  3. Políticas para tabela `teias_estaduais`:
     - Admin auxiliar pode ver todas as teias
     - Admin auxiliar pode criar teias
     - Admin auxiliar pode atualizar teias

  ## Segurança
  - Mantém RLS ativo
  - Admin auxiliar tem permissões completas como admin_geral
*/

-- Políticas adicionais para usuarios (admin_auxiliar)
CREATE POLICY "Admin auxiliar pode ver todos os usuários"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admin auxiliar pode inserir usuários"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admin auxiliar pode atualizar usuários"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

-- Políticas adicionais para delegacao_estado (admin_auxiliar)
CREATE POLICY "Admins auxiliares podem ver todas delegações"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admins auxiliares podem inserir delegações"
  ON delegacao_estado FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admins auxiliares podem atualizar delegações"
  ON delegacao_estado FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

-- Políticas adicionais para teias_estaduais (admin_auxiliar)
CREATE POLICY "Admins auxiliares podem criar teias"
  ON teias_estaduais FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admins auxiliares podem atualizar teias"
  ON teias_estaduais FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_auxiliar'
      AND u.ativo = true
    )
  );