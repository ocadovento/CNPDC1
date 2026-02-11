import * as XLSX from 'xlsx';
import type { DelegadoComGenero, ParidadeResult, VagaPorCota } from './parityCalculations';
import { getCotaLabel, getGeneroLabel } from './colorPalette';

export async function exportCanvasToImage(
  canvasElement: HTMLCanvasElement,
  filename: string = 'grafico.png',
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  try {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve) => {
      canvasElement.toBlob((blob) => {
        if (blob) resolve(blob);
      }, mimeType, 0.95);
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar imagem:', error);
    throw error;
  }
}

export async function exportSvgToImage(
  svgElement: SVGElement,
  filename: string = 'grafico.png',
  width: number = 800,
  height: number = 600
): Promise<void> {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Contexto 2D não disponível');

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        try {
          await exportCanvasToImage(canvas, filename);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erro ao carregar SVG'));
      };

      img.src = url;
    });
  } catch (error) {
    console.error('Erro ao exportar SVG:', error);
    throw error;
  }
}

export function exportDelegacaoToExcel(
  delegados: DelegadoComGenero[],
  paridade: ParidadeResult | null,
  vagasPorCota: VagaPorCota[],
  estadoUf: string,
  filename: string = 'delegacao.xlsx'
): void {
  try {
    const wb = XLSX.utils.book_new();

    const resumoData = [
      ['RESUMO DA DELEGAÇÃO'],
      ['Estado:', estadoUf],
      ['Data de Geração:', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['PARIDADE DE GÊNERO'],
      ['Total de Delegados:', paridade?.total_delegados || 0],
      ['Mulheres:', paridade?.total_mulheres || 0],
      ['Homens:', paridade?.total_homens || 0],
      ['% Mulheres:', `${paridade?.percentual_mulheres || 0}%`],
      ['% Homens:', `${paridade?.percentual_homens || 0}%`],
      ['Status:', paridade?.mensagem || 'N/A'],
      [''],
      ['VAGAS POR COTA'],
      ['Cota', 'Limite', 'Preenchidas', 'Disponíveis', 'Mulheres', 'Homens'],
      ...vagasPorCota.map(v => [
        v.label_cota,
        v.limite_maximo,
        v.vagas_preenchidas,
        v.vagas_disponiveis,
        v.vagas_mulheres,
        v.vagas_homens
      ])
    ];

    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    const delegadosData = [
      ['LISTA DE DELEGADOS'],
      ['Nome Completo', 'CPF', 'Gênero', 'Cota', 'Estado'],
      ...delegados.map(d => [
        d.nome_completo,
        d.cpf,
        d.genero ? getGeneroLabel(d.genero) : 'Não informado',
        getCotaLabel(d.cota_representada),
        d.estado_uf
      ])
    ];

    const wsDelegados = XLSX.utils.aoa_to_sheet(delegadosData);
    XLSX.utils.book_append_sheet(wb, wsDelegados, 'Delegados');

    const porGeneroData = [
      ['ANÁLISE POR GÊNERO E COTA'],
      ['Cota', 'Total', 'Mulheres', 'Homens', '% Mulheres'],
      ...vagasPorCota.map(v => [
        v.label_cota,
        v.vagas_preenchidas,
        v.vagas_mulheres,
        v.vagas_homens,
        v.vagas_preenchidas > 0
          ? `${((v.vagas_mulheres / v.vagas_preenchidas) * 100).toFixed(1)}%`
          : '0%'
      ])
    ];

    const wsAnalise = XLSX.utils.aoa_to_sheet(porGeneroData);
    XLSX.utils.book_append_sheet(wb, wsAnalise, 'Análise');

    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
}

export async function captureElementAsImage(
  elementId: string,
  filename: string = 'captura.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID "${elementId}" não encontrado`);
  }

  const canvas = document.createElement('canvas');
  const rect = element.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Contexto 2D não disponível');

  ctx.scale(2, 2);

  const data = new XMLSerializer().serializeToString(element);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${data}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      try {
        await exportCanvasToImage(canvas, filename);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao carregar elemento'));
    };

    img.src = url;
  });
}

export function downloadJSON(data: unknown, filename: string = 'dados.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
