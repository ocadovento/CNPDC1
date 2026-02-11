import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DelegadoNato {
  id: string;
  nome_completo: string;
  nome_ponto_cultura: string;
  cpf: string;
  email: string;
  contato_whatsapp: string;
  cidade: string;
  estado_uf: string;
  gt_responsavel: string;
  inscricao_completa: boolean;
  cota_representada: string;
  data_validacao?: string;
}

export default function DelegadosNatos() {
  const [delegados, setDelegados] = useState<DelegadoNato[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDelegadosNatos();
  }, []);

  const loadDelegadosNatos = async () => {
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
        .eq('tipo_delegado', 'nato')
        .order('gt_responsavel')
        .order('estado_uf')
        .order('nome_completo');

      setDelegados(data || []);
    } catch (error) {
      console.error('Erro ao carregar delegados natos:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const validados = delegados.filter(d => d.inscricao_completa);

    const ws = XLSX.utils.json_to_sheet(validados.map(d => ({
      'GT': d.gt_responsavel,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Delegados Natos');
    XLSX.writeFile(wb, `delegados_natos_validados.xlsx`);
  };

  const validados = delegados.filter(d => d.inscricao_completa);
  const aguardando = delegados.filter(d => !d.inscricao_completa);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Delegados Natos (GT/Executiva)</h2>
          <p className="text-gray-600">
            {validados.length} validados de {delegados.length} inscritos
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{delegados.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-800 font-medium">Validados</p>
              <p className="text-2xl font-bold text-green-900">{validados.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Aguardando</p>
              <p className="text-2xl font-bold text-yellow-900">{aguardando.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ponto de Cultura</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">UF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {delegados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Nenhum delegado nato inscrito
                    </td>
                  </tr>
                ) : (
                  delegados.map((delegado) => (
                    <tr key={delegado.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          delegado.inscricao_completa
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {delegado.inscricao_completa ? 'Validado' : 'Aguardando'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          {delegado.gt_responsavel}
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
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {delegado.estado_uf}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
