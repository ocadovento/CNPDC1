/*
  # Configurar cotas iniciais para o estado do Pará (PA)
  
  1. Insere cotas para o evento Teia Nacional 2026
  2. Define vagas por cota conforme critério definido
  
  Exemplo de distribuição:
  - Pessoa Negra: 3 vagas
  - Pessoa Indígena: 2 vagas
  - Pessoa com Deficiência: 2 vagas
  - Pessoa Jovem: 2 vagas
  - Pessoa Idosa: 2 vagas
  - Mulher: 3 vagas
  - LGBTQPN+: 2 vagas
  - Ampla Participação: 4 vagas
  
  Total: 20 vagas para PA
*/

-- Buscar o ID do evento Teia Nacional 2026
DO $$
DECLARE
  v_evento_id uuid;
BEGIN
  -- Buscar evento
  SELECT id INTO v_evento_id
  FROM eventos_teias_foruns
  WHERE tipo_evento = 'teia'
    AND cidade = 'Aracruz'
    AND estado_uf = 'ES'
    AND data_evento >= '2026-01-01'
  LIMIT 1;

  IF v_evento_id IS NOT NULL THEN
    -- Inserir cotas para PA
    INSERT INTO cotas_por_estado (evento_id, estado_uf, cota_representada, vagas_total)
    VALUES
      (v_evento_id, 'PA', 'pessoa_negra', 3),
      (v_evento_id, 'PA', 'pessoa_indigena', 2),
      (v_evento_id, 'PA', 'pessoa_com_deficiencia', 2),
      (v_evento_id, 'PA', 'pessoa_jovem', 2),
      (v_evento_id, 'PA', 'pessoa_idosa', 2),
      (v_evento_id, 'PA', 'mulher', 3),
      (v_evento_id, 'PA', 'lgbtqpn', 2),
      (v_evento_id, 'PA', 'ampla_participacao', 4)
    ON CONFLICT (evento_id, estado_uf, cota_representada) DO NOTHING;
  END IF;
END $$;
