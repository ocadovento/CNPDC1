/*
  # Add File Type and Upload Method to Documents

  1. Changes
    - Add `file_type` column to track type of file (pdf, image, video)
    - Add `upload_method` column to track if it's a URL or uploaded file
    - Add `file_size` column to track file size for uploads

  2. File Types Supported
    - pdf: PDF documents
    - image: PNG, JPG images
    - video: YouTube video links

  3. Upload Methods
    - url: Direct URL (Google Drive, Dropbox, YouTube, etc.)
    - upload: File uploaded to storage
*/

-- Add new columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_type text DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'image', 'video')),
ADD COLUMN IF NOT EXISTS upload_method text DEFAULT 'url' CHECK (upload_method IN ('url', 'upload')),
ADD COLUMN IF NOT EXISTS file_size bigint;

-- Add comment to columns for clarity
COMMENT ON COLUMN documents.file_type IS 'Type of file: pdf, image, or video';
COMMENT ON COLUMN documents.upload_method IS 'How file was added: url (link) or upload (file upload)';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes (only for uploaded files)';
