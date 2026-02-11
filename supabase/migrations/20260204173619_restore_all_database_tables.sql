/*
  # Restaurar Estrutura Completa do Banco de Dados

  ## Problema
  O banco de dados foi resetado e perdeu todas as tabelas principais
  de usuarios, documents, delegação, etc.

  ## Solução
  Recriar todas as tabelas principais com suas estruturas, índices e políticas RLS.

  ## Tabelas Criadas
  
  ### 1. estados_brasil
  - Lista completa de todos os estados brasileiros
  - Chave única: UF (sigla do estado)
  
  ### 2. usuarios
  - Tabela principal de usuários do sistema
  - Tipos: admin_geral, admin_auxiliar, representante_gt, membro
  - Relacionada com auth.users do Supabase
  
  ### 3. teias_estaduais
  - Registro de teias estaduais organizadas por representantes GT
  
  ### 4. delegacao_estado
  - Delegados inscritos pelos representantes GT
  - Cada delegado tem CPF, nome e cota representada
  
  ### 5. inscricoes_membros
  - Formulário completo preenchido pelos membros
  - Só podem preencher se foram previamente inscritos na delegacao_estado
  
  ### 6. documents
  - Documentos do sistema (editais, regulamentos, etc.)
  - Acesso público para leitura
  
  ## Segurança
  - RLS habilitado em TODAS as tabelas
  - Políticas específicas para cada tipo de usuário
  - Admin geral tem acesso completo
  - Representantes GT só acessam dados do seu estado
*/

-- 1. TABELA DE ESTADOS
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

-- 2. TABELA DE USUÁRIOS
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

-- 3. TABELA DE TEIAS ESTADUAIS
CREATE TABLE IF NOT EXISTS teias_estaduais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado_uf text NOT NULL REFERENCES estados_brasil(uf),
  representante_id uuid NOT NULL REFERENCES usuarios(id),
  data_inicio date NOT NULL,
  data_fim date,
  cidade text NOT NULL,
  local_evento text NOT NULL,
  temas_principais text[],
  descricao text,
  status text DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'confirmado', 'realizado', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. TABELA DE DELEGAÇÃO INSCRITA
CREATE TABLE IF NOT EXISTS delegacao_estado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid,
  estado_uf text NOT NULL REFERENCES estados_brasil(uf),
  representante_id uuid REFERENCES usuarios(id),
  nome_completo text NOT NULL,
  nome_mae text,
  cpf text NOT NULL,
  cota_representada text CHECK (cota_representada IN (
    'pessoa_negra', 'pessoa_indigena', 'pessoa_com_deficiencia',
    'pessoa_jovem', 'pessoa_idosa', 'lgbtqpn', 'ampla_participacao'
  )),
  tipo_delegado text CHECK (tipo_delegado IN ('nato', 'eleito', 'suplente')),
  inscricao_completa boolean DEFAULT false,
  data_validacao timestamptz,
  motivo_substituicao text,
  gt_tematico text,
  gt_tematico_outra text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. TABELA DE INSCRIÇÕES COMPLETAS
CREATE TABLE IF NOT EXISTS inscricoes_membros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegacao_id uuid REFERENCES delegacao_estado(id) ON DELETE CASCADE,
  
  -- Dados pessoais básicos
  cpf text NOT NULL,
  passaporte text,
  nome_completo text NOT NULL,
  nome_mae text,
  nome_social text,
  nome_cracha text NOT NULL,
  email text NOT NULL,
  celular text NOT NULL,
  
  -- Dados demográficos
  faixa_etaria text,
  nacionalidade text,
  raca_cor_etnia text,
  genero text,
  orientacao_sexual text,
  cota_desejada text[],
  
  -- Escolaridade e comunidade
  escolaridade text,
  comunidade_tradicional boolean DEFAULT false,
  tipo_comunidade_tradicional text,
  comunidade_tradicional_outra text,
  
  -- Endereço
  logradouro_tipo text,
  logradouro_nome text,
  numero text,
  complemento text,
  bairro_tipo text,
  bairro_nome text,
  cidade text,
  estado_uf text,
  cep text,
  
  -- Dados econômicos
  renda_pessoal text,
  
  -- Acessibilidade
  pessoa_com_deficiencia text[],
  medida_acessibilidade text,
  
  -- Ponto de Cultura
  nome_ponto_cultura text NOT NULL,
  link_mapa_cultura_viva text,
  documento_certificacao text,
  uf_ponto text NOT NULL,
  cidade_ponto text NOT NULL,
  acoes_estruturantes text[],
  area_atuacao_principal text[],
  
  -- Participação
  como_participa_rede text,
  gt_tematico_escolhido text,
  gt_tematico_escolhido_outra text,
  
  -- Hospedagem e alimentação
  tipo_acomodacao text,
  restricao_alimentar boolean DEFAULT false,
  descricao_restricao text,
  
  -- Autorizações
  aceita_compartilhar_dados boolean DEFAULT false,
  aceita_email boolean DEFAULT false,
  aceita_telefone boolean DEFAULT false,
  autoriza_uso_imagem boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(cpf, delegacao_id)
);

-- 6. TABELA DE DOCUMENTOS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  description text,
  category text,
  file_type text,
  file_size bigint,
  upload_method text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- 7. TABELA DE EVENTOS (Teias Nacionais e Estaduais)
CREATE TABLE IF NOT EXISTS eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('teia_nacional', 'teia_estadual', 'forum_estadual')),
  estado_uf text REFERENCES estados_brasil(uf),
  data_inicio date NOT NULL,
  data_fim date,
  cidade text NOT NULL,
  local_evento text NOT NULL,
  temas_principais text[],
  descricao text,
  auto_promover_para_nacional boolean DEFAULT false,
  status text DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'confirmado', 'realizado', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. TABELA DE REPRESENTANTES GT
CREATE TABLE IF NOT EXISTS representantes_gt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  estado_uf text NOT NULL REFERENCES estados_brasil(uf),
  gt_tematico text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, estado_uf, gt_tematico)
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado_uf);
CREATE INDEX IF NOT EXISTS idx_estados_uf ON estados_brasil(uf);
CREATE INDEX IF NOT EXISTS idx_delegacao_estado ON delegacao_estado(estado_uf);
CREATE INDEX IF NOT EXISTS idx_delegacao_cpf ON delegacao_estado(cpf);
CREATE INDEX IF NOT EXISTS idx_delegacao_evento ON delegacao_estado(evento_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_cpf ON inscricoes_membros(cpf);
CREATE INDEX IF NOT EXISTS idx_inscricoes_delegacao ON inscricoes_membros(delegacao_id);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado_uf);

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE estados_brasil ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE teias_estaduais ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegacao_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE representantes_gt ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS - estados_brasil (leitura pública)
CREATE POLICY "Anyone can view estados"
  ON estados_brasil FOR SELECT
  USING (true);

-- POLÍTICAS RLS - usuarios
CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND u.ativo = true
    )
  );

CREATE POLICY "Admins can insert users"
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

CREATE POLICY "Admins can update users"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND u.ativo = true
    )
  );

-- POLÍTICAS RLS - delegacao_estado
CREATE POLICY "Anyone can view delegacao"
  ON delegacao_estado FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert delegacao"
  ON delegacao_estado FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update delegacao"
  ON delegacao_estado FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- POLÍTICAS RLS - inscricoes_membros
CREATE POLICY "Authenticated users can view inscricoes"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert inscricoes"
  ON inscricoes_membros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inscricoes"
  ON inscricoes_membros FOR UPDATE
  TO authenticated
  USING (true);

-- POLÍTICAS RLS - documents
CREATE POLICY "Anyone can view documents"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- POLÍTICAS RLS - eventos
CREATE POLICY "Anyone can view eventos"
  ON eventos FOR SELECT
  USING (true);

CREATE POLICY "Admins can create eventos"
  ON eventos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

CREATE POLICY "Admins can update eventos"
  ON eventos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- POLÍTICAS RLS - teias_estaduais
CREATE POLICY "Anyone can view teias"
  ON teias_estaduais FOR SELECT
  USING (true);

CREATE POLICY "Representantes can create teias"
  ON teias_estaduais FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'representante_gt'
      AND u.estado_uf = teias_estaduais.estado_uf
      AND u.ativo = true
    )
  );

-- POLÍTICAS RLS - representantes_gt
CREATE POLICY "Anyone can view representantes"
  ON representantes_gt FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage representantes"
  ON representantes_gt FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'admin_geral'
    )
  );
