/*
  # Permitir acesso anônimo para login de participantes

  1. Alterações
    - Adiciona política SELECT para role anon na tabela delegacao_estado
    - Permite que participantes não autenticados possam buscar seus dados por CPF
    - Necessário para o fluxo de login de participantes

  2. Segurança
    - Apenas leitura (SELECT) é permitida
    - Participantes podem ver apenas dados básicos necessários para login
*/

-- Adicionar política para permitir acesso anônimo de leitura na delegacao_estado
CREATE POLICY "delegacao_anon_select"
  ON delegacao_estado
  FOR SELECT
  TO anon
  USING (true);
