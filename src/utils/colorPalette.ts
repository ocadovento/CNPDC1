export type CotaType =
  | 'pessoa_negra'
  | 'lgbtqpn'
  | 'pessoa_indigena'
  | 'pessoa_jovem'
  | 'pessoa_com_deficiencia'
  | 'pessoa_idosa'
  | 'ampla_concorrencia';

export type GeneroType = 'mulher' | 'homem';

export type ParidadeStatus = 'paridade_ok' | 'paridade_baixa' | 'paridade_critica' | 'sem_delegados';

export interface CotaColor {
  primary: string;
  light: string;
  dark: string;
  text: string;
}

export interface GeneroColor {
  color: string;
  border: string;
  bg: string;
}

export const COTA_COLORS: Record<CotaType, CotaColor> = {
  pessoa_negra: {
    primary: '#1E40AF',
    light: '#DBEAFE',
    dark: '#1E3A8A',
    text: '#1E3A8A'
  },
  lgbtqpn: {
    primary: '#7C3AED',
    light: '#EDE9FE',
    dark: '#6D28D9',
    text: '#6D28D9'
  },
  pessoa_indigena: {
    primary: '#059669',
    light: '#D1FAE5',
    dark: '#047857',
    text: '#047857'
  },
  pessoa_jovem: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
    text: '#D97706'
  },
  pessoa_com_deficiencia: {
    primary: '#DC2626',
    light: '#FEE2E2',
    dark: '#B91C1C',
    text: '#B91C1C'
  },
  pessoa_idosa: {
    primary: '#EA580C',
    light: '#FFEDD5',
    dark: '#C2410C',
    text: '#C2410C'
  },
  ampla_concorrencia: {
    primary: '#6B7280',
    light: '#F3F4F6',
    dark: '#4B5563',
    text: '#4B5563'
  }
};

export const GENERO_COLORS: Record<GeneroType, GeneroColor> = {
  mulher: {
    color: '#EC4899',
    border: 'border-pink-500',
    bg: 'bg-pink-100'
  },
  homem: {
    color: '#3B82F6',
    border: 'border-blue-500 border-dashed',
    bg: 'bg-blue-100'
  }
};

export const PARIDADE_COLORS: Record<ParidadeStatus, {
  color: string;
  bg: string;
  border: string;
  text: string;
  icon: string;
}> = {
  paridade_ok: {
    color: '#10B981',
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-700',
    icon: '✓'
  },
  paridade_baixa: {
    color: '#F59E0B',
    bg: 'bg-yellow-100',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    icon: '⚠'
  },
  paridade_critica: {
    color: '#EF4444',
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: '✗'
  },
  sem_delegados: {
    color: '#6B7280',
    bg: 'bg-gray-100',
    border: 'border-gray-500',
    text: 'text-gray-700',
    icon: 'ℹ'
  }
};

export const COTA_LABELS: Record<CotaType, string> = {
  pessoa_negra: 'Pessoa Negra',
  lgbtqpn: 'LGBTQPN+',
  pessoa_indigena: 'Pessoa Indígena',
  pessoa_jovem: 'Pessoa Jovem',
  pessoa_com_deficiencia: 'Pessoa com Deficiência',
  pessoa_idosa: 'Pessoa Idosa',
  ampla_concorrencia: 'Ampla Concorrência'
};

export const GENERO_LABELS: Record<GeneroType, string> = {
  mulher: 'Mulher',
  homem: 'Homem'
};

export const COTA_LIMITS: Record<Exclude<CotaType, 'ampla_concorrencia'>, number> = {
  pessoa_negra: 6,
  lgbtqpn: 2,
  pessoa_indigena: 3,
  pessoa_jovem: 3,
  pessoa_com_deficiencia: 3,
  pessoa_idosa: 3
};

export const TOTAL_DELEGADOS_ELEITOS = 30;

export function getCotaColor(cota: CotaType): CotaColor {
  return COTA_COLORS[cota] || COTA_COLORS.ampla_concorrencia;
}

export function getCotaLabel(cota: CotaType): string {
  return COTA_LABELS[cota] || cota;
}

export function getGeneroColor(genero: GeneroType): GeneroColor {
  return GENERO_COLORS[genero];
}

export function getGeneroLabel(genero: GeneroType): string {
  return GENERO_LABELS[genero];
}

export function getParidadeColor(percentualMulheres: number) {
  if (percentualMulheres >= 50) return PARIDADE_COLORS.paridade_ok;
  if (percentualMulheres >= 40) return PARIDADE_COLORS.paridade_baixa;
  return PARIDADE_COLORS.paridade_critica;
}

export function getParidadeStatus(percentualMulheres: number): ParidadeStatus {
  if (percentualMulheres >= 50) return 'paridade_ok';
  if (percentualMulheres >= 40) return 'paridade_baixa';
  return 'paridade_critica';
}
