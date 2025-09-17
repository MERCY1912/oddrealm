import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bot, Player, TowerProgress } from '@/types/game';
import AncientTowerBattle from './AncientTowerBattle';
import { calculateFinalStats } from '@/utils/enhancedCharacterStats';

interface AncientTowerProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
}

const AncientTower = ({ player, onPlayerUpdate }: AncientTowerProps) => {
  const [towerProgress, setTowerProgress] = useState<TowerProgress>({
    currentFloor: 1,
    maxFloorReached: 1,
    isInTower: false,
    canRest: false
  });
  const [currentEnemy, setCurrentEnemy] = useState<Bot | null>(null);
  const [isInBattle, setIsInBattle] = useState(false);
  const [wasDefeated, setWasDefeated] = useState(false); // Флаг поражения
  const { toast } = useToast();

  // Проверяем, может ли игрок начать бой
  const canStartBattle = () => {
    const finalStats = calculateFinalStats(player, player.equipment);
    
    // Если игрок был побежден, он должен иметь полное здоровье для начала нового боя
    if (wasDefeated && player.health < finalStats.maxHealth) {
      return false;
    }
    
    return player.health > 0;
  };

  const generateEnemy = (floor: number): Bot => {
    // Базовые характеристики увеличиваются с каждым этажом
    const baseLevel = Math.floor(floor / 5) + 1;
    const levelMultiplier = 1 + (floor - 1) * 0.15;
    
    let enemy: Bot;
    
    if (floor % 10 === 0) {
      // Босс каждые 10 этажей
      const bossNames = [
        'Архангел Габриэла Великая',
        'Повелитель Теней Мордрек',
        'Древний Дракон Азурит',
        'Королева Пауков Арахния',
        'Демон Разрушения Валгрим',
        'Ледяная Ведьма Кристалла',
        'Огненный Титан Прометей',
        'Владыка Смерти Некрос',
        'Повелительница Времени Хронос',
        'Последний Страж Этерния'
      ];
      
      const bossIndex = Math.floor((floor - 1) / 10) % bossNames.length;
      
      enemy = {
        id: `boss_${floor}`,
        name: bossNames[bossIndex],
        level: baseLevel + 5,
        health: Math.floor(300 * levelMultiplier),
        maxHealth: Math.floor(300 * levelMultiplier),
        attack: Math.floor(35 * levelMultiplier),
        defense: Math.floor(20 * levelMultiplier),
        experience: Math.floor(150 * levelMultiplier),
        gold: Math.floor(300 * levelMultiplier),
        difficulty: 'boss' as const,
        image: '👑',
        floorType: 'boss'
      };
    } else {
      // Обычные противники
      const enemyNames = [
        'Теневой Ассасин',
        'Костяной Воин',
        'Проклятый Маг',
        'Древний Голем',
        'Кровавый Вампир',
        'Ледяной Элементаль',
        'Огненный Демон',
        'Призрачный Рыцарь',
        'Тёмный Некромант',
        'Каменный Страж',
        'Ядовитый Паук',
        'Молниеносный Дух',
        'Железный Голиаф',
        'Песчаный Вихрь',
        'Лунный Волк',
        'Проклятый Жрец',
        'Кристальный Страж',
        'Тёмный Эльф',
        'Костлявый Лич',
        'Адский Пёс'
      ];
      
      const randomName = enemyNames[Math.floor(Math.random() * enemyNames.length)];
      const titles = ['Могучий', 'Древний', 'Проклятый', 'Злобный', 'Мрачный', 'Свирепый'];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      
      enemy = {
        id: `enemy_${floor}`,
        name: `${randomName} ${randomTitle}`,
        level: baseLevel,
        health: Math.floor(120 * levelMultiplier),
        maxHealth: Math.floor(120 * levelMultiplier),
        attack: Math.floor(20 * levelMultiplier),
        defense: Math.floor(12 * levelMultiplier),
        experience: Math.floor(40 * levelMultiplier),
        gold: Math.floor(70 * levelMultiplier),
        difficulty: floor < 5 ? 'easy' : floor < 15 ? 'medium' : 'hard',
        image: '⚔️',
        floorType: 'normal'
      };
    }
    
    return enemy;
  };

  const enterTower = () => {
    setTowerProgress(prev => ({ ...prev, isInTower: true }));
    const enemy = generateEnemy(towerProgress.currentFloor);
    setCurrentEnemy(enemy);
    setWasDefeated(false); // Сбрасываем флаг поражения при входе
    toast({
      title: 'Вход в Башню Древних',
      description: `Вы вошли на ${towerProgress.currentFloor} этаж`,
    });
  };

  const startBattle = () => {
    if (!currentEnemy || !canStartBattle()) {
      if (wasDefeated) {
        toast({
          title: 'Нужно восстановить здоровье',
          description: 'После поражения необходимо полностью восстановить здоровье перед новым боем',
          variant: 'destructive',
        });
      }
      return;
    }
    setIsInBattle(true);
  };

  const handleBattleEnd = (victory: boolean) => {
    setIsInBattle(false);
    
    if (victory) {
      const isFloorBoss = currentEnemy?.floorType === 'boss';
      const nextFloor = towerProgress.currentFloor + 1;

      setTowerProgress(prev => ({
        ...prev,
        currentFloor: nextFloor,
        maxFloorReached: Math.max(prev.maxFloorReached, nextFloor),
        canRest: isFloorBoss
      }));

      setWasDefeated(false); // Сбрасываем флаг поражения при победе

      if (isFloorBoss) {
        toast({
          title: 'Босс повержен!',
          description: 'Вы можете восстановить здоровье и ману перед следующим этажом',
        });
      }

      setCurrentEnemy(null);
    } else {
      // Поражение - устанавливаем флаг поражения
      setWasDefeated(true);
      leaveTower();
      toast({
        title: 'Поражение в башне',
        description: 'Вы были изгнаны из башни. Восстановите здоровье перед новой попыткой!',
        variant: 'destructive',
      });
    }
  };

  const handleFlee = () => {
    leaveTower();
  };

  const restAfterBoss = () => {
    // Use enhanced character stats to get the correct max values
    const finalStats = calculateFinalStats(player, player.equipment);
    
    const updatedPlayer = {
      ...player,
      health: finalStats.maxHealth,
      mana: finalStats.maxMana,
    };
    onPlayerUpdate(updatedPlayer);
    setTowerProgress(prev => ({ ...prev, canRest: false }));
    setWasDefeated(false); // Сбрасываем флаг поражения после отдыха
    toast({
      title: 'Отдых',
      description: 'Здоровье и мана полностью восстановлены!',
    });
  };

  const proceedToNextFloor = () => {
    const enemy = generateEnemy(towerProgress.currentFloor);
    setCurrentEnemy(enemy);
  };

  const leaveTower = () => {
    setTowerProgress(prev => ({ ...prev, isInTower: false, canRest: false }));
    setCurrentEnemy(null);
    setIsInBattle(false);
    
    // Награда за пройденные этажи
    const floorsCleared = towerProgress.maxFloorReached - 1;
    if (floorsCleared > 0) {
      const goldReward = floorsCleared * 100;
      const expReward = floorsCleared * 50;
      
      const updatedPlayer = {
        ...player,
        gold: player.gold + goldReward,
        experience: player.experience + expReward,
      };
      
      onPlayerUpdate(updatedPlayer);
      
      toast({
        title: 'Награда за прохождение башни!',
        description: `Получено: ${expReward} опыта, ${goldReward} золота за ${floorsCleared} этажей`,
      });
    }
  };

  const resetTowerProgress = () => {
    setTowerProgress({
      currentFloor: 1,
      maxFloorReached: 1,
      isInTower: false,
      canRest: false
    });
    setCurrentEnemy(null);
    setIsInBattle(false);
    setWasDefeated(false); // Сбрасываем флаг поражения
  };

  if (isInBattle && currentEnemy) {
    return (
      <AncientTowerBattle
        player={player}
        enemy={currentEnemy}
        onPlayerUpdate={onPlayerUpdate}
        onBattleEnd={handleBattleEnd}
        onFlee={handleFlee}
      />
    );
  }

  // Получаем финальные характеристики для проверки здоровья
  const finalStats = calculateFinalStats(player, player.equipment);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-yellow-400">
            🏗️ БАШНЯ ДРЕВНИХ 🏗️
          </CardTitle>
          <div className="text-center text-gray-300">
            Поднимайтесь выше, чтобы получить лучшие награды!
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Информация о прогрессе */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400">Текущий этаж</div>
              <div className="text-2xl font-bold text-yellow-400">{towerProgress.currentFloor}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400">Максимальный этаж</div>
              <div className="text-2xl font-bold text-blue-400">{towerProgress.maxFloorReached}</div>
            </div>
          </div>

          {!towerProgress.isInTower ? (
            /* Экран входа в башню */
            <div className="text-center space-y-4">
              <div className="text-6xl">🏗️</div>
              <p className="text-gray-300">
                Башня Древних ждёт храбрых воинов. Каждый этаж становится сложнее предыдущего.
                Каждые 10 этажей вас ждёт сражение с могущественным боссом!
              </p>
              
              {/* Предупреждение о необходимости полного здоровья */}
              {wasDefeated && player.health < finalStats.maxHealth && (
                <Card className="bg-red-900 border-red-600">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-red-400 font-bold">⚠️ Требуется восстановление</div>
                      <p className="text-gray-300">
                        После поражения необходимо полностью восстановить здоровье перед новой попыткой.
                        Текущее здоровье: {player.health}/{finalStats.maxHealth}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-2">
                <Button 
                  onClick={enterTower}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  disabled={wasDefeated && player.health < finalStats.maxHealth}
                >
                  Войти в башню
                </Button>
                {towerProgress.maxFloorReached > 1 && (
                  <Button 
                    onClick={resetTowerProgress}
                    variant="outline"
                    className="ml-4"
                  >
                    Начать заново
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Экран башни */
            <div className="space-y-4">
              {/* Информация об этаже */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">Этаж {towerProgress.currentFloor}</h3>
                  <Badge variant="outline" className={
                    towerProgress.currentFloor % 10 === 0 ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'
                  }>
                    {towerProgress.currentFloor % 10 === 0 ? 'БОСС ЭТАЖ' : 'Обычный этаж'}
                  </Badge>
                </div>
                <Progress 
                  value={(towerProgress.currentFloor % 10) * 10} 
                  className="h-2"
                />
                <div className="text-xs text-gray-400 mt-1">
                  До босса: {10 - (towerProgress.currentFloor % 10)} этажей
                </div>
              </div>

              {/* Возможность отдыха после босса */}
              {towerProgress.canRest && (
                <Card className="bg-green-900 border-green-600">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-green-400 font-bold">Место отдыха</div>
                      <p className="text-gray-300">Вы можете восстановить здоровье и ману</p>
                      <Button 
                        onClick={restAfterBoss}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        💚 Отдохнуть
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Текущий противник */}
              {currentEnemy && (
                <Card className="bg-red-900 border-red-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-red-400">{currentEnemy.name}</h4>
                        <div className="text-sm text-gray-300">
                          Уровень {currentEnemy.level} • {currentEnemy.difficulty}
                        </div>
                      </div>
                      <div className="text-4xl">{currentEnemy.image}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                      <div className="text-red-400">❤️ {currentEnemy.health}</div>
                      <div className="text-orange-400">⚔️ {currentEnemy.attack}</div>
                      <div className="text-blue-400">🛡️ {currentEnemy.defense}</div>
                    </div>

                    {/* Предупреждение если нельзя начать бой */}
                    {!canStartBattle() && (
                      <div className="mb-4 p-2 bg-yellow-900 border border-yellow-600 rounded text-yellow-300 text-sm">
                        ⚠️ Необходимо полностью восстановить здоровье для начала боя!
                      </div>
                    )}

                    <Button 
                      onClick={startBattle}
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={!canStartBattle()}
                    >
                      ⚔️ Начать тактический бой
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Кнопки навигации */}
              {!currentEnemy && (
                <div className="flex gap-2">
                  <Button 
                    onClick={proceedToNextFloor}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    ⬆️ Следующий этаж
                  </Button>
                  <Button 
                    onClick={leaveTower}
                    variant="outline"
                    className="flex-1"
                  >
                    🚪 Покинуть башню
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AncientTower;
