import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { getParidadeColor, getParidadeStatus } from '../utils/colorPalette';
import type { ParidadeResult } from '../utils/parityCalculations';

interface GenderParityAlertProps {
  paridade: ParidadeResult | null;
  showDetails?: boolean;
}

export default function GenderParityAlert({ paridade, showDetails = true }: GenderParityAlertProps) {
  if (!paridade || paridade.total_delegados === 0) {
    return (
      <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <Info size={24} className="text-gray-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800">Nenhum Delegado Cadastrado</h3>
            <p className="text-sm text-gray-600 mt-1">
              Comece adicionando delegados à delegação. Lembre-se: mínimo de 50% deve ser mulheres.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = getParidadeColor(paridade.percentual_mulheres);
  const status = getParidadeStatus(paridade.percentual_mulheres);

  const Icon =
    status === 'paridade_ok' ? CheckCircle :
    status === 'paridade_baixa' ? AlertTriangle :
    AlertCircle;

  const bgColor =
    status === 'paridade_ok' ? 'bg-green-50' :
    status === 'paridade_baixa' ? 'bg-yellow-50' :
    'bg-red-50';

  const borderColor =
    status === 'paridade_ok' ? 'border-green-500' :
    status === 'paridade_baixa' ? 'border-yellow-500' :
    'border-red-500';

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <Icon
          size={24}
          style={{ color: statusColor.color }}
          className="flex-shrink-0 mt-0.5"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold" style={{ color: statusColor.color }}>
              Paridade de Gênero
            </h3>
            <span
              className="text-xs font-medium px-2 py-1 rounded"
              style={{
                backgroundColor: statusColor.color,
                color: 'white'
              }}
            >
              {statusColor.icon} {paridade.percentual_mulheres.toFixed(1)}% Mulheres
            </span>
          </div>

          <p className="text-sm" style={{ color: statusColor.color }}>
            {paridade.mensagem}
          </p>

          {showDetails && (
            <div className="mt-3 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-400" />
                <span className="text-gray-700">
                  <strong>{paridade.total_mulheres}</strong> Mulheres
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-400" />
                <span className="text-gray-700">
                  <strong>{paridade.total_homens}</strong> Homens
                </span>
              </div>

              <div className="text-gray-600">
                Total: <strong>{paridade.total_delegados}</strong>
              </div>
            </div>
          )}

          {paridade.total_sem_genero > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              ⚠ {paridade.total_sem_genero} {paridade.total_sem_genero === 1 ? 'delegado sem' : 'delegados sem'} gênero informado
            </p>
          )}
        </div>
      </div>

      {status !== 'paridade_ok' && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: statusColor.color + '40' }}>
          <p className="text-xs text-gray-700">
            <strong>Meta de Paridade:</strong> A delegação deve ter no mínimo 50% de mulheres.
            {status === 'paridade_critica' && ' Adicione mais mulheres para alcançar a meta.'}
          </p>
        </div>
      )}
    </div>
  );
}
