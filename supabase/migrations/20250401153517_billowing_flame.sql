/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Simplify workspace access policy to prevent recursion
    - Restructure workspace member policies to avoid circular references
    - Use direct EXISTS clauses for better performance
  
  2. Security
    - Maintain existing security rules while eliminating recursion
    - Ensure proper access control for workspaces and members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "workspace_access_policy" ON workspaces;
DROP POLICY IF EXISTS "workspace_member_select_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_member_insert_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_member_delete_policy" ON workspace_members;

-- Create non-recursive workspace access policy
CREATE POLICY "workspace_access_policy" ON workspaces
FOR ALL
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE workspace_members.workspace_id = id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Create non-recursive workspace member policies
CREATE POLICY "workspace_member_select_policy" ON workspace_members
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own memberships
  user_id = auth.uid()
);

CREATE POLICY "workspace_member_insert_policy" ON workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only workspace creators and admins can add members
  EXISTS (
    SELECT 1 
    FROM workspaces 
    WHERE id = workspace_id 
    AND created_by = auth.uid()
  )
  OR (
    role != 'admin' 
    AND EXISTS (
      SELECT 1 
      FROM workspace_members m
      WHERE m.workspace_id = workspace_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  )
);

CREATE POLICY "workspace_member_delete_policy" ON workspace_members
FOR DELETE
TO authenticated
USING (
  -- Only workspace creators and admins can remove members
  EXISTS (
    SELECT 1 
    FROM workspaces 
    WHERE id = workspace_id 
    AND created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 
    FROM workspace_members m
    WHERE m.workspace_id = workspace_id
    AND m.user_id = auth.uid()
    AND m.role = 'admin'
  )
);