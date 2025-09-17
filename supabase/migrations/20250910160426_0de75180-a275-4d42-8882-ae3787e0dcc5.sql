-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Create user_activity table
CREATE TABLE public.user_activity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    character_class text NOT NULL DEFAULT 'warrior',
    level integer NOT NULL DEFAULT 1,
    experience integer NOT NULL DEFAULT 0,
    experience_to_next integer NOT NULL DEFAULT 100,
    health integer NOT NULL DEFAULT 100,
    max_health integer NOT NULL DEFAULT 100,
    mana integer NOT NULL DEFAULT 50,
    max_mana integer NOT NULL DEFAULT 50,
    attack integer NOT NULL DEFAULT 10,
    defense integer NOT NULL DEFAULT 5,
    strength integer NOT NULL DEFAULT 10,
    dexterity integer NOT NULL DEFAULT 10,
    luck integer NOT NULL DEFAULT 10,
    endurance integer NOT NULL DEFAULT 10,
    magic integer NOT NULL DEFAULT 10,
    gold integer NOT NULL DEFAULT 1000,
    free_stat_points integer NOT NULL DEFAULT 0,
    avatar_url text,
    character_image_url text,
    description text DEFAULT '',
    city text DEFAULT 'Таврос',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create equipment table
CREATE TABLE public.equipment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slot text NOT NULL,
    item_id text,
    item_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (player_id, slot)
);

-- Create player_inventory table
CREATE TABLE public.player_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_id text NOT NULL,
    item_data jsonb NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    player_name text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admin_shop_items table
CREATE TABLE public.admin_shop_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id text UNIQUE NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    weapon_type text,
    rarity text NOT NULL,
    stats jsonb NOT NULL DEFAULT '{}',
    price integer NOT NULL DEFAULT 0,
    description text DEFAULT '',
    image_url text,
    requirements text DEFAULT '',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admin_bots table
CREATE TABLE public.admin_bots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id text UNIQUE NOT NULL,
    name text NOT NULL,
    level integer NOT NULL DEFAULT 1,
    health integer NOT NULL DEFAULT 100,
    max_health integer NOT NULL DEFAULT 100,
    attack integer NOT NULL DEFAULT 10,
    defense integer NOT NULL DEFAULT 5,
    experience integer NOT NULL DEFAULT 50,
    gold integer NOT NULL DEFAULT 25,
    difficulty text NOT NULL DEFAULT 'easy',
    image_url text,
    stats jsonb DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admin_towers table
CREATE TABLE public.admin_towers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tower_id text UNIQUE NOT NULL,
    name text NOT NULL,
    description text DEFAULT '',
    max_floors integer NOT NULL DEFAULT 10,
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admin_tower_floors table
CREATE TABLE public.admin_tower_floors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tower_id text REFERENCES public.admin_towers(tower_id) ON DELETE CASCADE NOT NULL,
    floor_number integer NOT NULL,
    bot_id text REFERENCES public.admin_bots(bot_id) ON DELETE SET NULL,
    rewards jsonb DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (tower_id, floor_number)
);

-- Create admin_locations table
CREATE TABLE public.admin_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id text UNIQUE NOT NULL,
    name text NOT NULL,
    description text DEFAULT '',
    image_url text,
    background_gradient text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admin_hero_avatars table
CREATE TABLE public.admin_hero_avatars (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_id text UNIQUE NOT NULL,
    name text NOT NULL,
    image_url text NOT NULL,
    category text DEFAULT 'general',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('admin-images', 'admin-images', true),
    ('avatars', 'avatars', true),
    ('location-images', 'location-images', true);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_tower_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_hero_avatars ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create user profile with default stats
  INSERT INTO public.profiles (
    id, 
    username,
    character_class,
    level,
    experience,
    experience_to_next,
    health,
    max_health,
    mana,
    max_mana,
    attack,
    defense,
    strength,
    dexterity,
    luck,
    endurance,
    magic,
    gold,
    free_stat_points
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', 'Player_' || substr(new.id::text, 1, 8)),
    'warrior',
    1,
    0,
    100,
    100,
    100,
    50,
    50,
    10,
    5,
    10,
    10,
    10,
    10,
    10,
    1000,
    0
  );

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  -- Create user activity record
  INSERT INTO public.user_activity (user_id, last_seen)
  VALUES (new.id, now());

  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_shop_items_updated_at
    BEFORE UPDATE ON public.admin_shop_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_bots_updated_at
    BEFORE UPDATE ON public.admin_bots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_towers_updated_at
    BEFORE UPDATE ON public.admin_towers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_tower_floors_updated_at
    BEFORE UPDATE ON public.admin_tower_floors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_locations_updated_at
    BEFORE UPDATE ON public.admin_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_hero_avatars_updated_at
    BEFORE UPDATE ON public.admin_hero_avatars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" ON public.user_activity
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_activity
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for equipment
CREATE POLICY "Users can view their own equipment" ON public.equipment
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can manage their own equipment" ON public.equipment
    FOR ALL USING (auth.uid() = player_id);

-- RLS Policies for player_inventory
CREATE POLICY "Users can view their own inventory" ON public.player_inventory
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can manage their own inventory" ON public.player_inventory
    FOR ALL USING (auth.uid() = player_id);

-- RLS Policies for chat_messages
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- RLS Policies for admin tables (admin only)
CREATE POLICY "Admins can manage shop items" ON public.admin_shop_items
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active shop items" ON public.admin_shop_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage bots" ON public.admin_bots
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active bots" ON public.admin_bots
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage towers" ON public.admin_towers
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active towers" ON public.admin_towers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tower floors" ON public.admin_tower_floors
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active tower floors" ON public.admin_tower_floors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage locations" ON public.admin_locations
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active locations" ON public.admin_locations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage hero avatars" ON public.admin_hero_avatars
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active hero avatars" ON public.admin_hero_avatars
    FOR SELECT USING (is_active = true);

-- Storage policies for admin-images bucket
CREATE POLICY "Admins can upload to admin-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'admin-images');

CREATE POLICY "Admins can update admin images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admin images" ON storage.objects
    FOR DELETE USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for location-images bucket
CREATE POLICY "Admins can manage location images" ON storage.objects
    FOR ALL USING (bucket_id = 'location-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Location images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'location-images');

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_equipment_player_id ON public.equipment(player_id);
CREATE INDEX idx_player_inventory_player_id ON public.player_inventory(player_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_admin_shop_items_active ON public.admin_shop_items(is_active);
CREATE INDEX idx_admin_bots_active ON public.admin_bots(is_active);
CREATE INDEX idx_admin_tower_floors_tower_id ON public.admin_tower_floors(tower_id);
CREATE INDEX idx_admin_locations_active ON public.admin_locations(is_active);
CREATE INDEX idx_admin_hero_avatars_active ON public.admin_hero_avatars(is_active);