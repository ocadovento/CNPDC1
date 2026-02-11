/*
  # Permitir que usuários anônimos atualizem inscrições

  1. Problema
    - Usuários anônimos podem criar inscrições (INSERT)
    - Mas não conseguem editar/atualizar inscrições (UPDATE)
    - Erro: "new row violates row-level security policy (USING expression)"

  2. Solução
    - Criar política de UPDATE para usuários anônimos
    - Seguir o mesmo padrão da política de INSERT (anon_insert_inscricoes)
    - Garantir que campos obrigatórios estejam preenchidos

  3. Segurança
    - Como não há autenticação para usuários anônimos, a política é permissiva
    - Validação de campos obrigatórios mantém integridade dos dados
    - Sistema depende de validação no front-end e lógica de negócio
*/

-- Criar política para permitir UPDATE por usuários anônimos
CREATE POLICY "anon_update_inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO anon
  USING (
    delegacao_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM delegacao_estado 
      WHERE delegacao_estado.id = inscricoes_membros.delegacao_id
    )
  )
  WITH CHECK (
    delegacao_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM delegacao_estado 
      WHERE delegacao_estado.id = inscricoes_membros.delegacao_id
    )
    AND nome_completo IS NOT NULL 
    AND email IS NOT NULL
  );
