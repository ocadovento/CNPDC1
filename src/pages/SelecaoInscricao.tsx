import { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Inscricao {
  id: string;
  nome_ponto_cultura: string;
  nome_completo: string;
  cpf: string;
  email: string;
  contato_whatsapp: string;
  cidade: string;
  estado_uf: string;
  cota_representada: string;
  inscricao_completa: boolean;
  evento_id: string;
}

interface SelecaoInscricaoProps {
  onSelectInscricao: (inscricaoId: string) => void;
}

export default function SelecaoInscricao({ onSelectInscricao }: SelecaoInscricaoProps) {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [cpf, setCpf] = useState('');
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInscricoes();
  }, [onSelectInscricao]);

  const loadInscricoes = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log('Usuário autenticado detectado');
        const { data: usuario, error: usuarioError } = await supabase
          .from('usuarios')
          .select('cpf, nome, email')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (usuarioError || !usuario || !usuario.cpf) {
          console.error('Erro ao carregar usuário:', usuarioError);
          setAcessoNegado(true);
          setLoading(false);
          return;
        }

        setCpf(usuario.cpf);

        const { data: inscricoesDB, error: inscricoesError } = await supabase
          .from('inscricoes_membros')
          .select('*')
          .eq('cpf', usuario.cpf);

        if (inscricoesError) {
          console.error('Erro ao carregar inscrições:', inscricoesError);
          setAcessoNegado(true);
          setLoading(false);
          return;
        }

        const inscricoesData = inscricoesDB || [];
        setInscricoes(inscricoesData);

        if (inscricoesData.length === 1) {
          localStorage.setItem('inscricao_selecionada', JSON.stringify(inscricoesData[0]));
          onSelectInscricao(inscricoesData[0].id);
        }

        setLoading(false);
        return;
      }

      const validacaoOk = localStorage.getItem('validacao_tripla_ok');
      const cpfStorage = localStorage.getItem('participante_cpf');
      const nomeStorage = localStorage.getItem('participante_nome');
      const nomeMaeStorage = localStorage.getItem('participante_nome_mae');

      console.log('Verificando validação tripla:', { validacaoOk, cpfStorage, nomeStorage, nomeMaeStorage });

      if (validacaoOk !== 'true' || !cpfStorage || !nomeStorage || !nomeMaeStorage) {
        console.error('Validação tripla não foi realizada e usuário não está autenticado!');
        setAcessoNegado(true);
        setLoading(false);
        return;
      }

      setCpf(cpfStorage);

      const inscricoesStorage = localStorage.getItem('participante_inscricoes');
      if (inscricoesStorage) {
        try {
          const data = JSON.parse(inscricoesStorage);
          console.log('Inscrições carregadas do localStorage:', data);
          setInscricoes(data);

          if (data.length === 1) {
            console.log('Apenas uma inscrição encontrada, redirecionando automaticamente...');
            localStorage.setItem('inscricao_selecionada', JSON.stringify(data[0]));
            onSelectInscricao(data[0].id);
          }
        } catch (error) {
          console.error('Erro ao carregar inscrições:', error);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
      setAcessoNegado(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas inscrições...</p>
        </div>
      </div>
    );
  }

  if (acessoNegado) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-8">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você precisa realizar a validação de identidade tripla ou fazer login para acessar suas inscrições.
          </p>
          <a
            href="#validacao-identidade"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold mr-3"
          >
            Validar Identidade
          </a>
          <a
            href="#login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  const handleSelectInscricao = (inscricao: Inscricao) => {
    const cpfInscricao = inscricao.cpf || '';

    if (cpfInscricao.replace(/\D/g, '') !== cpf.replace(/\D/g, '')) {
      alert('Você só pode acessar sua própria inscrição!');
      return;
    }

    localStorage.setItem('inscricao_selecionada', JSON.stringify(inscricao));
    onSelectInscricao(inscricao.id);
  };

  const formatCota = (cota: string | undefined) => {
    if (!cota) return 'Não informado';
    return cota.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCpf = (cpfStr: string) => {
    const cleaned = cpfStr.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <Users className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Suas Inscrições</h2>
          <p className="text-gray-600 mb-3">
            Selecione a inscrição que você deseja preencher ou visualizar
          </p>
          {cpf && (
            <div className="inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-lg text-sm font-medium">
              CPF: {formatCpf(cpf)}
            </div>
          )}
        </div>

        {inscricoes.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma inscrição encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inscricoes.map((inscricao) => {
              const isMinha = inscricao.cpf?.replace(/\D/g, '') === cpf.replace(/\D/g, '');

              return (
                <div
                  key={inscricao.id}
                  className={`border rounded-lg p-6 transition-all ${
                    isMinha
                      ? 'border-teal-500 bg-teal-50 hover:shadow-lg cursor-pointer'
                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => isMinha && handleSelectInscricao(inscricao)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {inscricao.inscricao_completa ? (
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-yellow-400 flex-shrink-0"></div>
                        )}
                        <h3 className="text-xl font-bold text-gray-900">
                          {inscricao.nome_completo}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
                        <div>
                          <p className="text-sm text-gray-600">Ponto de Cultura</p>
                          <p className="font-semibold text-gray-900">{inscricao.nome_ponto_cultura}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Localização</p>
                          <p className="font-semibold text-gray-900">
                            {inscricao.cidade} - {inscricao.estado_uf}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Cota Representada</p>
                          <p className="font-semibold text-gray-900">{formatCota(inscricao.cota_representada)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              inscricao.inscricao_completa
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {inscricao.inscricao_completa ? 'Validada' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isMinha && (
                      <div className="ml-4 flex items-center">
                        <FileText className="h-8 w-8 text-teal-600" />
                      </div>
                    )}
                  </div>

                  {isMinha && (
                    <div className="mt-4 ml-9 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-sm text-blue-800">
                        {inscricao.inscricao_completa
                          ? 'Clique para visualizar ou editar sua inscrição'
                          : 'Clique para preencher o formulário completo de inscrição'}
                      </p>
                    </div>
                  )}

                  {!isMinha && (
                    <div className="mt-4 ml-9 bg-gray-100 border-l-4 border-gray-400 p-3 rounded">
                      <p className="text-sm text-gray-600">
                        Esta inscrição não pertence ao CPF informado
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded text-left">
            <h4 className="font-bold text-teal-900 mb-2">Importante:</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• Você só pode acessar inscrições do seu próprio CPF</li>
              <li>• Clique na sua inscrição para preencher, visualizar ou editar o formulário</li>
              <li>• Você pode editar e salvar sua inscrição quantas vezes precisar</li>
              <li>• Após preencher, sua inscrição será validada automaticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
