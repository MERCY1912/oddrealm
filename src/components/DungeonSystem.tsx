import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Player, Dungeon, DungeonRun, DungeonRoom, DungeonEvent, DungeonEventEffects, Item, DungeonMap, Room } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DungeonBattle from './DungeonBattle';
import DungeonEventComponent from './DungeonEvent';
import DungeonMapComponent from './DungeonMap';
import DungeonAltar from './DungeonAltar';
import DungeonTrap from './DungeonTrap';
import DungeonMerchant from './DungeonMerchant';
import TreasureChest from './TreasureChest';
import { getRandomDungeonMaterial, dungeonMaterials } from '@/data/dungeonItems';
import { generateDungeon, getRoomIcon } from '@/data/dungeonGenerator';
import { generateEnhancedDungeon } from '@/data/enhancedDungeonGenerator';
import { handleRoomEnter, RoomResult } from '@/data/roomHandlers';
import { useSound } from '@/hooks/useSound';
import { dungeonTiers, getTierByNumber, getNextAvailableTier } from '@/data/dungeonTiers';
import DungeonCompletion from './DungeonCompletion';

interface DungeonSystemProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onBack: () => void;
  onAddToInventory?: (item: Item) => void;
}

const DungeonSystem = ({ player, onPlayerUpdate, onBack, onAddToInventory }: DungeonSystemProps) => {
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [activeRun, setActiveRun] = useState<DungeonRun | null>(null);
  const [currentRoom, setCurrentRoom] = useState<DungeonRoom | null>(null);
  const [currentEvent, setCurrentEvent] = useState<DungeonEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [roomState, setRoomState] = useState<'exploring' | 'battle' | 'event' | 'completed'>('exploring');
  
  // Новые состояния для системы карты
  const [dungeonMap, setDungeonMap] = useState<DungeonMap | null>(null);
  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(new Set());
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [useNewSystem, setUseNewSystem] = useState<boolean>(true); // Флаг для переключения между системами
  const [currentEnemy, setCurrentEnemy] = useState<any>(null); // Текущий враг для боя
  const [currentRoomData, setCurrentRoomData] = useState<Room | null>(null); // Данные текущей комнаты
  
  // Состояния для системы прогрессии
  const [currentTier, setCurrentTier] = useState<number>(1); // Текущий уровень подземелья
  const [completedTiers, setCompletedTiers] = useState<number[]>([]); // Завершенные уровни
  const [completionResult, setCompletionResult] = useState<any>(null); // Результат завершения
  
  const { toast } = useToast();
  const { sounds } = useSound();

  useEffect(() => {
    loadDungeons();
    checkActiveRun();
  }, []);

  const loadDungeons = async () => {
    try {
      console.log('Loading dungeons...');
      const { data, error } = await supabase
        .from('dungeons')
        .select('*')
        .eq('is_active', true)
        .order('min_level', { ascending: true });

      console.log('Dungeons query result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setDungeons(data || []);
      console.log('Dungeons loaded:', data);
    } catch (error) {
      console.error('Error loading dungeons:', error);
      
      // Fallback data for testing when database is not available
      const fallbackDungeons = [
        {
          id: 'catacombs-fallback',
          dungeon_id: 'catacombs',
          name: 'Катакомбы Ада',
          description: 'Темные катакомбы, полные нежити и древних проклятий. Только самые храбрые воины осмелятся ступить в эти залы смерти.',
          min_level: 1,
          max_level: 5,
          difficulty: 'normal',
          rooms_count: 5,
          base_reward_gold: 150,
          base_reward_exp: 75,
          background_gradient: 'linear-gradient(180deg, #2d1b2e 0%, #0f0f23 100%)',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'goblin-mines-fallback',
          dungeon_id: 'goblin_mines',
          name: 'Гоблинские Шахты',
          description: 'Заброшенные шахты, захваченные племенами гоблинов. Золото и драгоценности ждут тех, кто сможет пережить ловушки и засады.',
          min_level: 3,
          max_level: 8,
          difficulty: 'normal',
          rooms_count: 7,
          base_reward_gold: 250,
          base_reward_exp: 120,
          background_gradient: 'linear-gradient(180deg, #3e2723 0%, #1a1a1a 100%)',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'dragon-lair-fallback',
          dungeon_id: 'dragon_lair',
          name: 'Логово Дракона',
          description: 'Древнее логово огненного дракона. Горы золота и магических артефактов охраняются могучим змеем и его слугами.',
          min_level: 10,
          max_level: 20,
          difficulty: 'heroic',
          rooms_count: 10,
          base_reward_gold: 1000,
          base_reward_exp: 500,
          background_gradient: 'linear-gradient(180deg, #d32f2f 0%, #212121 100%)',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setDungeons(fallbackDungeons);
      console.log('Using fallback dungeons data');
      
      toast({
        title: 'Режим тестирования',
        description: 'Используются тестовые данные подземелий',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkActiveRun = async () => {
    try {
      const { data, error } = await supabase
        .from('dungeon_runs')
        .select('*')
        .eq('player_id', player.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('No active dungeon run or table not found:', error);
        return;
      }
      
      if (data) {
        setActiveRun(data);
        loadCurrentRoom(data.dungeon_id, data.current_room);
      }
    } catch (error) {
      console.log('Error checking active run (table may not exist):', error);
    }
  };

  const loadCurrentRoom = async (dungeonId: string, roomNumber: number) => {
    try {
      const { data, error } = await supabase
        .from('dungeon_rooms')
        .select('*')
        .eq('dungeon_id', dungeonId)
        .eq('room_number', roomNumber)
        .single();

      if (error) throw error;
      setCurrentRoom(data);
      
      // Load event data if it's an event room
      if (data.room_type === 'event' && data.event_data) {
        const { data: eventData, error: eventError } = await supabase
          .from('dungeon_events')
          .select('*')
          .eq('event_id', data.event_data.event_id)
          .single();
        
        if (!eventError && eventData) {
          setCurrentEvent(eventData);
        }
      }
    } catch (error) {
      console.error('Error loading current room:', error);
    }
  };

  const loadDemoRoom = (dungeonId: string, roomNumber: number) => {
    console.log('DungeonSystem: loadDemoRoom called with:', { dungeonId, roomNumber });
    // Demo room data for testing
    const demoRooms = {
      'catacombs': [
        {
          id: 'demo-room-1',
          dungeon_id: 'catacombs',
          room_number: 1,
          room_type: 'battle',
          enemy_data: {
            id: 'skeleton_warrior',
            name: 'Скелет-воин',
            level: 2,
            health: 80,
            maxHealth: 80,
            attack: 15,
            defense: 8,
            experience: 25,
            gold: 15,
            difficulty: 'easy',
            image: '💀'
          },
          rewards: { gold: 15, exp: 25 },
          is_boss: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-room-2',
          dungeon_id: 'catacombs',
          room_number: 2,
          room_type: 'event',
          event_data: {
            event_id: 'ancient_altar',
            name: 'Древний Алтарь',
            description: 'Вы нашли древний алтарь, излучающий магическую энергию.',
            event_type: 'rest',
            effects: { heal: 50, mana: 25 }
          },
          rewards: {},
          is_boss: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-room-3',
          dungeon_id: 'catacombs',
          room_number: 3,
          room_type: 'battle',
          enemy_data: {
            id: 'zombie',
            name: 'Зомби',
            level: 3,
            health: 120,
            maxHealth: 120,
            attack: 20,
            defense: 12,
            experience: 35,
            gold: 25,
            difficulty: 'medium',
            image: '🧟'
          },
          rewards: { gold: 25, exp: 35 },
          is_boss: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-room-4',
          dungeon_id: 'catacombs',
          room_number: 4,
          room_type: 'event',
          event_data: {
            event_id: 'treasure_chest',
            name: 'Сундук с Сокровищами',
            description: 'Вы нашли старый сундук, покрытый пылью веков.',
            event_type: 'treasure',
            effects: { 
              gold: 100, 
              exp: 50,
              items: ['iron_ingot', 'mystic_crystal'] // Будет заменено на реальные предметы
            }
          },
          rewards: {},
          is_boss: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-room-5',
          dungeon_id: 'catacombs',
          room_number: 5,
          room_type: 'battle',
          enemy_data: {
            id: 'lich_king',
            name: 'Король Лич',
            level: 5,
            health: 200,
            maxHealth: 200,
            attack: 35,
            defense: 20,
            experience: 100,
            gold: 150,
            difficulty: 'hard',
            image: '👑'
          },
          rewards: { gold: 150, exp: 100 },
          is_boss: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    const room = demoRooms[dungeonId]?.[roomNumber - 1];
    console.log('DungeonSystem: loadDemoRoom - room:', room);
    if (room) {
      // Если это событие с сокровищем, генерируем случайные предметы
      if (room.room_type === 'event' && room.event_data && room.event_data.event_type === 'treasure') {
        const randomItems = [];
        const itemCount = Math.random() < 0.5 ? 1 : 2; // 1 или 2 предмета
        
        for (let i = 0; i < itemCount; i++) {
          const material = getRandomDungeonMaterial(roomNumber, room.is_boss);
          if (material) {
            randomItems.push(material.id);
          }
        }
        
        // Обновляем событие с реальными предметами
        room.event_data = {
          ...room.event_data,
          effects: {
            ...room.event_data.effects,
            items: randomItems
          }
        };
      }
      
      setCurrentRoom(room);
      if (room.room_type === 'event' && room.event_data) {
        console.log('DungeonSystem: loadDemoRoom - setting currentEvent:', room.event_data);
        setCurrentEvent(room.event_data);
      }
    }
  };

  const startDungeon = async (dungeon: Dungeon) => {
    if (player.level < dungeon.min_level) {
      toast({
        title: 'Недостаточный уровень',
        description: `Требуется уровень ${dungeon.min_level}`,
        variant: 'destructive',
      });
      return;
    }

    if (useNewSystem) {
      // Новая система с картой и улучшениями
      try {
        // Получаем данные текущего уровня
        const tierData = getTierByNumber(currentTier);
        if (!tierData) {
          toast({
            title: 'Ошибка',
            description: 'Неизвестный уровень подземелья',
            variant: 'destructive',
          });
          return;
        }

        // Генерируем улучшенную карту подземелья
        const enhancedMap = generateEnhancedDungeon({
          roomCount: tierData.roomCount,
          difficulty: tierData.difficulty,
          playerLevel: player.level,
          goalType: Math.random() < 0.5 ? 'key_boss' : 'collect_shards',
          affixCount: tierData.affixCount
        });
        console.log('Generated enhanced dungeon map:', enhancedMap);
        console.log('Goal:', enhancedMap.goal.description);
        console.log('Affixes:', enhancedMap.affixes.map(a => a.name));
        
        setDungeonMap(enhancedMap);
        setCurrentRoomId(enhancedMap.startId);
        setVisitedRooms(new Set([enhancedMap.startId]));
        setRoomState('exploring');
        setSelectedDungeon(dungeon);

        // Создаем demo run для совместимости
        const demoRun: DungeonRun = {
          id: 'demo-run-' + Date.now(),
          player_id: player.id,
          dungeon_id: dungeon.dungeon_id,
          current_room: 1,
          player_health: player.health,
          player_mana: player.mana,
          player_gold: 0,
          player_exp: 0,
          inventory_snapshot: player.equipment,
          completed_rooms: [],
          status: 'active',
          started_at: new Date().toISOString()
        };
        setActiveRun(demoRun);

        toast({
          title: '🎯 Улучшенное подземелье начато!',
          description: enhancedMap.goal.description,
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
        console.error('Error starting dungeon:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось начать подземелье',
          variant: 'destructive',
        });
      }
    } else {
      // Старая система (для совместимости)
      try {
        // Create new dungeon run
        const { data, error } = await supabase
          .from('dungeon_runs')
          .insert({
            player_id: player.id,
            dungeon_id: dungeon.dungeon_id,
            current_room: 1,
            player_health: player.health,
            player_mana: player.mana,
            player_gold: 0,
            player_exp: 0,
            inventory_snapshot: player.equipment,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        setActiveRun(data);
        setSelectedDungeon(dungeon);
        loadCurrentRoom(dungeon.dungeon_id, 1);
        
        toast({
          title: 'Подземелье начато!',
          description: `Вы вошли в ${dungeon.name}`,
        });
      } catch (error) {
        console.error('Error starting dungeon:', error);
        
        // Fallback: Create demo dungeon run
        const demoRun: DungeonRun = {
          id: 'demo-run-' + Date.now(),
          player_id: player.id,
          dungeon_id: dungeon.dungeon_id,
          current_room: 1,
          player_health: player.health,
          player_mana: player.mana,
          player_gold: 0,
          player_exp: 0,
          inventory_snapshot: player.equipment,
          completed_rooms: [],
          status: 'active',
          started_at: new Date().toISOString()
        };

        setActiveRun(demoRun);
        setSelectedDungeon(dungeon);
        loadDemoRoom(dungeon.dungeon_id, 1);
        
        toast({
          title: 'Демо режим',
          description: `Подземелье ${dungeon.name} запущено в демо режиме`,
          variant: 'default',
        });
      }
    }
  };

  // Функция для перемещения между комнатами в новой системе
  const handleRoomMove = async (roomId: string) => {
    if (!dungeonMap || !activeRun) return;
    
    const room = dungeonMap.rooms[roomId];
    if (!room) return;

    // Проверяем, что комната является соседней
    const currentRoom = dungeonMap.rooms[currentRoomId];
    if (!currentRoom || !currentRoom.neighbors.includes(roomId)) {
      toast({
        title: 'Недоступно',
        description: 'Вы можете переходить только в соседние комнаты',
        variant: 'destructive',
      });
      return;
    }

    // Проверяем, что игрок не в бою
    if (roomState === 'battle') {
      toast({
        title: 'Невозможно',
        description: 'Сначала завершите бой!',
        variant: 'destructive',
      });
      return;
    }

    console.log('DungeonSystem: Moving to room:', roomId, room);

    // Воспроизводим звук входа в комнату
    sounds.roomEnter();

    // Обновляем состояние
    setCurrentRoomId(roomId);
    setCurrentRoomData(room);
    setVisitedRooms(prev => new Set([...prev, roomId]));

    // Обрабатываем вход в комнату
    try {
      // Передаем информацию о состоянии комнаты
      const roomWithState = {
        ...room,
        defeated: dungeonMap?.rooms[roomId]?.defeated || false,
        looted: dungeonMap?.rooms[roomId]?.looted || false,
        visited: dungeonMap?.rooms[roomId]?.visited || false
      };
      
      const result = await handleRoomEnter(roomWithState, player, activeRun.id);
      
      // Применяем изменения к игроку
      if (result.changes.health) {
        const newHealth = Math.max(0, Math.min(player.maxHealth, player.health + result.changes.health));
        onPlayerUpdate({ ...player, health: newHealth });
      }
      if (result.changes.mana) {
        const newMana = Math.max(0, Math.min(player.maxMana, player.mana + result.changes.mana));
        onPlayerUpdate({ ...player, mana: newMana });
      }
      if (result.changes.gold) {
        onPlayerUpdate({ ...player, gold: player.gold + result.changes.gold });
      }
      if (result.changes.exp) {
        onPlayerUpdate({ ...player, exp: player.exp + result.changes.exp });
      }

      // Добавляем предметы в инвентарь
      if (result.changes.items && result.changes.items.length > 0 && onAddToInventory) {
        result.changes.items.forEach(item => {
          onAddToInventory(item);
        });
      }

      // Показываем логи
      result.log.forEach(message => {
        toast({
          title: 'Событие',
          description: message,
        });
      });

      // Сохраняем данные врага для боя
      if (result.enemy) {
        setCurrentEnemy(result.enemy);
      }

      // Воспроизводим звуки в зависимости от типа события
      if (result.nextState === 'battle') {
        sounds.battleStart();
      } else if (result.nextState === 'event') {
        if (room.type === 'altar') {
          sounds.altarHeal();
        } else if (room.type === 'trap') {
          sounds.trapTrigger();
        } else if (room.type === 'merchant') {
          sounds.merchantGreet();
        } else if (room.type === 'chest') {
          sounds.chestOpen();
        }
      }

      // Определяем следующее состояние
      if (result.nextState) {
        setRoomState(result.nextState);
      } else {
        setRoomState('exploring');
      }

    } catch (error) {
      console.error('Error handling room enter:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось войти в комнату',
        variant: 'destructive',
      });
    }
  };

  const abandonDungeon = async () => {
    if (!activeRun) return;

    // Check if this is a demo run (fake ID)
    const isDemoRun = activeRun.id.startsWith('demo-run-');
    
    if (!isDemoRun) {
      try {
        const { error } = await supabase
          .from('dungeon_runs')
          .update({ 
            status: 'abandoned',
            completed_at: new Date().toISOString()
          })
          .eq('id', activeRun.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error abandoning dungeon:', error);
        // Continue with local cleanup even if DB update fails
      }
    }

    // Restore player to original state with partial rewards
    const updatedPlayer = {
      ...player,
      health: Math.max(1, activeRun.player_health),
      mana: activeRun.player_mana,
      gold: player.gold + Math.floor(activeRun.player_gold * 0.5), // 50% of earned gold
      experience: player.experience + Math.floor(activeRun.player_exp * 0.3) // 30% of earned exp
    };

    onPlayerUpdate(updatedPlayer);
    setActiveRun(null);
    setCurrentRoom(null);
    setCurrentEvent(null);
    setSelectedDungeon(null);
    setRoomState('exploring');

    toast({
      title: 'Подземелье покинуто',
      description: 'Вы покинули подземелье и сохранили часть наград',
    });
  };

  const handleRoomAction = () => {
    console.log('DungeonSystem: handleRoomAction called');
    console.log('DungeonSystem: currentRoom:', currentRoom);
    if (!currentRoom) return;

    if (currentRoom.room_type === 'battle') {
      console.log('DungeonSystem: Setting room state to battle');
      setRoomState('battle');
    } else if (currentRoom.room_type === 'event') {
      console.log('DungeonSystem: Setting room state to event');
      setRoomState('event');
    }
  };

  const handleBattleEnd = async (victory: boolean, rewards?: any) => {
    if (!activeRun) return;

    if (victory) {
      // Update player with rewards
      if (rewards?.gold) {
        onPlayerUpdate({ ...player, gold: player.gold + rewards.gold });
      }
      if (rewards?.exp) {
        onPlayerUpdate({ ...player, exp: player.exp + rewards.exp });
      }

      // Воспроизводим звук победы
      sounds.victory();

      // Show victory message
      toast({
        title: 'Победа!',
        description: `Вы победили ${currentEnemy?.name || 'врага'}!`,
      });

      // Отмечаем монстра как побежденного
      if (dungeonMap && currentRoomId && dungeonMap.rooms[currentRoomId]) {
        const updatedRooms = { ...dungeonMap.rooms };
        updatedRooms[currentRoomId] = {
          ...updatedRooms[currentRoomId],
          defeated: true,
          visited: true
        };
        setDungeonMap({ ...dungeonMap, rooms: updatedRooms });
      }

      // Clear current enemy and return to exploring
      setCurrentEnemy(null);
      setRoomState('exploring');

      // Check if this was a boss room
      if (dungeonMap && currentRoomId === dungeonMap.bossId) {
        // Boss defeated - dungeon completed
        sounds.dungeonComplete();
        await handleDungeonCompletion();
      }
    } else {
      // Player died
      await handlePlayerDeath();
    }
  };

  // Функции для обработки событий
  const handleAltarHeal = (amount: number) => {
    const newHealth = Math.min(player.maxHealth, player.health + amount);
    onPlayerUpdate({ ...player, health: newHealth });
    sounds.altarHeal();
    toast({
      title: 'Исцеление',
      description: `Восстановлено ${amount} здоровья`,
    });
  };

  const handleAltarMana = (amount: number) => {
    const newMana = Math.min(player.maxMana, player.mana + amount);
    onPlayerUpdate({ ...player, mana: newMana });
    sounds.altarHeal();
    toast({
      title: 'Восстановление маны',
      description: `Восстановлено ${amount} маны`,
    });
  };

  const handleTrapDamage = (amount: number) => {
    const newHealth = Math.max(1, player.health - amount);
    onPlayerUpdate({ ...player, health: newHealth });
    sounds.trapTrigger();
    toast({
      title: 'Урон от ловушки',
      description: `Получено ${amount} урона`,
      variant: 'destructive',
    });
  };

  const handleMerchantPurchase = (item: Item, price: number) => {
    if (player.gold >= price) {
      onPlayerUpdate({ ...player, gold: player.gold - price });
      if (onAddToInventory) {
        onAddToInventory(item);
      }
      sounds.merchantGreet();
      toast({
        title: 'Покупка',
        description: `Куплено: ${item.name}`,
      });
    }
  };

  const handleEventComplete = async (effects: DungeonEventEffects) => {
    console.log('DungeonSystem: handleEventComplete called with effects:', effects);
    if (!activeRun) {
      console.log('DungeonSystem: No active run, returning');
      return;
    }

    // Отмечаем сундук как разграбленный, если это событие сундука
    if (currentRoomData?.type === 'chest' && dungeonMap && currentRoomId) {
      const updatedRooms = { ...dungeonMap.rooms };
      updatedRooms[currentRoomId] = {
        ...updatedRooms[currentRoomId],
        looted: true,
        visited: true
      };
      setDungeonMap({ ...dungeonMap, rooms: updatedRooms });
    }

    // Apply effects to player
    let newHealth = player.health;
    let newMana = player.mana;
    let newGold = activeRun.player_gold;
    let newExp = activeRun.player_exp;

    if (effects.heal) {
      newHealth = Math.min(player.maxHealth, player.health + effects.heal);
    }
    if (effects.mana) {
      newMana = Math.min(player.maxMana, player.mana + effects.mana);
    }
    if (effects.damage) {
      newHealth = Math.max(1, player.health - effects.damage);
    }
    if (effects.gold) {
      newGold += effects.gold;
    }
    if (effects.exp) {
      newExp += effects.exp;
    }

    // Handle items from events
    if (effects.items && effects.items.length > 0 && onAddToInventory) {
      console.log('DungeonSystem: Adding items to inventory:', effects.items);
      effects.items.forEach(itemId => {
        const material = dungeonMaterials.find(m => m.id === itemId);
        if (material) {
          // Create a copy with unique ID
          const itemToAdd: Item = {
            ...material,
            id: `${material.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          onAddToInventory(itemToAdd);
        }
      });
    }

    // Update player
    const updatedPlayer = {
      ...player,
      health: newHealth,
      mana: newMana
    };
    onPlayerUpdate(updatedPlayer);

    // Update dungeon run
    const isDemoRun = activeRun.id.startsWith('demo-run-');
    
    if (!isDemoRun) {
      try {
        const { error } = await supabase
          .from('dungeon_runs')
          .update({
            player_gold: newGold,
            player_exp: newExp
          })
          .eq('id', activeRun.id);

        if (error) throw error;

        setActiveRun(prev => prev ? { ...prev, player_gold: newGold, player_exp: newExp } : null);
      } catch (error) {
        console.error('Error updating dungeon run:', error);
        
        // Fallback for demo mode
        setActiveRun(prev => prev ? { ...prev, player_gold: newGold, player_exp: newExp } : null);
      }
    } else {
      // Demo mode - just update local state
      setActiveRun(prev => prev ? { ...prev, player_gold: newGold, player_exp: newExp } : null);
    }

    // Move to next room
    const nextRoom = activeRun.current_room + 1;
    console.log('DungeonSystem: Moving to next room:', nextRoom, 'of', selectedDungeon!.rooms_count);
    if (nextRoom > selectedDungeon!.rooms_count) {
      console.log('DungeonSystem: Completing dungeon');
      await completeDungeon();
    } else {
      console.log('DungeonSystem: Moving to next room');
      await moveToNextRoom(nextRoom);
    }
    console.log('DungeonSystem: handleEventComplete completed');
  };

  const moveToNextRoom = async (roomNumber: number) => {
    if (!activeRun) return;

    const isDemoRun = activeRun.id.startsWith('demo-run-');
    
    if (!isDemoRun) {
      try {
        const { error } = await supabase
          .from('dungeon_runs')
          .update({
            current_room: roomNumber,
            completed_rooms: [...activeRun.completed_rooms, activeRun.current_room]
          })
          .eq('id', activeRun.id);

        if (error) throw error;

        setActiveRun(prev => prev ? {
          ...prev,
          current_room: roomNumber,
          completed_rooms: [...prev.completed_rooms, prev.current_room]
        } : null);

        loadCurrentRoom(activeRun.dungeon_id, roomNumber);
      } catch (error) {
        console.error('Error moving to next room:', error);
        
        // Fallback for demo mode
        setActiveRun(prev => prev ? {
          ...prev,
          current_room: roomNumber,
          completed_rooms: [...prev.completed_rooms, prev.current_room]
        } : null);

        loadDemoRoom(activeRun.dungeon_id, roomNumber);
      }
    } else {
      // Demo mode - just update local state
      setActiveRun(prev => prev ? {
        ...prev,
        current_room: roomNumber,
        completed_rooms: [...prev.completed_rooms, prev.current_room]
      } : null);

      loadDemoRoom(activeRun.dungeon_id, roomNumber);
    }
    
    setRoomState('exploring');
    // Don't clear currentEvent here - let loadDemoRoom set it if needed

    toast({
      title: 'Комната пройдена!',
      description: `Переходим к комнате ${roomNumber}`,
    });
  };

  const completeDungeon = async () => {
    if (!activeRun || !selectedDungeon) return;

    const isDemoRun = activeRun.id.startsWith('demo-run-');
    
    if (!isDemoRun) {
      try {
        const { error } = await supabase
          .from('dungeon_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_rooms: [...activeRun.completed_rooms, activeRun.current_room]
          })
          .eq('id', activeRun.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error completing dungeon:', error);
        // Continue with local completion even if DB update fails
      }
    }

    // Apply final rewards
    const finalRewards = {
      gold: activeRun.player_gold + selectedDungeon.base_reward_gold,
      exp: activeRun.player_exp + selectedDungeon.base_reward_exp
    };

    const updatedPlayer = {
      ...player,
      gold: player.gold + finalRewards.gold,
      experience: player.experience + finalRewards.exp
    };

    onPlayerUpdate(updatedPlayer);

    // Reset state
    setActiveRun(null);
    setCurrentRoom(null);
    setCurrentEvent(null);
    setSelectedDungeon(null);
    setRoomState('exploring');

    toast({
      title: 'Подземелье завершено!',
      description: `Получено: ${finalRewards.gold} золота, ${finalRewards.exp} опыта`,
    });
  };

  const handleDungeonCompletion = async () => {
    if (!activeRun || !dungeonMap) return;

    const tierData = getTierByNumber(currentTier);
    if (!tierData) return;

    // Вычисляем награды
    const baseGold = tierData.baseRewardMultiplier * 100;
    const baseExp = tierData.baseRewardMultiplier * 50;
    const explorationBonus = visitedRooms.size / Object.keys(dungeonMap.rooms).length;
    
    const finalGold = Math.floor(baseGold * (1 + explorationBonus * 0.5));
    const finalExp = Math.floor(baseExp * (1 + explorationBonus * 0.5));

    // Обновляем игрока
    const updatedPlayer = {
      ...player,
      gold: player.gold + finalGold,
      experience: player.experience + finalExp
    };
    onPlayerUpdate(updatedPlayer);

    // Обновляем прогресс
    const newCompletedTiers = [...completedTiers];
    if (!newCompletedTiers.includes(currentTier)) {
      newCompletedTiers.push(currentTier);
    }
    setCompletedTiers(newCompletedTiers);

    // Проверяем, разблокирован ли новый уровень
    const nextTier = getNextAvailableTier(updatedPlayer.level, newCompletedTiers);
    const tierUnlocked = nextTier && !newCompletedTiers.includes(nextTier.tier);

    // Создаем результат завершения
    const result = {
      success: true,
      tier: currentTier,
      rewards: {
        gold: finalGold,
        exp: finalExp,
        items: [] // TODO: Добавить предметы
      },
      progress: {
        tierUnlocked: !!tierUnlocked,
        newTier: tierUnlocked ? nextTier?.tier : undefined,
        achievements: generateAchievements(currentTier, newCompletedTiers.length)
      }
    };

    setCompletionResult(result);
    setRoomState('completed');
  };

  const generateAchievements = (tier: number, totalCompleted: number): string[] => {
    const achievements: string[] = [];
    
    if (tier === 1) {
      achievements.push('Первый шаг - завершили первое подземелье!');
    }
    
    if (totalCompleted === 3) {
      achievements.push('Опытный искатель - завершили 3 подземелья!');
    }
    
    if (totalCompleted === 5) {
      achievements.push('Мастер подземелий - завершили 5 подземелий!');
    }
    
    if (tier >= 5) {
      achievements.push('Покоритель глубин - достигли высоких уровней!');
    }
    
    return achievements;
  };

  const handleContinueToNextTier = () => {
    if (completionResult?.progress?.newTier) {
      setCurrentTier(completionResult.progress.newTier);
      setCompletionResult(null);
      setRoomState('exploring');
      
      // Сбрасываем состояние подземелья
      setActiveRun(null);
      setDungeonMap(null);
      setCurrentRoomId('');
      setVisitedRooms(new Set());
      setCurrentEnemy(null);
      setCurrentRoomData(null);
      
      toast({
        title: 'Новый уровень!',
        description: `Переходим к уровню ${completionResult.progress.newTier}`,
      });
    }
  };

  const handleReturnToTown = () => {
    setCompletionResult(null);
    setRoomState('exploring');
    
    // Сбрасываем состояние подземелья
    setActiveRun(null);
    setDungeonMap(null);
    setCurrentRoomId('');
    setVisitedRooms(new Set());
    setCurrentEnemy(null);
    setCurrentRoomData(null);
    
    onBack();
  };

  const handlePlayerDeath = async () => {
    if (!activeRun) return;

    const isDemoRun = activeRun.id.startsWith('demo-run-');
    
    if (!isDemoRun) {
      try {
        const { error } = await supabase
          .from('dungeon_runs')
          .update({
            status: 'died',
            completed_at: new Date().toISOString()
          })
          .eq('id', activeRun.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error handling player death:', error);
        // Continue with local cleanup even if DB update fails
      }
    }

    // Restore player to original state (no rewards)
    const updatedPlayer = {
      ...player,
      health: Math.max(1, activeRun.player_health),
      mana: activeRun.player_mana
    };

    onPlayerUpdate(updatedPlayer);

    // Reset state
    setActiveRun(null);
    setCurrentRoom(null);
    setCurrentEvent(null);
    setSelectedDungeon(null);
    setRoomState('exploring');

    toast({
      title: 'Поражение!',
      description: 'Вы погибли в подземелье и потеряли все награды',
      variant: 'destructive',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">Загрузка подземелий...</h2>
        </div>
      </div>
    );
  }

  // Показываем экран завершения подземелья
  if (completionResult) {
    const tierData = getTierByNumber(completionResult.tier);
    if (tierData) {
      return (
        <DungeonCompletion
          result={completionResult}
          currentTier={tierData}
          onContinue={handleContinueToNextTier}
          onReturnToTown={handleReturnToTown}
        />
      );
    }
  }

  // If player has active dungeon run, show dungeon interface
  if (activeRun) {
    // Новая система с картой
    if (useNewSystem && dungeonMap) {
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
              💰 {player.gold} золота | 
              ⚔️ {dungeonMap.name} | 
              🏠 Комната {currentRoomId}
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {/* Показываем улучшенный интерфейс если карта поддерживает новые возможности */}
            {dungeonMap.goal && dungeonMap.affixes && (
              <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Цель подземелья */}
                  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dungeonMap.goal.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Цель</h3>
                        <p className="text-gray-300 text-sm">{dungeonMap.goal.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="bg-gray-700 rounded-full h-2 flex-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${(dungeonMap.goal.current / dungeonMap.goal.required) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-white">
                            {dungeonMap.goal.current}/{dungeonMap.goal.required}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Активные аффиксы */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <span>✨</span>
                      Аффиксы
                    </h3>
                    <div className="space-y-1">
                      {dungeonMap.affixes.slice(0, 2).map((affix, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span>{affix.icon}</span>
                          <span className={`text-xs ${affix.positive ? 'text-green-400' : 'text-red-400'}`}>
                            {affix.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Прогресс исследования */}
                  <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <span>🗺️</span>
                      Исследование
                    </h3>
                    <div className="text-sm text-gray-300">
                      <div>Комнат: <span className="text-yellow-400 font-bold">{visitedRooms.size}</span>/{Object.keys(dungeonMap.rooms).length}</div>
                      <div className="text-green-400 mt-1">Бонус: +15% награды</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Карта подземелья */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <span className="animate-pulse">🗺️</span>
                  Карта подземелья
                </h2>
                <div className="text-sm text-gray-400">
                  Исследовано комнат: <span className="text-yellow-400 font-bold">{visitedRooms.size}</span> из <span className="text-yellow-400 font-bold">{Object.keys(dungeonMap.rooms).length}</span>
                </div>
              </div>
              <DungeonMapComponent
                dungeon={dungeonMap}
                visited={visitedRooms}
                current={currentRoomId}
                onMove={handleRoomMove}
              />
            </div>

            {/* Интерфейс текущей комнаты */}
            {roomState === 'battle' && currentEnemy && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    ⚔️ Бой с {currentEnemy.name}
                  </h3>
                  <Button
                    onClick={() => {
                      setCurrentEnemy(null);
                      setRoomState('exploring');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                    variant="outline"
                  >
                    🗺️ Вернуться к карте
                  </Button>
                </div>
                <DungeonBattle
                  player={player}
                  enemy={currentEnemy}
                  dungeonRun={activeRun}
                  onBattleEnd={handleBattleEnd}
                  onFlee={() => setRoomState('exploring')}
                />
              </div>
            )}

            {roomState === 'event' && currentRoomData && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {getRoomIcon(currentRoomData.type)} {currentRoomData.type}
                </h3>
                
                {/* Рендерим соответствующий компонент в зависимости от типа комнаты */}
                {currentRoomData.type === 'altar' && (
                  <DungeonAltar
                    player={player}
                    onHeal={handleAltarHeal}
                    onManaRestore={handleAltarMana}
                    onComplete={() => setRoomState('exploring')}
                    onSkip={() => setRoomState('exploring')}
                  />
                )}
                
                {currentRoomData.type === 'trap' && (
                  <DungeonTrap
                    player={player}
                    onDamage={handleTrapDamage}
                    onComplete={() => setRoomState('exploring')}
                    onSkip={() => setRoomState('exploring')}
                  />
                )}
                
                {currentRoomData.type === 'merchant' && (
                  <DungeonMerchant
                    player={player}
                    onPurchase={handleMerchantPurchase}
                    onComplete={() => setRoomState('exploring')}
                    onSkip={() => setRoomState('exploring')}
                  />
                )}
                
                {currentRoomData.type === 'chest' && (
                  <TreasureChest
                    player={player}
                    event={currentEvent || {
                      event_id: 'treasure_chest',
                      name: 'Сундук с Сокровищами',
                      description: 'Вы нашли старый сундук, покрытый пылью веков.',
                      event_type: 'treasure',
                      effects: { 
                        gold: 100, 
                        exp: 50,
                        items: []
                      }
                    }}
                    onEventComplete={handleEventComplete}
                    onSkip={() => setRoomState('exploring')}
                    onAddToInventory={onAddToInventory}
                  />
                )}
                
                {/* Для других типов событий используем старый компонент */}
                {!['altar', 'trap', 'merchant', 'chest'].includes(currentRoomData.type) && currentEvent && (
                  <DungeonEventComponent
                    player={player}
                    event={currentEvent}
                    onEventComplete={handleEventComplete}
                    onSkip={() => setRoomState('exploring')}
                    onAddToInventory={onAddToInventory}
                  />
                )}
              </div>
            )}

            {roomState === 'exploring' && (
              <div className="mt-6 text-center">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                    <span className="animate-pulse">🗺️</span>
                    Исследование
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Выберите комнату на карте для продолжения исследования
                  </p>
                  <div className="text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
                    <span>📍</span>
                    Доступные комнаты: <span className="text-yellow-400 font-bold">{dungeonMap.rooms[currentRoomId]?.neighbors.length || 0}</span>
                  </div>
                  
                  {/* Показываем доступные комнаты */}
                  {dungeonMap.rooms[currentRoomId]?.neighbors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                        <span>🛤️</span>
                        Доступные пути:
                      </h4>
                      <div className="flex flex-wrap justify-center gap-3">
                        {dungeonMap.rooms[currentRoomId].neighbors.map(neighborId => {
                          const neighbor = dungeonMap.rooms[neighborId];
                          const isVisited = visitedRooms.has(neighborId);
                          return (
                            <div
                              key={neighborId}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
                                isVisited 
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:shadow-lg hover:shadow-gray-500/25'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getRoomIcon(neighbor.type, true)}</span>
                                <span className="font-medium">{neighbor.type}</span>
                                {isVisited && <span className="text-xs opacity-75">(посещено)</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Старая система (для совместимости)
    if (currentRoom) {
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
              💰 {player.gold + activeRun.player_gold} золота | 
              ⚔️ Комната {activeRun.current_room}/{selectedDungeon?.rooms_count}
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <DungeonRoomInterface
              player={player}
              dungeonRun={activeRun}
              currentRoom={currentRoom}
              currentEvent={currentEvent}
              roomState={roomState}
              onRoomAction={handleRoomAction}
              onBattleEnd={handleBattleEnd}
              onEventComplete={handleEventComplete}
              onAddToInventory={onAddToInventory}
            />
          </div>
        </div>
      );
    }
  }

  // Show dungeon selection
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
          🏰 Подземелья
        </h1>
        
        {/* Переключатель систем */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 p-2 rounded-lg">
            <div className="flex space-x-2">
              <Button
                onClick={() => setUseNewSystem(true)}
                className={`px-4 py-2 ${
                  useNewSystem 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🗺️ Новая система (с картой)
              </Button>
              <Button
                onClick={() => setUseNewSystem(false)}
                className={`px-4 py-2 ${
                  !useNewSystem 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📜 Классическая система
              </Button>
            </div>
          </div>
        </div>
        
        {/* Информация о новых возможностях */}
        {useNewSystem && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 mb-8">
            <h2 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2">
              ✨ Новая система подземелий
              <span className="text-xs bg-purple-600 px-2 py-1 rounded-full">BETA</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p>🎯 <strong>Цели подземелий:</strong> Найдите ключи, спасите пленников или соберите осколки</p>
                <p>🔥 <strong>Система факелов:</strong> Управляйте ресурсами экспедиции</p>
              </div>
              <div>
                <p>⭐ <strong>Очки исследования:</strong> Получайте бонусы за тщательное исследование</p>
                <p>🛡️ <strong>Система угроз:</strong> Видите уровень опасности комнат</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Отображение доступных уровней подземелий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dungeonTiers.map((tier) => {
            const isUnlocked = !tier.unlockRequirement || 
              (completedTiers.length >= tier.unlockRequirement.completedTiers && 
               player.level >= tier.unlockRequirement.playerLevel);
            const isCompleted = completedTiers.includes(tier.tier);
            const isCurrent = currentTier === tier.tier;
            
            return (
              <Card key={tier.tier} className={`bg-gray-800 bg-opacity-80 border-gray-600 ${
                isCurrent ? 'ring-2 ring-yellow-400' : ''
              }`}>
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    {isCompleted && <span className="text-green-400">✅</span>}
                    {isCurrent && <span className="text-yellow-400">🎯</span>}
                    {tier.name}
                  </CardTitle>
                  <p className="text-gray-300 text-sm">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <div>📊 Уровень: {tier.minPlayerLevel}+</div>
                    <div>⚔️ Сложность: {tier.difficulty}</div>
                    <div>🏠 Комнат: {tier.roomCount}</div>
                    <div>💰 Множитель наград: {tier.baseRewardMultiplier}x</div>
                    <div>👹 Бонус уровня врагов: +{tier.enemyLevelBonus}</div>
                    <div>✨ Аффиксов: {tier.affixCount}</div>
                  </div>
                  
                  {!isUnlocked && tier.unlockRequirement && (
                    <div className="text-red-400 text-sm mb-4">
                      🔒 Требуется: {tier.unlockRequirement.completedTiers} завершенных подземелий, 
                      уровень {tier.unlockRequirement.playerLevel}
                    </div>
                  )}
                  
                  <Button
                    onClick={() => {
                      setCurrentTier(tier.tier);
                      startDungeon(dungeons[0]); // Используем первое подземелье как базу
                    }}
                    disabled={!isUnlocked}
                    className={`w-full ${
                      isCurrent 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : isCompleted
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {!isUnlocked 
                      ? '🔒 Заблокировано'
                      : isCurrent
                      ? '🎯 Текущий уровень'
                      : isCompleted
                      ? '✅ Повторить'
                      : '🚀 Начать'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Component for individual dungeon room
interface DungeonRoomInterfaceProps {
  player: Player;
  dungeonRun: DungeonRun;
  currentRoom: DungeonRoom;
  currentEvent: DungeonEvent | null;
  roomState: 'exploring' | 'battle' | 'event' | 'completed';
  onRoomAction: () => void;
  onBattleEnd: (victory: boolean, rewards?: any) => void;
  onEventComplete: (effects: DungeonEventEffects) => void;
  onAddToInventory?: (item: Item) => void;
}

const DungeonRoomInterface = ({ 
  player, 
  dungeonRun, 
  currentRoom, 
  currentEvent,
  roomState,
  onRoomAction,
  onBattleEnd,
  onEventComplete,
  onAddToInventory
}: DungeonRoomInterfaceProps) => {
  const { toast } = useToast();

  if (roomState === 'battle' && currentRoom.enemy_data) {
    return (
      <DungeonBattle
        player={player}
        enemy={currentRoom.enemy_data}
        dungeonRun={dungeonRun}
        onBattleEnd={onBattleEnd}
        onFlee={() => {
          toast({
            title: 'Побег невозможен',
            description: 'В подземельях нельзя убежать от боя!',
            variant: 'destructive',
          });
        }}
      />
    );
  }

  if (roomState === 'event' && currentEvent) {
    console.log('DungeonSystem: Rendering DungeonEventComponent');
    console.log('DungeonSystem: currentEvent:', currentEvent);
    console.log('DungeonSystem: onEventComplete function:', onEventComplete);
    return (
      <DungeonEventComponent
        player={player}
        event={currentEvent}
        onEventComplete={onEventComplete}
        onSkip={() => {
          toast({
            title: 'Событие пропущено',
            description: 'Вы решили не взаимодействовать с событием',
          });
          onEventComplete({});
        }}
        onAddToInventory={onAddToInventory}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 bg-opacity-80 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Комната {dungeonRun.current_room}
            {currentRoom.is_boss && <span className="text-red-400 ml-2">👑 БОСС!</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-gray-300 text-lg">
              {currentRoom.room_type === 'battle' && '⚔️ Вы встретили врага!'}
              {currentRoom.room_type === 'event' && '🎲 Вы нашли событие!'}
              {currentRoom.room_type === 'treasure' && '💰 Вы нашли сокровище!'}
            </div>
            
            {currentRoom.room_type === 'battle' && currentRoom.enemy_data && (
              <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg">
                <div className="text-white font-bold text-xl">
                  {currentRoom.enemy_data.image} {currentRoom.enemy_data.name} [{currentRoom.enemy_data.level}]
                </div>
                <div className="text-gray-300">
                  HP: {currentRoom.enemy_data.health}/{currentRoom.enemy_data.maxHealth} | 
                  Атака: {currentRoom.enemy_data.attack} | 
                  Защита: {currentRoom.enemy_data.defense}
                </div>
                <div className="text-yellow-400 mt-2">
                  Награда: {currentRoom.enemy_data.gold} золота, {currentRoom.enemy_data.experience} опыта
                </div>
              </div>
            )}
            
            {currentRoom.room_type === 'event' && currentEvent && (
              <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
                <div className="text-white font-bold text-xl">
                  {currentEvent.name}
                </div>
                <div className="text-gray-300">
                  {currentEvent.description}
                </div>
              </div>
            )}
            
            <Button
              onClick={onRoomAction}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              {currentRoom.room_type === 'battle' ? 'Начать бой' : 'Исследовать'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DungeonSystem;
