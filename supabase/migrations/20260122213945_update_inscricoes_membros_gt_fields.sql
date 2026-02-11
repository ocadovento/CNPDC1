/*
  # Atualizar Campos de GT na Tabela inscricoes_membros
  
  1. Mudanças
    - Alterar gt_tematico_escolhido de text para text[] (array)
    - Adicionar gt_tematico_outro (text) para especificar "Outro"
  
  2. Notas
    - Converte dados existentes para formato array
    - Permite múltiplas escolhas de GTs
    - gt_tematico_outro usado quando "Outro" está selecionado
*/

-- Adicionar o campo gt_tematico_outro se não existir
ALTER TABLE inscricoes_membros 
  ADD COLUMN IF NOT EXISTS gt_tematico_outro text;

-- Alterar gt_tematico_escolhido para text[] (array)
-- Primeiro verificar se a coluna existe e é do tipo text
DO $$
BEGIN
  -- Tentar alterar o tipo da coluna
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inscricoes_membros' 
    AND column_name = 'gt_tematico_escolhido'
    AND data_type = 'text'
  ) THEN
    -- Converter dados existentes para array
    ALTER TABLE inscricoes_membros 
      ALTER COLUMN gt_tematico_escolhido TYPE text[] 
      USING CASE 
        WHEN gt_tematico_escolhido IS NULL OR gt_tematico_escolhido = '' THEN '{}'::text[]
        ELSE ARRAY[gt_tematico_escolhido]::text[]
      END;
  END IF;
END $$;

-- Se a coluna não existir, criar como array
ALTER TABLE inscricoes_membros 
  ADD COLUMN IF NOT EXISTS gt_tematico_escolhido text[] DEFAULT '{}';

-- Adicionar comentários
COMMENT ON COLUMN inscricoes_membros.gt_tematico_escolhido IS 'Grupos Temáticos escolhidos (múltiplas escolhas)';
COMMENT ON COLUMN inscricoes_membros.gt_tematico_outro IS 'Especificação de "Outro" GT';

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_gt_tematico ON inscricoes_membros USING gin(gt_tematico_escolhido);
