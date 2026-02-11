/*
  # Adicionar Campos para Delegados Eleitos e Natos
  
  ## Alterações
  
  1. Nova Coluna `tipo_delegado`
    - Tipo: text com CHECK constraint ('eleito' ou 'nato')
    - Padrão: 'eleito'
    - Permite distinguir entre delegados eleitos por estado e delegados natos
    
  2. Nova Coluna `gt_responsavel`
    - Tipo: text com CHECK constraint ('GT' ou 'Executiva')
    - Opcional (NULL permitido)
    - Usado apenas para delegados natos, indica GT ou Executiva
    
  3. Migração de Dados Existentes
    - Todos os registros atuais receberão tipo_delegado = 'eleito'
    - Campo gt_responsavel permanece NULL para registros existentes
    
  ## Notas Importantes
  
  - Checkpoint de segurança: Esta migration pode ser revertida
  - Dados existentes (ex: RR) são preservados como delegados eleitos
  - O fluxo de validação permanece idêntico para ambos os tipos
  - Exportações serão separadas por tipo_delegado
*/

-- Adicionar coluna tipo_delegado com valor padrão 'eleito'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'tipo_delegado'
  ) THEN
    ALTER TABLE delegacao_estado 
    ADD COLUMN tipo_delegado text DEFAULT 'eleito' NOT NULL
    CHECK (tipo_delegado IN ('eleito', 'nato'));
  END IF;
END $$;

-- Adicionar coluna gt_responsavel (opcional, apenas para natos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'gt_responsavel'
  ) THEN
    ALTER TABLE delegacao_estado 
    ADD COLUMN gt_responsavel text
    CHECK (gt_responsavel IN ('GT', 'Executiva') OR gt_responsavel IS NULL);
  END IF;
END $$;

-- Atualizar todos os registros existentes para tipo 'eleito' (garantir consistência)
UPDATE delegacao_estado 
SET tipo_delegado = 'eleito' 
WHERE tipo_delegado IS NULL OR tipo_delegado = '';

-- Criar índice para melhorar performance de queries filtradas por tipo
CREATE INDEX IF NOT EXISTS idx_delegacao_tipo_delegado ON delegacao_estado(tipo_delegado);

-- Criar índice composto para queries por estado + tipo
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_tipo ON delegacao_estado(estado_uf, tipo_delegado);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN delegacao_estado.tipo_delegado IS 'Tipo de delegado: eleito (por estado) ou nato (GT/Executiva)';
COMMENT ON COLUMN delegacao_estado.gt_responsavel IS 'Para delegados natos: GT ou Executiva. NULL para delegados eleitos.';