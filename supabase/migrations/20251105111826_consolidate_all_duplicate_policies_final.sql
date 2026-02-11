/*
  # Consolidate All Duplicate Policies - Final Fix

  1. Changes
    - Remove the duplicate SELECT policy on delegacao_estado
    - Keep only one SELECT policy that combines both public and authenticated access
    - This eliminates all "Multiple Permissive Policies" warnings

  2. Security
    - Maintains exact same security model
    - Only consolidates into single policies per action
*/

-- Fix delegacao_estado SELECT policies (currently has 2)
DROP POLICY IF EXISTS "Public can read delegation for login" ON delegacao_estado;
DROP POLICY IF EXISTS "View delegation members" ON delegacao_estado;

CREATE POLICY "View delegation members"
  ON delegacao_estado FOR SELECT
  USING (
    -- Public can read for login verification
    true
    -- Note: Representatives and admins access is covered by the public access
    -- If you need to restrict this later, use:
    -- Representatives can view their own delegation members:
    -- EXISTS (
    --   SELECT 1 FROM eventos_teias_foruns
    --   WHERE eventos_teias_foruns.id = delegacao_estado.evento_id
    --   AND eventos_teias_foruns.representante_id = (select auth.uid())
    -- )
    -- OR
    -- Admins can view all delegation members:
    -- EXISTS (
    --   SELECT 1 FROM usuarios
    --   WHERE usuarios.id = (select auth.uid())
    --   AND usuarios.tipo_usuario IN ('admin_geral', 'admin_auxiliar')
    -- )
  );
