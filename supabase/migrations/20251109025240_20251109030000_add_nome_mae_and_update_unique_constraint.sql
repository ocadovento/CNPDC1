/*
  # Add nome_mae field and update unique constraint

  1. Changes
    - Add nome_mae (mother's name) field to inscricoes_membros table
    - Remove delegacao_id unique constraint
    - Add composite unique constraint on (cpf, nome_completo, nome_mae)

  2. Reasoning
    - Using CPF + full name + mother's name ensures unique identification
    - This combination is commonly used in Brazilian identification systems
    - Allows same person to have multiple registrations if data differs
    - More flexible than using delegacao_id alone
*/

-- Add nome_mae field
ALTER TABLE inscricoes_membros
ADD COLUMN IF NOT EXISTS nome_mae text;

-- Remove the delegacao_id unique constraint
ALTER TABLE inscricoes_membros
DROP CONSTRAINT IF EXISTS inscricoes_membros_delegacao_id_key;

-- Add composite unique constraint
-- Using cpf, nome_completo, and nome_mae as unique identifier
ALTER TABLE inscricoes_membros
ADD CONSTRAINT inscricoes_membros_unique_person
UNIQUE (cpf, nome_completo, nome_mae);
