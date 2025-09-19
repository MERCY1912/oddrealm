const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLongMessage() {
  console.log('🧪 Тестируем отправку длинного сообщения...');
  
  // Создаем очень длинное сообщение (более 1000 символов)
  const longMessage = `*поглаживает бороду, в глазах мерцают руны* Ах, подземелья... 🏰✨ 

*Глубины Утопленного Храма* дают лучший лут для магов, но *Пещеры Кристаллов* — настоящая проверка на выносливость! 

Главное — не забывать про:
1. 🔮 Магические зелья восстановления маны
2. 🛡️ Защитные амулеты от проклятий
3. ⚔️ Оружие с бонусом к магическому урону
4. 🧙‍♂️ Правильное распределение статов

В *Глубинах Утопленного Храма* особенно опасны:
- Древние Личи с их некромантией
- Призрачные Стражники с иммунитетом к физическому урону
- Проклятые Саркофаги, которые могут воскрешать врагов

А в *Пещерах Кристаллов* нужно быть готовым к:
- Кристальным Големам с отражением магии
- Магическим Ловушкам, которые поглощают ману
- Искривленному времени, которое замедляет заклинания

Совет от старого волшебника: всегда носите с собой кристалл телепортации на случай экстренного отступления! 💎✨`;

  console.log(`📏 Длина сообщения: ${longMessage.length} символов`);
  
  try {
    // Получаем первого активного бота
    const { data: bots, error: botError } = await supabase
      .from('bot_characters')
      .select('id, username')
      .eq('is_active', true)
      .limit(1);

    if (botError) {
      console.error('❌ Ошибка получения ботов:', botError);
      return;
    }

    if (!bots || bots.length === 0) {
      console.error('❌ Активные боты не найдены');
      return;
    }

    const bot = bots[0];
    console.log(`🤖 Используем бота: ${bot.username} (${bot.id})`);

    // Отправляем длинное сообщение
    const { data, error } = await supabase
      .from('bot_chat_messages')
      .insert([{
        bot_id: bot.id,
        player_name: bot.username,
        message: longMessage,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
    } else {
      console.log('✅ Сообщение успешно отправлено!');
      console.log('📝 Данные:', data);
      
      // Проверяем, что сообщение сохранилось полностью
      const { data: savedMessage, error: fetchError } = await supabase
        .from('bot_chat_messages')
        .select('message')
        .eq('id', data[0].id)
        .single();

      if (fetchError) {
        console.error('❌ Ошибка получения сохраненного сообщения:', fetchError);
      } else {
        console.log('📖 Сохраненное сообщение:');
        console.log(savedMessage.message);
        console.log(`📏 Длина сохраненного сообщения: ${savedMessage.message.length} символов`);
        
        if (savedMessage.message.length === longMessage.length) {
          console.log('✅ Сообщение сохранено полностью!');
        } else {
          console.log('⚠️ Сообщение было обрезано при сохранении');
        }
      }
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

testLongMessage();
