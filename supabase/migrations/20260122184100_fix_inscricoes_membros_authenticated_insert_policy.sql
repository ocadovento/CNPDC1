/*
  # Fix inscricoes_membros INSERT policy for authenticated users

  ## Problem
  - Users that are logged in (authenticated) cannot insert their own inscriptions
  - Only anonymous users (anon) have INSERT policy
  - This causes "new row violates row-level security policy" error

  ## Solution
  - Add INSERT policy for authenticated users
  - Allow users to insert inscriptions for their own delegation (matched by email)
  - Allow admins to insert any inscription
  - Allow state representatives to insert inscriptions for their state

  ## Changes
  1. Add `authenticated_insert_inscricoes` policy for authenticated role
*/

-- Add INSERT policy for authenticated users
CREATE POLICY "authenticated_insert_inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Dados obrigatórios devem estar preenchidos
    (delegacao_id IS NOT NULL) 
    AND (EXISTS (SELECT 1 FROM delegacao_estado WHERE delegacao_estado.id = inscricoes_membros.delegacao_id))
    AND (nome_completo IS NOT NULL) 
    AND (email IS NOT NULL)
    AND (
      -- Usuário pode inserir para sua própria delegação (via email)
      (delegacao_id IN (
        SELECT d.id 
        FROM delegacao_estado d
        INNER JOIN usuarios u ON d.email = u.email
        WHERE u.auth_user_id = auth.uid()
      ))
      -- OU é admin geral
      OR EXISTS (
        SELECT 1 FROM usuarios
        WHERE auth_user_id = auth.uid()
        AND tipo_usuario = 'admin_geral'
        AND ativo = true
      )
      -- OU é representante do mesmo estado
      OR EXISTS (
        SELECT 1 
        FROM usuarios u
        INNER JOIN delegacao_estado d ON d.estado_uf = u.estado_uf
        WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'representante'
        AND d.id = inscricoes_membros.delegacao_id
      )
    )
  );
