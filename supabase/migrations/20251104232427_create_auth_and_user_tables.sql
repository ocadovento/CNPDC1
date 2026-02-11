/*
  # Criação do Sistema de Autenticação e Usuários

  ## Resumo
  Migração inicial que cria a estrutura completa de autenticação e gerenciamento de usuários
  para a plataforma CNPDC.

  ## Novas Tabelas
  
  ### `usuarios`
  - `id` (uuid, chave primária) - ID único do usuário
  - `auth_user_id` (uuid) - Referência ao usuário no auth.users
  - `email` (text) - Email do usuário
  - `nome_completo` (text) - Nome completo
  - `tipo_usuario` (text) - Tipo: 'admin_geral', 'admin_auxiliar', 'representante_gt', 'membro'
  - `estado_uf` (text) - UF do estado (para representantes GT)
  - `ativo` (boolean) - Se o usuário está ativo
  - Timestamps de criação e atualização
  
  ### `estados_brasil`
  - `id` (uuid, chave primária)
  - `uf` (text) - Sigla do estado
  - `nome` (text) - Nome completo do estado
  - `regiao` (text) - Região do Brasil

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas por tipo de usuário
  - Admin geral tem acesso total
  - Representantes GT só acessam dados do próprio estado
*/

-- Criar tabela de estados
CREATE TABLE IF NOT EXISTS estados_brasil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uf text UNIQUE NOT NULL,
  nome text NOT NULL,
  regiao text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Inserir estados brasileiros
INSERT INTO estados_brasil (uf, nome, regiao) VALUES
  ('AC', 'Acre', 'Norte'),
  ('AL', 'Alagoas', 'Nordeste'),
  ('AP', 'Amapá', 'Norte'),
  ('AM', 'Amazonas', 'Norte'),
  ('BA', 'Bahia', 'Nordeste'),
  ('CE', 'Ceará', 'Nordeste'),
  ('DF', 'Distrito Federal', 'Centro-Oeste'),
  ('ES', 'Espírito Santo', 'Sudeste'),
  ('GO', 'Goiás', 'Centro-Oeste'),
  ('MA', 'Maranhão', 'Nordeste'),
  ('MT', 'Mato Grosso', 'Centro-Oeste'),
  ('MS', 'Mato Grosso do Sul', 'Centro-Oeste'),
  ('MG', 'Minas Gerais', 'Sudeste'),
  ('PA', 'Pará', 'Norte'),
  ('PB', 'Paraíba', 'Nordeste'),
  ('PR', 'Paraná', 'Sul'),
  ('PE', 'Pernambuco', 'Nordeste'),
  ('PI', 'Piauí', 'Nordeste'),
  ('RJ', 'Rio de Janeiro', 'Sudeste'),
  ('RN', 'Rio Grande do Norte', 'Nordeste'),
  ('RS', 'Rio Grande do Sul', 'Sul'),
  ('RO', 'Rondônia', 'Norte'),
  ('RR', 'Roraima', 'Norte'),
  ('SC', 'Santa Catarina', 'Sul'),
  ('SP', 'São Paulo', 'Sudeste'),
  ('SE', 'Sergipe', 'Nordeste'),
  ('TO', 'Tocantins', 'Norte')
ON CONFLICT (uf) DO NOTHING;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nome_completo text NOT NULL,
  tipo_usuario text NOT NULL CHECK (tipo_usuario IN ('admin_geral', 'admin_auxiliar', 'representante_gt', 'membro')),
  estado_uf text REFERENCES estados_brasil(uf),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE estados_brasil ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para estados_brasil (leitura pública autenticada)
CREATE POLICY "Usuários autenticados podem ver estados"
  ON estados_brasil FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para usuarios
CREATE POLICY "Admin geral pode ver todos os usuários"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_geral'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admin geral pode inserir usuários"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_geral'
      AND u.ativo = true
    )
  );

CREATE POLICY "Admin geral pode atualizar usuários"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin_geral'
      AND u.ativo = true
    )
  );

CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado_uf);
CREATE INDEX IF NOT EXISTS idx_estados_uf ON estados_brasil(uf);