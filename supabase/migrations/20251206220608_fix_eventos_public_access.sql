/*
  # Fix Public Access to Events Table

  1. Changes
    - Add RLS policy to allow anonymous (public) users to read events from eventos_teias_foruns table
    
  2. Security
    - Public users (anon) can SELECT (read) all events
    - Only authenticated users (admins/representantes) can INSERT/UPDATE/DELETE events
    
  3. Purpose
    - Allow public pages (Participantes Teia 2026, Calendário) to display events without authentication
    - Events are public information and should be visible to everyone
*/

-- Drop existing policy if exists
DROP POLICY IF EXISTS "eventos_anon_select" ON eventos_teias_foruns;

-- Create new policy for anonymous read access
CREATE POLICY "Public can view all events"
  ON eventos_teias_foruns
  FOR SELECT
  TO anon
  USING (true);
