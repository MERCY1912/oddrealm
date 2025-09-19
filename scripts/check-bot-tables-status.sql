-- =============================================
-- ПРОВЕРКА СТАТУСА ТАБЛИЦ БОТОВ И ПОЛИТИК
-- =============================================
-- 
-- Инструкция:
-- 1. Скопируйте содержимое этого файла
-- 2. Откройте Supabase Dashboard → SQL Editor
-- 3. Вставьте и выполните этот код
--
-- =============================================

-- 1. Проверяем существование таблиц ботов
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages') 
        THEN '✅ Существует'
        ELSE '❌ Отсутствует'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages', 'chat_messages')
ORDER BY table_name;

-- 2. Проверяем RLS статус для всех таблиц
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS включен'
        ELSE '❌ RLS выключен'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('chat_messages', 'bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages')
ORDER BY tablename;

-- 3. Проверяем все политики для таблиц ботов
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
    AND tablename IN ('chat_messages', 'bot_characters', 'bot_messages', 'bot_activity', 'bot_presence', 'bot_chat_messages')
ORDER BY tablename, cmd;

-- 4. Проверяем существование представления all_chat_messages
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name = 'all_chat_messages' THEN '✅ Существует'
        ELSE '❌ Отсутствует'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'all_chat_messages';

-- 5. Проверяем содержимое таблицы bot_characters
SELECT 
    COUNT(*) as bot_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_bots
FROM public.bot_characters;

-- 6. Проверяем содержимое таблицы bot_presence
SELECT 
    COUNT(*) as presence_count
FROM public.bot_presence;

-- =============================================
-- РЕЗУЛЬТАТ ПРОВЕРКИ
-- =============================================
