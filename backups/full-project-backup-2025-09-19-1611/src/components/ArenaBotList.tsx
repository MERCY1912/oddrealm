import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArenaBotComponent from './ArenaBot';
import { ArenaBot, ArenaBotDifficulty, PlayerProfile } from '@/types/game';
import { getAvailableArenaBots, getArenaBotsByLevelAndDifficulty } from '@/data/arenaBots';

interface ArenaBotListProps {
  player: PlayerProfile;
  onChallengeBot: (bot: ArenaBot) => void;
  className?: string;
}

const ArenaBotList = ({ player, onChallengeBot, className = '' }: ArenaBotListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ArenaBotDifficulty | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

  // Получаем доступных ботов для игрока
  const availableBots = useMemo(() => {
    return getAvailableArenaBots(player.level);
  }, [player.level]);

  // Фильтруем ботов по выбранным критериям
  const filteredBots = useMemo(() => {
    let filtered = availableBots;

    // Фильтр по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bot => 
        bot.name.toLowerCase().includes(query) ||
        bot.description.toLowerCase().includes(query) ||
        bot.botType.toLowerCase().includes(query)
      );
    }

    // Фильтр по сложности
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(bot => bot.difficulty === selectedDifficulty);
    }

    // Фильтр по уровню
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(bot => bot.level === selectedLevel);
    }

    return filtered;
  }, [availableBots, searchQuery, selectedDifficulty, selectedLevel]);

  // Группируем ботов по уровню и сложности
  const groupedBots = useMemo(() => {
    const groups: { [key: string]: ArenaBot[] } = {};
    
    filteredBots.forEach(bot => {
      const key = `level-${bot.level}-${bot.difficulty}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(bot);
    });

    return groups;
  }, [filteredBots]);

  // Получаем уникальные уровни и сложности для фильтров
  const availableLevels = useMemo(() => {
    return [...new Set(availableBots.map(bot => bot.level))].sort((a, b) => a - b);
  }, [availableBots]);

  const availableDifficulties = useMemo(() => {
    return [...new Set(availableBots.map(bot => bot.difficulty))];
  }, [availableBots]);

  const getDifficultyColor = (difficulty: ArenaBotDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
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

      {/* Фильтры */}
      <Card className="panel panel--tint panel--warm">
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Поиск */}
            <div>
              <Input
                placeholder="Поиск по имени, описанию или типу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="medieval-input text-white"
              />
            </div>

            {/* Фильтры по уровню и сложности */}
            <div className="flex flex-wrap gap-2">
              {/* Фильтр по уровню */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Уровень:</span>
                <Button
                  variant={selectedLevel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel('all')}
                  className="text-xs"
                >
                  Все
                </Button>
                {availableLevels.map(level => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                    className="text-xs"
                  >
                    {level}
                  </Button>
                ))}
              </div>

              {/* Фильтр по сложности */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Сложность:</span>
                <Button
                  variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty('all')}
                  className="text-xs"
                >
                  Все
                </Button>
                {availableDifficulties.map(difficulty => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`text-xs ${getDifficultyColor(difficulty)}`}
                  >
                    {getDifficultyText(difficulty)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Результаты поиска */}
      {filteredBots.length === 0 ? (
        <Card className="panel panel--tint panel--warm">
          <CardContent className="text-center py-8">
            <div className="text-gray-400">
              {searchQuery || selectedDifficulty !== 'all' || selectedLevel !== 'all' 
                ? 'Боты не найдены по заданным критериям'
                : 'Нет доступных ботов для вашего уровня'
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Группировка по уровню и сложности */}
          {Object.entries(groupedBots).map(([groupKey, bots]) => {
            const [_, level, difficulty] = groupKey.split('-');
            const levelNum = parseInt(level);
            
            return (
              <div key={groupKey}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-white font-bold text-lg">
                    Уровень {levelNum}
                  </h3>
                  <Badge className={`${getDifficultyColor(difficulty as ArenaBotDifficulty)} bg-gray-700`}>
                    {getDifficultyText(difficulty as ArenaBotDifficulty)}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    ({bots.length} ботов)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bots.map(bot => (
                    <ArenaBotComponent
                      key={bot.id}
                      bot={bot}
                      onChallenge={onChallengeBot}
                      playerHealth={player.health}
                    />
                  ))}
                </div>
              </div>
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

export default ArenaBotList;



