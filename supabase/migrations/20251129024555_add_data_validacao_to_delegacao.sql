/*
  # Adicionar coluna data_validacao à tabela delegacao_estado

  ## Mudanças
  
  1. **Nova coluna data_validacao**
     - Tipo: DATE (apenas data, sem hora)
     - Nullable: Permite NULL para registros antigos
     - Será preenchida quando participante realizar validação
     - Sempre atualizada com a data de hoje quando houver nova validação

  ## Funcionalidade
  - Registra a data em que o participante validou sua identidade
  - Sempre aceita data de hoje (validações e correções)
  - Permite rastreabilidade de quando foi a última validação
*/

-- Adicionar coluna data_validacao
ALTER TABLE delegacao_estado
ADD COLUMN IF NOT EXISTS data_validacao DATE;

-- Criar índice para melhorar performance de queries por data
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_data_validacao 
ON delegacao_estado(data_validacao);