/*
  # Criar tabela de relatórios estaduais

  1. Nova Tabela
    - `relatorios_estaduais`
      - `id` (uuid, primary key) - Identificador único do relatório
      - `estado_uf` (text) - UF do estado (ex: BA, SP, RJ)
      - `tipo_evento` (text) - Tipo do evento (forum_estadual, teia_estadual)
      - `titulo` (text) - Título do relatório
      - `descricao` (text, opcional) - Descrição/resumo do relatório
      - `url_documento` (text) - URL do documento do relatório
      - `file_type` (text) - Tipo do arquivo (pdf, doc, etc)
      - `created_by` (uuid, foreign key) - ID do usuário que criou (referencia auth.users)
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

  2. Segurança
    - Habilitar RLS na tabela `relatorios_estaduais`
    - Políticas para representantes GT estaduais gerenciarem seus relatórios
    - Políticas para visualização pública dos relatórios

  3. Índices
    - Adicionar índice em `estado_uf` para buscas rápidas
    - Adicionar índice em `created_by` para foreign key
    - Adicionar índice em `tipo_evento` para filtros
*/

CREATE TABLE IF NOT EXISTS relatorios_estaduais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado_uf text NOT NULL,
  tipo_evento text NOT NULL CHECK (tipo_evento IN ('forum_estadual', 'teia_estadual')),
  titulo text NOT NULL,
  descricao text,
  url_documento text NOT NULL,
  file_type text NOT NULL DEFAULT 'pdf',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE relatorios_estaduais ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_relatorios_estado_uf ON relatorios_estaduais(estado_uf);
CREATE INDEX IF NOT EXISTS idx_relatorios_created_by ON relatorios_estaduais(created_by);
CREATE INDEX IF NOT EXISTS idx_relatorios_tipo_evento ON relatorios_estaduais(tipo_evento);

CREATE POLICY "Relatórios são públicos para leitura"
  ON relatorios_estaduais
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Usuários autenticados podem criar relatórios"
  ON relatorios_estaduais
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Criador pode atualizar seus relatórios"
  ON relatorios_estaduais
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Criador pode deletar seus relatórios"
  ON relatorios_estaduais
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
