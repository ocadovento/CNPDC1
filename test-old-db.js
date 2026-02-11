import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnjkqzsyuasaidmpydyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuamtxenN5dWFzYWlkbXB5ZHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTA0NjgsImV4cCI6MjA3Nzg2NjQ2OH0.p37V6YWq61L4Lxm7bORqTy6WPZ7wxC76ww-R8cCPbog';

const oldSupabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testando conexão com o banco antigo...\n');

try {
  // Testar listando tabelas do schema public
  const { data: tables, error } = await oldSupabase
    .from('usuarios')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }

  console.log('✅ Conexão bem-sucedida!');
  console.log('📊 Tabela "usuarios" encontrada');

  // Listar algumas tabelas para confirmar
  const { data: usuariosCount } = await oldSupabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true });

  const { data: delegacaoCount } = await oldSupabase
    .from('delegacao')
    .select('*', { count: 'exact', head: true });

  const { data: inscricoesCount } = await oldSupabase
    .from('inscricoes_membros')
    .select('*', { count: 'exact', head: true });

  console.log('\n📈 Resumo dos dados:');
  console.log(`- Usuários: ${usuariosCount?.count || 0}`);
  console.log(`- Delegação: ${delegacaoCount?.count || 0}`);
  console.log(`- Inscrições: ${inscricoesCount?.count || 0}`);

} catch (err) {
  console.error('❌ Erro:', err.message);
  process.exit(1);
}
