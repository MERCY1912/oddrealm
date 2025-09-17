
-- Создаем таблицу для отслеживания активности пользователей
CREATE TABLE public.user_activity (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_seen timestamp with time zone NOT NULL DEFAULT now()
);

-- Включаем защиту на уровне строк
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи могут обновлять только свою активность
CREATE POLICY "Users can update their own activity"
ON public.user_activity
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Политика: Авторизованные пользователи могут видеть всю активность
CREATE POLICY "Authenticated users can view activity"
ON public.user_activity
FOR SELECT
TO authenticated
USING (true);

-- Создаем функцию для обновления времени последнего визита
CREATE OR REPLACE FUNCTION public.update_user_presence()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.user_activity (user_id, last_seen)
  VALUES (auth.uid(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET last_seen = now();
$$;

-- Даем права на выполнение этой функции авторизованным пользователям
GRANT EXECUTE ON FUNCTION public.update_user_presence() TO authenticated;
