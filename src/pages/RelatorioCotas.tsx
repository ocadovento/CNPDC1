import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DelegationChart from '../components/DelegationChart';
import QuotaAvailabilityChart from '../components/QuotaAvailabilityChart';
import {
  calcularParidadeGenero,
  calcularVagasPorCota,
  calcularDisponibilidadeCompleta,
  calcularResumoEstado,
  type ParidadeResult,
  type VagaPorCota,
  type DisponibilidadeCompleta,
  type ResumoEstado
} from '../utils/parityCalculations';

const estadosNomes: { [key: string]: string } = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
  SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
};

export default function RelatorioCotas() {
  const [eventoNacionalId, setEventoNacionalId] = useState<string | null>(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const [resumos, setResumos] = useState<ResumoEstado[]>([]);
  const [paridade, setParidade] = useState<ParidadeResult | null>(null);
  const [vagasPorCota, setVagasPorCota] = useState<VagaPorCota[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeCompleta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEventoNacional();
  }, []);

  useEffect(() => {
    if (eventoNacionalId) {
      loadResumos();
    }
  }, [eventoNacionalId]);

  useEffect(() => {
    if (estadoSelecionado && eventoNacionalId) {
      loadDetalhesEstado();
    }
  }, [estadoSelecionado, eventoNacionalId]);

  const loadEventoNacional = async () => {
    try {
      const { data } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (data) {
        setEventoNacionalId(data.id);
      }
    } catch (error) {
      console.error('Erro ao carregar evento nacional:', error);
    }
  };

  const loadResumos = async () => {
    if (!eventoNacionalId) return;

    setLoading(true);
    try {
      const { data: estadosComDelegados } = await supabase
        .from('delegacao_estado')
        .select('estado_uf')
        .eq('evento_id', eventoNacionalId);

      const estadosUnicos = [...new Set(estadosComDelegados?.map(d => d.estado_uf) || [])];

      const resumosPromises = estadosUnicos.map(uf =>
        calcularResumoEstado(eventoNacionalId, uf)
      );

      const resumosData = await Promise.all(resumosPromises);
      const resumosValidos = resumosData.filter(r => r !== null) as ResumoEstado[];

      setResumos(resumosValidos.sort((a, b) =>
        estadosNomes[a.estado_uf].localeCompare(estadosNomes[b.estado_uf])
      ));
    } catch (error) {
      console.error('Erro ao carregar resumos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetalhesEstado = async () => {
    if (!eventoNacionalId || !estadoSelecionado) return;

    setLoading(true);
    try {
      const [paridadeData, vagasData, dispData] = await Promise.all([
        calcularParidadeGenero(eventoNacionalId, estadoSelecionado),
        calcularVagasPorCota(eventoNacionalId, estadoSelecionado),
        calcularDisponibilidadeCompleta(eventoNacionalId, estadoSelecionado)
      ]);

      setParidade(paridadeData);
      setVagasPorCota(vagasData);
      setDisponibilidade(dispData);
    } catch (error) {
      console.error('Erro ao carregar detalhes do estado:', error);
    } finally {
      setLoading(false);
    }
  };

  if (estadoSelecionado && paridade) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEstadoSelecionado(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Relatório Detalhado - {estadosNomes[estadoSelecionado]} ({estadoSelecionado})
            </h2>
            <p className="text-gray-600">Análise completa da delegação estadual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DelegationChart
            vagasPorCota={vagasPorCota}
            paridade={paridade}
            estadoUf={estadoSelecionado}
            showExportButton={true}
          />

          <QuotaAvailabilityChart
            disponibilidade={disponibilidade}
            estadoUf={estadoSelecionado}
            showExportButton={true}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Detalhamento por Cota</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cota</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Limite</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Preenchidas</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Disponíveis</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ocupação</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Mulheres</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Homens</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {disponibilidade.map((disp) => (
                  <tr key={disp.cota_representada} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {disp.label_cota}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">
                      {disp.limite_maximo}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">
                      {disp.vagas_preenchidas}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-green-600">
                      {disp.vagas_disponiveis}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">
                      {disp.percentual_ocupacao.toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-pink-600">
                      {disp.vagas_mulheres}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-blue-600">
                      {disp.vagas_homens}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        disp.status === 'completo' ? 'bg-green-100 text-green-700' :
                        disp.status === 'parcial' ? 'bg-yellow-100 text-yellow-700' :
                        disp.status === 'excedido' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {disp.status === 'completo' ? 'Completo' :
                         disp.status === 'parcial' ? 'Parcial' :
                         disp.status === 'excedido' ? 'Excedido' : 'Vazio'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatório de Cotas por Estado</h2>
        <p className="text-gray-600">Visão geral da ocupação de vagas e paridade de gênero</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {resumos.reduce((acc, r) => acc + r.total_delegados, 0)}
                </span>
              </div>
              <p className="text-sm opacity-90">Total de Delegados</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {resumos.reduce((acc, r) => acc + r.total_validados, 0)}
                </span>
              </div>
              <p className="text-sm opacity-90">Delegados Validados</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {resumos.reduce((acc, r) => acc + r.total_pendentes, 0)}
                </span>
              </div>
              <p className="text-sm opacity-90">Aguardando Validação</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {resumos.filter(r => r.paridade_ok).length}/{resumos.length}
                </span>
              </div>
              <p className="text-sm opacity-90">Estados com Paridade</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Validados</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Pendentes</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ocupação</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Mulheres</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Paridade</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resumos.map((resumo) => (
                    <tr key={resumo.estado_uf} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">{resumo.estado_uf}</span>
                          <span className="text-gray-700">{estadosNomes[resumo.estado_uf]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-gray-900">
                        {resumo.total_delegados}
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-green-600">
                        {resumo.total_validados}
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-yellow-600">
                        {resumo.total_pendentes}
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(resumo.percentual_ocupacao, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {resumo.percentual_ocupacao.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-pink-600">
                        {resumo.percentual_mulheres.toFixed(1)}%
                      </td>
                      <td className="px-4 py-4 text-center">
                        {resumo.paridade_ok ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setEstadoSelecionado(resumo.estado_uf)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
