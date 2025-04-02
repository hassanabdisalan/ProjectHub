/*
  # Fix Settings Column Migration

  1. Changes
    - Add settings column to user_settings table if it doesn't exist
    - Update get_user_settings function to properly handle settings column
    - Ensure proper default values for settings

  2. Security
    - Maintains existing RLS policies
    - Preserves security settings
*/

-- First ensure the user_settings table exists with the settings column
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{
    "theme": "system",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": true
    }
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add settings column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE user_settings 
    ADD COLUMN settings jsonb DEFAULT '{
      "theme": "system",
      "notifications": {
        "email": true,
        "push": true,
        "desktop": true
      }
    }'::jsonb;
  END IF;
END $$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_settings(uuid);

-- Recreate the function with proper column handling
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

  -- Get or create settings with default values
  SELECT COALESCE(settings, '{
    "theme": "system",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": true
    }
  }'::jsonb)
  INTO v_settings
  FROM user_settings
  WHERE user_id = p_user_id;

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