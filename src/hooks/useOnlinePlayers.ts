import { useState, useEffect, useCallback } from 'react';
import { OnlinePlayer } from '@/services/simpleOnlineService';
import SimpleOnlineService from '@/services/simpleOnlineService';

interface UseOnlinePlayersReturn {
  onlinePlayers: OnlinePlayer[];
  loading: boolean;
  error: string | null;
  refreshPlayers: () => Promise<void>;
  onlineCount: number;
  afkCount: number;
  inBattleCount: number;
  inDungeonCount: number;
  totalCount: number;
}

export const useOnlinePlayers = (autoRefresh: boolean = true): UseOnlinePlayersReturn => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ online: 0, afk: 0, in_battle: 0, in_dungeon: 0, total: 0 });

  const onlineService = SimpleOnlineService.getInstance();

  const loadPlayers = useCallback(async () => {
    try {
      setError(null);
      console.log('Загружаем список игроков...');
      const players = await onlineService.getOnlinePlayers();
      console.log('Получены игроки:', players);
      setOnlinePlayers(players);
      
      // Получаем статистику из базы данных
      const newStats = await onlineService.getPlayerStats();
      console.log('Получена статистика:', newStats);
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки списка игроков';
      setError(errorMessage);
      console.error('Ошибка загрузки игроков:', err);
    } finally {
      setLoading(false);
    }
  }, [onlineService]);

  const refreshPlayers = useCallback(async () => {
    setLoading(true);
    await loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    // Загружаем игроков при монтировании
    loadPlayers();

    let interval: NodeJS.Timeout | undefined;

    if (autoRefresh) {
      // Обновляем каждые 30 секунд
      interval = setInterval(loadPlayers, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadPlayers, autoRefresh]);

  return {
    onlinePlayers,
    loading,
    error,
    refreshPlayers,
    onlineCount: stats.online,
    afkCount: stats.afk,
    inBattleCount: stats.in_battle,
    inDungeonCount: stats.in_dungeon,
    totalCount: stats.total
  };
};
