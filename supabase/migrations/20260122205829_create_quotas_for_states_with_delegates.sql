/*
  # Criar Cotas para Estados que Têm Delegados
  
  1. Problema
    - Estados AL, AP, RR, RS e TO têm delegados inscritos
    - Mas não têm cotas configuradas na tabela cotas_por_estado
    - Sistema não consegue calcular disponibilidade sem cotas definidas
  
  2. Solução
    - Criar cotas padrão (30 vagas totais) para todos os estados
    - Distribuição padrão por cota:
      - Pessoa Negra: 6 vagas
      - Pessoa Indígena: 3 vagas
      - Pessoa com Deficiência: 3 vagas
      - Pessoa Jovem: 3 vagas
      - Pessoa Idosa: 3 vagas
      - LGBTQPN+: 2 vagas
      - Ampla Participação: 10 vagas
      - Total: 30 vagas
  
  3. Notas
    - Usa ON CONFLICT DO NOTHING para não duplicar se já existe
    - Aplicável ao evento Teia Nacional 2026
*/

-- Buscar o ID do evento Teia Nacional 2026
DO $$
DECLARE
  v_evento_id uuid;
  v_estados text[] := ARRAY['AL', 'AP', 'RR', 'RS', 'TO'];
  v_estado text;
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
    -- Criar cotas para cada estado
    FOREACH v_estado IN ARRAY v_estados
    LOOP
      INSERT INTO cotas_por_estado (evento_id, estado_uf, cota_representada, vagas_total)
      VALUES
        (v_evento_id, v_estado, 'pessoa_negra', 6),
        (v_evento_id, v_estado, 'pessoa_indigena', 3),
        (v_evento_id, v_estado, 'pessoa_com_deficiencia', 3),
        (v_evento_id, v_estado, 'pessoa_jovem', 3),
        (v_evento_id, v_estado, 'pessoa_idosa', 3),
        (v_evento_id, v_estado, 'lgbtqpn', 2),
        (v_evento_id, v_estado, 'ampla_participacao', 10)
      ON CONFLICT (evento_id, estado_uf, cota_representada) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Cotas criadas para os estados: %', array_to_string(v_estados, ', ');
  ELSE
    RAISE NOTICE 'Evento Teia Nacional 2026 não encontrado';
  END IF;
END $$;
