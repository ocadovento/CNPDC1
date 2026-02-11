import { useRef, useEffect, useState } from 'react';
import { Download, PieChart, BarChart3 } from 'lucide-react';
import { getCotaColor, getCotaLabel, GENERO_COLORS } from '../utils/colorPalette';
import type { VagaPorCota, ParidadeResult } from '../utils/parityCalculations';
import { exportCanvasToImage } from '../utils/chartExport';

interface DelegationChartProps {
  vagasPorCota: VagaPorCota[];
  paridade: ParidadeResult | null;
  estadoUf: string;
  showExportButton?: boolean;
}

export default function DelegationChart({ vagasPorCota, paridade, estadoUf, showExportButton = true }: DelegationChartProps) {
  const pieCanvasRef = useRef<HTMLCanvasElement>(null);
  const barCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeChart, setActiveChart] = useState<'pie' | 'bar'>('pie');

  useEffect(() => {
    if (activeChart === 'pie' && pieCanvasRef.current) {
      drawPieChart();
    } else if (activeChart === 'bar' && barCanvasRef.current) {
      drawBarChart();
    }
  }, [vagasPorCota, activeChart]);

  const drawPieChart = () => {
    const canvas = pieCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;

    ctx.clearRect(0, 0, width, height);

    const total = vagasPorCota.reduce((sum, v) => sum + v.vagas_preenchidas, 0);
    if (total === 0) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Nenhum delegado cadastrado', centerX, centerY);
      return;
    }

    let startAngle = -Math.PI / 2;

    vagasPorCota.forEach((vaga) => {
      if (vaga.vagas_preenchidas === 0) return;

      const sliceAngle = (vaga.vagas_preenchidas / total) * 2 * Math.PI;
      const color = getCotaColor(vaga.cota_representada);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color.primary;
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
      const percentage = ((vaga.vagas_preenchidas / total) * 100).toFixed(1);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${percentage}%`, labelX, labelY);

      startAngle += sliceAngle;
    });

    const legendX = 20;
    let legendY = height - (vagasPorCota.filter(v => v.vagas_preenchidas > 0).length * 25) - 10;

    ctx.textAlign = 'left';
    ctx.font = '12px sans-serif';

    vagasPorCota.forEach((vaga) => {
      if (vaga.vagas_preenchidas === 0) return;

      const color = getCotaColor(vaga.cota_representada);

      ctx.fillStyle = color.primary;
      ctx.fillRect(legendX, legendY, 15, 15);

      ctx.fillStyle = '#1F2937';
      ctx.fillText(`${vaga.label_cota}: ${vaga.vagas_preenchidas}`, legendX + 20, legendY + 12);

      legendY += 25;
    });
  };

  const drawBarChart = () => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...vagasPorCota.map(v => v.vagas_preenchidas), 1);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Paridade de Gênero por Cota - ${estadoUf}`, width / 2, 30);

    const barWidth = (width - padding * 2) / vagasPorCota.length - 10;

    vagasPorCota.forEach((vaga, index) => {
      const x = padding + index * ((width - padding * 2) / vagasPorCota.length);

      if (vaga.vagas_preenchidas === 0) {
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(x, padding, barWidth, chartHeight);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('0', x + barWidth / 2, padding + chartHeight / 2);
      } else {
        const mulheresHeight = (vaga.vagas_mulheres / maxValue) * chartHeight;
        const homensHeight = (vaga.vagas_homens / maxValue) * chartHeight;

        ctx.fillStyle = GENERO_COLORS.mulher.color;
        ctx.fillRect(x, padding + chartHeight - mulheresHeight, barWidth / 2 - 2, mulheresHeight);

        ctx.fillStyle = GENERO_COLORS.homem.color;
        ctx.fillRect(x + barWidth / 2 + 2, padding + chartHeight - homensHeight, barWidth / 2 - 2, homensHeight);

        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${vaga.vagas_mulheres}`, x + barWidth / 4, padding + chartHeight - mulheresHeight - 5);
        ctx.fillText(`${vaga.vagas_homens}`, x + (barWidth * 3) / 4, padding + chartHeight - homensHeight - 5);
      }

      ctx.fillStyle = '#4B5563';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const label = vaga.label_cota.length > 12 ? vaga.label_cota.substring(0, 10) + '...' : vaga.label_cota;
      ctx.fillText(label, x + barWidth / 2, height - 35);
      ctx.fillText(`Total: ${vaga.vagas_preenchidas}`, x + barWidth / 2, height - 20);
    });

    const legendY = height - 10;
    const legendX = width / 2 - 80;

    ctx.fillStyle = GENERO_COLORS.mulher.color;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#1F2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Mulheres', legendX + 20, legendY + 12);

    ctx.fillStyle = GENERO_COLORS.homem.color;
    ctx.fillRect(legendX + 100, legendY, 15, 15);
    ctx.fillText('Homens', legendX + 120, legendY + 12);
  };

  const handleExport = async (type: 'pie' | 'bar') => {
    try {
      const canvas = type === 'pie' ? pieCanvasRef.current : barCanvasRef.current;
      if (!canvas) return;

      const filename = `delegacao_${estadoUf}_${type === 'pie' ? 'distribuicao' : 'paridade'}.png`;
      await exportCanvasToImage(canvas, filename);
    } catch (error) {
      console.error('Erro ao exportar gráfico:', error);
      alert('Erro ao exportar gráfico. Tente novamente.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Visualização da Delegação</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('pie')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PieChart size={16} />
            Pizza
          </button>
          <button
            onClick={() => setActiveChart('bar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={16} />
            Barras
          </button>
        </div>
      </div>

      <div className="relative">
        {activeChart === 'pie' ? (
          <canvas
            ref={pieCanvasRef}
            width={800}
            height={500}
            className="w-full border border-gray-200 rounded-lg"
          />
        ) : (
          <canvas
            ref={barCanvasRef}
            width={800}
            height={500}
            className="w-full border border-gray-200 rounded-lg"
          />
        )}
      </div>

      {showExportButton && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleExport(activeChart)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Exportar Gráfico
          </button>
        </div>
      )}

      {paridade && paridade.total_delegados > 0 && (
        <>
          {paridade.percentual_mulheres < 40 && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">
                ⚠ Alerta de Paridade: A delegação possui apenas {paridade.percentual_mulheres.toFixed(1)}% de mulheres.
                É necessário atingir no mínimo 40% para cumprir a meta de equidade de gênero.
              </p>
            </div>
          )}

          {paridade.percentual_mulheres >= 40 && paridade.percentual_mulheres < 50 && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠ Atenção: A delegação possui {paridade.percentual_mulheres.toFixed(1)}% de mulheres.
                Meta ideal: 50% para paridade plena.
              </p>
            </div>
          )}

          {paridade.percentual_mulheres >= 50 && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-semibold">
                ✓ Paridade Alcançada: A delegação possui {paridade.percentual_mulheres.toFixed(1)}% de mulheres.
                Meta de equidade de gênero cumprida!
              </p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total de Delegados</p>
              <p className="text-2xl font-bold text-gray-800">{paridade.total_delegados}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-sm text-pink-700 mb-1">Mulheres</p>
              <p className="text-2xl font-bold text-pink-600">
                {paridade.total_mulheres} ({paridade.percentual_mulheres.toFixed(1)}%)
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700 mb-1">Homens</p>
              <p className="text-2xl font-bold text-blue-600">
                {paridade.total_homens} ({paridade.percentual_homens.toFixed(1)}%)
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
