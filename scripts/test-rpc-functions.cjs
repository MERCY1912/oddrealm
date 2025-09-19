const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRPCFunctions() {
  try {
    console.log('🧪 Testing RPC Functions...\n');

    // 1. Тестируем update_user_presence
    console.log('1️⃣ Testing update_user_presence...');
    const { error: updateError } = await supabase.rpc('update_user_presence', {
      p_status: 'online',
      p_location: 'Таврос'
    });
    
    if (updateError) {
      console.log(`❌ update_user_presence failed: ${updateError.message}`);
    } else {
      console.log('✅ update_user_presence works!');
    }

    // 2. Тестируем get_online_players_fast
    console.log('\n2️⃣ Testing get_online_players_fast...');
    const { data: players, error: playersError } = await supabase.rpc('get_online_players_fast');
    
    if (playersError) {
      console.log(`❌ get_online_players_fast failed: ${playersError.message}`);
    } else {
      console.log(`✅ get_online_players_fast works! Found ${players?.length || 0} players`);
    }

    // 3. Тестируем get_online_stats_fast
    console.log('\n3️⃣ Testing get_online_stats_fast...');
    const { data: stats, error: statsError } = await supabase.rpc('get_online_stats_fast');
    
    if (statsError) {
      console.log(`❌ get_online_stats_fast failed: ${statsError.message}`);
    } else {
      console.log(`✅ get_online_stats_fast works! Stats:`, stats?.[0]);
    }

    // 4. Проверяем все статусы
    console.log('\n4️⃣ Testing all status types...');
    const statuses = ['online', 'afk', 'in_battle', 'in_dungeon'];
    
    for (const status of statuses) {
      const { error: statusError } = await supabase.rpc('update_user_presence', {
        p_status: status,
        p_location: 'Тест'
      });
      
      if (statusError) {
        console.log(`❌ Status '${status}' failed: ${statusError.message}`);
      } else {
        console.log(`✅ Status '${status}' works!`);
      }
    }

    console.log('\n🎉 All RPC functions test completed!');
    
    if (!updateError && !playersError && !statsError) {
      console.log('✅ All functions are working correctly!');
      console.log('🚀 You can now use the fast online system!');
    } else {
      console.log('⚠️  Some functions have issues. Check the errors above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRPCFunctions();
