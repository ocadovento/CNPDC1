/*
  # Aplicar migração da tabela relatorios_estaduais

  Esta migração aplica a tabela que estava faltando no banco de dados.

  1. Nova Tabela
    - `relatorios_estaduais` - Relatórios de eventos estaduais
  
  2. Segurança
    - RLS habilitado
    - Políticas de leitura pública
    - Políticas de criação/edição para autenticados

  3. Índices
    - estado_uf, created_by, tipo_evento
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
