
-- 1. Удаляем существующий триггер, чтобы избежать конфликтов
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Создаем или заменяем функцию для создания профиля нового пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _username text := NEW.raw_user_meta_data->>'username';
  _character_class text := NEW.raw_user_meta_data->>'character_class';
  _health int;
  _max_health int;
  _mana int;
  _max_mana int;
  _attack int;
  _defense int;
BEGIN
  -- Устанавливаем класс по умолчанию "warrior", если он не указан или неизвестен
  IF _character_class IS NULL OR _character_class NOT IN ('warrior', 'mage', 'archer') THEN
    _character_class := 'warrior';
  END IF;

  -- Устанавливаем характеристики в зависимости от класса
  CASE _character_class
    WHEN 'warrior' THEN
      _health := 150; _max_health := 150; _mana := 50; _max_mana := 50; _attack := 18; _defense := 15;
    WHEN 'mage' THEN
      _health := 100; _max_health := 100; _mana := 200; _max_mana := 200; _attack := 25; _defense := 8;
    WHEN 'archer' THEN
      _health := 120; _max_health := 120; _mana := 100; _max_mana := 100; _attack := 20; _defense := 12;
  END CASE;

  -- Вставляем профиль, обеспечивая, что имя пользователя не является null
  INSERT INTO public.profiles (id, username, character_class, health, max_health, mana, max_mana, attack, defense)
  VALUES (NEW.id, COALESCE(_username, 'New Adventurer'), _character_class, _health, _max_health, _mana, _max_mana, _attack, _defense);
  
  RETURN NEW;
END;
$$;

-- 3. Создаем триггер для вызова функции после вставки нового пользователя
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Включаем RLS для таблицы profiles, если еще не включено
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Удаляем старые политики, чтобы избежать конфликтов.
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- 6. Создаем новые политики для SELECT и UPDATE. Вставка теперь обрабатывается триггером.
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );
