-- =============================================
-- ИСПРАВЛЕННАЯ МИГРАЦИЯ СИСТЕМЫ БОТОВ
-- =============================================
-- 
-- Инструкция:
-- 1. Скопируйте содержимое этого файла
-- 2. Откройте Supabase Dashboard
-- 3. Перейдите в SQL Editor
-- 4. Вставьте и выполните этот код
--
-- =============================================

-- Создание системы ботов для имитации живых игроков
-- Дата: 2025-01-21 (исправленная версия)

-- 1. Таблица персонажей ботов
CREATE TABLE IF NOT EXISTS public.bot_characters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    username text UNIQUE NOT NULL,
    character_class text NOT NULL DEFAULT 'warrior',
    level integer NOT NULL DEFAULT 1,
    personality text NOT NULL,
    avatar_url text,
    is_active boolean NOT NULL DEFAULT true,
    response_chance integer NOT NULL DEFAULT 50 CHECK (response_chance >= 0 AND response_chance <= 100),
    last_activity timestamp with time zone DEFAULT now() NOT NULL,
    location text DEFAULT 'Таврос' NOT NULL,
    status player_status DEFAULT 'online' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Таблица сообщений ботов
CREATE TABLE IF NOT EXISTS public.bot_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id uuid REFERENCES public.bot_characters(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    response_to uuid REFERENCES public.chat_messages(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Таблица активности ботов
CREATE TABLE IF NOT EXISTS public.bot_activity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id uuid REFERENCES public.bot_characters(id) ON DELETE CASCADE NOT NULL,
    activity_type text NOT NULL CHECK (activity_type IN ('chat', 'status_change', 'location_change')),
    details text NOT NULL,
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_bot_characters_active ON public.bot_characters(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_characters_username ON public.bot_characters(username);
CREATE INDEX IF NOT EXISTS idx_bot_characters_status ON public.bot_characters(status);
CREATE INDEX IF NOT EXISTS idx_bot_messages_bot_id ON public.bot_messages(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_timestamp ON public.bot_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_bot_activity_bot_id ON public.bot_activity(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_activity_timestamp ON public.bot_activity(timestamp);

-- 5. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_bot_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bot_characters_updated_at
    BEFORE UPDATE ON public.bot_characters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bot_characters_updated_at();

-- 6. Функция для получения активных ботов
CREATE OR REPLACE FUNCTION public.get_active_bots()
RETURNS TABLE (
    id uuid,
    name text,
    username text,
    character_class text,
    level integer,
    personality text,
    avatar_url text,
    response_chance integer,
    last_activity timestamp with time zone,
    location text,
    status player_status
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        bc.id,
        bc.name,
        bc.username,
        bc.character_class,
        bc.level,
        bc.personality,
        bc.avatar_url,
        bc.response_chance,
        bc.last_activity,
        bc.location,
        bc.status
    FROM public.bot_characters bc
    WHERE bc.is_active = true
    ORDER BY bc.last_activity DESC;
$$;

-- 7. Функция для обновления присутствия бота
CREATE OR REPLACE FUNCTION public.update_bot_presence(
    p_bot_id uuid,
    p_status player_status DEFAULT NULL,
    p_location text DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.bot_characters 
    SET 
        status = COALESCE(p_status, status),
        location = COALESCE(p_location, location),
        last_activity = now(),
        updated_at = now()
    WHERE id = p_bot_id;
$$;

-- 8. Права на выполнение функций
GRANT EXECUTE ON FUNCTION public.get_active_bots() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_bot_presence(uuid, player_status, text) TO authenticated;

-- 9. Создаем ботов по умолчанию
INSERT INTO public.bot_characters (
    name, username, character_class, level, personality, is_active, response_chance, status, location
) VALUES 
(
    'Гароld',
    'garold_bot',
    'warrior',
    15,
    'Опытный воин, любит помогать новичкам. Говорит кратко и по делу. Часто упоминает бои и арену.',
    true,
    70,
    'online',
    'Таврос'
),
(
    'Мерлин',
    'merlin_bot',
    'mage',
    22,
    'Мудрый маг, знает много о магии и подземельях. Любит давать советы и рассказывать истории.',
    true,
    60,
    'online',
    'Таврос'
),
(
    'Луна',
    'luna_bot',
    'archer',
    18,
    'Ловкий лучник, дружелюбная и общительная. Любит обсуждать квесты и приключения.',
    true,
    80,
    'online',
    'Таврос'
)
ON CONFLICT (username) DO NOTHING;

-- 10. Добавляем ботов в user_activity для отображения в онлайн списке
-- ИСПРАВЛЕНИЕ: Используем ID бота напрямую вместо создания строки
INSERT INTO public.user_activity (user_id, last_seen, status, location, last_activity)
SELECT 
    bc.id as user_id,
    bc.last_activity as last_seen,
    bc.status,
    bc.location,
    bc.last_activity
FROM public.bot_characters bc
WHERE bc.is_active = true
ON CONFLICT (user_id) DO UPDATE SET
    last_seen = EXCLUDED.last_seen,
    status = EXCLUDED.status,
    location = EXCLUDED.location,
    last_activity = EXCLUDED.last_activity;

-- =============================================
-- ПРОВЕРКА УСПЕШНОГО ПРИМЕНЕНИЯ
-- =============================================

-- Проверяем созданные таблицы
SELECT 
    table_name,
    'Создана' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bot_characters', 'bot_messages', 'bot_activity');

-- Проверяем созданные функции
SELECT 
    routine_name,
    'Создана' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('get_active_bots', 'update_bot_presence');

-- Проверяем созданных ботов
SELECT 
    name,
    username,
    character_class,
    level,
    status,
    location,
    'Создан' as status
FROM public.bot_characters;

-- Проверяем ботов в user_activity
SELECT 
    ua.user_id,
    bc.name as bot_name,
    ua.status,
    ua.location,
    'В списке онлайн' as status
FROM public.user_activity ua
JOIN public.bot_characters bc ON ua.user_id = bc.id
WHERE bc.is_active = true;

-- =============================================
-- ГОТОВО! Система ботов установлена.
-- =============================================
