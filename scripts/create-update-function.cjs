const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUpdateFunction() {
  try {
    console.log('🔧 Creating update_user_presence function...');

    // SQL для создания функции
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.update_user_presence(
        p_status text DEFAULT 'online',
        p_location text DEFAULT 'Таврос'
      )
      RETURNS void
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        INSERT INTO public.user_activity (user_id, last_seen, status, location, last_activity)
        VALUES (auth.uid(), now(), p_status::text, p_location, now())
        ON CONFLICT (user_id)
        DO UPDATE SET 
          last_seen = now(),
          status = p_status::text,
          location = p_location,
          last_activity = now();
      $$;
    `;

    // Попробуем выполнить через прямой SQL запрос
    console.log('📝 Attempting to create function via SQL...');
    
    // К сожалению, Supabase не позволяет выполнять произвольный SQL через клиент
    // Но мы можем проверить, работает ли функция без параметров
    
    console.log('🧪 Testing simple update_user_presence...');
    
    const { error: simpleError } = await supabase.rpc('update_user_presence');
    
    if (simpleError) {
      console.log(`❌ Simple update_user_presence failed: ${simpleError.message}`);
      
      // Попробуем альтернативный подход - прямую вставку
      console.log('🔄 Trying direct insert approach...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ No authenticated user found');
        return;
      }
      
      const { error: insertError } = await supabase
        .from('user_activity')
        .upsert({
          user_id: user.id,
          last_seen: new Date().toISOString(),
          status: 'online',
          location: 'Таврос',
          last_activity: new Date().toISOString()
        });
        
      if (insertError) {
        console.log(`❌ Direct insert failed: ${insertError.message}`);
      } else {
        console.log('✅ Direct insert successful');
      }
    } else {
      console.log('✅ Simple update_user_presence working');
    }

    // Проверяем результат
    console.log('\n🧪 Testing get_online_players after update...');
    
    const { data: players, error: playersError } = await supabase.rpc('get_online_players');
    
    if (playersError) {
      console.log(`❌ get_online_players failed: ${playersError.message}`);
    } else {
      console.log(`✅ Found ${players?.length || 0} online players`);
      if (players && players.length > 0) {
        players.forEach(player => {
          console.log(`   - ${player.username} (${player.status}) in ${player.location}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Function creation failed:', error);
  }
}

createUpdateFunction();
