/*
  # Add automatic promotion to Teia 2026 on inscription
  
  1. Changes
    - Create new function to promote delegates on INSERT (not just UPDATE)
    - Add trigger to execute function when new inscriptions are created
    - Delegates appear in both state event and Teia 2026 immediately upon registration
  
  2. Behavior
    - When participant registers in state event → automatically creates record in Teia 2026 (not validated)
    - When state registration is validated → also validates the Teia 2026 record
  
  3. Notes
    - Uses separate function to avoid conflicts with existing UPDATE trigger
    - Maintains data_validacao and inscricao_completa status separately for each event
*/

-- Function to promote on INSERT
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
      false,  -- Começa como não validado
      evento_nacional_id,
      NEW.nome_ponto_cultura,
      NEW.contato_whatsapp,
      NEW.email,
      NEW.cidade,
      NEW.cota_identidade_genero,
      NEW.cota_social,
      true
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar no INSERT
DROP TRIGGER IF EXISTS trigger_promover_delegado_ao_inscrever ON delegacao_estado;
CREATE TRIGGER trigger_promover_delegado_ao_inscrever
  AFTER INSERT ON delegacao_estado
  FOR EACH ROW
  EXECUTE FUNCTION promover_delegado_ao_inscrever();

-- Atualizar função existente para também atualizar o registro da Teia 2026 quando validar
CREATE OR REPLACE FUNCTION promover_delegado_para_evento_nacional()
RETURNS TRIGGER AS $$
DECLARE
  evento_nacional_id uuid;
BEGIN
  -- Verificar se inscricao_completa mudou de false para true
  IF NEW.inscricao_completa = true AND (OLD.inscricao_completa = false OR OLD.inscricao_completa IS NULL) THEN
    
    -- Buscar ID do evento Teia Nacional 2026 (Aracruz/ES)
    SELECT id INTO evento_nacional_id
    FROM eventos_teias_foruns
    WHERE tipo_evento = 'teia'
      AND data_evento >= '2026-01-01'
      AND cidade = 'Aracruz'
      AND estado_uf = 'ES'
    LIMIT 1;
    
    -- Se encontrou o evento nacional, atualizar registro existente
    IF evento_nacional_id IS NOT NULL THEN
      
      -- Atualizar registro do evento nacional
      UPDATE delegacao_estado
      SET 
        inscricao_completa = true,
        data_validacao = NEW.data_validacao
      WHERE evento_id = evento_nacional_id
        AND cpf = NEW.cpf
        AND estado_uf = NEW.estado_uf;
      
      -- Marcar registro original como promovido
      NEW.promovido_evento_nacional = true;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
