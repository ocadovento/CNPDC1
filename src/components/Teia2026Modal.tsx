import { X, UserPlus } from 'lucide-react';

interface Teia2026ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Teia2026Modal({ isOpen, onClose }: Teia2026ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-green-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Inscrições Teia 2026</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Como funciona o processo de inscrição?
            </h3>
            <p className="text-blue-800 leading-relaxed">
              As inscrições de membros delegados e participantes para a Teia 2026 no Espírito Santo
              são feitas através da entrada de nomes por um <strong>representante de Grupo de Trabalho
              da CNPDC estadual</strong> e/ou do <strong>Distrito Federal</strong>.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-900 mb-3">
              Processo em duas etapas
            </h3>
            <ol className="space-y-3 text-green-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  1
                </span>
                <div>
                  <strong>Entrada inicial:</strong> O representante do GT estadual adiciona os nomes
                  dos participantes no sistema através da página "Adicionar Delegação".
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </span>
                <div>
                  <strong>Preenchimento individual:</strong> Após a entrada inicial, cada pessoa faz
                  login na plataforma e preenche seu formulário pessoal completo com todas as
                  informações necessárias.
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-yellow-900 mb-3">
              Você é representante de GT?
            </h3>
            <p className="text-yellow-800 mb-4">
              Se você foi adicionado pelo administrador como representante de Grupo de Trabalho,
              clique no botão abaixo para adicionar os membros da sua delegação.
            </p>
            <button
              onClick={() => window.location.hash = 'login'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              <UserPlus className="h-5 w-5" />
              Adicionar Delegação
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Precisa de ajuda?
            </h3>
            <p className="text-gray-700">
              Se você tiver dúvidas sobre o processo de inscrição ou não tiver certeza se foi
              adicionado como representante, entre em contato com a coordenação estadual da CNPDC.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
