/*
  # Force Schema Refresh for inscricoes_membros

  1. Changes
    - Add a comment to the nome_mae column to force Supabase to refresh the schema cache
    - This ensures the column is properly recognized in the PostgREST schema cache
*/

-- Add comment to force schema refresh
COMMENT ON COLUMN inscricoes_membros.nome_mae IS 'Nome da mãe do inscrito - obrigatório';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
