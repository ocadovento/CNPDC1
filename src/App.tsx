import { useState, useEffect, useRef } from 'react';
import { supabase, Usuario } from './lib/supabase';
import { Home, Calendar, Users, FileText, BookOpen, LogIn, LogOut, Shield } from 'lucide-react';
import HomePage from './pages/HomePage';
import ForumNacional from './pages/ForumNacional';
import ForunsEstaduais from './pages/ForunsEstaduais';
import CalendarioTeias from './pages/CalendarioTeias';
import GerenciarDelegacao from './pages/GerenciarDelegacao';
import InscricaoMembro from './pages/InscricaoMembro';
import SelecaoInscricao from './pages/SelecaoInscricao';
import ParticipantesTeia2026 from './pages/ParticipantesTeia2026';
import Login from './pages/Login';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import RepresentanteDashboard from './pages/RepresentanteDashboard';
import ResetPassword from './pages/ResetPassword';
import PublicEmbed from './pages/PublicEmbed';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [inscricaoEditandoId, setInscricaoEditandoId] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const isPasswordRecoveryRef = useRef(false);

  useEffect(() => {
    console.log('App iniciando...');

    const hash = window.location.hash;
    console.log('Hash atual:', hash);

    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      console.log('DETECTADO: Link de recuperação de senha no hash!');
      isPasswordRecoveryRef.current = true;
      setIsPasswordRecovery(true);
      setCurrentPage('reset-password');
      setLoading(false);
      return;
    }

    checkUser();

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'isPasswordRecoveryRef:', isPasswordRecoveryRef.current);
      (async () => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery detected, redirecting to reset-password');
          isPasswordRecoveryRef.current = true;
          setIsPasswordRecovery(true);
          setLoading(false);
          setCurrentPage('reset-password');
          window.location.hash = 'reset-password';
        } else if (event === 'SIGNED_IN' && session) {
          console.log('SIGNED_IN event, checking recovery flag:', isPasswordRecoveryRef.current);
          if (!isPasswordRecoveryRef.current) {
            await loadUserData(session.user.id);
          } else {
            console.log('BLOQUEADO: não carregar dados durante recuperação de senha');
          }
        } else if (event === 'SIGNED_OUT') {
          setUsuario(null);
          isPasswordRecoveryRef.current = false;
          setIsPasswordRecovery(false);
        }
      })();
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    console.log('Verificando usuário...');
    try {
      const validacaoOk = localStorage.getItem('validacao_tripla_ok');
      const participanteCpf = localStorage.getItem('participante_cpf');
      const participanteNome = localStorage.getItem('participante_nome');
      const participanteNomeMae = localStorage.getItem('participante_nome_mae');

      if (validacaoOk === 'true' && participanteCpf && participanteNome && participanteNomeMae) {
        console.log('Participante validado detectado:', participanteNome);
        setCurrentPage('inscricao');
        setLoading(false);
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'recovery') {
        console.log('Tokens de recuperação detectados no hash, redirecionando para reset-password');
        isPasswordRecoveryRef.current = true;
        setIsPasswordRecovery(true);
        setCurrentPage('reset-password');
        setLoading(false);
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão obtida:', session ? 'Existe' : 'Não existe', sessionError);

      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        setLoading(false);
        return;
      }

      if (session) {
        if (!isPasswordRecoveryRef.current) {
          await loadUserData(session.user.id);
        } else {
          console.log('BLOQUEADO no checkUser: não carregar dados durante recuperação');
          setLoading(false);
        }
      } else {
        console.log('Sem sessão ativa, finalizando loading');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (authUserId: string) => {
    console.log('Carregando dados do usuário:', authUserId);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      console.log('Dados do usuário:', data, error);

      if (error) {
        console.error('Erro ao carregar usuário:', error);
        setUsuario(null);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('Usuário não encontrado na base de dados');
        setUsuario(null);
        setLoading(false);
        return;
      }

      setUsuario(data);

      if (data.tipo_usuario === 'admin_geral' || data.tipo_usuario === 'admin_auxiliar') {
        setCurrentPage('admin-dashboard');
      } else if (data.tipo_usuario === 'representante_gt') {
        setCurrentPage('representante-dashboard');
      } else if (data.tipo_usuario === 'membro') {
        setCurrentPage('selecao-inscricao');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUsuario(null);
    } finally {
      console.log('Finalizando loading');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('validacao_tripla_ok');
    localStorage.removeItem('participante_cpf');
    localStorage.removeItem('participante_nome');
    localStorage.removeItem('participante_nome_mae');
    localStorage.removeItem('participante_inscricoes');
    localStorage.removeItem('inscricao_selecionada');
    await supabase.auth.signOut();
    setUsuario(null);
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario && currentPage !== 'home' && currentPage !== 'forum-nacional' && currentPage !== 'foruns-estaduais' && currentPage !== 'participantes-teia' && currentPage !== 'admin-register' && currentPage !== 'inscricao' && currentPage !== 'reset-password' && currentPage !== 'embed') {
    if (currentPage === 'login') {
      return <Login onLoginSuccess={checkUser} />;
    }
    setCurrentPage('login');
    return null;
  }

  if (currentPage === 'embed') {
    return <PublicEmbed />;
  }

  const navigation = [
    { id: 'home', label: 'Início', mobileLabel: 'Início', icon: Home, public: true },
    { id: 'forum-nacional', label: 'Fórum Nacional', mobileLabel: 'Fórum', icon: Users, public: true },
    { id: 'foruns-estaduais', label: 'Fóruns Estaduais', mobileLabel: 'Estaduais', icon: BookOpen, public: true },
    { id: 'participantes-teia', label: 'Delegação Teia 2026', mobileLabel: 'Delegação', icon: Users, public: true },
    { id: 'admin-dashboard', label: 'Painel Admin', mobileLabel: 'Admin', icon: Shield, public: false, roles: ['admin_geral', 'admin_auxiliar'] },
    { id: 'representante-dashboard', label: 'Painel Representante', mobileLabel: 'Painel', icon: Shield, public: false, roles: ['representante_gt'] },
    { id: 'calendario', label: 'Calendário', mobileLabel: 'Agenda', icon: Calendar, public: false, roles: ['admin_geral', 'admin_auxiliar'] },
    { id: 'selecao-inscricao', label: 'Minhas Inscrições', mobileLabel: 'Inscrições', icon: FileText, public: false, roles: ['membro'] },
  ];

  const visibleNav = navigation.filter(item => {
    if (item.public) return true;
    if (!usuario) return false;
    if (!item.roles) return true;
    return item.roles.includes(usuario.tipo_usuario);
  });

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'forum-nacional':
        return <ForumNacional />;
      case 'foruns-estaduais':
        return <ForunsEstaduais />;
      case 'admin-register':
        return <AdminRegister onRegisterSuccess={() => {
          checkUser();
          setCurrentPage('admin-dashboard');
        }} />;
      case 'admin-dashboard':
        return <AdminDashboard usuario={usuario} />;
      case 'representante-dashboard':
        return <RepresentanteDashboard usuario={usuario} onLogout={handleLogout} />;
      case 'participantes-teia':
        return <ParticipantesTeia2026 />;
      case 'calendario':
        return <CalendarioTeias usuario={usuario} onBack={() => {
          if (usuario?.tipo_usuario === 'admin_geral' || usuario?.tipo_usuario === 'admin_auxiliar') {
            setCurrentPage('admin-dashboard');
          } else if (usuario?.tipo_usuario === 'representante_gt') {
            setCurrentPage('representante-dashboard');
          }
        }} />;
      case 'delegacao':
        return <GerenciarDelegacao
          usuario={usuario}
          onBack={() => setCurrentPage('representante-dashboard')}
          onEditInscricao={(membroId) => {
            setInscricaoEditandoId(membroId);
            localStorage.setItem('inscricao_editando_admin', membroId);
            setCurrentPage('inscricao');
          }}
        />;
      case 'selecao-inscricao':
        return <SelecaoInscricao onSelectInscricao={(id) => setCurrentPage('inscricao')} />;
      case 'inscricao':
        return <InscricaoMembro
          usuario={usuario}
          onBack={() => {
            const editandoAdmin = localStorage.getItem('inscricao_editando_admin');
            if (editandoAdmin) {
              localStorage.removeItem('inscricao_editando_admin');
              setInscricaoEditandoId(null);
              setCurrentPage('delegacao');
            } else {
              setCurrentPage('selecao-inscricao');
            }
          }}
        />;
      case 'login':
        return <Login onLoginSuccess={checkUser} />;
      case 'reset-password':
        return <ResetPassword />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 md:py-0 md:h-16">
            <div className="flex items-center justify-between mb-3 md:mb-0">
              <img
                src="/logocnpdc.png"
                alt="CNPDC Logo"
                className="h-14 md:h-12 w-auto"
              />

              <div className="md:hidden">
                {usuario ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md active:scale-95"
                  >
                    <LogOut size={18} />
                    <span>Sair</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md active:scale-95"
                  >
                    <LogIn size={18} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <nav className="flex flex-wrap items-center gap-2 gap-y-1 md:gap-6">
                {visibleNav.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center space-x-1.5 text-sm md:text-sm font-semibold transition-colors py-1 md:py-0 active:scale-95 ${
                      currentPage === item.id
                        ? 'text-teal-600'
                        : 'text-gray-700 hover:text-teal-600'
                    }`}
                  >
                    <item.icon className="w-4 h-4 md:w-4 md:h-4" />
                    <span className="md:hidden whitespace-nowrap">{item.mobileLabel}</span>
                    <span className="hidden md:inline whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="hidden md:flex md:ml-6">
                {usuario ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                  >
                    <LogIn size={16} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Sobre a CNPDC</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Comissão Nacional dos Pontos de Cultura - Articulação e fortalecimento
                da Política Nacional de Cultura Viva
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Contato</h3>
              <p className="text-gray-600 text-sm">
                Email: culturavivanacional@gmail.com<br />
                Instagram: @culturavivabrasil<br />
                YouTube: @culturavivabrasil
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; 2025 CNPDC - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;