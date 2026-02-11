import { useState, useEffect } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { Calendar, Users, FileText, Plus, Edit2, Trash2, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

const formatarData = (dataString: string): string => {
  if (!dataString) return '';
  const data = new Date(dataString + 'T00:00:00');
  return data.toLocaleDateString('pt-BR');
};

interface Evento {
  id: string;
  tipo_evento: string;
  data_evento: string;
  data_fim?: string;
  cidade: string;
  estado_uf: string;
  temas: string;
  quantidade_pontos_estimada: number;
}

interface Membro {
  id: string;
  nome_ponto_cultura: string;
  nome_completo: string;
  contato_whatsapp: string;
  email: string;
  cpf?: string;
  nome_mae?: string;
  cidade: string;
  estado_uf: string;
  cota_representada?: string;
  genero?: string;
  inscricao_completa: boolean;
  tipo_delegado?: string;
  gt_responsavel?: string;
  suplente_de_id?: string;
  data_substituicao?: string;
  categoria_original?: string;
  motivo_substituicao?: string;
}

interface Relatorio {
  id: string;
  titulo: string;
  descricao?: string;
  tipo_evento: string;
  estado_uf: string;
  url_documento: string;
  file_type: string;
  created_at: string;
}

type ActiveTab = 'eventos' | 'delegacao' | 'relatorios';

export default function RepresentanteDashboard({ usuario, onLogout }: { usuario: Usuario | null; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('eventos');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

  const [membros, setMembros] = useState<Membro[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
  const [showMembroForm, setShowMembroForm] = useState(false);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [showSuplenteForm, setShowSuplenteForm] = useState(false);
  const [suplenteDeId, setSuplenteDeId] = useState<string>('');
  const [editingSuplente, setEditingSuplente] = useState<Membro | null>(null);

  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [showRelatorioForm, setShowRelatorioForm] = useState(false);
  const [editingRelatorio, setEditingRelatorio] = useState<Relatorio | null>(null);
  const [uploadingRelatorio, setUploadingRelatorio] = useState(false);
  const [relatorioFile, setRelatorioFile] = useState<File | null>(null);

  const [eventoFormData, setEventoFormData] = useState({
    tipo_evento: 'forum',
    data_evento: '',
    data_fim: '',
    cidade: '',
    estado_uf: usuario?.estado_uf || '',
    temas: '',
    quantidade_pontos_estimada: 0,
  });

  const [membroFormData, setMembroFormData] = useState({
    nome_ponto_cultura: '',
    nome_completo: '',
    contato_whatsapp: '',
    email: '',
    cpf: '',
    nome_mae: '',
    cidade: '',
    estado_uf: usuario?.estado_uf || '',
    cota_representada: '',
    genero: '',
    tipo_delegado: '',
    gt_responsavel: '',
  });

  const [suplenteFormData, setSuplenteFormData] = useState({
    nome_ponto_cultura: '',
    nome_completo: '',
    contato_whatsapp: '',
    email: '',
    cpf: '',
    nome_mae: '',
    cidade: '',
    estado_uf: usuario?.estado_uf || '',
    cota_representada: '',
    genero: '',
    motivo_substituicao: '',
  });

  const [relatorioFormData, setRelatorioFormData] = useState({
    titulo: '',
    descricao: '',
    tipo_evento: 'forum_estadual',
    url_documento: '',
    file_type: 'pdf',
  });

  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const cotasRepresentacao = [
    { value: 'pessoa_negra', label: 'Pessoa negra' },
    { value: 'pessoa_indigena', label: 'Pessoa indígena' },
    { value: 'pessoa_com_deficiencia', label: 'Pessoa com deficiência' },
    { value: 'pessoa_jovem', label: 'Pessoa jovem' },
    { value: 'pessoa_idosa', label: 'Pessoa idosa' },
    { value: 'lgbtqpn', label: 'LGBTQPN+' },
    { value: 'ampla_participacao', label: 'Ampla participação' },
  ];

  useEffect(() => {
    if (activeTab === 'eventos') {
      loadEventos();
    } else if (activeTab === 'delegacao') {
      loadMembros();
    } else if (activeTab === 'relatorios') {
      loadRelatorios();
    }
  }, [activeTab]);



  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_teias_foruns')
        .select('*')
        .eq('representante_id', usuario?.id)
        .order('data_evento', { ascending: false });

      if (error) throw error;
      setEventos(data || []);

      if (data && data.length > 0 && !eventoSelecionado) {
        const eventosDisponiveis = data.filter(evento => {
          const eventDate = new Date(evento.data_evento);
          const today = new Date();
          const diffTime = today.getTime() - eventDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 3;
        });

        if (eventosDisponiveis.length > 0) {
          setEventoSelecionado(eventosDisponiveis[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const loadMembros = async () => {
    try {
      // Buscar evento Teia Nacional 2026
      const { data: eventoNacional, error: eventoError } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (eventoError) {
        console.error('Erro ao buscar evento nacional:', eventoError);
        return;
      }

      if (!eventoNacional) {
        setMembros([]);
        return;
      }

      // Buscar participantes do estado do representante no evento Teia 2026
      const { data, error } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoNacional.id)
        .eq('estado_uf', usuario?.estado_uf)
        .order('nome_completo', { ascending: true });

      console.log('🔍 DEBUG RepresentanteDashboard - Evento Nacional ID:', eventoNacional.id);
      console.log('🔍 DEBUG RepresentanteDashboard - Usuario ID:', usuario?.id);
      console.log('🔍 DEBUG RepresentanteDashboard - Estado:', usuario?.estado_uf);
      console.log('🔍 DEBUG RepresentanteDashboard - Membros:', data?.length, 'Erro:', error);

      if (error) throw error;
      setMembros(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const getDelegadosEleitos = () => membros.filter(m => m.tipo_delegado === 'eleito' || !m.tipo_delegado);
  const getDelegadosNatos = () => membros.filter(m => m.tipo_delegado === 'nato');
  const getSuplentes = () => membros.filter(m => m.tipo_delegado === 'suplente');
  const getVagasRestantesEleitos = () => Math.max(0, 30 - getDelegadosEleitos().length);

  const loadRelatorios = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorios_estaduais')
        .select('*')
        .eq('created_by', usuario?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatorios(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    }
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const dataEvento = eventoFormData.data_evento ? `${eventoFormData.data_evento}T12:00:00-03:00` : null;
      const dataFim = eventoFormData.data_fim ? `${eventoFormData.data_fim}T12:00:00-03:00` : null;

      const eventoData = {
        ...eventoFormData,
        data_evento: dataEvento,
        data_fim: dataFim,
      };

      if (editingEvento) {
        const { error } = await supabase
          .from('eventos_teias_foruns')
          .update(eventoData)
          .eq('id', editingEvento.id);

        if (error) throw error;
        setMessage('Evento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('eventos_teias_foruns')
          .insert({
            ...eventoData,
            representante_id: usuario?.id,
          });

        if (error) throw error;
        setMessage('Evento cadastrado com sucesso!');
      }

      setShowEventoForm(false);
      setEditingEvento(null);
      resetEventoForm();
      await loadEventos();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    }
  };

  const handleDeleteEvento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('eventos_teias_foruns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('Evento excluído com sucesso!');
      await loadEventos();
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    }
  };

  const handleMembroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!membroFormData.tipo_delegado) {
      setMessage('Erro: Selecione o tipo de delegado (Eleito ou Nato).');
      return;
    }

    if (membroFormData.tipo_delegado === 'nato' && !membroFormData.gt_responsavel) {
      setMessage('Erro: Selecione o GT/Executiva Responsável para delegado nato.');
      return;
    }

    if (!membroFormData.cota_representada) {
      setMessage('Erro: Selecione a cota representada.');
      return;
    }

    if (!membroFormData.genero) {
      setMessage('Erro: Selecione o gênero.');
      return;
    }

    if (membroFormData.tipo_delegado === 'eleito' && !editingMembro) {
      const vagasRestantes = getVagasRestantesEleitos();
      if (vagasRestantes <= 0) {
        setMessage('Erro: Limite de 30 delegados eleitos já atingido.');
        return;
      }
    }

    try {
      setLoading(true);
      const cpfLimpo = membroFormData.cpf.replace(/\D/g, '');

      if (editingMembro) {
        const { error } = await supabase
          .from('delegacao_estado')
          .update({
            nome_ponto_cultura: membroFormData.nome_ponto_cultura,
            nome_completo: membroFormData.nome_completo,
            contato_whatsapp: membroFormData.contato_whatsapp,
            email: membroFormData.email,
            cpf: cpfLimpo,
            nome_mae: membroFormData.nome_mae,
            cidade: membroFormData.cidade,
            cota_representada: membroFormData.cota_representada,
            genero: membroFormData.genero,
            tipo_delegado: membroFormData.tipo_delegado,
            gt_responsavel: membroFormData.tipo_delegado === 'nato' ? membroFormData.gt_responsavel : null,
          })
          .eq('id', editingMembro.id);

        if (error) throw error;
        setMessage('✓ Participante atualizado com sucesso!');
      } else {
        const { data: eventoNacional, error: eventoError } = await supabase
          .from('eventos_teias_foruns')
          .select('id')
          .eq('tipo_evento', 'teia')
          .eq('cidade', 'Aracruz')
          .eq('estado_uf', 'ES')
          .gte('data_evento', '2026-01-01')
          .maybeSingle();

        if (eventoError) throw eventoError;

        if (!eventoNacional) {
          setLoading(false);
          setMessage('Erro: Evento Teia Nacional 2026 não encontrado.');
          return;
        }

        const { error } = await supabase
          .from('delegacao_estado')
          .insert({
            ...membroFormData,
            cpf: cpfLimpo,
            estado_uf: usuario?.estado_uf,
            representante_id: usuario?.id,
            evento_id: eventoNacional.id,
            tipo_delegado: membroFormData.tipo_delegado,
            gt_responsavel: membroFormData.tipo_delegado === 'nato' ? membroFormData.gt_responsavel : null,
            inscricao_completa: false,
          });

        if (error) throw error;
        setMessage('✓ Participante adicionado com sucesso!');
      }

      await loadMembros();
      setLoading(false);
      setShowMembroForm(false);
      setEditingMembro(null);
      resetMembroForm();

      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setLoading(false);
      setMessage(`Erro: ${error.message}`);
    }
  };

  const handleDeleteMembro = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      const { error } = await supabase
        .from('delegacao_estado')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('Participante removido com sucesso!');
      await loadMembros();
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    }
  };

  const handleSuplenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!suplenteDeId) {
      setMessage('Erro: Selecione um delegado eleito para vincular o suplente.');
      return;
    }

    if (!suplenteFormData.cota_representada) {
      setMessage('Erro: Selecione a cota representada.');
      return;
    }

    if (!suplenteFormData.genero) {
      setMessage('Erro: Selecione o gênero.');
      return;
    }

    try {
      setLoading(true);
      const cpfLimpo = suplenteFormData.cpf.replace(/\D/g, '');

      const { data: eventoNacional, error: eventoError } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (eventoError) throw eventoError;

      if (!eventoNacional) {
        setLoading(false);
        setMessage('Erro: Evento Teia Nacional 2026 não encontrado.');
        return;
      }

      const { error } = await supabase
        .from('delegacao_estado')
        .insert({
          ...suplenteFormData,
          cpf: cpfLimpo,
          estado_uf: usuario?.estado_uf,
          representante_id: usuario?.id,
          evento_id: eventoNacional.id,
          tipo_delegado: 'suplente',
          suplente_de_id: suplenteDeId,
          inscricao_completa: false,
        });

      if (error) throw error;
      setMessage('✓ Suplente adicionado com sucesso!');

      await loadMembros();
      setLoading(false);
      setShowSuplenteForm(false);
      setSuplenteDeId('');
      resetSuplenteForm();

      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setLoading(false);
      setMessage(`Erro: ${error.message}`);
    }
  };

  const handleAtivarSuplente = async (suplenteId: string, eleitoId: string) => {
    if (!confirm('Tem certeza que deseja ativar este suplente? O delegado eleito será substituído.')) return;

    try {
      setLoading(true);

      const eleito = membros.find(m => m.id === eleitoId);
      if (!eleito) throw new Error('Delegado eleito não encontrado');

      const { error } = await supabase
        .from('delegacao_estado')
        .update({
          data_substituicao: new Date().toISOString(),
          categoria_original: eleito.cota_representada,
        })
        .eq('id', suplenteId);

      if (error) throw error;

      setMessage('✓ Suplente ativado com sucesso!');
      await loadMembros();
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRelatorioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!editingRelatorio && !relatorioFile && !relatorioFormData.url_documento) {
      setMessage('Por favor, faça upload de um arquivo ou insira uma URL');
      setLoading(false);
      return;
    }

    if (relatorioFormData.url_documento && relatorioFormData.url_documento.startsWith('file:///')) {
      setMessage('Erro: Links locais (file:///) não são permitidos. Use um link público do Google Drive, Dropbox ou faça upload do arquivo.');
      setLoading(false);
      return;
    }

    if (relatorioFormData.url_documento && !relatorioFormData.url_documento.startsWith('http://') && !relatorioFormData.url_documento.startsWith('https://')) {
      setMessage('Erro: A URL deve começar com http:// ou https://');
      setLoading(false);
      return;
    }

    try {
      setUploadingRelatorio(true);
      let urlDocumento = relatorioFormData.url_documento;

      if (relatorioFile && !editingRelatorio) {
        const fileExt = relatorioFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `relatorios/${usuario?.estado_uf}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, relatorioFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        urlDocumento = urlData.publicUrl;
      }

      if (editingRelatorio) {
        const { error } = await supabase
          .from('relatorios_estaduais')
          .update({
            ...relatorioFormData,
            url_documento: urlDocumento,
          })
          .eq('id', editingRelatorio.id);

        if (error) throw error;
        setMessage('Relatório atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('relatorios_estaduais')
          .insert({
            ...relatorioFormData,
            url_documento: urlDocumento,
            estado_uf: usuario?.estado_uf || '',
            created_by: usuario?.auth_user_id,
          });

        if (error) throw error;
        setMessage('Relatório publicado com sucesso!');
      }

      await loadRelatorios();

      setShowRelatorioForm(false);
      setEditingRelatorio(null);
      setRelatorioFile(null);
      resetRelatorioForm();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
      console.error('Erro ao salvar relatório:', error);
    } finally {
      setUploadingRelatorio(false);
      setLoading(false);
    }
  };

  const handleDeleteRelatorio = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return;

    try {
      const { error } = await supabase
        .from('relatorios_estaduais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('Relatório excluído com sucesso!');
      await loadRelatorios();
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    }
  };

  const resetEventoForm = () => {
    setEventoFormData({
      tipo_evento: 'forum',
      data_evento: '',
      data_fim: '',
      cidade: '',
      estado_uf: usuario?.estado_uf || '',
      temas: '',
      quantidade_pontos_estimada: 0,
    });
  };

  const resetMembroForm = () => {
    setMembroFormData({
      nome_ponto_cultura: '',
      nome_completo: '',
      contato_whatsapp: '',
      email: '',
      cpf: '',
      nome_mae: '',
      cidade: '',
      estado_uf: usuario?.estado_uf || '',
      cota_representada: '',
      genero: '',
      tipo_delegado: '',
      gt_responsavel: '',
    });
  };

  const resetSuplenteForm = () => {
    setSuplenteFormData({
      nome_ponto_cultura: '',
      nome_completo: '',
      contato_whatsapp: '',
      email: '',
      cpf: '',
      nome_mae: '',
      cidade: '',
      estado_uf: usuario?.estado_uf || '',
      cota_representada: '',
      genero: '',
      motivo_substituicao: '',
    });
  };

  const resetRelatorioForm = () => {
    setRelatorioFormData({
      titulo: '',
      descricao: '',
      tipo_evento: 'forum_estadual',
      url_documento: '',
      file_type: 'pdf',
    });
    setRelatorioFile(null);
  };

  const eventosDisponiveis = eventos.filter(evento => {
    const eventDate = new Date(evento.data_evento);
    const today = new Date();
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel do Representante GT Estadual CNPDC</h1>
            <p className="text-xl text-blue-100">
              {usuario?.nome_completo} - {usuario?.estado_uf}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('eventos')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'eventos'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-5 w-5" />
            Eventos GT Estaduais da CNPDC
          </button>
          <button
            onClick={() => setActiveTab('delegacao')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'delegacao'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5" />
            Delegação Teia 2026
          </button>
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'relatorios'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-5 w-5" />
            Relatórios
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'eventos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Meus Eventos</h2>
                <button
                  onClick={() => {
                    setShowEventoForm(true);
                    setEditingEvento(null);
                    resetEventoForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Adicionar Evento
                </button>
              </div>

              {eventos.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum evento cadastrado</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              evento.tipo_evento === 'teia'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {evento.tipo_evento === 'teia' ? 'Teia' : 'Fórum'}
                            </span>
                            <span className="text-gray-600">
                              {formatarData(evento.data_evento.split('T')[0])}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {evento.cidade} - {evento.estado_uf}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEvento(evento);
                              const dataEventoFormatada = evento.data_evento ? evento.data_evento.split('T')[0] : '';
                              const dataFimFormatada = evento.data_fim ? evento.data_fim.split('T')[0] : '';
                              setEventoFormData({
                                tipo_evento: evento.tipo_evento,
                                data_evento: dataEventoFormatada,
                                data_fim: dataFimFormatada,
                                cidade: evento.cidade,
                                estado_uf: evento.estado_uf,
                                temas: evento.temas || '',
                                quantidade_pontos_estimada: evento.quantidade_pontos_estimada || 0,
                              });
                              setShowEventoForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvento(evento.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'delegacao' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Delegação Teia Nacional 2026 - {usuario?.estado_uf}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowMembroForm(true);
                      setEditingMembro(null);
                      resetMembroForm();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Adicionar Participante
                  </button>
                  <button
                    onClick={() => {
                      setShowSuplenteForm(true);
                      setSuplenteDeId('');
                      resetSuplenteForm();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Trocar Delegado Eleito
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-1">Evento: Teia Nacional 2026</h3>
                <p className="text-blue-800 text-sm">
                  Aracruz/ES - 24 a 29 de Março de 2026
                </p>
                <p className="text-blue-700 text-xs mt-2">
                  Gerenciando participantes do estado <strong>{usuario?.estado_uf}</strong> para este evento nacional.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div className="bg-white px-3 py-2 rounded">
                    <span className="font-semibold text-blue-900">Delegados Eleitos:</span>
                    <span className="ml-2 text-blue-700">{getDelegadosEleitos().length}/30</span>
                    {getVagasRestantesEleitos() > 0 && (
                      <span className="ml-2 text-green-600">({getVagasRestantesEleitos()} vagas disponíveis)</span>
                    )}
                  </div>
                  <div className="bg-white px-3 py-2 rounded">
                    <span className="font-semibold text-purple-900">Delegados Natos:</span>
                    <span className="ml-2 text-purple-700">{getDelegadosNatos().length}</span>
                    <span className="ml-2 text-gray-600 text-xs">(não contam no limite)</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded">
                    <span className="font-semibold text-orange-900">Suplentes:</span>
                    <span className="ml-2 text-orange-700">{getSuplentes().length}</span>
                    <span className="ml-2 text-gray-600 text-xs">(substitutos)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">Total: </span>
                  <span className="font-bold text-gray-900">{membros.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Aguardando validação: </span>
                  <span className="font-bold text-yellow-600">{membros.filter(m => !m.inscricao_completa).length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Validados: </span>
                  <span className="font-bold text-green-600">{membros.filter(m => m.inscricao_completa).length}</span>
                </div>
              </div>

              {membros.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum participante adicionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ponto de Cultura</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contato</th>
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
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                (membro as any).tipo_delegado === 'nato'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {(membro as any).tipo_delegado === 'nato' ? 'Nato' : 'Eleito'}
                              </span>
                              {(membro as any).tipo_delegado === 'nato' && (membro as any).gt_responsavel && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                  {(membro as any).gt_responsavel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                            {membro.nome_completo}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {membro.nome_ponto_cultura}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            <div>{membro.contato_whatsapp}</div>
                            <div className="text-xs text-gray-500">{membro.email}</div>
                          </td>
                          <td className="px-4 py-4">
                            {membro.cota_representada ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {membro.cota_representada.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                Não informado
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingMembro(membro);
                                  setMembroFormData({
                                    nome_ponto_cultura: membro.nome_ponto_cultura,
                                    nome_completo: membro.nome_completo,
                                    contato_whatsapp: membro.contato_whatsapp,
                                    email: membro.email,
                                    cpf: membro.cpf || '',
                                    nome_mae: membro.nome_mae || '',
                                    cidade: membro.cidade,
                                    estado_uf: membro.estado_uf,
                                    cota_representada: membro.cota_representada || '',
                                    genero: membro.genero || '',
                                    tipo_delegado: membro.tipo_delegado || 'eleito',
                                    gt_responsavel: membro.gt_responsavel || '',
                                  });
                                  setShowMembroForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMembro(membro.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          )}

          {activeTab === 'relatorios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Meus Relatórios</h2>
                <button
                  onClick={() => {
                    setShowRelatorioForm(true);
                    setEditingRelatorio(null);
                    resetRelatorioForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Adicionar Relatório
                </button>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  Os relatórios publicados aqui aparecerão automaticamente na página pública de documentos do CNPDC.
                </p>
              </div>

              {relatorios.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum relatório publicado</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {relatorios.map((relatorio) => (
                    <div key={relatorio.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              relatorio.tipo_evento === 'teia_estadual'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {relatorio.tipo_evento === 'teia_estadual' ? 'Teia Estadual' : 'Fórum Estadual'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {relatorio.titulo}
                          </h3>
                          {relatorio.descricao && (
                            <p className="text-sm text-gray-600 mb-2">
                              {relatorio.descricao}
                            </p>
                          )}
                          <a
                            href={relatorio.url_documento}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Ver documento →
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingRelatorio(relatorio);
                              setRelatorioFormData({
                                titulo: relatorio.titulo,
                                descricao: relatorio.descricao || '',
                                tipo_evento: relatorio.tipo_evento,
                                url_documento: relatorio.url_documento,
                                file_type: relatorio.file_type,
                              });
                              setShowRelatorioForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRelatorio(relatorio.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEventoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingEvento ? 'Editar Evento' : 'Adicionar Evento'}
              </h2>
            </div>

            <form onSubmit={handleEventoSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento *
                </label>
                <select
                  value={eventoFormData.tipo_evento}
                  onChange={(e) => setEventoFormData({ ...eventoFormData, tipo_evento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="forum">Fórum Estadual</option>
                  <option value="teia">Teia Estadual</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={eventoFormData.data_evento}
                    onChange={(e) => setEventoFormData({ ...eventoFormData, data_evento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={eventoFormData.data_fim}
                    onChange={(e) => setEventoFormData({ ...eventoFormData, data_fim: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={eventoFormData.cidade}
                    onChange={(e) => setEventoFormData({ ...eventoFormData, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado (UF) *
                  </label>
                  <select
                    value={eventoFormData.estado_uf}
                    onChange={(e) => setEventoFormData({ ...eventoFormData, estado_uf: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    {estadosBrasileiros.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temas do Evento *
                </label>
                <textarea
                  value={eventoFormData.temas}
                  onChange={(e) => setEventoFormData({ ...eventoFormData, temas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva os principais temas que serão abordados no evento"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade Estimada de Pontos de Cultura
                </label>
                <input
                  type="number"
                  value={eventoFormData.quantidade_pontos_estimada}
                  onChange={(e) => setEventoFormData({ ...eventoFormData, quantidade_pontos_estimada: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingEvento ? 'Atualizar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEventoForm(false);
                    setEditingEvento(null);
                    resetEventoForm();
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

      {showMembroForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingMembro ? 'Editar Participante' : 'Adicionar Participante'}
              </h2>
            </div>

            <form onSubmit={handleMembroSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Delegado *
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMembroFormData({ ...membroFormData, tipo_delegado: 'eleito', gt_responsavel: '' })}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      membroFormData.tipo_delegado === 'eleito'
                        ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-500'
                        : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        membroFormData.tipo_delegado === 'eleito'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {membroFormData.tipo_delegado === 'eleito' && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${
                          membroFormData.tipo_delegado === 'eleito' ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          Delegado Eleito
                        </h3>
                        <p className="text-sm text-gray-600">
                          Escolhido nos Fóruns ou Teias Estaduais. Representa o estado.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMembroFormData({ ...membroFormData, tipo_delegado: 'nato' })}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      membroFormData.tipo_delegado === 'nato'
                        ? 'border-orange-500 bg-orange-50 shadow-lg ring-2 ring-orange-500'
                        : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        membroFormData.tipo_delegado === 'nato'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {membroFormData.tipo_delegado === 'nato' && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${
                          membroFormData.tipo_delegado === 'nato' ? 'text-orange-700' : 'text-gray-700'
                        }`}>
                          Delegado Nato
                        </h3>
                        <p className="text-sm text-gray-600">
                          Membro do GT ou Executiva Nacional do CNPDC.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Atenção ao selecionar o tipo:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Delegado Eleito:</strong> Para pessoas eleitas nos eventos estaduais</li>
                        <li><strong>Delegado Nato:</strong> Apenas para membros oficiais do GT/Executiva</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {membroFormData.tipo_delegado === 'nato' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GT Nato Representado *
                  </label>
                  <select
                    value={membroFormData.gt_responsavel}
                    onChange={(e) => setMembroFormData({ ...membroFormData, gt_responsavel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="EXECUTIVA CNPDC">EXECUTIVA CNPDC</option>
                    <option value="GT ESTADUAL">GT ESTADUAL</option>
                    <option value="GT Ação Griô">GT Ação Griô</option>
                    <option value="GT Acessibilidade">GT Acessibilidade</option>
                    <option value="GT Amazônico">GT Amazônico</option>
                    <option value="GT Audiovisual">GT Audiovisual</option>
                    <option value="GT Circo">GT Circo</option>
                    <option value="GT Comunicação/Rádio Comunitária">GT Comunicação/Rádio Comunitária</option>
                    <option value="GT Cultura Digital">GT Cultura Digital</option>
                    <option value="GT Cultura e Arte Negra">GT Cultura e Arte Negra</option>
                    <option value="GT Cultura Popular">GT Cultura Popular</option>
                    <option value="GT Dança">GT Dança</option>
                    <option value="GT Gênero">GT Gênero</option>
                    <option value="GT Hip Hop">GT Hip Hop</option>
                    <option value="GT Indígenas">GT Indígenas</option>
                    <option value="GT Integração Latino Americana">GT Integração Latino Americana</option>
                    <option value="GT Legislação">GT Legislação</option>
                    <option value="GT Matriz Africana">GT Matriz Africana</option>
                    <option value="GT Música">GT Música</option>
                    <option value="GT Patrimônio Imaterial e Tradicional">GT Patrimônio Imaterial e Tradicional</option>
                    <option value="GT Rurais">GT Rurais</option>
                    <option value="GT Pontões e Redes">GT Pontões e Redes</option>
                    <option value="GT Sustentabilidade">GT Sustentabilidade</option>
                    <option value="GT Teatro">GT Teatro</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Ponto de Cultura *
                </label>
                <input
                  type="text"
                  value={membroFormData.nome_ponto_cultura}
                  onChange={(e) => setMembroFormData({ ...membroFormData, nome_ponto_cultura: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo da Pessoa *
                </label>
                <input
                  type="text"
                  value={membroFormData.nome_completo}
                  onChange={(e) => setMembroFormData({ ...membroFormData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    value={membroFormData.contato_whatsapp}
                    onChange={(e) => setMembroFormData({ ...membroFormData, contato_whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    value={membroFormData.email}
                    onChange={(e) => setMembroFormData({ ...membroFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={membroFormData.cpf}
                    onChange={(e) => setMembroFormData({ ...membroFormData, cpf: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Mãe *
                  </label>
                  <input
                    type="text"
                    value={membroFormData.nome_mae}
                    onChange={(e) => setMembroFormData({ ...membroFormData, nome_mae: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={membroFormData.cidade}
                    onChange={(e) => setMembroFormData({ ...membroFormData, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <p className="mt-1 text-xs text-gray-500">
                    O delegado será adicionado ao seu estado ({usuario?.estado_uf})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cota Representada *
                  </label>
                  <select
                    value={membroFormData.cota_representada}
                    onChange={(e) => setMembroFormData({ ...membroFormData, cota_representada: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    {cotasRepresentacao.map(opcao => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero *
                  </label>
                  <select
                    value={membroFormData.genero}
                    onChange={(e) => setMembroFormData({ ...membroFormData, genero: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="nao_binario">Não-binário</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_informar">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Fluxo de validação:</strong>
                </p>
                <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                  <li>Após adicionar, o participante aparecerá como "Aguardando validação"</li>
                  <li>O participante fará login usando <strong>nome completo, CPF e nome da mãe</strong></li>
                  <li>Ele preencherá o formulário completo de inscrição</li>
                  <li>Após validação, ele será promovido automaticamente para a <strong>Teia Nacional 2026</strong></li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingMembro ? 'Atualizar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMembroForm(false);
                    setEditingMembro(null);
                    resetMembroForm();
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

      {showRelatorioForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingRelatorio ? 'Editar Relatório' : 'Adicionar Relatório'}
              </h2>
            </div>

            <form onSubmit={handleRelatorioSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento *
                </label>
                <select
                  value={relatorioFormData.tipo_evento}
                  onChange={(e) => setRelatorioFormData({ ...relatorioFormData, tipo_evento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="forum_estadual">Fórum Estadual</option>
                  <option value="teia_estadual">Teia Estadual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Relatório *
                </label>
                <input
                  type="text"
                  value={relatorioFormData.titulo}
                  onChange={(e) => setRelatorioFormData({ ...relatorioFormData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Ex: Relatório Final do Fórum Estadual da Bahia 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={relatorioFormData.descricao}
                  onChange={(e) => setRelatorioFormData({ ...relatorioFormData, descricao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Breve descrição sobre o relatório"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3 font-medium">
                  Escolha uma das opções para adicionar o relatório:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📎 Fazer Upload do Arquivo
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setRelatorioFile(file);
                          const ext = file.name.split('.').pop()?.toLowerCase();
                          setRelatorioFormData({
                            ...relatorioFormData,
                            file_type: ext || 'pdf',
                            url_documento: ''
                          });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={editingRelatorio !== null}
                    />
                    {relatorioFile && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Arquivo selecionado: {relatorioFile.name}
                      </p>
                    )}
                    {editingRelatorio && (
                      <p className="mt-2 text-sm text-gray-500">
                        Upload disponível apenas para novos relatórios
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-sm text-gray-500">OU</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔗 Inserir URL do Documento
                    </label>
                    <input
                      type="url"
                      value={relatorioFormData.url_documento}
                      onChange={(e) => {
                        const url = e.target.value;
                        let fileType = 'link';

                        if (url.toLowerCase().includes('.pdf')) {
                          fileType = 'pdf';
                        } else if (url.toLowerCase().includes('.doc')) {
                          fileType = url.toLowerCase().includes('.docx') ? 'docx' : 'doc';
                        }

                        setRelatorioFormData({
                          ...relatorioFormData,
                          url_documento: url,
                          file_type: fileType
                        });
                        setRelatorioFile(null);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://drive.google.com/... ou https://..."
                    />
                    <p className="mt-2 text-xs text-gray-600">
                      ⚠️ Use apenas links públicos (Google Drive, Dropbox, etc). Links locais (file:///) não funcionam.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-sm text-green-800">
                  Este relatório será publicado automaticamente na página pública de documentos e ficará visível para todos os visitantes do site.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || uploadingRelatorio}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                >
                  {uploadingRelatorio ? 'Fazendo upload...' : loading ? 'Salvando...' : editingRelatorio ? 'Atualizar' : 'Publicar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRelatorioForm(false);
                    setEditingRelatorio(null);
                    resetRelatorioForm();
                  }}
                  disabled={uploadingRelatorio}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuplenteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Trocar Delegado Eleito</h2>
              <p className="text-sm text-orange-100 mt-1">
                Suplentes podem ter categoria diferente do delegado eleito
              </p>
            </div>

            <form onSubmit={handleSuplenteSubmit} className="p-6 space-y-6">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  <strong>Importante:</strong> O suplente ficará vinculado a um delegado eleito
                </p>
                <p className="text-xs text-orange-700">
                  • O suplente pode ter cota/categoria diferente do eleito<br/>
                  • Quando ativado, o suplente assume a vaga independente da categoria
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da substituição *
                </label>
                <input
                  type="text"
                  value={suplenteFormData.motivo_substituicao}
                  onChange={(e) => setSuplenteFormData({ ...suplenteFormData, motivo_substituicao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Desistência, afastamento, impossibilidade de participar..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vincular ao Delegado Eleito *
                </label>
                <select
                  value={suplenteDeId}
                  onChange={(e) => setSuplenteDeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um delegado eleito...</option>
                  {getDelegadosEleitos().map(eleito => (
                    <option key={eleito.id} value={eleito.id}>
                      {eleito.nome_completo} - {eleito.cota_representada ? eleito.cota_representada.replace(/_/g, ' ') : 'Sem cota'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  O delegado selecionado aqui será o substituído
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Ponto de Cultura *
                </label>
                <input
                  type="text"
                  value={suplenteFormData.nome_ponto_cultura}
                  onChange={(e) => setSuplenteFormData({ ...suplenteFormData, nome_ponto_cultura: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo da Pessoa *
                </label>
                <input
                  type="text"
                  value={suplenteFormData.nome_completo}
                  onChange={(e) => setSuplenteFormData({ ...suplenteFormData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    value={suplenteFormData.contato_whatsapp}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, contato_whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    value={suplenteFormData.email}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={suplenteFormData.cpf}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, cpf: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Mãe *
                  </label>
                  <input
                    type="text"
                    value={suplenteFormData.nome_mae}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, nome_mae: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={suplenteFormData.cidade}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cota Representada *
                  </label>
                  <select
                    value={suplenteFormData.cota_representada}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, cota_representada: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    {cotasRepresentacao.map(opcao => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Pode ser diferente da cota do eleito
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero *
                  </label>
                  <select
                    value={suplenteFormData.genero}
                    onChange={(e) => setSuplenteFormData({ ...suplenteFormData, genero: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="nao_binario">Não-binário</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_informar">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuplenteForm(false);
                    setSuplenteDeId('');
                    resetSuplenteForm();
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
