
-- Проверим существующие локации и добавим базовые, если их нет
INSERT INTO admin_locations (location_id, name, description, background_gradient, image_url)
VALUES 
  ('town', 'Город', 'Центральная площадь города, где собираются искатели приключений', 'bg-gradient-to-b from-blue-900 to-blue-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('healer', 'Лечебница', 'Место исцеления и восстановления здоровья', 'bg-gradient-to-b from-green-900 to-green-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('blacksmith', 'Кузница', 'Мастерская кузнеца для улучшения экипировки', 'bg-gradient-to-b from-red-900 to-red-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('arena', 'Арена', 'Место для сражений с другими бойцами', 'bg-gradient-to-b from-purple-900 to-purple-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('ancient-tower', 'Древняя башня', 'Загадочная башня полная опасностей и сокровищ', 'bg-gradient-to-b from-gray-900 to-gray-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png'),
  ('merchant', 'Торговец', 'Магазин с различными товарами и экипировкой', 'bg-gradient-to-b from-yellow-900 to-yellow-800', '/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png')
ON CONFLICT (location_id) DO NOTHING;

-- Создадим storage bucket для картинок локаций, если его нет
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('location-images', 'location-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Политики для публичного доступа к картинкам локаций  
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'location-images');
CREATE POLICY "Authenticated users can upload location images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'location-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update location images" ON storage.objects FOR UPDATE USING (bucket_id = 'location-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete location images" ON storage.objects FOR DELETE USING (bucket_id = 'location-images' AND auth.role() = 'authenticated');
