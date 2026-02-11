/*
  # Add nome_mae column to inscricoes_membros table

  1. Changes
    - Add `nome_mae` (text) column to `inscricoes_membros` table
    - This field stores the mother's name for participant identification
  
  2. Notes
    - Field is nullable as it may not always be available
    - Used for validation and identification purposes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscricoes_membros' AND column_name = 'nome_mae'
  ) THEN
    ALTER TABLE inscricoes_membros ADD COLUMN nome_mae text;
  END IF;
END $$;
