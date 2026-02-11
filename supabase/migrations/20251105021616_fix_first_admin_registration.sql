/*
  # Correção para Permitir Registro do Primeiro Admin

  ## Mudanças
  - Adiciona política para permitir que usuários autenticados criem seu próprio registro na tabela usuarios
  - Isso resolve o problema do "primeiro admin" que não consegue se registrar porque não existe nenhum admin ainda
  
  ## Segurança
  - A política permite apenas inserção do próprio registro (auth_user_id = auth.uid())
  - Mantém todas as outras políticas de segurança intactas
*/

-- Adicionar política para permitir auto-registro (necessário para o primeiro admin)
CREATE POLICY "Usuários podem criar seu próprio registro"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());
