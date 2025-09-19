
export interface StatModifiers {
  attack: number;
  defense: number;
  maxHealth: number;
  maxMana: number;
  dodgeChance: number;
  critChance: number;
  magicDamage: number;
}

export const calculateStatModifiers = (stats: {
  strength: number;
  dexterity: number;
  luck: number;
  endurance: number;
  magic: number;
}): StatModifiers => {
  return {
    attack: stats.strength, // +1 урона за силу
    defense: stats.endurance, // +1 броня за выносливость
    maxHealth: stats.strength + (stats.endurance * 5), // +1 ХП за силу, +5 ХП за выносливость
    maxMana: stats.magic * 5, // +5 маны за магию
    dodgeChance: stats.dexterity * 0.3, // +0.3% уворота за ловкость
    critChance: stats.luck * 0.3, // +0.3% крита за удачу
    magicDamage: stats.magic * 0.3, // +0.3% урона магией за магию
  };
};

export const applyStatModifiers = (baseStats: any, statModifiers: StatModifiers) => {
  return {
    ...baseStats,
    attack: baseStats.attack + statModifiers.attack,
    defense: baseStats.defense + statModifiers.defense,
    max_health: baseStats.max_health + statModifiers.maxHealth,
    max_mana: baseStats.max_mana + statModifiers.maxMana,
  };
};
