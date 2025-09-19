import { useState, useEffect, useCallback } from 'react';
import { OnlinePlayer, PlayerStats } from '@/services/optimizedOnlineService';
import OptimizedOnlineService from '@/services/optimizedOnlineService';

interface UseOptimizedOnlinePlayersReturn {
  onlinePlayers: OnlinePlayer[];
  stats: PlayerStats;
  loading: boolean;
  error: string | null;
  refreshPlayers: () => Promise<void>;
  loadMorePlayers: () => Promise<void>;
  hasMore: boolean;
}

export const useOptimizedOnlinePlayers = (): UseOptimizedOnlinePlayersReturn => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [stats, setStats] = useState<PlayerStats>({
    total_online: 0,
    online_count: 0,
    afk_count: 0,
    in_battle_count: 0,
    in_dungeon_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const onlineService = OptimizedOnlineService.getInstance();
  const PAGE_SIZE = 20; // Загружаем по 20 игроков за раз

  const loadPlayers = useCallback(async (reset: boolean = false) => {
    try {
      setError(null);
      if (reset) {
        setOffset(0);
        setHasMore(true);
      }

      const currentOffset = reset ? 0 : offset;
      const players = await onlineService.getOnlinePlayers(PAGE_SIZE, currentOffset);
      
      if (reset) {
        setOnlinePlayers(players);
      } else {
        setOnlinePlayers(prev => [...prev, ...players]);
      }

      setOffset(currentOffset + players.length);
      setHasMore(players.length === PAGE_SIZE);

      // Загружаем статистику отдельно (быстро)
      const newStats = await onlineService.getPlayerStats();
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки списка игроков';
      setError(errorMessage);
      console.error('Ошибка загрузки игроков:', err);
    } finally {
      setLoading(false);
    }
  }, [onlineService, offset]);

  const refreshPlayers = useCallback(async () => {
    setLoading(true);
    await loadPlayers(true);
  }, [loadPlayers]);

  const loadMorePlayers = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    await loadPlayers(false);
  }, [loadPlayers, hasMore, loading]);

  useEffect(() => {
    // Загружаем игроков при монтировании
    loadPlayers(true);

    // Обновляем статистику каждые 30 секунд
    const statsInterval = setInterval(async () => {
      try {
        const newStats = await onlineService.getPlayerStats();
        setStats(newStats);
      } catch (err) {
        console.error('Ошибка обновления статистики:', err);
      }
    }, 30000);

    return () => {
      clearInterval(statsInterval);
    };
  }, [loadPlayers, onlineService]);

  return {
    onlinePlayers,
    stats,
    loading,
    error,
    refreshPlayers,
    loadMorePlayers,
    hasMore
  };
};
