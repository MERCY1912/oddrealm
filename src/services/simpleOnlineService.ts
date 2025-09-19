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

class SimpleOnlineService {
  private static instance: SimpleOnlineService;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 30000; // 30 секунд
  private readonly AFK_THRESHOLD = 5 * 60 * 1000; // 5 минут
  private readonly OFFLINE_THRESHOLD = 10 * 60 * 1000; // 10 минут

  public static getInstance(): SimpleOnlineService {
    if (!SimpleOnlineService.instance) {
      SimpleOnlineService.instance = new SimpleOnlineService();
    }
    return SimpleOnlineService.instance;
  }

  /**
   * Обновляет время последней активности текущего пользователя
   */
  async updateUserPresence(): Promise<void> {
    try {
      console.log('SimpleOnlineService: Обновляем присутствие...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Пользователь не авторизован');
        return;
      }

      // Пока RPC функция не создана, используем только прямой запрос
      console.log('Используем прямой запрос для обновления присутствия');
      
      const { error: insertError } = await supabase
        .from('user_activity')
        .upsert({
          user_id: user.id,
          last_seen: new Date().toISOString(),
          status: 'online',
          location: 'Таврос',
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
   * Обновляет присутствие с указанием статуса и локации
   */
  async updateUserPresenceWithStatus(status: 'online' | 'afk' | 'in_battle' | 'in_dungeon' = 'online', location: string = 'Таврос'): Promise<void> {
    try {
      console.log(`SimpleOnlineService: Обновляем присутствие со статусом ${status} и локацией ${location}...`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Пользователь не авторизован');
        return;
      }

      // Пока RPC функция не создана, используем только прямой запрос
      console.log(`Обновляем присутствие со статусом ${status} и локацией ${location}`);
      
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
      console.log('SimpleOnlineService: Получаем список игроков...');
      
      // Добавляем таймаут для предотвращения зависания
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: запрос превысил 10 секунд')), 10000);
      });
      
      const tenMinutesAgo = new Date(Date.now() - this.OFFLINE_THRESHOLD).toISOString();
      
      // Обертываем запрос в таймаут
      const queryPromise = this.executeOnlinePlayersQuery(tenMinutesAgo);
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      return result;
    } catch (error) {
      console.error('Ошибка получения списка игроков:', error);
      return [];
    }
  }

  /**
   * Выполняет запрос для получения онлайн игроков
   */
  private async executeOnlinePlayersQuery(tenMinutesAgo: string): Promise<OnlinePlayer[]> {
    try {
      // Сначала получаем активность
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('user_id, last_seen, status, location')
        .gt('last_seen', tenMinutesAgo)
        .order('last_seen', { ascending: false });

      if (activityError) {
        console.warn('Ошибка при получении активности, пробуем без статуса и локации:', activityError);
        
        // Fallback - получаем только user_id и last_seen
        const { data: simpleActivityData, error: simpleActivityError } = await supabase
          .from('user_activity')
          .select('user_id, last_seen')
          .gt('last_seen', tenMinutesAgo)
          .order('last_seen', { ascending: false });

        if (simpleActivityError) {
          throw simpleActivityError;
        }

        if (!simpleActivityData || simpleActivityData.length === 0) {
          console.log('Нет активных пользователей');
          return [];
        }

        // Получаем профили для активных пользователей
        const userIds = simpleActivityData.map(activity => activity.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, level, character_class, city')
          .in('id', userIds);

        if (profilesError) {
          throw profilesError;
        }

        // Объединяем данные
        const data = simpleActivityData.map(activity => {
          const profile = profilesData?.find(p => p.id === activity.user_id);
          return {
            user_id: activity.user_id,
            last_seen: activity.last_seen,
            status: 'online', // По умолчанию
            location: 'Таврос', // По умолчанию
            profiles: profile
          };
        }).filter(item => item.profiles);

        console.log('Данные из БД (простой режим):', data);

        if (!data || data.length === 0) {
          console.log('Нет данных из БД, возвращаем пустой массив');
          return [];
        }

        const players: OnlinePlayer[] = data
          .map(activity => {
            const profile = activity.profiles;
            if (!profile || typeof profile !== 'object') {
              console.log('Неверный профиль:', profile);
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
          .filter((player): player is OnlinePlayer => player !== null);

        // Сортируем игроков
        const sortedPlayers = players.sort((a, b) => {
          // Сначала онлайн, потом AFK
          if (a.status === 'online' && b.status !== 'online') return -1;
          if (a.status !== 'online' && b.status === 'online') return 1;
          
          // Затем по алфавиту
          return a.username.localeCompare(b.username);
        });

        console.log('Обработанные игроки (простой режим):', sortedPlayers);
        return sortedPlayers;
      }

      if (!activityData || activityData.length === 0) {
        console.log('Нет активных пользователей');
        return [];
      }

      // Получаем профили для активных пользователей
      const userIds = activityData.map(activity => activity.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, level, character_class, city')
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
          status: activity.status || 'online',
          location: activity.location || 'Таврос',
          profiles: profile
        };
      }).filter(item => item.profiles);

      console.log('Данные из БД:', data);

      if (!data || data.length === 0) {
        console.log('Нет данных из БД, возвращаем пустой массив');
        return [];
      }

      const players: OnlinePlayer[] = data
        .map(activity => {
          const profile = activity.profiles;
          if (!profile || typeof profile !== 'object') {
            console.log('Неверный профиль:', profile);
            return null;
          }

          const lastSeen = new Date(activity.last_seen);
          const now = new Date();
          const timeDiff = now.getTime() - lastSeen.getTime();

          let status: OnlinePlayer['status'] = activity.status || 'online';
          if (timeDiff > this.AFK_THRESHOLD && status === 'online') {
            status = 'afk';
          }

          return {
            id: profile.id,
            username: profile.username,
            level: profile.level,
            character_class: profile.character_class,
            last_seen: activity.last_seen,
            status,
            location: activity.location || profile.city || 'Таврос'
          };
        })
        .filter((player): player is OnlinePlayer => player !== null);

      // Сортируем игроков
      const sortedPlayers = players.sort((a, b) => {
        // Сначала онлайн, потом AFK
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        
        // Затем по алфавиту
        return a.username.localeCompare(b.username);
      });

      console.log('Обработанные игроки:', sortedPlayers);
      return sortedPlayers;
    } catch (error) {
      console.error('Ошибка выполнения запроса онлайн игроков:', error);
      return [];
    }
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
}

export default SimpleOnlineService;
