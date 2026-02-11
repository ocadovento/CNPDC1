/*
  # Criar Representantes GT Faltantes

  1. Problema
    - Os representantes Erval (TO) e Walter (DF) não existem no sistema
    - Eles precisam ter contas criadas para poder fazer login

  2. Solução
    - Usar a função auth.create_user para criar os usuários
    - Inserir os perfis na tabela usuarios

  3. Usuários a Criar
    - Erval (TO): coletivocidadeperifa@gmail.com, senha: gtto@cnpdc
    - Walter (DF): waltercedro@gmail.com, senha: gtdf@cnpdc
*/

-- Criar função temporária para criar usuários via SQL
CREATE OR REPLACE FUNCTION create_gt_user(
  p_email text,
  p_password text,
  p_nome_completo text,
  p_estado_uf text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_encrypted_pw text;
BEGIN
  -- Gerar hash da senha usando crypt
  v_encrypted_pw := crypt(p_password, gen_salt('bf'));
  
  -- Inserir usuário no auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    p_email,
    v_encrypted_pw,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO v_user_id;
  
  -- Inserir perfil na tabela usuarios
  INSERT INTO usuarios (
    auth_user_id,
    email,
    nome_completo,
    tipo_usuario,
    estado_uf,
    ativo
  ) VALUES (
    v_user_id,
    p_email,
    p_nome_completo,
    'representante_gt',
    p_estado_uf,
    true
  );
  
  RETURN v_user_id;
END;
$$;

-- Criar usuário Erval (TO)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificar se já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'coletivocidadeperifa@gmail.com';
  
  IF v_user_id IS NULL THEN
    v_user_id := create_gt_user(
      'coletivocidadeperifa@gmail.com',
      'gtto@cnpdc',
      'Erval Coletivo Cidade Periférica',
      'TO'
    );
    RAISE NOTICE 'Usuário Erval (TO) criado com ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário Erval (TO) já existe com ID: %', v_user_id;
  END IF;
END $$;

-- Criar usuário Walter (DF)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificar se já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'waltercedro@gmail.com';
  
  IF v_user_id IS NULL THEN
    v_user_id := create_gt_user(
      'waltercedro@gmail.com',
      'gtdf@cnpdc',
      'Walter Cedro',
      'DF'
    );
    RAISE NOTICE 'Usuário Walter (DF) criado com ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário Walter (DF) já existe com ID: %', v_user_id;
  END IF;
END $$;

-- Remover função temporária
DROP FUNCTION IF EXISTS create_gt_user;
