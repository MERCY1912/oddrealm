import { Bot } from '@/types/game';

// Функция для создания врагов подземелий
const createDungeonEnemy = (
  id: string,
  name: string,
  level: number,
  description: string,
  baseStats: {
    health: number;
    attack: number;
    defense: number;
    strength: number;
    dexterity: number;
    luck: number;
    endurance: number;
  },
  imageUrl: string = '/assets/bots_img/garold_bot.jpg'
): Bot => {
  return {
    id,
    name,
    level,
    description,
    health: baseStats.health,
    maxHealth: baseStats.health,
    attack: baseStats.attack,
    defense: baseStats.defense,
    strength: baseStats.strength,
    dexterity: baseStats.dexterity,
    luck: baseStats.luck,
    endurance: baseStats.endurance,
    experience: level * 25,
    gold: level * 15,
    critChance: 5 + (baseStats.luck / 10),
    dodgeChance: 5 + (baseStats.dexterity / 10),
    blockChance: 5 + (baseStats.endurance / 10),
    image_url: imageUrl,
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      gloves: null,
      belt: null,
      necklace: null,
      ring: null,
      shield: null,
      leggings: null,
      bracers: null,
      earring: null
    }
  };
};

// Враги для подземелий по уровням сложности
export const dungeonEnemies: Record<string, Bot[]> = {
  // Легкие враги (уровни 1-3)
  easy: [
    createDungeonEnemy(
      'goblin_warrior',
      'Гоблин-воин',
      1,
      'Маленький, но агрессивный гоблин с ржавым мечом.',
      {
        health: 80,
        attack: 12,
        defense: 3,
        strength: 15,
        dexterity: 12,
        luck: 8,
        endurance: 10
      }
    ),
    createDungeonEnemy(
      'skeleton_archer',
      'Скелет-лучник',
      2,
      'Нежить с луком, стреляющая из тени.',
      {
        health: 70,
        attack: 15,
        defense: 2,
        strength: 10,
        dexterity: 18,
        luck: 12,
        endurance: 8
      }
    ),
    createDungeonEnemy(
      'orc_berserker',
      'Орк-берсерк',
      3,
      'Большой орк в ярости, игнорирующий боль.',
      {
        health: 120,
        attack: 18,
        defense: 4,
        strength: 20,
        dexterity: 8,
        luck: 6,
        endurance: 15
      }
    )
  ],

  // Средние враги (уровни 4-6)
  medium: [
    createDungeonEnemy(
      'dark_knight',
      'Темный рыцарь',
      4,
      'Падший рыцарь в черных доспехах.',
      {
        health: 150,
        attack: 20,
        defense: 8,
        strength: 18,
        dexterity: 10,
        luck: 8,
        endurance: 16
      }
    ),
    createDungeonEnemy(
      'shadow_mage',
      'Маг теней',
      5,
      'Темный маг, владеющий запретной магией.',
      {
        health: 100,
        attack: 25,
        defense: 5,
        strength: 12,
        dexterity: 14,
        luck: 16,
        endurance: 10
      }
    ),
    createDungeonEnemy(
      'minotaur_guardian',
      'Минотавр-страж',
      6,
      'Мощный минотавр, охраняющий сокровища.',
      {
        health: 200,
        attack: 22,
        defense: 10,
        strength: 22,
        dexterity: 6,
        luck: 8,
        endurance: 18
      }
    )
  ],

  // Сложные враги (уровни 7-9)
  hard: [
    createDungeonEnemy(
      'lich_necromancer',
      'Лич-некромант',
      7,
      'Древний некромант, воскрешающий мертвых.',
      {
        health: 180,
        attack: 28,
        defense: 6,
        strength: 14,
        dexterity: 12,
        luck: 20,
        endurance: 12
      }
    ),
    createDungeonEnemy(
      'demon_lord',
      'Повелитель демонов',
      8,
      'Мощный демон из глубин ада.',
      {
        health: 250,
        attack: 30,
        defense: 12,
        strength: 24,
        dexterity: 10,
        luck: 12,
        endurance: 20
      }
    ),
    createDungeonEnemy(
      'ancient_dragon',
      'Древний дракон',
      9,
      'Легендарный дракон, спящий в глубинах.',
      {
        health: 400,
        attack: 35,
        defense: 15,
        strength: 28,
        dexterity: 8,
        luck: 16,
        endurance: 25
      }
    )
  ]
};

// Боссы подземелий
export const dungeonBosses: Bot[] = [
  createDungeonEnemy(
    'dragon_lord',
    'Повелитель драконов',
    10,
    'Могущественный дракон, правитель подземелий.',
    {
      health: 500,
      attack: 40,
      defense: 18,
      strength: 30,
      dexterity: 12,
      luck: 20,
      endurance: 30
    }
  ),
  createDungeonEnemy(
    'shadow_king',
    'Король теней',
    12,
    'Темный правитель, владеющий силой теней.',
    {
      health: 600,
      attack: 45,
      defense: 20,
      strength: 25,
      dexterity: 18,
      luck: 25,
      endurance: 25
    }
  ),
  createDungeonEnemy(
    'void_entity',
    'Сущность пустоты',
    15,
    'Древнее существо из пустоты между мирами.',
    {
      health: 800,
      attack: 50,
      defense: 25,
      strength: 35,
      dexterity: 15,
      luck: 30,
      endurance: 35
    }
  )
];

// Функция для получения случайного врага по уровню сложности
export function getRandomDungeonEnemy(
  roomNumber: number,
  isBoss: boolean = false,
  difficulty: 'normal' | 'heroic' | 'mythic' = 'normal'
): Bot | null {
  if (isBoss) {
    // Для боссов выбираем случайного из списка боссов
    const randomIndex = Math.floor(Math.random() * dungeonBosses.length);
    return dungeonBosses[randomIndex];
  }

  // Определяем сложность врага на основе номера комнаты
  let enemyCategory: string;
  if (roomNumber <= 3) {
    enemyCategory = 'easy';
  } else if (roomNumber <= 6) {
    enemyCategory = 'medium';
  } else {
    enemyCategory = 'hard';
  }

  // Применяем модификаторы сложности подземелья
  const difficultyMultipliers = {
    normal: 1.0,
    heroic: 1.3,
    mythic: 1.6
  };

  const multiplier = difficultyMultipliers[difficulty];
  const enemies = dungeonEnemies[enemyCategory];
  
  if (!enemies || enemies.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * enemies.length);
  const selectedEnemy = enemies[randomIndex];

  // Применяем модификаторы сложности
  return {
    ...selectedEnemy,
    health: Math.floor(selectedEnemy.health * multiplier),
    maxHealth: Math.floor(selectedEnemy.maxHealth * multiplier),
    attack: Math.floor(selectedEnemy.attack * multiplier),
    defense: Math.floor(selectedEnemy.defense * multiplier),
    experience: Math.floor(selectedEnemy.experience * multiplier),
    gold: Math.floor(selectedEnemy.gold * multiplier)
  };
}

// Функция для получения врага по ID
export function getDungeonEnemyById(id: string): Bot | null {
  // Ищем в обычных врагах
  for (const category of Object.values(dungeonEnemies)) {
    const enemy = category.find(e => e.id === id);
    if (enemy) return enemy;
  }

  // Ищем в боссах
  const boss = dungeonBosses.find(b => b.id === id);
  if (boss) return boss;

  return null;
}



