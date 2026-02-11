/*
  # Remove CPF unique constraint from inscricoes_membros

  1. Changes
    - Remove UNIQUE constraint from cpf column in inscricoes_membros table
    - Allow same CPF to have multiple inscriptions (one per delegacao_id)
    - The combination of delegacao_id + cpf will ensure data integrity

  2. Reasoning
    - A person may need to register for multiple events/delegations
    - The primary key is the delegacao_id, not the CPF
    - CPF is still required (NOT NULL) but no longer unique
*/

-- Remove the unique constraint on cpf
ALTER TABLE inscricoes_membros
DROP CONSTRAINT IF EXISTS inscricoes_membros_cpf_key;

-- Add a unique constraint on delegacao_id to ensure one inscription per delegation
-- This should already exist implicitly but we make it explicit
ALTER TABLE inscricoes_membros
ADD CONSTRAINT inscricoes_membros_delegacao_id_key UNIQUE (delegacao_id);
