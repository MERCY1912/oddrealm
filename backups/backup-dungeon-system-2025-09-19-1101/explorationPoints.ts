import { ExplorationPoints, RoomType, DungeonRunRewards, ExpeditionResource } from '@/types/game';

// Создание начального объекта очков исследования
export function createExplorationPoints(): ExplorationPoints {
  return {
    current: 0,
    fromSafeRooms: 0,
    fromDangerous: 0,
    fromBoss: 0
  };
}

// Получение очков за посещение комнаты
export function getPointsForRoom(roomType: RoomType): {
  points: number;
  category: 'safe' | 'dangerous' | 'boss';
} {
  switch (roomType) {
    case 'start':
    case 'altar':
    case 'merchant':
    case 'chest':
      return { points: 1, category: 'safe' };
      
    case 'combat':
    case 'event':
    case 'trap':
      return { points: 2, category: 'dangerous' };
      
    case 'boss':
      return { points: 3, category: 'boss' };
      
    default:
      return { points: 1, category: 'safe' };
  }
}

// Добавление очков за посещение комнаты
export function addExplorationPoints(
  current: ExplorationPoints, 
  roomType: RoomType
): ExplorationPoints {
  const { points, category } = getPointsForRoom(roomType);
  
  const updated = {
    ...current,
    current: current.current + points
  };
  
  switch (category) {
    case 'safe':
      updated.fromSafeRooms += points;
      break;
    case 'dangerous':
      updated.fromDangerous += points;
      break;
    case 'boss':
      updated.fromBoss += points;
      break;
  }
  
  return updated;
}

// Расчет множителя наград от очков исследования
export function calculateExplorationMultiplier(points: ExplorationPoints): number {
  // 5% бонуса за каждое очко исследования
  return 1 + (points.current * 0.05);
}

// Расчет финальных наград за забег
export function calculateFinalRewards(
  baseGold: number,
  baseExp: number,
  explorationPoints: ExplorationPoints,
  expeditionResource: ExpeditionResource,
  goalCompleted: boolean = false
): DungeonRunRewards {
  // Множители
  const explorationMultiplier = calculateExplorationMultiplier(explorationPoints);
  const torchBonus = calculateTorchBonus(expeditionResource);
  const goalBonus = goalCompleted ? 0.5 : 0; // +50% за выполнение цели
  
  const totalMultiplier = explorationMultiplier + torchBonus + goalBonus;
  
  const finalGold = Math.round(baseGold * totalMultiplier);
  const finalExp = Math.round(baseExp * totalMultiplier);
  
  return {
    baseGold,
    baseExp,
    explorationMultiplier,
    torchBonus,
    finalGold,
    finalExp,
    items: [] // предметы добавляются отдельно
  };
}

// Расчет бонуса от непотраченных факелов
function calculateTorchBonus(resource: ExpeditionResource): number {
  const unusedTorches = resource.torches;
  const maxTorches = resource.maxTorches;
  
  // 3% бонуса за каждый непотраченный факел
  return (unusedTorches / maxTorches) * 0.03;
}

// Получение описания прогресса исследования
export function getExplorationDescription(points: ExplorationPoints): {
  total: number;
  breakdown: string;
  multiplier: string;
  rank: 'novice' | 'explorer' | 'veteran' | 'master';
} {
  const total = points.current;
  const multiplier = `+${Math.round(calculateExplorationMultiplier(points) * 100 - 100)}%`;
  
  const breakdown = [
    points.fromSafeRooms > 0 ? `Безопасные: ${points.fromSafeRooms}` : '',
    points.fromDangerous > 0 ? `Опасные: ${points.fromDangerous}` : '',
    points.fromBoss > 0 ? `Босс: ${points.fromBoss}` : ''
  ].filter(Boolean).join(', ');
  
  let rank: 'novice' | 'explorer' | 'veteran' | 'master';
  if (total >= 20) rank = 'master';
  else if (total >= 15) rank = 'veteran';
  else if (total >= 10) rank = 'explorer';
  else rank = 'novice';
  
  return {
    total,
    breakdown,
    multiplier,
    rank
  };
}

// Получение достижений за исследование
export function getExplorationAchievements(points: ExplorationPoints): {
  name: string;
  description: string;
  icon: string;
}[] {
  const achievements = [];
  
  if (points.fromSafeRooms >= 5) {
    achievements.push({
      name: 'Осторожный исследователь',
      description: 'Посетите 5+ безопасных комнат',
      icon: '🛡️'
    });
  }
  
  if (points.fromDangerous >= 8) {
    achievements.push({
      name: 'Смельчак',
      description: 'Посетите 4+ опасных комнаты',
      icon: '⚔️'
    });
  }
  
  if (points.fromBoss >= 3) {
    achievements.push({
      name: 'Убийца боссов',
      description: 'Победите босса',
      icon: '👑'
    });
  }
  
  if (points.current >= 20) {
    achievements.push({
      name: 'Мастер подземелий',
      description: 'Наберите 20+ очков исследования',
      icon: '🏆'
    });
  }
  
  return achievements;
}

// Предсказание награды (для показа игроку перед выходом)
export function predictRewards(
  currentPoints: ExplorationPoints,
  currentResource: ExpeditionResource,
  baseGold: number,
  baseExp: number,
  goalCompleted: boolean = false
): {
  estimatedGold: number;
  estimatedExp: number;
  bonusBreakdown: {
    exploration: string;
    torches: string;
    goal: string;
  };
} {
  const rewards = calculateFinalRewards(
    baseGold, 
    baseExp, 
    currentPoints, 
    currentResource, 
    goalCompleted
  );
  
  return {
    estimatedGold: rewards.finalGold,
    estimatedExp: rewards.finalExp,
    bonusBreakdown: {
      exploration: `+${Math.round((rewards.explorationMultiplier - 1) * 100)}%`,
      torches: `+${Math.round(rewards.torchBonus * 100)}%`,
      goal: goalCompleted ? '+50%' : '+0%'
    }
  };
}

// Система рисков и решений
export function getExitDecisionInfo(
  currentPoints: ExplorationPoints,
  currentResource: ExpeditionResource,
  goalCompleted: boolean,
  roomsLeft: number
): {
  recommendation: 'continue' | 'consider_exit' | 'exit_now';
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
} {
  const torchPercentage = currentResource.torches / currentResource.maxTorches;
  const pointsPerRoom = currentPoints.current / Math.max(1, currentPoints.current);
  
  // Определяем уровень риска
  let riskLevel: 'low' | 'medium' | 'high';
  if (currentResource.exhausted) {
    riskLevel = 'high';
  } else if (torchPercentage < 0.3) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }
  
  // Рекомендация
  let recommendation: 'continue' | 'consider_exit' | 'exit_now';
  let reasoning: string;
  
  if (currentResource.exhausted && !goalCompleted) {
    recommendation = 'exit_now';
    reasoning = 'Факелы закончились, а цель не выполнена. Высокий риск смерти.';
  } else if (goalCompleted && torchPercentage < 0.2) {
    recommendation = 'consider_exit';
    reasoning = 'Цель выполнена, факелов мало. Можно выйти с гарантированной наградой.';
  } else if (goalCompleted && roomsLeft > 5 && torchPercentage > 0.5) {
    recommendation = 'continue';
    reasoning = 'Цель выполнена, ресурсов достаточно. Можно исследовать больше для бонусов.';
  } else if (!goalCompleted && torchPercentage > 0.3) {
    recommendation = 'continue';
    reasoning = 'Цель не выполнена, ресурсов достаточно. Продолжайте поиски.';
  } else {
    recommendation = 'consider_exit';
    reasoning = 'Взвесьте риски и потенциальные награды.';
  }
  
  return {
    recommendation,
    reasoning,
    riskLevel
  };
}



