import { supabase } from '@/integrations/supabase/client';

export interface OnlinePlayer {
  id: string;
  username: string;
  level: number;
  character_class: string;
  last_seen: string;
  status: 'online' | 'afk' | 'in_battle' | 'in_dungeon';
  location?: string;
}

export interface PlayerStatus {
  status: 'online' | 'afk' | 'in_battle' | 'in_dungeon';
  location?: string;
  last_activity: string;
}

class OnlineService {
  private static instance: OnlineService;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 30000; // 30 секунд
  private readonly AFK_THRESHOLD = 5 * 60 * 1000; // 5 минут
  private readonly OFFLINE_THRESHOLD = 10 * 60 * 1000; // 10 минут

  public static getInstance(): OnlineService {
    if (!OnlineService.instance) {
      OnlineService.instance = new OnlineService();
    }
    return OnlineService.instance;
  }

  /**
   * Обновляет время последней активности текущего пользователя
   */
  async updateUserPresence(status: 'online' | 'afk' | 'in_battle' | 'in_dungeon' = 'online', location: string = 'Таврос'): Promise<void> {
    try {
      // Пока RPC функция не создана, используем только прямой запрос
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Пользователь не авторизован');
        return;
      }
      
      console.log(`Обновляем присутствие: статус ${status}, локация ${location}`);
      
      const { error: insertError } = await supabase
        .from('user_activity')
        .upsert({
          user_id: user.id,
          last_seen: new Date().toISOString(),
          status: status,
          location: location,
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
        
      if (insertError) {
        console.error('Ошибка обновления присутствия:', insertError);
      } else {
        console.log('Присутствие обновлено успешно');
      }
    } catch (error) {
      console.error('Ошибка обновления присутствия:', error);
    }
  }

  /**
   * Получает список онлайн игроков
   */
  async getOnlinePlayers(): Promise<OnlinePlayer[]> {
    try {
      console.log('OnlineService: Получаем список игроков...');
      
      // Сначала пробуем использовать новую RPC функцию
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_online_players');

      if (!rpcError && rpcData) {
        const players: OnlinePlayer[] = rpcData.map((player: any) => ({
          id: player.user_id,
          username: player.username,
          level: player.level,
          character_class: player.character_class,
          last_seen: player.last_seen,
          status: player.status,
          location: player.location || 'Таврос'
        }));
        return players;
      }

      console.warn('RPC функция не найдена, используем прямой запрос:', rpcError);
      
      // Fallback к прямому запросу с существующей структурой
      const tenMinutesAgo = new Date(Date.now() - this.OFFLINE_THRESHOLD).toISOString();
      
      const { data, error } = await supabase
        .from('user_activity')
        .select(`
          user_id,
          last_seen,
          profiles!inner (
            id,
            username,
            level,
            character_class,
            city
          )
        `)
        .gt('last_seen', tenMinutesAgo)
        .order('last_seen', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data) {
        return [];
      }

      const players: OnlinePlayer[] = data
        .map(activity => {
          const profile = activity.profiles;
          if (!profile || typeof profile !== 'object') {
            return null;
          }

          const lastSeen = new Date(activity.last_seen);
          const now = new Date();
          const timeDiff = now.getTime() - lastSeen.getTime();

          let status: OnlinePlayer['status'] = 'online';
          if (timeDiff > this.AFK_THRESHOLD) {
            status = 'afk';
          }

          return {
            id: profile.id,
            username: profile.username,
            level: profile.level,
            character_class: profile.character_class,
            last_seen: activity.last_seen,
            status,
            location: profile.city || 'Таврос'
          };
        })
        .filter((player): player is OnlinePlayer => player !== null)
        .sort((a, b) => {
          // Сначала онлайн, потом AFK
          if (a.status === 'online' && b.status !== 'online') return -1;
          if (a.status !== 'online' && b.status === 'online') return 1;
          
          // Затем по алфавиту
          return a.username.localeCompare(b.username);
        });

      return players;
    } catch (error) {
      console.error('Ошибка получения списка игроков:', error);
      return [];
    }
  }

  /**
   * Получает статус конкретного игрока
   */
  async getPlayerStatus(playerId: string): Promise<PlayerStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('last_seen')
        .eq('user_id', playerId)
        .single();

      if (error || !data) {
        return null;
      }

      const lastSeen = new Date(data.last_seen);
      const now = new Date();
      const timeDiff = now.getTime() - lastSeen.getTime();

      let status: PlayerStatus['status'] = 'online';
      if (timeDiff > this.AFK_THRESHOLD) {
        status = 'afk';
      }

      return {
        status,
        last_activity: data.last_seen
      };
    } catch (error) {
      console.error('Ошибка получения статуса игрока:', error);
      return null;
    }
  }

  /**
   * Устанавливает статус игрока (в бою, в подземелье и т.д.)
   */
  async setPlayerStatus(status: 'in_battle' | 'in_dungeon' | 'online'): Promise<void> {
    try {
      // Обновляем время последней активности
      await this.updateUserPresence();
      
      // Здесь можно добавить логику для сохранения дополнительного статуса
      // Например, в отдельную таблицу player_status
      console.log(`Статус игрока установлен: ${status}`);
    } catch (error) {
      console.error('Ошибка установки статуса игрока:', error);
    }
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
   * Получает количество онлайн игроков
   */
  async getOnlineCount(): Promise<number> {
    const players = await this.getOnlinePlayers();
    return players.filter(player => player.status === 'online').length;
  }

  /**
   * Получает статистику по статусам игроков
   */
  async getPlayerStats(): Promise<{
    online: number;
    afk: number;
    in_battle: number;
    in_dungeon: number;
    total: number;
  }> {
    try {
      // Сначала пробуем использовать новую RPC функцию
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_online_stats');

      if (!rpcError && rpcData && rpcData.length > 0) {
        const stats = rpcData[0];
        return {
          online: stats.online_count || 0,
          afk: stats.afk_count || 0,
          in_battle: stats.in_battle_count || 0,
          in_dungeon: stats.in_dungeon_count || 0,
          total: stats.total_online || 0
        };
      }

      console.warn('RPC функция не найдена, вычисляем статистику локально:', rpcError);
      
      // Fallback - вычисляем статистику из списка игроков
      const players = await this.getOnlinePlayers();
      
      return {
        online: players.filter(p => p.status === 'online').length,
        afk: players.filter(p => p.status === 'afk').length,
        in_battle: players.filter(p => p.status === 'in_battle').length,
        in_dungeon: players.filter(p => p.status === 'in_dungeon').length,
        total: players.length
      };
    } catch (error) {
      console.error('Ошибка получения статистики игроков:', error);
      return { online: 0, afk: 0, in_battle: 0, in_dungeon: 0, total: 0 };
    }
  }
}

export { OnlinePlayer, PlayerStatus };
export default OnlineService;
