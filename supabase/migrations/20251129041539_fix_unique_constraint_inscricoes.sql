/*
  # Fix unique constraint on inscricoes_membros
  
  1. Changes
    - Remove unique constraint on `delegacao_id` (incorrect - each delegation can have multiple participants)
    - Keep existing unique constraint on `cpf, nome_completo, nome_mae` (correct - each participant can only have one inscription)
  
  2. Notes
    - Each delegation can have up to 30+ participants
    - Each participant (identified by cpf, nome_completo, nome_mae) can only have one inscription
    - When participant updates, it will upsert based on cpf, nome_completo, nome_mae
*/

-- Remove the incorrect unique constraint on delegacao_id
ALTER TABLE inscricoes_membros 
DROP CONSTRAINT IF EXISTS inscricoes_membros_delegacao_id_key;
