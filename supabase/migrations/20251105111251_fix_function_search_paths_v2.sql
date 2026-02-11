/*
  # Fix Function Search Paths v2

  1. Changes
    - Set search_path to empty string for all functions to prevent search_path attacks
    - Drop triggers first, then recreate functions with proper security definer settings

  2. Security
    - Prevents malicious schema manipulation
    - Uses fully qualified table names
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS eventos_check_delegacao_availability ON eventos_teias_foruns;
DROP TRIGGER IF EXISTS eventos_teias_foruns_updated_at ON eventos_teias_foruns;

-- Drop and recreate check_delegacao_availability function with proper search path
DROP FUNCTION IF EXISTS check_delegacao_availability();

CREATE OR REPLACE FUNCTION check_delegacao_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.pode_adicionar_delegacao = (CURRENT_DATE >= NEW.data_evento + INTERVAL '3 days');
  RETURN NEW;
END;
$$;

-- Drop and recreate is_admin function with proper search path
DROP FUNCTION IF EXISTS is_admin(uuid);

CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_type text;
BEGIN
  SELECT tipo_usuario INTO user_type
  FROM public.usuarios
  WHERE id = user_id;
  
  RETURN user_type IN ('admin_geral', 'admin_auxiliar');
END;
$$;

-- Drop and recreate update_eventos_updated_at function with proper search path
DROP FUNCTION IF EXISTS update_eventos_updated_at();

CREATE OR REPLACE FUNCTION update_eventos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER eventos_check_delegacao_availability
  BEFORE INSERT OR UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION check_delegacao_availability();

CREATE TRIGGER eventos_teias_foruns_updated_at
  BEFORE UPDATE ON eventos_teias_foruns
  FOR EACH ROW
  EXECUTE FUNCTION update_eventos_updated_at();
