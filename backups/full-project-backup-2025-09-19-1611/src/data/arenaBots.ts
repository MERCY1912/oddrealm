import { ArenaBot, ArenaBotDifficulty, ArenaBotType } from '@/types/game';
import garoldBotImage from '@/assets/bots_img/garold_bot.jpg';

// Функция для создания ботов с балансированными характеристиками
const createArenaBot = (
  id: string,
  name: string,
  level: number,
  difficulty: ArenaBotDifficulty,
  botType: ArenaBotType,
  description: string,
  baseStats: {
    strength: number;
    dexterity: number;
    luck: number;
    endurance: number;
  }
): ArenaBot => {
  // Базовые характеристики для уровня 1 (как у игрока)
  const baseLevel1Stats = {
    health: 100,
    attack: 10,
    defense: 5,
    experience: 50,
    gold: 25,
    critChance: 5,
    dodgeChance: 5,
    blockChance: 5
  };

  // Множители сложности
  const difficultyMultipliers = {
    easy: { health: 0.8, attack: 0.8, defense: 0.8, experience: 0.8, gold: 0.8 },
    medium: { health: 1.0, attack: 1.0, defense: 1.0, experience: 1.0, gold: 1.0 },
    hard: { health: 1.2, attack: 1.2, defense: 1.2, experience: 1.2, gold: 1.2 }
  };

  // Множители для разных типов ботов
  const typeMultipliers = {
    warrior: { health: 1.2, attack: 1.1, defense: 1.1, critChance: 0.8, dodgeChance: 0.7, blockChance: 1.3 },
    mage: { health: 0.8, attack: 1.3, defense: 0.7, critChance: 1.2, dodgeChance: 1.1, blockChance: 0.6 },
    archer: { health: 0.9, attack: 1.2, defense: 0.9, critChance: 1.3, dodgeChance: 1.2, blockChance: 0.8 },
    rogue: { health: 0.8, attack: 1.1, defense: 0.8, critChance: 1.4, dodgeChance: 1.4, blockChance: 0.7 },
    paladin: { health: 1.3, attack: 1.0, defense: 1.2, critChance: 0.9, dodgeChance: 0.8, blockChance: 1.4 },
    berserker: { health: 1.1, attack: 1.4, defense: 0.9, critChance: 1.1, dodgeChance: 0.6, blockChance: 0.8 }
  };

  const diffMult = difficultyMultipliers[difficulty];
  const typeMult = typeMultipliers[botType];

  // Расчет характеристик с учетом уровня
  const levelMultiplier = 1 + (level - 1) * 0.2; // +20% за каждый уровень

  const health = Math.round(baseLevel1Stats.health * diffMult.health * typeMult.health * levelMultiplier);
  const attack = Math.round(baseLevel1Stats.attack * diffMult.attack * typeMult.attack * levelMultiplier);
  const defense = Math.round(baseLevel1Stats.defense * diffMult.defense * typeMult.defense * levelMultiplier);
  const experience = Math.round(baseLevel1Stats.experience * diffMult.experience * levelMultiplier);
  const gold = Math.round(baseLevel1Stats.gold * diffMult.gold * levelMultiplier);

  return {
    id,
    name,
    level,
    health,
    maxHealth: health,
    attack,
    defense,
    experience,
    gold,
    difficulty,
    image: getBotImage(id, botType),
    strength: baseStats.strength,
    dexterity: baseStats.dexterity,
    luck: baseStats.luck,
    endurance: baseStats.endurance,
    critChance: Math.round(baseLevel1Stats.critChance * typeMult.critChance * levelMultiplier),
    dodgeChance: Math.round(baseLevel1Stats.dodgeChance * typeMult.dodgeChance * levelMultiplier),
    blockChance: Math.round(baseLevel1Stats.blockChance * typeMult.blockChance * levelMultiplier),
    description,
    botType
  };
};

// Функция для получения эмодзи по типу бота
const getBotEmoji = (botType: ArenaBotType): string => {
  const emojis = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
    rogue: '🗡️',
    paladin: '🛡️',
    berserker: '⚡'
  };
  return emojis[botType];
};

// Функция для получения изображения бота
const getBotImage = (id: string, botType: ArenaBotType): string => {
  // Специальные случаи для ботов с картинками
  if (id === 'bot-1-1-easy') {
    return garoldBotImage;
  }
  
  // Для остальных ботов используем эмодзи
  return getBotEmoji(botType);
};

// Создание ботов для каждого уровня
export const arenaBots: ArenaBot[] = [
  // Уровень 1 - Легкие боты
  createArenaBot(
    'bot-1-1-easy',
    'Гарольд Железный Кулак',
    1,
    'easy',
    'warrior',
    'Молодой воин из северных земель, известный своей силой.',
    { strength: 12, dexterity: 8, luck: 10, endurance: 10 }
  ),
  createArenaBot(
    'bot-1-2-easy',
    'Мерлин Младший',
    1,
    'easy',
    'mage',
    'Ученик древних магов, изучающий основы волшебства.',
    { strength: 6, dexterity: 10, luck: 14, endurance: 8 }
  ),
  createArenaBot(
    'bot-1-3-easy',
    'Робин Зеленый',
    1,
    'easy',
    'archer',
    'Молодой лучник из Шервудского леса.',
    { strength: 8, dexterity: 14, luck: 12, endurance: 6 }
  ),

  // Уровень 1 - Средние боты
  createArenaBot(
    'bot-1-1-medium',
    'Сэр Годфри',
    1,
    'medium',
    'warrior',
    'Опытный рыцарь, служивший в королевской гвардии.',
    { strength: 15, dexterity: 10, luck: 10, endurance: 12 }
  ),
  createArenaBot(
    'bot-1-2-medium',
    'Волдемар Теневой',
    1,
    'medium',
    'mage',
    'Маг-практик, изучающий темные искусства.',
    { strength: 8, dexterity: 12, luck: 16, endurance: 10 }
  ),
  createArenaBot(
    'bot-1-3-medium',
    'Лорд Хоквуд',
    1,
    'medium',
    'archer',
    'Благородный лучник, мастер дальнего боя.',
    { strength: 10, dexterity: 16, luck: 14, endurance: 8 }
  ),

  // Уровень 1 - Сложные боты
  createArenaBot(
    'bot-1-1-hard',
    'Торвальд Берсерк',
    1,
    'hard',
    'warrior',
    'Викинг-берсерк, не знающий страха в бою.',
    { strength: 18, dexterity: 12, luck: 10, endurance: 15 }
  ),
  createArenaBot(
    'bot-1-2-hard',
    'Архимаг Моргана',
    1,
    'hard',
    'mage',
    'Мощная волшебница с древними знаниями.',
    { strength: 10, dexterity: 14, luck: 18, endurance: 12 }
  ),
  createArenaBot(
    'bot-1-3-hard',
    'Снайпер Уильям',
    1,
    'hard',
    'archer',
    'Элитный лучник с невероятной точностью.',
    { strength: 12, dexterity: 18, luck: 16, endurance: 10 }
  ),

  // Уровень 2 - Легкие боты
  createArenaBot(
    'bot-2-1-easy',
    'Стражник Борис',
    2,
    'easy',
    'warrior',
    'Верный стражник замка, защищающий покой жителей.',
    { strength: 14, dexterity: 10, luck: 12, endurance: 12 }
  ),
  createArenaBot(
    'bot-2-2-easy',
    'Алхимик Фауст',
    2,
    'easy',
    'mage',
    'Маг-исследователь, изучающий древние артефакты.',
    { strength: 8, dexterity: 12, luck: 16, endurance: 10 }
  ),
  createArenaBot(
    'bot-2-3-easy',
    'Следопыт Арагорн',
    2,
    'easy',
    'archer',
    'Охотник, знающий все тропы и секреты леса.',
    { strength: 10, dexterity: 16, luck: 14, endurance: 8 }
  ),

  // Уровень 2 - Средние боты
  createArenaBot(
    'bot-2-1-medium',
    'Капитан Ричард',
    2,
    'medium',
    'warrior',
    'Опытный командир с тактическим мышлением.',
    { strength: 17, dexterity: 12, luck: 12, endurance: 14 }
  ),
  createArenaBot(
    'bot-2-2-medium',
    'Элементалист Зара',
    2,
    'medium',
    'mage',
    'Маг, владеющий силами стихий.',
    { strength: 10, dexterity: 14, luck: 18, endurance: 12 }
  ),
  createArenaBot(
    'bot-2-3-medium',
    'Рейнджер Леголас',
    2,
    'medium',
    'archer',
    'Эксперт по выживанию и стрельбе.',
    { strength: 12, dexterity: 18, luck: 16, endurance: 10 }
  ),

  // Уровень 2 - Сложные боты
  createArenaBot(
    'bot-2-1-hard',
    'Чемпион Артур',
    2,
    'hard',
    'warrior',
    'Победитель множества турниров и поединков.',
    { strength: 20, dexterity: 14, luck: 12, endurance: 17 }
  ),
  createArenaBot(
    'bot-2-2-hard',
    'Некромант Владыка',
    2,
    'hard',
    'mage',
    'Темный маг, изучающий запретные искусства.',
    { strength: 12, dexterity: 16, luck: 20, endurance: 14 }
  ),
  createArenaBot(
    'bot-2-3-hard',
    'Теневой Ассасин',
    2,
    'hard',
    'archer',
    'Мастер скрытности и точности.',
    { strength: 14, dexterity: 20, luck: 18, endurance: 12 }
  ),

  // Уровень 3 - Легкие боты
  createArenaBot(
    'bot-3-1-easy',
    'Наемник Драко',
    3,
    'easy',
    'warrior',
    'Опытный наемник с богатым боевым опытом.',
    { strength: 16, dexterity: 12, luck: 14, endurance: 14 }
  ),
  createArenaBot(
    'bot-3-2-easy',
    'Алхимик Парацельс',
    3,
    'easy',
    'mage',
    'Маг, изучающий тайны алхимии и трансмутации.',
    { strength: 10, dexterity: 14, luck: 18, endurance: 12 }
  ),
  createArenaBot(
    'bot-3-3-easy',
    'Охотник Ван Хельсинг',
    3,
    'easy',
    'archer',
    'Специалист по охоте на нежить и демонов.',
    { strength: 12, dexterity: 18, luck: 16, endurance: 10 }
  ),

  // Уровень 3 - Средние боты
  createArenaBot(
    'bot-3-1-medium',
    'Паладин Ланселот',
    3,
    'medium',
    'paladin',
    'Святой воин, защищающий справедливость.',
    { strength: 19, dexterity: 14, luck: 14, endurance: 16 }
  ),
  createArenaBot(
    'bot-3-2-medium',
    'Иллюзионист Гэндальф',
    3,
    'medium',
    'mage',
    'Мастер иллюзий и обмана.',
    { strength: 12, dexterity: 16, luck: 20, endurance: 14 }
  ),
  createArenaBot(
    'bot-3-3-medium',
    'Берсерк Рагнар',
    3,
    'medium',
    'berserker',
    'Безумный воин, впадающий в боевую ярость.',
    { strength: 22, dexterity: 10, luck: 12, endurance: 18 }
  ),

  // Уровень 3 - Сложные боты
  createArenaBot(
    'bot-3-1-hard',
    'Легенда Константин',
    3,
    'hard',
    'warrior',
    'Легендарный воин, известный по всему миру.',
    { strength: 22, dexterity: 16, luck: 14, endurance: 19 }
  ),
  createArenaBot(
    'bot-3-2-hard',
    'Древний Мерлин',
    3,
    'hard',
    'mage',
    'Древний маг с тысячелетним опытом.',
    { strength: 14, dexterity: 18, luck: 22, endurance: 16 }
  ),
  createArenaBot(
    'bot-3-3-hard',
    'Теневой Убийца',
    3,
    'hard',
    'rogue',
    'Мастер скрытности и смертельных ударов.',
    { strength: 16, dexterity: 22, luck: 20, endurance: 14 }
  )
];

// Функция для получения доступных ботов для игрока
export const getAvailableArenaBots = (playerLevel: number): ArenaBot[] => {
  return arenaBots.filter(bot => 
    bot.level === playerLevel || bot.level === playerLevel + 1
  );
};

// Функция для получения ботов по уровню и сложности
export const getArenaBotsByLevelAndDifficulty = (
  level: number, 
  difficulty: ArenaBotDifficulty
): ArenaBot[] => {
  return arenaBots.filter(bot => 
    bot.level === level && bot.difficulty === difficulty
  );
};

// Функция для получения бота по ID
export const getArenaBotById = (id: string): ArenaBot | undefined => {
  return arenaBots.find(bot => bot.id === id);
};
