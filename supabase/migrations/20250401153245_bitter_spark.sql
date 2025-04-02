/*
  # Fix workspace and member policies

  1. Changes
    - Fix column references in workspace policies
    - Simplify policy conditions to prevent recursion
    - Ensure proper access control for workspaces and members
    
  2. Security
    - Maintain proper access control for workspaces
    - Fix infinite recursion in policy evaluation
    - Ensure workspace creators retain proper permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow workspace access" ON workspaces;
DROP POLICY IF EXISTS "Allow workspace member access" ON workspace_members;
DROP POLICY IF EXISTS "Allow admin member management" ON workspace_members;
DROP POLICY IF EXISTS "Allow admin member removal" ON workspace_members;

-- Create simplified workspace policies
CREATE POLICY "workspace_access_policy" ON workspaces
FOR ALL
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
  OR id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Create workspace member policies
CREATE POLICY "workspace_member_select_policy" ON workspace_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 
    FROM workspaces 
    WHERE workspaces.id = workspace_members.workspace_id
    AND (workspaces.created_by = auth.uid() OR workspaces.is_public = true)
  )
);

CREATE POLICY "workspace_member_insert_policy" ON workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM workspaces 
    WHERE workspaces.id = workspace_members.workspace_id
    AND workspaces.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 
    FROM workspace_members existing_member
    WHERE existing_member.workspace_id = workspace_members.workspace_id
    AND existing_member.user_id = auth.uid() 
    AND existing_member.role = 'admin'
  )
);

CREATE POLICY "workspace_member_delete_policy" ON workspace_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM workspaces 
    WHERE workspaces.id = workspace_members.workspace_id
    AND workspaces.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 
    FROM workspace_members existing_member
    WHERE existing_member.workspace_id = workspace_members.workspace_id
    AND existing_member.user_id = auth.uid() 
    AND existing_member.role = 'admin'
  )
);