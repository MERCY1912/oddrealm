
-- Создаем таблицу для управления башнями через админку
CREATE TABLE public.admin_towers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    level integer NOT NULL DEFAULT 1,
    health integer NOT NULL DEFAULT 100,
    attack integer NOT NULL DEFAULT 10,
    defense integer NOT NULL DEFAULT 5,
    cost integer NOT NULL DEFAULT 100,
    range integer NOT NULL DEFAULT 5,
    attack_speed float8 NOT NULL DEFAULT 1.0,
    description text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Включаем RLS для admin_towers
ALTER TABLE public.admin_towers ENABLE ROW LEVEL SECURITY;

-- Политика: Только админы могут управлять башнями
CREATE POLICY "AdminTowers - Admin full access"
ON public.admin_towers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Политика: Авторизованные пользователи могут просматривать башни
CREATE POLICY "AdminTowers - Authenticated read access"
ON public.admin_towers
FOR SELECT
TO authenticated
USING (true);

-- Добавляем триггер для обновления поля updated_at
CREATE TRIGGER handle_admin_towers_updated_at
BEFORE UPDATE ON public.admin_towers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
