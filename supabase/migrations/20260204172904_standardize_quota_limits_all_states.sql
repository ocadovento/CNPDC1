/*
  # Padronizar Limites de Cotas para Todos os Estados

  1. Objetivo
    - Garantir que TODOS os estados tenham os mesmos limites de cotas
    - Total de 30 vagas por estado (delegados eleitos)
    - Manter flexibilidade: estados podem não atingir ou exceder conforme disponibilidade

  2. Limites Padrão (Total: 30 vagas)
    - Ampla Participação: 10 vagas
    - Pessoa Negra: 6 vagas
    - Pessoa com Deficiência: 3 vagas
    - Pessoa Idosa: 3 vagas
    - Pessoa Indígena: 3 vagas
    - Pessoa Jovem: 3 vagas
    - LGBTQPN+ (mín. 8%): 2 vagas

  3. Ação
    - Atualizar TODOS os registros existentes na tabela cotas_por_estado
    - Aplicar os limites padronizados independente do estado
    - Manter a estrutura flexível de uso

  4. Benefícios
    - Relatórios mostram os mesmos limites para todos
    - Cada estado usa conforme sua realidade
    - Sistema permite redistribuição de vagas não preenchidas
*/

-- Atualizar todos os estados com limites padronizados
UPDATE cotas_por_estado
SET vagas_total = CASE cota_representada
  WHEN 'ampla_participacao' THEN 10
  WHEN 'pessoa_negra' THEN 6
  WHEN 'pessoa_com_deficiencia' THEN 3
  WHEN 'pessoa_idosa' THEN 3
  WHEN 'pessoa_indigena' THEN 3
  WHEN 'pessoa_jovem' THEN 3
  WHEN 'lgbtqpn' THEN 2
  ELSE vagas_total
END
WHERE cota_representada IN (
  'ampla_participacao',
  'pessoa_negra',
  'pessoa_com_deficiencia',
  'pessoa_idosa',
  'pessoa_indigena',
  'pessoa_jovem',
  'lgbtqpn'
);

-- Verificar totais por estado (deve ser 30 para cada)
DO $$
DECLARE
  v_estado RECORD;
  v_total INTEGER;
  v_count INTEGER;
BEGIN
  -- Contar quantos estados existem
  SELECT COUNT(DISTINCT estado_uf) INTO v_count FROM cotas_por_estado;
  
  IF v_count = 0 THEN
    RAISE NOTICE 'Nenhum estado encontrado na tabela cotas_por_estado';
    RETURN;
  END IF;

  RAISE NOTICE '=== Verificando Totais de Vagas por Estado ===';

  FOR v_estado IN
    SELECT DISTINCT estado_uf
    FROM cotas_por_estado
    ORDER BY estado_uf
  LOOP
    SELECT SUM(vagas_total) INTO v_total
    FROM cotas_por_estado
    WHERE estado_uf = v_estado.estado_uf;

    RAISE NOTICE 'Estado %: Total de vagas = %', v_estado.estado_uf, v_total;

    IF v_total != 30 THEN
      RAISE WARNING 'Estado % tem % vagas, esperado 30!', v_estado.estado_uf, v_total;
    END IF;
  END LOOP;

  RAISE NOTICE '=== Verificação Concluída ===';
END $$;

-- Exibir resumo das cotas padronizadas
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== Limites Padronizados por Cota ===';
  RAISE NOTICE 'Ampla Participação: 10 vagas';
  RAISE NOTICE 'Pessoa Negra: 6 vagas';
  RAISE NOTICE 'Pessoa com Deficiência: 3 vagas';
  RAISE NOTICE 'Pessoa Idosa: 3 vagas';
  RAISE NOTICE 'Pessoa Indígena: 3 vagas';
  RAISE NOTICE 'Pessoa Jovem: 3 vagas';
  RAISE NOTICE 'LGBTQPN+ (mín. 8%%): 2 vagas';
  RAISE NOTICE 'TOTAL: 30 vagas por estado';
  RAISE NOTICE '';
END $$;
