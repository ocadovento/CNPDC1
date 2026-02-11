/*
  # Adicionar constraint único em delegacao_id

  1. Mudanças
    - Remove o constraint único de cpf (permite múltiplas inscrições com mesmo CPF em eventos diferentes)
    - Adiciona constraint único em delegacao_id (garante apenas uma inscrição por delegação)
  
  2. Segurança
    - Mantém integridade referencial
    - Previne duplicação de inscrições para a mesma delegação
*/

-- Remove o constraint único de cpf se existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inscricoes_membros_cpf_key' 
    AND table_name = 'inscricoes_membros'
  ) THEN
    ALTER TABLE inscricoes_membros DROP CONSTRAINT inscricoes_membros_cpf_key;
  END IF;
END $$;

-- Adiciona constraint único em delegacao_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inscricoes_membros_delegacao_id_key' 
    AND table_name = 'inscricoes_membros'
  ) THEN
    ALTER TABLE inscricoes_membros 
    ADD CONSTRAINT inscricoes_membros_delegacao_id_key UNIQUE (delegacao_id);
  END IF;
END $$;
