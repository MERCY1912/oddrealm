import { useState, useEffect, useCallback } from 'react';
import BotService from '@/services/botService';
import { BotCharacter } from '@/types/bot';

interface UseBotSystemReturn {
  bots: BotCharacter[];
  isInitialized: boolean;
  isRunning: boolean;
  initializeBots: () => Promise<void>;
  startBots: () => void;
  stopBots: () => void;
  refreshBots: () => Promise<void>;
}

export const useBotSystem = (): UseBotSystemReturn => {
  const [bots, setBots] = useState<BotCharacter[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const botService = BotService.getInstance();

  const initializeBots = useCallback(async () => {
    try {
      console.log('Инициализируем систему ботов...');
      await botService.initializeBots();
      setIsInitialized(true);
      setIsRunning(true);
      
      // Загружаем список ботов
      const activeBots = botService.getActiveBots();
      setBots(activeBots);
      
      console.log(`Система ботов инициализирована. Активно: ${activeBots.length} ботов`);
    } catch (error) {
      console.error('Ошибка инициализации ботов:', error);
      setIsInitialized(false);
    }
  }, [botService]);

  const startBots = useCallback(() => {
    try {
      botService.initializeBots();
      setIsRunning(true);
      console.log('Боты запущены');
    } catch (error) {
      console.error('Ошибка запуска ботов:', error);
    }
  }, [botService]);

  const stopBots = useCallback(() => {
    try {
      botService.stopBotActivity();
      setIsRunning(false);
      console.log('Боты остановлены');
    } catch (error) {
      console.error('Ошибка остановки ботов:', error);
    }
  }, [botService]);

  const refreshBots = useCallback(async () => {
    try {
      const activeBots = botService.getActiveBots();
      setBots(activeBots);
      console.log(`Обновлен список ботов: ${activeBots.length} активных`);
    } catch (error) {
      console.error('Ошибка обновления списка ботов:', error);
    }
  }, [botService]);

  // Автоматическая инициализация при монтировании
  useEffect(() => {
    initializeBots();

    // Очистка при размонтировании
    return () => {
      botService.stopBotActivity();
    };
  }, [initializeBots, botService]);

  // Обновляем список ботов каждые 30 секунд
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      refreshBots();
    }, 30000);

    return () => clearInterval(interval);
  }, [isInitialized, refreshBots]);

  return {
    bots,
    isInitialized,
    isRunning,
    initializeBots,
    startBots,
    stopBots,
    refreshBots
  };
};
