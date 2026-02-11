/*
  # RLS Básico para Inscrições

  1. Mudanças
    - Habilita RLS novamente
    - Permite INSERT para todos (anon e authenticated)
    - Permite SELECT para todos
    - Protege contra UPDATE/DELETE não autorizados
    
  2. Segurança
    - Dados podem ser inseridos publicamente
    - Apenas admins podem modificar/deletar
*/

-- Re-habilitar RLS
ALTER TABLE inscricoes_membros ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (sem WITH CHECK problemático)
CREATE POLICY "Public can insert inscricoes"
  ON inscricoes_membros
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Permitir SELECT público
CREATE POLICY "Public can view inscricoes"
  ON inscricoes_membros
  FOR SELECT
  TO public
  USING (true);

-- Apenas admins podem UPDATE
CREATE POLICY "Only admins can update inscricoes"
  ON inscricoes_membros
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );

-- Apenas admins podem DELETE
CREATE POLICY "Only admins can delete inscricoes"
  ON inscricoes_membros
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.auth_user_id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    )
  );
