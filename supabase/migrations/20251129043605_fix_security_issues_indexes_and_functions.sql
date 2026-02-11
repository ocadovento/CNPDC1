/*
  # Fix security issues, indexes, and function search paths
  
  1. Foreign Key Indexes
    - Add index on inscricoes_membros(delegacao_id)
    - Add index on teias_estaduais(estado_uf)
    - Add index on usuarios(estado_uf)
  
  2. Duplicate/Unused Indexes
    - Drop duplicate index idx_delegacao_estado_data_validacao
    - Drop unused index idx_delegacao_data_validacao
  
  3. Function Search Paths
    - Fix promover_delegado_ao_inscrever to use explicit schema
    - Fix promover_delegado_para_evento_nacional to use explicit schema
  
  4. Notes
    - Foreign key indexes improve JOIN performance
    - Removing duplicate indexes reduces storage and maintenance overhead
    - Explicit search paths prevent security vulnerabilities
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_inscricoes_membros_delegacao_id 
  ON inscricoes_membros(delegacao_id);

CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf 
  ON teias_estaduais(estado_uf);

CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
  ON usuarios(estado_uf);

-- Drop duplicate and unused indexes
DROP INDEX IF EXISTS idx_delegacao_estado_data_validacao;
DROP INDEX IF EXISTS idx_delegacao_data_validacao;

-- Fix function search paths
CREATE OR REPLACE FUNCTION promover_delegado_ao_inscrever()
RETURNS TRIGGER AS $$
DECLARE
  evento_nacional_id uuid;
BEGIN
  -- Buscar ID do evento Teia Nacional 2026 (Aracruz/ES)
  SELECT id INTO evento_nacional_id
  FROM public.eventos_teias_foruns
  WHERE tipo_evento = 'teia'
    AND data_evento >= '2026-01-01'
    AND cidade = 'Aracruz'
    AND estado_uf = 'ES'
  LIMIT 1;
  
  -- Se encontrou o evento nacional, criar registro duplicado
  IF evento_nacional_id IS NOT NULL THEN
    
    -- Inserir novo registro no evento nacional (ainda não validado)
    INSERT INTO public.delegacao_estado (
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
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION promover_delegado_para_evento_nacional()
RETURNS TRIGGER AS $$
DECLARE
  evento_nacional_id uuid;
BEGIN
  -- Verificar se inscricao_completa mudou de false para true
  IF NEW.inscricao_completa = true AND (OLD.inscricao_completa = false OR OLD.inscricao_completa IS NULL) THEN
    
    -- Buscar ID do evento Teia Nacional 2026 (Aracruz/ES)
    SELECT id INTO evento_nacional_id
    FROM public.eventos_teias_foruns
    WHERE tipo_evento = 'teia'
      AND data_evento >= '2026-01-01'
      AND cidade = 'Aracruz'
      AND estado_uf = 'ES'
    LIMIT 1;
    
    -- Se encontrou o evento nacional, atualizar registro existente
    IF evento_nacional_id IS NOT NULL THEN
      
      -- Atualizar registro do evento nacional
      UPDATE public.delegacao_estado
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;
