/*
  # Add file_type and upload_method columns to documents

  1. Changes
    - Add `file_type` column (text) with CHECK constraint for pdf/image/video
    - Add `upload_method` column (text) with CHECK constraint for url/upload
    - Both columns have default values for backward compatibility

  2. File Types
    - pdf: PDF documents
    - image: Image files (PNG, JPG)
    - video: Video links (YouTube)

  3. Upload Methods
    - url: Direct URL link
    - upload: Uploaded file to storage

  4. Notes
    - Existing documents will have default values (pdf, url)
    - New documents should specify appropriate values
*/

DO $$
BEGIN
  -- Add file_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'file_type'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_type text DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'image', 'video'));
    COMMENT ON COLUMN documents.file_type IS 'Type of file: pdf, image, or video';
  END IF;

  -- Add upload_method column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'upload_method'
  ) THEN
    ALTER TABLE documents ADD COLUMN upload_method text DEFAULT 'url' CHECK (upload_method IN ('url', 'upload'));
    COMMENT ON COLUMN documents.upload_method IS 'How file was added: url (link) or upload (file upload)';
  END IF;
END $$;
