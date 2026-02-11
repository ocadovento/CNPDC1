/*
  # Criação das Tabelas de Teias, Fóruns e Delegações

  ## Resumo
  Cria as tabelas para gerenciar teias estaduais, fóruns, e o sistema completo
  de inscrição de delegações.

  ## Novas Tabelas
  
  ### `teias_estaduais`
  - Registro de teias estaduais com data, local, temas
  - Gerenciado por representantes GT estaduais
  
  ### `delegacao_estado`
  - Inscrição inicial da delegação pelo representante GT
  - Inclui nome, CPF e cota de cada membro
  
  ### `inscricoes_membros`
  - Formulário completo preenchido pelo próprio membro
  - Apenas liberado se o membro foi inscrito pelo representante
  - Baseado na "Ficha de inscrição patronizada"

  ## Segurança
  - RLS habilitado
  - Representantes GT só gerenciam seu estado
  - Membros só preenchem formulário se previamente inscritos
*/

-- Tabela de teias estaduais
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

-- Tabela de delegação inscrita pelo representante GT
CREATE TABLE IF NOT EXISTS delegacao_estado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado_uf text NOT NULL REFERENCES estados_brasil(uf),
  representante_id uuid NOT NULL REFERENCES usuarios(id),
  nome_completo text NOT NULL,
  cpf text NOT NULL,
  cota_representada text CHECK (cota_representada IN (
    'pessoa_negra', 'pessoa_indigena', 'pessoa_com_deficiencia',
    'pessoa_jovem', 'pessoa_idosa', 'mulher', 'lgbtqpn', 'ampla_participacao'
  )),
  inscricao_completa boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(estado_uf, cpf)
);

-- Tabela de inscrições completas dos membros
CREATE TABLE IF NOT EXISTS inscricoes_membros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegacao_id uuid NOT NULL REFERENCES delegacao_estado(id) ON DELETE CASCADE,
  
  -- Dados pessoais básicos
  cpf text NOT NULL UNIQUE,
  passaporte text,
  nome_completo text NOT NULL,
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
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE teias_estaduais ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegacao_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes_membros ENABLE ROW LEVEL SECURITY;

-- Políticas para teias_estaduais
CREATE POLICY "Todos podem ver teias estaduais"
  ON teias_estaduais FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Representantes GT podem criar teia do seu estado"
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

CREATE POLICY "Representantes GT podem atualizar teia do seu estado"
  ON teias_estaduais FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'representante_gt'
      AND u.estado_uf = teias_estaduais.estado_uf
      AND u.ativo = true
    )
  );

-- Políticas para delegacao_estado
CREATE POLICY "Todos podem ver delegações"
  ON delegacao_estado FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Representantes GT podem inscrever delegação do seu estado"
  ON delegacao_estado FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'representante_gt'
      AND u.estado_uf = delegacao_estado.estado_uf
      AND u.ativo = true
    )
  );

CREATE POLICY "Representantes GT podem atualizar delegação do seu estado"
  ON delegacao_estado FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'representante_gt'
      AND u.estado_uf = delegacao_estado.estado_uf
      AND u.ativo = true
    )
  );

-- Políticas para inscricoes_membros
CREATE POLICY "Membros podem ver própria inscrição"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (
    cpf IN (
      SELECT d.cpf FROM delegacao_estado d
      JOIN usuarios u ON u.estado_uf = d.estado_uf
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem inserir própria inscrição se estiverem na delegação"
  ON inscricoes_membros FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM delegacao_estado d
      WHERE d.id = inscricoes_membros.delegacao_id
      AND d.cpf = inscricoes_membros.cpf
      AND d.inscricao_completa = false
    )
  );

CREATE POLICY "Membros podem atualizar própria inscrição"
  ON inscricoes_membros FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM delegacao_estado d
      WHERE d.id = inscricoes_membros.delegacao_id
      AND d.cpf = inscricoes_membros.cpf
    )
  );

CREATE POLICY "Admins podem ver todas inscrições"
  ON inscricoes_membros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
      AND u.ativo = true
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_teias_estado ON teias_estaduais(estado_uf);
CREATE INDEX IF NOT EXISTS idx_teias_data ON teias_estaduais(data_inicio);
CREATE INDEX IF NOT EXISTS idx_delegacao_estado ON delegacao_estado(estado_uf);
CREATE INDEX IF NOT EXISTS idx_delegacao_cpf ON delegacao_estado(cpf);
CREATE INDEX IF NOT EXISTS idx_inscricoes_delegacao ON inscricoes_membros(delegacao_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_cpf ON inscricoes_membros(cpf);