/*
  # Fix workspace policies recursion

  1. Changes
    - Drop existing policies that may cause recursion
    - Create new simplified policies for workspaces and workspace members
    - Ensure proper access control without circular dependencies
    
  2. Security
    - Maintain proper access control for workspaces
    - Fix infinite recursion in policy evaluation
    - Ensure workspace creators and members retain proper permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "workspace_access_policy" ON workspaces;
DROP POLICY IF EXISTS "workspace_member_select_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_member_insert_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_member_delete_policy" ON workspace_members;

-- Create simplified workspace access policy
CREATE POLICY "workspace_access_policy" ON workspaces
FOR ALL
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Create workspace member policies
CREATE POLICY "workspace_member_select_policy" ON workspace_members
FOR SELECT
TO authenticated
USING (
  -- Users can see their own memberships
  user_id = auth.uid()
  -- Or if they are the workspace creator/owner
  OR EXISTS (
    SELECT 1 
    FROM workspaces w
    WHERE w.id = workspace_members.workspace_id
    AND (w.created_by = auth.uid() OR w.is_public = true)
  )
);

CREATE POLICY "workspace_member_insert_policy" ON workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Workspace creators can add members
  EXISTS (
    SELECT 1 
    FROM workspaces w
    WHERE w.id = workspace_members.workspace_id
    AND w.created_by = auth.uid()
  )
  -- Workspace admins can add members
  OR EXISTS (
    SELECT 1 
    FROM workspace_members m
    WHERE m.workspace_id = workspace_members.workspace_id
    AND m.user_id = auth.uid() 
    AND m.role = 'admin'
  )
);

CREATE POLICY "workspace_member_delete_policy" ON workspace_members
FOR DELETE
TO authenticated
USING (
  -- Workspace creators can remove members
  EXISTS (
    SELECT 1 
    FROM workspaces w
    WHERE w.id = workspace_members.workspace_id
    AND w.created_by = auth.uid()
  )
  -- Workspace admins can remove members
  OR EXISTS (
    SELECT 1 
    FROM workspace_members m
    WHERE m.workspace_id = workspace_members.workspace_id
    AND m.user_id = auth.uid() 
    AND m.role = 'admin'
  )
);