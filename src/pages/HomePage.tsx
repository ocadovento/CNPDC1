import { useState, useEffect } from 'react';
import { Download, Users, Calendar, BookOpen, FileText, Image, Video, Eye, MapPin, Clock, Mail, Instagram, Youtube } from 'lucide-react';
import Teia2026Modal from '../components/Teia2026Modal';
import { supabase } from '../lib/supabase';

const formatarDataEvento = (dataString: string): string => {
  if (!dataString) return '';
  const data = new Date(dataString + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  description: string | null;
  category: string | null;
  file_type: 'pdf' | 'image' | 'video';
  upload_method: 'url' | 'upload';
  created_at: string;
}

interface Evento {
  id: string;
  tipo_evento: 'teia' | 'forum';
  data_evento: string;
  cidade: string;
  estado_uf: string;
  temas: string;
  quantidade_pontos_estimada: number | null;
  representante_nome?: string;
}

interface Relatorio {
  id: string;
  estado_uf: string;
  tipo_evento: 'teia' | 'forum';
  titulo: string;
  descricao: string;
  url_documento: string;
  file_type: string;
  created_at: string;
}

export default function HomePage() {
  const [showTeia2026Modal, setShowTeia2026Modal] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingRelatorios, setLoadingRelatorios] = useState(true);

  useEffect(() => {
    loadDocuments();
    loadEventos();
    loadRelatorios();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar documentos:', error);
        setDocuments([]);
        return;
      }
      setDocuments(data || []);
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_teias_foruns')
        .select(`
          *,
          representante:representante_id (
            nome_completo
          )
        `)
        .order('data_evento', { ascending: true });

      if (error) {
        console.error('Erro ao carregar eventos:', error);
        setEventos([]);
        return;
      }

      const eventosComNome = data?.map((evento: any) => ({
        ...evento,
        representante_nome: evento.representante?.nome_completo || null
      })) || [];

      setEventos(eventosComNome);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  const loadRelatorios = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorios_estaduais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar relatórios:', error);
        setRelatorios([]);
        return;
      }
      setRelatorios(data || []);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
      setRelatorios([]);
    } finally {
      setLoadingRelatorios(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-r from-green-600 to-yellow-500 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Bem-vindo à Plataforma CNPDC
        </h1>
        <p className="text-xl md:text-2xl text-green-50 leading-relaxed">
          Rede Nacional Cultura Viva - Articulação, fortalecimento e mobilização dos Pontos de Cultura
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600 hover:shadow-xl transition-shadow">
          <Users className="w-12 h-12 text-green-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-3">CNPDC</h2>
          <p className="text-gray-600 leading-relaxed">
            A Comissão Nacional de Pontos de Cultura é um colegiado autônomo e representativo
            que articula e fortalece a Política Nacional de Cultura Viva.
          </p>
        </div>

        <div
          onClick={() => document.getElementById('eventos-teias')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <Calendar className="w-12 h-12 text-yellow-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-3">Teias</h2>
          <p className="text-gray-600 leading-relaxed">
            Encontros da Rede Cultura Viva que promovem intercâmbio, formação e articulação
            entre Pontos de Cultura de todo o Brasil.
          </p>
          <p className="text-sm text-yellow-600 font-medium mt-3">
            Clique para ver os eventos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
          <BookOpen className="w-12 h-12 text-orange-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-3">Fórum Nacional</h2>
          <p className="text-gray-600 leading-relaxed">
            Instância deliberativa da rede que define diretrizes, elege representantes
            e constrói coletivamente o futuro da Cultura Viva.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Chamada para as Teias e Fóruns Estaduais 2025
        </h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <p className="mb-4">
            A Rede Nacional Cultura Viva convoca todos os Pontos de Cultura, Pontões e agentes culturais
            para participarem da construção coletiva do <strong>V Fórum Nacional dos Pontos de Cultura</strong>
            e da <strong>6ª TEIA Nacional</strong>, que acontecerá de 24 a 29 de março de 2026, em Aracruz/ES.
          </p>
          <p className="mb-4">
            As Teias e Fóruns Estaduais são etapas preparatórias fundamentais, onde debateremos o tema central
            <strong> "Pontos de Cultura pela Justiça Climática"</strong> e construiremos propostas para
            o Plano Nacional Cultura Viva +10.
          </p>
          <p className="mb-4">
            Cada estado deve organizar sua Teia e Fórum até <strong>15 de dezembro de 2025</strong>,
            elegendo até 30 delegados(as) que representarão a rede estadual no Fórum Nacional.
          </p>
        </div>
      </section>

      <section id="eventos-teias" className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Calendar className="mr-3 text-green-600" />
          Eventos GT Estaduais da CNPDC
        </h2>
        {loadingEventos ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : eventos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum evento cadastrado no momento.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="border-2 border-gray-200 rounded-lg p-5 hover:border-green-500 hover:shadow-lg transition-all"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      evento.tipo_evento === 'teia'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {evento.tipo_evento === 'teia' ? 'TEIA' : 'FÓRUM'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {evento.estado_uf}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold">{evento.cidade}/{evento.estado_uf}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600 mb-3">
                    <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {formatarDataEvento(evento.data_evento.split('T')[0])}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Temas:</strong>
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {evento.temas}
                    </p>
                  </div>
                  {evento.quantidade_pontos_estimada && (
                    <div className="mt-3 text-center">
                      <span className="text-sm text-gray-600">
                        Estimativa: <strong className="text-green-700">{evento.quantidade_pontos_estimada}</strong> pontos
                      </span>
                    </div>
                  )}
                </div>
                {evento.representante_nome && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Adicionado por: <span className="font-medium text-gray-600">{evento.representante_nome}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl shadow-lg p-8 border-l-4 border-green-600">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          Participe e fortaleça a Cultura Viva no seu território!
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Entre em contato com o representante do GT Estadual do seu estado e organize-se
          para participar das mobilizações locais. Juntos, construímos uma política cultural
          democrática, participativa e transformadora.
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Download className="mr-3 text-green-600" />
          Documentos Disponíveis
        </h2>
        {loadingDocs ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum documento disponível no momento.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const getIcon = () => {
                switch (doc.file_type) {
                  case 'image':
                    return <Image className="w-6 h-6 text-green-600" />;
                  case 'video':
                    return <Video className="w-6 h-6 text-green-600" />;
                  default:
                    return <FileText className="w-6 h-6 text-green-600" />;
                }
              };

              return (
                <div
                  key={doc.id}
                  className="border-2 border-gray-200 rounded-lg p-5 hover:border-green-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    {getIcon()}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {doc.category && (
                          <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {doc.category}
                          </span>
                        )}
                        <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {doc.file_type === 'pdf' && 'PDF'}
                          {doc.file_type === 'image' && 'Imagem'}
                          {doc.file_type === 'video' && 'Vídeo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1 flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye size={16} />
                      <span>Ver</span>
                    </a>
                    <a
                      href={doc.file_url}
                      download={doc.file_name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1 flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Download size={16} />
                      <span>Baixar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FileText className="mr-3 text-orange-600" />
          Relatórios Estaduais
        </h2>
        {loadingRelatorios ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : relatorios.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum relatório enviado ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {relatorios.map((relatorio) => (
              <div
                key={relatorio.id}
                className="border-2 border-gray-200 rounded-lg p-5 hover:border-orange-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        relatorio.tipo_evento === 'teia'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {relatorio.tipo_evento === 'teia' ? 'TEIA' : 'FÓRUM'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {relatorio.estado_uf}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      {relatorio.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {relatorio.descricao}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a
                      href={relatorio.url_documento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                    >
                      <Eye size={16} />
                      Ver
                    </a>
                    <a
                      href={relatorio.url_documento}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm whitespace-nowrap"
                    >
                      <Download size={16} />
                      Baixar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        onClick={() => setShowTeia2026Modal(true)}
        className="bg-gradient-to-r from-teal-600 to-green-500 rounded-xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Inscrições Teia 2026
            </h2>
            <p className="text-lg leading-relaxed text-teal-50 mb-2">
              Faça sua inscrição para participar da Teia 2026 no Espírito Santo.
            </p>
            <p className="text-sm text-teal-100">
              Clique aqui para saber mais sobre o processo de inscrição
            </p>
          </div>
          <div className="hidden md:block text-white/30">
            <FileText className="h-24 w-24" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-green-600" />
          Calendário Nacional de Mobilização – Fóruns e TEIA 2026
        </h2>
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Comissão Organizadora Nacional:</span>
          <a
            href="mailto:teia2026@cultura.gov.br"
            className="text-green-700 font-semibold hover:underline"
          >
            teia2026@cultura.gov.br
          </a>
        </div>
        <a
          href="https://www.canva.com/design/DAGzDI-B5Cg/6o0xzh7YYgIud0AYTndSwQ/view"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <div className="w-full bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 border-2 border-green-300 rounded-lg hover:border-green-500 transition-all cursor-pointer group overflow-hidden" style={{ minHeight: '500px' }}>
            <div className="h-full flex flex-col items-center justify-center p-12 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIwYjJhYSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

              <div className="relative z-10 text-center">
                <div className="bg-green-600 rounded-full p-6 inline-block mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="h-16 w-16 text-white" />
                </div>

                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Calendário Interativo 2025-2026
                </h3>

                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Visualize todas as datas dos Fóruns Estaduais e eventos da TEIA 2026 em um calendário completo e navegável
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Datas e Prazos</span>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Todos os Estados</span>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Eventos e Mobilizações</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 bg-green-600 text-white font-bold text-lg px-10 py-4 rounded-lg shadow-xl group-hover:bg-green-700 group-hover:shadow-2xl transition-all">
                  <Eye className="h-6 w-6" />
                  <span>Clique para Visualizar o Calendário Completo</span>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  O calendário abrirá em uma nova aba com visualização completa
                </p>
              </div>
            </div>
          </div>
        </a>
      </section>

      <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Cultura Viva pela Justiça Climática</h2>
        <p className="text-lg leading-relaxed text-orange-50">
          Sem cultura não há democracia. Os Pontos de Cultura são protagonistas na regeneração
          dos territórios e na luta contra a crise climática. Venha construir conosco o futuro
          que cultivamos nos territórios!
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Mail className="mr-3 text-green-600" />
          Contato
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="font-semibold text-gray-700">Email:</span>
            <a
              href="mailto:culturavivanacional@gmail.com"
              className="text-blue-600 hover:underline"
            >
              culturavivanacional@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-pink-600 flex-shrink-0" />
            <span className="font-semibold text-gray-700">Instagram:</span>
            <a
              href="https://instagram.com/culturavivabrasil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @culturavivabrasil
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Youtube className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="font-semibold text-gray-700">YouTube:</span>
            <a
              href="https://youtube.com/@culturavivabrasil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @culturavivabrasil
            </a>
          </div>
        </div>
      </section>

      <Teia2026Modal
        isOpen={showTeia2026Modal}
        onClose={() => setShowTeia2026Modal(false)}
      />
    </div>
  );
}