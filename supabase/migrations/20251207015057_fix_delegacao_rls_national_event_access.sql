/*
  # Corrigir políticas RLS para delegação estadual

  1. Mudanças
    - Atualiza política SELECT para permitir que representantes vejam delegados do seu estado
    - Atualiza política INSERT para permitir inserção em eventos nacionais
    - Corrige referência de auth.uid() para auth_user_id nas verificações
  
  2. Segurança
    - Admins podem ver e gerenciar todos os delegados
    - Representantes podem ver delegados do seu estado
    - Representantes podem adicionar delegados ao evento nacional e aos seus eventos estaduais
*/

-- Remove políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view delegation" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can insert delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can update delegation members" ON delegacao_estado;
DROP POLICY IF EXISTS "Representatives and admins can delete delegation members" ON delegacao_estado;

-- Política de SELECT: Admins veem tudo, representantes veem delegados do seu estado
CREATE POLICY "Authenticated users can view delegation"
  ON delegacao_estado
  FOR SELECT
  TO authenticated
  USING (
    -- Admins podem ver todos os delegados
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    -- Representantes podem ver delegados do seu estado
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = delegacao_estado.estado_uf
    )
  );

-- Política de INSERT: Permite inserção em eventos nacionais e eventos do representante
CREATE POLICY "Representatives and admins can insert delegation members"
  ON delegacao_estado
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admins podem inserir em qualquer evento
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    -- Representantes podem inserir no evento nacional (representante_id IS NULL)
    (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario = 'representante_gt'
        AND usuarios.estado_uf = delegacao_estado.estado_uf
      )
      AND
      EXISTS (
        SELECT 1 FROM eventos_teias_foruns
        WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
        AND eventos_teias_foruns.representante_id IS NULL
      )
    )
    OR
    -- Representantes podem inserir em seus próprios eventos
    (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario = 'representante_gt'
      )
      AND
      EXISTS (
        SELECT 1 FROM eventos_teias_foruns
        WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
        AND eventos_teias_foruns.representante_id = (
          SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
        )
        AND eventos_teias_foruns.pode_adicionar_delegacao = true
      )
    )
  );

-- Política de UPDATE: Admins e representantes podem atualizar delegados
CREATE POLICY "Representatives and admins can update delegation members"
  ON delegacao_estado
  FOR UPDATE
  TO authenticated
  USING (
    -- Admins podem atualizar qualquer delegado
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    -- Representantes podem atualizar delegados do seu estado
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = delegacao_estado.estado_uf
    )
  )
  WITH CHECK (
    -- Mesma verificação para WITH CHECK
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = delegacao_estado.estado_uf
    )
  );

-- Política de DELETE: Admins e representantes podem deletar delegados
CREATE POLICY "Representatives and admins can delete delegation members"
  ON delegacao_estado
  FOR DELETE
  TO authenticated
  USING (
    -- Admins podem deletar qualquer delegado
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    -- Representantes podem deletar delegados do seu estado
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.estado_uf = delegacao_estado.estado_uf
    )
  );
