/*
  # Temporarily Disable All RLS for Testing

  1. Purpose
    - Disable RLS on all tables to isolate the authentication issue
    - This is temporary - we'll re-enable with proper policies

  2. Tables Affected
    - usuarios
    - estados_brasil
    - documents
    - delegacao_estado
    - eventos_teias_foruns
    - inscricoes_membros
*/

-- Disable RLS on all tables
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE estados_brasil DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE delegacao_estado DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_teias_foruns DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes_membros DISABLE ROW LEVEL SECURITY;

-- Also disable on system_config if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'system_config') THEN
    ALTER TABLE system_config DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;
