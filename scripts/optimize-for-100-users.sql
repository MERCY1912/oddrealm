-- Оптимизации для 100+ одновременных пользователей
-- Выполните в Supabase Dashboard -> SQL Editor

-- 1. Оптимизированная функция обновления присутствия
CREATE OR REPLACE FUNCTION public.update_user_presence_batch(
  p_updates jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_item jsonb;
BEGIN
  -- Обрабатываем все обновления в одной транзакции
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

-- 2. Оптимизированная функция получения онлайн игроков с пагинацией
CREATE OR REPLACE FUNCTION public.get_online_players_optimized(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_status_filter text DEFAULT NULL
)
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
AS $$
  SELECT 
    ua.user_id,
    p.username,
    p.level,
    p.character_class,
    ua.status,
    ua.location,
    ua.last_seen
  FROM public.user_activity ua
  JOIN public.profiles p ON ua.user_id = p.id
  WHERE ua.last_seen > (now() - interval '10 minutes')
    AND (p_status_filter IS NULL OR ua.status = p_status_filter)
  ORDER BY 
    CASE ua.status 
      WHEN 'online' THEN 1
      WHEN 'in_battle' THEN 2
      WHEN 'in_dungeon' THEN 3
      WHEN 'afk' THEN 4
      ELSE 5
    END,
    p.username ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- 3. Функция для получения только статистики (без списка игроков)
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
AS $$
  SELECT 
    COUNT(*)::integer as total_online,
    COUNT(*) FILTER (WHERE status = 'online')::integer as online_count,
    COUNT(*) FILTER (WHERE status = 'afk')::integer as afk_count,
    COUNT(*) FILTER (WHERE status = 'in_battle')::integer as in_battle_count,
    COUNT(*) FILTER (WHERE status = 'in_dungeon')::integer as in_dungeon_count
  FROM public.user_activity
  WHERE last_seen > (now() - interval '10 minutes');
$$;

-- 4. Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen_status 
ON public.user_activity(last_seen DESC, status);

CREATE INDEX IF NOT EXISTS idx_user_activity_status_last_seen 
ON public.user_activity(status, last_seen DESC);

-- 5. Права на выполнение
GRANT EXECUTE ON FUNCTION public.update_user_presence_batch(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_players_optimized(integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_stats_fast() TO authenticated;
