-- Исправление политик RLS для PvP системы
-- Выполните этот SQL в Supabase Dashboard -> SQL Editor

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view all pvp_requests" ON pvp_requests;
DROP POLICY IF EXISTS "Users can create pvp_requests" ON pvp_requests;
DROP POLICY IF EXISTS "Users can update their own pvp_requests" ON pvp_requests;

-- Создаем новые политики
CREATE POLICY "Users can view all pvp_requests" ON pvp_requests FOR SELECT USING (true);
CREATE POLICY "Users can create pvp_requests" ON pvp_requests FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update their own pvp_requests" ON pvp_requests FOR UPDATE USING (auth.uid() = challenger_id);

-- Проверяем, что политики созданы
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pvp_requests';



