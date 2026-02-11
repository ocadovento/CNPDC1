/*
  # Corrigir políticas RLS para permitir acesso a eventos nacionais

  1. Mudanças
    - Atualiza política de SELECT para authenticated users
    - Permite que todos os usuários autenticados vejam eventos nacionais (representante_id IS NULL)
    - Mantém acesso dos admins a todos os eventos
    - Mantém acesso dos representantes aos seus próprios eventos
  
  2. Segurança
    - Eventos nacionais (Teia Nacional 2026) ficam visíveis para todos os usuários autenticados
    - Mantém proteção para eventos regionais
*/

-- Remove política existente
DROP POLICY IF EXISTS "Authenticated users can view events" ON eventos_teias_foruns;

-- Cria nova política permitindo acesso a eventos nacionais
CREATE POLICY "Authenticated users can view events"
  ON eventos_teias_foruns
  FOR SELECT
  TO authenticated
  USING (
    -- Eventos nacionais (sem representante) são visíveis para todos autenticados
    representante_id IS NULL
    OR
    -- Admins podem ver todos os eventos
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
    OR
    -- Representantes podem ver seus próprios eventos
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'representante_gt'
      AND usuarios.id = eventos_teias_foruns.representante_id
    )
  );
