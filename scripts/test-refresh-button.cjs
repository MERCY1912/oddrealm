const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRefreshButton() {
  try {
    console.log('🧪 Testing refresh button functionality...\n');

    // 1. Тестируем функцию get_online_players
    console.log('1️⃣ Testing get_online_players function...');
    const startTime = Date.now();
    
    const { data: players, error: playersError } = await supabase.rpc('get_online_players');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (playersError) {
      console.log(`❌ get_online_players failed: ${playersError.message}`);
      return;
    } else {
      console.log(`✅ get_online_players successful in ${duration}ms`);
      console.log(`   Found ${players?.length || 0} players`);
      
      if (players && players.length > 0) {
        players.slice(0, 3).forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.username} (${player.status})`);
        });
        if (players.length > 3) {
          console.log(`   ... and ${players.length - 3} more`);
        }
      }
    }

    // 2. Тестируем функцию get_online_stats
    console.log('\n2️⃣ Testing get_online_stats function...');
    const statsStartTime = Date.now();
    
    const { data: stats, error: statsError } = await supabase.rpc('get_online_stats');
    
    const statsEndTime = Date.now();
    const statsDuration = statsEndTime - statsStartTime;
    
    if (statsError) {
      console.log(`❌ get_online_stats failed: ${statsError.message}`);
    } else {
      console.log(`✅ get_online_stats successful in ${statsDuration}ms`);
      const stat = stats[0];
      console.log(`   Total: ${stat.total_online}, Online: ${stat.online_count}, AFK: ${stat.afk_count}`);
    }

    // 3. Проверяем общую производительность
    console.log('\n3️⃣ Performance check...');
    if (duration > 5000) {
      console.log(`⚠️  Slow response: ${duration}ms (should be < 5000ms)`);
    } else {
      console.log(`✅ Good response time: ${duration}ms`);
    }

    // 4. Тестируем несколько запросов подряд (как при частом обновлении)
    console.log('\n4️⃣ Testing multiple rapid requests...');
    const rapidRequests = [];
    
    for (let i = 0; i < 3; i++) {
      rapidRequests.push(
        supabase.rpc('get_online_players').then(({ data, error }) => ({
          success: !error,
          duration: Date.now(),
          error: error?.message
        }))
      );
    }
    
    const rapidResults = await Promise.all(rapidRequests);
    const successful = rapidResults.filter(r => r.success).length;
    
    console.log(`✅ Rapid requests: ${successful}/3 successful`);
    
    if (successful < 3) {
      console.log('❌ Some rapid requests failed - this might cause infinite loading');
    } else {
      console.log('✅ All rapid requests successful - refresh button should work');
    }

    console.log('\n🎉 Refresh button test completed!');
    
    if (duration < 5000 && successful === 3) {
      console.log('✅ Refresh button should work properly');
    } else {
      console.log('⚠️  There might be issues with the refresh button');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRefreshButton();
