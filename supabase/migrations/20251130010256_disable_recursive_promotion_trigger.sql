/*
  # Desabilitar Trigger Recursivo de Promoção

  1. Problema
    - O trigger `trigger_promover_delegado_nacional` causa recursão infinita
    - Quando participante valida inscrição na Teia 2026, trigger dispara UPDATE que dispara novamente
    - Erro: "stack depth limit exceeded"

  2. Solução
    - Remover o trigger completamente
    - Remover a função associada
    - Todos participantes já estão na Teia Nacional 2026 diretamente

  3. Motivo
    - Sistema agora trabalha apenas com Teia Nacional 2026 (Opção 2)
    - Não há necessidade de promoção automática entre eventos
*/

-- Remove o trigger se existir
DROP TRIGGER IF EXISTS trigger_promover_delegado_nacional ON delegacao_estado;

-- Remove a função com CASCADE
DROP FUNCTION IF EXISTS promover_delegado_para_evento_nacional() CASCADE;
