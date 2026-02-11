import { useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getCotaColor } from '../utils/colorPalette';
import type { DisponibilidadeCompleta } from '../utils/parityCalculations';
import { exportCanvasToImage } from '../utils/chartExport';

interface QuotaAvailabilityChartProps {
  disponibilidade: DisponibilidadeCompleta[];
  estadoUf: string;
  showExportButton?: boolean;
}

export default function QuotaAvailabilityChart({
  disponibilidade,
  estadoUf,
  showExportButton = true
}: QuotaAvailabilityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawChart();
  }, [disponibilidade]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 60, right: 200, bottom: 40, left: 280 };

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Disponibilidade de Vagas por Cota - ${estadoUf}`, width / 2, 30);

    const chartHeight = height - padding.top - padding.bottom;
    const barHeight = Math.min(45, chartHeight / disponibilidade.length - 12);
    const barSpacing = (chartHeight - (barHeight * disponibilidade.length)) / (disponibilidade.length + 1);

    const maxVagas = Math.max(...disponibilidade.map(d => d.limite_maximo), 1);
    const barMaxWidth = width - padding.left - padding.right;

    disponibilidade.forEach((disp, index) => {
      const y = padding.top + (index * (barHeight + barSpacing)) + barSpacing;

      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'right';
      const label = disp.label_cota.length > 30 ? disp.label_cota.substring(0, 28) + '...' : disp.label_cota;
      ctx.fillText(label, padding.left - 10, y + barHeight / 2 + 5);

      const bgBarWidth = barMaxWidth;
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(padding.left, y, bgBarWidth, barHeight);

      if (disp.vagas_preenchidas > 0) {
        const filledWidth = (disp.vagas_preenchidas / maxVagas) * barMaxWidth;
        const color = getCotaColor(disp.cota_representada);

        ctx.fillStyle = color.primary;
        ctx.fillRect(padding.left, y, filledWidth, barHeight);

        ctx.strokeStyle = color.dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(padding.left, y, filledWidth, barHeight);
      }

      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding.left, y, bgBarWidth, barHeight);

      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${disp.vagas_preenchidas}/${disp.limite_maximo}`,
        padding.left + barMaxWidth + 10,
        y + barHeight / 2 - 8
      );

      const percentual = disp.percentual_ocupacao.toFixed(0);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(
        `${percentual}% ocupado`,
        padding.left + barMaxWidth + 10,
        y + barHeight / 2 + 8
      );

      if (disp.vagas_disponiveis > 0) {
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(
          `${disp.vagas_disponiveis} disponíveis`,
          padding.left + barMaxWidth + 10,
          y + barHeight / 2 + 24
        );
      } else if (disp.status === 'completo') {
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(
          'COMPLETO',
          padding.left + barMaxWidth + 10,
          y + barHeight / 2 + 24
        );
      }
    });

    const legendY = height - 15;
    ctx.textAlign = 'center';
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('As barras mostram vagas preenchidas em relação ao limite máximo de cada cota', width / 2, legendY);
  };

  const handleExport = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const filename = `disponibilidade_cotas_${estadoUf}.png`;
      await exportCanvasToImage(canvas, filename);
    } catch (error) {
      console.error('Erro ao exportar gráfico:', error);
      alert('Erro ao exportar gráfico. Tente novamente.');
    }
  };

  const totalVagas = disponibilidade.reduce((acc, d) => acc + d.limite_maximo, 0);
  const totalPreenchidas = disponibilidade.reduce((acc, d) => acc + d.vagas_preenchidas, 0);
  const totalDisponiveis = disponibilidade.reduce((acc, d) => acc + d.vagas_disponiveis, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Disponibilidade por Cota</h2>
        {showExportButton && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Exportar
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={1000}
        height={Math.max(500, disponibilidade.length * 70)}
        className="w-full border border-gray-200 rounded-lg"
      />

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Total de Vagas</p>
          <p className="text-2xl font-bold text-gray-800">{totalVagas}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700 mb-1">Vagas Preenchidas</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalPreenchidas} ({totalVagas > 0 ? ((totalPreenchidas / totalVagas) * 100).toFixed(1) : 0}%)
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700 mb-1">Vagas Disponíveis</p>
          <p className="text-2xl font-bold text-green-600">{totalDisponiveis}</p>
        </div>
      </div>
    </div>
  );
}
