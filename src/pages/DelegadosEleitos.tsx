import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Download, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EstadoInfo {
  uf: string;
  nome: string;
  total: number;
  validados: number;
}

interface Delegado {
  id: string;
  nome_completo: string;
  nome_ponto_cultura: string;
  cpf: string;
  email: string;
  contato_whatsapp: string;
  cidade: string;
  estado_uf: string;
  inscricao_completa: boolean;
  cota_representada: string;
  data_validacao?: string;
}

const estadosNomes: { [key: string]: string } = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
  SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
};

export default function DelegadosEleitos() {
  const [estados, setEstados] = useState<EstadoInfo[]>([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const [delegados, setDelegados] = useState<Delegado[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstados();
  }, []);

  useEffect(() => {
    if (estadoSelecionado) {
      loadDelegados(estadoSelecionado);
    }
  }, [estadoSelecionado]);

  const loadEstados = async () => {
    try {
      setLoading(true);
      const { data: eventoNacional } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (!eventoNacional) return;

      const { data: delegados } = await supabase
        .from('delegacao_estado')
        .select('estado_uf, inscricao_completa')
        .eq('evento_id', eventoNacional.id)
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

      setEstados(Object.values(estadosMap).sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDelegados = async (uf: string) => {
    try {
      setLoading(true);
      const { data: eventoNacional } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (!eventoNacional) return;

      const { data } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoNacional.id)
        .eq('estado_uf', uf)
        .eq('tipo_delegado', 'eleito')
        .order('nome_completo');

      setDelegados(data || []);
    } catch (error) {
      console.error('Erro ao carregar delegados:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    if (!estadoSelecionado) return;

    const validados = delegados.filter(d => d.inscricao_completa);

    const ws = XLSX.utils.json_to_sheet(validados.map(d => ({
      'Tipo': d.tipo_delegado === 'suplente' ? 'Suplente' : 'Eleito',
      'Nome Completo': d.nome_completo,
      'CPF': d.cpf,
      'Email': d.email,
      'WhatsApp': d.contato_whatsapp,
      'Ponto de Cultura': d.nome_ponto_cultura,
      'Cidade': d.cidade,
      'UF': d.estado_uf,
      'Cota Representada': d.cota_representada,
      'Data Validação': d.data_validacao ? new Date(d.data_validacao).toLocaleDateString('pt-BR') : ''
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delegados Validados');
    XLSX.writeFile(wb, `delegados_eleitos_${estadoSelecionado}_validados.xlsx`);
  };

  if (estadoSelecionado) {
    const estadoInfo = estados.find(e => e.uf === estadoSelecionado);
    const validados = delegados.filter(d => d.inscricao_completa);
    const aguardando = delegados.filter(d => !d.inscricao_completa);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEstadoSelecionado(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Delegados Eleitos - {estadoInfo?.nome} ({estadoSelecionado})
              </h2>
              <p className="text-gray-600">
                {validados.length} validados de {delegados.length} inscritos
              </p>
            </div>
          </div>
          {validados.length > 0 && (
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Exportar Validados
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ponto de Cultura</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {delegados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Nenhum delegado inscrito neste estado
                    </td>
                  </tr>
                ) : (
                  delegados.map((delegado) => (
                    <tr key={delegado.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          delegado.tipo_delegado === 'suplente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {delegado.tipo_delegado === 'suplente' ? 'Suplente' : 'Eleito'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          delegado.inscricao_completa
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {delegado.inscricao_completa ? 'Validado' : 'Aguardando'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {delegado.nome_completo}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {delegado.nome_ponto_cultura}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {delegado.email || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {delegado.contato_whatsapp}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {delegado.cidade}
                      </td>
                    </tr>
                  ))
                )}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Delegados Eleitos por Estado</h2>
        <p className="text-gray-600">Selecione um estado para ver os delegados inscritos</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {estados.map((estado) => (
            <button
              key={estado.uf}
              onClick={() => setEstadoSelecionado(estado.uf)}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">{estado.uf}</span>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{estado.nome}</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900">{estado.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Validados:</span>
                  <span className="font-semibold text-green-600">{estado.validados}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
