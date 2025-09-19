const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRPCPerformance() {
  try {
    console.log('🚀 Testing RPC Functions Performance...\n');

    // 1. Тестируем новую быструю функцию get_online_players_fast
    console.log('1️⃣ Testing get_online_players_fast...');
    const startTime1 = Date.now();
    
    const { data: players, error: playersError } = await supabase.rpc('get_online_players_fast');
    
    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;
    
    if (playersError) {
      console.log(`❌ get_online_players_fast failed: ${playersError.message}`);
    } else {
      console.log(`✅ get_online_players_fast successful in ${duration1}ms`);
      console.log(`   Found ${players?.length || 0} players`);
      if (players && players.length > 0) {
        players.slice(0, 3).forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.username} (${player.status}) in ${player.location}`);
        });
      }
    }

    // 2. Тестируем новую быструю функцию get_online_stats_fast
    console.log('\n2️⃣ Testing get_online_stats_fast...');
    const startTime2 = Date.now();
    
    const { data: stats, error: statsError } = await supabase.rpc('get_online_stats_fast');
    
    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;
    
    if (statsError) {
      console.log(`❌ get_online_stats_fast failed: ${statsError.message}`);
    } else {
      console.log(`✅ get_online_stats_fast successful in ${duration2}ms`);
      if (stats && stats.length > 0) {
        const stat = stats[0];
        console.log(`   Total: ${stat.total_online}, Online: ${stat.online_count}, AFK: ${stat.afk_count}`);
      }
    }

    // 3. Тестируем функцию update_user_presence
    console.log('\n3️⃣ Testing update_user_presence...');
    const startTime3 = Date.now();
    
    const { error: updateError } = await supabase.rpc('update_user_presence', {
      p_status: 'online',
      p_location: 'Таврос'
    });
    
    const endTime3 = Date.now();
    const duration3 = endTime3 - startTime3;
    
    if (updateError) {
      console.log(`❌ update_user_presence failed: ${updateError.message}`);
    } else {
      console.log(`✅ update_user_presence successful in ${duration3}ms`);
    }

    // 4. Сравниваем с старыми функциями
    console.log('\n4️⃣ Comparing with old functions...');
    
    // Старая функция get_online_players
    const startTime4 = Date.now();
    const { data: oldPlayers, error: oldPlayersError } = await supabase.rpc('get_online_players');
    const endTime4 = Date.now();
    const duration4 = endTime4 - startTime4;
    
    if (oldPlayersError) {
      console.log(`❌ Old get_online_players failed: ${oldPlayersError.message}`);
    } else {
      console.log(`📊 Old get_online_players: ${duration4}ms`);
    }

    // Старая функция get_online_stats
    const startTime5 = Date.now();
    const { data: oldStats, error: oldStatsError } = await supabase.rpc('get_online_stats');
    const endTime5 = Date.now();
    const duration5 = endTime5 - startTime5;
    
    if (oldStatsError) {
      console.log(`❌ Old get_online_stats failed: ${oldStatsError.message}`);
    } else {
      console.log(`📊 Old get_online_stats: ${duration5}ms`);
    }

    // 5. Анализ производительности
    console.log('\n📊 Performance Comparison:');
    console.log(`   New get_online_players_fast: ${duration1}ms`);
    console.log(`   Old get_online_players: ${duration4}ms`);
    console.log(`   New get_online_stats_fast: ${duration2}ms`);
    console.log(`   Old get_online_stats: ${duration5}ms`);
    console.log(`   update_user_presence: ${duration3}ms`);

    const improvement1 = duration4 > 0 ? ((duration4 - duration1) / duration4 * 100).toFixed(1) : 0;
    const improvement2 = duration5 > 0 ? ((duration5 - duration2) / duration5 * 100).toFixed(1) : 0;

    console.log('\n🚀 Performance Improvements:');
    console.log(`   Players query: ${improvement1}% faster`);
    console.log(`   Stats query: ${improvement2}% faster`);

    // 6. Тестируем множественные запросы
    console.log('\n6️⃣ Testing multiple rapid requests...');
    const rapidRequests = [];
    
    for (let i = 0; i < 5; i++) {
      rapidRequests.push(
        supabase.rpc('get_online_players_fast').then(({ data, error }) => ({
          success: !error,
          duration: Date.now(),
          error: error?.message
        }))
      );
    }
    
    const rapidResults = await Promise.all(rapidRequests);
    const successful = rapidResults.filter(r => r.success).length;
    
    console.log(`✅ Rapid requests: ${successful}/5 successful`);
    
    if (successful === 5) {
      console.log('✅ All rapid requests successful - RPC functions are stable');
    } else {
      console.log('⚠️  Some rapid requests failed - may need optimization');
    }

    console.log('\n🎉 RPC Performance test completed!');
    
    if (duration1 < 500 && duration2 < 200) {
      console.log('✅ Excellent performance - RPC functions are very fast!');
    } else if (duration1 < 1000 && duration2 < 500) {
      console.log('✅ Good performance - RPC functions are fast');
    } else {
      console.log('⚠️  Performance could be better - consider optimization');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRPCPerformance();
