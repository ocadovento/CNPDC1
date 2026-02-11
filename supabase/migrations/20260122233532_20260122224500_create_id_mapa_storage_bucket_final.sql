/*
  # Create ID Mapa Storage Bucket
  
  1. Storage
    - Create "id_mapa" bucket for identity document uploads
    - Allow public access for reading
    - Allow authenticated users to upload
    - 50MB file size limit
    - Accept image formats (JPEG, PNG, PDF)
  
  2. Security
    - Public read access
    - Authenticated users can upload their own documents
    - Users can update/delete their own uploads
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id_mapa',
  'id_mapa',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for id_mapa'
  ) THEN
    CREATE POLICY "Public read access for id_mapa"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'id_mapa');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload id_mapa'
  ) THEN
    CREATE POLICY "Authenticated users can upload id_mapa"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'id_mapa');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own id_mapa'
  ) THEN
    CREATE POLICY "Users can update own id_mapa"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'id_mapa' AND auth.uid() = owner)
      WITH CHECK (bucket_id = 'id_mapa');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own id_mapa'
  ) THEN
    CREATE POLICY "Users can delete own id_mapa"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'id_mapa' AND auth.uid() = owner);
  END IF;
END $$;