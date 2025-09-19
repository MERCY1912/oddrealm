import { useState, useEffect, useCallback } from 'react';
import { OnlinePlayer, PlayerStats } from '@/services/fastOnlineService';
import FastOnlineService from '@/services/fastOnlineService';

interface UseFastOnlinePlayersReturn {
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

export const useFastOnlinePlayers = (autoRefresh: boolean = true): UseFastOnlinePlayersReturn => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PlayerStats>({
    total_online: 0,
    online_count: 0,
    afk_count: 0,
    in_battle_count: 0,
    in_dungeon_count: 0
  });

  const loadPlayers = useCallback(async () => {
    try {
      setError(null);
      console.log('useFastOnlinePlayers: Загружаем данные...');
      
      const fastOnlineService = FastOnlineService.getInstance();
      
      // Загружаем игроков, ботов и статистику параллельно
      const [players, bots, playerStats] = await Promise.all([
        fastOnlineService.getOnlinePlayers(),
        fastOnlineService.getOnlineBots(),
        fastOnlineService.getPlayerStats()
      ]);
      
      // Объединяем игроков и ботов
      const allPlayers = [...players, ...bots];
      
      console.log('useFastOnlinePlayers: Данные загружены:', { 
        playersCount: players.length,
        botsCount: bots.length,
        totalCount: allPlayers.length,
        stats: playerStats 
      });
      
      setOnlinePlayers(allPlayers);
      setStats(playerStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
      setError(errorMessage);
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Убираем все зависимости для предотвращения перерендеров

  const refreshPlayers = useCallback(async () => {
    setLoading(true);
    await loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    // Загружаем данные при монтировании
    loadPlayers();
  }, []); // Загружаем только при монтировании

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (autoRefresh) {
      // Обновляем каждые 30 секунд
      interval = setInterval(() => {
        loadPlayers();
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]); // Только autoRefresh влияет на интервал

  return {
    onlinePlayers,
    loading,
    error,
    refreshPlayers,
    onlineCount: stats.online_count,
    afkCount: stats.afk_count,
    inBattleCount: stats.in_battle_count,
    inDungeonCount: stats.in_dungeon_count,
    totalCount: stats.total_online
  };
};
