import React from 'react';
import { Button } from '@/components/ui/button';
import { arenaBots, getArenaBotsByLevelAndDifficulty } from '@/data/arenaBots';
import { ArenaBotDifficulty } from '@/types/game';

interface ArenaHallViewProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onBackToArena: () => void;
  onStartBattleWithBot: (botId: string) => void;
}

const ArenaHallView = ({ difficulty, onBackToArena, onStartBattleWithBot }: ArenaHallViewProps) => {
  // Получаем ботов для текущего зала (уровень 1 для демо)
  const hallBots = getArenaBotsByLevelAndDifficulty(1, difficulty as ArenaBotDifficulty);

  const hallInfo = {
    easy: {
      name: 'ЗАЛ НОВИЧКОВ',
      description: 'Тренировочный зал для начинающих воинов',
      icon: '🛡️',
      bgGradient: 'from-green-900/30 via-gray-900 to-green-900/30',
      accentColor: 'text-green-400'
    },
    medium: {
      name: 'ЗАЛ ВЕТЕРАНОВ', 
      description: 'Зал для опытных бойцов',
      icon: '⚔️',
      bgGradient: 'from-yellow-900/30 via-gray-900 to-yellow-900/30',
      accentColor: 'text-yellow-400'
    },
    hard: {
      name: 'ЗАЛ ЛЕГЕНД',
      description: 'Смертельный зал для мастеров войны',
      icon: '👑',
      bgGradient: 'from-red-900/30 via-gray-900 to-red-900/30',
      accentColor: 'text-red-400'
    }
  };

  const currentHall = hallInfo[difficulty];

  const getDifficultyColor = (botDifficulty: string) => {
    switch (botDifficulty) {
      case 'easy': return 'text-green-400 border-green-500/50';
      case 'medium': return 'text-yellow-400 border-yellow-500/50';
      case 'hard': return 'text-red-400 border-red-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок зала */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{currentHall.icon}</div>
        <h1 className={`text-3xl font-bold mb-2 ${currentHall.accentColor}`}>
          {currentHall.name}
        </h1>
        <p className="text-lg text-gray-300 mb-4">
          {currentHall.description}
        </p>
        <Button
          onClick={onBackToArena}
          className="medieval-button"
        >
          ← Назад к выбору залов
        </Button>
      </div>

      {/* Картинка зала */}
      <div className="panel panel--tint mb-8 p-8">
        <div className={`w-full h-48 bg-gradient-to-br ${currentHall.bgGradient} rounded-xl flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(181,42,42,.10),transparent_70%)]" />
          <div className="text-8xl opacity-40">{currentHall.icon}</div>
          <div className="absolute bottom-4 left-4 text-gray-400 text-sm">
            {currentHall.name}
          </div>
        </div>
      </div>

      {/* Список ботов */}
      <div className="panel panel--tint p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          ДОСТУПНЫЕ ПРОТИВНИКИ
        </h2>
        
        {hallBots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hallBots.map((bot) => (
              <div key={bot.id} className={`panel panel--tint p-4 hover:scale-105 transition-transform cursor-pointer border-2 ${getDifficultyColor(bot.difficulty)}`}>
                <div className="text-center">
                  <div className="text-3xl mb-2">{bot.image}</div>
                  <h3 className="font-bold text-white mb-2">{bot.name}</h3>
                  <div className="text-sm text-gray-300 mb-3">
                    Уровень {bot.level} • {bot.botType}
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    {bot.description}
                  </div>
                  
                  {/* Характеристики бота */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="text-red-400">❤️ {bot.health}</div>
                    <div className="text-orange-400">⚔️ {bot.attack}</div>
                    <div className="text-blue-400">🛡️ {bot.defense}</div>
                    <div className="text-yellow-400">💰 {bot.gold}</div>
                  </div>
                  
                  <Button
                    onClick={() => onStartBattleWithBot(bot.id)}
                    className="w-full medieval-button text-sm"
                  >
                    ⚔️ СРАЖЕНИЕ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">🚫</div>
            <p>В этом зале пока нет противников</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArenaHallView;