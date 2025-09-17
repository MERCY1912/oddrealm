
-- 1. Create a table for locations with support for custom images
CREATE TABLE public.admin_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text UNIQUE NOT NULL, -- e.g. 'merchant', 'blacksmith', etc.
  name text NOT NULL,
  description text,
  image_url text,
  background_gradient text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Add an index for fast lookup by location_id
CREATE UNIQUE INDEX admin_locations_location_id_idx ON public.admin_locations (location_id);

-- 3. Seed locations with the default city image as a placeholder
INSERT INTO public.admin_locations (location_id, name, description, image_url, background_gradient)
VALUES
  ('merchant', 'Торговая лавка', 'Здесь вы можете купить и продать различные товары', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-slate-800 to-slate-900'),
  ('blacksmith', 'Кузница', 'Мастерская по изготовлению и улучшению оружия и доспехов', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-red-900 to-gray-800'),
  ('healer', 'Лазарет', 'Место исцеления и изготовления лечебных зелий', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-green-900 to-green-800'),
  ('arena', 'Боевая арена', 'Место сражений и турниров для храбрых воинов', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-red-800 to-gray-900'),
  ('castle', 'Королевский замок', 'Резиденция знати и место получения важных заданий', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-purple-900 to-blue-900'),
  ('tavern', 'Веселый трактир', 'Место отдыха, общения и сбора информации', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-yellow-800 to-brown-800'),
  ('temple', 'Священный храм', 'Святое место для молитв и получения благословений', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-b from-blue-900 to-indigo-900'),
  ('ancient-tower', 'Башня Древних', 'Мистическая башня, испытание для сильнейших', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png', 'bg-gradient-to-br from-purple-900 to-indigo-900');

-- 4. Enable RLS for the table (optional, for now keep open for admins)
ALTER TABLE public.admin_locations ENABLE ROW LEVEL SECURITY;

-- (You can add RLS policies later if/when you implement granular admin rights)
