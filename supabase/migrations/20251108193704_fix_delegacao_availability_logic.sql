/*
  # Corrigir Lógica de Disponibilidade de Delegação

  1. Problema
    - A trigger atual permite adicionar delegação 3 dias APÓS o evento
    - Isso está errado - delegações devem ser adicionadas ANTES do evento

  2. Solução
    - Modificar a função para permitir delegação quando a data ATUAL for ANTES da data do evento
    - Isso permite cadastrar participantes enquanto o evento ainda não aconteceu

  3. Nova Lógica
    - `pode_adicionar_delegacao = true` quando CURRENT_DATE < data_evento
    - `pode_adicionar_delegacao = false` quando o evento já passou
*/

-- Recriar a função com lógica correta
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

-- A trigger já existe, então vamos apenas atualizar os eventos existentes
UPDATE eventos_teias_foruns
SET pode_adicionar_delegacao = (CURRENT_DATE < data_evento);
