/*
  # Criar Bucket de Storage para Documentos e Relatórios

  1. Novo Bucket
    - `documents` - Bucket público para armazenar documentos (relatórios, etc)
    - Configurado como público para permitir acesso via URL pública
    - Tipos de arquivo permitidos: PDF, DOC, DOCX
    - Tamanho máximo: 50MB por arquivo

  2. Políticas de Segurança (RLS)
    - **Leitura pública**: Qualquer pessoa pode visualizar os documentos
    - **Upload**: Apenas usuários autenticados podem fazer upload
    - **Atualização**: Apenas o criador pode atualizar seus arquivos
    - **Exclusão**: Apenas o criador pode excluir seus arquivos

  3. Organização de Arquivos
    - `/relatorios/{estado_uf}/` - Relatórios estaduais organizados por UF

  4. Notas Importantes
    - Bucket criado como público para facilitar compartilhamento
    - Limite de 50MB por arquivo para relatórios
    - RLS garante que apenas autenticados podem fazer upload
*/

-- Remover o bucket se já existir (para recriar com configurações corretas)
DELETE FROM storage.buckets WHERE id = 'documents';

-- Criar o bucket 'documents' com acesso público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Documentos são públicos para visualização" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem excluir seus arquivos" ON storage.objects;

-- Política: Qualquer pessoa pode visualizar os documentos (leitura pública)
CREATE POLICY "Documentos são públicos para visualização"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'documents');

-- Política: Usuários autenticados podem fazer upload de documentos
CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Política: Usuários podem atualizar seus próprios arquivos
CREATE POLICY "Usuários podem atualizar seus arquivos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);

-- Política: Usuários podem excluir seus próprios arquivos
CREATE POLICY "Usuários podem excluir seus arquivos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner);