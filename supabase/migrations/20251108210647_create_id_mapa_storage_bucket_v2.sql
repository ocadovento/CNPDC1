/*
  # Criar bucket de storage para ID do Mapa

  1. Novo Bucket
    - Cria bucket `id-mapa` no Supabase Storage
    - Permite uploads de arquivos PNG e PDF
    - Público para leitura
    - Tamanho máximo: 10MB
    
  2. Segurança
    - Políticas RLS para controlar acesso
    - Usuários autenticados podem fazer upload
    - Todos podem visualizar (bucket público)
*/

-- Criar bucket para ID do Mapa se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-mapa',
  'id-mapa',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Authenticated users can upload id-mapa files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view id-mapa files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own id-mapa files" ON storage.objects;
DROP POLICY IF EXISTS "Anon can upload id-mapa files" ON storage.objects;

-- Política: Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload id-mapa files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'id-mapa');

-- Política: Usuários anônimos podem fazer upload (para formulário público)
CREATE POLICY "Anon can upload id-mapa files"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'id-mapa');

-- Política: Qualquer pessoa pode visualizar (bucket público)
CREATE POLICY "Public can view id-mapa files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'id-mapa');

-- Política: Usuários autenticados podem deletar seus próprios arquivos
CREATE POLICY "Users can delete own id-mapa files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'id-mapa');