/*
  # Correção de Problemas de Segurança - Índices e Funções

  ## Alterações

  1. **Índices em Foreign Keys**
     - Adiciona índice em `cotas_por_estado.estado_uf`
     - Adiciona índice em `teias_estaduais.estado_uf`
     - Adiciona índice em `usuarios.estado_uf`

  2. **Remoção de Índices Não Utilizados**
     - Remove `idx_eventos_representante_id`

  3. **Correção de Search Path em Funções**
     - Atualiza funções para usar `SET search_path = public`
*/

-- =====================================================
-- 1. ADICIONAR ÍNDICES EM FOREIGN KEYS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cotas_por_estado_estado_uf
ON cotas_por_estado(estado_uf);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'teias_estaduais'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf
    ON teias_estaduais(estado_uf);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf
ON usuarios(estado_uf);

-- =====================================================
-- 2. REMOVER ÍNDICES NÃO UTILIZADOS
-- =====================================================

DROP INDEX IF EXISTS idx_eventos_representante_id;

-- =====================================================
-- 3. ATUALIZAR SEARCH PATH DAS FUNÇÕES EXISTENTES
-- =====================================================

-- Atualizar get_vagas_disponiveis_com_ampla (primeira versão)
ALTER FUNCTION get_vagas_disponiveis_com_ampla(uuid, text)
SET search_path = public;

-- Atualizar get_vagas_disponiveis_com_ampla (segunda versão)
ALTER FUNCTION get_vagas_disponiveis_com_ampla(uuid, text, text)
SET search_path = public;

-- Atualizar calcular_paridade_genero (primeira versão)
ALTER FUNCTION calcular_paridade_genero(uuid, text)
SET search_path = public;

-- Atualizar calcular_paridade_genero (segunda versão)
ALTER FUNCTION calcular_paridade_genero(uuid, text, text)
SET search_path = public;

-- Atualizar calcular_ampla_concorrencia (primeira versão)
ALTER FUNCTION calcular_ampla_concorrencia(uuid, text)
SET search_path = public;

-- Atualizar calcular_ampla_concorrencia (segunda versão)
ALTER FUNCTION calcular_ampla_concorrencia(uuid, text, integer)
SET search_path = public;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON INDEX idx_cotas_por_estado_estado_uf IS 'Índice para melhorar performance de queries com FK estado_uf';
COMMENT ON INDEX idx_usuarios_estado_uf IS 'Índice para melhorar performance de queries com FK estado_uf';
