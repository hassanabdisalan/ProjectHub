/*
  # Fix Workspace Settings Migration

  1. Changes
    - Add settings column to workspace_settings table if it doesn't exist
    - Update get_workspace_settings function to properly handle settings column
    - Ensure proper default values for settings

  2. Security
    - Maintains existing RLS policies
    - Preserves security settings
*/

-- First ensure the workspace_settings table exists with the settings column
CREATE TABLE IF NOT EXISTS workspace_settings (
  workspace_id uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{
    "notification_preferences": {
      "email": true,
      "push": true
    },
    "security_settings": {}
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
    WHERE table_name = 'workspace_settings' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE workspace_settings 
    ADD COLUMN settings jsonb DEFAULT '{
      "notification_preferences": {
        "email": true,
        "push": true
      },
      "security_settings": {}
    }'::jsonb;
  END IF;
END $$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_workspace_settings(uuid);

-- Recreate the function with proper column handling
CREATE OR REPLACE FUNCTION get_workspace_settings(p_workspace_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings jsonb;
BEGIN
  -- Verify workspace exists and caller has permission
  IF NOT EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE workspace_id = p_workspace_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get or create settings with default values
  SELECT COALESCE(settings, '{
    "notification_preferences": {
      "email": true,
      "push": true
    },
    "security_settings": {}
  }'::jsonb)
  INTO v_settings
  FROM workspace_settings
  WHERE workspace_id = p_workspace_id;

  -- If no settings exist, create default settings
  IF NOT FOUND THEN
    v_settings := '{
      "notification_preferences": {
        "email": true,
        "push": true
      },
      "security_settings": {}
    }'::jsonb;

    INSERT INTO workspace_settings (workspace_id, settings)
    VALUES (p_workspace_id, v_settings)
    ON CONFLICT (workspace_id) DO UPDATE
    SET settings = EXCLUDED.settings
    RETURNING settings INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_workspace_settings TO authenticated;