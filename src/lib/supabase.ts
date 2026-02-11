import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Usuario = {
  id: string;
  auth_user_id: string;
  email: string;
  nome_completo: string;
  tipo_usuario: 'admin_geral' | 'admin_auxiliar' | 'representante_gt' | 'membro';
  estado_uf: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type TeiaEstadual = {
  id: string;
  estado_uf: string;
  representante_id: string;
  data_inicio: string;
  data_fim: string | null;
  cidade: string;
  local_evento: string;
  temas_principais: string[];
  descricao: string | null;
  status: 'planejamento' | 'confirmado' | 'realizado' | 'cancelado';
  created_at: string;
  updated_at: string;
};

export type DelegacaoEstado = {
  id: string;
  estado_uf: string;
  representante_id: string;
  nome_completo: string;
  cpf: string;
  cota_representada: string | null;
  inscricao_completa: boolean;
  created_at: string;
  updated_at: string;
};