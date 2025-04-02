/*
  # Fix labels table RLS policies

  1. Changes
    - Drop existing policies
    - Create separate policies for:
      - Reading labels (public boards or workspace member)
      - Managing labels (workspace member)
  
  2. Security
    - Enable RLS on labels table
    - Add policies for:
      - SELECT: Allow reading labels for public boards or if user is workspace member
      - ALL: Allow full management for workspace members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read labels for accessible boards" ON public.labels;
DROP POLICY IF EXISTS "Users can manage labels for accessible boards" ON public.labels;
DROP POLICY IF EXISTS "Users can access labels for accessible boards" ON public.labels;

-- Create policy for reading labels
CREATE POLICY "Users can read labels for accessible boards"
ON public.labels
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