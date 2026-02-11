/*
  # Adicionar Campos de Grupo Temático à Delegação
  
  1. Novos Campos
    - gt_tematico_escolhido (text[]) - Array de GTs escolhidos pelo delegado
    - gt_tematico_outro (text) - Campo para especificar "Outro" GT
  
  2. Mudanças
    - Campos permitem múltiplas escolhas de GTs
    - gt_tematico_outro usado quando "Outro" está selecionado
    - Campos opcionais inicialmente, mas gt_tematico_escolhido será obrigatório no frontend
  
  3. Notas
    - Usa text[] (array) para suportar múltiplas escolhas
    - Permite delegados participarem de vários GTs simultaneamente
*/

-- Adicionar campos de GT temático
ALTER TABLE delegacao_estado 
  ADD COLUMN IF NOT EXISTS gt_tematico_escolhido text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gt_tematico_outro text;

-- Adicionar comentários
COMMENT ON COLUMN delegacao_estado.gt_tematico_escolhido IS 'Grupos Temáticos escolhidos pelo delegado (múltiplas escolhas permitidas)';
COMMENT ON COLUMN delegacao_estado.gt_tematico_outro IS 'Especificação de "Outro" GT quando selecionado';

-- Criar índice para melhorar performance em queries com GTs
CREATE INDEX IF NOT EXISTS idx_delegacao_gt_tematico ON delegacao_estado USING gin(gt_tematico_escolhido);
