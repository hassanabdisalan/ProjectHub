/*
  # Update RLS policies for labels table

  1. Security Changes
    - Add RLS policy to allow users to view and manage labels for boards they have access to
    - Policy checks if:
      a) The board is public, or
      b) The user is a member of the workspace that owns the board

  2. Notes
    - Single comprehensive policy that handles all operations
    - Maintains data security while allowing collaboration
*/

CREATE POLICY "Users can access labels for accessible boards"
ON public.labels
AS PERMISSIVE
FOR ALL
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