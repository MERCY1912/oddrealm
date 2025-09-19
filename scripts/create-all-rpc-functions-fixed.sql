-- Исправленный SQL скрипт для создания RPC функций
-- Выполните в Supabase Dashboard -> SQL Editor

-- 1. Функция обновления присутствия пользователя (исправлена типизация)
CREATE OR REPLACE FUNCTION public.update_user_presence(
  p_status player_status DEFAULT 'online',
  p_location text DEFAULT 'Таврос'
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.user_activity (user_id, last_seen, status, location, last_activity)
  VALUES (auth.uid(), now(), p_status, p_location, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    last_seen = now(),
    status = p_status,
    location = p_location,
    last_activity = now();
$$;

-- 2. Оптимизированная функция получения онлайн игроков
CREATE OR REPLACE FUNCTION public.get_online_players_fast()
RETURNS TABLE (
  user_id uuid,
  username text,
  level integer,
  character_class text,
  status text,
  location text,
  last_seen timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ua.user_id,
    p.username,
    p.level,
    p.character_class,
    COALESCE(ua.status::text, 'online') as status,
    COALESCE(ua.location, 'Таврос') as location,
    ua.last_seen
  FROM public.user_activity ua
  JOIN public.profiles p ON ua.user_id = p.id
  WHERE ua.last_seen > (now() - interval '10 minutes')
  ORDER BY 
    CASE COALESCE(ua.status::text, 'online')
      WHEN 'online' THEN 1
      WHEN 'in_battle' THEN 2
      WHEN 'in_dungeon' THEN 3
      WHEN 'afk' THEN 4
      ELSE 5
    END,
    p.username ASC;
$$;

-- 3. Быстрая функция получения статистики
CREATE OR REPLACE FUNCTION public.get_online_stats_fast()
RETURNS TABLE (
  total_online integer,
  online_count integer,
  afk_count integer,
  in_battle_count integer,
  in_dungeon_count integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::integer as total_online,
    COUNT(*) FILTER (WHERE COALESCE(status::text, 'online') = 'online')::integer as online_count,
    COUNT(*) FILTER (WHERE status::text = 'afk')::integer as afk_count,
    COUNT(*) FILTER (WHERE status::text = 'in_battle')::integer as in_battle_count,
    COUNT(*) FILTER (WHERE status::text = 'in_dungeon')::integer as in_dungeon_count
  FROM public.user_activity
  WHERE last_seen > (now() - interval '10 minutes');
$$;

-- 4. Индексы для максимальной производительности
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen_status 
ON public.user_activity(last_seen DESC, status);

CREATE INDEX IF NOT EXISTS idx_user_activity_status_last_seen 
ON public.user_activity(status, last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_id_username 
ON public.profiles(id, username);

-- 5. Права на выполнение функций
GRANT EXECUTE ON FUNCTION public.update_user_presence(player_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_players_fast() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_stats_fast() TO authenticated;

-- 6. Обновляем существующие записи для совместимости
UPDATE public.user_activity 
SET status = 'online'::player_status, location = 'Таврос', last_activity = last_seen
WHERE last_seen > (now() - interval '10 minutes') 
  AND (status IS NULL OR location IS NULL);

-- 7. Проверяем, что все функции созданы корректно
DO $$
BEGIN
  -- Проверяем существование функций
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_presence') THEN
    RAISE EXCEPTION 'Function update_user_presence not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_online_players_fast') THEN
    RAISE EXCEPTION 'Function get_online_players_fast not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_online_stats_fast') THEN
    RAISE EXCEPTION 'Function get_online_stats_fast not created';
  END IF;
  
  RAISE NOTICE 'All RPC functions created successfully!';
END $$;
