/*
  # Add card status fields

  1. Changes
    - Add priority field to cards table
    - Add completed field to cards table
    - Update existing cards with default values

  2. New Fields
    - priority: enum ('low', 'medium', 'high')
    - completed: boolean (default false)
*/

-- Create priority enum type
DO $$ BEGIN
  CREATE TYPE card_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to cards table
ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS priority card_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;

-- Update existing cards with default values
UPDATE cards
SET 
  priority = 'medium',
  completed = false
WHERE 
  priority IS NULL OR completed IS NULL;

-- Make sure the columns are not nullable
ALTER TABLE cards
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN completed SET NOT NULL;

-- Add index for completed status to improve query performance
CREATE INDEX IF NOT EXISTS idx_cards_completed ON cards(completed);

-- Add index for priority to improve sorting and filtering
CREATE INDEX IF NOT EXISTS idx_cards_priority ON cards(priority);

-- Add index for combined due date and completion status queries
CREATE INDEX IF NOT EXISTS idx_cards_due_date_completed 
ON cards(due_date, completed);