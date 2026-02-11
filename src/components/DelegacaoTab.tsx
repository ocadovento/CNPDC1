import { useState, useEffect } from 'react';
import { Download, Eye, X, Link as LinkIcon } from 'lucide-react';
import DelegationChart from './DelegationChart';
import { calcularParidadeGenero, calcularVagasPorCota, type ParidadeResult, type VagaPorCota } from '../utils/parityCalculations';
import { supabase } from '../lib/supabase';

interface DelegacaoTabProps {
  eventos: any[];
  eventoSelecionado: string;
  setEventoSelecionado: (id: string) => void;
  participantesValidados: any[];
  onExportEleitos: () => void;
  onExportNatos: () => void;
  onExportAmbos: () => void;
  onGerarUrl: () => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export default function DelegacaoTab({
  eventos,
  eventoSelecionado,
  setEventoSelecionado,
  participantesValidados,
  onExportEleitos,
  onExportNatos,
  onExportAmbos,
  onGerarUrl,
  setSuccess,
  setError,
}: DelegacaoTabProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [paridade, setParidade] = useState<ParidadeResult | null>(null);
  const [vagasPorCota, setVagasPorCota] = useState<VagaPorCota[]>([]);
  const [loadingParidade, setLoadingParidade] = useState(false);
  const [estadosPorEvento, setEstadosPorEvento] = useState<string[]>([]);

  const eventoInfo = eventos.find(e => e.id === eventoSelecionado);

  useEffect(() => {
    if (eventoSelecionado) {
      loadEstadosPorEvento();
    }
  }, [eventoSelecionado]);

  useEffect(() => {
    if (eventoSelecionado && estadosPorEvento.length > 0) {
      loadParidadeData(estadosPorEvento[0]);
    }
  }, [eventoSelecionado, estadosPorEvento]);

  const loadEstadosPorEvento = async () => {
    try {
      const { data, error } = await supabase
        .from('delegacao_estado')
        .select('estado_uf')
        .eq('evento_id', eventoSelecionado);

      if (error) throw error;

      const estadosUnicos = [...new Set(data?.map(d => d.estado_uf) || [])];
      setEstadosPorEvento(estadosUnicos.sort());
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      setEstadosPorEvento([]);
    }
  };

  const loadParidadeData = async (estadoUf: string) => {
    if (!eventoSelecionado || !estadoUf) return;

    setLoadingParidade(true);
    try {
      const [paridadeRes, vagasRes] = await Promise.all([
        calcularParidadeGenero(eventoSelecionado, estadoUf),
        calcularVagasPorCota(eventoSelecionado, estadoUf),
      ]);

      setParidade(paridadeRes);
      setVagasPorCota(vagasRes);
    } catch (error) {
      console.error('Erro ao carregar dados de paridade:', error);
    } finally {
      setLoadingParidade(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Delegação Teia 2026</h2>
      </div>

      {eventos.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <p className="text-yellow-800">Nenhum evento cadastrado ainda.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione o Evento
              </label>
              <select
                value={eventoSelecionado}
                onChange={(e) => setEventoSelecionado(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {eventos.map(evento => (
                  <option key={evento.id} value={evento.id}>
                    {evento.tipo_evento === 'teia' ? 'Teia' : 'Fórum'} - {evento.cidade}/{evento.estado_uf} - {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-blue-800">
                <span className="font-semibold">{participantesValidados.length}</span> participantes inscritos neste evento
                {' | '}
                <span className="font-semibold">{participantesValidados.filter((p: any) => p.inscricao_completa).length}</span> validados
                {' | '}
                <span className="font-semibold">{participantesValidados.filter((p: any) => !p.inscricao_completa).length}</span> aguardando validação
              </p>
            </div>
          </div>

          {participantesValidados.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-5 w-5" />
                Visualizar Dados
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Exportar Delegação
              </button>
            </div>
          )}

          {estadosPorEvento.length > 0 && paridade && paridade.total_delegados > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <DelegationChart
                vagasPorCota={vagasPorCota}
                paridade={paridade}
                estadoUf={estadosPorEvento[0]}
                showExportButton={true}
              />
            </div>
          )}
        </>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                Visualização - {eventoInfo?.cidade}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Nome Completo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">CPF</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Celular</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Ponto de Cultura</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Cidade/UF Ponto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">GT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Estado Fórum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantesValidados.map((inscricao: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm border">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            inscricao.tipo_delegado === 'nato'
                              ? 'bg-orange-100 text-orange-800'
                              : inscricao.tipo_delegado === 'suplente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {inscricao.tipo_delegado === 'nato' ? 'Nato' : inscricao.tipo_delegado === 'suplente' ? 'Suplente' : 'Eleito'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm border">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            inscricao.inscricao_completa
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inscricao.inscricao_completa ? 'Validado' : 'Aguardando'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm border">{inscricao.nome_completo}</td>
                        <td className="px-4 py-3 text-sm border">{inscricao.cpf || inscricao.passaporte}</td>
                        <td className="px-4 py-3 text-sm border">{inscricao.email}</td>
                        <td className="px-4 py-3 text-sm border">{inscricao.celular}</td>
                        <td className="px-4 py-3 text-sm border">{inscricao.nome_ponto_cultura}</td>
                        <td className="px-4 py-3 text-sm border">{inscricao.cidade_ponto}/{inscricao.uf_ponto}</td>
                        <td className="px-4 py-3 text-sm border">
                          {inscricao.tipo_delegado === 'nato' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {inscricao.gt_responsavel || '-'}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {inscricao.estado_forum || inscricao.uf_ponto}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Opções de Exportação</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  <span className="font-bold">Total de Participantes:</span> {participantesValidados.length}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm text-blue-800">
                  <div>
                    <span className="font-semibold">Delegados Eleitos:</span> {participantesValidados.filter((p: any) => p.tipo_delegado === 'eleito').length}
                    <br/>
                    <span className="text-xs">({participantesValidados.filter((p: any) => p.tipo_delegado === 'eleito' && p.inscricao_completa).length} validados, {participantesValidados.filter((p: any) => p.tipo_delegado === 'eleito' && !p.inscricao_completa).length} aguardando)</span>
                  </div>
                  <div>
                    <span className="font-semibold">Delegados Natos:</span> {participantesValidados.filter((p: any) => p.tipo_delegado === 'nato').length}
                    <br/>
                    <span className="text-xs">({participantesValidados.filter((p: any) => p.tipo_delegado === 'nato' && p.inscricao_completa).length} validados, {participantesValidados.filter((p: any) => p.tipo_delegado === 'nato' && !p.inscricao_completa).length} aguardando)</span>
                  </div>
                  <div>
                    <span className="font-semibold">Suplentes:</span> {participantesValidados.filter((p: any) => p.tipo_delegado === 'suplente').length}
                    <br/>
                    <span className="text-xs">({participantesValidados.filter((p: any) => p.tipo_delegado === 'suplente' && p.inscricao_completa).length} validados, {participantesValidados.filter((p: any) => p.tipo_delegado === 'suplente' && !p.inscricao_completa).length} aguardando)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onExportAmbos();
                  setShowExportModal(false);
                }}
                className="w-full flex items-center gap-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="h-6 w-6 text-green-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-800">Baixar Delegação Completa (Excel)</p>
                  <p className="text-sm text-gray-600">Arquivo com 2 abas: Eleitos e Natos (todos os registros)</p>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onExportEleitos();
                    setShowExportModal(false);
                  }}
                  className="flex items-center gap-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Download className="h-5 w-5 text-blue-600" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Apenas Eleitos</p>
                    <p className="text-xs text-gray-600">Todos (validados + aguardando)</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onExportNatos();
                    setShowExportModal(false);
                  }}
                  className="flex items-center gap-2 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Download className="h-5 w-5 text-orange-600" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Apenas Natos</p>
                    <p className="text-xs text-gray-600">Todos (validados + aguardando)</p>
                  </div>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={() => {
                    onGerarUrl();
                    setShowExportModal(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <LinkIcon className="h-6 w-6 text-blue-600" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800">Gerar Lista Pública</p>
                    <p className="text-sm text-gray-600">Link com dados básicos (sem dados sensíveis)</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
