
-- Добавляем колонку для города в профиль игрока
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
