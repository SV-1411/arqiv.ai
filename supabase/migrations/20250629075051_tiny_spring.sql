/*
  # Create saved research table

  1. New Tables
    - `saved_research`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `topic` (text, the research query)
      - `response` (text, the AI response)
      - `mode` (text, research category)
      - `depth` (text, research depth level)
      - `wiki_image` (text, Wikipedia image URL)
      - `images` (jsonb, array of image objects)
      - `suggestions` (jsonb, array of suggestion strings)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `saved_research` table
    - Add policy for users to read their own data
    - Add policy for users to insert their own data
    - Add policy for users to update their own data
    - Add policy for users to delete their own data
*/

CREATE TABLE IF NOT EXISTS saved_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  response text NOT NULL,
  mode text NOT NULL DEFAULT 'Person',
  depth text NOT NULL DEFAULT 'Detailed Research',
  wiki_image text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE saved_research ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_research table
CREATE POLICY "Users can read own saved research"
  ON saved_research
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved research"
  ON saved_research
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved research"
  ON saved_research
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved research"
  ON saved_research
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS saved_research_user_id_idx ON saved_research(user_id);
CREATE INDEX IF NOT EXISTS saved_research_created_at_idx ON saved_research(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_research_updated_at
  BEFORE UPDATE ON saved_research
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();