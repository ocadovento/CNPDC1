/*
  # Fix promover_delegado_para_evento_nacional function to include nome_mae
  
  1. Changes
    - Update the function to include nome_mae field when creating national event registration
    - This fixes the "null value in column nome_mae violates not-null constraint" error
  
  2. Notes
    - The trigger executes when inscricao_completa changes to true
    - It creates a duplicate registration for the national event (Teia Nacional 2026)
    - Now includes all required NOT NULL fields
*/

CREATE OR REPLACE FUNCTION promover_delegado_para_evento_nacional()
RETURNS TRIGGER AS $$
DECLARE
  evento_nacional_id uuid;
BEGIN
  -- Verificar se inscricao_completa mudou de false para true
  IF NEW.inscricao_completa = true AND (OLD.inscricao_completa = false OR OLD.inscricao_completa IS NULL) THEN
    
    -- Verificar se já foi promovido
    IF NEW.promovido_evento_nacional = false OR NEW.promovido_evento_nacional IS NULL THEN
      
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
        
        -- Inserir novo registro no evento nacional
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
          promovido_evento_nacional,
          data_validacao
        ) VALUES (
          NEW.estado_uf,
          NEW.representante_id,
          NEW.nome_completo,
          NEW.cpf,
          NEW.nome_mae,
          true,
          evento_nacional_id,
          NEW.nome_ponto_cultura,
          NEW.contato_whatsapp,
          NEW.email,
          NEW.cidade,
          NEW.cota_identidade_genero,
          NEW.cota_social,
          true,
          NEW.data_validacao
        );
        
        -- Marcar registro original como promovido
        NEW.promovido_evento_nacional = true;
        
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
