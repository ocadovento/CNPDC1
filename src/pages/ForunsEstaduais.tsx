import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Users, CheckCircle, AlertCircle, FileText, ExternalLink, AlertTriangle, Clock, Mail } from 'lucide-react';

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

export default function ForunsEstaduais() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatorios();
  }, []);

  const loadRelatorios = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorios_estaduais')
        .select('*')
        .order('estado_uf', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatorios(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8">
      <div
        className="relative bg-cover bg-center text-white py-24 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: 'linear-gradient(rgba(20, 83, 45, 0.85), rgba(20, 83, 45, 0.85)), url("https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920")',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Fóruns Estaduais dos Pontos de Cultura
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-4xl">
            Orientações para realização dos Fóruns Estaduais. Os Fóruns Estaduais
            são a base da participação democrática e representativa da Rede de Pontos de Cultura.
          </p>

          {/* Seção de Prazos e Excepcionalidades */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-6 border-2 border-white/30">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-7 w-7 text-yellow-300 flex-shrink-0 mt-1" />
              <h3 className="text-2xl font-bold text-white">PRAZOS IMPORTANTES</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/95 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Clock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Prazo Padrão</h4>
                    <p className="text-red-700 font-bold text-lg">até 15 de dezembro de 2025</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Enviar resoluções até 10 dias após o Fórum
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Prazo Excepcional</h4>
                    <p className="text-orange-700 font-bold text-lg">até 1º de março de 2026</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Com justificativa formal à Comissão Organizadora Nacional
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-300/90 rounded-lg p-4 mt-4 shadow-lg">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-yellow-900 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-900">
                  <p className="font-semibold mb-1">Envio de Relatórios:</p>
                  <p className="mb-1">
                    <span className="font-semibold">Email:</span>{' '}
                    <a href="mailto:teia2026@cultura.gov.br" className="text-blue-700 hover:underline font-bold">
                      teia2026@cultura.gov.br
                    </a> e registro na plataforma CNPDC
                  </p>
                  <p className="text-red-800 font-bold mt-2">
                    Fóruns após 24/02/2026: Enviar documentos até 6 de março de 2026 (PRAZO FINAL)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Passo a Passo para Realização
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Organização Prévia</h3>
                <p className="text-gray-700">
                  Formar a Comissão Organizadora Estadual com representantes da Rede Cultura Viva,
                  garantindo autonomia, transparência e articulação com o poder público.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Definição de Data e Comunicação</h3>
                <p className="text-gray-700">
                  Definir a data e o local do Fórum Estadual (prazo padrão até 15/12/2025 ou excepcional até 01/03/2026)
                  e comunicar via e-mail: <strong className="text-green-700">teia2026@cultura.gov.br</strong> e registro na plataforma CNPDC
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Divulgação e Convocatória</h3>
                <p className="text-gray-700">
                  Lançar convocatória oficial com pelo menos 30 dias de antecedência, utilizando redes
                  sociais, e-mails, grupos e parceiros culturais.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inscrições</h3>
                <p className="text-gray-700">
                  Abrir inscrições para representantes de Pontos e Pontões certificados, solicitando
                  certificado ou edital de certificação e documento oficial com foto.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Credenciamento</h3>
                <p className="text-gray-700">
                  Realizar credenciamento presencial no dia do Fórum, com conferência de documentos,
                  entrega de crachás e registro de presença.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Validação do Fórum</h3>
                <p className="text-gray-700">
                  Garantir a presença de representantes de Pontos ou Pontões de pelo menos três
                  municípios distintos para validar o Fórum.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                7
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Eleição de Delegados(as)</h3>
                <p className="text-gray-700">
                  Realizar eleição de até 30 delegados(as), respeitando as cotas e paridade.
                  Se houver menos de 30 participantes, eleger proporcionalmente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Sistema de Cotas e Representatividade
          </h2>
          <p className="text-center text-gray-600 text-lg mb-12">
            Cotas obrigatórias para garantir a representatividade nas delegações estaduais
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">20%</div>
              <h3 className="font-bold text-gray-900 mb-1">Pessoas Negras</h3>
              <p className="text-gray-600">6 vagas entre 30 delegados</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">10%</div>
              <h3 className="font-bold text-gray-900 mb-1">Povos Indígenas</h3>
              <p className="text-gray-600">3 vagas entre 30 delegados</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">10%</div>
              <h3 className="font-bold text-gray-900 mb-1">Pessoas com Deficiência</h3>
              <p className="text-gray-600">3 vagas entre 30 delegados</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">10%</div>
              <h3 className="font-bold text-gray-900 mb-1">Jovens</h3>
              <p className="text-gray-600">3 vagas entre 30 delegados</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">10%</div>
              <h3 className="font-bold text-gray-900 mb-1">Pessoas Idosas 60+</h3>
              <p className="text-gray-600">3 vagas entre 30 delegados</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">8%</div>
              <h3 className="font-bold text-gray-900 mb-1">Pessoas LGBTQPN+</h3>
              <p className="text-gray-600">2 vagas entre 30 delegados</p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-3">Paridade de Gênero</h3>
            <div className="text-5xl font-bold mb-2">50%</div>
            <p className="text-xl">Mínimo de 15 mulheres entre 30 delegados</p>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Teias e Fóruns Municipais
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                As Teias e Fóruns Municipais e/ou Regionais têm caráter mobilizador e de debate político,
                não constituindo-se em etapas de indicação de delegados para o Fórum Nacional, mas são
                fundamentais para fortalecer a articulação local e construir propostas territoriais.
              </p>
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Recomendação
                </h3>
                <p className="text-green-800">
                  Organize encontros em seu município para debater o tema "Pontos de Cultura pela Justiça Climática"
                  e os eixos temáticos, fortalecendo a participação da rede local no Fórum Estadual.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Participação comunitária"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Relatórios dos Fóruns e Teias Estaduais
            </h2>
            <p className="text-xl text-gray-600">
              Documentos e relatórios oficiais publicados pelos Representantes GT Estaduais
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando relatórios...</p>
            </div>
          ) : relatorios.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum relatório publicado ainda</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatorios.map((relatorio) => (
                <div
                  key={relatorio.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      relatorio.tipo_evento === 'teia_estadual'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {relatorio.tipo_evento === 'teia_estadual' ? 'Teia' : 'Fórum'} - {relatorio.estado_uf}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      relatorio.file_type === 'pdf'
                        ? 'bg-red-100 text-red-700'
                        : relatorio.file_type === 'link'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {relatorio.file_type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {relatorio.titulo}
                  </h3>

                  {relatorio.descricao && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {relatorio.descricao}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {relatorio.url_documento.startsWith('file:///') ? (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Link inválido</span>
                      </div>
                    ) : (
                      <a
                        href={relatorio.url_documento}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Ver documento
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Informações Importantes</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-blue-800 rounded-xl p-6">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Prazo Final</h3>
              <p className="text-blue-100">
                Todos os Fóruns Estaduais devem ser realizados até 15 de dezembro de 2025
              </p>
            </div>

            <div className="bg-blue-800 rounded-xl p-6">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Validação</h3>
              <p className="text-blue-100">
                Presença de representantes de pelo menos 3 municípios distintos
              </p>
            </div>

            <div className="bg-blue-800 rounded-xl p-6">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Delegação</h3>
              <p className="text-blue-100">
                Até 30 delegados por estado, respeitando sistema de cotas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
