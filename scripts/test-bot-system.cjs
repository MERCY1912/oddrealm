const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBotSystem() {
  try {
    console.log('🤖 Testing Bot System...\n');

    // 1. Проверяем таблицы ботов
    console.log('1️⃣ Checking bot tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['bot_characters', 'bot_messages', 'bot_activity']);

    if (tablesError) {
      console.log(`❌ Error checking tables: ${tablesError.message}`);
    } else {
      console.log(`✅ Found ${tables?.length || 0} bot tables`);
      tables?.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // 2. Проверяем функции ботов
    console.log('\n2️⃣ Checking bot functions...');
    
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['get_active_bots', 'update_bot_presence']);

    if (functionsError) {
      console.log(`❌ Error checking functions: ${functionsError.message}`);
    } else {
      console.log(`✅ Found ${functions?.length || 0} bot functions`);
      functions?.forEach(func => {
        console.log(`   - ${func.routine_name}`);
      });
    }

    // 3. Тестируем функцию get_active_bots
    console.log('\n3️⃣ Testing get_active_bots function...');
    
    const { data: bots, error: botsError } = await supabase.rpc('get_active_bots');
    
    if (botsError) {
      console.log(`❌ get_active_bots failed: ${botsError.message}`);
    } else {
      console.log(`✅ get_active_bots works! Found ${bots?.length || 0} bots`);
      bots?.forEach(bot => {
        console.log(`   - ${bot.name} (@${bot.username}) - ${bot.character_class} Lv.${bot.level}`);
        console.log(`     Status: ${bot.status}, Location: ${bot.location}`);
        console.log(`     Response chance: ${bot.response_chance}%`);
      });
    }

    // 4. Проверяем ботов в user_activity
    console.log('\n4️⃣ Checking bots in user_activity...');
    
    const { data: botActivity, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .like('user_id', 'bot_%');

    if (activityError) {
      console.log(`❌ Error checking bot activity: ${activityError.message}`);
    } else {
      console.log(`✅ Found ${botActivity?.length || 0} bot entries in user_activity`);
      botActivity?.forEach(activity => {
        console.log(`   - ${activity.user_id}: ${activity.status} in ${activity.location}`);
      });
    }

    // 5. Тестируем функцию update_bot_presence
    console.log('\n5️⃣ Testing update_bot_presence function...');
    
    if (bots && bots.length > 0) {
      const testBot = bots[0];
      const { error: updateError } = await supabase.rpc('update_bot_presence', {
        p_bot_id: testBot.id,
        p_status: 'afk',
        p_location: 'Гильдия'
      });

      if (updateError) {
        console.log(`❌ update_bot_presence failed: ${updateError.message}`);
      } else {
        console.log(`✅ update_bot_presence works! Updated ${testBot.name}`);
        
        // Проверяем обновление
        const { data: updatedBot } = await supabase
          .from('bot_characters')
          .select('status, location')
          .eq('id', testBot.id)
          .single();
          
        if (updatedBot) {
          console.log(`   New status: ${updatedBot.status}, Location: ${updatedBot.location}`);
        }
      }
    } else {
      console.log('⚠️  No bots found to test update function');
    }

    // 6. Проверяем Mistral API ключ
    console.log('\n6️⃣ Checking Mistral API configuration...');
    
    const mistralKey = process.env.VITE_MISTRAL_API_KEY;
    if (mistralKey && mistralKey.length > 0) {
      console.log('✅ Mistral API key is configured');
      console.log(`   Key starts with: ${mistralKey.substring(0, 8)}...`);
    } else {
      console.log('⚠️  Mistral API key not found');
      console.log('   Bots will use fallback responses');
      console.log('   Add VITE_MISTRAL_API_KEY to env.local for AI responses');
    }

    console.log('\n🎉 Bot System test completed!');
    
    // Итоговая оценка
    const hasTables = tables && tables.length >= 3;
    const hasFunctions = functions && functions.length >= 2;
    const hasBots = bots && bots.length > 0;
    const hasActivity = botActivity && botActivity.length > 0;
    const hasMistral = !!mistralKey;

    console.log('\n📊 System Status:');
    console.log(`   Tables: ${hasTables ? '✅' : '❌'}`);
    console.log(`   Functions: ${hasFunctions ? '✅' : '❌'}`);
    console.log(`   Bots: ${hasBots ? '✅' : '❌'}`);
    console.log(`   Activity: ${hasActivity ? '✅' : '❌'}`);
    console.log(`   Mistral AI: ${hasMistral ? '✅' : '⚠️'}`);

    if (hasTables && hasFunctions && hasBots) {
      console.log('\n✅ Bot system is ready to use!');
      console.log('🚀 You can now start the application and see bots in action');
    } else {
      console.log('\n❌ Bot system needs setup');
      console.log('📋 Please run the SQL migration in Supabase Dashboard');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBotSystem();
