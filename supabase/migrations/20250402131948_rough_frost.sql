/*
  # Settings Implementation

  1. New Functions
    - `update_user_settings`: Updates user settings with validation
    - `update_workspace_settings`: Updates workspace settings with validation
    - `get_user_settings`: Retrieves user settings with defaults
    - `get_workspace_settings`: Retrieves workspace settings with defaults

  2. Security
    - RLS policies for all functions
    - Input validation for settings updates
    - Default values for new settings

  3. Triggers
    - Auto-create settings on user/workspace creation
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Workspace members can view settings" ON workspace_settings;
DROP POLICY IF EXISTS "Workspace admins can manage settings" ON workspace_settings;

-- Function to update user settings with validation
CREATE OR REPLACE FUNCTION update_user_settings(
  p_user_id uuid,
  p_settings jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_settings jsonb;
  v_new_settings jsonb;
BEGIN
  -- Verify user exists and caller has permission
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = p_user_id AND id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get current settings or defaults
  SELECT COALESCE(settings, '{}'::jsonb)
  INTO v_current_settings
  FROM user_settings
  WHERE user_id = p_user_id;

  -- Merge new settings with current settings
  v_new_settings = v_current_settings || p_settings;

  -- Validate theme
  IF (v_new_settings->>'theme') NOT IN ('light', 'dark', 'system') THEN
    v_new_settings = v_new_settings || '{"theme": "system"}'::jsonb;
  END IF;

  -- Validate notifications
  IF NOT (v_new_settings->'notifications' ? 'email') THEN
    v_new_settings = jsonb_set(
      v_new_settings,
      '{notifications,email}',
      'true'
    );
  END IF;

  IF NOT (v_new_settings->'notifications' ? 'push') THEN
    v_new_settings = jsonb_set(
      v_new_settings,
      '{notifications,push}',
      'true'
    );
  END IF;

  IF NOT (v_new_settings->'notifications' ? 'desktop') THEN
    v_new_settings = jsonb_set(
      v_new_settings,
      '{notifications,desktop}',
      'true'
    );
  END IF;

  -- Update settings
  INSERT INTO user_settings (user_id, settings)
  VALUES (p_user_id, v_new_settings)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    settings = v_new_settings,
    updated_at = now()
  RETURNING settings INTO v_new_settings;

  RETURN v_new_settings;
END;
$$;

-- Function to update workspace settings with validation
CREATE OR REPLACE FUNCTION update_workspace_settings(
  p_workspace_id uuid,
  p_settings jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_settings jsonb;
  v_new_settings jsonb;
BEGIN
  -- Verify workspace exists and caller has permission
  IF NOT EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE workspace_id = p_workspace_id 
    AND user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get current settings or defaults
  SELECT COALESCE(settings, '{}'::jsonb)
  INTO v_current_settings
  FROM workspace_settings
  WHERE workspace_id = p_workspace_id;

  -- Merge new settings with current settings
  v_new_settings = v_current_settings || p_settings;

  -- Validate notification preferences
  IF NOT (v_new_settings->'notification_preferences' ? 'email') THEN
    v_new_settings = jsonb_set(
      v_new_settings,
      '{notification_preferences,email}',
      'true'
    );
  END IF;

  IF NOT (v_new_settings->'notification_preferences' ? 'push') THEN
    v_new_settings = jsonb_set(
      v_new_settings,
      '{notification_preferences,push}',
      'true'
    );
  END IF;

  -- Update settings
  INSERT INTO workspace_settings (workspace_id, settings)
  VALUES (p_workspace_id, v_new_settings)
  ON CONFLICT (workspace_id) 
  DO UPDATE SET 
    settings = v_new_settings,
    updated_at = now()
  RETURNING settings INTO v_new_settings;

  RETURN v_new_settings;
END;
$$;

-- Function to get user settings with defaults
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

  -- Get settings or create with defaults
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

  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id, settings)
    VALUES (p_user_id, v_settings)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_settings;
END;
$$;

-- Function to get workspace settings with defaults
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

  -- Get settings or create with defaults
  SELECT COALESCE(settings, '{
    "notification_preferences": {
      "email": true,
      "push": true
    }
  }'::jsonb)
  INTO v_settings
  FROM workspace_settings
  WHERE workspace_id = p_workspace_id;

  IF NOT FOUND THEN
    INSERT INTO workspace_settings (workspace_id, settings)
    VALUES (p_workspace_id, v_settings)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_settings;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_settings TO authenticated;
GRANT EXECUTE ON FUNCTION update_workspace_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_workspace_settings TO authenticated;

-- Create or update tables
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

CREATE TABLE IF NOT EXISTS workspace_settings (
  workspace_id uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{
    "notification_preferences": {
      "email": true,
      "push": true
    }
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view workspace settings"
  ON workspace_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_settings.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace settings"
  ON workspace_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_settings.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'admin'
    )
  );

-- Triggers for automatic settings creation
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_default_workspace_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO workspace_settings (workspace_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

DROP TRIGGER IF EXISTS on_workspace_created_settings ON workspaces;
CREATE TRIGGER on_workspace_created_settings
  AFTER INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION create_default_workspace_settings();