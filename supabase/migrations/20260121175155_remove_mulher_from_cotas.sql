/*
  # Remover cota "Mulher" do sistema

  ## Alterações

  1. Move registros existentes de cota 'mulher' para 'ampla_participacao'
     - A paridade de gênero (50% mulheres) será calculada separadamente pelo campo `genero`
     - A cota 'mulher' não deve mais existir como opção de cota representada

  2. Remove registros da cota 'mulher' em `cotas_por_estado`

  3. Remove 'mulher' do CHECK constraint da tabela `delegacao_estado`

  4. Remove 'mulher' do CHECK constraint da tabela `cotas_por_estado`

  ## Notas Importantes

  - A paridade de gênero continua sendo controlada pelo campo `genero` ('mulher'/'homem')
  - As cotas restantes são: pessoa_negra, pessoa_indigena, pessoa_com_deficiencia,
    pessoa_jovem, pessoa_idosa, lgbtqpn, ampla_participacao
  - Registros existentes com cota 'mulher' são movidos para 'ampla_participacao'
*/

-- Move registros existentes de cota 'mulher' para 'ampla_participacao'
UPDATE delegacao_estado 
SET cota_representada = 'ampla_participacao' 
WHERE cota_representada = 'mulher';

-- Remove registros da cota 'mulher' em cotas_por_estado
DELETE FROM cotas_por_estado WHERE cota_representada = 'mulher';

-- Atualiza CHECK constraint da tabela delegacao_estado
ALTER TABLE delegacao_estado
  DROP CONSTRAINT IF EXISTS delegacao_estado_cota_representada_check;

ALTER TABLE delegacao_estado
  ADD CONSTRAINT delegacao_estado_cota_representada_check
  CHECK (cota_representada IN (
    'pessoa_negra',
    'pessoa_indigena',
    'pessoa_com_deficiencia',
    'pessoa_jovem',
    'pessoa_idosa',
    'lgbtqpn',
    'ampla_participacao'
  ));

-- Atualiza CHECK constraint da tabela cotas_por_estado
ALTER TABLE cotas_por_estado
  DROP CONSTRAINT IF EXISTS cotas_por_estado_cota_representada_check;

ALTER TABLE cotas_por_estado
  ADD CONSTRAINT cotas_por_estado_cota_representada_check
  CHECK (cota_representada IN (
    'pessoa_negra',
    'pessoa_indigena',
    'pessoa_com_deficiencia',
    'pessoa_jovem',
    'pessoa_idosa',
    'lgbtqpn',
    'ampla_participacao'
  ));
