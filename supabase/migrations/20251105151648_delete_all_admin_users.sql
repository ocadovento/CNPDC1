/*
  # Delete All Admin Users and Start Fresh

  1. Purpose
    - Delete all admin users from the system
    - Clear both usuarios and auth.users tables
    - Start completely fresh

  2. Actions
    - Delete all users from usuarios table
    - Delete all users from auth.users table
*/

-- Delete all users from usuarios table
DELETE FROM usuarios;

-- Delete all users from auth.users table
DELETE FROM auth.users;
