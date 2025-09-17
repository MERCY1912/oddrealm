const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://soblxtzltnziynrvasaw.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYmx4dHpsdG56aXlucnZhc2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUxODM3MywiZXhwIjoyMDczMDk0MzczfQ.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q";

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



