/*
  # Correção de Recursão Infinita nas Políticas RLS

  ## Problema
  As políticas de INSERT estão causando recursão infinita porque verificam
  a própria tabela usuarios durante uma inserção.

  ## Solução
  - Remove políticas de INSERT que causam recursão (admin_geral e admin_auxiliar)
  - Mantém apenas a política de auto-registro que permite usuários criarem seu próprio registro
  - A validação de tipo de usuário será feita na aplicação e em edge functions
  
  ## Segurança
  - Usuários autenticados só podem inserir registros para seu próprio auth.uid()
  - Outras operações (SELECT, UPDATE) continuam protegidas por políticas apropriadas
*/

-- Remover políticas de INSERT que causam recursão infinita
DROP POLICY IF EXISTS "Admin geral pode inserir usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin auxiliar pode inserir usuários" ON usuarios;

-- A política "Usuários podem criar seu próprio registro" já existe e é suficiente
-- Ela permite que qualquer usuário autenticado crie seu registro inicial
