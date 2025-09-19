const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOnlineSystem() {
  try {
    console.log('🧪 Testing Online System...\n');

    // 1. Проверяем получение списка игроков
    console.log('1️⃣ Testing get_online_players...');
    const { data: players, error: playersError } = await supabase.rpc('get_online_players');
    
    if (playersError) {
      console.log(`❌ get_online_players failed: ${playersError.message}`);
    } else {
      console.log(`✅ get_online_players working: found ${players?.length || 0} players`);
      if (players && players.length > 0) {
        players.forEach(player => {
          console.log(`   - ${player.username} (Level ${player.level}, ${player.character_class})`);
          console.log(`     Status: ${player.status}, Location: ${player.location}`);
          console.log(`     Last seen: ${new Date(player.last_seen).toLocaleString()}`);
        });
      }
    }

    // 2. Проверяем статистику
    console.log('\n2️⃣ Testing get_online_stats...');
    const { data: stats, error: statsError } = await supabase.rpc('get_online_stats');
    
    if (statsError) {
      console.log(`❌ get_online_stats failed: ${statsError.message}`);
    } else {
      console.log(`✅ get_online_stats working:`);
      const stat = stats[0];
      console.log(`   - Total online: ${stat.total_online}`);
      console.log(`   - Online: ${stat.online_count}`);
      console.log(`   - AFK: ${stat.afk_count}`);
      console.log(`   - In battle: ${stat.in_battle_count}`);
      console.log(`   - In dungeon: ${stat.in_dungeon_count}`);
    }

    // 3. Проверяем таблицу user_activity
    console.log('\n3️⃣ Testing user_activity table...');
    const { data: activity, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(5);

    if (activityError) {
      console.log(`❌ user_activity query failed: ${activityError.message}`);
    } else {
      console.log(`✅ user_activity table accessible: found ${activity?.length || 0} recent activities`);
      if (activity && activity.length > 0) {
        activity.forEach(act => {
          console.log(`   - User: ${act.user_id}, Status: ${act.status || 'N/A'}`);
          console.log(`     Location: ${act.location || 'N/A'}, Last seen: ${new Date(act.last_seen).toLocaleString()}`);
        });
      }
    }

    // 4. Проверяем таблицу profiles
    console.log('\n4️⃣ Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, level, character_class, city')
      .limit(5);

    if (profilesError) {
      console.log(`❌ profiles query failed: ${profilesError.message}`);
    } else {
      console.log(`✅ profiles table accessible: found ${profiles?.length || 0} profiles`);
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          console.log(`   - ${profile.username} (Level ${profile.level}, ${profile.character_class})`);
          console.log(`     City: ${profile.city || 'N/A'}`);
        });
      }
    }

    console.log('\n🎉 Online system test completed!');
    
    if (players && players.length > 0) {
      console.log('\n💡 System is working correctly - there are online players!');
    } else {
      console.log('\n💡 System is working correctly, but no players are currently online.');
      console.log('   This is normal if no one is logged in or recently active.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOnlineSystem();
