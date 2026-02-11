import { Users } from 'lucide-react';
import { getCotaColor, getCotaLabel, type CotaType } from '../utils/colorPalette';
import type { VagaPorCota } from '../utils/parityCalculations';

interface QuotaCardProps {
  vaga: VagaPorCota;
  onClick?: () => void;
}

export default function QuotaCard({ vaga, onClick }: QuotaCardProps) {
  const colorConfig = getCotaColor(vaga.cota_representada);
  const percentualPreenchido = (vaga.vagas_preenchidas / vaga.limite_maximo) * 100;
  const percentualMulheres = vaga.vagas_preenchidas > 0
    ? (vaga.vagas_mulheres / vaga.vagas_preenchidas) * 100
    : 0;

  const parityStatusColor =
    percentualMulheres >= 50 ? '#10B981' :
    percentualMulheres >= 40 ? '#F59E0B' :
    '#EF4444';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{ borderColor: colorConfig.primary }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: colorConfig.light }}
          >
            <Users
              size={20}
              style={{ color: colorConfig.primary }}
            />
          </div>
          <div>
            <h3
              className="font-semibold text-sm"
              style={{ color: colorConfig.text }}
            >
              {vaga.label_cota}
            </h3>
            <p className="text-xs text-gray-500">
              {vaga.vagas_preenchidas}/{vaga.limite_maximo} vagas
            </p>
          </div>
        </div>

        {vaga.vagas_disponiveis === 0 && (
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
            Completo
          </span>
        )}
        {vaga.vagas_disponiveis > 0 && (
          <span
            className="text-xs font-medium px-2 py-1 rounded"
            style={{
              backgroundColor: colorConfig.light,
              color: colorConfig.text
            }}
          >
            {vaga.vagas_disponiveis} {vaga.vagas_disponiveis === 1 ? 'vaga' : 'vagas'}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percentualPreenchido}%`,
              backgroundColor: colorConfig.primary
            }}
          />
        </div>

        {vaga.vagas_preenchidas > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-pink-400" />
                <span className="text-gray-600">{vaga.vagas_mulheres}♀</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-gray-600">{vaga.vagas_homens}♂</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: parityStatusColor }}
              />
              <span
                className="font-medium"
                style={{ color: parityStatusColor }}
              >
                {percentualMulheres.toFixed(0)}%♀
              </span>
            </div>
          </div>
        )}

        {vaga.vagas_preenchidas === 0 && (
          <p className="text-xs text-gray-400 text-center py-1">
            Nenhum delegado cadastrado
          </p>
        )}
      </div>
    </div>
  );
}
