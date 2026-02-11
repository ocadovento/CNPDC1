import { useState, useEffect } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { Calendar, Plus, Edit2, Trash2, MapPin, Users as UsersIcon, Clock, ArrowLeft, Eye, X } from 'lucide-react';

interface EventoTeia {
  id: string;
  tipo_evento: 'teia' | 'forum';
  data_evento: string;
  data_fim: string | null;
  cidade: string;
  estado_uf: string;
  temas: string;
  quantidade_pontos_estimada: number;
  pode_adicionar_delegacao: boolean;
  representante_id: string | null;
  created_at: string;
}

interface Representante {
  id: string;
  nome_completo: string;
  estado_uf: string;
}

interface CalendarioTeiasProps {
  usuario: Usuario | null;
  onBack?: () => void;
}

export default function CalendarioTeias({ usuario, onBack }: CalendarioTeiasProps) {
  const [eventos, setEventos] = useState<EventoTeia[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoTeia | null>(null);
  const [viewingEvento, setViewingEvento] = useState<EventoTeia | null>(null);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    tipo_evento: 'teia' as 'teia' | 'forum',
    data_evento: '',
    data_fim: '' as string | null,
    cidade: '',
    estado_uf: '',
    temas: '',
    quantidade_pontos_estimada: 0,
    representante_id: null as string | null,
  });

  const isAdmin = usuario?.tipo_usuario === 'admin_geral' || usuario?.tipo_usuario === 'admin_auxiliar';

  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    loadEventos();
    if (isAdmin) {
      loadRepresentantes();
    }
  }, []);

  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_teias_foruns')
        .select('*')
        .order('data_evento', { ascending: true });

      if (error) throw error;

      console.log('=== TODOS OS EVENTOS CARREGADOS ===', data);
      const eventoTO = data?.find(e => e.estado_uf === 'TO');
      if (eventoTO) {
        console.log('=== EVENTO TO ENCONTRADO ===');
        console.log('Objeto completo:', eventoTO);
        console.log('data_evento STRING:', eventoTO.data_evento);
        console.log('data_fim STRING:', eventoTO.data_fim);
        console.log('typeof data_evento:', typeof eventoTO.data_evento);
      }
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRepresentantes = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome_completo, estado_uf')
        .eq('tipo_usuario', 'representante_gt')
        .order('nome_completo', { ascending: true });

      if (error) throw error;

      setRepresentantes(data || []);
    } catch (error) {
      console.error('Erro ao carregar representantes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (editingEvento) {
        // UPDATE usando RPC para evitar conversão de timezone
        const { error } = await supabase.rpc('update_evento_teia', {
          p_id: editingEvento.id,
          p_tipo_evento: formData.tipo_evento,
          p_data_evento: formData.data_evento,
          p_data_fim: formData.data_fim || null,
          p_cidade: formData.cidade,
          p_estado_uf: formData.estado_uf,
          p_temas: formData.temas,
          p_quantidade_pontos_estimada: formData.quantidade_pontos_estimada,
          p_representante_id: formData.representante_id,
        });

        if (error) throw error;
        setMessage('Evento atualizado com sucesso!');
      } else {
        // INSERT usando RPC para evitar conversão de timezone
        const representanteId = isAdmin ? formData.representante_id : usuario?.id;

        const { error } = await supabase.rpc('insert_evento_teia', {
          p_tipo_evento: formData.tipo_evento,
          p_data_evento: formData.data_evento,
          p_data_fim: formData.data_fim || null,
          p_cidade: formData.cidade,
          p_estado_uf: formData.estado_uf,
          p_temas: formData.temas,
          p_quantidade_pontos_estimada: formData.quantidade_pontos_estimada,
          p_representante_id: representanteId,
        });

        if (error) throw error;
        setMessage('Evento cadastrado com sucesso!');
      }

      setShowForm(false);
      setEditingEvento(null);
      resetForm();
      await loadEventos();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    }
  };

  const handleEdit = (evento: EventoTeia) => {
    setEditingEvento(evento);
    setFormData({
      tipo_evento: evento.tipo_evento,
      data_evento: evento.data_evento,
      data_fim: evento.data_fim || '',
      cidade: evento.cidade,
      estado_uf: evento.estado_uf,
      temas: evento.temas,
      quantidade_pontos_estimada: evento.quantidade_pontos_estimada,
      representante_id: evento.representante_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
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
      setMessage(`Erro ao excluir: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_evento: 'teia',
      data_evento: '',
      data_fim: '',
      cidade: '',
      estado_uf: '',
      temas: '',
      quantidade_pontos_estimada: 0,
      representante_id: null,
    });
  };

  const formatDateRange = (dataInicio: string, dataFim: string | null) => {
    console.log('Formatando datas:', { dataInicio, dataFim });

    // Parse com UTC para evitar problemas de timezone
    const [yearI, monthI, dayI] = dataInicio.split('-').map(Number);
    const inicio = new Date(Date.UTC(yearI, monthI - 1, dayI));

    if (!dataFim) {
      return inicio.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    }

    const [yearF, monthF, dayF] = dataFim.split('-').map(Number);
    const fim = new Date(Date.UTC(yearF, monthF - 1, dayF));

    const mesInicio = inicio.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' });
    const mesFim = fim.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' });
    const ano = inicio.getUTCFullYear();

    if (mesInicio === mesFim && inicio.getUTCFullYear() === fim.getUTCFullYear()) {
      const diaInicio = inicio.getUTCDate();
      const diaFim = fim.getUTCDate();
      const formatted = `${diaInicio} a ${diaFim} de ${mesInicio} de ${ano}`;
      console.log('Data formatada:', formatted);
      return formatted;
    } else {
      return `${inicio.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' })} a ${fim.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
    }
  };

  const canAddDelegation = (dataEvento: string) => {
    const eventDate = new Date(dataEvento);
    const today = new Date();
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  if (loading && eventos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">Calendário de Teias e Fóruns</h1>
            <p className="text-xl text-teal-50">Cadastre e acompanhe os eventos estaduais</p>
          </div>
          {usuario?.tipo_usuario === 'representante_gt' && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingEvento(null);
                resetForm();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-colors font-semibold"
            >
              <Plus className="h-5 w-5" />
              Adicionar Evento
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-green-500 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingEvento ? 'Editar Evento' : 'Novo Evento'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento *
                </label>
                <select
                  value={formData.tipo_evento}
                  onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value as 'teia' | 'forum' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="teia">Teia</option>
                  <option value="forum">Fórum</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Representante GT (Opcional)
                  </label>
                  <select
                    value={formData.representante_id || ''}
                    onChange={(e) => setFormData({ ...formData, representante_id: e.target.value || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Sem representante (gerenciado por admin)</option>
                    {representantes.map(rep => (
                      <option key={rep.id} value={rep.id}>
                        {rep.nome_completo} - {rep.estado_uf}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe vazio se o estado não tiver representante GT
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Evento *
                </label>
                <input
                  type="date"
                  value={formData.data_evento}
                  onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <select
                    value={formData.estado_uf}
                    onChange={(e) => setFormData({ ...formData, estado_uf: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  Temas *
                </label>
                <textarea
                  value={formData.temas}
                  onChange={(e) => setFormData({ ...formData, temas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade Estimada de Pontos Participantes
                </label>
                <input
                  type="number"
                  value={formData.quantidade_pontos_estimada}
                  onChange={(e) => setFormData({ ...formData, quantidade_pontos_estimada: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-green-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingEvento ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvento(null);
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Eventos Cadastrados</h2>

        {eventos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum evento cadastrado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Temas</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Detalhes</th>
                  {usuario?.tipo_usuario === 'representante_gt' && (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eventos.map((evento) => (
                  <tr key={evento.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        evento.tipo_evento === 'teia'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {evento.tipo_evento === 'teia' ? 'Teia' : 'Fórum'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {evento.data_evento.split('-').reverse().join('/')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {evento.cidade}/{evento.estado_uf}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {evento.temas}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setViewingEvento(evento)}
                        className="flex items-center gap-2 px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Ver Detalhes</span>
                      </button>
                    </td>
                    {usuario?.tipo_usuario === 'representante_gt' && (
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(evento)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evento.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-green-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    viewingEvento.tipo_evento === 'teia'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {viewingEvento.tipo_evento === 'teia' ? 'Teia' : 'Fórum'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">
                  {viewingEvento.tipo_evento === 'teia' ? 'Teia' : 'Fórum'} - {viewingEvento.estado_uf}
                </h2>
              </div>
              <button
                onClick={() => setViewingEvento(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-2xl font-semibold text-teal-700">
                <Calendar className="h-6 w-6" />
                <span>{formatDateRange(viewingEvento.data_evento, viewingEvento.data_fim)}</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="text-lg font-medium text-gray-800">
                      {viewingEvento.cidade}, {viewingEvento.estado_uf}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <UsersIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pontos de Cultura Estimados</p>
                    <p className="text-lg font-medium text-gray-800">
                      {viewingEvento.quantidade_pontos_estimada} participantes
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Temas e Eixos</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {viewingEvento.temas}
                  </p>
                </div>
              </div>

              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-900">Status da Delegação</p>
                    <p className="text-sm text-teal-700 mt-1">
                      {canAddDelegation(viewingEvento.data_evento)
                        ? 'Delegação pode ser adicionada (evento realizado há mais de 3 dias)'
                        : 'Aguardando 3 dias após o evento para adicionar delegação'}
                    </p>
                  </div>
                </div>
              </div>

              {usuario?.tipo_usuario === 'representante_gt' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleEdit(viewingEvento);
                      setViewingEvento(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Edit2 className="h-5 w-5" />
                    Editar Evento
                  </button>
                  <button
                    onClick={() => {
                      setViewingEvento(null);
                      handleDelete(viewingEvento.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="h-5 w-5" />
                    Excluir Evento
                  </button>
                </div>
              )}

              <button
                onClick={() => setViewingEvento(null)}
                className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Informações Importantes</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• Representantes GT podem cadastrar eventos de teias e fóruns estaduais</li>
          <li>• Após 3 dias da data do evento, é possível adicionar a delegação de participantes</li>
          <li>• A delegação deve ser adicionada na página "Gerenciar Delegação"</li>
          <li>• Clique em "Ver Detalhes" para visualizar informações completas do evento</li>
        </ul>
      </div>
    </div>
  );
}
