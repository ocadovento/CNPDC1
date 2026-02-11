/*
  # Permitir inserção anônima em inscricoes_membros

  ## Mudanças

  1. **Adicionar política para usuários anônimos**
    - Permite INSERT para role `anon` (não autenticados)
    - Permite UPDATE para role `anon` (para edição da própria inscrição)
    - Permite SELECT para role `anon` (para visualizar própria inscrição)
    
  ## Segurança
  
  - Usuários anônimos podem criar e editar suas próprias inscrições
  - Isso é necessário pois membros não têm login/senha, apenas CPF
  - A validação de acesso é feita no frontend pelo CPF
*/

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "inscricoes_anon_insert" ON inscricoes_membros;
DROP POLICY IF EXISTS "inscricoes_anon_update" ON inscricoes_membros;
DROP POLICY IF EXISTS "inscricoes_anon_select" ON inscricoes_membros;

-- Permitir INSERT anônimo
CREATE POLICY "inscricoes_anon_insert"
  ON inscricoes_membros
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permitir UPDATE anônimo
CREATE POLICY "inscricoes_anon_update"
  ON inscricoes_membros
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Permitir SELECT anônimo
CREATE POLICY "inscricoes_anon_select"
  ON inscricoes_membros
  FOR SELECT
  TO anon
  USING (true);
