const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPerformance() {
  try {
    console.log('🚀 Testing Supabase performance...\n');

    // 1. Тестируем RPC функцию get_online_players
    console.log('1️⃣ Testing get_online_players RPC...');
    const startTime1 = Date.now();
    
    const { data: players, error: playersError } = await supabase.rpc('get_online_players');
    
    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;
    
    if (playersError) {
      console.log(`❌ RPC failed: ${playersError.message}`);
    } else {
      console.log(`✅ RPC successful in ${duration1}ms`);
      console.log(`   Found ${players?.length || 0} players`);
    }

    // 2. Тестируем RPC функцию get_online_stats
    console.log('\n2️⃣ Testing get_online_stats RPC...');
    const startTime2 = Date.now();
    
    const { data: stats, error: statsError } = await supabase.rpc('get_online_stats');
    
    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;
    
    if (statsError) {
      console.log(`❌ Stats RPC failed: ${statsError.message}`);
    } else {
      console.log(`✅ Stats RPC successful in ${duration2}ms`);
      if (stats && stats.length > 0) {
        const stat = stats[0];
        console.log(`   Total: ${stat.total_online}, Online: ${stat.online_count}`);
      }
    }

    // 3. Тестируем прямой запрос к user_activity
    console.log('\n3️⃣ Testing direct user_activity query...');
    const startTime3 = Date.now();
    
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: activity, error: activityError } = await supabase
      .from('user_activity')
      .select('user_id, last_seen, status, location')
      .gt('last_seen', tenMinutesAgo)
      .order('last_seen', { ascending: false });
    
    const endTime3 = Date.now();
    const duration3 = endTime3 - startTime3;
    
    if (activityError) {
      console.log(`❌ Direct query failed: ${activityError.message}`);
    } else {
      console.log(`✅ Direct query successful in ${duration3}ms`);
      console.log(`   Found ${activity?.length || 0} activities`);
    }

    // 4. Тестируем запрос к profiles
    console.log('\n4️⃣ Testing profiles query...');
    const startTime4 = Date.now();
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, level, character_class')
      .limit(10);
    
    const endTime4 = Date.now();
    const duration4 = endTime4 - startTime4;
    
    if (profilesError) {
      console.log(`❌ Profiles query failed: ${profilesError.message}`);
    } else {
      console.log(`✅ Profiles query successful in ${duration4}ms`);
      console.log(`   Found ${profiles?.length || 0} profiles`);
    }

    // 5. Анализ производительности
    console.log('\n📊 Performance Analysis:');
    console.log(`   RPC get_online_players: ${duration1}ms`);
    console.log(`   RPC get_online_stats: ${duration2}ms`);
    console.log(`   Direct user_activity: ${duration3}ms`);
    console.log(`   Profiles query: ${duration4}ms`);

    const maxDuration = Math.max(duration1, duration2, duration3, duration4);
    
    if (maxDuration < 1000) {
      console.log('✅ Excellent performance - all queries under 1 second');
    } else if (maxDuration < 3000) {
      console.log('⚠️  Good performance - queries under 3 seconds');
    } else if (maxDuration < 10000) {
      console.log('⚠️  Slow performance - queries under 10 seconds');
    } else {
      console.log('❌ Poor performance - some queries over 10 seconds');
    }

    // 6. Рекомендации
    console.log('\n💡 Recommendations:');
    if (duration1 < duration3) {
      console.log('✅ Use RPC functions - they are faster than direct queries');
    } else {
      console.log('⚠️  Direct queries are faster - consider optimizing RPC functions');
    }

    if (maxDuration > 5000) {
      console.log('⚠️  Consider implementing caching to improve user experience');
    }

    console.log('\n🎉 Performance test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPerformance();
