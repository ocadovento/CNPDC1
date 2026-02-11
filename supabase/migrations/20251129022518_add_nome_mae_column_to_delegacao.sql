/*
  # Adicionar coluna nome_mae obrigatória na tabela delegacao_estado

  ## Mudanças
  
  1. **Nova coluna nome_mae**
     - Adicionar coluna nome_mae (TEXT)
     - Preencher valores existentes com 'A PREENCHER' temporariamente
     - Tornar coluna NOT NULL
     - Adicionar constraint de validação (não pode ser string vazia)

  ## Segurança
  - Campo obrigatório para validação tripla de identidade
  - Dados sensíveis protegidos (não expostos em exportações públicas)
  - Necessário para login seguro do participante
*/

-- Adicionar coluna nome_mae
ALTER TABLE delegacao_estado
ADD COLUMN IF NOT EXISTS nome_mae TEXT;

-- Preencher registros existentes com valor temporário
UPDATE delegacao_estado
SET nome_mae = 'A PREENCHER'
WHERE nome_mae IS NULL OR nome_mae = '';

-- Tornar a coluna NOT NULL
ALTER TABLE delegacao_estado
ALTER COLUMN nome_mae SET NOT NULL;

-- Adicionar constraint para garantir que não seja string vazia
ALTER TABLE delegacao_estado
ADD CONSTRAINT nome_mae_not_empty CHECK (length(trim(nome_mae)) > 0);