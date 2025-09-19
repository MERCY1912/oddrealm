import { supabase } from './integrations/supabase/client';

// Функция для тестирования соединения с Supabase
async function testSupabaseConnection() {
  console.log('Тестирование соединения с Supabase...');
  
  try {
    // Проверяем соединение
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Ошибка соединения с базой данных:', error);
      return false;
    }
    
    console.log('✅ Соединение с базой данных установлено успешно');
    
    // Проверяем наличие таблицы user_activity
    const { data: activityData, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .limit(1);
      
    if (activityError) {
      console.error('Ошибка при проверке таблицы user_activity:', activityError);
      return false;
    }
    
    console.log('✅ Таблица user_activity существует');
    
    // Проверяем наличие колонок в таблице user_activity
    const { data: columnsData, error: columnsError } = await supabase
      .from('user_activity')
      .select('*')
      .limit(1);
      
    if (columnsError) {
      console.error('Ошибка при проверке колонок таблицы user_activity:', columnsError);
      return false;
    }
    
    if (columnsData && columnsData.length > 0) {
      const columns = Object.keys(columnsData[0]);
      console.log('Колонки в таблице user_activity:', columns);
      
      // Проверяем наличие необходимых колонок
      const requiredColumns = ['user_id', 'last_seen'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('Отсутствуют необходимые колонки:', missingColumns);
        return false;
      }
      
      // Проверяем наличие колонок status и location
      const optionalColumns = ['status', 'location'];
      const missingOptionalColumns = optionalColumns.filter(col => !columns.includes(col));
      
      if (missingOptionalColumns.length > 0) {
        console.warn('Отсутствуют опциональные колонки:', missingOptionalColumns);
        console.log('Это может означать, что миграция не была применена полностью');
      }
    }
    
    // Проверяем наличие RPC-функций
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_presence');
      
      if (rpcError) {
        console.warn('⚠️ RPC-функция update_user_presence не найдена или недоступна:', rpcError.message);
      } else {
        console.log('✅ RPC-функция update_user_presence доступна');
      }
    } catch (e) {
      console.warn('⚠️ Не удалось проверить RPC-функцию update_user_presence:', e.message);
    }
    
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_online_players');
      
      if (rpcError) {
        console.warn('⚠️ RPC-функция get_online_players не найдена или недоступна:', rpcError.message);
      } else {
        console.log('✅ RPC-функция get_online_players доступна');
      }
    } catch (e) {
      console.warn('⚠️ Не удалось проверить RPC-функцию get_online_players:', e.message);
    }
    
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_online_stats');
      
      if (rpcError) {
        console.warn('⚠️ RPC-функция get_online_stats не найдена или недоступна:', rpcError.message);
      } else {
        console.log('✅ RPC-функция get_online_stats доступна');
      }
    } catch (e) {
      console.warn('⚠️ Не удалось проверить RPC-функцию get_online_stats:', e.message);
    }
    
    console.log('✅ Тестирование соединения завершено');
    return true;
    
  } catch (error) {
    console.error('Ошибка при тестировании соединения:', error);
    return false;
  }
}

// Запускаем тест
testSupabaseConnection().then(success => {
  if (success) {
    console.log('Все тесты пройдены успешно!');
  } else {
    console.error('Некоторые тесты не пройдены. Проверьте настройки базы данных.');
  }
});