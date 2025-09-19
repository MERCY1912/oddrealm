import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { applyPvPMigration } from '@/utils/applyPvPMigration';

const PvPTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Тестирование подключения...');
    
    try {
      // Тестируем подключение к базе данных
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        setTestResult(`Ошибка подключения: ${error.message}`);
      } else {
        setTestResult('✅ Подключение к базе данных работает!');
      }
    } catch (error) {
      setTestResult(`Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPvPRequests = async () => {
    setIsLoading(true);
    setTestResult('Проверка PvP заявок...');
    
    try {
      // Проверяем, есть ли заявки в базе данных
      const { data: requests, error } = await supabase
        .from('pvp_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setTestResult(`Ошибка получения заявок: ${error.message}`);
      } else {
        setTestResult(`✅ Найдено заявок: ${requests?.length || 0}\n\nДетали:\n${JSON.stringify(requests, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestTable = async () => {
    setIsLoading(true);
    setTestResult('Создание таблиц...');
    
    try {
      const success = await applyPvPMigration();
      if (success) {
        setTestResult('✅ Все таблицы PvP системы созданы успешно!');
      } else {
        setTestResult('❌ Ошибка при создании таблиц. Проверьте консоль для подробностей.');
      }
    } catch (error) {
      setTestResult(`Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Тест PvP системы</h3>
      
      <div className="space-x-2">
        <Button 
          onClick={testDatabaseConnection}
          disabled={isLoading}
          variant="outline"
        >
          Тест подключения
        </Button>
        
        <Button 
          onClick={createTestTable}
          disabled={isLoading}
          variant="outline"
        >
          Создать таблицы
        </Button>
        
        <Button 
          onClick={testPvPRequests}
          disabled={isLoading}
          variant="outline"
        >
          Проверить заявки
        </Button>
      </div>
      
      <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded">
        <h4 className="font-bold text-yellow-400 mb-2">Инструкция по созданию таблиц:</h4>
        <ol className="text-sm space-y-1 text-yellow-200">
          <li>1. Откройте <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-400 underline">Supabase Dashboard</a></li>
          <li>2. Перейдите в ваш проект</li>
          <li>3. Откройте SQL Editor</li>
          <li>4. Скопируйте содержимое файла <code className="bg-gray-700 px-1 rounded">pvp_tables.sql</code></li>
          <li>5. Вставьте и выполните SQL</li>
        </ol>
      </div>
      
      {testResult && (
        <div className="p-3 bg-gray-800 rounded border">
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default PvPTest;
