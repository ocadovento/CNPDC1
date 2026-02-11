/*
  # Garantir que delegado só pode ser eleito OU nato em todos os eventos
  
  1. Alterações
    - Remove constraint antigo UNIQUE(estado_uf, cpf, evento_id)
    - Adiciona constraint UNIQUE(cpf) para impedir duplicação em qualquer evento
    - Adiciona comentário explicativo
  
  2. Segurança
    - Garante integridade de dados
    - Impede que mesma pessoa seja eleito E nato
    - Impede que mesma pessoa esteja em múltiplos eventos
  
  3. Impacto
    - Cada CPF só pode aparecer UMA VEZ na tabela delegacao_estado
    - Se pessoa é delegado eleito em algum evento, não pode ser nato em nenhum
    - Se pessoa é delegado nato em algum evento, não pode ser eleito em nenhum
*/

-- Remove constraint antigo se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'delegacao_estado_estado_uf_cpf_evento_id_key'
  ) THEN
    ALTER TABLE delegacao_estado 
    DROP CONSTRAINT delegacao_estado_estado_uf_cpf_evento_id_key;
  END IF;
END $$;

-- Remove index antigo se existir
DROP INDEX IF EXISTS idx_delegacao_cpf_evento;

-- Adiciona constraint UNIQUE(cpf)
-- Isso garante que cada CPF só pode aparecer UMA vez na tabela
-- independente de estado, evento ou tipo de delegado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'delegacao_estado_cpf_key'
  ) THEN
    ALTER TABLE delegacao_estado 
    ADD CONSTRAINT delegacao_estado_cpf_key UNIQUE (cpf);
  END IF;
END $$;

-- Adiciona index para performance em buscas por CPF
CREATE INDEX IF NOT EXISTS idx_delegacao_cpf 
ON delegacao_estado(cpf);

-- Adiciona comentário explicativo
COMMENT ON CONSTRAINT delegacao_estado_cpf_key ON delegacao_estado IS 
'Garante que cada pessoa (CPF) só pode ser delegado UMA vez, seja eleito ou nato, em qualquer evento. Uma pessoa não pode ser eleito E nato simultaneamente.';
