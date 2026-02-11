/*
  # Synchronize all tables with auth.users IDs (with constraints disabled)

  1. Strategy
    - Disable foreign key constraints temporarily
    - Update all IDs in correct order
    - Re-enable constraints
    
  2. ID Mappings
    Old ID (usuarios) -> New ID (auth.users)
    661d01e4... -> a2116dda... (coletivocidadeperifa@gmail.com)
    b6a1812b... -> a7215345... (erlieroab@gmail.com)
    f7aeace4... -> 6a4d6f25... (executivo@cultur.top)
    63372ee3... -> 5232ec85... (heliomarttins@gmail.com)
    0372493c... -> 8f18809c... (mariotuca@gmail.com)
    5da8ab1b... -> aa8c009d... (waltercedro@gmail.com)
*/

-- Step 1: Drop foreign key constraints temporarily
ALTER TABLE teias_estaduais DROP CONSTRAINT IF EXISTS teias_estaduais_representante_id_fkey;
ALTER TABLE delegacao_estado DROP CONSTRAINT IF EXISTS delegacao_estado_representante_id_fkey;
ALTER TABLE eventos_teias_foruns DROP CONSTRAINT IF EXISTS eventos_teias_foruns_representante_id_fkey;

-- Step 2: Update usuarios IDs first
UPDATE usuarios SET id = 'a2116dda-7725-4ddd-9f7c-8712bdab3846' WHERE email = 'coletivocidadeperifa@gmail.com';
UPDATE usuarios SET id = 'a7215345-2f88-40ba-820a-345a1bd29530' WHERE email = 'erlieroab@gmail.com';
UPDATE usuarios SET id = '6a4d6f25-9a1d-4350-b4d8-522ea47fd8c4' WHERE email = 'executivo@cultur.top';
UPDATE usuarios SET id = '5232ec85-2124-4719-8261-4d2d10091704' WHERE email = 'heliomarttins@gmail.com';
UPDATE usuarios SET id = '8f18809c-48b6-49a2-941e-3a3be7aec2c0' WHERE email = 'mariotuca@gmail.com';
UPDATE usuarios SET id = 'aa8c009d-1a15-461b-b13f-373bf00f872b' WHERE email = 'waltercedro@gmail.com';

-- Step 3: Update teias_estaduais
UPDATE teias_estaduais SET representante_id = 'a2116dda-7725-4ddd-9f7c-8712bdab3846' WHERE representante_id = '661d01e4-7d76-43c0-9dd9-2d39f5dd984c';
UPDATE teias_estaduais SET representante_id = 'a7215345-2f88-40ba-820a-345a1bd29530' WHERE representante_id = 'b6a1812b-e4bd-4bbf-9893-6390866642fe';
UPDATE teias_estaduais SET representante_id = '6a4d6f25-9a1d-4350-b4d8-522ea47fd8c4' WHERE representante_id = 'f7aeace4-67f8-4caf-9b16-6b139e52adc4';
UPDATE teias_estaduais SET representante_id = '5232ec85-2124-4719-8261-4d2d10091704' WHERE representante_id = '63372ee3-ac8c-480c-9385-f0c5d9338590';
UPDATE teias_estaduais SET representante_id = '8f18809c-48b6-49a2-941e-3a3be7aec2c0' WHERE representante_id = '0372493c-5044-4c4f-b3a1-38d1e2380bf0';
UPDATE teias_estaduais SET representante_id = 'aa8c009d-1a15-461b-b13f-373bf00f872b' WHERE representante_id = '5da8ab1b-c43b-40ab-a1d8-ce7e232a6f95';

-- Step 4: Update delegacao_estado
UPDATE delegacao_estado SET representante_id = 'a2116dda-7725-4ddd-9f7c-8712bdab3846' WHERE representante_id = '661d01e4-7d76-43c0-9dd9-2d39f5dd984c';
UPDATE delegacao_estado SET representante_id = 'a7215345-2f88-40ba-820a-345a1bd29530' WHERE representante_id = 'b6a1812b-e4bd-4bbf-9893-6390866642fe';
UPDATE delegacao_estado SET representante_id = '6a4d6f25-9a1d-4350-b4d8-522ea47fd8c4' WHERE representante_id = 'f7aeace4-67f8-4caf-9b16-6b139e52adc4';
UPDATE delegacao_estado SET representante_id = '5232ec85-2124-4719-8261-4d2d10091704' WHERE representante_id = '63372ee3-ac8c-480c-9385-f0c5d9338590';
UPDATE delegacao_estado SET representante_id = '8f18809c-48b6-49a2-941e-3a3be7aec2c0' WHERE representante_id = '0372493c-5044-4c4f-b3a1-38d1e2380bf0';
UPDATE delegacao_estado SET representante_id = 'aa8c009d-1a15-461b-b13f-373bf00f872b' WHERE representante_id = '5da8ab1b-c43b-40ab-a1d8-ce7e232a6f95';

-- Step 5: Update eventos_teias_foruns
UPDATE eventos_teias_foruns SET representante_id = 'a2116dda-7725-4ddd-9f7c-8712bdab3846' WHERE representante_id = '661d01e4-7d76-43c0-9dd9-2d39f5dd984c';
UPDATE eventos_teias_foruns SET representante_id = 'a7215345-2f88-40ba-820a-345a1bd29530' WHERE representante_id = 'b6a1812b-e4bd-4bbf-9893-6390866642fe';
UPDATE eventos_teias_foruns SET representante_id = '6a4d6f25-9a1d-4350-b4d8-522ea47fd8c4' WHERE representante_id = 'f7aeace4-67f8-4caf-9b16-6b139e52adc4';
UPDATE eventos_teias_foruns SET representante_id = '5232ec85-2124-4719-8261-4d2d10091704' WHERE representante_id = '63372ee3-ac8c-480c-9385-f0c5d9338590';
UPDATE eventos_teias_foruns SET representante_id = '8f18809c-48b6-49a2-941e-3a3be7aec2c0' WHERE representante_id = '0372493c-5044-4c4f-b3a1-38d1e2380bf0';
UPDATE eventos_teias_foruns SET representante_id = 'aa8c009d-1a15-461b-b13f-373bf00f872b' WHERE representante_id = '5da8ab1b-c43b-40ab-a1d8-ce7e232a6f95';

-- Step 6: Recreate foreign key constraints
ALTER TABLE teias_estaduais 
  ADD CONSTRAINT teias_estaduais_representante_id_fkey 
  FOREIGN KEY (representante_id) REFERENCES usuarios(id);

ALTER TABLE delegacao_estado 
  ADD CONSTRAINT delegacao_estado_representante_id_fkey 
  FOREIGN KEY (representante_id) REFERENCES usuarios(id);

ALTER TABLE eventos_teias_foruns 
  ADD CONSTRAINT eventos_teias_foruns_representante_id_fkey 
  FOREIGN KEY (representante_id) REFERENCES usuarios(id);

-- Step 7: Delete orphan auth.users
DELETE FROM auth.users WHERE email IN ('culutrabrasil@cultur.top', 'mario@cnpdc.org.br');
