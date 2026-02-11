/*
  # Corrige política de INSERT para usuários anônimos em inscricoes_membros
  
  Este é o FIX DEFINITIVO para o erro de RLS que ocorreu 3 vezes.
  
  1. Problema Identificado
    - A tabela `inscricoes_membros` tinha políticas apenas para usuários AUTENTICADOS
    - Usuários anônimos (não logados) não conseguiam fazer inscrições
    - Erro: "new row violates row-level security policy for table inscricoes_membros"
  
  2. Solução Implementada
    - Adiciona política de INSERT para o role `anon` (usuários não autenticados)
    - Permite que qualquer pessoa faça inscrições públicas
    - Mantém as validações de dados na aplicação
  
  3. Segurança
    - A política permite INSERT público porque inscrições são abertas
    - Os dados inseridos ainda são validados pela aplicação
    - Apenas INSERT é permitido; SELECT/UPDATE/DELETE continuam restritos
*/

-- Remove política antiga de anon se existir
DROP POLICY IF EXISTS "Anon users can insert inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Anonymous users can insert inscricoes" ON inscricoes_membros;
DROP POLICY IF EXISTS "Public can insert inscricoes" ON inscricoes_membros;

-- Cria política para permitir INSERT de usuários anônimos
CREATE POLICY "Public users can submit inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permite também que usuários autenticados (não membros) possam inserir
CREATE POLICY "Authenticated users can submit inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO authenticated
  WITH CHECK (true);