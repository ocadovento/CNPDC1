/*
  # Adicionar Promoção Automática para Evento Nacional

  1. Mudanças
    - Adicionar campo `promovido_evento_nacional` (boolean) na tabela delegacao_estado
    - Criar trigger que duplica registro do delegado para o evento nacional quando validado
    - Delegado mantém registro no evento estadual original
    - Delegado ganha novo registro no evento nacional (Aracruz/ES 2026)

  2. Lógica do Trigger
    - Quando inscricao_completa muda de false para true
    - Sistema busca o evento Teia Nacional 2026
    - Cria novo registro do delegado vinculado ao evento nacional
    - Marca o registro original como promovido

  3. Segurança
    - Mantém RLS policies existentes
    - Delegados promovidos ficam visíveis na página pública "Delegação Teia 2026"
*/

-- Adicionar campo para marcar se foi promovido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delegacao_estado' AND column_name = 'promovido_evento_nacional'
  ) THEN
    ALTER TABLE delegacao_estado ADD COLUMN promovido_evento_nacional boolean DEFAULT false;
  END IF;
END $$;

-- Criar função que promove delegado para evento nacional quando validado
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
          true, -- Já validado
          evento_nacional_id, -- Evento nacional
          NEW.nome_ponto_cultura,
          NEW.contato_whatsapp,
          NEW.email,
          NEW.cidade,
          NEW.cota_identidade_genero,
          NEW.cota_social,
          true -- Marcado como promovido
        );
        
        -- Marcar registro original como promovido
        NEW.promovido_evento_nacional = true;
        
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_promover_delegado_nacional ON delegacao_estado;

CREATE TRIGGER trigger_promover_delegado_nacional
  BEFORE UPDATE ON delegacao_estado
  FOR EACH ROW
  EXECUTE FUNCTION promover_delegado_para_evento_nacional();
