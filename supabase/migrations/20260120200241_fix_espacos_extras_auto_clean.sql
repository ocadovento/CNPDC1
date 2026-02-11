/*
  # Limpeza automática de espaços extras em delegacao_estado
  
  1. Função de limpeza
    - Remove espaços no início e fim
    - Remove espaços duplos/triplos entre palavras
    - Aplica em nome_completo e nome_mae
  
  2. Trigger automático
    - Executa antes de INSERT e UPDATE
    - Garante dados sempre limpos
*/

-- Criar função de limpeza automática
CREATE OR REPLACE FUNCTION clean_delegacao_espacos()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpar nome_completo: remover espaços extras
  IF NEW.nome_completo IS NOT NULL THEN
    NEW.nome_completo := TRIM(REGEXP_REPLACE(NEW.nome_completo, '\s+', ' ', 'g'));
  END IF;
  
  -- Limpar nome_mae: remover espaços extras
  IF NEW.nome_mae IS NOT NULL THEN
    NEW.nome_mae := TRIM(REGEXP_REPLACE(NEW.nome_mae, '\s+', ' ', 'g'));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para delegacao_estado
DROP TRIGGER IF EXISTS trigger_clean_delegacao_espacos ON delegacao_estado;
CREATE TRIGGER trigger_clean_delegacao_espacos
  BEFORE INSERT OR UPDATE ON delegacao_estado
  FOR EACH ROW
  EXECUTE FUNCTION clean_delegacao_espacos();
