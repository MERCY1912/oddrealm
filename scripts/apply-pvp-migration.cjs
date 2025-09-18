const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  console.error('\n📝 Please add SUPABASE_SERVICE_KEY to your env.local file');
  process.exit(1);
}

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '../supabase/migrations/add_pvp_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Применяем миграцию
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
    } else {
      console.log('Migration applied successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();



