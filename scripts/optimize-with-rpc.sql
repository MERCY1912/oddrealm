-- Оптимизация: создание RPC функции для лучшей производительности
-- Выполните этот SQL в Supabase Dashboard -> SQL Editor

-- 1. Создаем оптимизированную функцию
CREATE OR REPLACE FUNCTION public.update_user_presence_optimized(
  p_status text DEFAULT 'online',
  p_location text DEFAULT 'Таврос'
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.user_activity (user_id, last_seen, status, location, last_activity)
  VALUES (auth.uid(), now(), p_status::text, p_location, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    last_seen = now(),
    status = p_status::text,
    location = p_location,
    last_activity = now();
$$;

-- 2. Даем права на выполнение
GRANT EXECUTE ON FUNCTION public.update_user_presence_optimized(text, text) TO authenticated;

-- 3. Создаем функцию для массового обновления (для будущего)
CREATE OR REPLACE FUNCTION public.update_multiple_users_presence(
  p_updates jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_item jsonb;
BEGIN
  FOR update_item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    INSERT INTO public.user_activity (
      user_id, 
      last_seen, 
      status, 
      location, 
      last_activity
    )
    VALUES (
      (update_item->>'user_id')::uuid,
      now(),
      update_item->>'status',
      update_item->>'location',
      now()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET 
      last_seen = now(),
      status = update_item->>'status',
      location = update_item->>'location',
      last_activity = now();
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_multiple_users_presence(jsonb) TO authenticated;
