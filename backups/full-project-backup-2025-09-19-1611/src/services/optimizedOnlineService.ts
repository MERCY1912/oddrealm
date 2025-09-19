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

class OptimizedOnlineService {
  private static instance: OptimizedOnlineService;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 30000; // 30 секунд
  private readonly BATCH_SIZE = 20; // Размер батча для обновлений
  private pendingUpdates: Array<{user_id: string, status: string, location: string}> = [];

  public static getInstance(): OptimizedOnlineService {
    if (!OptimizedOnlineService.instance) {
      OptimizedOnlineService.instance = new OptimizedOnlineService();
    }
    return OptimizedOnlineService.instance;
  }

  /**
   * Добавляет обновление в батч (не отправляет сразу)
   */
  addPresenceUpdate(status: 'online' | 'afk' | 'in_battle' | 'in_dungeon', location: string): void {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Добавляем в очередь
    this.pendingUpdates.push({
      user_id: user.id,
      status,
      location
    });

    // Если очередь заполнилась, отправляем батч
    if (this.pendingUpdates.length >= this.BATCH_SIZE) {
      this.flushPendingUpdates();
    }
  }

  /**
   * Отправляет все накопленные обновления одним запросом
   */
  private async flushPendingUpdates(): Promise<void> {
    if (this.pendingUpdates.length === 0) return;

    try {
      const updates = [...this.pendingUpdates];
      this.pendingUpdates = [];

      const { error } = await supabase.rpc('update_user_presence_batch', {
        p_updates: updates
      });

      if (error) {
        console.error('Ошибка батч-обновления присутствия:', error);
        // Возвращаем обновления в очередь для повторной попытки
        this.pendingUpdates.unshift(...updates);
      } else {
        console.log(`Батч-обновление успешно: ${updates.length} пользователей`);
      }
    } catch (error) {
      console.error('Ошибка батч-обновления:', error);
    }
  }

  /**
   * Получает список игроков с пагинацией
   */
  async getOnlinePlayers(
    limit: number = 50, 
    offset: number = 0,
    statusFilter?: string
  ): Promise<OnlinePlayer[]> {
    try {
      const { data, error } = await supabase.rpc('get_online_players_optimized', {
        p_limit: limit,
        p_offset: offset,
        p_status_filter: statusFilter
      });

      if (error) {
        throw error;
      }

      return data.map((player: any) => ({
        id: player.user_id,
        username: player.username,
        level: player.level,
        character_class: player.character_class,
        last_seen: player.last_seen,
        status: player.status,
        location: player.location
      }));
    } catch (error) {
      console.error('Ошибка получения списка игроков:', error);
      return [];
    }
  }

  /**
   * Получает только статистику (быстро)
   */
  async getPlayerStats(): Promise<PlayerStats> {
    try {
      const { data, error } = await supabase.rpc('get_online_stats_fast');
      
      if (error) {
        throw error;
      }

      return data[0] || {
        total_online: 0,
        online_count: 0,
        afk_count: 0,
        in_battle_count: 0,
        in_dungeon_count: 0
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
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
   * Запускает автоматическое обновление с батчингом
   */
  startPresenceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Обновляем сразу
    this.flushPendingUpdates();

    // Затем каждые 30 секунд
    this.updateInterval = setInterval(() => {
      this.flushPendingUpdates();
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Останавливает автоматическое обновление
   */
  stopPresenceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Отправляем оставшиеся обновления
    this.flushPendingUpdates();
  }
}

export default OptimizedOnlineService;
