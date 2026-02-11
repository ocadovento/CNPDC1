import { supabase } from '../lib/supabase';
import { CotaType, GeneroType, COTA_LIMITS, TOTAL_DELEGADOS_ELEITOS } from './colorPalette';

export interface ParidadeResult {
  total_delegados: number;
  total_mulheres: number;
  total_homens: number;
  total_sem_genero: number;
  percentual_mulheres: number;
  percentual_homens: number;
  status_paridade: string;
  cor_indicador: string;
  mensagem: string;
}

export interface VagaPorCota {
  cota_representada: CotaType;
  label_cota: string;
  limite_maximo: number;
  vagas_preenchidas: number;
  vagas_disponiveis: number;
  vagas_mulheres: number;
  vagas_homens: number;
  cor_cota: string;
}

export interface AmplaConcorrenciaResult {
  total_estado: number;
  vagas_cotas_especificas: number;
  vagas_cotas_preenchidas: number;
  vagas_cotas_remanescentes: number;
  limite_ampla_base: number;
  limite_ampla_com_remanescentes: number;
  ampla_preenchidas: number;
  ampla_disponiveis: number;
  ampla_mulheres: number;
  ampla_homens: number;
}

export interface DelegadoComGenero {
  id: string;
  nome_completo: string;
  cpf: string;
  genero: GeneroType | null;
  cota_representada: CotaType;
  estado_uf: string;
}

export async function calcularParidadeGenero(
  eventoId: string,
  estadoUf: string,
  cotaRepresentada?: CotaType
): Promise<ParidadeResult | null> {
  try {
    const { data, error } = await supabase
      .rpc('calcular_paridade_genero', {
        p_evento_id: eventoId,
        p_estado_uf: estadoUf,
        p_cota_representada: cotaRepresentada || null
      });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Erro ao calcular paridade:', error);
    return null;
  }
}

export async function calcularVagasPorCota(
  eventoId: string,
  estadoUf: string
): Promise<VagaPorCota[]> {
  try {
    const { data, error } = await supabase
      .rpc('calcular_vagas_por_cota', {
        p_evento_id: eventoId,
        p_estado_uf: estadoUf
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao calcular vagas por cota:', error);
    return [];
  }
}

export async function calcularAmplaConcorrencia(
  eventoId: string,
  estadoUf: string,
  totalDelegados: number = TOTAL_DELEGADOS_ELEITOS
): Promise<AmplaConcorrenciaResult | null> {
  try {
    const { data, error } = await supabase
      .rpc('calcular_ampla_concorrencia', {
        p_evento_id: eventoId,
        p_estado_uf: estadoUf,
        p_total_delegados_eleitos: totalDelegados
      });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Erro ao calcular ampla concorrência:', error);
    return null;
  }
}

export async function getDelegadosPorGenero(
  eventoId: string,
  estadoUf: string
): Promise<DelegadoComGenero[]> {
  try {
    const { data, error } = await supabase
      .from('delegacao_estado')
      .select('id, nome_completo, cpf, genero, cota_representada, estado_uf')
      .eq('evento_id', eventoId)
      .eq('estado_uf', estadoUf)
      .order('nome_completo');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar delegados:', error);
    return [];
  }
}

export function calcularParidadeLocal(delegados: DelegadoComGenero[]): {
  total: number;
  mulheres: number;
  homens: number;
  semGenero: number;
  percentualMulheres: number;
  percentualHomens: number;
} {
  const total = delegados.length;
  const mulheres = delegados.filter(d => d.genero === 'mulher').length;
  const homens = delegados.filter(d => d.genero === 'homem').length;
  const semGenero = delegados.filter(d => !d.genero).length;

  return {
    total,
    mulheres,
    homens,
    semGenero,
    percentualMulheres: total > 0 ? (mulheres / total) * 100 : 0,
    percentualHomens: total > 0 ? (homens / total) * 100 : 0
  };
}

export function validarParidadeAntesCadastro(
  delegadosAtuais: DelegadoComGenero[],
  novoGenero: GeneroType
): {
  permiteAdicionar: boolean;
  avisoParidade: boolean;
  mensagem: string;
} {
  const stats = calcularParidadeLocal(delegadosAtuais);

  const novoTotal = stats.total + 1;
  const novasMulheres = novoGenero === 'mulher' ? stats.mulheres + 1 : stats.mulheres;
  const novoPercentualMulheres = (novasMulheres / novoTotal) * 100;

  if (novoPercentualMulheres < 40) {
    return {
      permiteAdicionar: true,
      avisoParidade: true,
      mensagem: `⚠ ATENÇÃO: Adicionar ${novoGenero === 'mulher' ? 'uma mulher' : 'um homem'} resultará em apenas ${novoPercentualMulheres.toFixed(1)}% de mulheres na delegação. Meta: 50%`
    };
  }

  if (novoPercentualMulheres < 50) {
    return {
      permiteAdicionar: true,
      avisoParidade: true,
      mensagem: `⚠ ATENÇÃO: Delegação ficará com ${novoPercentualMulheres.toFixed(1)}% de mulheres. Meta: 50%`
    };
  }

  return {
    permiteAdicionar: true,
    avisoParidade: false,
    mensagem: `✓ Paridade OK: Delegação terá ${novoPercentualMulheres.toFixed(1)}% de mulheres`
  };
}

export function gerarEstatisticasPorCota(delegados: DelegadoComGenero[]): Array<{
  cota: CotaType;
  total: number;
  mulheres: number;
  homens: number;
  percentualMulheres: number;
}> {
  const cotas = Object.keys(COTA_LIMITS) as CotaType[];

  return cotas.map(cota => {
    const delegadosCota = delegados.filter(d => d.cota_representada === cota);
    const stats = calcularParidadeLocal(delegadosCota);

    return {
      cota,
      total: stats.total,
      mulheres: stats.mulheres,
      homens: stats.homens,
      percentualMulheres: stats.percentualMulheres
    };
  });
}

export function calcularVagasRemanescentes(vagasPorCota: VagaPorCota[]): number {
  return vagasPorCota.reduce((acc, vaga) => acc + vaga.vagas_disponiveis, 0);
}

export interface DisponibilidadeCompleta {
  cota_representada: CotaType;
  label_cota: string;
  limite_maximo: number;
  vagas_preenchidas: number;
  vagas_disponiveis: number;
  percentual_ocupacao: number;
  status: 'vazio' | 'parcial' | 'completo' | 'excedido';
  cor_status: string;
  vagas_mulheres: number;
  vagas_homens: number;
  paridade_ok: boolean;
}

export async function calcularDisponibilidadeCompleta(
  eventoId: string,
  estadoUf: string
): Promise<DisponibilidadeCompleta[]> {
  try {
    const vagasPorCota = await calcularVagasPorCota(eventoId, estadoUf);

    return vagasPorCota.map(vaga => {
      const percentual = vaga.limite_maximo > 0
        ? (vaga.vagas_preenchidas / vaga.limite_maximo) * 100
        : 0;

      let status: 'vazio' | 'parcial' | 'completo' | 'excedido' = 'vazio';
      let cor_status = '#9CA3AF';

      if (vaga.vagas_preenchidas === 0) {
        status = 'vazio';
        cor_status = '#E5E7EB';
      } else if (vaga.vagas_preenchidas < vaga.limite_maximo) {
        status = 'parcial';
        cor_status = '#FBBF24';
      } else if (vaga.vagas_preenchidas === vaga.limite_maximo) {
        status = 'completo';
        cor_status = '#10B981';
      } else {
        status = 'excedido';
        cor_status = '#EF4444';
      }

      const total = vaga.vagas_mulheres + vaga.vagas_homens;
      const percentualMulheres = total > 0 ? (vaga.vagas_mulheres / total) * 100 : 0;
      const paridade_ok = percentualMulheres >= 40 && percentualMulheres <= 60;

      return {
        cota_representada: vaga.cota_representada,
        label_cota: vaga.label_cota,
        limite_maximo: vaga.limite_maximo,
        vagas_preenchidas: vaga.vagas_preenchidas,
        vagas_disponiveis: vaga.vagas_disponiveis,
        percentual_ocupacao: percentual,
        status,
        cor_status,
        vagas_mulheres: vaga.vagas_mulheres,
        vagas_homens: vaga.vagas_homens,
        paridade_ok
      };
    });
  } catch (error) {
    console.error('Erro ao calcular disponibilidade completa:', error);
    return [];
  }
}

export interface ResumoEstado {
  estado_uf: string;
  total_delegados: number;
  total_validados: number;
  total_pendentes: number;
  percentual_validacao: number;
  vagas_totais: number;
  vagas_disponiveis: number;
  percentual_ocupacao: number;
  paridade_ok: boolean;
  percentual_mulheres: number;
}

export async function calcularResumoEstado(
  eventoId: string,
  estadoUf: string
): Promise<ResumoEstado | null> {
  try {
    const [paridade, disponibilidade] = await Promise.all([
      calcularParidadeGenero(eventoId, estadoUf),
      calcularDisponibilidadeCompleta(eventoId, estadoUf)
    ]);

    const { data: delegados, error } = await supabase
      .from('delegacao_estado')
      .select('inscricao_completa')
      .eq('evento_id', eventoId)
      .eq('estado_uf', estadoUf);

    if (error) throw error;

    const total = delegados?.length || 0;
    const validados = delegados?.filter(d => d.inscricao_completa).length || 0;
    const vagas_totais = disponibilidade.reduce((acc, d) => acc + d.limite_maximo, 0);
    const vagas_ocupadas = disponibilidade.reduce((acc, d) => acc + d.vagas_preenchidas, 0);

    return {
      estado_uf: estadoUf,
      total_delegados: total,
      total_validados: validados,
      total_pendentes: total - validados,
      percentual_validacao: total > 0 ? (validados / total) * 100 : 0,
      vagas_totais,
      vagas_disponiveis: vagas_totais - vagas_ocupadas,
      percentual_ocupacao: vagas_totais > 0 ? (vagas_ocupadas / vagas_totais) * 100 : 0,
      paridade_ok: paridade ? paridade.percentual_mulheres >= 40 && paridade.percentual_mulheres <= 60 : false,
      percentual_mulheres: paridade?.percentual_mulheres || 0
    };
  } catch (error) {
    console.error('Erro ao calcular resumo do estado:', error);
    return null;
  }
}
