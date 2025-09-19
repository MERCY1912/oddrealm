
-- Create a table for player inventory
CREATE TABLE public.player_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_data JSONB NOT NULL DEFAULT '{}',
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure players can only see their own inventory
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own inventory items
CREATE POLICY "Users can view their own inventory" 
  ON public.player_inventory 
  FOR SELECT 
  USING (auth.uid() = player_id);

-- Create policy that allows users to INSERT their own inventory items
CREATE POLICY "Users can add items to their inventory" 
  ON public.player_inventory 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

-- Create policy that allows users to UPDATE their own inventory items
CREATE POLICY "Users can update their own inventory" 
  ON public.player_inventory 
  FOR UPDATE 
  USING (auth.uid() = player_id);

-- Create policy that allows users to DELETE their own inventory items
CREATE POLICY "Users can delete their own inventory items" 
  ON public.player_inventory 
  FOR DELETE 
  USING (auth.uid() = player_id);

-- Create index for better performance
CREATE INDEX idx_player_inventory_player_id ON public.player_inventory(player_id);
