import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const initializePasswordReset = async () => {
      try {
        const hash = window.location.hash.substring(1);
        console.log('Hash da URL:', hash);

        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Parâmetros extraídos:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: type
        });

        if (accessToken && type === 'recovery') {
          console.log('Configurando sessão de recuperação...');

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          console.log('Resultado do setSession:', {
            hasSession: !!data?.session,
            hasUser: !!data?.user,
            error: sessionError?.message
          });

          if (sessionError) {
            console.error('Erro ao configurar sessão:', sessionError);
            setError('Link de reset inválido ou expirado. Por favor, solicite um novo link de recuperação.');
            setCheckingSession(false);
            return;
          }

          if (data?.session) {
            console.log('Sessão de recuperação configurada com sucesso!');
            setIsValidSession(true);
            setCheckingSession(false);
            return;
          } else {
            console.error('SetSession não retornou uma sessão válida');
            setError('Link de reset inválido ou expirado. Por favor, solicite um novo link de recuperação.');
            setCheckingSession(false);
            return;
          }
        }

        console.log('Verificando sessão existente...');
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        console.log('Sessão existente:', {
          hasSession: !!session,
          error: getSessionError?.message
        });

        if (getSessionError) {
          console.error('Erro ao verificar sessão:', getSessionError);
          setError('Link de reset inválido ou expirado. Por favor, solicite um novo link de recuperação.');
          setCheckingSession(false);
          return;
        }

        if (session) {
          console.log('Sessão válida encontrada');
          setIsValidSession(true);
        } else {
          console.log('Nenhuma sessão válida encontrada');
          setError('Link de reset inválido ou expirado. Por favor, solicite um novo link de recuperação.');
        }

        setCheckingSession(false);
      } catch (err: any) {
        console.error('Erro no processamento:', err);
        setError('Erro ao processar link de recuperação. Por favor, tente novamente.');
        setCheckingSession(false);
      }
    };

    initializePasswordReset();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem. Por favor, verifique e tente novamente.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        setError(`Erro ao redefinir senha: ${error.message}`);
        setLoading(false);
        return;
      }

      setSuccess(true);

      await supabase.auth.signOut();

      setTimeout(() => {
        window.location.hash = 'login';
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao redefinir senha. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.hash = 'login';
    window.location.reload();
  };

  if (checkingSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando link de recuperação...</p>
            <p className="text-sm text-gray-500 mt-2">Por favor, aguarde</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Senha Redefinida!</h2>
            <p className="text-gray-600 mb-4">
              Sua senha foi atualizada com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para a página de login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <img
              src="/logocnpdc.png"
              alt="CNPDC Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">Link Inválido</h2>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-start mb-4">
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar para Login</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Redefinir Senha</h2>
          <p className="text-gray-600 mt-2">Digite sua nova senha abaixo</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
            <p className="text-xs text-gray-500 mt-1">
              A senha deve ter no mínimo 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              minLength={6}
              placeholder="Digite a senha novamente"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Atualizando senha...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>Dica de Segurança:</strong> Use uma senha forte e única que você não utilize em outros sites.
          </p>
        </div>
      </div>
    </div>
  );
}
