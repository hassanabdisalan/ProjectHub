/*
# Add get_user_id_by_email function

This migration adds a PostgreSQL function to safely get a user's ID by their email address.

1. New Function
  - `get_user_id_by_email`: Returns the user ID for a given email address
  
2. Security
  - Function is marked as SECURITY DEFINER to run with elevated privileges
  - Access is restricted to authenticated users only
*/

-- Function to get user ID by email
CREATE OR REPLACE FUNCTION auth.get_user_id_by_email(email_input TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = email_input;
    
    RETURN user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.get_user_id_by_email(TEXT) TO authenticated;