import { DungeonAffix, DungeonAffixType } from '@/types/game';

// База данных аффиксов подземелий
export const DUNGEON_AFFIXES: Record<DungeonAffixType, DungeonAffix> = {
  strong_enemies: {
    type: 'strong_enemies',
    name: 'Крепкие враги',
    description: 'Враги имеют на 15% больше здоровья',
    icon: '💪',
    positive: false
  },
  
  fragile_chests: {
    type: 'fragile_chests',
    name: 'Хрупкие сундуки',
    description: 'Из каждого сундука выпадает на 1 предмет меньше',
    icon: '📦',
    positive: false
  },
  
  dark_paths: {
    type: 'dark_paths',
    name: 'Темные тропы',
    description: 'Начинаете с 2 факелами меньше',
    icon: '🌑',
    positive: false
  },
  
  treasure_call: {
    type: 'treasure_call',
    name: 'Зов сокровищ',
    description: 'Дополнительный сундук и +5% шанс легендарных предметов',
    icon: '✨',
    positive: true
  },
  
  cursed_healing: {
    type: 'cursed_healing',
    name: 'Проклятое исцеление',
    description: 'Алтари восстанавливают на 50% меньше здоровья',
    icon: '🩸',
    positive: false
  },
  
  blessed_combat: {
    type: 'blessed_combat',
    name: 'Благословенный бой',
    description: 'Получаете на 10% больше опыта от сражений',
    icon: '⚔️',
    positive: true
  },
  
  merchant_discount: {
    type: 'merchant_discount',
    name: 'Торговая удача',
    description: 'Цены у торговцев снижены на 20%',
    icon: '💰',
    positive: true
  },
  
  trap_master: {
    type: 'trap_master',
    name: 'Мастер ловушек',
    description: 'Ловушки наносят на 25% больше урона',
    icon: '🪤',
    positive: false
  }
};

// Функция для получения случайных аффиксов
export function getRandomAffixes(count: number = 2, seed?: number): DungeonAffix[] {
  const allAffixes = Object.values(DUNGEON_AFFIXES);
  const rng = seed ? mulberry32(seed) : Math.random;
  
  // Перемешиваем аффиксы
  const shuffled = [...allAffixes].sort(() => rng() - 0.5);
  
  // Берем нужное количество, стараясь сбалансировать позитивные/негативные
  const selected: DungeonAffix[] = [];
  const positive = shuffled.filter(a => a.positive);
  const negative = shuffled.filter(a => !a.positive);
  
  // Стараемся взять поровну позитивных и негативных
  const halfCount = Math.floor(count / 2);
  
  // Добавляем негативные
  for (let i = 0; i < Math.min(halfCount, negative.length); i++) {
    selected.push(negative[i]);
  }
  
  // Добавляем позитивные
  for (let i = 0; i < Math.min(count - selected.length, positive.length); i++) {
    selected.push(positive[i]);
  }
  
  // Если не хватает, добираем любыми
  const remaining = shuffled.filter(a => !selected.includes(a));
  for (let i = 0; i < count - selected.length && i < remaining.length; i++) {
    selected.push(remaining[i]);
  }
  
  return selected;
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

// Функция для применения эффектов аффиксов
export function applyAffixEffects(
  affixes: DungeonAffix[],
  context: {
    type: 'enemy_stats' | 'chest_loot' | 'altar_heal' | 'merchant_price' | 'trap_damage' | 'combat_exp' | 'torch_count';
    value: number;
  }
): number {
  let modifiedValue = context.value;
  
  for (const affix of affixes) {
    switch (affix.type) {
      case 'strong_enemies':
        if (context.type === 'enemy_stats') {
          modifiedValue *= 1.15; // +15% HP врагов
        }
        break;
        
      case 'fragile_chests':
        if (context.type === 'chest_loot') {
          modifiedValue = Math.max(1, modifiedValue - 1); // -1 лут, минимум 1
        }
        break;
        
      case 'dark_paths':
        if (context.type === 'torch_count') {
          modifiedValue = Math.max(1, modifiedValue - 2); // -2 факела, минимум 1
        }
        break;
        
      case 'cursed_healing':
        if (context.type === 'altar_heal') {
          modifiedValue *= 0.5; // -50% исцеления
        }
        break;
        
      case 'blessed_combat':
        if (context.type === 'combat_exp') {
          modifiedValue *= 1.1; // +10% опыт
        }
        break;
        
      case 'merchant_discount':
        if (context.type === 'merchant_price') {
          modifiedValue *= 0.8; // -20% цена
        }
        break;
        
      case 'trap_master':
        if (context.type === 'trap_damage') {
          modifiedValue *= 1.25; // +25% урон
        }
        break;
        
      case 'treasure_call':
        // Этот аффикс обрабатывается при генерации карты (добавляет сундук)
        // и при расчете шанса легендарок
        break;
    }
  }
  
  return Math.round(modifiedValue);
}

