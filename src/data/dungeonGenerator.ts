// Генератор подземелий с комнатным графом
import { RoomType, Room, DungeonMap } from '@/types/game';

// Генератор случайных чисел (Mulberry32)
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = a + 0x6d2b79f5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Вспомогательные функции
function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function connect(rooms: Record<string, Room>, a: string, b: string) {
  if (!rooms[a].neighbors.includes(b)) rooms[a].neighbors.push(b);
  if (!rooms[b].neighbors.includes(a)) rooms[b].neighbors.push(a);
}

function rollType(rnd: () => number): RoomType {
  const p = rnd();
  if (p < 0.25) return 'combat';      // 25% - бои
  if (p < 0.35) return 'unknown';     // 10% - неизвестные (риск)
  if (p < 0.45) return 'event';       // 10% - события
  if (p < 0.55) return 'chest';       // 10% - сундуки
  if (p < 0.62) return 'trap';        // 7% - ловушки
  if (p < 0.69) return 'altar';       // 7% - алтари
  if (p < 0.76) return 'merchant';    // 7% - торговцы
  if (p < 0.83) return 'secret';      // 7% - секретные (высокий риск/награда)
  if (p < 0.90) return 'cursed';      // 7% - проклятые (риск)
  if (p < 0.97) return 'blessed';     // 7% - благословенные (награда)
  return 'event';                     // 3% - события (fallback)
}

function farthestNode(rooms: Record<string, Room>, start: string): string {
  // BFS для поиска самой дальней комнаты
  const dist: Record<string, number> = { [start]: 0 };
  const q = [start];
  
  while (q.length) {
    const v = q.shift()!;
    for (const nb of rooms[v].neighbors) {
      if (dist[nb] == null) {
        dist[nb] = dist[v] + 1;
        q.push(nb);
      }
    }
  }
  
  return Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0];
}

// Создает основной путь от старта к боссу
function createMainPath(ids: string[], start: string, boss: string, rnd: () => number): string[] {
  const path = [start];
  const remaining = ids.filter(id => id !== start && id !== boss);
  
  // Добавляем 2-4 комнаты в основной путь
  const pathLength = Math.min(2 + Math.floor(rnd() * 3), remaining.length);
  
  for (let i = 0; i < pathLength; i++) {
    const randomRoom = pick(remaining, rnd);
    path.push(randomRoom);
    const index = remaining.indexOf(randomRoom);
    remaining.splice(index, 1);
  }
  
  path.push(boss);
  return path;
}

// Находит ближайшую комнату по координатам
function findNearestRoom(rooms: Record<string, Room>, targetId: string, candidates: string[]): string {
  const target = rooms[targetId];
  let nearest = candidates[0];
  let minDistance = getDistance(target, rooms[nearest]);
  
  for (const candidateId of candidates.slice(1)) {
    const distance = getDistance(target, rooms[candidateId]);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = candidateId;
    }
  }
  
  return nearest;
}

// Вычисляет расстояние между двумя комнатами
function getDistance(room1: Room, room2: Room): number {
  const dx = room1.x - room2.x;
  const dy = room1.y - room2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Основная функция генерации подземелья
export function generateDungeon(
  seed: number = Date.now(),
  nRooms: number = 12,
  difficulty: 'normal' | 'heroic' | 'mythic' = 'normal'
): DungeonMap {
  const rnd = mulberry32(seed);
  const rooms: Record<string, Room> = {};
  const ids = Array.from({ length: nRooms }, (_, i) => `r${i}`);

  // Раскидываем узлы в сетке для отрисовки
  const cols = Math.ceil(Math.sqrt(nRooms));
  const rows = Math.ceil(nRooms / cols);
  const cellWidth = 140;
  const cellHeight = 100;
  const startX = 60;
  const startY = 40;
  
  ids.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    rooms[id] = {
      id,
      type: 'combat',
      neighbors: [],
      x: startX + col * cellWidth,
      y: startY + row * cellHeight
    };
  });

  // Создаем случайный граф с возможными тупиками
  const start = ids[0];
  // Босс должен быть в правой части карты - берем комнату с максимальной X координатой
  const bossId = rooms[Object.keys(rooms).reduce((maxId, id) => 
    rooms[id].x > rooms[maxId].x ? id : maxId
  )].id;
  
  // Создаем основной путь от старта к боссу (гарантированный путь)
  const mainPath = createMainPath(ids, start, bossId, rnd);
  
  // Соединяем комнаты основного пути
  for (let i = 0; i < mainPath.length - 1; i++) {
    connect(rooms, mainPath[i], mainPath[i + 1]);
  }

  // Добавляем случайные соединения (возможны тупики)
  const totalConnections = Math.floor(nRooms * (0.4 + rnd() * 0.3)); // 40-70% от количества комнат
  let connectionsAdded = mainPath.length - 1; // Уже добавленные связи в основном пути
  
  while (connectionsAdded < totalConnections) {
    const a = pick(ids, rnd);
    const b = pick(ids, rnd);
    
    // Не соединяем комнату саму с собой
    if (a === b) continue;
    
    // Не добавляем дублирующие соединения
    if (rooms[a].neighbors.includes(b)) continue;
    
    // Ограничиваем максимальное количество соединений у комнаты
    if (rooms[a].neighbors.length >= 4 || rooms[b].neighbors.length >= 4) continue;
    
    connect(rooms, a, b);
    connectionsAdded++;
  }

  // Гарантируем, что стартовая комната имеет хотя бы один выход
  if (rooms[start].neighbors.length === 0) {
    const availableRooms = ids.filter(id => id !== start && rooms[id].neighbors.length < 4);
    if (availableRooms.length > 0) {
      const targetRoom = pick(availableRooms, rnd);
      connect(rooms, start, targetRoom);
    }
  }

  // Расставляем стартовую комнату и босса
  const startId = start;
  rooms[startId].type = 'start';
  
  // Босс уже определен в основном пути
  rooms[bossId].type = 'boss';

  // Расставляем типы остальных комнат
  for (const id of ids) {
    if (id === startId || id === bossId) continue;
    rooms[id].type = rollType(rnd);
  }

  // Генерируем название и описание
  const dungeonNames = [
    'Катакомбы Ада',
    'Гоблинские Шахты',
    'Логово Дракона',
    'Забытый Храм',
    'Проклятые Руины',
    'Темные Пещеры',
    'Древняя Гробница',
    'Мистический Лабиринт'
  ];

  const dungeonDescriptions = [
    'Темные катакомбы, полные нежити и древних проклятий.',
    'Заброшенные шахты, захваченные племенами гоблинов.',
    'Древнее логово огненного дракона с горами золота.',
    'Забытый храм, где покоятся древние артефакты.',
    'Проклятые руины, наполненные темной магией.',
    'Глубокие пещеры, где обитают странные существа.',
    'Древняя гробница с сокровищами и ловушками.',
    'Мистический лабиринт с изменяющейся геометрией.'
  ];

  const name = pick(dungeonNames, rnd);
  const description = pick(dungeonDescriptions, rnd);

  // Определяем уровень сложности
  const level = difficulty === 'normal' ? 1 + Math.floor(rnd() * 5) :
                difficulty === 'heroic' ? 6 + Math.floor(rnd() * 5) :
                11 + Math.floor(rnd() * 5);

  // Отладочная информация
  console.log('Dungeon generation completed:', {
    id: `dungeon_${seed}`,
    nRooms,
    cols,
    rows,
    rooms: Object.keys(rooms).length,
    startId,
    bossId,
    roomCoordinates: Object.values(rooms).map(r => ({ id: r.id, x: r.x, y: r.y, type: r.type, neighbors: r.neighbors.length }))
  });

  return {
    id: `dungeon_${seed}`,
    seed,
    rooms,
    startId,
    bossId,
    name,
    description,
    difficulty,
    level
  };
}

// Функция для получения иконки комнаты
export function getRoomIcon(type: RoomType, isKnown: boolean = true): string {
  if (!isKnown) return '•';
  
  const icons: Record<RoomType, string> = {
    start: '🏁',
    combat: '⚔️',
    event: '❓',
    altar: '⛪',
    trap: '☠️',
    merchant: '🛒',
    chest: '🗝️',
    boss: '👑',
    unknown: '❔',
    secret: '🔍',
    cursed: '💀',
    blessed: '✨'
  };
  
  return icons[type] || '•';
}

// Функция для получения цвета комнаты
export function getRoomColor(type: RoomType, isCurrent: boolean = false, isVisited: boolean = false): string {
  if (isCurrent) return 'bg-amber-400 text-black ring-4 ring-amber-200';
  if (isVisited) return 'bg-sky-700 hover:ring-2 ring-sky-300';
  
  const colors: Record<RoomType, string> = {
    start: 'bg-green-600',
    combat: 'bg-red-600',
    event: 'bg-purple-600',
    altar: 'bg-yellow-600',
    trap: 'bg-orange-600',
    merchant: 'bg-blue-600',
    chest: 'bg-yellow-500',
    boss: 'bg-red-800'
  };
  
  return colors[type] || 'bg-gray-600';
}

// Функция для проверки, можно ли перейти в комнату
export function canMoveToRoom(
  dungeon: DungeonMap,
  currentRoomId: string,
  targetRoomId: string,
  visitedRooms: Set<string>
): boolean {
  const currentRoom = dungeon.rooms[currentRoomId];
  if (!currentRoom) return false;
  
  // Можно перейти только в соседние комнаты
  return currentRoom.neighbors.includes(targetRoomId);
}

// Функция для получения доступных комнат
export function getAvailableRooms(
  dungeon: DungeonMap,
  currentRoomId: string,
  visitedRooms: Set<string>
): string[] {
  const currentRoom = dungeon.rooms[currentRoomId];
  if (!currentRoom) return [];
  
  return currentRoom.neighbors;
}
