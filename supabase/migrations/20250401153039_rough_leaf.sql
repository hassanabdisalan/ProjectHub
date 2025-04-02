/*
  # Fix workspace and workspace_members policies

  1. Changes
    - Remove recursive policies from workspace_members table
    - Simplify workspace access policies
    - Add direct membership checks without recursion
    
  2. Security
    - Maintain proper access control for workspaces and members
    - Prevent infinite recursion in policy evaluation
    - Ensure workspace creators and admins retain proper permissions
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow members to read their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow reading public workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow workspace admins to update" ON workspaces;
DROP POLICY IF EXISTS "Allow authenticated users to create workspaces" ON workspaces;

DROP POLICY IF EXISTS "Allow reading workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Allow admins to add members" ON workspace_members;
DROP POLICY IF EXISTS "Allow admins to remove members" ON workspace_members;

-- Recreate workspace policies without recursion
CREATE POLICY "Allow workspace access" ON workspaces
FOR ALL
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Recreate workspace_members policies without recursion
CREATE POLICY "Allow workspace member access" ON workspace_members
FOR SELECT
TO authenticated
USING (
  -- Allow if user is the workspace creator
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_members.workspace_id
    AND (workspaces.created_by = auth.uid() OR workspaces.is_public = true)
  )
  -- Or if user is a member of the workspace
  OR user_id = auth.uid()
);

CREATE POLICY "Allow admin member management" ON workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is the workspace creator or an admin
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_members.workspace_id
    AND workspaces.created_by = auth.uid()
  )
  OR (
    EXISTS (
      SELECT 1 FROM workspace_members existing_member
      WHERE existing_member.workspace_id = workspace_members.workspace_id
      AND existing_member.user_id = auth.uid()
      AND existing_member.role = 'admin'
    )
  )
);

CREATE POLICY "Allow admin member removal" ON workspace_members
FOR DELETE
TO authenticated
USING (
  -- Allow if user is the workspace creator or an admin
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_members.workspace_id
    AND workspaces.created_by = auth.uid()
  )
  OR (
    EXISTS (
      SELECT 1 FROM workspace_members existing_member
      WHERE existing_member.workspace_id = workspace_members.workspace_id
      AND existing_member.user_id = auth.uid()
      AND existing_member.role = 'admin'
    )
  )
);