import { useState, useEffect } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { Users, Plus, Edit2, Trash2, AlertCircle, CheckCircle, ArrowLeft, FileEdit, Download } from 'lucide-react';
import GenderParityAlert from '../components/GenderParityAlert';
import QuotaCard from '../components/QuotaCard';
import DelegationChart from '../components/DelegationChart';
import { calcularParidadeGenero, calcularVagasPorCota, type ParidadeResult, type VagaPorCota, getDelegadosPorGenero, type DelegadoComGenero } from '../utils/parityCalculations';
import { exportDelegacaoToExcel } from '../utils/chartExport';
import { getCotaLabel } from '../utils/colorPalette';

interface EventoTeia {
  id: string;
  tipo_evento: string;
  data_evento: string;
  cidade: string;
  estado_uf: string;
  pode_adicionar_delegacao: boolean;
}

interface Membro {
  id: string;
  nome_ponto_cultura: string;
  nome_completo: string;
  nome_mae: string;
  contato_whatsapp: string;
  email: string;
  cpf: string;
  cidade: string;
  estado_uf: string;
  cota_representada: string;
  genero: string | null;
  inscricao_completa: boolean;
  tipo_delegado: string | null;
  gt_responsavel: string | null;
}

interface CotaDisponivel {
  cota_representada: string;
  vagas_total: number;
  vagas_preenchidas: number;
  vagas_disponiveis: number;
}

interface GerenciarDelegacaoProps {
  usuario: Usuario | null;
  onBack?: () => void;
  onEditInscricao?: (membroId: string) => void;
}

export default function GerenciarDelegacao({ usuario, onBack, onEditInscricao }: GerenciarDelegacaoProps) {
  const [eventoTeia2026Id, setEventoTeia2026Id] = useState<string>('');
  const [membros, setMembros] = useState<Membro[]>([]);
  const [cotasDisponiveis, setCotasDisponiveis] = useState<CotaDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [message, setMessage] = useState('');

  const [paridade, setParidade] = useState<ParidadeResult | null>(null);
  const [vagasPorCota, setVagasPorCota] = useState<VagaPorCota[]>([]);
  const [delegados, setDelegados] = useState<DelegadoComGenero[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [loadingParidade, setLoadingParidade] = useState(false);

  const [formData, setFormData] = useState({
    nome_ponto_cultura: '',
    nome_completo: '',
    nome_mae: '',
    contato_whatsapp: '',
    email: '',
    cpf: '',
    cidade: '',
    estado_uf: '',
    cota_representada: '',
    genero: '',
    tipo_delegado: '',
    gt_responsavel: '',
    suplente_de_id: '',
    motivo_substituicao: '',
  });

  const cotasRepresentadas = [
    { value: 'ampla_participacao', label: 'Ampla Participação' },
    { value: 'pessoa_negra', label: 'Pessoa Negra' },
    { value: 'pessoa_indigena', label: 'Pessoa de Povos Originários' },
    { value: 'pessoa_com_deficiencia', label: 'Pessoa com Deficiência' },
    { value: 'pessoa_jovem', label: 'Pessoa Jovem' },
    { value: 'pessoa_idosa', label: 'Pessoa Idosa' },
    { value: 'lgbtqpn', label: 'LGBTQPN+' },
  ];

  const gtsDisponiveis = [
    'EXECUTIVA CNPDC',
    'GT ESTADUAL',
    'GT Ação Griô',
    'GT Acessibilidade',
    'GT Amazônico',
    'GT Audiovisual',
    'GT Circo',
    'GT Comunicação/Rádio Comunitária',
    'GT Cultura Digital',
    'GT Cultura e Arte Negra',
    'GT Cultura Popular',
    'GT Dança',
    'GT Gênero',
    'GT Hip Hop',
    'GT Indígenas',
    'GT Integração Latino Americana',
    'GT Legislação',
    'GT Matriz Africana',
    'GT Música',
    'GT Patrimônio Imaterial e Tradicional',
    'GT Rurais',
    'GT Pontões e Redes',
    'GT Sustentabilidade',
    'GT Teatro',
  ];

  const getCotaLabel = (value: string) => {
    return cotasRepresentadas.find(c => c.value === value)?.label || value;
  };

  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    loadEventoTeia2026();
  }, []);

  useEffect(() => {
    if (eventoTeia2026Id && usuario?.estado_uf) {
      loadMembros();
      loadCotasDisponiveis();
      loadParidadeData();
    }
  }, [eventoTeia2026Id, usuario?.estado_uf]);

  const loadParidadeData = async () => {
    if (!eventoTeia2026Id || !usuario?.estado_uf) return;

    setLoadingParidade(true);
    try {
      const [paridadeRes, vagasRes, delegadosRes] = await Promise.all([
        calcularParidadeGenero(eventoTeia2026Id, usuario.estado_uf),
        calcularVagasPorCota(eventoTeia2026Id, usuario.estado_uf),
        getDelegadosPorGenero(eventoTeia2026Id, usuario.estado_uf)
      ]);

      setParidade(paridadeRes);
      setVagasPorCota(vagasRes);
      setDelegados(delegadosRes);
    } catch (error) {
      console.error('Erro ao carregar dados de paridade:', error);
    } finally {
      setLoadingParidade(false);
    }
  };

  const loadEventoTeia2026 = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEventoTeia2026Id(data.id);
      } else {
        setMessage('Evento Teia 2026 não encontrado. Entre em contato com o administrador.');
      }
    } catch (error) {
      console.error('Erro ao carregar evento Teia 2026:', error);
      setMessage('Erro ao carregar evento Teia 2026.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembros = async () => {
    if (!eventoTeia2026Id || !usuario) return;

    try {
      const { data, error } = await supabase
        .from('delegacao_estado')
        .select(`
          *,
          suplente:delegacao_estado!delegacao_estado_suplente_de_id_fkey(
            id,
            nome_completo,
            motivo_substituicao
          )
        `)
        .eq('evento_id', eventoTeia2026Id)
        .eq('estado_uf', usuario.estado_uf)
        .order('nome_completo', { ascending: true });

      if (error) throw error;

      setMembros(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const loadCotasDisponiveis = async () => {
    if (!eventoTeia2026Id || !usuario?.estado_uf) return;

    try {
      const { data, error } = await supabase.rpc('get_cotas_disponiveis', {
        p_evento_id: eventoTeia2026Id,
        p_estado_uf: usuario.estado_uf
      });

      if (error) throw error;

      setCotasDisponiveis(data || []);
    } catch (error) {
      console.error('Erro ao carregar cotas disponíveis:', error);
      setCotasDisponiveis([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥🔥🔥 INICIO handleSubmit');
    console.log('🔥 tipo_delegado:', formData.tipo_delegado);
    console.log('🔥 FormData completo:', JSON.stringify(formData, null, 2));

    setLoading(true);
    setMessage('');

    try {
      if (formData.tipo_delegado === 'nato' && !formData.gt_responsavel) {
        console.log('❌ ERRO: GT nato não preenchido');
        setMessage('Para delegados natos, o campo GT Nato Representado é obrigatório.');
        setLoading(false);
        return;
      }

      if (formData.tipo_delegado === 'suplente') {
        console.log('🔥 Validando campos de SUPLENTE...');
        console.log('🔥 suplente_de_id:', formData.suplente_de_id);
        console.log('🔥 motivo_substituicao:', formData.motivo_substituicao);

        if (!formData.suplente_de_id) {
          console.log('❌ ERRO: suplente_de_id vazio');
          setMessage('Para suplentes, selecione qual delegado eleito está sendo substituído.');
          setLoading(false);
          return;
        }
        if (!formData.motivo_substituicao || formData.motivo_substituicao.trim() === '') {
          console.log('❌ ERRO: motivo_substituicao vazio');
          setMessage('Para suplentes, o campo Motivo da Substituição é obrigatório.');
          setLoading(false);
          return;
        }
        console.log('✅ Validação de suplente passou!');
      }

      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      console.log('🔥 CPF limpo:', cpfLimpo);

      if (!editingMembro) {
        console.log('🔥 Verificando vagas disponíveis...');
        console.log('🔥 Cotas disponíveis:', cotasDisponiveis);
        console.log('🔥 Cota selecionada no form:', formData.cota_representada);

        // Verificar se há vagas disponíveis para a cota selecionada
        const cotaSelecionada = cotasDisponiveis.find(c => c.cota_representada === formData.cota_representada);
        console.log('🔥 Cota encontrada:', cotaSelecionada);

        if (!cotaSelecionada) {
          console.log('❌ ERRO: Cota não configurada');
          setMessage('Cota não configurada para este estado. Entre em contato com o administrador.');
          setLoading(false);
          return;
        }

        if (cotaSelecionada.vagas_disponiveis <= 0) {
          console.log('❌ ERRO: Sem vagas disponíveis');
          setMessage(`Não há mais vagas disponíveis para a cota "${getCotaLabel(formData.cota_representada)}". Todas as ${cotaSelecionada.vagas_total} vagas já foram preenchidas.`);
          setLoading(false);
          return;
        }
        console.log('✅ Cota tem vagas disponíveis:', cotaSelecionada.vagas_disponiveis);

        const { data: existente, error: checkError } = await supabase
          .from('delegacao_estado')
          .select('tipo_delegado, estado_uf, evento_id')
          .eq('cpf', cpfLimpo)
          .maybeSingle();

        if (checkError) {
          console.error('Erro ao verificar CPF:', checkError);
        }

        if (existente) {
          const tipoDelegado = existente.tipo_delegado === 'nato' ? 'Delegado Nato' : 'Delegado Eleito';
          setMessage(
            `Este CPF já está cadastrado como ${tipoDelegado}. ` +
            `Uma pessoa só pode ser delegado eleito OU nato em todos os eventos. ` +
            `Por favor, verifique os dados ou entre em contato com o administrador.`
          );
          setLoading(false);
          return;
        }
      }

      if (editingMembro) {
        const { error } = await supabase
          .from('delegacao_estado')
          .update({
            ...formData,
            cpf: cpfLimpo,
            gt_responsavel: formData.tipo_delegado === 'nato' ? formData.gt_responsavel : null,
            suplente_de_id: formData.tipo_delegado === 'suplente' ? formData.suplente_de_id : null,
            motivo_substituicao: formData.tipo_delegado === 'suplente' ? formData.motivo_substituicao : null,
          })
          .eq('id', editingMembro.id);

        if (error) throw error;
        setMessage('Participante atualizado com sucesso!');
      } else {
        console.log('🔥 Preparando INSERT no banco de dados...');
        const dadosParaInserir = {
          ...formData,
          cpf: cpfLimpo,
          evento_id: eventoTeia2026Id,
          representante_id: usuario?.id,
          estado_uf: usuario?.estado_uf || formData.estado_uf,
          inscricao_completa: false,
          gt_responsavel: formData.tipo_delegado === 'nato' ? formData.gt_responsavel : null,
          suplente_de_id: formData.tipo_delegado === 'suplente' ? formData.suplente_de_id : null,
          motivo_substituicao: formData.tipo_delegado === 'suplente' ? formData.motivo_substituicao : null,
        };
        console.log('🔥 Dados para inserir:', JSON.stringify(dadosParaInserir, null, 2));

        const { error } = await supabase
          .from('delegacao_estado')
          .insert(dadosParaInserir);

        if (error) {
          console.log('❌ ERRO no INSERT:', error);
          throw error;
        }
        console.log('✅ INSERT executado com sucesso!');
        setMessage('Participante adicionado com sucesso! O participante poderá fazer login usando nome completo, CPF e nome da mãe.');
      }

      setShowForm(false);
      setEditingMembro(null);
      resetForm();
      await loadMembros();
      await loadCotasDisponiveis();
      await loadParidadeData();
    } catch (error: any) {
      console.log('❌❌❌ ERRO CAPTURADO no handleSubmit:', error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error completo:', JSON.stringify(error, null, 2));
      setMessage(`Erro: ${error.message}`);
    } finally {
      console.log('🔥 Finalizando handleSubmit (finally)');
      setLoading(false);
    }
  };

  const handleEdit = (membro: Membro) => {
    setEditingMembro(membro);
    setFormData({
      nome_ponto_cultura: membro.nome_ponto_cultura,
      nome_completo: membro.nome_completo,
      nome_mae: membro.nome_mae || '',
      contato_whatsapp: membro.contato_whatsapp,
      email: membro.email,
      cpf: membro.cpf,
      cidade: membro.cidade,
      estado_uf: membro.estado_uf,
      cota_representada: membro.cota_representada,
      genero: membro.genero || '',
      tipo_delegado: membro.tipo_delegado || '',
      gt_responsavel: membro.gt_responsavel || '',
      suplente_de_id: '',
      motivo_substituicao: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este participante? Isso também removerá do evento nacional se foi promovido.')) return;

    try {
      console.log('Iniciando exclusão do participante ID:', id);

      // Buscar dados do participante antes de excluir
      const { data: participante, error: fetchError } = await supabase
        .from('delegacao_estado')
        .select('cpf, estado_uf')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar participante:', fetchError);
        throw fetchError;
      }

      console.log('Participante encontrado:', participante);

      // Primeiro remover da tabela inscricoes_membros se existir
      const { error: inscricaoError } = await supabase
        .from('inscricoes_membros')
        .delete()
        .eq('delegacao_id', id);

      if (inscricaoError) {
        console.error('Erro ao remover inscrição:', inscricaoError);
      } else {
        console.log('Inscrição removida (se existia)');
      }

      // Buscar ID do evento nacional
      const { data: eventoNacional, error: eventoError } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .single();

      if (eventoError) {
        console.error('Erro ao buscar evento nacional:', eventoError);
      } else {
        console.log('Evento nacional encontrado:', eventoNacional);

        // Remover do evento nacional se existir
        const { error: nacionalError } = await supabase
          .from('delegacao_estado')
          .delete()
          .eq('cpf', participante.cpf)
          .eq('estado_uf', participante.estado_uf)
          .eq('evento_id', eventoNacional.id);

        if (nacionalError) {
          console.error('Erro ao remover do evento nacional:', nacionalError);
        } else {
          console.log('Removido do evento nacional (se existia)');
        }
      }

      // Por fim, remover da tabela delegacao_estado (evento estadual)
      const { data, error } = await supabase
        .from('delegacao_estado')
        .delete()
        .eq('id', id)
        .select();

      console.log('Resultado da exclusão do evento estadual:', { data, error });

      if (error) {
        console.error('Erro ao excluir:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('Nenhum registro foi excluído. ID pode não existir:', id);
        setMessage('Aviso: Nenhum registro foi encontrado para exclusão.');
      } else {
        console.log('Participante excluído com sucesso:', data);
        setMessage('Participante removido com sucesso de todos os eventos!');
      }

      await loadMembros();
      await loadParidadeData();
    } catch (error: any) {
      console.error('Erro completo:', error);
      setMessage(`Erro ao remover: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_ponto_cultura: '',
      nome_completo: '',
      nome_mae: '',
      contato_whatsapp: '',
      email: '',
      cpf: '',
      cidade: '',
      estado_uf: '',
      cota_representada: '',
      genero: '',
      tipo_delegado: '',
      gt_responsavel: '',
      suplente_de_id: '',
      motivo_substituicao: '',
    });
  };

  const handleExportExcel = () => {
    if (!usuario?.estado_uf) return;

    try {
      exportDelegacaoToExcel(
        delegados,
        paridade,
        vagasPorCota,
        usuario.estado_uf,
        `delegacao_${usuario.estado_uf}_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      setMessage('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setMessage('Erro ao exportar dados. Tente novamente.');
    }
  };

  if (loading && !eventoTeia2026Id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!eventoTeia2026Id) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Gerenciar Delegação {usuario?.estado_uf} - Teia 2026</h1>
          <p className="text-xl text-teal-50">Adicione os membros da delegação do seu estado</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Evento Teia 2026 não encontrado</h3>
              <p className="text-yellow-800">
                O evento Teia Nacional 2026 ainda não foi criado. Entre em contato com o administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-xl shadow-lg p-8 text-white">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-white hover:text-teal-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao Painel</span>
          </button>
        )}
        <div>
          <h1 className="text-4xl font-bold mb-4">Gerenciar Delegação {usuario?.estado_uf} - Teia 2026</h1>
          <p className="text-xl text-teal-50 mb-6">Você está gerenciando a delegação do estado {usuario?.estado_uf} para a Teia Nacional 2026</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => {
                setEditingMembro(null);
                setFormData({
                  nome_ponto_cultura: '',
                  nome_completo: '',
                  nome_mae: '',
                  contato_whatsapp: '',
                  email: '',
                  cpf: '',
                  cidade: '',
                  estado_uf: '',
                  cota_representada: '',
                  genero: '',
                  tipo_delegado: '',
                  gt_responsavel: '',
                  suplente_de_id: '',
                  motivo_substituicao: '',
                });
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              <Plus className="h-6 w-6" />
              Adicionar Participante
            </button>

            <button
              onClick={() => {
                console.log('🔥 CLICOU NO BOTÃO ADICIONAR SUPLENTE');
                setEditingMembro(null);
                const newFormData = {
                  nome_ponto_cultura: '',
                  nome_completo: '',
                  nome_mae: '',
                  contato_whatsapp: '',
                  email: '',
                  cpf: '',
                  cidade: '',
                  estado_uf: '',
                  cota_representada: '',
                  genero: '',
                  tipo_delegado: 'suplente',
                  gt_responsavel: '',
                  suplente_de_id: '',
                  motivo_substituicao: '',
                };
                console.log('🔥 FormData para suplente:', newFormData);
                setFormData(newFormData);
                console.log('🔥 Chamando setShowForm(true)');
                setTimeout(() => {
                  setShowForm(true);
                  console.log('🔥 Formulário aberto após timeout');
                }, 50);
                console.log('🔥 Fim do onClick');
              }}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              <Plus className="h-6 w-6" />
              Adicionar Suplente
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <h3 className="font-semibold text-blue-900 mb-1">Evento: Teia Nacional 2026</h3>
          <p className="text-blue-800 text-sm">
            Aracruz/ES - 24 a 29 de Março de 2026
          </p>
          <p className="text-blue-700 text-xs mt-2">
            Você está adicionando participantes do estado <strong>{usuario?.estado_uf}</strong> para este evento nacional.
          </p>
        </div>

        <div className="mb-6">
          <GenderParityAlert paridade={paridade} showDetails={true} />
        </div>

        {vagasPorCota.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Vagas por Cota</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vagasPorCota.map((vaga) => (
                <QuotaCard key={vaga.cota_representada} vaga={vaga} />
              ))}
            </div>
          </div>
        )}

        {paridade && paridade.total_delegados > 0 && (
          <div className="mb-6">
            <DelegationChart
              vagasPorCota={vagasPorCota}
              paridade={paridade}
              estadoUf={usuario?.estado_uf || ''}
              showExportButton={false}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Lista de Participantes</h2>
          <div className="flex gap-4 items-center">
            <div className="text-sm">
              <span className="text-gray-600">Total: </span>
              <span className="font-bold text-gray-900">{membros.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Validados: </span>
              <span className="font-bold text-green-600">{membros.filter(m => m.inscricao_completa).length}</span>
            </div>
          </div>
        </div>

        {membros.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum participante adicionado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gênero</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ponto de Cultura</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contato</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cidade/UF</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cota</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {membros.map((membro) => (
                  <tr key={membro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      {membro.inscricao_completa ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-yellow-400"></div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                      <div>
                        {membro.nome_completo}
                        {membro.tipo_delegado === 'suplente' && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            SUPLENTE
                          </span>
                        )}
                        {membro.tipo_delegado === 'eleito' && membro.suplente && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            SUBSTITUÍDO
                          </span>
                        )}
                      </div>
                      {membro.tipo_delegado === 'eleito' && membro.suplente && (
                        <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 rounded text-xs space-y-1">
                          <div>
                            <strong className="text-red-900">Substituído por:</strong>
                            <span className="text-red-800 ml-1">
                              {membro.suplente.nome_completo}
                            </span>
                          </div>
                          {membro.suplente.motivo_substituicao && (
                            <div>
                              <strong className="text-red-900">Motivo:</strong>
                              <span className="text-red-800 ml-1">{membro.suplente.motivo_substituicao}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      {membro.genero === 'mulher' && (
                        <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                          ♀ Mulher
                        </span>
                      )}
                      {membro.genero === 'homem' && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          ♂ Homem
                        </span>
                      )}
                      {!membro.genero && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          Não informado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {membro.nome_ponto_cultura}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div>{membro.contato_whatsapp}</div>
                      <div className="text-xs text-gray-500">{membro.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {membro.cidade}/{membro.estado_uf}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs inline-block">
                        {membro.cota_representada ? membro.cota_representada.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Não especificada'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(membro)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar dados básicos"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {onEditInscricao && (
                          <button
                            onClick={() => onEditInscricao(membro.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar inscrição completa"
                          >
                            <FileEdit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(membro.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir membro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {console.log('🔥 RENDER - showForm:', showForm, 'formData.tipo_delegado:', formData.tipo_delegado)}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 text-white p-6 rounded-t-2xl ${
              formData.tipo_delegado === 'suplente'
                ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                : 'bg-gradient-to-r from-blue-600 to-blue-500'
            }`}>
              <h2 className="text-2xl font-bold">
                {editingMembro
                  ? 'Editar Participante'
                  : formData.tipo_delegado === 'suplente'
                  ? 'Adicionar Suplente'
                  : 'Adicionar Participante'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {(formData.tipo_delegado === '' || editingMembro) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Delegado *
                  </label>
                  <select
                    value={formData.tipo_delegado}
                    onChange={(e) => {
                      setFormData({ ...formData, tipo_delegado: e.target.value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    disabled={!!editingMembro}
                  >
                    <option value="">Selecione...</option>
                    <option value="nato">Delegado Nato</option>
                    <option value="eleito">Delegado Eleito</option>
                    <option value="suplente">Suplente</option>
                  </select>
                  {editingMembro && (
                    <p className="text-xs text-gray-500 mt-1">Tipo não pode ser alterado durante edição</p>
                  )}
                </div>
              )}

              {formData.tipo_delegado === 'suplente' && (
                <>
                  <div className="bg-red-50 border-4 border-red-600 rounded-lg p-4">
                    <label className="block text-base font-bold text-red-900 mb-2">
                      Motivo da Substituição *
                    </label>
                    <textarea
                      value={formData.motivo_substituicao}
                      onChange={(e) => setFormData({ ...formData, motivo_substituicao: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-600"
                      rows={3}
                      placeholder="Informe o motivo da substituição (obrigatório para suplentes)"
                      required
                    />
                  </div>

                  <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 space-y-4">
                    <h3 className="text-base font-bold text-orange-900">Qual Delegado Eleito está sendo substituído? *</h3>
                    <select
                      value={formData.suplente_de_id}
                      onChange={(e) => setFormData({ ...formData, suplente_de_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione o delegado eleito...</option>
                      {membros
                        .filter(m => m.tipo_delegado === 'eleito')
                        .map((delegado) => (
                          <option key={delegado.id} value={delegado.id}>
                            {delegado.nome_completo} - {getCotaLabel(delegado.cota_representada)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-sm text-blue-800">
                      Preencha os dados completos da pessoa que irá substituir o delegado eleito
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Ponto de Cultura *
                </label>
                <input
                  type="text"
                  value={formData.nome_ponto_cultura}
                  onChange={(e) => setFormData({ ...formData, nome_ponto_cultura: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo da Pessoa *
                </label>
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Mãe *
                </label>
                <input
                  type="text"
                  value={formData.nome_mae}
                  onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contato WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={formData.contato_whatsapp}
                    onChange={(e) => setFormData({ ...formData, contato_whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado (UF) *
                  </label>
                  <input
                    type="text"
                    value={usuario?.estado_uf || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Estado fixo baseado no seu login</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cota Representada *
                </label>
                {cotasDisponiveis.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Nenhuma cota configurada para este estado. Entre em contato com o administrador para configurar as vagas por cota.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={formData.cota_representada}
                      onChange={(e) => setFormData({ ...formData, cota_representada: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione...</option>
                      {cotasDisponiveis.map(cota => {
                        const temVagas = cota.vagas_disponiveis > 0;
                        return (
                          <option
                            key={cota.cota_representada}
                            value={cota.cota_representada}
                            disabled={!temVagas && !editingMembro}
                          >
                            {getCotaLabel(cota.cota_representada)} - {cota.vagas_disponiveis}/{cota.vagas_total} vagas disponíveis
                          </option>
                        );
                      })}
                    </select>
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-semibold mb-2">Vagas por cota para {usuario?.estado_uf}:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {cotasDisponiveis.map(cota => (
                          <div
                            key={cota.cota_representada}
                            className={`flex justify-between p-2 rounded ${
                              cota.vagas_disponiveis === 0
                                ? 'bg-red-50 text-red-700'
                                : cota.vagas_disponiveis <= 2
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            <span className="font-medium">{getCotaLabel(cota.cota_representada)}</span>
                            <span>{cota.vagas_preenchidas}/{cota.vagas_total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gênero *
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="mulher">Mulher</option>
                  <option value="homem">Homem</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  ⚠ A delegação deve ter no mínimo 50% de mulheres
                </p>
              </div>

              {formData.tipo_delegado === 'nato' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GT Nato Representado *
                  </label>
                  <select
                    value={formData.gt_responsavel}
                    onChange={(e) => setFormData({ ...formData, gt_responsavel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o GT...</option>
                    {gtsDisponiveis.map((gt) => (
                      <option key={gt} value={gt}>
                        {gt}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    Campo obrigatório para delegados natos
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  Após adicionar, o membro poderá fazer login usando o <strong>nome completo, CPF e nome da mãe</strong> para preencher o formulário de inscrição completo.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-green-600 transition-all disabled:opacity-50"
                >
                  {loading
                    ? 'Salvando...'
                    : editingMembro
                    ? 'Atualizar Cadastro'
                    : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMembro(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
