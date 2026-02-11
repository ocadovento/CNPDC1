/*
  # Add data_fim field to eventos_teias_foruns

  1. Changes
    - Add data_fim column to eventos_teias_foruns table (nullable)
    - This allows events to have a date range (data_evento to data_fim)
    - If data_fim is null, event is single-day

  2. Notes
    - data_fim should be >= data_evento (validated in application)
    - Existing events will have null data_fim (single-day events)
*/

-- Add data_fim column
ALTER TABLE eventos_teias_foruns
ADD COLUMN IF NOT EXISTS data_fim date;

-- Add comment for documentation
COMMENT ON COLUMN eventos_teias_foruns.data_fim IS 'Data final do evento (null para eventos de um único dia)';
