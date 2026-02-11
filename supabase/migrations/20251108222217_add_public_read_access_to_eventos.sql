/*
  # Allow Public Read Access to Events

  1. Changes
    - Add RLS policy to allow anonymous (public) users to read events from eventos_teias_foruns table
    
  2. Security
    - Public users (anon) can SELECT (read) events
    - Only authenticated users (admins/representantes) can INSERT/UPDATE/DELETE events
    
  3. Purpose
    - Allow public pages (HomePage, Delegação Teia 2026) to display events without authentication
    - Events are public information (Teias and Fóruns calendar)
    - Participant data (delegacao_estado) already has public read access
*/

CREATE POLICY "eventos_anon_select"
  ON eventos_teias_foruns
  FOR SELECT
  TO anon
  USING (true);
