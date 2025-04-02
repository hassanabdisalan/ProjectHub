/*
  # Add card status fields

  1. Changes
    - Add priority field to cards table (enum: low, medium, high)
    - Add completed field to cards table (boolean)
    - Add indexes for improved query performance
    - Set default values for existing cards

  2. New Fields
    - priority: enum ('low', 'medium', 'high')
      - Default: 'medium'
      - Used for: Task prioritization and filtering
    
    - completed: boolean
      - Default: false
      - Used for: Task completion tracking

  3. Indexes
    - idx_cards_completed: For filtering completed/incomplete tasks
    - idx_cards_priority: For sorting and filtering by priority
    - idx_cards_due_date_completed: For combined due date and completion queries
*/

-- Create priority enum type if it doesn't exist
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

-- Add indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_cards_completed 
ON cards(completed);

CREATE INDEX IF NOT EXISTS idx_cards_priority 
ON cards(priority);

CREATE INDEX IF NOT EXISTS idx_cards_due_date_completed 
ON cards(due_date, completed);

-- Add index for combined priority and completion status
CREATE INDEX IF NOT EXISTS idx_cards_priority_completed 
ON cards(priority, completed);

-- Add index for combined priority and due date
CREATE INDEX IF NOT EXISTS idx_cards_priority_due_date 
ON cards(priority, due_date);