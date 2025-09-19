const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

// Настройка Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не найдены переменные окружения Supabase');
  console.log('Убедитесь, что файл .env.local содержит:');
  console.log('VITE_SUPABASE_URL=...');
  console.log('SUPABASE_SERVICE_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBotChat() {
  console.log('🤖 Тестируем отправку сообщения ботом...\n');

  try {
    // 1. Получаем активных ботов
    console.log('1️⃣ Получаем активных ботов...');
    const { data: bots, error: botsError } = await supabase
      .from('bot_characters')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (botsError) {
      console.error('❌ Ошибка получения ботов:', botsError);
      return;
    }

    if (!bots || bots.length === 0) {
      console.error('❌ Активные боты не найдены');
      return;
    }

    const bot = bots[0];
    console.log(`✅ Найден бот: ${bot.name} (@${bot.username})`);

    // 2. Отправляем тестовое сообщение от бота
    console.log('\n2️⃣ Отправляем тестовое сообщение от бота...');
    const testMessage = `Привет! Я ${bot.name}, тестовое сообщение от бота. Как дела?`;
    
    const { data: messageData, error: messageError } = await supabase
      .from('bot_chat_messages')
      .insert([{
        bot_id: bot.id,
        player_name: bot.username,
        message: testMessage,
        created_at: new Date().toISOString()
      }])
      .select();

    if (messageError) {
      console.error('❌ Ошибка отправки сообщения бота:', messageError);
      return;
    }

    console.log('✅ Сообщение отправлено успешно!');
    console.log(`   Сообщение: "${testMessage}"`);
    console.log(`   ID: ${messageData[0].id}`);

    // 3. Проверяем, что сообщение появилось в представлении all_chat_messages
    console.log('\n3️⃣ Проверяем сообщение в all_chat_messages...');
    const { data: allMessages, error: allMessagesError } = await supabase
      .from('all_chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allMessagesError) {
      console.error('❌ Ошибка получения сообщений:', allMessagesError);
      return;
    }

    console.log(`✅ Получено ${allMessages.length} последних сообщений:`);
    allMessages.forEach((msg, index) => {
      const isBot = msg.is_bot_message;
      console.log(`   ${index + 1}. ${isBot ? '🤖' : '👤'} ${msg.player_name}: "${msg.message}"`);
    });

    // 4. Проверяем политики доступа
    console.log('\n4️⃣ Проверяем политики доступа...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'bot_chat_messages');

    if (policiesError) {
      console.log('⚠️ Не удалось проверить политики (это нормально)');
    } else {
      console.log(`✅ Найдено ${policies.length} политик для bot_chat_messages`);
    }

    console.log('\n🎉 Тест завершен успешно!');
    console.log('\n📋 Что проверить в игре:');
    console.log('1. Откройте http://localhost:8080');
    console.log('2. Перейдите в чат');
    console.log('3. Должно появиться сообщение от бота');
    console.log('4. Напишите сообщение и подождите ответа бота');

  } catch (error) {
    console.error('❌ Ошибка теста:', error);
  }
}

testBotChat();
