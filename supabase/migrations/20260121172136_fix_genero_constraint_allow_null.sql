/*
  # Corrigir constraint do campo gênero para permitir NULL

  1. Alterações
    - Remove o constraint existente que não permite NULL
    - Adiciona novo constraint que permite NULL ou valores válidos
    - Isso permite que registros existentes sem gênero continuem válidos

  2. Valores permitidos
    - NULL (para registros sem gênero informado)
    - 'feminino'
    - 'masculino'
    - 'nao_binario'
    - 'outro'
    - 'prefiro_nao_informar'
*/

-- Remover constraint existente se houver
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'delegacao_estado_genero_check'
  ) THEN
    ALTER TABLE delegacao_estado DROP CONSTRAINT delegacao_estado_genero_check;
  END IF;
END $$;

-- Adicionar novo constraint que permite NULL
ALTER TABLE delegacao_estado 
ADD CONSTRAINT delegacao_estado_genero_check 
CHECK (genero IS NULL OR genero IN ('feminino', 'masculino', 'nao_binario', 'outro', 'prefiro_nao_informar'));