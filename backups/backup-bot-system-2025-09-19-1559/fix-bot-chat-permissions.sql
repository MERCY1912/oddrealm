-- =============================================
-- ИСПРАВЛЕНИЕ ПРАВ ДОСТУПА ДЛЯ БОТОВ В ЧАТЕ
-- =============================================
-- 
-- Инструкция:
-- 1. Скопируйте содержимое этого файла
-- 2. Откройте Supabase Dashboard
-- 3. Перейдите в SQL Editor
-- 4. Вставьте и выполните этот код
--
-- =============================================

-- 1. Создаем отдельную таблицу для сообщений ботов в чате
CREATE TABLE IF NOT EXISTS public.bot_chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id uuid REFERENCES public.bot_characters(id) ON DELETE CASCADE NOT NULL,
    player_name text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Создаем индекс для производительности
CREATE INDEX IF NOT EXISTS idx_bot_chat_messages_created_at ON public.bot_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_chat_messages_bot_id ON public.bot_chat_messages(bot_id);

-- 3. Включаем RLS для новой таблицы
ALTER TABLE public.bot_chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Создаем политики для bot_chat_messages
CREATE POLICY "Anyone can read bot chat messages" ON public.bot_chat_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot chat messages" ON public.bot_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Создаем представление для объединения обычных и ботовых сообщений
CREATE OR REPLACE VIEW public.all_chat_messages AS
SELECT 
    id,
    player_id::text,
    player_name,
    message,
    created_at,
    false as is_bot_message
FROM public.chat_messages
UNION ALL
SELECT 
    id,
    bot_id::text as player_id,
    player_name,
    message,
    created_at,
    true as is_bot_message
FROM public.bot_chat_messages
ORDER BY created_at DESC;

-- 6. Права на представление
GRANT SELECT ON public.all_chat_messages TO authenticated;

-- 6. Создаем политики для таблиц ботов
ALTER TABLE public.bot_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_presence ENABLE ROW LEVEL SECURITY;

-- 7. Политики для bot_characters
CREATE POLICY "Anyone can read bot characters" ON public.bot_characters
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can update bot characters" ON public.bot_characters
FOR UPDATE
TO authenticated
USING (true);

-- 8. Политики для bot_messages
CREATE POLICY "Anyone can read bot messages" ON public.bot_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot messages" ON public.bot_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 9. Политики для bot_activity
CREATE POLICY "Anyone can read bot activity" ON public.bot_activity
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot activity" ON public.bot_activity
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 10. Политики для bot_presence
CREATE POLICY "Anyone can read bot presence" ON public.bot_presence
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can update bot presence" ON public.bot_presence
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot presence" ON public.bot_presence
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- ПРОВЕРКА ПРИМЕНЕНИЯ ПОЛИТИК
-- =============================================

-- Проверяем, что RLS включен
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('chat_messages', 'bot_characters', 'bot_messages', 'bot_activity', 'bot_presence');

-- Проверяем политики для chat_messages
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'chat_messages';

-- =============================================
-- ГОТОВО! Права доступа для ботов настроены.
-- =============================================
