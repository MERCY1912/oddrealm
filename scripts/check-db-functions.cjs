const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseFunctions() {
  try {
    console.log('🔍 Checking database functions and structure...');

    // Проверяем структуру таблицы user_activity
    const { data: activityData, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .limit(1);

    if (activityError) {
      console.log(`❌ user_activity table error: ${activityError.message}`);
    } else {
      console.log('✅ user_activity table accessible');
    }

    // Проверяем существующие RPC функции
    const functions = [
      'get_online_players',
      'get_online_stats', 
      'update_user_presence'
    ];

    for (const funcName of functions) {
      try {
        if (funcName === 'update_user_presence') {
          const { error } = await supabase.rpc(funcName, {
            p_status: 'online',
            p_location: 'Таврос'
          });
          
          if (error) {
            console.log(`❌ ${funcName}: ${error.message}`);
          } else {
            console.log(`✅ ${funcName}: working`);
          }
        } else {
          const { data, error } = await supabase.rpc(funcName);
          
          if (error) {
            console.log(`❌ ${funcName}: ${error.message}`);
          } else {
            console.log(`✅ ${funcName}: working (returned ${data?.length || 0} items)`);
          }
        }
      } catch (err) {
        console.log(`❌ ${funcName}: ${err.message}`);
      }
    }

    // Проверяем enum типы
    console.log('\n🔍 Checking for player_status enum...');
    
    // Попробуем создать запись с разными статусами
    const testStatuses = ['online', 'afk', 'in_battle', 'in_dungeon'];
    
    for (const status of testStatuses) {
      try {
        const { error } = await supabase
          .from('user_activity')
          .upsert({
            user_id: '00000000-0000-0000-0000-000000000000', // тестовый UUID
            last_seen: new Date().toISOString(),
            status: status,
            location: 'Test',
            last_activity: new Date().toISOString()
          });
          
        if (error) {
          console.log(`❌ Status '${status}': ${error.message}`);
        } else {
          console.log(`✅ Status '${status}': supported`);
        }
      } catch (err) {
        console.log(`❌ Status '${status}': ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkDatabaseFunctions();
