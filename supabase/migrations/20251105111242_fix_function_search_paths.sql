/*
  # Fix Function Search Paths

  1. Security Improvements
    - Fix role mutable search_path for functions
    - Set explicit search_path for each function to prevent security issues
  
  2. Functions Updated
    - check_delegacao_availability
    - is_admin
    - update_eventos_updated_at
*/

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS check_delegacao_availability() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS update_eventos_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION check_delegacao_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.pode_adicionar_delegacao = (CURRENT_DATE >= NEW.data_evento + INTERVAL '3 days');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND tipo_usuario IN ('admin_geral', 'admin_auxiliar')
  );
END;
$$;

CREATE OR REPLACE FUNCTION update_eventos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS eventos_teias_foruns_updated_at ON eventos_teias_foruns;
DROP TRIGGER IF EXISTS eventos_check_delegacao_availability ON eventos_teias_foruns;

CREATE TRIGGER eventos_teias_foruns_updated_at
  BEFORE UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION update_eventos_updated_at();

CREATE TRIGGER eventos_check_delegacao_availability
  BEFORE INSERT OR UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION check_delegacao_availability();
