/*
  # Criar Evento Teia Nacional 2026

  1. Novo Evento
    - Teia Nacional 2026 em Aracruz/ES
    - Data: 24 a 29 de março de 2026
    - Tema: "Pontos de Cultura pela Justiça Climática"
    - pode_adicionar_delegacao: false (delegados vêm dos eventos estaduais automaticamente)
  
  2. Propósito
    - Este é o evento nacional consolidador
    - Receberá automaticamente delegados validados dos eventos estaduais
    - Será usado na página "Delegação Teia 2026" para exibir participantes oficiais
*/

INSERT INTO eventos_teias_foruns (
  tipo_evento,
  data_evento,
  cidade,
  estado_uf,
  temas,
  pode_adicionar_delegacao,
  quantidade_pontos_estimada,
  created_at
) VALUES (
  'teia',
  '2026-03-24',
  'Aracruz',
  'ES',
  'Pontos de Cultura pela Justiça Climática',
  false,
  500,
  now()
) ON CONFLICT DO NOTHING;
