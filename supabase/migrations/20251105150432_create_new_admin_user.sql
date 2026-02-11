/*
  # Create Fresh Admin User

  1. Purpose
    - Delete the problematic admin user
    - This will allow you to re-register with the same email

  2. Actions
    - Delete from usuarios table
    - Delete from auth.users table
*/

-- Delete from usuarios first (due to foreign key)
DELETE FROM usuarios WHERE email = 'ocadovento@gmail.com';

-- Delete from auth.users
DELETE FROM auth.users WHERE email = 'ocadovento@gmail.com';
