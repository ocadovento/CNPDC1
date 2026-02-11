/*
  # Consolidate Multiple Permissive Policies

  1. Changes
    - Remove duplicate/old policies that create multiple permissive policies
    - Keep only the new consolidated policies
    - This improves performance and simplifies policy management

  2. Security
    - Maintains exact same security model
    - Only removes redundant policies
*/

-- Clean up old teias_estaduais policies (if they exist)
DROP POLICY IF EXISTS "Representantes GT podem criar teia do seu estado" ON teias_estaduais;
DROP POLICY IF EXISTS "Representantes GT podem atualizar teia do seu estado" ON teias_estaduais;
DROP POLICY IF EXISTS "Admins auxiliares podem criar teias" ON teias_estaduais;
DROP POLICY IF EXISTS "Admins auxiliares podem atualizar teias" ON teias_estaduais;

-- Clean up old delegacao_estado policies (if they exist)
DROP POLICY IF EXISTS "Representantes GT podem inscrever delegação do seu estado" ON delegacao_estado;
DROP POLICY IF EXISTS "Representantes GT podem atualizar delegação do seu estado" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins auxiliares podem ver todas delegações" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins auxiliares podem inserir delegações" ON delegacao_estado;
DROP POLICY IF EXISTS "Admins auxiliares podem atualizar delegações" ON delegacao_estado;
DROP POLICY IF EXISTS "Todos podem ver delegações" ON delegacao_estado;

-- Clean up old inscricoes_membros policies (if they exist)
DROP POLICY IF EXISTS "Membros podem ver própria inscrição" ON inscricoes_membros;
DROP POLICY IF EXISTS "Admins podem ver todas inscrições" ON inscricoes_membros;

-- Recreate inscricoes_membros policies with proper optimization
CREATE POLICY "Membros and admins can view inscricoes"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (
    delegacao_id IN (
      SELECT id FROM delegacao_estado WHERE cpf = (
        SELECT cpf FROM usuarios WHERE id = (select auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Clean up old usuarios policies to keep only one per action
DROP POLICY IF EXISTS "Allow first user registration" ON usuarios;

-- Recreate usuarios policies consolidated
DROP POLICY IF EXISTS "Users read own profile" ON usuarios;
DROP POLICY IF EXISTS "Admins read all profiles" ON usuarios;

CREATE POLICY "Users and admins read profiles"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Users update own profile" ON usuarios;
DROP POLICY IF EXISTS "Admins update all profiles" ON usuarios;

CREATE POLICY "Users and admins update profiles"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  )
  WITH CHECK (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (select auth.uid())
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

DROP POLICY IF EXISTS "Users insert own profile" ON usuarios;

CREATE POLICY "Users can insert own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));
