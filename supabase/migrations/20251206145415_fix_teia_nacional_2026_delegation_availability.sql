/*
  # Corrigir Disponibilidade de Delegação para Teia Nacional 2026
  
  1. Problema
    - A função check_delegacao_availability() permite adicionar delegação APÓS o evento
    - Isso impede representantes de adicionarem participantes ANTES da Teia Nacional 2026
  
  2. Solução
    - Corrigir a função para permitir adicionar delegação ANTES do evento
    - Atualizar eventos existentes para refletir a nova lógica
  
  3. Nova Lógica
    - pode_adicionar_delegacao = true quando CURRENT_DATE < data_evento
    - pode_adicionar_delegacao = false quando o evento já passou
*/

-- Corrigir a função com lógica correta
CREATE OR REPLACE FUNCTION check_delegacao_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Permite adicionar delegação se o evento ainda não aconteceu
  NEW.pode_adicionar_delegacao = (CURRENT_DATE < NEW.data_evento);
  RETURN NEW;
END;
$$;

-- Atualizar todos os eventos existentes com a nova lógica
UPDATE eventos_teias_foruns
SET pode_adicionar_delegacao = (CURRENT_DATE < data_evento);
