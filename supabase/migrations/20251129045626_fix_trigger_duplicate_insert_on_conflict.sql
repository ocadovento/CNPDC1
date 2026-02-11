/*
  # Fix Duplicate Insert Error in Auto-Promotion Trigger

  1. Changes
    - Update `promover_delegado_ao_inscrever()` function to handle duplicate inserts
    - Add ON CONFLICT DO NOTHING to prevent duplicate key violations
    - This allows the trigger to work even if the participant already exists in the national event

  2. Security
    - Maintains existing RLS policies
    - SECURITY DEFINER to ensure proper execution
*/

CREATE OR REPLACE FUNCTION promover_delegado_ao_inscrever()
RETURNS TRIGGER AS $$
DECLARE
  evento_nacional_id uuid;
BEGIN
  -- Buscar ID do evento Teia Nacional 2026 (Aracruz/ES)
  SELECT id INTO evento_nacional_id
  FROM eventos_teias_foruns
  WHERE tipo_evento = 'teia'
    AND data_evento >= '2026-01-01'
    AND cidade = 'Aracruz'
    AND estado_uf = 'ES'
  LIMIT 1;

  -- Se encontrou o evento nacional, criar registro duplicado
  IF evento_nacional_id IS NOT NULL THEN
    
    -- Inserir novo registro no evento nacional (ainda não validado)
    -- ON CONFLICT DO NOTHING para evitar erro de chave duplicada
    INSERT INTO delegacao_estado (
      estado_uf,
      representante_id,
      nome_completo,
      cpf,
      nome_mae,
      inscricao_completa,
      evento_id,
      nome_ponto_cultura,
      contato_whatsapp,
      email,
      cidade,
      cota_identidade_genero,
      cota_social,
      promovido_evento_nacional
    ) VALUES (
      NEW.estado_uf,
      NEW.representante_id,
      NEW.nome_completo,
      NEW.cpf,
      NEW.nome_mae,
      false,
      evento_nacional_id,
      NEW.nome_ponto_cultura,
      NEW.contato_whatsapp,
      NEW.email,
      NEW.cidade,
      NEW.cota_identidade_genero,
      NEW.cota_social,
      true
    )
    ON CONFLICT (estado_uf, cpf, evento_id) DO NOTHING;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;