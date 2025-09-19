import { 
  EnhancedDungeonMap, 
  EnhancedRoom, 
  RoomType, 
  EnhancedDungeonGenConfig,
  DungeonGoalType,
  ThreatLevel,
  RoomThreat
} from '@/types/game';
import { getRandomAffixes } from './dungeonAffixes';
import { createDungeonGoal, getGoalRoomRequirements } from './dungeonGoals';

// Подсказки для комнат
const ROOM_HINTS: Record<RoomType, string[]> = {
  start: [],
  combat: ['запах крови', 'звук оружия', 'рычание'],
  boss: ['зловещая аура', 'мощная магия', 'древняя сила'],
  altar: ['святое сияние', 'тихие молитвы', 'божественная энергия'],
  trap: ['щелчки механизмов', 'подозрительные тени', 'опасность'],
  merchant: ['звон монет', 'запах специй', 'торговые голоса'],
  chest: ['блеск сокровищ', 'металлический звон', 'скрытые богатства'],
  event: ['странные звуки', 'необычная активность', 'загадочные знаки']
};

// Базовые настройки генерации
const DEFAULT_CONFIG: EnhancedDungeonGenConfig = {
  roomCount: 12,
  minPathToBoss: 6,
  roomDistribution: {
    combat: 4,
    event: 2,
    trap: 1,
    altar: 1,
    merchant: 1,
    chest: 1
  },
  goalType: 'key_boss',
  affixCount: 2,
  difficulty: 'normal',
  playerLevel: 1
};

// Основная функция генерации улучшенного подземелья
export function generateEnhancedDungeon(
  config: Partial<EnhancedDungeonGenConfig> = {},
  seed: number = Date.now()
): EnhancedDungeonMap {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const rng = mulberry32(seed);
  
  console.log('🏗️ Генерация улучшенного подземелья:', {
    seed,
    config: fullConfig
  });

  // 1. Создаем базовую структуру комнат
  const rooms = generateRoomLayout(fullConfig, rng);
  
  // 2. Назначаем типы комнат по шаблону
  assignRoomTypes(rooms, fullConfig, rng);
  
  // 3. Добавляем систему угроз и подсказок
  addThreatSystem(rooms, fullConfig, rng);
  
  // 4. Размещаем предметы цели
  const goalRooms = placeGoalItems(rooms, fullConfig, rng);
  
  // 5. Добавляем врата к боссу
  const gateRoomId = addBossGate(rooms, rng);
  
  // 6. Генерируем аффиксы
  const affixes = getRandomAffixes(fullConfig.affixCount, seed);
  
  // 7. Применяем аффиксы к карте (например, добавляем сундук для treasure_call)
  applyAffixesToMap(rooms, affixes, rng);
  
  // 8. Создаем цель подземелья
  const goal = createDungeonGoal(fullConfig.goalType);
  
  const dungeonMap: EnhancedDungeonMap = {
    id: `enhanced_dungeon_${seed}`,
    seed,
    rooms,
    startId: 'r0',
    bossId: findBossRoom(rooms),
    name: `Подземелье уровня ${fullConfig.playerLevel}`,
    description: generateDungeonDescription(fullConfig, affixes),
    difficulty: fullConfig.difficulty,
    level: fullConfig.playerLevel,
    goal,
    affixes,
    gateRoomId,
    keyRooms: goalRooms
  };
  
  console.log('✅ Подземелье сгенерировано:', {
    rooms: Object.keys(rooms).length,
    goal: goal.description,
    affixes: affixes.map(a => a.name),
    keyRooms: goalRooms
  });
  
  return dungeonMap;
}

// Создание базовой структуры комнат (граф связности)
function generateRoomLayout(config: EnhancedDungeonGenConfig, rng: () => number): Record<string, EnhancedRoom> {
  const rooms: Record<string, EnhancedRoom> = {};
  const roomIds = Array.from({ length: config.roomCount }, (_, i) => `r${i}`);
  
  // Размещаем комнаты в сетке
  const cols = Math.ceil(Math.sqrt(config.roomCount));
  const rows = Math.ceil(config.roomCount / cols);
  const cellWidth = 140;
  const cellHeight = 100;
  const startX = 60;
  const startY = 40;
  
  // Создаем комнаты
  roomIds.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    rooms[id] = {
      id,
      type: 'combat', // временно, назначим позже
      neighbors: [],
      x: startX + col * cellWidth,
      y: startY + row * cellHeight,
      visited: false,
      used: false,
      threat: { level: 1, hintChance: 20 },
      distance_from_start: 0
    };
  });
  
  // Создаем минимальное связное дерево (MST)
  const edges = generateMST(roomIds, rng);
  
  // Добавляем дополнительные связи для создания циклов (10-20%)
  const extraEdges = Math.floor(edges.length * 0.15);
  addExtraConnections(roomIds, edges, extraEdges, rng);
  
  // Применяем связи к комнатам
  edges.forEach(([a, b]) => {
    rooms[a].neighbors.push(b);
    rooms[b].neighbors.push(a);
  });
  
  // Вычисляем расстояния от старта
  calculateDistances(rooms, 'r0');
  
  return rooms;
}

// Назначение типов комнат по шаблону
function assignRoomTypes(rooms: Record<string, EnhancedRoom>, config: EnhancedDungeonGenConfig, rng: () => number) {
  const roomIds = Object.keys(rooms);
  const distribution = config.roomDistribution;
  
  // Назначаем фиксированные типы
  rooms['r0'].type = 'start'; // стартовая комната
  
  // Находим самую дальнюю комнату для босса
  const bossId = roomIds.reduce((farthest, id) => 
    (rooms[id].distance_from_start || 0) > (rooms[farthest].distance_from_start || 0) ? id : farthest
  );
  rooms[bossId].type = 'boss';
  
  // Назначаем остальные типы
  const availableRooms = roomIds.filter(id => id !== 'r0' && id !== bossId);
  const typePool: RoomType[] = [];
  
  // Заполняем пул типов согласно распределению
  Object.entries(distribution).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      typePool.push(type as RoomType);
    }
  });
  
  // Перемешиваем и назначаем
  const shuffledTypes = typePool.sort(() => rng() - 0.5);
  availableRooms.forEach((roomId, index) => {
    if (index < shuffledTypes.length) {
      rooms[roomId].type = shuffledTypes[index];
    }
  });
}

// Добавление системы угроз и подсказок
function addThreatSystem(rooms: Record<string, EnhancedRoom>, config: EnhancedDungeonGenConfig, rng: () => number) {
  Object.values(rooms).forEach(room => {
    const baseThreat = getThreatForRoomType(room.type);
    const depthBonus = Math.floor((room.distance_from_start || 0) / 3); // +1 угроза каждые 3 комнаты
    const difficultyBonus = config.difficulty === 'heroic' ? 1 : config.difficulty === 'mythic' ? 2 : 0;
    
    const threatLevel = Math.min(3, baseThreat + depthBonus + difficultyBonus) as ThreatLevel;
    
    // Определяем подсказку
    const hints = ROOM_HINTS[room.type];
    const hint = hints.length > 0 && rng() < 0.3 ? hints[Math.floor(rng() * hints.length)] : undefined;
    
    room.threat = {
      level: threatLevel,
      hint,
      hintChance: 20 + threatLevel * 10 // больше угроза = больше шанс подсказки
    };
  });
}

// Размещение предметов цели в комнатах
function placeGoalItems(rooms: Record<string, EnhancedRoom>, config: EnhancedDungeonGenConfig, rng: () => number): string[] {
  const requirements = getGoalRoomRequirements(config.goalType);
  const suitableRooms = Object.values(rooms).filter(room => 
    requirements.roomTypes.includes(room.type as any) &&
    room.type !== 'start' &&
    (room.distance_from_start || 0) >= 4 // минимум в 4 шагах от старта
  );
  
  // Сортируем по расстоянию от старта (дальние предпочтительнее)
  suitableRooms.sort((a, b) => (b.distance_from_start || 0) - (a.distance_from_start || 0));
  
  const goalRooms: string[] = [];
  
  for (let i = 0; i < requirements.count && i < suitableRooms.length; i++) {
    const room = suitableRooms[i];
    room.goal_item = requirements.itemType;
    goalRooms.push(room.id);
  }
  
  return goalRooms;
}

// Добавление врат к боссу
function addBossGate(rooms: Record<string, EnhancedRoom>, rng: () => number): string | undefined {
  const bossRoom = Object.values(rooms).find(room => room.type === 'boss');
  if (!bossRoom) return undefined;
  
  // Находим соседей босса
  const bossNeighbors = bossRoom.neighbors;
  if (bossNeighbors.length === 0) return undefined;
  
  // Выбираем случайного соседа как врата
  const gateId = bossNeighbors[Math.floor(rng() * bossNeighbors.length)];
  const gateRoom = rooms[gateId];
  
  if (gateRoom) {
    gateRoom.type = 'event'; // врата - это особое событие
    gateRoom.locked = true;
    return gateId;
  }
  
  return undefined;
}

// Применение эффектов аффиксов к карте
function applyAffixesToMap(rooms: Record<string, EnhancedRoom>, affixes: any[], rng: () => number) {
  const treasureCallAffix = affixes.find(a => a.type === 'treasure_call');
  
  if (treasureCallAffix) {
    // Добавляем дополнительный сундук
    const availableRooms = Object.values(rooms).filter(room => 
      room.type === 'combat' && !room.goal_item
    );
    
    if (availableRooms.length > 0) {
      const randomRoom = availableRooms[Math.floor(rng() * availableRooms.length)];
      randomRoom.type = 'chest';
    }
  }
}

// Вспомогательные функции

function getThreatForRoomType(type: RoomType): ThreatLevel {
  switch (type) {
    case 'start': return 1;
    case 'altar': return 1;
    case 'merchant': return 1;
    case 'chest': return 1;
    case 'event': return 2;
    case 'trap': return 2;
    case 'combat': return 2;
    case 'boss': return 3;
    default: return 1;
  }
}

function findBossRoom(rooms: Record<string, EnhancedRoom>): string {
  return Object.values(rooms).find(room => room.type === 'boss')?.id || 'r1';
}

function generateDungeonDescription(config: EnhancedDungeonGenConfig, affixes: any[]): string {
  const difficultyDesc = {
    normal: 'Обычное',
    heroic: 'Героическое', 
    mythic: 'Мифическое'
  };
  
  const affixNames = affixes.map(a => a.name).join(', ');
  
  return `${difficultyDesc[config.difficulty]} подземелье. Активные аффиксы: ${affixNames}`;
}

// Генерация минимального связного дерева
function generateMST(nodes: string[], rng: () => number): [string, string][] {
  const edges: [string, string][] = [];
  const connected = new Set([nodes[0]]);
  const remaining = new Set(nodes.slice(1));
  
  while (remaining.size > 0) {
    const connectedArray = Array.from(connected);
    const remainingArray = Array.from(remaining);
    
    const from = connectedArray[Math.floor(rng() * connectedArray.length)];
    const to = remainingArray[Math.floor(rng() * remainingArray.length)];
    
    edges.push([from, to]);
    connected.add(to);
    remaining.delete(to);
  }
  
  return edges;
}

// Добавление дополнительных связей
function addExtraConnections(nodes: string[], existingEdges: [string, string][], count: number, rng: () => number) {
  const edgeSet = new Set(existingEdges.map(([a, b]) => `${a}-${b}`));
  
  for (let i = 0; i < count; i++) {
    const a = nodes[Math.floor(rng() * nodes.length)];
    const b = nodes[Math.floor(rng() * nodes.length)];
    
    if (a !== b && !edgeSet.has(`${a}-${b}`) && !edgeSet.has(`${b}-${a}`)) {
      existingEdges.push([a, b]);
      edgeSet.add(`${a}-${b}`);
    }
  }
}

// Вычисление расстояний от старта (BFS)
function calculateDistances(rooms: Record<string, EnhancedRoom>, startId: string) {
  const queue = [startId];
  const visited = new Set([startId]);
  rooms[startId].distance_from_start = 0;
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDistance = rooms[current].distance_from_start || 0;
    
    for (const neighborId of rooms[current].neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        rooms[neighborId].distance_from_start = currentDistance + 1;
        queue.push(neighborId);
      }
    }
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



