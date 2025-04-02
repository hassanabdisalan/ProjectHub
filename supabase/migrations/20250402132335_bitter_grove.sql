-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_settings(uuid);

-- Recreate the function with correct column reference
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings jsonb;
BEGIN
  -- Verify user exists and caller has permission
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get settings with default values
  SELECT COALESCE(us.settings, '{
    "theme": "system",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": true
    }
  }'::jsonb)
  INTO v_settings
  FROM user_settings us
  WHERE us.user_id = p_user_id;

  -- If no settings exist, create default settings
  IF NOT FOUND THEN
    v_settings := '{
      "theme": "system",
      "notifications": {
        "email": true,
        "push": true,
        "desktop": true
      }
    }'::jsonb;

    INSERT INTO user_settings (user_id, settings)
    VALUES (p_user_id, v_settings)
    ON CONFLICT (user_id) DO UPDATE
    SET settings = EXCLUDED.settings
    RETURNING settings INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_settings TO authenticated;