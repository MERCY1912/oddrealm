const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPresenceUpdate() {
  try {
    console.log('🧪 Testing presence update functionality...\n');

    // 1. Проверяем текущее состояние user_activity
    console.log('1️⃣ Checking current user_activity...');
    const { data: beforeData, error: beforeError } = await supabase
      .from('user_activity')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(3);

    if (beforeError) {
      console.log(`❌ Error querying user_activity: ${beforeError.message}`);
      return;
    }

    console.log(`✅ Found ${beforeData?.length || 0} recent activities`);
    if (beforeData && beforeData.length > 0) {
      beforeData.forEach((activity, index) => {
        console.log(`   ${index + 1}. User: ${activity.user_id}`);
        console.log(`      Status: ${activity.status || 'N/A'}`);
        console.log(`      Location: ${activity.location || 'N/A'}`);
        console.log(`      Last seen: ${new Date(activity.last_seen).toLocaleString()}`);
      });
    }

    // 2. Тестируем upsert с правильным onConflict
    console.log('\n2️⃣ Testing upsert with onConflict...');
    
    // Используем фиктивный UUID для тестирования
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_activity')
      .upsert({
        user_id: testUserId,
        last_seen: new Date().toISOString(),
        status: 'online',
        location: 'Test Location',
        last_activity: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (upsertError) {
      console.log(`❌ Upsert failed: ${upsertError.message}`);
      console.log(`   Code: ${upsertError.code}`);
      console.log(`   Details: ${upsertError.details}`);
    } else {
      console.log(`✅ Upsert successful`);
      if (upsertData && upsertData.length > 0) {
        console.log(`   Created/Updated: ${upsertData[0].user_id}`);
        console.log(`   Status: ${upsertData[0].status}`);
        console.log(`   Location: ${upsertData[0].location}`);
      }
    }

    // 3. Тестируем повторный upsert (должен обновить, а не создать новую запись)
    console.log('\n3️⃣ Testing repeated upsert (should update, not create new)...');
    
    const { data: upsertData2, error: upsertError2 } = await supabase
      .from('user_activity')
      .upsert({
        user_id: testUserId,
        last_seen: new Date().toISOString(),
        status: 'in_battle',
        location: 'Arena',
        last_activity: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (upsertError2) {
      console.log(`❌ Second upsert failed: ${upsertError2.message}`);
    } else {
      console.log(`✅ Second upsert successful (should have updated existing record)`);
      if (upsertData2 && upsertData2.length > 0) {
        console.log(`   Updated: ${upsertData2[0].user_id}`);
        console.log(`   New Status: ${upsertData2[0].status}`);
        console.log(`   New Location: ${upsertData2[0].location}`);
      }
    }

    // 4. Проверяем, что записей не стало больше
    console.log('\n4️⃣ Verifying no duplicate records...');
    const { data: afterData, error: afterError } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', testUserId);

    if (afterError) {
      console.log(`❌ Error querying test user: ${afterError.message}`);
    } else {
      console.log(`✅ Test user has ${afterData?.length || 0} records (should be 1)`);
      if (afterData && afterData.length > 1) {
        console.log(`❌ Found duplicate records! This indicates the upsert is not working correctly.`);
      } else {
        console.log(`✅ No duplicates found - upsert is working correctly`);
      }
    }

    // 5. Очищаем тестовые данные
    console.log('\n5️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('user_activity')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.log(`⚠️  Could not clean up test data: ${deleteError.message}`);
    } else {
      console.log(`✅ Test data cleaned up`);
    }

    console.log('\n🎉 Presence update test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPresenceUpdate();
