/*
  # Fix labels table RLS policy

  1. Changes
    - Drop existing policy
    - Create new policy that allows:
      - Users to read labels for boards they have access to
      - Users to manage labels for boards they have access to
  
  2. Security
    - Enable RLS on labels table
    - Add policies for:
      - Reading labels (public boards or workspace member)
      - Managing labels (workspace member)
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can access labels for accessible boards" ON public.labels;

-- Create policy for reading labels
CREATE POLICY "Users can read labels for accessible boards"
ON public.labels
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM boards
    WHERE boards.id = labels.board_id
    AND (
      boards.is_public = true
      OR EXISTS (
        SELECT 1
        FROM workspace_members
        WHERE workspace_members.workspace_id = boards.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    )
  )
);

-- Create policy for managing labels
CREATE POLICY "Users can manage labels for accessible boards"
ON public.labels
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM boards
    JOIN workspace_members ON workspace_members.workspace_id = boards.workspace_id
    WHERE boards.id = labels.board_id
    AND workspace_members.user_id = auth.uid()
  )
);