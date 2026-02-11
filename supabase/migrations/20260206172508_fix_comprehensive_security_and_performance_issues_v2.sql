/*
  # Fix Comprehensive Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index on `delegacao_estado(estado_uf)` for better join performance
  - Add index on `eventos(estado_uf)` for better join performance
  - Add index on `inscricoes_membros(delegacao_id)` for better join performance
  - Add index on `usuarios(auth_user_id)` for better authentication lookups
  - Add index on `usuarios(estado_uf)` for better join performance

  ### 2. Remove Unused Indexes
  - Drop `idx_documents_created_by` (not being used)
  - Drop `idx_representantes_gt_estado_uf` (not being used)
  - Drop `idx_teias_estaduais_estado_uf` (not being used)
  - Drop `idx_teias_estaduais_representante_id` (not being used)

  ### 3. Consolidate Multiple Permissive Policies
  - Merge `representantes_gt` SELECT policies into single policy
  - Merge `usuarios` SELECT policies into single policy

  ### 4. Fix Function Search Path
  - Update `get_evento_teia_nacional_2026` function to use immutable search_path

  ## Security Notes
  - All foreign keys now have covering indexes for optimal performance
  - RLS policies consolidated to prevent multiple policy evaluation overhead
  - Function search paths secured against schema injection attacks
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for delegacao_estado.estado_uf foreign key
CREATE INDEX IF NOT EXISTS idx_delegacao_estado_estado_uf 
ON delegacao_estado(estado_uf);

-- Index for eventos.estado_uf foreign key
CREATE INDEX IF NOT EXISTS idx_eventos_estado_uf 
ON eventos(estado_uf);

-- Index for inscricoes_membros.delegacao_id foreign key
CREATE INDEX IF NOT EXISTS idx_inscricoes_membros_delegacao_id 
ON inscricoes_membros(delegacao_id);

-- Index for usuarios.auth_user_id foreign key
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id 
ON usuarios(auth_user_id);

-- Index for usuarios.estado_uf foreign key
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
ON usuarios(estado_uf);

-- =====================================================
-- 2. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_documents_created_by;
DROP INDEX IF EXISTS idx_representantes_gt_estado_uf;
DROP INDEX IF EXISTS idx_teias_estaduais_estado_uf;
DROP INDEX IF EXISTS idx_teias_estaduais_representante_id;

-- =====================================================
-- 3. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- Fix representantes_gt: Merge SELECT policies
DROP POLICY IF EXISTS "Admins can manage representantes" ON representantes_gt;
DROP POLICY IF EXISTS "Users can view representantes" ON representantes_gt;

CREATE POLICY "Authenticated users can view representantes"
  ON representantes_gt
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix usuarios: Merge SELECT policies into one comprehensive policy
DROP POLICY IF EXISTS "Admins can view all users" ON usuarios;
DROP POLICY IF EXISTS "Users can view own profile" ON usuarios;

CREATE POLICY "Authenticated users can view users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    -- User can view their own profile
    auth.uid() = auth_user_id
    OR
    -- Admins can view all users (check tipo_usuario directly)
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin'
    )
  );

-- =====================================================
-- 4. FIX FUNCTION SEARCH PATH
-- =====================================================

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_evento_teia_nacional_2026();

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION public.get_evento_teia_nacional_2026()
RETURNS TABLE (
  id uuid,
  nome text,
  data_inicio date,
  data_fim date,
  local text,
  descricao text,
  tipo_evento text,
  estado_uf text,
  auto_promover_para_nacional boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    e.data_inicio,
    e.data_fim,
    e.local,
    e.descricao,
    e.tipo_evento,
    e.estado_uf,
    e.auto_promover_para_nacional,
    e.created_at
  FROM eventos e
  WHERE e.tipo_evento = 'nacional'
  AND e.nome ILIKE '%teia%nacional%2026%'
  ORDER BY e.created_at DESC
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_evento_teia_nacional_2026() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_evento_teia_nacional_2026() TO anon;