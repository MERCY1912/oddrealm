import { ExpeditionResource, DungeonAffix, Player } from '@/types/game';
import { applyAffixEffects } from '@/data/dungeonAffixes';

// Расчет начального количества факелов
export function calculateInitialTorches(playerLevel: number, affixes: DungeonAffix[]): number {
  // Базовая формула: 5 + ⌊уровень / 5⌋, максимум 10
  const baseTorches = Math.min(10, 5 + Math.floor(playerLevel / 5));
  
  // Применяем эффекты аффиксов
  return applyAffixEffects(affixes, {
    type: 'torch_count',
    value: baseTorches
  });
}

// Создание начального ресурса экспедиции
export function createExpeditionResource(playerLevel: number, affixes: DungeonAffix[]): ExpeditionResource {
  const torches = calculateInitialTorches(playerLevel, affixes);
  
  return {
    torches,
    maxTorches: torches,
    exhausted: false
  };
}

// Трата факела при переходе между комнатами
export function consumeTorch(resource: ExpeditionResource): ExpeditionResource {
  const newTorches = Math.max(0, resource.torches - 1);
  
  return {
    ...resource,
    torches: newTorches,
    exhausted: newTorches === 0
  };
}

// Восстановление факела (от алтаря или торговца)
export function restoreTorch(resource: ExpeditionResource, amount: number = 1): ExpeditionResource {
  const newTorches = Math.min(resource.maxTorches, resource.torches + amount);
  
  return {
    ...resource,
    torches: newTorches,
    exhausted: newTorches === 0
  };
}

// Применение штрафов при истощении факелов
export function applyExhaustionPenalties(player: Player, resource: ExpeditionResource): {
  modifiedPlayer: Player;
  penalties: {
    healthReduction: number;
    damageIncrease: number;
  };
} {
  if (!resource.exhausted) {
    return {
      modifiedPlayer: player,
      penalties: { healthReduction: 0, damageIncrease: 0 }
    };
  }
  
  // Штрафы при истощении: -10% HP, +10% урона врагов
  const healthReduction = Math.floor(player.maxHealth * 0.1);
  const modifiedHealth = Math.max(1, player.health - healthReduction);
  
  return {
    modifiedPlayer: {
      ...player,
      health: modifiedHealth
    },
    penalties: {
      healthReduction,
      damageIncrease: 10 // процент увеличения урона врагов
    }
  };
}

// Расчет бонуса к награде от непотраченных факелов
export function calculateTorchBonus(resource: ExpeditionResource): number {
  const unusedTorches = resource.torches;
  const maxTorches = resource.maxTorches;
  
  // 3% бонуса за каждый непотраченный факел
  return (unusedTorches / maxTorches) * 0.03;
}

// Проверка можно ли совершить действие (некоторые события требуют факелы)
export function canAffordTorchCost(resource: ExpeditionResource, cost: number): boolean {
  return resource.torches >= cost;
}

// Трата факелов на особые действия
export function spendTorchesForAction(
  resource: ExpeditionResource, 
  cost: number,
  action: 'heavy_movement' | 'light_source' | 'trap_detection'
): ExpeditionResource | null {
  if (!canAffordTorchCost(resource, cost)) {
    return null;
  }
  
  const newTorches = resource.torches - cost;
  
  return {
    ...resource,
    torches: newTorches,
    exhausted: newTorches === 0
  };
}

// Получение описания текущего состояния ресурсов
export function getResourceStatusDescription(resource: ExpeditionResource): {
  status: 'abundant' | 'moderate' | 'low' | 'exhausted';
  description: string;
  warning?: string;
} {
  const percentage = resource.torches / resource.maxTorches;
  
  if (resource.exhausted) {
    return {
      status: 'exhausted',
      description: 'Факелы закончились',
      warning: 'Каждый бой начинается с -10% HP и враги наносят +10% урона!'
    };
  }
  
  if (percentage <= 0.25) {
    return {
      status: 'low',
      description: `Факелов осталось мало (${resource.torches}/${resource.maxTorches})`,
      warning: 'Скоро факелы закончатся. Рассмотрите возможность выхода.'
    };
  }
  
  if (percentage <= 0.5) {
    return {
      status: 'moderate',
      description: `Факелов достаточно (${resource.torches}/${resource.maxTorches})`
    };
  }
  
  return {
    status: 'abundant',
    description: `Много факелов (${resource.torches}/${resource.maxTorches})`
  };
}

// Событийные эффекты связанные с факелами
export function handleTorchEvent(
  resource: ExpeditionResource,
  eventType: 'find_torch' | 'lose_torch' | 'double_cost' | 'free_movement'
): {
  newResource: ExpeditionResource;
  message: string;
} {
  switch (eventType) {
    case 'find_torch':
      const restored = restoreTorch(resource, 1);
      return {
        newResource: restored,
        message: `Вы нашли факел! (+1 факел, всего: ${restored.torches})`
      };
      
    case 'lose_torch':
      const consumed = consumeTorch(resource);
      return {
        newResource: consumed,
        message: `Факел погас от сильного ветра (-1 факел, осталось: ${consumed.torches})`
      };
      
    case 'double_cost':
      const doubleCost = consumeTorch(consumeTorch(resource));
      return {
        newResource: doubleCost,
        message: `Темный коридор потребовал больше света (-2 факела, осталось: ${doubleCost.torches})`
      };
      
    case 'free_movement':
      return {
        newResource: resource,
        message: 'Естественное освещение позволяет не тратить факел'
      };
      
    default:
      return {
        newResource: resource,
        message: ''
      };
  }
}




