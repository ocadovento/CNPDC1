/*
  # Fix unique constraint to allow same person in multiple events
  
  1. Changes
    - Drop existing unique constraint on (estado_uf, cpf)
    - Create new unique constraint on (estado_uf, cpf, evento_id)
    - This allows the same person to participate in state event and national event
  
  2. Notes
    - Each person can now have one registration per event
    - State delegates can be promoted to national event without constraint violation
    - Prevents duplicate registrations in the same event
*/

-- Drop the old constraint
ALTER TABLE delegacao_estado 
DROP CONSTRAINT IF EXISTS delegacao_estado_estado_uf_cpf_key;

-- Create new constraint including evento_id
ALTER TABLE delegacao_estado 
ADD CONSTRAINT delegacao_estado_estado_uf_cpf_evento_key 
UNIQUE (estado_uf, cpf, evento_id);
