
-- Добавляем колонку is_active для управления видимостью ботов в игре
ALTER TABLE public.admin_bots ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
