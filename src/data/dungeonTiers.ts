import { DungeonTier } from '@/types/game';

// Уровни сложности подземелий
export const dungeonTiers: DungeonTier[] = [
  {
    tier: 1,
    name: 'Новичковые Катакомбы',
    description: 'Простые подземелья для начинающих искателей приключений',
    minPlayerLevel: 1,
    roomCount: 8,
    difficulty: 'normal',
    baseRewardMultiplier: 1.0,
    enemyLevelBonus: 0,
    affixCount: 1
  },
  {
    tier: 2,
    name: 'Гоблинские Шахты',
    description: 'Заброшенные шахты, полные гоблинов и ловушек',
    minPlayerLevel: 3,
    roomCount: 12,
    difficulty: 'normal',
    baseRewardMultiplier: 1.2,
    enemyLevelBonus: 1,
    affixCount: 1,
    unlockRequirement: {
      completedTiers: 1,
      playerLevel: 3
    }
  },
  {
    tier: 3,
    name: 'Проклятые Руины',
    description: 'Древние руины, наполненные нежитью и темной магией',
    minPlayerLevel: 5,
    roomCount: 16,
    difficulty: 'normal',
    baseRewardMultiplier: 1.5,
    enemyLevelBonus: 2,
    affixCount: 2,
    unlockRequirement: {
      completedTiers: 2,
      playerLevel: 5
    }
  },
  {
    tier: 4,
    name: 'Логово Дракона',
    description: 'Опасное логово огненного дракона с его слугами',
    minPlayerLevel: 8,
    roomCount: 20,
    difficulty: 'heroic',
    baseRewardMultiplier: 2.0,
    enemyLevelBonus: 3,
    affixCount: 2,
    unlockRequirement: {
      completedTiers: 3,
      playerLevel: 8
    }
  },
  {
    tier: 5,
    name: 'Абиссальные Глубины',
    description: 'Бездонные глубины, где обитают демоны и древние ужасы',
    minPlayerLevel: 12,
    roomCount: 24,
    difficulty: 'heroic',
    baseRewardMultiplier: 2.5,
    enemyLevelBonus: 5,
    affixCount: 3,
    unlockRequirement: {
      completedTiers: 4,
      playerLevel: 12
    }
  },
  {
    tier: 6,
    name: 'Храм Забытых Богов',
    description: 'Священный храм, охраняемый божественными стражами',
    minPlayerLevel: 16,
    roomCount: 28,
    difficulty: 'mythic',
    baseRewardMultiplier: 3.0,
    enemyLevelBonus: 7,
    affixCount: 3,
    unlockRequirement: {
      completedTiers: 5,
      playerLevel: 16
    }
  },
  {
    tier: 7,
    name: 'Врата Ада',
    description: 'Портал в адские измерения, полные демонов и пыток',
    minPlayerLevel: 20,
    roomCount: 32,
    difficulty: 'mythic',
    baseRewardMultiplier: 4.0,
    enemyLevelBonus: 10,
    affixCount: 4,
    unlockRequirement: {
      completedTiers: 6,
      playerLevel: 20
    }
  },
  {
    tier: 8,
    name: 'Трон Тьмы',
    description: 'Финальное испытание - трон повелителя тьмы',
    minPlayerLevel: 25,
    roomCount: 36,
    difficulty: 'mythic',
    baseRewardMultiplier: 5.0,
    enemyLevelBonus: 15,
    affixCount: 5,
    unlockRequirement: {
      completedTiers: 7,
      playerLevel: 25
    }
  }
];

// Функция для получения доступных уровней для игрока
export function getAvailableTiers(playerLevel: number, completedTiers: number[]): DungeonTier[] {
  return dungeonTiers.filter(tier => {
    // Проверяем минимальный уровень игрока
    if (playerLevel < tier.minPlayerLevel) return false;
    
    // Проверяем требования разблокировки
    if (tier.unlockRequirement) {
      if (completedTiers.length < tier.unlockRequirement.completedTiers) return false;
      if (playerLevel < tier.unlockRequirement.playerLevel) return false;
    }
    
    return true;
  });
}

// Функция для получения следующего доступного уровня
export function getNextAvailableTier(playerLevel: number, completedTiers: number[]): DungeonTier | null {
  const availableTiers = getAvailableTiers(playerLevel, completedTiers);
  const nextTier = availableTiers.find(tier => !completedTiers.includes(tier.tier));
  return nextTier || null;
}

// Функция для получения уровня по номеру
export function getTierByNumber(tierNumber: number): DungeonTier | null {
  return dungeonTiers.find(tier => tier.tier === tierNumber) || null;
}
