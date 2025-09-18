import { Room, Player, Item } from '@/types/game';
import { getRandomDungeonMaterial } from './dungeonItems';
import { getRandomDungeonEnemy } from './dungeonEnemies';

export interface RoomResult {
  log: string[];
  changes: {
    health?: number;
    mana?: number;
    gold?: number;
    exp?: number;
    items?: Item[];
  };
  nextState?: 'battle' | 'event' | 'exploring';
  enemy?: any; // Данные врага для боевых комнат
}

export async function handleRoomEnter(
  room: Room,
  player: Player,
  runId: string
): Promise<RoomResult> {
  switch (room.type) {
    case 'combat':
      return handleCombat(room, player);
    case 'boss':
      return handleBoss(room, player);
    case 'trap':
      return handleTrap(room, player);
    case 'altar':
      return handleAltar(room, player);
    case 'merchant':
      return handleMerchant(room, player);
    case 'chest':
      return handleChest(room, player);
    case 'event':
      return handleEvent(room, player);
    default:
      return { log: ['Пустая комната.'], changes: {} };
  }
}

function handleCombat(room: Room, player: Player): RoomResult {
  // Если монстр уже побежден, не показываем бой
  if (room.defeated) {
    return {
      log: [
        `Вы входите в боевую комнату.`,
        `Здесь уже нет врагов - вы их победили ранее.`,
        `Комната безопасна для отдыха.`
      ],
      changes: {
        health: Math.floor(player.maxHealth * 0.1) // Небольшое восстановление здоровья
      },
      nextState: 'exploring'
    };
  }

  // Генерируем врага на основе номера комнаты
  const roomNumber = parseInt(room.id.replace('r', '')) + 1;
  const enemy = getRandomDungeonEnemy(roomNumber, false, 'normal');
  
  if (!enemy) {
    return {
      log: ['Комната пуста.'],
      changes: {},
      nextState: 'exploring'
    };
  }

  return {
    log: [`Вы встретили ${enemy.name}!`],
    changes: {},
    nextState: 'battle',
    enemy: enemy
  };
}

function handleBoss(room: Room, player: Player): RoomResult {
  // Генерируем босса
  const enemy = getRandomDungeonEnemy(0, true, 'normal');
  
  if (!enemy) {
    return {
      log: ['Босс исчез...'],
      changes: {},
      nextState: 'exploring'
    };
  }

  return {
    log: [`Вы встретили босса подземелья: ${enemy.name}!`],
    changes: {},
    nextState: 'battle',
    enemy: enemy
  };
}

function handleTrap(room: Room, player: Player): RoomResult {
  return {
    log: ['Вы обнаружили опасную ловушку!'],
    changes: {},
    nextState: 'event'
  };
}

function handleAltar(room: Room, player: Player): RoomResult {
  if (room.used) {
    return {
      log: ['Алтарь уже использован.'],
      changes: {}
    };
  }

  return {
    log: ['Вы нашли священный алтарь!'],
    changes: {},
    nextState: 'event'
  };
}

function handleMerchant(room: Room, player: Player): RoomResult {
  return {
    log: ['Вы встретили подземного торговца!'],
    changes: {},
    nextState: 'event'
  };
}

function handleChest(room: Room, player: Player): RoomResult {
  // Если сундук уже разграблен
  if (room.looted) {
    return {
      log: [
        'Вы входите в комнату с сундуком.',
        'Сундук уже пуст - вы его разграбили ранее.'
      ],
      changes: {},
      nextState: 'exploring'
    };
  }

  // Шанс найти что-то в сундуке (не всегда есть награды)
  const hasLoot = Math.random() < 0.7; // 70% шанс найти что-то
  
  if (!hasLoot) {
    return {
      log: [
        'Вы нашли сундук с сокровищами!',
        'К сожалению, сундук оказался пустым.'
      ],
      changes: {},
      nextState: 'exploring'
    };
  }

  return {
    log: ['Вы нашли сундук с сокровищами!'],
    changes: {},
    nextState: 'event'
  };
}

function handleEvent(room: Room, player: Player): RoomResult {
  return {
    log: ['Произошло случайное событие!'],
    changes: {},
    nextState: 'event'
  };
}
