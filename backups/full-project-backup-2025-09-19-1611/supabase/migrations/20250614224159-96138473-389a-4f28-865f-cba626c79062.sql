
-- Создаем тип роли
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Создаем таблицу ролей пользователей
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Включаем RLS для ролей
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Создаем функцию проверки роли
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Создаем политику для просмотра ролей (только свои роли)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Создаем политику для администраторов (могут видеть все роли)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Создаем таблицу для управления ботами через админку
CREATE TABLE public.admin_bots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    level integer NOT NULL DEFAULT 1,
    health integer NOT NULL DEFAULT 100,
    max_health integer NOT NULL DEFAULT 100,
    attack integer NOT NULL DEFAULT 10,
    defense integer NOT NULL DEFAULT 5,
    experience integer NOT NULL DEFAULT 0,
    gold integer NOT NULL DEFAULT 0,
    difficulty text NOT NULL DEFAULT 'easy',
    image_url text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Включаем RLS для admin_bots
ALTER TABLE public.admin_bots ENABLE ROW LEVEL SECURITY;

-- Только админы могут управлять ботами
CREATE POLICY "Only admins can manage bots"
ON public.admin_bots
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Создаем таблицу для управления предметами магазина
CREATE TABLE public.admin_shop_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id text UNIQUE NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    rarity text NOT NULL,
    stats jsonb NOT NULL DEFAULT '{}',
    price integer NOT NULL DEFAULT 0,
    description text,
    image_url text,
    requirements text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Включаем RLS для admin_shop_items
ALTER TABLE public.admin_shop_items ENABLE ROW LEVEL SECURITY;

-- Только админы могут управлять предметами
CREATE POLICY "Only admins can manage shop items"
ON public.admin_shop_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Все могут читать активные предметы магазина
CREATE POLICY "Everyone can view active shop items"
ON public.admin_shop_items
FOR SELECT
TO authenticated
USING (is_active = true);

-- Создаем таблицу для управления этажами башни
CREATE TABLE public.admin_tower_floors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_number integer UNIQUE NOT NULL,
    bot_id uuid REFERENCES public.admin_bots(id),
    floor_type text NOT NULL DEFAULT 'normal',
    difficulty text NOT NULL DEFAULT 'medium',
    rewards jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Включаем RLS для admin_tower_floors
ALTER TABLE public.admin_tower_floors ENABLE ROW LEVEL SECURITY;

-- Только админы могут управлять этажами башни
CREATE POLICY "Only admins can manage tower floors"
ON public.admin_tower_floors
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Все могут читать активные этажи башни
CREATE POLICY "Everyone can view active tower floors"
ON public.admin_tower_floors
FOR SELECT
TO authenticated
USING (is_active = true);

-- Создаем storage bucket для изображений админки
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-images', 'admin-images', true);

-- Политики для admin-images bucket
CREATE POLICY "Admin images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-images');

CREATE POLICY "Only admins can upload admin images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update admin images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete admin images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

-- Создаем триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;

CREATE TRIGGER handle_admin_bots_updated_at
BEFORE UPDATE ON public.admin_bots
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_admin_shop_items_updated_at
BEFORE UPDATE ON public.admin_shop_items
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_admin_tower_floors_updated_at
BEFORE UPDATE ON public.admin_tower_floors
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
