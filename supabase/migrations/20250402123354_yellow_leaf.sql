/*
  # Add public wrapper for get_user_id_by_email function

  1. Changes
    - Create a public wrapper function that calls auth.get_user_id_by_email
    - Grant execute permission to authenticated users

  2. Security
    - Function is marked as SECURITY DEFINER to maintain proper permissions
    - Search path is explicitly set to prevent search path attacks
*/

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_input TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN auth.get_user_id_by_email(email_input);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;