/*
  # Create messages table with auto-delete trigger

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `created_at` (timestamp)
      - `sender_id` (text)
      - `sender_name` (text)

  2. Security
    - Enable RLS on `messages` table
    - Add policies for public read/write access
    - Add trigger for auto-deletion after 40 seconds
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  sender_id text NOT NULL,
  sender_name text NOT NULL
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON messages
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to delete old messages
CREATE OR REPLACE FUNCTION delete_old_messages() RETURNS trigger AS $$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '40 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-delete messages
CREATE OR REPLACE TRIGGER delete_old_messages_trigger
  AFTER INSERT ON messages
  EXECUTE FUNCTION delete_old_messages();