import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Calendar, MapPin, TrendingUp } from 'lucide-react';

interface EstatisticasPublicas {
  totalValidados: number;
  totalEleitos: number;
  totalNatos: number;
  totalSuplentes: number;
  estadosComDelegacao: number;
  proximosEventos: any[];
}

export default function PublicEmbed() {
  const [stats, setStats] = useState<EstatisticasPublicas>({
    totalValidados: 0,
    totalEleitos: 0,
    totalNatos: 0,
    totalSuplentes: 0,
    estadosComDelegacao: 0,
    proximosEventos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicStats();
  }, []);

  const loadPublicStats = async () => {
    try {
      const { data: eventoNacional } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .gte('data_evento', '2026-01-01')
        .maybeSingle();

      if (eventoNacional) {
        const { data: delegados } = await supabase
          .from('delegacao_estado')
          .select('tipo_delegado, inscricao_completa, estado_uf')
          .eq('evento_id', eventoNacional.id);

        const validados = delegados?.filter(d => d.inscricao_completa) || [];
        const eleitos = delegados?.filter(d => d.tipo_delegado === 'eleito') || [];
        const natos = delegados?.filter(d => d.tipo_delegado === 'nato') || [];
        const suplentes = delegados?.filter(d => d.tipo_delegado === 'suplente') || [];
        const estados = new Set(delegados?.map(d => d.estado_uf) || []);

        const { data: eventos } = await supabase
          .from('eventos_teias_foruns')
          .select('*')
          .gte('data_evento', new Date().toISOString())
          .order('data_evento', { ascending: true })
          .limit(3);

        setStats({
          totalValidados: validados.length,
          totalEleitos: eleitos.length,
          totalNatos: natos.length,
          totalSuplentes: suplentes.length,
          estadosComDelegacao: estados.size,
          proximosEventos: eventos || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Teia Nacional 2026</h1>
            <p className="text-green-100 text-sm">Aracruz/ES - 24 a 29 de Março</p>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Estatísticas em Tempo Real
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.totalValidados}</div>
                <div className="text-xs opacity-90">Validados</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.totalEleitos}</div>
                <div className="text-xs opacity-90">Eleitos</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.totalNatos}</div>
                <div className="text-xs opacity-90">Natos</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.totalSuplentes}</div>
                <div className="text-xs opacity-90">Suplentes</div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-blue-900">
                  {stats.estadosComDelegacao} estados com delegação cadastrada
                </p>
              </div>
              <p className="text-blue-700 text-sm">
                Representando todos os cantos do Brasil na Teia Nacional
              </p>
            </div>

            {stats.proximosEventos.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Próximos Eventos
                </h3>
                <div className="space-y-3">
                  {stats.proximosEventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {evento.tipo_evento === 'teia' ? 'Teia' : 'Fórum'} - {evento.cidade}/{evento.estado_uf}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(evento.data_evento).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          {evento.temas && (
                            <p className="text-xs text-gray-500 mt-2">{evento.temas}</p>
                          )}
                        </div>
                        {evento.quantidade_pontos_estimada > 0 && (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            ~{evento.quantidade_pontos_estimada} participantes
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Sistema de Gestão de Delegações CNPDC
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dados atualizados em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
