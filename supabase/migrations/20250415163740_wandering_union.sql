/*
  # Add auto-delete functionality for messages
  
  1. Changes
    - Create a function to delete messages older than 40 seconds
    - Create a trigger to automatically delete old messages
  
  2. Security
    - Function is executed with security definer to ensure it has necessary permissions
*/

-- Function to delete messages older than 40 seconds
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM messages 
  WHERE created_at < NOW() - INTERVAL '40 seconds';
  RETURN NEW;
END;
$$;

-- Create trigger to run after each insert
DROP TRIGGER IF EXISTS delete_old_messages_trigger ON messages;
CREATE TRIGGER delete_old_messages_trigger
  AFTER INSERT ON messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION delete_old_messages();