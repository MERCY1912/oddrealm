
-- Создание таблицы для образов героев
create table public.admin_hero_avatars (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Открытая (безопасная, только для админки или открытую при необходимости) политика доступа без RLS
