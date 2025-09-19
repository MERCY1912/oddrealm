-- =============================================
-- ПРОВЕРКА RLS ПОЛИТИК ДЛЯ БОТОВ
-- =============================================
-- 
-- Инструкция:
-- 1. Скопируйте содержимое этого файла
-- 2. Откройте Supabase Dashboard → SQL Editor
-- 3. Вставьте и выполните этот код
--
-- =============================================

-- 1. Проверяем RLS статус для таблиц ботов
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS включен'
        ELSE '❌ RLS выключен'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages')
ORDER BY tablename;

-- 2. Проверяем все политики для таблиц ботов
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
    AND tablename IN ('bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages')
ORDER BY tablename, cmd;

-- 3. Создаем политики (удаляем старые если есть)
-- Политики для bot_characters
DROP POLICY IF EXISTS "Anyone can read bot characters" ON public.bot_characters;
DROP POLICY IF EXISTS "Anyone can update bot characters" ON public.bot_characters;

CREATE POLICY "Anyone can read bot characters" ON public.bot_characters
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can update bot characters" ON public.bot_characters
FOR UPDATE
TO authenticated
USING (true);

-- Политики для bot_messages
DROP POLICY IF EXISTS "Anyone can read bot messages" ON public.bot_messages;
DROP POLICY IF EXISTS "Anyone can insert bot messages" ON public.bot_messages;

CREATE POLICY "Anyone can read bot messages" ON public.bot_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot messages" ON public.bot_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Политики для bot_activity
DROP POLICY IF EXISTS "Anyone can read bot activity" ON public.bot_activity;
DROP POLICY IF EXISTS "Anyone can insert bot activity" ON public.bot_activity;

CREATE POLICY "Anyone can read bot activity" ON public.bot_activity
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot activity" ON public.bot_activity
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Политики для bot_presence
DROP POLICY IF EXISTS "Anyone can read bot presence" ON public.bot_presence;
DROP POLICY IF EXISTS "Anyone can update bot presence" ON public.bot_presence;
DROP POLICY IF EXISTS "Anyone can insert bot presence" ON public.bot_presence;

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

-- Политики для bot_chat_messages
DROP POLICY IF EXISTS "Anyone can read bot chat messages" ON public.bot_chat_messages;
DROP POLICY IF EXISTS "Anyone can insert bot chat messages" ON public.bot_chat_messages;

CREATE POLICY "Anyone can read bot chat messages" ON public.bot_chat_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert bot chat messages" ON public.bot_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Проверяем результат
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages')
ORDER BY tablename, cmd;

-- =============================================
-- ГОТОВО! RLS политики для ботов настроены.
-- =============================================
