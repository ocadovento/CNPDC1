/*
  # Adicionar campo gênero à tabela delegacao_estado

  1. Alterações
    - Adiciona coluna `genero` na tabela `delegacao_estado`
    - Tipo: text com valores permitidos (feminino, masculino, nao_binario, outro, prefiro_nao_informar)
    - Campo não obrigatório para manter compatibilidade com registros existentes

  2. Notas
    - Registros existentes terão genero como NULL até serem atualizados
*/

-- Adicionar coluna genero à tabela delegacao_estado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'genero'
  ) THEN
    ALTER TABLE delegacao_estado 
    ADD COLUMN genero text CHECK (genero IN ('feminino', 'masculino', 'nao_binario', 'outro', 'prefiro_nao_informar'));
  END IF;
END $$;

-- Criar índice para melhorar performance de consultas por gênero
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_genero ON delegacao_estado(genero);