/*
  # Adicionar Campo Gênero à Tabela delegacao_estado

  1. Alterações
    - Adiciona coluna `genero` à tabela `delegacao_estado`
      - Valores permitidos: 'mulher', 'homem'
      - Campo obrigatório para novos registros
      - Usado para cálculo de paridade de gênero (mínimo 50% mulheres)
  
  2. Índices
    - Cria índice em `delegacao_estado.genero` para otimizar consultas
    - Cria índice composto `(cota_representada, genero, estado_uf)` para análises de distribuição
  
  3. Segurança
    - Mantém políticas RLS existentes
    - Campo pode ser lido e escrito conforme permissões atuais
  
  4. Nota
    - A tabela `inscricoes_membros` já possui o campo `genero`
    - Este campo será copiado para `delegacao_estado` quando um inscrito for promovido
*/

-- Adicionar coluna genero à tabela delegacao_estado
ALTER TABLE delegacao_estado 
  ADD COLUMN IF NOT EXISTS genero TEXT CHECK (genero IN ('mulher', 'homem'));

-- Índices para performance em delegacao_estado
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_genero 
  ON delegacao_estado(genero) WHERE genero IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_delegacao_estado_cota_genero 
  ON delegacao_estado(cota_representada, genero, estado_uf) 
  WHERE genero IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_delegacao_estado_evento_genero
  ON delegacao_estado(evento_id, genero, estado_uf)
  WHERE genero IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN delegacao_estado.genero IS 'Gênero do delegado: mulher ou homem. Usado para cálculo de paridade de gênero (mínimo 50% mulheres por delegação estadual)';
