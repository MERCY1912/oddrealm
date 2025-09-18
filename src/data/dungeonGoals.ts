import { DungeonGoal, DungeonGoalType } from '@/types/game';

// Базовые цели подземелий
export const DUNGEON_GOALS: Record<DungeonGoalType, Omit<DungeonGoal, 'current' | 'completed'>> = {
  key_boss: {
    type: 'key_boss',
    description: '🔑 Найдите Ключ Стража и откройте тронный зал',
    icon: '🔑',
    required: 1
  },
  
  rescue_prisoner: {
    type: 'rescue_prisoner',
    description: '👤 Спасите пленника из темницы',
    icon: '👤',
    required: 1
  },
  
  collect_shards: {
    type: 'collect_shards',
    description: '💎 Соберите 3 осколка древней силы',
    icon: '💎',
    required: 3
  }
};

// Функция создания цели для забега
export function createDungeonGoal(type: DungeonGoalType): DungeonGoal {
  const baseGoal = DUNGEON_GOALS[type];
  return {
    ...baseGoal,
    current: 0,
    completed: false
  };
}

// Функция обновления прогресса цели
export function updateGoalProgress(goal: DungeonGoal, increment: number = 1): DungeonGoal {
  const newCurrent = Math.min(goal.current + increment, goal.required);
  return {
    ...goal,
    current: newCurrent,
    completed: newCurrent >= goal.required
  };
}

// Функция проверки можно ли войти в комнату босса
export function canEnterBossRoom(goal: DungeonGoal, roomType: 'boss' | 'gate'): boolean {
  if (roomType === 'boss') {
    return goal.completed;
  }
  
  if (roomType === 'gate') {
    // Врата открываются только при выполненной цели
    return goal.completed;
  }
  
  return true;
}

// Функция получения случайной цели
export function getRandomGoalType(seed?: number): DungeonGoalType {
  const goalTypes: DungeonGoalType[] = ['key_boss', 'rescue_prisoner', 'collect_shards'];
  
  if (seed) {
    const rng = mulberry32(seed);
    const index = Math.floor(rng() * goalTypes.length);
    return goalTypes[index];
  }
  
  return goalTypes[Math.floor(Math.random() * goalTypes.length)];
}

// Функция определения какие комнаты должны содержать предметы цели
export function getGoalRoomRequirements(goalType: DungeonGoalType): {
  itemType: 'key' | 'shard' | 'prisoner';
  count: number;
  roomTypes: ('combat' | 'chest' | 'event')[];
} {
  switch (goalType) {
    case 'key_boss':
      return {
        itemType: 'key',
        count: 1,
        roomTypes: ['combat'] // ключ только в боевых комнатах на концах веток
      };
      
    case 'collect_shards':
      return {
        itemType: 'shard',
        count: 3,
        roomTypes: ['combat', 'chest'] // осколки в боях и сундуках
      };
      
    case 'rescue_prisoner':
      return {
        itemType: 'prisoner',
        count: 1,
        roomTypes: ['event'] // пленник в событийной комнате
      };
      
    default:
      return {
        itemType: 'key',
        count: 1,
        roomTypes: ['combat']
      };
  }
}

// Простой PRNG для воспроизводимости
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

