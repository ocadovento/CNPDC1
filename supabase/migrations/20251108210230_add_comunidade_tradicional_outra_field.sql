/*
  # Adicionar campo para "Outras" comunidades tradicionais

  1. Alterações
    - Adiciona coluna `comunidade_tradicional_outra` (text) na tabela `inscricoes_membros`
    - Campo opcional para que participantes especifiquem comunidades não listadas
    
  2. Segurança
    - Nenhuma alteração nas políticas RLS
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscricoes_membros' AND column_name = 'comunidade_tradicional_outra'
  ) THEN
    ALTER TABLE inscricoes_membros ADD COLUMN comunidade_tradicional_outra text DEFAULT NULL;
  END IF;
END $$;