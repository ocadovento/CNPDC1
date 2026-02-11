/*
  # Adicionar Sistema de Suplentes à Delegação

  1. Alteração em Campos Existentes
    - `tipo_delegado` - Expandir para incluir 'suplente' (antes: 'eleito', 'nato')

  2. Novos Campos
    - `suplente_de_id` (uuid, FK) - Referência ao delegado eleito (apenas para suplentes)
    - `data_substituicao` (timestamptz) - Data em que o suplente assumiu a vaga
    - `categoria_original` (text) - Categoria original do eleito antes da substituição

  3. Regras de Negócio
    - Suplente PODE ser de categoria diferente do eleito
    - Quando suplente assume, mantém registro da categoria original do eleito
    - Apenas suplentes têm `suplente_de_id` preenchido
    - `data_substituicao` é preenchida apenas quando substituição ocorre
    - Delegados 'nato' continuam funcionando normalmente

  4. Segurança
    - FK constraint garante integridade referencial
    - Índices para melhorar performance de queries

  5. Notas Importantes
    - Categoria do suplente pode ser diferente da categoria do eleito
    - Exemplo: Eleito Jovem pode ter suplente Mulher
    - Sistema mantém histórico através de categoria_original
    - Tipos possíveis: 'eleito', 'nato', 'suplente'
*/

-- Remover constraint antiga de tipo_delegado
ALTER TABLE delegacao_estado
  DROP CONSTRAINT IF EXISTS delegacao_estado_tipo_delegado_check;

-- Adicionar novos campos
ALTER TABLE delegacao_estado 
  ADD COLUMN IF NOT EXISTS suplente_de_id uuid,
  ADD COLUMN IF NOT EXISTS data_substituicao timestamptz,
  ADD COLUMN IF NOT EXISTS categoria_original text;

-- Adicionar nova constraint com 3 valores
ALTER TABLE delegacao_estado
  ADD CONSTRAINT delegacao_estado_tipo_delegado_check 
    CHECK (tipo_delegado IN ('eleito', 'nato', 'suplente'));

-- Adicionar FK constraint
ALTER TABLE delegacao_estado
  DROP CONSTRAINT IF EXISTS fk_suplente_de_id,
  ADD CONSTRAINT fk_suplente_de_id 
    FOREIGN KEY (suplente_de_id) 
    REFERENCES delegacao_estado(id) 
    ON DELETE SET NULL;

-- Adicionar comentários
COMMENT ON COLUMN delegacao_estado.tipo_delegado IS 'Tipo do delegado: eleito, nato ou suplente';
COMMENT ON COLUMN delegacao_estado.suplente_de_id IS 'ID do delegado eleito ao qual este suplente está vinculado (apenas para tipo suplente)';
COMMENT ON COLUMN delegacao_estado.data_substituicao IS 'Data em que o suplente assumiu a vaga do eleito';
COMMENT ON COLUMN delegacao_estado.categoria_original IS 'Categoria original do eleito antes da substituição por suplente';

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_delegacao_suplente_de ON delegacao_estado(suplente_de_id) WHERE suplente_de_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delegacao_data_substituicao ON delegacao_estado(data_substituicao) WHERE data_substituicao IS NOT NULL;
