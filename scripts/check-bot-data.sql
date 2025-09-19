-- =============================================
-- ПРОВЕРКА ДАННЫХ БОТОВ
-- =============================================
-- 
-- Инструкция:
-- 1. Скопируйте содержимое этого файла
-- 2. Откройте Supabase Dashboard → SQL Editor
-- 3. Вставьте и выполните этот код
--
-- =============================================

-- 1. Проверяем все боты в bot_characters
SELECT 
    id,
    name,
    username,
    character_class,
    level,
    is_active,
    status,
    location,
    created_at
FROM public.bot_characters
ORDER BY created_at;

-- 2. Проверяем присутствие ботов
SELECT 
    bp.bot_id,
    bc.name,
    bc.username,
    bp.status,
    bp.location,
    bp.last_seen
FROM public.bot_presence bp
JOIN public.bot_characters bc ON bp.bot_id = bc.id
ORDER BY bp.last_seen DESC;

-- 3. Активируем всех ботов (если нужно)
UPDATE public.bot_characters 
SET is_active = true 
WHERE is_active = false OR is_active IS NULL;

-- 4. Проверяем результат активации
SELECT 
    COUNT(*) as total_bots,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_bots
FROM public.bot_characters;

-- =============================================
-- РЕЗУЛЬТАТ ПРОВЕРКИ
-- =============================================
