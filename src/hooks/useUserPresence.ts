import { useEffect, useCallback } from 'react';
import SimpleOnlineService from '@/services/simpleOnlineService';

interface UseUserPresenceOptions {
  autoStart?: boolean;
  updateInterval?: number;
}

export const useUserPresence = (options: UseUserPresenceOptions = {}) => {
  const { autoStart = true, updateInterval = 30000 } = options;
  const onlineService = SimpleOnlineService.getInstance();

  const updatePresence = useCallback(async () => {
    try {
      await onlineService.updateUserPresenceWithStatus('online', 'Таврос');
    } catch (error) {
      console.error('Ошибка обновления присутствия:', error);
    }
  }, [onlineService]);

  const setStatus = useCallback(async (status: 'in_battle' | 'in_dungeon' | 'online') => {
    try {
      const location = status === 'in_battle' ? 'Арена' : 
                      status === 'in_dungeon' ? 'Подземелье' : 'Таврос';
      await onlineService.updateUserPresenceWithStatus(status, location);
    } catch (error) {
      console.error('Ошибка установки статуса:', error);
    }
  }, [onlineService]);

  const startPresenceUpdates = useCallback(() => {
    onlineService.startPresenceUpdates();
  }, [onlineService]);

  const stopPresenceUpdates = useCallback(() => {
    onlineService.stopPresenceUpdates();
  }, [onlineService]);

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
