/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text) - Type of notification (mention, due, completed, etc.)
      - `title` (text) - Short notification title
      - `content` (text) - Full notification content
      - `link` (text) - URL to the relevant resource
      - `icon` (text) - Icon identifier
      - `color` (text) - Color theme for the notification
      - `is_read` (boolean) - Whether notification has been read
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - `get_user_notifications` - Get notifications for a user
    - `mark_notification_read` - Mark a notification as read
    - `mark_all_notifications_read` - Mark all user's notifications as read

  3. Triggers
    - Auto-create notifications for various events
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  link text,
  icon text NOT NULL,
  color text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications()
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  content text,
  link text,
  icon text,
  color text,
  is_read boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.title,
    n.content,
    n.link,
    n.icon,
    n.color,
    n.is_read,
    n.created_at
  FROM notifications n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT 50;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    updated_at = now()
  WHERE id = notification_id
  AND user_id = auth.uid();
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    updated_at = now()
  WHERE user_id = auth.uid()
  AND is_read = false;
END;
$$;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_content text,
  p_link text,
  p_icon text,
  p_color text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    link,
    icon,
    color
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_content,
    p_link,
    p_icon,
    p_color
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Trigger function for card assignments
CREATE OR REPLACE FUNCTION notify_card_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  card_title text;
  board_id uuid;
  board_name text;
BEGIN
  -- Get card details
  SELECT c.title, l.board_id 
  INTO card_title, board_id
  FROM cards c
  JOIN lists l ON l.id = c.list_id
  WHERE c.id = NEW.card_id;

  -- Get board name
  SELECT name INTO board_name
  FROM boards
  WHERE id = board_id;

  -- Create notification
  PERFORM create_notification(
    NEW.user_id,
    'assignment',
    'New Card Assignment',
    format('You were assigned to "%s" in board "%s"', card_title, board_name),
    format('/boards/%s?card=%s', board_id, NEW.card_id),
    'clipboard-list',
    'text-blue-500'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for card assignments
CREATE TRIGGER on_card_assignment
  AFTER INSERT ON card_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_card_assignment();

-- Trigger function for due date approaching
CREATE OR REPLACE FUNCTION notify_due_date_approaching()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  board_id uuid;
  board_name text;
BEGIN
  -- Only create notification if due date is within 24 hours
  IF NEW.due_date IS NOT NULL AND 
     NEW.due_date > now() AND 
     NEW.due_date <= now() + interval '24 hours' THEN
    
    -- Get board details
    SELECT l.board_id, b.name 
    INTO board_id, board_name
    FROM lists l
    JOIN boards b ON b.id = l.board_id
    WHERE l.id = NEW.list_id;

    -- Create notification for card creator
    PERFORM create_notification(
      NEW.created_by,
      'due_date',
      'Task Due Soon',
      format('"%s" is due in less than 24 hours', NEW.title),
      format('/boards/%s?card=%s', board_id, NEW.id),
      'clock',
      'text-yellow-500'
    );

    -- Create notifications for card members
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link,
      icon,
      color
    )
    SELECT 
      cm.user_id,
      'due_date',
      'Task Due Soon',
      format('"%s" is due in less than 24 hours', NEW.title),
      format('/boards/%s?card=%s', board_id, NEW.id),
      'clock',
      'text-yellow-500'
    FROM card_members cm
    WHERE cm.card_id = NEW.id
    AND cm.user_id != NEW.created_by;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for due date notifications
CREATE TRIGGER on_card_due_date
  AFTER INSERT OR UPDATE OF due_date ON cards
  FOR EACH ROW
  EXECUTE FUNCTION notify_due_date_approaching();