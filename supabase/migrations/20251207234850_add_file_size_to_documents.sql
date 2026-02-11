/*
  # Add file_size column to documents table

  1. Changes
    - Add `file_size` column (bigint) to store file size in bytes
    - Column is nullable to support existing records
    - Default value is NULL for backward compatibility

  2. Notes
    - Existing documents will have NULL file_size until updated
    - New documents should include file_size when inserted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'file_size'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_size bigint;
  END IF;
END $$;
