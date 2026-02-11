/*
  # Atualizar campos de cotas na tabela delegacao_estado

  ## Mudanças

  1. **Remover campo antigo**
    - Remove coluna `cota_representada` (campo único que misturava gênero e cota social)

  2. **Adicionar novos campos**
    - `cota_identidade_genero` (text) - Identidade de gênero: 'homem', 'mulher' ou 'lgbtqiapn'
    - `cota_social` (text) - Cota social: 'ampla_concorrencia', 'pessoa_negra', 'pessoa_indigena',
      'pessoa_deficiencia', 'pessoa_jovem' ou 'pessoa_idosa'

  ## Notas

  - Esta mudança melhora a clareza do sistema de cotas
  - Separa identidade de gênero de cotas sociais
  - Cada participante deve escolher uma opção em cada categoria
*/

-- Adicionar novos campos
ALTER TABLE delegacao_estado
  ADD COLUMN IF NOT EXISTS cota_identidade_genero text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cota_social text DEFAULT '';

-- Migrar dados existentes (se houver)
-- Atualizar valores de gênero
UPDATE delegacao_estado
SET cota_identidade_genero = CASE
  WHEN cota_representada = 'homem' THEN 'homem'
  WHEN cota_representada = 'mulher' THEN 'mulher'
  WHEN cota_representada IN ('lgbtqpn', 'lgbtqiapn') THEN 'lgbtqiapn'
  ELSE ''
END
WHERE cota_representada IS NOT NULL;

-- Atualizar valores de cota social
UPDATE delegacao_estado
SET cota_social = CASE
  WHEN cota_representada IN ('ampla_concorrencia', 'delegado', 'convidado') THEN 'ampla_concorrencia'
  WHEN cota_representada = 'pessoa_negra' THEN 'pessoa_negra'
  WHEN cota_representada = 'pessoa_indigena' THEN 'pessoa_indigena'
  WHEN cota_representada = 'pessoa_deficiencia' THEN 'pessoa_deficiencia'
  WHEN cota_representada = 'pessoa_jovem' THEN 'pessoa_jovem'
  WHEN cota_representada = 'pessoa_idosa' THEN 'pessoa_idosa'
  ELSE ''
END
WHERE cota_representada IS NOT NULL;

-- Remover campo antigo
ALTER TABLE delegacao_estado
  DROP COLUMN IF EXISTS cota_representada;
