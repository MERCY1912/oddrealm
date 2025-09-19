const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

// Настройка Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не найдены переменные окружения Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBotAccess() {
  console.log('🔍 Диагностика доступа к ботам...\n');

  try {
    // 1. Проверяем базовое подключение
    console.log('1️⃣ Проверяем подключение к Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

    // 2. Проверяем аутентификацию
    console.log('\n2️⃣ Проверяем аутентификацию...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log(`   ⚠️ Ошибка аутентификации: ${authError.message}`);
    } else if (user) {
      console.log(`   ✅ Пользователь аутентифицирован: ${user.id}`);
    } else {
      console.log('   ⚠️ Пользователь не аутентифицирован (анонимный доступ)');
    }

    // 3. Пробуем получить всех ботов (без фильтра is_active)
    console.log('\n3️⃣ Получаем всех ботов (без фильтра)...');
    const { data: allBots, error: allBotsError } = await supabase
      .from('bot_characters')
      .select('*');

    if (allBotsError) {
      console.error('   ❌ Ошибка получения всех ботов:', allBotsError);
    } else {
      console.log(`   ✅ Найдено ботов: ${allBots?.length || 0}`);
      if (allBots && allBots.length > 0) {
        allBots.forEach((bot, index) => {
          console.log(`      ${index + 1}. ${bot.name} (@${bot.username}) - active: ${bot.is_active}`);
        });
      }
    }

    // 4. Пробуем получить только активных ботов
    console.log('\n4️⃣ Получаем только активных ботов...');
    const { data: activeBots, error: activeBotsError } = await supabase
      .from('bot_characters')
      .select('*')
      .eq('is_active', true);

    if (activeBotsError) {
      console.error('   ❌ Ошибка получения активных ботов:', activeBotsError);
    } else {
      console.log(`   ✅ Найдено активных ботов: ${activeBots?.length || 0}`);
      if (activeBots && activeBots.length > 0) {
        activeBots.forEach((bot, index) => {
          console.log(`      ${index + 1}. ${bot.name} (@${bot.username})`);
        });
      }
    }

    // 5. Проверяем RLS статус таблицы
    console.log('\n5️⃣ Проверяем RLS статус таблицы bot_characters...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'bot_characters' })
      .catch(() => {
        console.log('   ⚠️ RPC функция get_table_rls_status не найдена (это нормально)');
        return { data: null, error: null };
      });

    // 6. Пробуем простой SELECT запрос
    console.log('\n6️⃣ Пробуем простой SELECT запрос...');
    const { data: simpleSelect, error: simpleError } = await supabase
      .from('bot_characters')
      .select('id, name, username')
      .limit(1);

    if (simpleError) {
      console.error('   ❌ Ошибка простого SELECT:', simpleError);
    } else {
      console.log(`   ✅ Простой SELECT работает. Найдено записей: ${simpleSelect?.length || 0}`);
    }

    // 7. Проверяем таблицу bot_presence
    console.log('\n7️⃣ Проверяем таблицу bot_presence...');
    const { data: presenceData, error: presenceError } = await supabase
      .from('bot_presence')
      .select('*')
      .limit(5);

    if (presenceError) {
      console.error('   ❌ Ошибка получения bot_presence:', presenceError);
    } else {
      console.log(`   ✅ bot_presence доступна. Найдено записей: ${presenceData?.length || 0}`);
    }

    console.log('\n🎯 Диагностика завершена!');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

debugBotAccess();
