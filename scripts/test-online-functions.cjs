const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Online Players Functions...\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testOnlineFunctions() {
  try {
    // Тест 1: Проверка таблицы user_activity
    console.log('📊 Test 1: user_activity Table Check');
    const { data: activityData, error: activityError } = await serviceClient
      .from('user_activity')
      .select('*')
      .limit(1);
    
    if (activityError) {
      console.log('   ❌ user_activity table access failed:', activityError.message);
    } else {
      console.log('   ✅ user_activity table access successful');
      if (activityData && activityData.length > 0) {
        const columns = Object.keys(activityData[0]);
        console.log('   📋 Columns:', columns.join(', '));
        
        // Проверяем наличие необходимых колонок
        const requiredColumns = ['user_id', 'last_seen'];
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('   ❌ Missing required columns:', missingColumns.join(', '));
        } else {
          console.log('   ✅ All required columns present');
        }
        
        // Проверяем наличие опциональных колонок
        const optionalColumns = ['status', 'location'];
        const missingOptionalColumns = optionalColumns.filter(col => !columns.includes(col));
        
        if (missingOptionalColumns.length > 0) {
          console.log('   ⚠️ Missing optional columns:', missingOptionalColumns.join(', '));
          console.log('   📝 This might indicate that the migration was not fully applied');
        } else {
          console.log('   ✅ All optional columns present');
        }
      } else {
        console.log('   📝 Table is empty');
      }
    }

    // Тест 2: Проверка RPC-функции update_user_presence
    console.log('\n⚙️ Test 2: update_user_presence RPC Function');
    try {
      const { data: updateData, error: updateError } = await serviceClient
        .rpc('update_user_presence', {
          p_status: 'online',
          p_location: 'Таврос'
        });
      
      if (updateError) {
        console.log('   ❌ update_user_presence RPC failed:', updateError.message);
      } else {
        console.log('   ✅ update_user_presence RPC successful');
      }
    } catch (e) {
      console.log('   ❌ update_user_presence RPC error:', e.message);
    }

    // Тест 3: Проверка RPC-функции get_online_players
    console.log('\n⚙️ Test 3: get_online_players RPC Function');
    try {
      const { data: playersData, error: playersError } = await serviceClient
        .rpc('get_online_players');
      
      if (playersError) {
        console.log('   ❌ get_online_players RPC failed:', playersError.message);
      } else {
        console.log('   ✅ get_online_players RPC successful');
        console.log(`   👥 Found ${playersData ? playersData.length : 0} online players`);
      }
    } catch (e) {
      console.log('   ❌ get_online_players RPC error:', e.message);
    }

    // Тест 4: Проверка RPC-функции get_online_stats
    console.log('\n⚙️ Test 4: get_online_stats RPC Function');
    try {
      const { data: statsData, error: statsError } = await serviceClient
        .rpc('get_online_stats');
      
      if (statsError) {
        console.log('   ❌ get_online_stats RPC failed:', statsError.message);
      } else {
        console.log('   ✅ get_online_stats RPC successful');
        if (statsData && statsData.length > 0) {
          const stats = statsData[0];
          console.log(`   📊 Stats: ${stats.total_online || 0} total, ${stats.online_count || 0} online, ${stats.afk_count || 0} AFK`);
        }
      }
    } catch (e) {
      console.log('   ❌ get_online_stats RPC error:', e.message);
    }

    // Тест 5: Прямой запрос к user_activity
    console.log('\n🔍 Test 5: Direct user_activity Query');
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentActivity, error: recentError } = await serviceClient
      .from('user_activity')
      .select('user_id, last_seen')
      .gt('last_seen', tenMinutesAgo);
    
    if (recentError) {
      console.log('   ❌ Direct query failed:', recentError.message);
    } else {
      console.log('   ✅ Direct query successful');
      console.log(`   👥 Found ${recentActivity ? recentActivity.length : 0} active users in the last 10 minutes`);
    }

    console.log('\n🎉 Online functions test completed!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

testOnlineFunctions();