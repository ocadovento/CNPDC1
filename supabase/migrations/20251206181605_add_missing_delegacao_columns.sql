/*
  # Adicionar colunas faltantes na tabela delegacao_estado

  1. Alterações
    - Adicionar coluna `tipo_delegado` (eleito ou nato)
    - Adicionar coluna `gt_responsavel` (GT que o delegado nato representa)
    - Adicionar coluna `nome_mae` para validação de duplicatas
    - Adicionar coluna `data_validacao` para controle
    
  2. Notas
    - tipo_delegado: indica se é delegado eleito ou nato
    - gt_responsavel: usado apenas para delegados natos
    - nome_mae: usado junto com CPF para identificar duplicatas
*/

-- Adicionar colunas se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delegacao_estado' AND column_name = 'tipo_delegado'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN tipo_delegado text CHECK (tipo_delegado IN ('eleito', 'nato'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delegacao_estado' AND column_name = 'gt_responsavel'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN gt_responsavel text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delegacao_estado' AND column_name = 'nome_mae'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN nome_mae text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delegacao_estado' AND column_name = 'data_validacao'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN data_validacao timestamptz;
  END IF;
END $$;
