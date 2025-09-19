import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Player, Dungeon, Item } from '@/types/game';
import { 
  EnhancedDungeonRun, 
  EnhancedDungeonMap, 
  EnhancedRoom,
  ExpeditionResource,
  ExplorationPoints,
  DungeonGoal,
  DungeonAffix
} from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateEnhancedDungeon } from '@/data/enhancedDungeonGenerator';
import { createExpeditionResource, consumeTorch, applyExhaustionPenalties } from '@/utils/expeditionResources';
import { createExplorationPoints, addExplorationPoints, calculateFinalRewards } from '@/utils/explorationPoints';
import { updateGoalProgress, canEnterBossRoom } from '@/data/dungeonGoals';
import { applyAffixEffects } from '@/data/dungeonAffixes';
import EnhancedDungeonUI, { RoomThreatIndicator } from './EnhancedDungeonUI';
import DungeonBattle from './DungeonBattle';
import DungeonMapComponent from './DungeonMap';
import { useSound } from '@/hooks/useSound';

interface EnhancedDungeonSystemProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onBack: () => void;
  onAddToInventory?: (item: Item) => void;
}

export default function EnhancedDungeonSystem({ 
  player, 
  onPlayerUpdate, 
  onBack, 
  onAddToInventory 
}: EnhancedDungeonSystemProps) {
  // Состояния
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRun, setActiveRun] = useState<EnhancedDungeonRun | null>(null);
  const [dungeonMap, setDungeonMap] = useState<EnhancedDungeonMap | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(new Set());
  const [roomState, setRoomState] = useState<'exploring' | 'battle' | 'event' | 'completed'>('exploring');
  const [currentEnemy, setCurrentEnemy] = useState<any>(null);

  const { toast } = useToast();
  const { sounds } = useSound();

  useEffect(() => {
    loadDungeons();
  }, []);

  const loadDungeons = async () => {
    try {
      const { data, error } = await supabase
        .from('dungeons')
        .select('*')
        .eq('is_active', true)
        .order('min_level', { ascending: true });

      if (error) throw error;
      setDungeons(data || []);
    } catch (error) {
      console.error('Error loading dungeons:', error);
      
      // Fallback data
      const fallbackDungeons = [
        {
          id: 'enhanced-catacombs',
          dungeon_id: 'enhanced_catacombs',
          name: '🔥 Улучшенные Катакомбы',
          description: 'Новая система подземелий с целями, аффиксами и ресурсами экспедиции.',
          min_level: 1,
          max_level: 10,
          difficulty: 'normal',
          rooms_count: 12,
          base_reward_gold: 200,
          base_reward_exp: 100,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'enhanced-mines',
          dungeon_id: 'enhanced_mines',
          name: '⚡ Героические Шахты',
          description: 'Более сложное подземелье с улучшенными механиками.',
          min_level: 5,
          max_level: 15,
          difficulty: 'heroic',
          rooms_count: 15,
          base_reward_gold: 400,
          base_reward_exp: 250,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setDungeons(fallbackDungeons);
      
      toast({
        title: 'Демо режим',
        description: 'Используются тестовые данные улучшенных подземелий',
      });
    } finally {
      setLoading(false);
    }
  };

  const startEnhancedDungeon = async (dungeon: Dungeon) => {
    if (player.level < dungeon.min_level) {
      toast({
        title: 'Недостаточный уровень',
        description: `Требуется уровень ${dungeon.min_level}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Генерируем улучшенное подземелье
      const enhancedMap = generateEnhancedDungeon({
        roomCount: dungeon.rooms_count,
        difficulty: dungeon.difficulty as any,
        playerLevel: player.level,
        goalType: Math.random() < 0.5 ? 'key_boss' : 'collect_shards', // Случайная цель
        affixCount: dungeon.difficulty === 'heroic' ? 3 : 2
      });

      // Создаем ресурсы экспедиции
      const expeditionResource = createExpeditionResource(player.level, enhancedMap.affixes);
      
      // Создаем очки исследования
      const explorationPoints = createExplorationPoints();

      // Создаем улучшенный забег
      const enhancedRun: EnhancedDungeonRun = {
        id: `enhanced-run-${Date.now()}`,
        player_id: player.id,
        dungeon_id: dungeon.dungeon_id,
        current_room: enhancedMap.startId,
        visited_rooms: [enhancedMap.startId],
        player_health: player.health,
        player_mana: player.mana,
        player_gold: 0,
        player_exp: 0,
        inventory_delta: {},
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goal: enhancedMap.goal,
        resources: expeditionResource,
        explorationPoints,
        affixes: enhancedMap.affixes,
        status: 'in_progress'
      };

      // Обновляем состояние
      setDungeonMap(enhancedMap);
      setActiveRun(enhancedRun);
      setCurrentRoomId(enhancedMap.startId);
      setVisitedRooms(new Set([enhancedMap.startId]));
      setRoomState('exploring');

      // Показываем информацию о подземелье
      toast({
        title: '🎯 Улучшенное подземелье начато!',
        description: `${enhancedMap.goal.description}`,
      });

      // Показываем аффиксы
      setTimeout(() => {
        const affixNames = enhancedMap.affixes.map(a => `${a.icon} ${a.name}`).join(', ');
        toast({
          title: '✨ Активные аффиксы',
          description: affixNames,
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting enhanced dungeon:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось начать улучшенное подземелье',
        variant: 'destructive',
      });
    }
  };

  const handleRoomMove = async (roomId: string) => {
    if (!dungeonMap || !activeRun) return;
    
    const targetRoom = dungeonMap.rooms[roomId];
    const currentRoom = dungeonMap.rooms[currentRoomId];
    
    if (!targetRoom || !currentRoom) return;

    // Проверяем доступность комнаты
    if (!currentRoom.neighbors.includes(roomId)) {
      toast({
        title: 'Недоступно',
        description: 'Вы можете переходить только в соседние комнаты',
        variant: 'destructive',
      });
      return;
    }

    // Проверяем блокировку (врата к боссу)
    if (targetRoom.locked && !canEnterBossRoom(activeRun.goal, 'gate')) {
      toast({
        title: 'Заперто',
        description: 'Сначала выполните цель подземелья',
        variant: 'destructive',
      });
      return;
    }

    // Проверяем состояние боя
    if (roomState === 'battle') {
      toast({
        title: 'Невозможно',
        description: 'Сначала завершите бой!',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Тратим факел на переход
      const newResources = consumeTorch(activeRun.resources);
      
      // Применяем штрафы истощения если нужно
      const { modifiedPlayer, penalties } = applyExhaustionPenalties(player, newResources);
      if (penalties.healthReduction > 0) {
        onPlayerUpdate(modifiedPlayer);
        toast({
          title: '💀 Истощение',
          description: `Факелы закончились! -${penalties.healthReduction} HP, враги наносят +${penalties.damageIncrease}% урона`,
          variant: 'destructive',
        });
      }

      // Добавляем очки исследования
      const newExplorationPoints = addExplorationPoints(
        activeRun.explorationPoints, 
        targetRoom.type
      );

      // Обновляем забег
      const updatedRun: EnhancedDungeonRun = {
        ...activeRun,
        current_room: roomId,
        visited_rooms: [...activeRun.visited_rooms, roomId],
        resources: newResources,
        explorationPoints: newExplorationPoints
      };

      // Обновляем состояние
      setActiveRun(updatedRun);
      setCurrentRoomId(roomId);
      setVisitedRooms(prev => new Set([...prev, roomId]));

      // Воспроизводим звук
      sounds.roomEnter();

      // Обрабатываем тип комнаты
      await handleRoomEnter(targetRoom, updatedRun);

    } catch (error) {
      console.error('Error moving to room:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось войти в комнату',
        variant: 'destructive',
      });
    }
  };

  const handleRoomEnter = async (room: EnhancedRoom, run: EnhancedDungeonRun) => {
    switch (room.type) {
      case 'combat':
      case 'boss':
        // Создаем врага с учетом аффиксов
        const baseEnemy = generateRoomEnemy(room, run.affixes);
        setCurrentEnemy(baseEnemy);
        setRoomState('battle');
        sounds.battleStart();
        break;

      case 'altar':
        // Восстановление здоровья с учетом аффиксов
        const healAmount = applyAffixEffects(run.affixes, {
          type: 'altar_heal',
          value: 50
        });
        
        const newHealth = Math.min(player.maxHealth, player.health + healAmount);
        onPlayerUpdate({ ...player, health: newHealth });
        
        sounds.altarHeal();
        toast({
          title: '⛪ Алтарь',
          description: `Восстановлено ${healAmount} здоровья`,
        });
        break;

      case 'trap':
        // Урон от ловушки с учетом аффиксов
        const trapDamage = applyAffixEffects(run.affixes, {
          type: 'trap_damage',
          value: 20
        });
        
        const avoidChance = player.dexterity / 100;
        if (Math.random() < avoidChance) {
          sounds.trapAvoid();
          toast({
            title: '🪤 Ловушка обезврежена',
            description: 'Вы ловко избежали ловушки!',
          });
        } else {
          const newHealth = Math.max(1, player.health - trapDamage);
          onPlayerUpdate({ ...player, health: newHealth });
          sounds.trapTrigger();
          toast({
            title: '🪤 Ловушка сработала',
            description: `Получено ${trapDamage} урона`,
            variant: 'destructive',
          });
        }
        break;

      case 'chest':
        // Сундук с сокровищами
        const chestLoot = generateChestLoot(room, run.affixes);
        
        if (chestLoot.gold > 0) {
          const updatedRun = { ...run, player_gold: run.player_gold + chestLoot.gold };
          setActiveRun(updatedRun);
        }
        
        if (chestLoot.items.length > 0 && onAddToInventory) {
          chestLoot.items.forEach(item => onAddToInventory(item));
        }
        
        sounds.chestOpen();
        toast({
          title: '💰 Сундук с сокровищами',
          description: `Найдено: ${chestLoot.gold} золота, ${chestLoot.items.length} предметов`,
        });
        break;

      case 'merchant':
        sounds.merchantGreet();
        toast({
          title: '🏪 Торговец',
          description: 'Торговец предлагает свои товары',
        });
        setRoomState('event');
        break;

      default:
        // Обычное событие
        setRoomState('event');
        break;
    }

    // Проверяем предмет цели
    if (room.goal_item) {
      const updatedGoal = updateGoalProgress(run.goal, 1);
      const updatedRun = { ...run, goal: updatedGoal };
      setActiveRun(updatedRun);
      
      toast({
        title: '🎯 Прогресс цели',
        description: `${updatedGoal.description}: ${updatedGoal.current}/${updatedGoal.required}`,
      });
      
      if (updatedGoal.completed) {
        toast({
          title: '✅ Цель выполнена!',
          description: 'Теперь вы можете войти в тронный зал',
        });
      }
    }
  };

  const handleBattleEnd = async (victory: boolean, rewards?: any) => {
    if (!activeRun) return;

    if (victory) {
      // Обновляем игрока с наградами
      if (rewards?.gold) {
        const updatedRun = { ...activeRun, player_gold: activeRun.player_gold + rewards.gold };
        setActiveRun(updatedRun);
      }
      if (rewards?.exp) {
        const updatedRun = { ...activeRun, player_exp: activeRun.player_exp + rewards.exp };
        setActiveRun(updatedRun);
      }

      sounds.victory();
      setCurrentEnemy(null);
      setRoomState('exploring');

      // Проверяем победу над боссом
      if (dungeonMap && currentRoomId === dungeonMap.bossId) {
        sounds.dungeonComplete();
        await completeDungeon();
      }
    } else {
      // Смерть игрока
      await handlePlayerDeath();
    }
  };

  const completeDungeon = async () => {
    if (!activeRun || !dungeonMap) return;

    // Рассчитываем финальные награды
    const finalRewards = calculateFinalRewards(
      dungeonMap.level * 100, // базовое золото
      dungeonMap.level * 50,  // базовый опыт
      activeRun.explorationPoints,
      activeRun.resources,
      activeRun.goal.completed
    );

    // Обновляем игрока
    const updatedPlayer = {
      ...player,
      gold: player.gold + finalRewards.finalGold,
      experience: player.experience + finalRewards.finalExp
    };
    onPlayerUpdate(updatedPlayer);

    // Сброс состояния
    setActiveRun(null);
    setDungeonMap(null);
    setCurrentRoomId('');
    setVisitedRooms(new Set());
    setRoomState('exploring');

    toast({
      title: '🏆 Подземелье завершено!',
      description: `Получено: ${finalRewards.finalGold} золота, ${finalRewards.finalExp} опыта (бонус: +${Math.round((finalRewards.explorationMultiplier - 1) * 100)}%)`,
    });
  };

  const abandonDungeon = () => {
    if (!activeRun) return;

    // Частичные награды при выходе
    const partialGold = Math.floor(activeRun.player_gold * 0.5);
    const partialExp = Math.floor(activeRun.player_exp * 0.3);

    if (partialGold > 0 || partialExp > 0) {
      const updatedPlayer = {
        ...player,
        gold: player.gold + partialGold,
        experience: player.experience + partialExp
      };
      onPlayerUpdate(updatedPlayer);
    }

    // Сброс состояния
    setActiveRun(null);
    setDungeonMap(null);
    setCurrentRoomId('');
    setVisitedRooms(new Set());
    setRoomState('exploring');

    toast({
      title: 'Подземелье покинуто',
      description: `Сохранено: ${partialGold} золота, ${partialExp} опыта`,
    });
  };

  const handlePlayerDeath = async () => {
    if (!activeRun) return;

    // Сброс состояния без наград
    setActiveRun(null);
    setDungeonMap(null);
    setCurrentRoomId('');
    setVisitedRooms(new Set());
    setRoomState('exploring');

    toast({
      title: '💀 Поражение!',
      description: 'Вы погибли в подземелье и потеряли все награды',
      variant: 'destructive',
    });
  };

  // Вспомогательные функции

  const generateRoomEnemy = (room: EnhancedRoom, affixes: DungeonAffix[]) => {
    const baseLevel = Math.max(1, player.level + (room.distance_from_start || 0) - 2);
    const baseHp = room.type === 'boss' ? 200 : 80;
    const baseAttack = room.type === 'boss' ? 30 : 15;
    
    // Применяем аффиксы
    const modifiedHp = applyAffixEffects(affixes, {
      type: 'enemy_stats',
      value: baseHp
    });

    return {
      id: `enemy_${room.id}`,
      name: room.type === 'boss' ? 'Повелитель Подземелья' : 'Страж Комнаты',
      level: baseLevel,
      health: modifiedHp,
      maxHealth: modifiedHp,
      attack: baseAttack,
      defense: 10,
      experience: baseLevel * 20,
      gold: baseLevel * 10,
      difficulty: room.threat.level === 3 ? 'hard' : room.threat.level === 2 ? 'medium' : 'easy',
      image: room.type === 'boss' ? '👑' : '⚔️'
    };
  };

  const generateChestLoot = (room: EnhancedRoom, affixes: DungeonAffix[]) => {
    const baseGold = 50 + (room.distance_from_start || 0) * 10;
    const baseItemCount = 2;
    
    // Применяем аффиксы
    const modifiedItemCount = applyAffixEffects(affixes, {
      type: 'chest_loot',
      value: baseItemCount
    });

    return {
      gold: baseGold,
      items: [] as Item[] // Упрощенная версия - без предметов пока
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">Загрузка улучшенных подземелий...</h2>
        </div>
      </div>
    );
  }

  // Активное подземелье
  if (activeRun && dungeonMap) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={abandonDungeon}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            🚪 Покинуть подземелье
          </Button>
          <div className="text-yellow-400 font-bold">
            💰 {player.gold} золота | ⚡ {dungeonMap.name}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          {/* Улучшенный UI с целями, ресурсами и аффиксами */}
          <div className="mb-6">
            <EnhancedDungeonUI 
              dungeonRun={activeRun}
              onExitDungeon={abandonDungeon}
            />
          </div>

          {/* Карта подземелья с улучшениями */}
          <div className="mb-6">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  🗺️ Карта подземелья
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DungeonMapComponent
                  dungeon={dungeonMap}
                  visited={visitedRooms}
                  current={currentRoomId}
                  onMove={handleRoomMove}
                />
                
                {/* Показываем угрозы соседних комнат */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dungeonMap.rooms[currentRoomId]?.neighbors.map(neighborId => {
                    const neighbor = dungeonMap.rooms[neighborId];
                    return (
                      <div key={neighborId} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">
                            {neighbor.type}
                          </span>
                          <RoomThreatIndicator 
                            threatLevel={neighbor.threat.level}
                            hint={neighbor.threat.hint}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Интерфейс боя */}
          {roomState === 'battle' && currentEnemy && (
            <div className="mt-6">
              <DungeonBattle
                player={player}
                enemy={currentEnemy}
                dungeonRun={activeRun}
                onBattleEnd={handleBattleEnd}
                onFlee={() => setRoomState('exploring')}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Выбор подземелья
  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={onBack}
          className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
        >
          ← Назад в город
        </Button>
        <div className="text-yellow-400 font-bold">💰 {player.gold} золота</div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          🏰 Улучшенные Подземелья
        </h1>
        
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-2">✨ Новые возможности:</h2>
          <ul className="text-gray-300 space-y-1">
            <li>🎯 <strong>Цели подземелий:</strong> Ключи, пленники, осколки</li>
            <li>🔥 <strong>Ресурсы экспедиции:</strong> Система факелов</li>
            <li>✨ <strong>Аффиксы забега:</strong> Модификаторы сложности</li>
            <li>⭐ <strong>Очки исследования:</strong> Бонусы к наградам</li>
            <li>🛡️ <strong>Система угроз:</strong> Предупреждения об опасности</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dungeons.map((dungeon) => (
            <Card key={dungeon.id} className="bg-gray-800 bg-opacity-80 border-gray-600 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white text-xl">{dungeon.name}</CardTitle>
                <p className="text-gray-300 text-sm">{dungeon.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300 mb-4">
                  <div>📊 Уровень: {dungeon.min_level}-{dungeon.max_level}</div>
                  <div>⚔️ Сложность: {dungeon.difficulty}</div>
                  <div>🏠 Комнат: {dungeon.rooms_count}</div>
                  <div>💰 Базовая награда: {dungeon.base_reward_gold} золота</div>
                  <div>⭐ Базовый опыт: {dungeon.base_reward_exp}</div>
                  <div className="text-yellow-400">✨ + бонусы от исследования!</div>
                </div>
                
                <Button
                  onClick={() => startEnhancedDungeon(dungeon)}
                  disabled={player.level < dungeon.min_level}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {player.level < dungeon.min_level 
                    ? `Требуется уровень ${dungeon.min_level}`
                    : '🚀 Начать улучшенное подземелье'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}




