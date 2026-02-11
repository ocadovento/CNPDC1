/*
  # Fix Security Issues - Indexes and RLS

  1. Performance Improvements
    - Add covering indexes for unindexed foreign keys:
      - `teias_estaduais.estado_uf`
      - `usuarios.estado_uf`
    - Remove unused index: `idx_eventos_teias_foruns_representante_id`

  2. Security Enhancement
    - Re-enable RLS on `usuarios` table
    - Create simple, non-recursive policies:
      - Allow anyone to insert (for initial user creation)
      - Allow authenticated users to view all users (required for admin dashboard)
      - Allow users to update only their own profile

  3. Important Notes
    - Policies are designed to avoid infinite recursion
    - No policy checks the `tipo_usuario` field during auth checks
    - Admin operations work through application logic, not RLS
*/

-- ============================================================================
-- PART 1: Add Missing Indexes for Foreign Keys
-- ============================================================================

-- Index for teias_estaduais.estado_uf foreign key
CREATE INDEX IF NOT EXISTS idx_teias_estaduais_estado_uf 
ON teias_estaduais(estado_uf);

-- Index for usuarios.estado_uf foreign key
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_uf 
ON usuarios(estado_uf);

-- ============================================================================
-- PART 2: Remove Unused Index
-- ============================================================================

DROP INDEX IF EXISTS idx_eventos_teias_foruns_representante_id;

-- ============================================================================
-- PART 3: Re-enable RLS on usuarios with Safe Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert users (for registration)
CREATE POLICY "Allow user registration"
  ON usuarios
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to view all users
-- This is necessary for admin dashboards and user management
CREATE POLICY "Authenticated users can view all users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow users to update their own profile only
CREATE POLICY "Users can update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 4: Prevent unauthorized deletions
-- Only allow deletes through application logic (no RLS policy = no deletes)
