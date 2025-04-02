/*
  # Initial Schema for ProjectHub

  1. New Tables
    - `workspaces`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `is_public` (boolean)

    - `workspace_members`
      - `workspace_id` (uuid, references workspaces)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `created_at` (timestamp)

    - `boards`
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `name` (text)
      - `description` (text)
      - `background` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `is_public` (boolean)

    - `lists`
      - `id` (uuid, primary key)
      - `board_id` (uuid, references boards)
      - `name` (text)
      - `position` (integer)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

    - `cards`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references lists)
      - `title` (text)
      - `description` (text)
      - `position` (integer)
      - `due_date` (timestamp)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Workspace access based on membership
      - Board access based on workspace membership and public status
      - List and card access based on board access
*/

-- Create workspaces table
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  is_public boolean DEFAULT false
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create workspace_members table
CREATE TABLE workspace_members (
  workspace_id uuid REFERENCES workspaces ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Create boards table
CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  background text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  is_public boolean DEFAULT false
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Create lists table
CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES boards ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Create cards table
CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES lists ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  position integer NOT NULL,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Workspace policies
CREATE POLICY "Users can view public workspaces"
  ON workspaces
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Workspace members can view their workspaces"
  ON workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members with admin role can update workspace"
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

CREATE POLICY "Users can create workspaces"
  ON workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Workspace members policies
CREATE POLICY "Workspace members can view other members"
  ON workspace_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members members
      WHERE members.workspace_id = workspace_members.workspace_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins can manage members"
  ON workspace_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members members
      WHERE members.workspace_id = workspace_members.workspace_id
      AND members.user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- Board policies
CREATE POLICY "Users can view public boards"
  ON boards
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Workspace members can view their boards"
  ON boards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = boards.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create boards"
  ON boards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = boards.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- List policies
CREATE POLICY "Users can view lists of accessible boards"
  ON lists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND (
        boards.is_public = true
        OR EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = boards.workspace_id
          AND workspace_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace members can manage lists"
  ON lists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boards
      JOIN workspace_members ON workspace_members.workspace_id = boards.workspace_id
      WHERE boards.id = lists.board_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Card policies
CREATE POLICY "Users can view cards of accessible lists"
  ON cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (
        boards.is_public = true
        OR EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = boards.workspace_id
          AND workspace_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace members can manage cards"
  ON cards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      JOIN workspace_members ON workspace_members.workspace_id = boards.workspace_id
      WHERE lists.id = cards.list_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_due_date ON cards(due_date);