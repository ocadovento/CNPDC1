import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Calendar, MapPin, Building, Clock, CheckCircle, AlertCircle, AlertTriangle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

const estadosNomes: { [key: string]: string } = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
  SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
};

interface EstadoInfo {
  uf: string;
  nome: string;
  total: number;
  validados: number;
}

export default function ParticipantesTeia2026() {
  const [participantesInscritos, setParticipantesInscritos] = useState<any[]>([]);
  const [participantesValidados, setParticipantesValidados] = useState<any[]>([]);
  const [participantesNatos, setParticipantesNatos] = useState<any[]>([]);
  const [participantesSuplentes, setParticipantesSuplentes] = useState<any[]>([]);
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'validados' | 'eleitos' | 'natos' | 'suplentes'>('validados');
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const [estadosEleitos, setEstadosEleitos] = useState<EstadoInfo[]>([]);

  useEffect(() => {
    loadEventoEParticipantes();
  }, []);

  useEffect(() => {
    setEstadoSelecionado(null);
    if (activeTab === 'eleitos' && evento) {
      loadEstadosEleitos();
    }
  }, [activeTab, evento]);

  const loadEstadosEleitos = async () => {
    try {
      if (!evento) return;

      // Buscar TODOS os delegados eleitos (validados e aguardando validação)
      const { data: delegados } = await supabase
        .from('delegacao_estado')
        .select('estado_uf, inscricao_completa')
        .eq('evento_id', evento.id)
        .eq('tipo_delegado', 'eleito');

      const estadosMap: { [key: string]: EstadoInfo } = {};

      Object.keys(estadosNomes).forEach(uf => {
        estadosMap[uf] = {
          uf,
          nome: estadosNomes[uf],
          total: 0,
          validados: 0
        };
      });

      delegados?.forEach(d => {
        if (estadosMap[d.estado_uf]) {
          estadosMap[d.estado_uf].total++;
          if (d.inscricao_completa) {
            estadosMap[d.estado_uf].validados++;
          }
        }
      });

      setEstadosEleitos(Object.values(estadosMap).sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    }
  };

  const loadEventoEParticipantes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      console.log('===== VERSÃO COM DEBUG ATIVO =====');
      console.log('Iniciando busca de evento Teia 2026...');

      // Buscar evento Teia Nacional 2026 (Aracruz/ES)
      const { data: eventosData, error: eventoError } = await supabase
        .from('eventos_teias_foruns')
        .select('*')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .order('data_evento', { ascending: false });

      console.log('RESULTADO BUSCA EVENTO:', {
        encontrados: eventosData?.length || 0,
        erro: eventoError,
        dados: eventosData
      });

      if (eventoError) throw eventoError;

      const eventoData = eventosData && eventosData.length > 0 ? eventosData[0] : null;

      console.log('🔍 DEBUG - Evento encontrado:', eventoData);

      if (!eventoData) {
        setError('Evento Teia Nacional 2026 não encontrado. Aguarde a criação do evento.');
        setLoading(false);
        return;
      }

      setEvento(eventoData);

      // Buscar TODOS os participantes INSCRITOS (incluindo validados) do evento Teia 2026
      const { data: inscritos, error: inscritosError } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoData.id)
        .order('estado_uf', { ascending: true })
        .order('nome_completo', { ascending: true });

      console.log('RESULTADO BUSCA INSCRITOS:', {
        total: inscritos?.length || 0,
        erro: inscritosError
      });

      if (inscritos && inscritos.length > 0) {
        console.log('PRIMEIROS 3 INSCRITOS:', inscritos.slice(0, 3));
      } else {
        console.warn('⚠️ NENHUM INSCRITO ENCONTRADO!');
      }

      if (inscritosError) throw inscritosError;
      setParticipantesInscritos(inscritos || []);

      console.log('===== FIM DA BUSCA =====');

      // Buscar participantes VALIDADOS (inscricao_completa = true) que foram promovidos para o evento nacional
      const { data: validados, error: validadosError } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoData.id)
        .eq('inscricao_completa', true)
        .order('estado_uf', { ascending: true })
        .order('nome_completo', { ascending: true });

      if (validadosError) throw validadosError;
      setParticipantesValidados(validados || []);

      // Buscar TODOS os delegados NATOS (validados ou não)
      const { data: natos, error: natosError } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoData.id)
        .eq('tipo_delegado', 'nato')
        .order('estado_uf', { ascending: true })
        .order('nome_completo', { ascending: true });

      if (natosError) throw natosError;
      setParticipantesNatos(natos || []);

      // Buscar TODOS os SUPLENTES (validados ou não)
      const { data: suplentes, error: suplentesError } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoData.id)
        .eq('tipo_delegado', 'suplente')
        .order('estado_uf', { ascending: true })
        .order('nome_completo', { ascending: true });

      if (suplentesError) throw suplentesError;
      setParticipantesSuplentes(suplentes || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadEventoEParticipantes(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando participantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Erro</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const renderTable = (participantes: any[], tipo: 'inscritos' | 'validados', showTipoDelegado = false, showGT = false) => {
    if (participantes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl">
            {tipo === 'inscritos'
              ? 'Nenhum participante inscrito ainda'
              : 'Nenhum participante validado ainda'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                Nome Completo
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                Ponto de Cultura
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                Cidade/UF
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                Estado de Delegação
              </th>
              {showGT && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                  GT Responsável
                </th>
              )}
              {showTipoDelegado && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                  Tipo de Delegado
                </th>
              )}
              {tipo === 'inscritos' && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r">
                  Status
                </th>
              )}
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                {tipo === 'inscritos' ? 'Data de Inscrição' : 'Data de Validação'}
              </th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((participante, index) => (
              <tr
                key={participante.id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 border-r">
                  <p className="font-medium text-gray-900">{participante.nome_completo}</p>
                </td>
                <td className="px-6 py-4 border-r">
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{participante.nome_ponto_cultura}</span>
                  </div>
                </td>
                <td className="px-6 py-4 border-r">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">
                      {participante.cidade}/{participante.estado_uf}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 border-r">
                  <span className="font-semibold text-gray-800">
                    Fórum {participante.estado_uf}
                  </span>
                </td>
                {showGT && (
                  <td className="px-6 py-4 border-r">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                      {participante.gt_responsavel || '-'}
                    </span>
                  </td>
                )}
                {showTipoDelegado && (
                  <td className="px-6 py-4 border-r">
                    {participante.tipo_delegado === 'eleito' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Delegado Eleito
                      </span>
                    ) : participante.tipo_delegado === 'nato' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                        Delegado Nato
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">-</span>
                    )}
                  </td>
                )}
                {tipo === 'inscritos' && (
                  <td className="px-6 py-4 border-r">
                    {participante.inscricao_completa ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Validado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        <Clock className="h-3.5 w-3.5" />
                        Aguardando Validação
                      </span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">
                      {tipo === 'inscritos'
                        ? formatDate(participante.created_at)
                        : formatDate(participante.data_validacao)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="h-10 w-10" />
                <h1 className="text-3xl font-bold">Delegação Teia 2026</h1>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Atualizar lista"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Atualizar</span>
              </button>
            </div>
            {evento && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-50">
                  <Calendar className="h-5 w-5" />
                  <p className="text-lg font-semibold">
                    24 a 29 de Março de 2026 - {evento.cidade}/{evento.estado_uf}
                  </p>
                </div>
                <p className="text-green-100 text-sm">
                  {evento.temas}
                </p>
              </div>
            )}
          </div>

          {/* Informações de Prazos - Destaque */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-t-4 border-red-500 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-red-900 mb-2">
                    PRAZOS IMPORTANTES - Fóruns Estaduais
                  </h2>
                  <p className="text-red-800 text-sm mb-4">
                    Atenção aos prazos para realização dos Fóruns Estaduais e envio de documentação
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-2">Prazo Padrão</h3>
                      <p className="text-gray-800 text-sm mb-1">
                        <span className="font-bold">Realização dos Fóruns Estaduais:</span>
                      </p>
                      <p className="text-red-700 font-bold text-lg">até 15 de dezembro de 2025</p>
                      <p className="text-gray-600 text-xs mt-2">
                        Enviar resoluções até 10 dias após o Fórum
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-orange-500 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-orange-900 mb-2">Prazo Excepcional</h3>
                      <p className="text-gray-800 text-sm mb-1">
                        <span className="font-bold">Com justificativa formal:</span>
                      </p>
                      <p className="text-orange-700 font-bold text-lg">até 1º de março de 2026</p>
                      <p className="text-gray-600 text-xs mt-2">
                        Justificativa enviada à Comissão Organizadora Nacional
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-6 w-6 text-yellow-700 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 mb-2">Envio de Documentação</h3>
                    <div className="space-y-2 text-sm text-gray-800">
                      <p>
                        <span className="font-semibold">Email:</span>{' '}
                        <a href="mailto:culturavivanacional@gmail.com" className="text-blue-600 hover:underline font-semibold">
                          culturavivanacional@gmail.com
                        </a>
                      </p>
                      <p>
                        <span className="font-semibold">• Fóruns até 15/12/2025:</span> Enviar resoluções até 10 dias após o evento
                      </p>
                      <p className="text-red-700 font-semibold">
                        <span className="font-bold">• Fóruns após 24/02/2026:</span> Enviar documentos até 6 de março de 2026 (PRAZO FINAL)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm mt-4">
                <h3 className="font-bold text-blue-900 mb-3">Redes Sociais - Cultura Viva Brasil</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href="https://instagram.com/culturavivabrasil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold">Instagram:</span>
                    <span className="text-blue-600 hover:underline">@culturavivabrasil</span>
                  </a>
                  <a
                    href="https://youtube.com/@culturavivabrasil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold">YouTube:</span>
                    <span className="text-blue-600 hover:underline">@culturavivabrasil</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              <button
                onClick={() => setActiveTab('validados')}
                className={`py-4 px-4 text-center font-semibold transition-all ${
                  activeTab === 'validados'
                    ? 'bg-green-50 text-green-700 border-b-4 border-green-500'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm md:text-base">Validados</span>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {participantesValidados.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('eleitos')}
                className={`py-4 px-4 text-center font-semibold transition-all ${
                  activeTab === 'eleitos'
                    ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-500'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm md:text-base">Eleitos</span>
                  </div>
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {participantesInscritos.filter(p => p.tipo_delegado === 'eleito').length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('natos')}
                className={`py-4 px-4 text-center font-semibold transition-all ${
                  activeTab === 'natos'
                    ? 'bg-orange-50 text-orange-700 border-b-4 border-orange-500'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm md:text-base">Natos</span>
                  </div>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {participantesNatos.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('suplentes')}
                className={`py-4 px-4 text-center font-semibold transition-all ${
                  activeTab === 'suplentes'
                    ? 'bg-yellow-50 text-yellow-700 border-b-4 border-yellow-500'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm md:text-base">Suplentes</span>
                  </div>
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {participantesSuplentes.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'validados' && (
              <>
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-semibold mb-1">
                        Participantes Confirmados para a Teia 2026
                      </p>
                      <p className="text-green-700 text-sm">
                        Delegados que completaram o formulário de validação e foram automaticamente promovidos para a Teia Nacional 2026.
                        Total de participantes confirmados: <span className="font-bold">{participantesValidados.length}</span>
                      </p>
                    </div>
                  </div>
                </div>
                {renderTable(participantesValidados, 'validados', true)}
              </>
            )}

            {activeTab === 'eleitos' && (
              <>
                {estadoSelecionado ? (
                  <>
                    <div className="mb-6 flex items-center gap-4">
                      <button
                        onClick={() => setEstadoSelecionado(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                      </button>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          Delegados Eleitos - {estadosNomes[estadoSelecionado]} ({estadoSelecionado})
                        </h3>
                        <p className="text-gray-600">
                          {participantesInscritos.filter(p => p.tipo_delegado === 'eleito' && p.estado_uf === estadoSelecionado && p.inscricao_completa).length} validados de {participantesInscritos.filter(p => p.tipo_delegado === 'eleito' && p.estado_uf === estadoSelecionado).length} inscritos
                        </p>
                      </div>
                    </div>
                    {renderTable(participantesInscritos.filter(p => p.tipo_delegado === 'eleito' && p.estado_uf === estadoSelecionado), 'inscritos', false)}
                  </>
                ) : (
                  <>
                    <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <Users className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-emerald-800 font-semibold mb-1">
                            Delegados Eleitos por Estado
                          </p>
                          <p className="text-emerald-700 text-sm">
                            Delegados escolhidos nos Fóruns ou Teias Estaduais para representar seus estados na Teia Nacional 2026.
                            Selecione um estado para ver os delegados.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {estadosEleitos.map((estado) => (
                        <button
                          key={estado.uf}
                          onClick={() => setEstadoSelecionado(estado.uf)}
                          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 text-left border-2 border-transparent hover:border-emerald-500"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-emerald-600">{estado.uf}</span>
                            <Users className="h-5 w-5 text-gray-400" />
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-2 text-sm">{estado.nome}</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-semibold text-gray-900">{estado.total}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Validados:</span>
                              <span className="font-semibold text-green-600">{estado.validados}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'natos' && (
              <>
                <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-800 font-semibold mb-1">
                        Delegados Natos (GT/Executiva Nacional)
                      </p>
                      <p className="text-orange-700 text-sm">
                        Membros do GT ou Executiva Nacional do CNPDC que participam da Teia 2026 por direito.
                        Total de delegados natos: <span className="font-bold">{participantesNatos.length}</span>
                        {' '}({participantesNatos.filter(p => p.inscricao_completa).length} validados, {participantesNatos.filter(p => !p.inscricao_completa).length} aguardando validação)
                      </p>
                    </div>
                  </div>
                </div>
                {renderTable(participantesNatos, 'inscritos', false, true)}
              </>
            )}

            {activeTab === 'suplentes' && (
              <>
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-semibold mb-1">
                        Delegados Suplentes
                      </p>
                      <p className="text-yellow-700 text-sm">
                        Suplentes vinculados a delegados eleitos. Podem assumir a vaga em caso de substituição.
                        Total de suplentes: <span className="font-bold">{participantesSuplentes.length}</span>
                        {' '}({participantesSuplentes.filter(p => p.inscricao_completa).length} validados, {participantesSuplentes.filter(p => !p.inscricao_completa).length} aguardando validação)
                      </p>
                    </div>
                  </div>
                </div>
                {renderTable(participantesSuplentes, 'inscritos', false, false)}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>
              {activeTab === 'inscritos'
                ? 'Esta lista mostra participantes em processo de validação. Dados pessoais sensíveis não são exibidos.'
                : 'Esta é uma lista pública de participantes validados. Dados pessoais sensíveis não são exibidos.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
