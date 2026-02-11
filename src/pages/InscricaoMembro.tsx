import { useState, useEffect } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { Save, ArrowLeft, Upload, X, Edit2 } from 'lucide-react';

interface FormData {
  cpf: string;
  is_estrangeiro: boolean;
  passaporte: string;
  id_mapa_cultura: string;
  nome_completo: string;
  nome_mae: string;
  nome_social: string;
  nome_cracha: string;
  email: string;
  celular: string;
  faixa_etaria: string;
  nacionalidade: string;
  raca_cor_etnia: string;
  genero: string;
  orientacao_sexual: string;
  cota_representada: string; // 'ampla_participacao', 'pessoa_negra', 'pessoa_indigena', 'pessoa_com_deficiencia', 'pessoa_jovem', 'pessoa_idosa', 'lgbtqpn'
  escolaridade: string;
  pertence_comunidade_tradicional: boolean;
  comunidades_tradicionais: string[];
  comunidade_tradicional_outra: string;
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  tipo_bairro: string;
  bairro: string;
  cidade: string;
  estado_uf: string;
  cep: string;
  renda_pessoal: string;
  tipo_deficiencia: string[];
  medida_acessibilidade: string;
  nome_ponto_cultura: string;
  link_ponto_mapa_cultura: string;
  ponto_nao_esta_no_mapa: boolean;
  documento_certificacao_url: string;
  tem_id_mapa: boolean;
  id_mapa_arquivo_url: string;
  uf_ponto_cultura: string;
  cidade_ponto_cultura: string;
  acoes_estruturantes: string[];
  areas_atuacao: string[];
  como_participa_rede: string;
  grupo_trabalho_tematico: string[];
  gt_outro: string;
  preferencia_hospedagem: string;
  tem_restricao_alimentar: boolean;
  qual_restricao_alimentar: string;
  aceita_compartilhar_dados: boolean;
  aceita_email: boolean;
  aceita_telefone: boolean;
  autoriza_uso_imagem: boolean;
}

const ESTADOS_UF = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const COMUNIDADES_TRADICIONAIS = [
  'Amazônidas - Povos e comunidades de Matrizes Amazônicas', 'Andirobeiros',
  'Apanhadores de flores sempre vivas', 'Benzedeiros', 'Caboclos', 'Caiçaras',
  'Catadores de mangaba', 'Cipozeiros', 'Comunidades de fundos e fechos de pasto',
  'Comunidades de terreiro/povos e comunidades de matriz africana', 'Extrativistas',
  'Extrativistas costeiros e marinhos', 'Faxinalenses', 'Geraizeiros', 'Ilhéus',
  'Morroquianos', 'Pantaneiros', 'Pescadores artesanais', 'Povo Pomerano', 'Povos ciganos',
  'Quebradeiras de coco babaçu', 'Raizeiros', 'Retireiros do Araguaia', 'Ribeirinhos',
  'Torrãozeiro', 'Vazanteiros', 'Veredeiros'
];

const ACOES_ESTRUTURANTES = [
  'Intercâmbio e residências artístico-culturais', 'Cultura, comunicação e mídia livre',
  'Cultura e educação', 'Cultura e saúde', 'Conhecimentos tradicionais', 'Cultura digital',
  'Cultura e direitos humanos', 'Economia criativa e solidária', 'Livro, Leitura e literatura',
  'Memória e patrimônio cultural', 'Cultura e meio ambiente', 'Cultura e juventude',
  'Cultura, infância e adolescência', 'Agente cultura viva', 'Cultura circense'
];

const AREAS_ATUACAO = [
  'Acervos Públicos ou de Interesse Público', 'Animação', 'Antropologia', 'Áreas técnicas da cultura',
  'Arqueologia', 'Arquitetura e Urbanismo', 'Arquivo', 'Arte-Educação', 'Artes Cênicas', 'Arte de Rua',
  'Arte Digital', 'Arte Gráfica', 'Arte Santeira', 'Artes Clássicas', 'Artes do Espetáculo',
  'Artes Integradas', 'Artes Visuais', 'Artesanato', 'Audiovisual', 'Bandas de Congo e Ticumbi',
  'Bibliotecas', 'Caboclinho', 'Canto Coral', 'Capoeira', 'Carimbó', 'Centros de Memória',
  'Carnaval', 'Cavalo Marinho', 'Cinema', 'Ciranda', 'Circo', 'Congado', 'Conservação e Restauro',
  'Construção Civil Tradicional', 'Cultura Afro-Brasileira', 'Cultura Alimentar', 'Cultura Cigana',
  'Cultura DEF', 'Cultura Digital', 'Cultura e Comunicação', 'Cultura e Direitos Humanos',
  'Cultura e Educação', 'Cultura e Esporte', 'Cultura e Meio Ambiente', 'Cultura e Saúde',
  'Cultura LGBTQIAPN+', 'Cultura Negra', 'Cultura Popular', 'Cultura Urbana', 'Cultura Hip-Hop e Funk',
  'Cultura, Infância e Adolescência', 'Culturas dos Povos de Comunidades Tradicionais de Matriz Africana',
  'Culturas dos Povos Indígenas', 'Culturas dos Povos Nômades', 'Culturas Estrangeiras',
  'Culturas Populares e Tradicionais', 'Culturas de Povos de Terreiros', 'Culturas Quilombolas',
  'Dança', 'Dança de Salão', 'Desenho Industrial', 'Design de Moda', 'Design Gráfico',
  'Design de Interiores', 'Design Paisagístico', 'Direito Autoral', 'Escultura', 'Economia Criativa',
  'Economia da Cultura', 'Tradição Oral e Falares', 'Festas Populares', 'Festejos Juninos',
  'Feiras e Exposições', 'Filologia', 'Filosofia', 'Forró', 'Fotografia', 'Gastronomia',
  'Gestão Cultural', 'Grafite', 'Gravura', 'História e Cultura', 'Humor', 'Intercâmbio Cultural',
  'Internet Podcasting', 'Jogos Eletrônicos', 'Jongo', 'Jornais e Revistas', 'Jornalismo e Cultura',
  'Leitura', 'Lidas Campeiras', 'Linguagem', 'Línguas', 'Literatura', 'Livro',
  'Manifestações Artísticas Culturais Afro-Brasileiras', 'Maracatu', 'Memória',
  'Mídias Sociais e Mídias Interativas', 'Mídias Livres', 'Mímica', 'Moda', 'Museu', 'Museologia',
  'Música', 'Música Erudita', 'Música Instrumental', 'Música Popular', 'Novas Mídias', 'Ópera',
  'Ourivesaria', 'Paisagens culturais', 'Paradista', 'Patrimônio Cultural Imaterial',
  'Patrimônio Cultural Material', 'Patrimônio Natural', 'Performance', 'Pesca Artesanal',
  'Pesquisa em Cultura', 'Pesquisa & Desenvolvimento (P&D)', 'Pintura', 'Pintura Corporal',
  'Produção Cultural', 'Produção de Doces Tradicionais', 'Produção de Eventos', 'Quadrilha Junina',
  'Rádio', 'Reisado', 'Sítios Históricos e Arqueológicos', 'Serviços Criativos', 'Sociologia',
  'Tambor de Crioula', 'Teatro', 'Tecnologias Culturais', 'Televisão', 'Tradições', 'Turismo e Cultura',
  'Vídeo', 'Xondaro', 'Outra'
];

const GTS_TEMATICOS = [
  'GT Ação Griô', 'GT Acessibilidade', 'GT Amazônico', 'GT Audiovisual', 'GT Circo',
  'GT Comunicação/Rádio Comunitária', 'GT Cultura Digital', 'GT Cultura e Arte Negra',
  'GT Cultura Popular', 'GT Dança', 'GT Gênero', 'GT Hip Hop', 'GT Indígenas',
  'GT Integração Latino Americana', 'GT Legislação', 'GT Matriz Africana', 'GT Música',
  'GT Patrimônio Imaterial e Tradicional', 'GT Rurais', 'GT Pontões e Redes',
  'GT Sustentabilidade', 'GT Teatro', 'Outro'
];

interface InscricaoMembroProps {
  usuario: Usuario | null;
  onBack?: () => void;
}

export default function InscricaoMembro({ usuario, onBack }: InscricaoMembroProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState('');
  const [requireLogin, setRequireLogin] = useState(false);
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState<any>(null);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [uploadingIdMapa, setUploadingIdMapa] = useState(false);
  const [idMapaFile, setIdMapaFile] = useState<File | null>(null);
  const [uploadingCertificacao, setUploadingCertificacao] = useState(false);
  const [certificacaoFile, setCertificacaoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cpf: '',
    is_estrangeiro: false,
    passaporte: '',
    id_mapa_cultura: '',
    nome_completo: '',
    nome_mae: '',
    nome_social: '',
    nome_cracha: '',
    email: '',
    celular: '',
    faixa_etaria: '',
    nacionalidade: '',
    raca_cor_etnia: '',
    genero: '',
    orientacao_sexual: '',
    cota_representada: '',
    escolaridade: '',
    pertence_comunidade_tradicional: false,
    comunidades_tradicionais: [],
    comunidade_tradicional_outra: '',
    tipo_logradouro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    tipo_bairro: '',
    bairro: '',
    cidade: '',
    estado_uf: '',
    cep: '',
    renda_pessoal: '',
    tipo_deficiencia: [],
    medida_acessibilidade: '',
    nome_ponto_cultura: '',
    link_ponto_mapa_cultura: '',
    ponto_nao_esta_no_mapa: false,
    documento_certificacao_url: '',
    tem_id_mapa: false,
    id_mapa_arquivo_url: '',
    uf_ponto_cultura: '',
    cidade_ponto_cultura: '',
    acoes_estruturantes: [],
    areas_atuacao: [],
    como_participa_rede: '',
    grupo_trabalho_tematico: [],
    gt_outro: '',
    preferencia_hospedagem: '',
    tem_restricao_alimentar: false,
    qual_restricao_alimentar: '',
    aceita_compartilhar_dados: false,
    aceita_email: false,
    aceita_telefone: false,
    autoriza_uso_imagem: false,
  });

  useEffect(() => {
    loadExistingData();
  }, [usuario]);

  useEffect(() => {
    const participanteCpf = localStorage.getItem('participante_cpf');
    if (participanteCpf && formData.cpf) {
      const autosaveKey = `inscricao_autosave_${participanteCpf}`;
      localStorage.setItem(autosaveKey, JSON.stringify(formData));
    }
  }, [formData]);

  const loadExistingData = async () => {
    try {
      // Verificar se é admin/representante editando
      const editandoAdminId = localStorage.getItem('inscricao_editando_admin');

      // Se não é admin editando, verificar se é participante validado
      if (!editandoAdminId) {
        // Participante acessando - verificar validação tripla
        const validacaoOk = localStorage.getItem('validacao_tripla_ok');
        const participanteCpf = localStorage.getItem('participante_cpf');
        const participanteNome = localStorage.getItem('participante_nome');
        const participanteNomeMae = localStorage.getItem('participante_nome_mae');

        if (validacaoOk !== 'true' || !participanteCpf || !participanteNome || !participanteNomeMae) {
          console.error('Validação tripla não realizada - bloqueando acesso');
          setLoadingData(false);
          setAcessoNegado(true);
          return;
        }

        console.log('Participante validado - carregando formulário');
      } else if (!usuario) {
        // Admin/representante editando mas não logado
        setLoadingData(false);
        setRequireLogin(true);
        return;
      }

      if (editandoAdminId) {
        // Admin/representante editando - carregar pelo ID da delegação
        const { data: delegacao, error: delegacaoError } = await supabase
          .from('delegacao_estado')
          .select('*')
          .eq('id', editandoAdminId)
          .single();

        if (delegacaoError || !delegacao) {
          console.error('Erro ao carregar delegação:', delegacaoError);
          setLoadingData(false);
          setAcessoNegado(true);
          return;
        }

        setInscricaoSelecionada(delegacao);

        const { data: inscricao } = await supabase
          .from('inscricoes_membros')
          .select('*')
          .eq('delegacao_id', editandoAdminId)
          .maybeSingle();

        if (inscricao) {
          // Mapear dados da inscrição para o formulário
          const cotasArray = inscricao.cota_desejada || [];

          // Determinar cota representada (priorizar cotas mais específicas)
          let cotaRepresentada = '';
          if (cotasArray.includes('pessoa_negra')) cotaRepresentada = 'pessoa_negra';
          else if (cotasArray.includes('pessoa_indigena')) cotaRepresentada = 'pessoa_indigena';
          else if (cotasArray.includes('pessoa_com_deficiencia') || cotasArray.includes('pessoa_deficiencia')) cotaRepresentada = 'pessoa_com_deficiencia';
          else if (cotasArray.includes('pessoa_jovem')) cotaRepresentada = 'pessoa_jovem';
          else if (cotasArray.includes('pessoa_idosa')) cotaRepresentada = 'pessoa_idosa';
          else if (cotasArray.includes('lgbtqpn') || cotasArray.includes('lgbtqiapn')) cotaRepresentada = 'lgbtqpn';
          else if (cotasArray.includes('ampla_participacao') || cotasArray.includes('ampla_concorrencia')) cotaRepresentada = 'ampla_participacao';

          setFormData({
            cpf: inscricao.cpf,
            is_estrangeiro: !!inscricao.passaporte,
            passaporte: inscricao.passaporte || '',
            id_mapa_cultura: '',
            nome_completo: inscricao.nome_completo,
            nome_mae: inscricao.nome_mae || '',
            nome_social: inscricao.nome_social || '',
            nome_cracha: inscricao.nome_cracha,
            email: inscricao.email,
            celular: inscricao.celular,
            faixa_etaria: inscricao.faixa_etaria || '',
            nacionalidade: inscricao.nacionalidade || '',
            raca_cor_etnia: inscricao.raca_cor_etnia || '',
            genero: inscricao.genero || '',
            orientacao_sexual: inscricao.orientacao_sexual || '',
            cota_representada: cotaRepresentada,
            escolaridade: inscricao.escolaridade || '',
            pertence_comunidade_tradicional: inscricao.comunidade_tradicional || false,
            comunidades_tradicionais: inscricao.comunidades_tradicionais || [],
            comunidade_tradicional_outra: inscricao.comunidade_tradicional_outra || '',
            tipo_logradouro: inscricao.logradouro_tipo || '',
            logradouro: inscricao.logradouro_nome || '',
            numero: inscricao.numero || '',
            complemento: inscricao.complemento || '',
            tipo_bairro: inscricao.bairro_tipo || '',
            bairro: inscricao.bairro_nome || '',
            cidade: inscricao.cidade || '',
            estado_uf: inscricao.estado_uf || '',
            cep: inscricao.cep || '',
            renda_pessoal: inscricao.renda_pessoal || '',
            tipo_deficiencia: inscricao.pessoa_com_deficiencia || [],
            medida_acessibilidade: inscricao.medida_acessibilidade || '',
            nome_ponto_cultura: inscricao.nome_ponto_cultura,
            link_ponto_mapa_cultura: inscricao.link_mapa_cultura_viva || '',
            ponto_nao_esta_no_mapa: false,
            documento_certificacao_url: inscricao.documento_certificacao || '',
            tem_id_mapa: inscricao.tem_id_mapa || false,
            id_mapa_arquivo_url: inscricao.id_mapa_arquivo_url || '',
            uf_ponto_cultura: inscricao.uf_ponto,
            cidade_ponto_cultura: inscricao.cidade_ponto,
            acoes_estruturantes: inscricao.acoes_estruturantes || [],
            areas_atuacao: inscricao.area_atuacao_principal || [],
            como_participa_rede: inscricao.como_participa_rede || '',
            grupo_trabalho_tematico: Array.isArray(inscricao.gt_tematico_escolhido) ? inscricao.gt_tematico_escolhido : (inscricao.gt_tematico_escolhido ? [inscricao.gt_tematico_escolhido] : []),
            gt_outro: inscricao.gt_tematico_outro || '',
            preferencia_hospedagem: inscricao.tipo_acomodacao || '',
            tem_restricao_alimentar: inscricao.restricao_alimentar || false,
            qual_restricao_alimentar: inscricao.descricao_restricao || '',
            aceita_compartilhar_dados: inscricao.aceita_compartilhar_dados || false,
            aceita_email: inscricao.aceita_email || false,
            aceita_telefone: inscricao.aceita_telefone || false,
            autoriza_uso_imagem: inscricao.autoriza_uso_imagem || false,
          });
        } else {
          // Nova inscrição - preencher com dados da delegação
          setFormData({
            ...formData,
            nome_completo: delegacao.nome_completo,
            cpf: delegacao.cpf,
            estado_uf: delegacao.estado_uf,
            nome_ponto_cultura: delegacao.nome_ponto_cultura,
            email: delegacao.email,
            celular: delegacao.contato_whatsapp,
            cidade: delegacao.cidade,
            uf_ponto_cultura: delegacao.estado_uf,
            cidade_ponto_cultura: delegacao.cidade,
          });
          setIsEditing(true);
        }

        setLoadingData(false);
        return;
      }

      // Fluxo normal - participante editando própria inscrição
      // Usar a inscrição já selecionada no login
      const inscricaoSelecionadaStr = localStorage.getItem('inscricao_selecionada');

      if (!inscricaoSelecionadaStr) {
        console.error('Nenhuma inscrição selecionada');
        setLoadingData(false);
        setAcessoNegado(true);
        return;
      }

      const delegacao = JSON.parse(inscricaoSelecionadaStr);
      console.log('Delegação carregada do localStorage:', delegacao);

      setInscricaoSelecionada(delegacao);

      // Buscar inscrição existente
      const { data: inscricao } = await supabase
        .from('inscricoes_membros')
        .select('*')
        .eq('delegacao_id', delegacao.id)
        .maybeSingle();

      if (inscricao) {
        // Mapear dados da inscrição para o formulário
        const cotasArray = inscricao.cota_desejada || [];

        // Determinar cota representada (priorizar cotas mais específicas)
        let cotaRepresentada = '';
        if (cotasArray.includes('pessoa_negra')) cotaRepresentada = 'pessoa_negra';
        else if (cotasArray.includes('pessoa_indigena')) cotaRepresentada = 'pessoa_indigena';
        else if (cotasArray.includes('pessoa_com_deficiencia') || cotasArray.includes('pessoa_deficiencia')) cotaRepresentada = 'pessoa_com_deficiencia';
        else if (cotasArray.includes('pessoa_jovem')) cotaRepresentada = 'pessoa_jovem';
        else if (cotasArray.includes('pessoa_idosa')) cotaRepresentada = 'pessoa_idosa';
        else if (cotasArray.includes('lgbtqpn') || cotasArray.includes('lgbtqiapn')) cotaRepresentada = 'lgbtqpn';
        else if (cotasArray.includes('ampla_participacao') || cotasArray.includes('ampla_concorrencia')) cotaRepresentada = 'ampla_participacao';

        setFormData({
          cpf: inscricao.cpf,
          is_estrangeiro: !!inscricao.passaporte,
          passaporte: inscricao.passaporte || '',
          id_mapa_cultura: '',
          nome_completo: inscricao.nome_completo,
          nome_mae: inscricao.nome_mae || '',
          nome_social: inscricao.nome_social || '',
          nome_cracha: inscricao.nome_cracha,
          email: inscricao.email,
          celular: inscricao.celular,
          faixa_etaria: inscricao.faixa_etaria || '',
          nacionalidade: inscricao.nacionalidade || '',
          raca_cor_etnia: inscricao.raca_cor_etnia || '',
          genero: inscricao.genero || '',
          orientacao_sexual: inscricao.orientacao_sexual || '',
          cota_representada: cotaRepresentada,
          escolaridade: inscricao.escolaridade || '',
          pertence_comunidade_tradicional: inscricao.comunidade_tradicional || false,
          comunidades_tradicionais: inscricao.comunidades_tradicionais || [],
          comunidade_tradicional_outra: inscricao.comunidade_tradicional_outra || '',
          tipo_logradouro: inscricao.logradouro_tipo || '',
          logradouro: inscricao.logradouro_nome || '',
          numero: inscricao.numero || '',
          complemento: inscricao.complemento || '',
          tipo_bairro: inscricao.bairro_tipo || '',
          bairro: inscricao.bairro_nome || '',
          cidade: inscricao.cidade || '',
          estado_uf: inscricao.estado_uf || '',
          cep: inscricao.cep || '',
          renda_pessoal: inscricao.renda_pessoal || '',
          tipo_deficiencia: inscricao.pessoa_com_deficiencia || [],
          medida_acessibilidade: inscricao.medida_acessibilidade || '',
          nome_ponto_cultura: inscricao.nome_ponto_cultura,
          link_ponto_mapa_cultura: inscricao.link_mapa_cultura_viva || '',
          ponto_nao_esta_no_mapa: false,
          documento_certificacao_url: inscricao.documento_certificacao || '',
          tem_id_mapa: inscricao.tem_id_mapa || false,
          id_mapa_arquivo_url: inscricao.id_mapa_arquivo_url || '',
          uf_ponto_cultura: inscricao.uf_ponto,
          cidade_ponto_cultura: inscricao.cidade_ponto,
          acoes_estruturantes: inscricao.acoes_estruturantes || [],
          areas_atuacao: inscricao.area_atuacao_principal || [],
          como_participa_rede: inscricao.como_participa_rede || '',
          grupo_trabalho_tematico: Array.isArray(inscricao.gt_tematico_escolhido) ? inscricao.gt_tematico_escolhido : (inscricao.gt_tematico_escolhido ? [inscricao.gt_tematico_escolhido] : []),
          gt_outro: inscricao.gt_tematico_outro || '',
          preferencia_hospedagem: inscricao.tipo_acomodacao || '',
          tem_restricao_alimentar: inscricao.restricao_alimentar || false,
          qual_restricao_alimentar: inscricao.descricao_restricao || '',
          aceita_compartilhar_dados: inscricao.aceita_compartilhar_dados || false,
          aceita_email: inscricao.aceita_email || false,
          aceita_telefone: inscricao.aceita_telefone || false,
          autoriza_uso_imagem: inscricao.autoriza_uso_imagem || false,
        });
      } else {
        // Nova inscrição - preencher com dados da delegação
        setFormData({
          ...formData,
          nome_completo: delegacao.nome_completo,
          cpf: delegacao.cpf,
          nome_mae: delegacao.nome_mae || '',
          estado_uf: delegacao.estado_uf,
          nome_ponto_cultura: delegacao.nome_ponto_cultura,
          email: delegacao.email,
          celular: delegacao.contato_whatsapp,
          cidade: delegacao.cidade,
          uf_ponto_cultura: delegacao.estado_uf,
          cidade_ponto_cultura: delegacao.cidade,
        });
        setIsEditing(true);
      }

      const participanteCpf = localStorage.getItem('participante_cpf');
      if (participanteCpf && !editandoAdminId) {
        const autosaveKey = `inscricao_autosave_${participanteCpf}`;
        const savedData = localStorage.getItem(autosaveKey);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setFormData(parsedData);
            console.log('Dados do formulário recuperados do auto-save');
          } catch (error) {
            console.error('Erro ao recuperar dados do auto-save:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const inputClassName = `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) {
      setMessage('Clique em "Editar Inscrição" para modificar os dados.');
      return;
    }

    if (!inscricaoSelecionada) return;

    if (formData.grupo_trabalho_tematico.length === 0) {
      setMessage('Por favor, selecione pelo menos um Grupo Temático.');
      return;
    }

    if (formData.grupo_trabalho_tematico.includes('Outro') && !formData.gt_outro.trim()) {
      setMessage('Por favor, especifique o outro Grupo Temático.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Mapear campos do FormData para o schema do banco
      const cotasArray = [];

      // Adicionar cota representada
      if (formData.cota_representada) {
        cotasArray.push(formData.cota_representada);
      }

      const inscricaoData = {
        delegacao_id: inscricaoSelecionada.id,
        cpf: formData.cpf,
        passaporte: formData.is_estrangeiro ? formData.passaporte : null,
        nome_completo: formData.nome_completo,
        nome_mae: formData.nome_mae,
        nome_social: formData.nome_social || null,
        nome_cracha: formData.nome_cracha,
        email: formData.email,
        celular: formData.celular,
        faixa_etaria: formData.faixa_etaria || null,
        nacionalidade: formData.nacionalidade || null,
        raca_cor_etnia: formData.raca_cor_etnia || null,
        genero: formData.genero || null,
        orientacao_sexual: formData.orientacao_sexual || null,
        cota_desejada: cotasArray,
        escolaridade: formData.escolaridade || null,
        comunidade_tradicional: formData.pertence_comunidade_tradicional,
        comunidades_tradicionais: formData.comunidades_tradicionais,
        comunidade_tradicional_outra: formData.comunidade_tradicional_outra || null,
        logradouro_tipo: formData.tipo_logradouro || null,
        logradouro_nome: formData.logradouro || null,
        numero: formData.numero || null,
        complemento: formData.complemento || null,
        bairro_tipo: formData.tipo_bairro || null,
        bairro_nome: formData.bairro || null,
        cidade: formData.cidade || null,
        estado_uf: formData.estado_uf || null,
        cep: formData.cep || null,
        renda_pessoal: formData.renda_pessoal || null,
        pessoa_com_deficiencia: formData.tipo_deficiencia,
        medida_acessibilidade: formData.medida_acessibilidade || null,
        nome_ponto_cultura: formData.nome_ponto_cultura,
        link_mapa_cultura_viva: formData.link_ponto_mapa_cultura || null,
        documento_certificacao: formData.documento_certificacao_url || null,
        tem_id_mapa: formData.tem_id_mapa,
        id_mapa_arquivo_url: formData.id_mapa_arquivo_url || null,
        uf_ponto: formData.uf_ponto_cultura,
        cidade_ponto: formData.cidade_ponto_cultura,
        acoes_estruturantes: formData.acoes_estruturantes,
        area_atuacao_principal: formData.areas_atuacao,
        como_participa_rede: formData.como_participa_rede || null,
        gt_tematico_escolhido: Array.isArray(formData.grupo_trabalho_tematico)
          ? formData.grupo_trabalho_tematico
          : (formData.grupo_trabalho_tematico ? [formData.grupo_trabalho_tematico] : []),
        gt_tematico_outro: formData.gt_outro || null,
        tipo_acomodacao: formData.preferencia_hospedagem || null,
        restricao_alimentar: formData.tem_restricao_alimentar,
        descricao_restricao: formData.tem_restricao_alimentar ? formData.qual_restricao_alimentar : null,
        aceita_compartilhar_dados: formData.aceita_compartilhar_dados,
        aceita_email: formData.aceita_email,
        aceita_telefone: formData.aceita_telefone,
        autoriza_uso_imagem: formData.autoriza_uso_imagem,
      };

      const { error } = await supabase
        .from('inscricoes_membros')
        .upsert(inscricaoData, {
          onConflict: 'delegacao_id'
        });

      if (error) throw error;

      // Usar data local no formato YYYY-MM-DD para evitar problemas de fuso horário
      const hoje = new Date();
      const dataLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

      const { error: updateError } = await supabase
        .from('delegacao_estado')
        .update({
          nome_completo: formData.nome_completo,
          nome_mae: formData.nome_mae,
          cota_representada: formData.cota_representada,
          inscricao_completa: true,
          data_validacao: dataLocal
        })
        .eq('id', inscricaoSelecionada.id);

      if (updateError) throw updateError;

      setMessage('Inscrição salva com sucesso! Redirecionando...');
      setIsEditing(false);

      // Limpar dados do localStorage e redirecionar para página de delegação
      // Garantir redirecionamento tanto para nova inscrição quanto para edição
      setTimeout(() => {
        const participanteCpf = localStorage.getItem('participante_cpf');
        if (participanteCpf) {
          localStorage.removeItem(`inscricao_autosave_${participanteCpf}`);
        }
        localStorage.removeItem('validacao_tripla_ok');
        localStorage.removeItem('participante_cpf');
        localStorage.removeItem('participante_nome');
        localStorage.removeItem('participante_nome_mae');
        localStorage.removeItem('participante_inscricoes');
        localStorage.removeItem('inscricao_selecionada');

        // Forçar redirecionamento
        window.location.hash = 'participantes-teia';

        // Recarregar a página para garantir que o estado seja limpo
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 2000);
    } catch (error: any) {
      setMessage(`Erro ao salvar inscrição: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (requireLogin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Necessário</h2>
          <p className="text-gray-600 mb-6">
            Para preencher o formulário de inscrição, você precisa fazer login como Participante Teia/Fórum Inscrito.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  if (acessoNegado) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você precisa realizar a validação de identidade tripla (nome completo, CPF e nome da mãe) para acessar o formulário de inscrição.
          </p>
          <a
            href="#validacao-identidade"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Validar Minha Identidade
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-xl shadow-lg p-8 text-white">
        <button
          onClick={() => {
            localStorage.removeItem('validacao_tripla_ok');
            localStorage.removeItem('participante_cpf');
            localStorage.removeItem('participante_nome');
            localStorage.removeItem('participante_nome_mae');
            localStorage.removeItem('participante_inscricoes');
            localStorage.removeItem('inscricao_selecionada');
            window.location.hash = 'participantes-teia';
          }}
          className="mb-4 flex items-center gap-2 text-white hover:text-teal-100 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar para Delegação Teia 2026</span>
        </button>
        <h1 className="text-4xl font-bold mb-4">Inscrições Teia 2026</h1>
        <p className="text-xl text-teal-50">Complete todos os campos obrigatórios para finalizar sua inscrição</p>
      </div>

      {!isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Modo de Visualização</h2>
              <p className="text-gray-600">Clique em "Editar Inscrição" para modificar os dados</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Edit2 className="h-5 w-5" />
              Editar Inscrição
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Edit2 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-1">Modo de Edição Ativo</h3>
              <p className="text-amber-800">Você está editando a inscrição. Lembre-se de salvar as alterações no final da página.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        <fieldset disabled={!isEditing} className="space-y-8">
        {/* Informações Pessoais */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Informações Pessoais
          </h2>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_estrangeiro}
                  onChange={(e) => setFormData({ ...formData, is_estrangeiro: e.target.checked })}
                  disabled={!isEditing}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Estrangeiro</span>
              </label>
            </div>

            {!formData.is_estrangeiro ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={!formData.is_estrangeiro}
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="000.000.000-00"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passaporte <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={formData.is_estrangeiro}
                  value={formData.passaporte}
                  onChange={(e) => setFormData({ ...formData, passaporte: e.target.value })}
                  disabled={!isEditing}
                  className={inputClassName}
                />
              </div>
            )}


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                disabled={!isEditing}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Mãe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nome_mae}
                onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                disabled={!isEditing}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Social (para pessoas trans)
              </label>
              <input
                type="text"
                value={formData.nome_social}
                onChange={(e) => setFormData({ ...formData, nome_social: e.target.value })}
                disabled={!isEditing}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome para Crachá <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nome_cracha}
                onChange={(e) => setFormData({ ...formData, nome_cracha: e.target.value })}
                disabled={!isEditing}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Celular <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa Etária
              </label>
              <select
                value={formData.faixa_etaria}
                onChange={(e) => setFormData({ ...formData, faixa_etaria: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="ate_19">Até 19 anos</option>
                <option value="20_29">20 a 29 anos</option>
                <option value="30_39">30 a 39 anos</option>
                <option value="40_49">40 a 49 anos</option>
                <option value="50_59">50 a 59 anos</option>
                <option value="acima_60">Acima de 60 anos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidade
              </label>
              <select
                value={formData.nacionalidade}
                onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="brasileiro">Brasileiro(a)</option>
                <option value="brasileiro_naturalizado">Brasileiro(a) naturalizado(a)</option>
                <option value="estrangeiro">Estrangeiro(a)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raça, Cor ou Etnia <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.raca_cor_etnia}
                onChange={(e) => setFormData({ ...formData, raca_cor_etnia: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="amarela">Amarela</option>
                <option value="branca">Branca</option>
                <option value="indigena">Indígena</option>
                <option value="parda">Parda</option>
                <option value="preta">Preta</option>
                <option value="quilombola">Quilombola</option>
                <option value="prefiro_nao_declarar">Prefiro não declarar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero <span className="text-red-500">*</span>
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Cisgênero: identidade de gênero corresponde ao gênero atribuído no nascimento<br/>
                Transexual: identidade diferente do gênero atribuído no nascimento<br/>
                Não-binário: identidade não se limita a masculino/feminino
              </div>
              <select
                required
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="mulher_cis">Mulher Cis</option>
                <option value="homem_cis">Homem Cis</option>
                <option value="mulher_trans_travesti">Mulher Trans/Travesti</option>
                <option value="homem_trans">Homem Trans</option>
                <option value="nao_binarie">Não Binárie/outra variabilidade</option>
                <option value="nao_declarada">Não declarada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientação Sexual <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.orientacao_sexual}
                onChange={(e) => setFormData({ ...formData, orientacao_sexual: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="lesbica">Lésbica</option>
                <option value="gay">Gay</option>
                <option value="bissexual">Bissexual</option>
                <option value="heterossexual">Heterossexual</option>
                <option value="assexual">Assexual</option>
                <option value="outra">Outra</option>
                <option value="prefiro_nao_declarar">Prefiro não declarar</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cotas */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Cotas para Delegação
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Sua indicação como delegado(a) foi em quais classificações de cota?
          </p>

          {/* Cota Representada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cota Representada (escolha uma opção) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'ampla_participacao', label: 'Ampla Participação' },
                { value: 'pessoa_negra', label: 'Pessoa Negra' },
                { value: 'pessoa_indigena', label: 'Pessoa de Povos Originários' },
                { value: 'pessoa_com_deficiencia', label: 'Pessoa com Deficiência' },
                { value: 'pessoa_jovem', label: 'Pessoa Jovem (15 a 29 anos)' },
                { value: 'pessoa_idosa', label: 'Pessoa Idosa (mais de 60 anos)' },
                { value: 'lgbtqpn', label: 'LGBTQPN+' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cota_representada"
                    value={value}
                    checked={formData.cota_representada === value}
                    onChange={(e) => setFormData({ ...formData, cota_representada: e.target.value })}
                    className="border-gray-300"
                    required
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Escolaridade */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Escolaridade
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolaridade <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.escolaridade}
              onChange={(e) => setFormData({ ...formData, escolaridade: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="sem_educacao_formal">Sem educação formal</option>
              <option value="fundamental_incompleto">Ensino fundamental incompleto</option>
              <option value="fundamental_completo">Ensino fundamental completo</option>
              <option value="medio_incompleto">Ensino médio incompleto</option>
              <option value="medio_completo">Ensino médio completo</option>
              <option value="superior_incompleto">Ensino superior incompleto</option>
              <option value="superior_completo">Ensino superior completo</option>
              <option value="tecnico_incompleto">Curso técnico incompleto</option>
              <option value="tecnico_completo">Curso técnico completo</option>
              <option value="especializacao_incompleta">Especialização/residência incompleta</option>
              <option value="especializacao_completa">Especialização/residência completa</option>
              <option value="mestrado_incompleto">Mestrado incompleto</option>
              <option value="mestrado_completo">Mestrado completo</option>
              <option value="doutorado_incompleto">Doutorado incompleto</option>
              <option value="doutorado_completo">Doutorado completo</option>
            </select>
          </div>
        </section>

        {/* Comunidade Tradicional */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Comunidade Tradicional
          </h2>
          <div className="space-y-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Pertence a uma comunidade tradicional?
              </label>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pertence_comunidade_tradicional"
                    checked={!formData.pertence_comunidade_tradicional}
                    onChange={() => setFormData({ ...formData, pertence_comunidade_tradicional: false, comunidades_tradicionais: [] })}
                    className="border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Não</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pertence_comunidade_tradicional"
                    checked={formData.pertence_comunidade_tradicional}
                    onChange={() => setFormData({ ...formData, pertence_comunidade_tradicional: true })}
                    className="border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Sim</span>
                </label>
              </div>

              {formData.pertence_comunidade_tradicional && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quais comunidades tradicionais? (escolha até 5)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
                    {COMUNIDADES_TRADICIONAIS.map(comunidade => (
                      <label key={comunidade} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.comunidades_tradicionais.includes(comunidade)}
                          onChange={(e) => {
                            const atual = formData.comunidades_tradicionais;
                            if (e.target.checked && atual.length < 5) {
                              setFormData({ ...formData, comunidades_tradicionais: [...atual, comunidade] });
                            } else if (!e.target.checked) {
                              setFormData({ ...formData, comunidades_tradicionais: atual.filter(c => c !== comunidade) });
                            }
                          }}
                          className="rounded border-gray-300"
                          disabled={!formData.comunidades_tradicionais.includes(comunidade) && formData.comunidades_tradicionais.length >= 5}
                        />
                        <span className="text-sm text-gray-700">{comunidade}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.comunidades_tradicionais.length}/5 selecionadas
                  </p>
                </div>
              )}

              {formData.pertence_comunidade_tradicional && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outras (especifique se a sua comunidade não está na lista)
                  </label>
                  <input
                    type="text"
                    value={formData.comunidade_tradicional_outra}
                    onChange={(e) => setFormData({ ...formData, comunidade_tradicional_outra: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Digite o nome da comunidade tradicional"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Endereço Pessoal
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipo_logradouro}
                  onChange={(e) => setFormData({ ...formData, tipo_logradouro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Rua">Rua</option>
                  <option value="Avenida">Avenida</option>
                  <option value="Alameda">Alameda</option>
                  <option value="Praça">Praça</option>
                  <option value="Travessa">Travessa</option>
                  <option value="Estrada">Estrada</option>
                  <option value="Fazenda">Fazenda</option>
                  <option value="Quilombo">Quilombo</option>
                  <option value="Viela">Viela</option>
                  <option value="Rodovia">Rodovia</option>
                  <option value="Beco">Beco</option>
                  <option value="Largo">Largo</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logradouro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.logradouro}
                  onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipo_bairro}
                  onChange={(e) => setFormData({ ...formData, tipo_bairro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Bairro">Bairro</option>
                  <option value="Zona">Zona</option>
                  <option value="Distrito">Distrito</option>
                  <option value="Setor">Setor</option>
                  <option value="Região">Região</option>
                  <option value="Vila">Vila</option>
                  <option value="Comunidade">Comunidade</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.estado_uf}
                  onChange={(e) => setFormData({ ...formData, estado_uf: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_UF.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Renda e Deficiência */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Renda e Deficiência
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renda Pessoal <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.renda_pessoal}
                onChange={(e) => setFormData({ ...formData, renda_pessoal: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="1_500">R$ 1,00 a 500,00</option>
                <option value="501_1000">R$ 501,00 a 1.000,00</option>
                <option value="1001_2000">R$ 1.001,00 a 2.000,00</option>
                <option value="2001_3000">R$ 2.001,00 a 3.000,00</option>
                <option value="3001_4000">R$ 3.001,00 a 4.000,00</option>
                <option value="4001_5000">R$ 4.001,00 a 5.000,00</option>
                <option value="5001_10000">R$ 5.001,00 a 10.000,00</option>
                <option value="10001_20000">R$ 10.001,00 a 20.000,00</option>
                <option value="21000_100000">R$ 21.000,00 a 100.000,00</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pessoa com deficiência
              </label>
              <div className="space-y-2">
                {[
                  { value: 'fisica', label: 'Física' },
                  { value: 'auditiva', label: 'Auditiva' },
                  { value: 'visual', label: 'Visual' },
                  { value: 'intelectual', label: 'Intelectual' },
                  { value: 'transtorno_mental', label: 'Transtorno Mental' },
                  { value: 'neurodiversa', label: 'Pessoa Neurodiversa (Autismo, TDAH, dislexia, outra)' },
                  { value: 'multipla', label: 'Múltipla' },
                  { value: 'nao_sou_pcd', label: 'Não sou pessoa com deficiência' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.tipo_deficiencia.includes(value)}
                      onChange={() => handleArrayToggle('tipo_deficiencia', value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.tipo_deficiencia.length > 0 && !formData.tipo_deficiencia.includes('nao_sou_pcd') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual medida de acessibilidade necessária?
                </label>
                <textarea
                  value={formData.medida_acessibilidade}
                  onChange={(e) => setFormData({ ...formData, medida_acessibilidade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}
          </div>
        </section>

        {/* Ponto de Cultura */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Informações do Ponto de Cultura
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Ponto de Cultura
              </label>
              <input
                type="text"
                value={formData.nome_ponto_cultura}
                onChange={(e) => setFormData({ ...formData, nome_ponto_cultura: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link do Ponto no Mapa Cultura Viva
              </label>
              <input
                type="url"
                value={formData.link_ponto_mapa_cultura}
                onChange={(e) => setFormData({ ...formData, link_ponto_mapa_cultura: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* ID do Mapa */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Possui ID do Mapa?
              </label>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tem_id_mapa"
                    checked={!formData.tem_id_mapa}
                    onChange={() => setFormData({ ...formData, tem_id_mapa: false, id_mapa_arquivo_url: '' })}
                    className="border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Não tenho</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tem_id_mapa"
                    checked={formData.tem_id_mapa}
                    onChange={() => setFormData({ ...formData, tem_id_mapa: true })}
                    className="border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Tenho</span>
                </label>
              </div>

              {formData.tem_id_mapa && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload do ID do Mapa (PNG ou PDF)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 cursor-pointer border border-teal-200 transition-colors">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm font-medium">Escolher Arquivo</span>
                        <input
                          type="file"
                          accept=".png,.pdf,image/png,application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (!file.type.match(/^(image\/png|application\/pdf)$/)) {
                              setMessage('Apenas arquivos PNG ou PDF são permitidos');
                              return;
                            }

                            if (file.size > 10485760) {
                              setMessage('O arquivo deve ter no máximo 10MB');
                              return;
                            }

                            setIdMapaFile(file);
                            setUploadingIdMapa(true);
                            setMessage('');

                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                              const filePath = `${fileName}`;

                              const { error: uploadError } = await supabase.storage
                                .from('id-mapa')
                                .upload(filePath, file);

                              if (uploadError) throw uploadError;

                              const { data: { publicUrl } } = supabase.storage
                                .from('id-mapa')
                                .getPublicUrl(filePath);

                              setFormData({ ...formData, id_mapa_arquivo_url: publicUrl });
                              setMessage('Arquivo enviado com sucesso!');
                            } catch (error: any) {
                              setMessage(`Erro ao fazer upload: ${error.message}`);
                              setIdMapaFile(null);
                            } finally {
                              setUploadingIdMapa(false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {uploadingIdMapa && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos aceitos: PNG ou PDF (máximo 10MB)
                    </p>
                  </div>

                  {formData.id_mapa_arquivo_url && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Arquivo carregado</p>
                        <a
                          href={formData.id_mapa_arquivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline break-all"
                        >
                          {formData.id_mapa_arquivo_url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, id_mapa_arquivo_url: '' });
                          setIdMapaFile(null);
                        }}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-green-700" />
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ou cole um link/URL
                    </label>
                    <input
                      type="text"
                      value={formData.id_mapa_arquivo_url}
                      onChange={(e) => setFormData({ ...formData, id_mapa_arquivo_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Cole o link/URL do arquivo"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.ponto_nao_esta_no_mapa}
                onChange={(e) => setFormData({ ...formData, ponto_nao_esta_no_mapa: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Meu Ponto ainda não está no mapa</span>
            </label>

            {formData.ponto_nao_esta_no_mapa && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento do resultado final do Edital que certificou seu Ponto de Cultura (PDF)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 cursor-pointer border border-teal-200 transition-colors">
                      <Upload className="h-5 w-5" />
                      <span className="text-sm font-medium">Escolher Arquivo PDF</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.type !== 'application/pdf') {
                            setMessage('Apenas arquivos PDF são permitidos');
                            return;
                          }

                          if (file.size > 10485760) {
                            setMessage('O arquivo deve ter no máximo 10MB');
                            return;
                          }

                          setCertificacaoFile(file);
                          setUploadingCertificacao(true);
                          setMessage('');

                          try {
                            const fileName = `certificacao-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
                            const filePath = `${fileName}`;

                            const { error: uploadError } = await supabase.storage
                              .from('id-mapa')
                              .upload(filePath, file);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('id-mapa')
                              .getPublicUrl(filePath);

                            setFormData({ ...formData, documento_certificacao_url: publicUrl });
                            setMessage('Documento enviado com sucesso!');
                          } catch (error: any) {
                            setMessage(`Erro ao fazer upload: ${error.message}`);
                            setCertificacaoFile(null);
                          } finally {
                            setUploadingCertificacao(false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {uploadingCertificacao && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Formato aceito: PDF (máximo 10MB)
                  </p>
                </div>

                {formData.documento_certificacao_url && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Documento carregado</p>
                      <a
                        href={formData.documento_certificacao_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline break-all"
                      >
                        {formData.documento_certificacao_url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, documento_certificacao_url: '' });
                        setCertificacaoFile(null);
                      }}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-green-700" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ou cole um link/URL
                  </label>
                  <input
                    type="text"
                    value={formData.documento_certificacao_url}
                    onChange={(e) => setFormData({ ...formData, documento_certificacao_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Cole o link/URL do documento"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UF do Ponto de Cultura
                </label>
                <select
                  value={formData.uf_ponto_cultura}
                  onChange={(e) => setFormData({ ...formData, uf_ponto_cultura: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_UF.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade do Ponto de Cultura
                </label>
                <input
                  type="text"
                  value={formData.cidade_ponto_cultura}
                  onChange={(e) => setFormData({ ...formData, cidade_ponto_cultura: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                3 principais ações estruturantes (escolha até 3)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {ACOES_ESTRUTURANTES.map(acao => (
                  <label key={acao} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.acoes_estruturantes.includes(acao)}
                      onChange={() => {
                        if (formData.acoes_estruturantes.includes(acao)) {
                          setFormData({
                            ...formData,
                            acoes_estruturantes: formData.acoes_estruturantes.filter(a => a !== acao)
                          });
                        } else if (formData.acoes_estruturantes.length < 3) {
                          setFormData({
                            ...formData,
                            acoes_estruturantes: [...formData.acoes_estruturantes, acao]
                          });
                        }
                      }}
                      disabled={!formData.acoes_estruturantes.includes(acao) && formData.acoes_estruturantes.length >= 3}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{acao}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.acoes_estruturantes.length}/3 selecionadas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Principal área de atuação no campo artístico-cultural (escolha até 5) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {AREAS_ATUACAO.map(area => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.areas_atuacao.includes(area)}
                      onChange={() => {
                        if (formData.areas_atuacao.includes(area)) {
                          setFormData({
                            ...formData,
                            areas_atuacao: formData.areas_atuacao.filter(a => a !== area)
                          });
                        } else if (formData.areas_atuacao.length < 5) {
                          setFormData({
                            ...formData,
                            areas_atuacao: [...formData.areas_atuacao, area]
                          });
                        }
                      }}
                      disabled={!formData.areas_atuacao.includes(area) && formData.areas_atuacao.length >= 5}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.areas_atuacao.length}/5 selecionadas
              </p>
            </div>
          </div>
        </section>

        {/* Participação */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Participação
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como você participa da Rede Cultura Viva? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.como_participa_rede}
                onChange={(e) => setFormData({ ...formData, como_participa_rede: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="membro_ponto">Membro de Ponto de Cultura - Ponteiro(a)</option>
                <option value="gestor_publico">Gestor(a) Público(a) na área da Cultura</option>
                <option value="pesquisador">Pesquisador(a)</option>
                <option value="ainda_nao_faco_parte">Ainda não faço parte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Escolha o seu Grupo Temático no Fórum Nacional <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Selecione um ou mais grupos temáticos</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50">
                {GTS_TEMATICOS.map(gt => (
                  <label key={gt} className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.grupo_trabalho_tematico.includes(gt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            grupo_trabalho_tematico: [...formData.grupo_trabalho_tematico, gt]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            grupo_trabalho_tematico: formData.grupo_trabalho_tematico.filter(g => g !== gt),
                            gt_outro: gt === 'Outro' ? '' : formData.gt_outro
                          });
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{gt}</span>
                  </label>
                ))}
              </div>
              {formData.grupo_trabalho_tematico.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Selecione pelo menos um Grupo Temático</p>
              )}
            </div>

            {formData.grupo_trabalho_tematico.includes('Outro') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especifique outro GT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.gt_outro}
                  onChange={(e) => setFormData({ ...formData, gt_outro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Digite o nome do GT"
                />
              </div>
            )}
          </div>
        </section>

        {/* Preferências */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Preferências
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acomodação de preferência
              </label>
              <p className="text-xs text-gray-500 mb-2">
                A hospedagem será realizada em quartos duplos ou triplos
              </p>
              <select
                value={formData.preferencia_hospedagem}
                onChange={(e) => setFormData({ ...formData, preferencia_hospedagem: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="duplo">Quarto duplo</option>
                <option value="triplo">Quarto triplo</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Em caso de indisponibilidade de quartos duplos, a acomodação se dará em quartos triplos
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tem_restricao_alimentar}
                  onChange={(e) => setFormData({ ...formData, tem_restricao_alimentar: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Você tem alguma restrição alimentar?</span>
              </label>

              {formData.tem_restricao_alimentar && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qual restrição alimentar?
                  </label>
                  <textarea
                    value={formData.qual_restricao_alimentar}
                    onChange={(e) => setFormData({ ...formData, qual_restricao_alimentar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Consentimentos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
            Política de Privacidade e Comunicação
          </h2>
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                checked={formData.aceita_compartilhar_dados}
                onChange={(e) => setFormData({ ...formData, aceita_compartilhar_dados: e.target.checked })}
                className="mt-1 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                <span className="text-red-500">*</span> Aceito o compartilhamento dos meus dados com os
                parceiros do evento, para uso legalmente responsável
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                checked={formData.aceita_email}
                onChange={(e) => setFormData({ ...formData, aceita_email: e.target.checked })}
                className="mt-1 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                <span className="text-red-500">*</span> Aceito receber informações por e-mail sobre as
                atividades e programação da Teia e do Fórum
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                checked={formData.aceita_telefone}
                onChange={(e) => setFormData({ ...formData, aceita_telefone: e.target.checked })}
                className="mt-1 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                <span className="text-red-500">*</span> Aceito receber informações por telefone e aplicativos
                de mensagem instantânea sobre as atividades e programação da Teia e do Fórum
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                checked={formData.autoriza_uso_imagem}
                onChange={(e) => setFormData({ ...formData, autoriza_uso_imagem: e.target.checked })}
                className="mt-1 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                <span className="text-red-500">*</span> Autorizo a captura e utilização de fotografias,
                áudios e vídeos de minha participação no evento para fins de promoção e comunicação
              </span>
            </label>
          </div>
        </section>

        </fieldset>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setMessage('');
              }}
              className="flex items-center gap-2 px-8 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <X className="h-5 w-5" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Salvando...' : 'Salvar Inscrição'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
