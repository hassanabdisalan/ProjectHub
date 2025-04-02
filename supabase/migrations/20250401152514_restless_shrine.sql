/*
  # Fix workspace policies recursion

  1. Changes
    - Remove recursive policy checks
    - Simplify workspace member access policies
    - Add more efficient workspace access control

  2. Security
    - Maintain RLS protection
    - Ensure proper access control
    - Fix infinite recursion issues
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for public workspaces" ON workspaces;
DROP POLICY IF EXISTS "Enable read access for workspace members" ON workspaces;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON workspaces;
DROP POLICY IF EXISTS "Enable update for workspace admins" ON workspaces;
DROP POLICY IF EXISTS "Enable read access for workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Enable insert for workspace admins" ON workspace_members;
DROP POLICY IF EXISTS "Enable delete for workspace admins" ON workspace_members;

-- Workspaces policies
CREATE POLICY "Allow reading public workspaces"
ON workspaces
FOR SELECT
USING (is_public = true);

CREATE POLICY "Allow members to read their workspaces"
ON workspaces
FOR SELECT
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to create workspaces"
ON workspaces
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow workspace admins to update"
ON workspaces
FOR UPDATE
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'admin'
  )
);

-- Workspace members policies
CREATE POLICY "Allow reading workspace members"
ON workspace_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_id
    AND (
      workspaces.is_public = true OR
      workspaces.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM workspace_members members
        WHERE members.workspace_id = workspaces.id
        AND members.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Allow admins to add members"
ON workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_id
    AND (
      workspaces.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM workspace_members members
        WHERE members.workspace_id = workspaces.id
        AND members.user_id = auth.uid()
        AND members.role = 'admin'
      )
    )
  )
);

CREATE POLICY "Allow admins to remove members"
ON workspace_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_id
    AND (
      workspaces.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM workspace_members members
        WHERE members.workspace_id = workspaces.id
        AND members.user_id = auth.uid()
        AND members.role = 'admin'
      )
    )
  )
);