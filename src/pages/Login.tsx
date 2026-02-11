import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [loginType, setLoginType] = useState<'admin' | 'representante' | 'membro'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleAdminLogin = async () => {
    console.log('Tentando login admin com:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log('Resposta do login:', { data, error });

      if (error) {
        console.error('Erro de login:', error);
        setError(`Erro: ${error.message}`);
        return;
      }

      if (data?.session) {
        console.log('Login bem-sucedido! Sessão:', data.session);
        onLoginSuccess();
      } else {
        setError('Login não retornou uma sessão válida');
      }
    } catch (err: any) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao fazer login');
    }
  };

  const handleMembroLogin = async () => {
    try {
      const cpfLimpo = cpf.replace(/\D/g, '');

      if (cpfLimpo.length !== 11) {
        setError('CPF inválido. Digite os 11 dígitos.');
        return;
      }

      if (!nomeCompleto.trim() || !nomeMae.trim()) {
        setError('Por favor, preencha todos os campos.');
        return;
      }

      const nomeCompletoLimpo = nomeCompleto.trim().replace(/\s+/g, ' ');
      const nomeMaeLimpo = nomeMae.trim().replace(/\s+/g, ' ');

      console.log('🔍 Tentando login com:', {
        nome: nomeCompletoLimpo,
        cpf: cpfLimpo,
        mae: nomeMaeLimpo
      });

      const { data: inscricoes, error: dbError } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('cpf', cpfLimpo)
        .ilike('nome_completo', nomeCompletoLimpo)
        .ilike('nome_mae', nomeMaeLimpo);

      console.log('📊 Resultado da query:', {
        total: inscricoes?.length || 0,
        inscricoes,
        dbError
      });

      if (dbError) {
        console.error('❌ Erro no banco:', dbError);
        throw dbError;
      }

      if (!inscricoes || inscricoes.length === 0) {
        console.log('⚠️ Nenhum registro encontrado. Tentando buscar por CPF apenas...');

        const { data: porCpf } = await supabase
          .from('delegacao_estado')
          .select('nome_completo, cpf, nome_mae')
          .eq('cpf', cpfLimpo);

        console.log('🔎 Registros com este CPF:', porCpf);

        setError('Dados não conferem. Verifique se o nome completo, CPF e nome da mãe estão corretos.');
        return;
      }

      console.log('✅ Login encontrado! Total:', inscricoes.length);

      const eventoIds = [...new Set(inscricoes.map((i: any) => i.evento_id))];
      const { data: eventos } = await supabase
        .from('eventos_teias_foruns')
        .select('id, tipo_evento, cidade, estado_uf')
        .in('id', eventoIds);

      console.log('📅 Eventos encontrados:', eventos);

      inscricoes.forEach((inscricao: any) => {
        inscricao.evento = eventos?.find((e: any) => e.id === inscricao.evento_id);
      });

      const inscricoesTeiaNacional = inscricoes.filter((insc: any) => {
        return insc.evento?.tipo_evento === 'teia' &&
               insc.evento?.cidade === 'Aracruz' &&
               insc.evento?.estado_uf === 'ES';
      });

      if (inscricoesTeiaNacional.length === 0) {
        setError('Nenhuma inscrição na Teia Nacional 2026 encontrada. Verifique seus dados com o representante do seu estado.');
        return;
      }

      console.log('Salvando validação tripla:', {
        cpf: cpfLimpo,
        nome: inscricoesTeiaNacional[0].nome_completo,
        nome_mae: inscricoesTeiaNacional[0].nome_mae
      });

      localStorage.setItem('validacao_tripla_ok', 'true');
      localStorage.setItem('participante_cpf', cpfLimpo);
      localStorage.setItem('participante_nome', inscricoesTeiaNacional[0].nome_completo);
      localStorage.setItem('participante_nome_mae', inscricoesTeiaNacional[0].nome_mae);
      localStorage.setItem('inscricao_selecionada', JSON.stringify(inscricoesTeiaNacional[0]));

      setSuccessMessage('Login realizado com sucesso! Redirecionando...');

      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (loginType === 'admin' || loginType === 'representante') {
      await handleAdminLogin();
    } else {
      await handleMembroLogin();
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const redirectUrl = `${window.location.origin}/#reset-password`;
      console.log('Enviando email de recuperação com redirectTo:', redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        setError(`Erro: ${error.message}`);
      } else {
        console.log('Email de recuperação enviado com sucesso!');
        setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada (e também a pasta de spam). O link expira em 1 hora.');
        setShowForgotPassword(false);
      }
    } catch (err: any) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao enviar email de recuperação');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-start mb-4">
          <button
            onClick={() => {
              window.location.hash = 'home';
              window.location.reload();
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar para Página Inicial</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <img
            src="/logocnpdc.png"
            alt="CNPDC Logo"
            className="h-24 w-auto mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-800">Entrar</h2>
          <p className="text-gray-600 mt-2">Acesse a plataforma CNPDC</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`py-2 px-3 rounded-md font-medium transition-all text-sm ${
                loginType === 'admin'
                  ? 'bg-white text-green-700 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginType('representante')}
              className={`py-2 px-3 rounded-md font-medium transition-all text-sm ${
                loginType === 'representante'
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Representante GT Estadual CNPDC
            </button>
            <button
              type="button"
              onClick={() => setLoginType('membro')}
              className={`py-2 px-3 rounded-md font-medium transition-all text-sm ${
                loginType === 'membro'
                  ? 'bg-white text-teal-700 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Participante
            </button>
          </div>
        </div>

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                Digite seu email para receber um link de recuperação de senha
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Email'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            {loginType === 'admin' || loginType === 'representante' ? (
              <>
                {loginType === 'representante' && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800 font-medium">
                      Login para Representante GT Estadual - CNPDC
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
          ) : (
            <>
              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                <p className="text-sm text-teal-800 font-medium">
                  Participante Teia/Fórum Inscrito
                </p>
                <p className="text-sm text-teal-700 mt-1">
                  Digite seus dados para acessar. Você precisa ter sido adicionado por um representante.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  placeholder="Digite seu nome completo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exatamente como foi cadastrado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Mãe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomeMae}
                  onChange={(e) => setNomeMae(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  placeholder="Digite o nome completo da sua mãe"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exatamente como foi cadastrado
                </p>
              </div>
            </>
          )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  : loginType === 'representante'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
              }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Primeiro acesso como administrador?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'admin-register';
                window.location.reload();
              }}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Registrar Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}