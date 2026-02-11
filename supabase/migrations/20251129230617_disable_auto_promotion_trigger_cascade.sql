/*
  # Desabilitar Trigger Automático de Promoção

  1. Mudanças
    - Remove o trigger que automaticamente promove delegados para a Teia 2026
    - Remove a função associada ao trigger (com CASCADE)
    - A partir de agora, representantes adicionarão participantes diretamente na Teia 2026

  2. Motivo
    - Centralizar toda a delegação no evento Teia 2026
    - Simplificar o fluxo e evitar duplicações
    - Representantes gerenciarão delegação estadual diretamente no evento nacional
*/

-- Remove o trigger se existir
DROP TRIGGER IF EXISTS trigger_promover_delegado_ao_inscrever ON delegacao_estado;

-- Remove a função com CASCADE para remover dependências
DROP FUNCTION IF EXISTS promover_delegado_ao_inscrever() CASCADE;
