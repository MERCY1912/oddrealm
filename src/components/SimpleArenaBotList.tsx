import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArenaBot, ArenaBotDifficulty, PlayerProfile } from '@/types/game';
import { getAvailableArenaBots } from '@/data/arenaBots';

interface SimpleArenaBotListProps {
  player: PlayerProfile;
  onChallengeBot: (bot: ArenaBot) => void;
  className?: string;
}

const SimpleArenaBotList = ({ player, onChallengeBot, className = '' }: SimpleArenaBotListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Получаем доступных ботов для игрока
  const availableBots = useMemo(() => {
    return getAvailableArenaBots(player.level);
  }, [player.level]);

  // Фильтруем ботов по поиску
  const filteredBots = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableBots;
    }
    
    const query = searchQuery.toLowerCase();
    return availableBots.filter(bot => 
      bot.name.toLowerCase().includes(query) ||
      bot.botType.toLowerCase().includes(query)
    );
  }, [availableBots, searchQuery]);

  // Группируем ботов по уровню
  const groupedBots = useMemo(() => {
    const groups: { [key: number]: ArenaBot[] } = {};
    
    filteredBots.forEach(bot => {
      if (!groups[bot.level]) {
        groups[bot.level] = [];
      }
      groups[bot.level].push(bot);
    });

    return groups;
  }, [filteredBots]);

  const getDifficultyColor = (difficulty: ArenaBotDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600 hover:bg-green-700';
      case 'medium': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'hard': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getDifficultyText = (difficulty: ArenaBotDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };

  const getBotTypeEmoji = (botType: string) => {
    switch (botType) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'archer': return '🏹';
      case 'rogue': return '🗡️';
      case 'paladin': return '🛡️';
      case 'berserker': return '⚡';
      default: return '❓';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Заголовок */}
      <Card className="panel panel--tint panel--warm">
        <CardHeader>
          <CardTitle className="text-white text-center">
            🏟️ АРЕНА БОЕВ
          </CardTitle>
          <div className="text-center text-gray-400 text-sm">
            Выберите противника для боя. Доступны боты вашего уровня и на 1 уровень выше.
          </div>
        </CardHeader>
      </Card>

      {/* Поиск */}
      <Card className="panel panel--tint panel--warm">
        <CardContent className="pt-4">
          <Input
            placeholder="Поиск по имени или типу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="medieval-input text-white"
          />
        </CardContent>
      </Card>

      {/* Список ботов */}
      {filteredBots.length === 0 ? (
        <Card className="panel panel--tint panel--warm">
          <CardContent className="text-center py-8">
            <div className="text-gray-400">
              {searchQuery 
                ? 'Боты не найдены по заданным критериям'
                : 'Нет доступных ботов для вашего уровня'
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBots).map(([level, bots]) => {
            const levelNum = parseInt(level);
            
            return (
              <Card key={level} className="panel panel--tint panel--warm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Уровень {levelNum}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bots.map(bot => (
                      <div
                        key={bot.id}
                        className="panel panel--tint p-3 hover:bg-[#363640] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getBotTypeEmoji(bot.botType)}</div>
                            <div>
                              <h5 className="text-white text-sm font-medium">{bot.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Ур. {bot.level}
                                </Badge>
                                <Badge 
                                  className={`${getDifficultyColor(bot.difficulty)} text-white border-0 text-xs`}
                                >
                                  {getDifficultyText(bot.difficulty)}
                                </Badge>
                                <span className="text-gray-400 text-xs">
                                  {bot.health} HP • +{bot.experience} опыта • {bot.gold} золота
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => onChallengeBot(bot)}
                            className={`${getDifficultyColor(bot.difficulty)} text-white font-bold text-xs px-3 py-1`}
                            disabled={player.health <= 0}
                          >
                            {player.health <= 0 ? 'Нужно лечение' : 'ВЫЗОВ'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Информация о доступности */}
      <Card className="panel panel--tint panel--warm">
        <CardContent className="pt-4">
          <div className="text-center text-gray-400 text-sm">
            <div className="mb-2">
              <strong className="text-white">Правила арены:</strong>
            </div>
            <div className="space-y-1">
              <div>• Доступны боты вашего уровня ({player.level}) и на 1 уровень выше ({player.level + 1})</div>
              <div>• Каждый уровень имеет 3 типа сложности: Легкий, Средний, Сложный</div>
              <div>• Более сложные боты дают больше опыта и золота</div>
              <div>• Для боя необходимо иметь здоровье больше 0</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleArenaBotList;



