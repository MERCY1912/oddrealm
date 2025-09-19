import { useEffect, useCallback } from 'react';
import FastOnlineService from '@/services/fastOnlineService';

interface UseFastUserPresenceOptions {
  autoStart?: boolean;
  updateInterval?: number;
}

export const useFastUserPresence = (options: UseFastUserPresenceOptions = {}) => {
  const { autoStart = true, updateInterval = 30000 } = options;

  const updatePresence = useCallback(async () => {
    try {
      const fastOnlineService = FastOnlineService.getInstance();
      await fastOnlineService.updateUserPresenceWithStatus('online', 'Таврос');
    } catch (error) {
      console.error('Ошибка обновления присутствия:', error);
    }
  }, []);

  const setStatus = useCallback(async (status: 'in_battle' | 'in_dungeon' | 'online') => {
    try {
      const fastOnlineService = FastOnlineService.getInstance();
      const location = status === 'in_battle' ? 'Арена' : 
                      status === 'in_dungeon' ? 'Подземелье' : 'Таврос';
      await fastOnlineService.updateUserPresenceWithStatus(status, location);
    } catch (error) {
      console.error('Ошибка установки статуса:', error);
    }
  }, []);

  const startPresenceUpdates = useCallback(() => {
    const fastOnlineService = FastOnlineService.getInstance();
    fastOnlineService.startPresenceUpdates();
  }, []);

  const stopPresenceUpdates = useCallback(() => {
    const fastOnlineService = FastOnlineService.getInstance();
    fastOnlineService.stopPresenceUpdates();
  }, []);

  useEffect(() => {
    if (autoStart) {
      startPresenceUpdates();
    }

    // Обновляем присутствие при активности пользователя
    const handleUserActivity = () => {
      updatePresence();
    };

    // Слушаем различные события активности
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Обновляем при фокусе окна
    const handleWindowFocus = () => {
      updatePresence();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (autoStart) {
        stopPresenceUpdates();
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [autoStart, startPresenceUpdates, stopPresenceUpdates, updatePresence]);

  return {
    updatePresence,
    setStatus,
    startPresenceUpdates,
    stopPresenceUpdates
  };
};
