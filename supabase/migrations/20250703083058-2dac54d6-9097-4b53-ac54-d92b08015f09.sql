
-- Добавляем колонку character_image_url в таблицу profiles
ALTER TABLE public.profiles 
ADD COLUMN character_image_url TEXT;

-- Обновляем существующие базовые локации и добавляем недостающие
INSERT INTO public.admin_locations (location_id, name, description, background_gradient, image_url)
VALUES 
  ('merchant', 'Лавка', 'Торговец с различными товарами и экипировкой', 'bg-gradient-to-b from-yellow-900 to-yellow-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('blacksmith', 'Кузница', 'Мастерская кузнеца для улучшения и ремонта экипировки', 'bg-gradient-to-b from-red-900 to-red-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('healer', 'Лазарет', 'Место исцеления и восстановления здоровья', 'bg-gradient-to-b from-green-900 to-green-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('arena', 'Арена', 'Место для сражений с другими бойцами', 'bg-gradient-to-b from-purple-900 to-purple-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('castle', 'Замок', 'Величественный замок правителя', 'bg-gradient-to-b from-gray-900 to-gray-700', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('tavern', 'Трактир', 'Место отдыха и общения путешественников', 'bg-gradient-to-b from-amber-900 to-amber-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('temple', 'Храм', 'Священное место для молитв и благословений', 'bg-gradient-to-b from-indigo-900 to-indigo-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('ancient-tower', 'Древняя башня', 'Загадочная башня полная опасностей и сокровищ', 'bg-gradient-to-b from-slate-900 to-slate-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png')
ON CONFLICT (location_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  background_gradient = EXCLUDED.background_gradient,
  image_url = EXCLUDED.image_url;

-- Создаем RLS политики для admin_locations, если их нет
DO $$ 
BEGIN
  -- Включаем RLS для admin_locations
  ALTER TABLE public.admin_locations ENABLE ROW LEVEL SECURITY;
  
  -- Политика для чтения всем аутентифицированным пользователям
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_locations' AND policyname = 'Everyone can view locations'
  ) THEN
    CREATE POLICY "Everyone can view locations" ON public.admin_locations
      FOR SELECT USING (true);
  END IF;
  
  -- Политика для админов на все операции
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_locations' AND policyname = 'Admins can manage locations'
  ) THEN
    CREATE POLICY "Admins can manage locations" ON public.admin_locations
      FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policies may already exist or other error occurred: %', SQLERRM;
END $$;
