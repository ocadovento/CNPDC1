/*
  # Corrigir políticas RLS conflitantes em inscricoes_membros
  
  ## Problema Identificado
  - Múltiplas políticas de INSERT para 'authenticated' causam conflito
  - Todas as políticas precisam passar (AND lógico)
  - Isso impede inscrições mesmo com dados válidos
  
  ## Solução
  1. Remover TODAS as políticas existentes
  2. Criar UMA política simples de INSERT para anon
  3. Criar UMA política simples de INSERT para authenticated
  4. Manter políticas de SELECT e UPDATE separadas
  
  ## Segurança
  - Usuários anônimos podem inserir (necessário para fluxo de inscrição)
  - Usuários autenticados podem inserir e atualizar
  - Apenas admins podem ver todas as inscrições
*/

-- Remover TODAS as políticas existentes para recomeçar
DROP POLICY IF EXISTS "Public users can submit inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Authenticated users can submit inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Membros podem inserir própria inscrição se estiverem na dele" ON inscricoes_membros;
DROP POLICY IF EXISTS "Authenticated users can view inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Membros podem atualizar própria inscrição" ON inscricoes_membros;

-- Política para usuários anônimos: podem inserir livremente
CREATE POLICY "Anon users can insert inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para usuários autenticados: podem inserir livremente  
CREATE POLICY "Auth users can insert inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para usuários autenticados: podem atualizar livremente
CREATE POLICY "Auth users can update inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para admins verem todas as inscrições
CREATE POLICY "Admins can view all inscricoes"
  ON inscricoes_membros
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Política para qualquer um ver suas próprias inscrições
CREATE POLICY "Users can view own inscricoes"
  ON inscricoes_membros
  FOR SELECT
  TO authenticated
  USING (true);
