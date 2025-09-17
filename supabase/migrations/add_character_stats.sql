
-- Add character stats columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS strength integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS dexterity integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS luck integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS endurance integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS magic integer DEFAULT 10;
