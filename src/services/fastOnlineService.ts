import { supabase } from '@/integrations/supabase/client';

export interface OnlinePlayer {
  id: string;
  username: string;
  level: number;
  character_class: string;
  last_seen: string;
  status: 'online' | 'afk' | 'in_battle' | 'in_dungeon';
  location: string;
}

export interface PlayerStats {
  total_online: number;
  online_count: number;
  afk_count: number;
  in_battle_count: number;
  in_dungeon_count: number;
}

class FastOnlineService {
  private static instance: FastOnlineService;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 30000; // 30 секунд
  
  // Кэш для предотвращения частых запросов
  private playersCache: OnlinePlayer[] | null = null;
  private statsCache: PlayerStats | null = null;
  private lastCacheUpdate = 0;
  private readonly CACHE_DURATION = 10000; // 10 секунд кэша

  public static getInstance(): FastOnlineService {
    if (!FastOnlineService.instance) {
      FastOnlineService.instance = new FastOnlineService();
    }
    return FastOnlineService.instance;
  }

  /**
   * Обновляет присутствие пользователя через RPC
   */
  async updateUserPresence(status: 'online' | 'afk' | 'in_battle' | 'in_dungeon' = 'online', location: string = 'Таврос'): Promise<void> {
    try {
      console.log(`FastOnlineService: Обновляем присутствие ${status} в ${location}`);
      
      const { error } = await supabase.rpc('update_user_presence', {
        p_status: status as any, // Приводим к типу player_status
        p_location: location
      });
      
      if (error) {
        console.error('Ошибка обновления присутствия через RPC:', error);
        throw error;
      }
      
      console.log('Присутствие обновлено через RPC успешно');
      
      // Очищаем кэш после обновления
      this.clearCache();
    } catch (error) {
      console.error('Ошибка обновления присутствия:', error);
    }
  }

  /**
   * Получает список онлайн игроков через RPC
   */
  async getOnlinePlayers(): Promise<OnlinePlayer[]> {
    try {
      const now = Date.now();
      
      // Проверяем кэш
      if (this.playersCache && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        console.log('FastOnlineService: Используем кэшированный список игроков');
        return this.playersCache;
      }
      
      console.log('FastOnlineService: Получаем список игроков через RPC...');
      
      const { data, error } = await supabase.rpc('get_online_players_fast');
      
      if (error) {
        console.error('Ошибка получения игроков через RPC:', error);
        throw error;
      }

      const players: OnlinePlayer[] = (data || []).map((player: any) => ({
        id: player.user_id,
        username: player.username,
        level: player.level,
        character_class: player.character_class,
        last_seen: player.last_seen,
        status: player.status,
        location: player.location
      }));

      // Обновляем кэш
      this.playersCache = players;
      this.lastCacheUpdate = now;
      
      console.log(`FastOnlineService: Получено ${players.length} игроков через RPC`);
      return players;
    } catch (error) {
      console.error('Ошибка получения списка игроков:', error);
      
      // В случае ошибки возвращаем кэшированные данные, если они есть
      if (this.playersCache) {
        console.log('Используем кэшированные данные после ошибки');
        return this.playersCache;
      }
      
      return [];
    }
  }

  /**
   * Получает список ботов онлайн
   */
  async getOnlineBots(): Promise<OnlinePlayer[]> {
    try {
      console.log('FastOnlineService: Получаем список ботов...');
      
      // Получаем активных ботов
      const { data: bots, error: botsError } = await supabase
        .from('bot_characters')
        .select(`
          id,
          name,
          username,
          character_class,
          level,
          status,
          location,
          last_activity
        `)
        .eq('is_active', true);

      if (botsError) {
        console.error('Ошибка получения ботов:', botsError);
        return [];
      }

      // Получаем присутствие ботов
      const { data: presence, error: presenceError } = await supabase
        .from('bot_presence')
        .select('bot_id, last_seen, status, location, last_activity');

      if (presenceError) {
        console.error('Ошибка получения присутствия ботов:', presenceError);
        return [];
      }

      // Объединяем данные
      const botPlayers: OnlinePlayer[] = bots.map(bot => {
        const botPresence = presence?.find(p => p.bot_id === bot.id);
        return {
          id: bot.id,
          username: bot.username,
          level: bot.level,
          character_class: bot.character_class,
          last_seen: botPresence?.last_seen || bot.last_activity,
          status: botPresence?.status || bot.status,
          location: botPresence?.location || bot.location,
          isBot: true
        };
      });

      console.log(`FastOnlineService: Получено ${botPlayers.length} ботов`);
      return botPlayers;
    } catch (error) {
      console.error('Ошибка получения ботов:', error);
      return [];
    }
  }

  /**
   * Получает статистику через RPC
   */
  async getPlayerStats(): Promise<PlayerStats> {
    try {
      const now = Date.now();
      
      // Проверяем кэш статистики
      if (this.statsCache && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        console.log('FastOnlineService: Используем кэшированную статистику');
        return this.statsCache;
      }
      
      console.log('FastOnlineService: Получаем статистику через RPC...');
      
      const { data, error } = await supabase.rpc('get_online_stats_fast');
      
      if (error) {
        console.error('Ошибка получения статистики через RPC:', error);
        throw error;
      }

      const stats: PlayerStats = data?.[0] || {
        total_online: 0,
        online_count: 0,
        afk_count: 0,
        in_battle_count: 0,
        in_dungeon_count: 0
      };

      // Обновляем кэш
      this.statsCache = stats;
      
      console.log('FastOnlineService: Статистика получена через RPC:', stats);
      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      
      // В случае ошибки возвращаем кэшированные данные, если они есть
      if (this.statsCache) {
        console.log('Используем кэшированную статистику после ошибки');
        return this.statsCache;
      }
      
      return {
        total_online: 0,
        online_count: 0,
        afk_count: 0,
        in_battle_count: 0,
        in_dungeon_count: 0
      };
    }
  }

  /**
   * Очищает кэш
   */
  private clearCache(): void {
    this.playersCache = null;
    this.statsCache = null;
    this.lastCacheUpdate = 0;
  }

  /**
   * Запускает автоматическое обновление присутствия
   */
  startPresenceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Обновляем сразу
    this.updateUserPresence();

    // Затем каждые 30 секунд
    this.updateInterval = setInterval(() => {
      this.updateUserPresence();
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Останавливает автоматическое обновление присутствия
   */
  stopPresenceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Обновляет присутствие с указанием статуса и локации
   */
  async updateUserPresenceWithStatus(status: 'online' | 'afk' | 'in_battle' | 'in_dungeon', location: string): Promise<void> {
    await this.updateUserPresence(status, location);
  }
}

export default FastOnlineService;
