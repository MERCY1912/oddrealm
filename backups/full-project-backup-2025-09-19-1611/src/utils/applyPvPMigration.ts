import { supabase } from '@/integrations/supabase/client';

export async function applyPvPMigration() {
  try {
    // Попробуем создать таблицы через SQL Editor API
    const migrationSQL = `
      -- Создание таблицы pvp_requests
      CREATE TABLE IF NOT EXISTS pvp_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        challenger_name TEXT NOT NULL,
        challenger_level INTEGER NOT NULL,
        challenger_class TEXT NOT NULL,
        wait_time INTEGER NOT NULL CHECK (wait_time IN (2, 5, 10)),
        status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'accepted', 'expired', 'cancelled')),
        accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Создание таблицы pvp_battles
      CREATE TABLE IF NOT EXISTS pvp_battles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        player1_name TEXT NOT NULL,
        player1_level INTEGER NOT NULL,
        player1_class TEXT NOT NULL,
        player1_current_health INTEGER NOT NULL,
        player1_max_health INTEGER NOT NULL,
        player1_stats JSONB DEFAULT '{}',
        player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        player2_name TEXT NOT NULL,
        player2_level INTEGER NOT NULL,
        player2_class TEXT NOT NULL,
        player2_current_health INTEGER NOT NULL,
        player2_max_health INTEGER NOT NULL,
        player2_stats JSONB DEFAULT '{}',
        current_turn INTEGER NOT NULL DEFAULT 1 CHECK (current_turn IN (1, 2)),
        round INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'waiting_for_moves' CHECK (status IN ('waiting_for_moves', 'processing', 'finished')),
        winner UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        battle_log TEXT[] DEFAULT '{}',
        rewards JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Создание таблицы pvp_moves
      CREATE TABLE IF NOT EXISTS pvp_moves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        battle_id UUID NOT NULL REFERENCES pvp_battles(id) ON DELETE CASCADE,
        player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        attack_zone TEXT NOT NULL CHECK (attack_zone IN ('head', 'chest', 'stomach', 'groin', 'legs')),
        defense_zone TEXT NOT NULL CHECK (defense_zone IN ('head', 'chest', 'stomach', 'groin', 'legs')),
        round INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Включение RLS
      ALTER TABLE pvp_requests ENABLE ROW LEVEL SECURITY;
      ALTER TABLE pvp_battles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE pvp_moves ENABLE ROW LEVEL SECURITY;

      -- Политики безопасности для pvp_requests
      CREATE POLICY "Users can view all pvp_requests" ON pvp_requests FOR SELECT USING (true);
      CREATE POLICY "Users can create pvp_requests" ON pvp_requests FOR INSERT WITH CHECK (auth.uid() = challenger_id);
      CREATE POLICY "Users can update their own pvp_requests" ON pvp_requests FOR UPDATE USING (auth.uid() = challenger_id);

      -- Политики безопасности для pvp_battles
      CREATE POLICY "Users can view their pvp_battles" ON pvp_battles FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);
      CREATE POLICY "Users can create pvp_battles" ON pvp_battles FOR INSERT WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);
      CREATE POLICY "Users can update their pvp_battles" ON pvp_battles FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

      -- Политики безопасности для pvp_moves
      CREATE POLICY "Users can view pvp_moves for their battles" ON pvp_moves FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM pvp_battles 
          WHERE pvp_battles.id = pvp_moves.battle_id 
          AND (pvp_battles.player1_id = auth.uid() OR pvp_battles.player2_id = auth.uid())
        )
      );
      CREATE POLICY "Users can create pvp_moves for their battles" ON pvp_moves FOR INSERT WITH CHECK (
        auth.uid() = player_id AND
        EXISTS (
          SELECT 1 FROM pvp_battles 
          WHERE pvp_battles.id = pvp_moves.battle_id 
          AND (pvp_battles.player1_id = auth.uid() OR pvp_battles.player2_id = auth.uid())
        )
      );
    `;

    // Попробуем выполнить через rpc
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration via rpc:', error);
      
      // Если rpc не работает, попробуем альтернативный способ
      console.log('Trying alternative approach...');
      return await createTablesManually();
    }

    console.log('PvP migration applied successfully!');
    return true;
  } catch (error) {
    console.error('Error applying PvP migration:', error);
    return await createTablesManually();
  }
}

async function createTablesManually() {
  try {
    // Альтернативный способ - создаем таблицы по одной
    console.log('Creating tables manually...');
    
    // Проверяем, существуют ли уже таблицы
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['pvp_requests', 'pvp_battles', 'pvp_moves']);

    if (tablesError) {
      console.error('Error checking existing tables:', tablesError);
      return false;
    }

    const existingTables = tables?.map(t => t.table_name) || [];
    
    if (existingTables.length === 3) {
      console.log('All PvP tables already exist!');
      return true;
    }

    console.log('Some tables are missing. Please create them manually in Supabase dashboard.');
    console.log('Missing tables:', ['pvp_requests', 'pvp_battles', 'pvp_moves'].filter(t => !existingTables.includes(t)));
    
    return false;
  } catch (error) {
    console.error('Error in manual table creation:', error);
    return false;
  }
}
