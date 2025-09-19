import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SimpleTestOnlineList = () => {
  const [status, setStatus] = useState<string>('Загрузка...');
  const [activityCount, setActivityCount] = useState<number>(0);
  const [profilesCount, setProfilesCount] = useState<number>(0);

  useEffect(() => {
    console.log('SimpleTestOnlineList: useEffect запущен');
    const testDatabase = async () => {
      try {
        console.log('Простой тест: Проверяем базу данных...');
        
        // Проверяем таблицу user_activity
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity')
          .select('*')
          .limit(5);

        console.log('Активность:', { activityData, activityError });

        if (activityError) {
          setStatus(`Ошибка активности: ${activityError.message}`);
          return;
        }

        setActivityCount(activityData?.length || 0);

        // Проверяем таблицу profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);

        console.log('Профили:', { profilesData, profilesError });

        if (profilesError) {
          setStatus(`Ошибка профилей: ${profilesError.message}`);
          return;
        }

        setProfilesCount(profilesData?.length || 0);

        // Проверяем авторизацию
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('Пользователь:', { user, authError });

        if (authError) {
          setStatus(`Ошибка авторизации: ${authError.message}`);
          return;
        }

        if (!user) {
          setStatus('Пользователь не авторизован');
          return;
        }

        setStatus(`База данных работает! Активность: ${activityCount}, Профили: ${profilesCount}, Пользователь: ${user.email}`);

      } catch (error) {
        console.error('Простой тест: Ошибка:', error);
        setStatus(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    };

    testDatabase();
  }, [activityCount, profilesCount]);

  return (
    <div className="p-2 text-xs">
      <div className="font-bold text-gray-300 mb-2">Простой тест БД</div>
      <div className="text-gray-400 mb-1">{status}</div>
      <div className="text-gray-400">Активность: {activityCount}</div>
      <div className="text-gray-400">Профили: {profilesCount}</div>
    </div>
  );
};

export default SimpleTestOnlineList;
