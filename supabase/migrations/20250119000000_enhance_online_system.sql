-- Улучшение системы отслеживания онлайн игроков
-- Добавляем дополнительные поля для более детального отслеживания статуса

-- Создаем enum для статусов игроков
CREATE TYPE player_status AS ENUM ('online', 'afk', 'in_battle', 'in_dungeon', 'offline');

-- Добавляем колонки в таблицу user_activity для более детального отслеживания
ALTER TABLE public.user_activity 
ADD COLUMN IF NOT EXISTS status player_status DEFAULT 'online',
ADD COLUMN IF NOT EXISTS location text DEFAULT 'Таврос',
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- Создаем индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_user_activity_status ON public.user_activity(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON public.user_activity(last_seen DESC);

-- Обновляем функцию update_user_presence для поддержки новых полей
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

-- Создаем функцию для получения списка онлайн игроков
CREATE OR REPLACE FUNCTION public.get_online_players()
RETURNS TABLE (
  user_id uuid,
  username text,
  level integer,
  character_class text,
  status player_status,
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
    ua.status,
    ua.location,
    ua.last_seen
  FROM public.user_activity ua
  JOIN public.profiles p ON ua.user_id = p.id
  WHERE ua.last_seen > (now() - interval '10 minutes')
  ORDER BY 
    CASE ua.status 
      WHEN 'online' THEN 1
      WHEN 'in_battle' THEN 2
      WHEN 'in_dungeon' THEN 3
      WHEN 'afk' THEN 4
      ELSE 5
    END,
    p.username ASC;
$$;

-- Создаем функцию для получения статистики онлайн игроков
CREATE OR REPLACE FUNCTION public.get_online_stats()
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
    COUNT(*) FILTER (WHERE status = 'online')::integer as online_count,
    COUNT(*) FILTER (WHERE status = 'afk')::integer as afk_count,
    COUNT(*) FILTER (WHERE status = 'in_battle')::integer as in_battle_count,
    COUNT(*) FILTER (WHERE status = 'in_dungeon')::integer as in_dungeon_count
  FROM public.user_activity
  WHERE last_seen > (now() - interval '10 minutes');
$$;

-- Даем права на выполнение новых функций
GRANT EXECUTE ON FUNCTION public.update_user_presence(player_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_players() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_stats() TO authenticated;

-- Создаем триггер для автоматического обновления last_activity при изменении статуса
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_last_activity
  BEFORE UPDATE ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_activity();

-- Обновляем существующие записи, устанавливая статус 'online' для активных пользователей
UPDATE public.user_activity 
SET status = 'online', location = 'Таврос', last_activity = last_seen
WHERE last_seen > (now() - interval '10 minutes');

