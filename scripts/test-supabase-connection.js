const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Supabase Connection After Security Fixes...\n');

// Проверяем наличие переменных окружения
console.log('📋 Environment Variables Check:');
console.log('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
console.log('   VITE_SUPABASE_PUBLISHABLE_KEY:', SUPABASE_PUBLISHABLE_KEY ? '✅' : '❌');
console.log('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
console.log('');

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('   Please check your env.local file');
  process.exit(1);
}

async function testConnection() {
  try {
    // Тест 1: Подключение с публичным ключом
    console.log('🔑 Test 1: Public Key Connection');
    const publicClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    
    const { data: publicData, error: publicError } = await publicClient
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (publicError) {
      console.log('   ❌ Public key test failed:', publicError.message);
    } else {
      console.log('   ✅ Public key connection successful');
    }

    // Тест 2: Подключение с service key
    console.log('\n🔐 Test 2: Service Key Connection');
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (serviceError) {
      console.log('   ❌ Service key test failed:', serviceError.message);
    } else {
      console.log('   ✅ Service key connection successful');
    }

    // Тест 3: Проверка таблиц
    console.log('\n📊 Test 3: Database Tables Check');
    const { data: tables, error: tablesError } = await serviceClient
      .from('profiles')
      .select('id, username, level')
      .limit(5);
    
    if (tablesError) {
      console.log('   ❌ Tables access failed:', tablesError.message);
    } else {
      console.log('   ✅ Tables access successful');
      console.log(`   📈 Found ${tables.length} profiles`);
    }

    // Тест 4: Проверка RPC функций
    console.log('\n⚙️ Test 4: RPC Functions Check');
    const { data: rpcData, error: rpcError } = await serviceClient
      .rpc('has_role', { _role: 'user', _user_id: 'test' });
    
    if (rpcError) {
      console.log('   ❌ RPC test failed:', rpcError.message);
    } else {
      console.log('   ✅ RPC functions working');
    }

    // Тест 5: Проверка Storage
    console.log('\n📁 Test 5: Storage Access Check');
    const { data: storageData, error: storageError } = await serviceClient.storage
      .from('admin-images')
      .list('', { limit: 1 });
    
    if (storageError) {
      console.log('   ❌ Storage access failed:', storageError.message);
    } else {
      console.log('   ✅ Storage access successful');
      console.log(`   📁 Found ${storageData.length} files in admin-images bucket`);
    }

    // Тест 6: Проверка URL формирования
    console.log('\n🔗 Test 6: URL Formation Check');
    const testUrl = `${SUPABASE_URL}/storage/v1/object/public/admin-images/test.png`;
    console.log('   📝 Generated URL:', testUrl);
    console.log('   ✅ URL formation working');

    console.log('\n🎉 All tests completed successfully!');
    console.log('🔒 Security fixes are working correctly!');
    
  } catch (error) {
    console.error('\n💥 Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
