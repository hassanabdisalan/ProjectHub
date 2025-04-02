/*
  # Card Enhancements Schema

  1. New Tables
    - `auth.users` (required for foreign keys)
    - `labels` (board-level labels)
    - `card_labels` (junction table)
    - `checklists` (card checklists)
    - `checklist_items` (items in checklists)
    - `comments` (card comments)
    - `card_members` (card assignments)

  2. Security
    - Enable RLS on all tables
    - Add policies for workspace members
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name text,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage labels"
  ON labels
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN boards ON boards.workspace_id = workspace_members.workspace_id
      WHERE boards.id = labels.board_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Card Labels junction table
CREATE TABLE IF NOT EXISTS card_labels (
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  label_id uuid REFERENCES labels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (card_id, label_id)
);

ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage card labels"
  ON card_labels
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN boards ON boards.workspace_id = workspace_members.workspace_id
      JOIN lists ON lists.board_id = boards.id
      JOIN cards ON cards.list_id = lists.id
      WHERE cards.id = card_labels.card_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage checklists"
  ON checklists
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN boards ON boards.workspace_id = workspace_members.workspace_id
      JOIN lists ON lists.board_id = boards.id
      JOIN cards ON cards.list_id = lists.id
      WHERE cards.id = checklists.card_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage checklist items"
  ON checklist_items
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN boards ON boards.workspace_id = workspace_members.workspace_id
      JOIN lists ON lists.board_id = boards.id
      JOIN cards ON cards.list_id = lists.id
      JOIN checklists ON checklists.card_id = cards.id
      WHERE checklists.id = checklist_items.checklist_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage comments"
  ON comments
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN boards ON boards.workspace_id = workspace_members.workspace_id
      JOIN lists ON lists.board_id = boards.id
      JOIN cards ON cards.list_id = lists.id
      WHERE cards.id = comments.card_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Card Members junction table
CREATE TABLE IF NOT EXISTS card_members (
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (card_id, user_id)
);

ALTER TABLE card_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage card members"
  ON card_members
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN boards ON boards.workspace_id = workspace_members.workspace_id
      JOIN lists ON lists.board_id = boards.id
      JOIN cards ON cards.list_id = lists.id
      WHERE cards.id = card_members.card_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_labels_board_id ON labels(board_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_card_id ON card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_label_id ON card_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_checklists_card_id ON checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_members_card_id ON card_members(card_id);
CREATE INDEX IF NOT EXISTS idx_card_members_user_id ON card_members(user_id);