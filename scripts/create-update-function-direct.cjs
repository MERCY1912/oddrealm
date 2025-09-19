const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUpdateFunction() {
  try {
    console.log('🔧 Creating update_user_presence function...');

    // SQL для создания функции update_user_presence
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.update_user_presence(
        p_status text DEFAULT 'online',
        p_location text DEFAULT 'Таврос'
      )
      RETURNS void
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        INSERT INTO public.user_activity (user_id, last_seen, status, location, last_activity)
        VALUES (auth.uid(), now(), p_status::text, p_location, now())
        ON CONFLICT (user_id)
        DO UPDATE SET 
          last_seen = now(),
          status = p_status::text,
          location = p_location,
          last_activity = now();
      $$;
    `;

    // Выполняем SQL через прямой запрос к базе данных
    console.log('📝 Executing SQL to create function...');
    
    // К сожалению, Supabase не позволяет выполнять произвольный SQL через клиент
    // Попробуем альтернативный подход - проверим, можем ли мы создать функцию через RPC
    
    console.log('⚠️  Cannot create function via client. Function needs to be created manually in Supabase dashboard.');
    console.log('📋 SQL to execute in Supabase SQL Editor:');
    console.log('─'.repeat(80));
    console.log(createFunctionSQL);
    console.log('─'.repeat(80));
    
    // Даем права на выполнение функции
    const grantSQL = `
      GRANT EXECUTE ON FUNCTION public.update_user_presence(text, text) TO authenticated;
    `;
    
    console.log('📋 Grant permissions SQL:');
    console.log('─'.repeat(80));
    console.log(grantSQL);
    console.log('─'.repeat(80));
    
    console.log('\n💡 Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute the CREATE FUNCTION SQL above');
    console.log('4. Execute the GRANT SQL above');
    console.log('5. Test the function');

  } catch (error) {
    console.error('❌ Function creation failed:', error);
  }
}

createUpdateFunction();
