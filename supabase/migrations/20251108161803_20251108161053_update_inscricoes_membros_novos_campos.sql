/*
  # Atualizar tabela inscricoes_membros - Novos campos

  ## Mudanças

  1. **Alterar campo de comunidades tradicionais**
    - Remover campo `tipo_comunidade_tradicional` (text)
    - Adicionar campo `comunidades_tradicionais` (text[]) - Array para até 5 comunidades

  2. **Adicionar campos de ID do Mapa**
    - `tem_id_mapa` (boolean) - Se possui ou não ID do mapa
    - `id_mapa_arquivo_url` (text) - URL/link do arquivo PNG, PDF ou link direto

  ## Notas

  - Permite seleção de múltiplas comunidades tradicionais (até 5)
  - Novo fluxo para ID do Mapa: opção "tenho" ou "não tenho", com upload/link quando "tenho"
  - Link do Ponto no Mapa Cultura Viva já existe como `link_mapa_cultura_viva`
*/

-- Adicionar novos campos
ALTER TABLE inscricoes_membros
  ADD COLUMN IF NOT EXISTS comunidades_tradicionais text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tem_id_mapa boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS id_mapa_arquivo_url text DEFAULT '';

-- Migrar dados existentes de tipo_comunidade_tradicional para o array
UPDATE inscricoes_membros
SET comunidades_tradicionais = ARRAY[tipo_comunidade_tradicional]
WHERE tipo_comunidade_tradicional IS NOT NULL AND tipo_comunidade_tradicional != '';

-- Remover campo antigo (opcional - pode ser mantido para histórico)
-- ALTER TABLE inscricoes_membros DROP COLUMN IF EXISTS tipo_comunidade_tradicional;
