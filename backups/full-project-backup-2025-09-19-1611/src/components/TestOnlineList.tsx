import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TestPlayer {
  id: string;
  username: string;
  level: number;
  character_class: string;
  last_seen: string;
}

const TestOnlineList = () => {
  const [players, setPlayers] = useState<TestPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        console.log('Тест: Загружаем игроков...');
        
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        
        // Сначала получаем активность
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity')
          .select('user_id, last_seen')
          .gt('last_seen', tenMinutesAgo);

        if (activityError) {
          throw activityError;
        }

        if (!activityData || activityData.length === 0) {
          console.log('Тест: Нет активных пользователей');
          setPlayers([]);
          return;
        }

        // Получаем профили для активных пользователей
        const userIds = activityData.map(activity => activity.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, level, character_class')
          .in('id', userIds);

        if (profilesError) {
          throw profilesError;
        }

        // Объединяем данные
        const data = activityData.map(activity => {
          const profile = profilesData?.find(p => p.id === activity.user_id);
          return {
            user_id: activity.user_id,
            last_seen: activity.last_seen,
            profiles: profile
          };
        }).filter(item => item.profiles);

        console.log('Тест: Результат запроса:', { data });

        if (data) {
          const processedPlayers = data
            .map(activity => {
              const profile = activity.profiles;
              if (!profile || typeof profile !== 'object') {
                return null;
              }

              return {
                id: profile.id,
                username: profile.username,
                level: profile.level,
                character_class: profile.character_class,
                last_seen: activity.last_seen
              };
            })
            .filter((player): player is TestPlayer => player !== null);

          console.log('Тест: Обработанные игроки:', processedPlayers);
          setPlayers(processedPlayers);
        } else {
          console.log('Тест: Нет данных');
          setPlayers([]);
        }
      } catch (err) {
        console.error('Тест: Ошибка:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  if (loading) {
    return <div className="p-2 text-sm text-gray-400">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-2 text-sm text-red-400">Ошибка: {error}</div>;
  }

  return (
    <div className="p-2">
      <div className="text-sm font-bold text-gray-300 mb-2">
        Тест списка игроков ({players.length})
      </div>
      {players.length > 0 ? (
        <div className="space-y-1">
          {players.map((player) => (
            <div key={player.id} className="p-1 bg-gray-700 rounded text-xs">
              <div className="font-bold text-white">{player.username}</div>
              <div className="text-gray-400">Уровень: {player.level}</div>
              <div className="text-gray-400">Класс: {player.character_class}</div>
              <div className="text-gray-400">Последний раз: {new Date(player.last_seen).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">Нет игроков онлайн</div>
      )}
    </div>
  );
};

export default TestOnlineList;
