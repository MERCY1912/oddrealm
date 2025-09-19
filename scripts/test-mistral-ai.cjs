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

async function testMistralAI() {
  console.log('🤖 Тестируем Mistral AI для ботов...\n');

  try {
    const apiKey = process.env.VITE_MISTRAL_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Mistral API ключ не найден в .env.local');
      console.log('Добавьте: VITE_MISTRAL_API_KEY=ваш_ключ');
      return;
    }

    console.log(`✅ API ключ найден: ${apiKey.substring(0, 20)}...`);

    // Тестируем API напрямую
    const testResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-medium-latest',
        messages: [
          {
            role: 'system',
            content: 'Ты игрок в онлайн-игре. Отвечай кратко и дружелюбно на русском языке.'
          },
          {
            role: 'user',
            content: 'Привет! Как дела?'
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ Ошибка API: ${testResponse.status} - ${errorText}`);
      return;
    }

    const data = await testResponse.json();
    const response = data.choices[0]?.message?.content?.trim();
    
    if (response) {
      console.log(`✅ Mistral AI работает!`);
      console.log(`📝 Ответ: "${response}"`);
    } else {
      console.error('❌ Пустой ответ от Mistral AI');
    }

    // Проверяем ботов в базе данных
    console.log('\n🔍 Проверяем ботов в базе данных...');
    const { data: bots, error } = await supabase
      .from('bot_characters')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Ошибка получения ботов:', error);
      return;
    }

    console.log(`✅ Найдено ${bots.length} активных ботов:`);
    bots.forEach((bot, index) => {
      console.log(`   ${index + 1}. ${bot.name} (@${bot.username}) - ${bot.personality}`);
    });

  } catch (error) {
    console.error('❌ Ошибка теста:', error);
  }
}

testMistralAI();
