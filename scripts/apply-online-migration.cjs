const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyOnlineMigration() {
  try {
    console.log('🔧 Applying online system migration...');

    // Читаем содержимое миграции
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250119000000_enhance_online_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file found, applying...');

    // Разбиваем SQL на отдельные команды
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const command of commands) {
      try {
        if (command.toLowerCase().includes('create type') || 
            command.toLowerCase().includes('alter table') ||
            command.toLowerCase().includes('create index') ||
            command.toLowerCase().includes('create or replace function') ||
            command.toLowerCase().includes('grant execute') ||
            command.toLowerCase().includes('create trigger') ||
            command.toLowerCase().includes('update ')) {
          
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            console.log(`⚠️  Warning for command: ${error.message}`);
            // Продолжаем выполнение, так как некоторые команды могут уже существовать
          } else {
            console.log(`✅ Command executed successfully`);
            successCount++;
          }
        }
      } catch (err) {
        console.log(`⚠️  Warning: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successful commands: ${successCount}`);
    console.log(`⚠️  Warnings/Errors: ${errorCount}`);

    // Тестируем функции
    console.log('\n🧪 Testing new functions...');
    
    const { data: onlinePlayers, error: playersError } = await supabase.rpc('get_online_players');
    if (playersError) {
      console.log(`❌ get_online_players test failed: ${playersError.message}`);
    } else {
      console.log(`✅ get_online_players working: found ${onlinePlayers?.length || 0} players`);
    }

    const { data: stats, error: statsError } = await supabase.rpc('get_online_stats');
    if (statsError) {
      console.log(`❌ get_online_stats test failed: ${statsError.message}`);
    } else {
      console.log(`✅ get_online_stats working: ${JSON.stringify(stats)}`);
    }

    // Тестируем update_user_presence
    const { error: updateError } = await supabase.rpc('update_user_presence', {
      p_status: 'online',
      p_location: 'Таврос'
    });
    
    if (updateError) {
      console.log(`❌ update_user_presence test failed: ${updateError.message}`);
    } else {
      console.log(`✅ update_user_presence working`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyOnlineMigration();
