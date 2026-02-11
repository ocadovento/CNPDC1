/*
  # Adicionar Campo Motivo da Substituição
  
  1. Novos Campos
    - `motivo_substituicao` (text) - Motivo pelo qual o suplente está substituindo o eleito
  
  2. Regras de Negócio
    - Campo obrigatório apenas para delegados do tipo 'suplente'
    - Campo de texto livre para descrever o motivo da substituição
    
  3. Segurança
    - Nenhuma alteração nas políticas RLS existentes
*/

-- Adicionar coluna motivo_substituicao
ALTER TABLE delegacao_estado 
  ADD COLUMN IF NOT EXISTS motivo_substituicao text;

-- Adicionar comentário
COMMENT ON COLUMN delegacao_estado.motivo_substituicao IS 'Motivo da substituição (obrigatório para tipo suplente)';
