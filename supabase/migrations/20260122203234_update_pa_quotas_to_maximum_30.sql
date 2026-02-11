/*
  # Atualizar cotas do Pará (PA) para limites máximos - 30 vagas totais

  1. Ajuste das Cotas do PA
    - Pessoas negras: 6 vagas (máximo permitido)
    - Povos originários: 3 vagas (máximo)
    - Pessoas com deficiência: 3 vagas (máximo)
    - Jovens: 3 vagas (máximo)
    - Pessoas idosas: 3 vagas (máximo)
    - LGBTQPN+: 2 vagas (máximo)
    - TOTAL COTAS: 20 vagas
    - Ampla participação: 10 vagas (mínimo - cresce conforme cotas não preenchidas)
    - TOTAL GERAL: 30 vagas
    
  2. Sistema Dinâmico
    - Vagas não preenchidas em cotas específicas vão automaticamente para ampla participação
    - Se apenas 5 pessoas negras se inscrevem (em vez de 6), ampla participação fica com 11 vagas
    - O limite máximo total por estado sempre é 30 vagas
*/

-- Atualizar PA para ter os limites máximos das cotas
UPDATE cotas_por_estado
SET vagas_total = 6
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'pessoa_negra';

UPDATE cotas_por_estado
SET vagas_total = 3
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'pessoa_indigena';

UPDATE cotas_por_estado
SET vagas_total = 3
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'pessoa_com_deficiencia';

UPDATE cotas_por_estado
SET vagas_total = 3
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'pessoa_jovem';

UPDATE cotas_por_estado
SET vagas_total = 3
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'pessoa_idosa';

UPDATE cotas_por_estado
SET vagas_total = 2
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'lgbtqpn';

UPDATE cotas_por_estado
SET vagas_total = 10
WHERE evento_id = '1e8457fd-2af6-4739-8096-349cbbac6104'
  AND estado_uf = 'PA'
  AND cota_representada = 'ampla_participacao';
