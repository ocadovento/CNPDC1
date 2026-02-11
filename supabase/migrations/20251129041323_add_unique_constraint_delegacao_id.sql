/*
  # Add unique constraint on delegacao_id
  
  1. Changes
    - Add unique constraint on `delegacao_id` column in `inscricoes_membros` table
    - This ensures each delegation can only have one inscription
  
  2. Notes
    - Each participant should only have one inscription per delegation
    - When they update, it will upsert based on delegacao_id
*/

-- Add unique constraint on delegacao_id
ALTER TABLE inscricoes_membros 
ADD CONSTRAINT inscricoes_membros_delegacao_id_key 
UNIQUE (delegacao_id);
