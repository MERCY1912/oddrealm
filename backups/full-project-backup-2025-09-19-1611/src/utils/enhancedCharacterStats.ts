
import { Player, Equipment, ItemStats } from "@/types/game";

export interface StatBreakdown {
  base: number;
  equipment: number;
  attributes: number;
  total: number;
}

export interface EquipmentBonuses extends ItemStats {
  vampirism?: number;
  blockChance?: number;
}

export interface AttributeModifiers {
  attack: number;
  defense: number;
  maxHealth: number;
  maxMana: number;
  critChance: number;
  dodgeChance: number;
  goldBonus: number;
  healthRegen: number;
  antiCritChance: number; // New
  antiDodgeChance: number; // New
}

export interface FinalStats {
  attack: number;
  defense: number;
  maxHealth: number;
  maxMana: number;
  critChance: number;
  dodgeChance: number;
  goldBonus: number;
  healthRegen: number;
  antiCriticalChance: number; // New
  antiDodgeChance: number; // New
  vampirism: number; // New
  blockChance: number; // New
}

// Calculate bonuses from all equipped items
export const calculateEquipmentBonuses = (equipment: Equipment): EquipmentBonuses => {
  const bonuses: EquipmentBonuses = {
    attack: 0, defense: 0, health: 0, mana: 0, strength: 0,
    dexterity: 0, luck: 0, endurance: 0, magic: 0,
    criticalChance: 0, antiCriticalChance: 0, dodgeChance: 0, antiDodgeChance: 0,
    bodyArmor: 0, legArmor: 0, armArmor: 0, headArmor: 0,
    vampirism: 0, blockChance: 0,
  };

  if (!equipment) return bonuses;

  Object.values(equipment).forEach((item) => {
    if (item && item.stats) {
      Object.keys(bonuses).forEach(key => {
        const statKey = key as keyof EquipmentBonuses;
        if (item.stats[statKey]) {
            (bonuses[statKey] as number) += item.stats[statKey]!;
        }
      });
    }
  });

  return bonuses;
};

// Calculate modifiers from attributes
export const calculateAttributeModifiers = (player: Player): AttributeModifiers => {
  const strength = player.strength || 10;
  const dexterity = player.dexterity || 10;
  const luck = player.luck || 10;
  const endurance = player.endurance || 10;
  const magic = player.magic || 10;

  return {
    attack: Math.floor(strength * 2), // 2 attack per strength
    defense: Math.floor(dexterity / 2), // 0.5 defense per dexterity
    maxHealth: Math.floor(endurance * 5), // 5 HP per endurance
    maxMana: Math.floor(magic * 3), // 3 MP per magic
    critChance: Math.floor(luck / 4), // 0.25% crit per luck
    dodgeChance: Math.floor(dexterity / 5), // 0.2% dodge per dexterity
    goldBonus: Math.floor(luck / 3), // Gold bonus from luck
    healthRegen: Math.floor(endurance / 10), // Health regen from endurance
    antiCritChance: Math.floor(endurance / 5), // 0.2% anti-crit per endurance
    antiDodgeChance: Math.floor(strength / 5), // 0.2% anti-dodge per strength
  };
};

// Calculate final stats combining base, equipment, and attributes
export const calculateFinalStats = (player: Player, equipment: Equipment): FinalStats => {
  const equipmentBonuses = calculateEquipmentBonuses(equipment);
  const totalStrength = (player.strength || 0) + (equipmentBonuses.strength || 0);
  const totalDexterity = (player.dexterity || 0) + (equipmentBonuses.dexterity || 0);
  const totalLuck = (player.luck || 0) + (equipmentBonuses.luck || 0);
  const totalEndurance = (player.endurance || 0) + (equipmentBonuses.endurance || 0);
  const totalMagic = (player.magic || 0) + (equipmentBonuses.magic || 0);

  const attributeModifiers: AttributeModifiers = {
    attack: Math.floor(totalStrength * 2),
    defense: Math.floor(totalDexterity / 2),
    maxHealth: Math.floor(totalEndurance * 5),
    maxMana: Math.floor(totalMagic * 3),
    critChance: Math.floor(totalLuck / 4),
    dodgeChance: Math.floor(totalDexterity / 5),
    goldBonus: Math.floor(totalLuck / 3),
    healthRegen: Math.floor(totalEndurance / 10),
    antiCritChance: Math.floor(totalEndurance / 5),
    antiDodgeChance: Math.floor(totalStrength / 5),
  };
  
  const baseAttack = 10 + (player.level - 1) * 2;
  const baseDefense = 5 + (player.level - 1) * 1;
  const baseMaxHealth = 100 + (player.level - 1) * 10;
  const baseMaxMana = 50 + (player.level - 1) * 5;

  const totalArmor = (equipmentBonuses.headArmor || 0) + (equipmentBonuses.bodyArmor || 0) + (equipmentBonuses.armArmor || 0) + (equipmentBonuses.legArmor || 0);

  return {
    attack: baseAttack + (equipmentBonuses.attack || 0) + attributeModifiers.attack,
    defense: baseDefense + (equipmentBonuses.defense || 0) + attributeModifiers.defense + totalArmor,
    maxHealth: baseMaxHealth + (equipmentBonuses.health || 0) + attributeModifiers.maxHealth,
    maxMana: baseMaxMana + (equipmentBonuses.mana || 0) + attributeModifiers.maxMana,
    critChance: attributeModifiers.critChance + (equipmentBonuses.criticalChance || 0),
    dodgeChance: attributeModifiers.dodgeChance + (equipmentBonuses.dodgeChance || 0),
    antiCriticalChance: attributeModifiers.antiCritChance + (equipmentBonuses.antiCriticalChance || 0),
    antiDodgeChance: attributeModifiers.antiDodgeChance + (equipmentBonuses.antiDodgeChance || 0),
    goldBonus: attributeModifiers.goldBonus,
    healthRegen: attributeModifiers.healthRegen,
    vampirism: equipmentBonuses.vampirism || 0,
    blockChance: equipmentBonuses.blockChance || 0,
  };
};

// Get detailed breakdown of a specific stat
export const getStatBreakdown = (player: any, equipment: any, statName: string): StatBreakdown => {
  const equipmentBonuses = calculateEquipmentBonuses(equipment);
  const attributeModifiers = calculateAttributeModifiers(player);

  let base = 0;
  let equipmentBonus = 0;
  let attributeBonus = 0;

  switch (statName) {
    case 'attack':
      base = 10 + (player.level - 1) * 2;
      equipmentBonus = equipmentBonuses.attack;
      attributeBonus = attributeModifiers.attack;
      break;
    case 'defense':
      base = 5 + (player.level - 1) * 1;
      equipmentBonus = equipmentBonuses.defense;
      attributeBonus = attributeModifiers.defense;
      break;
    case 'maxHealth':
      base = 100 + (player.level - 1) * 10;
      equipmentBonus = equipmentBonuses.health;
      attributeBonus = attributeModifiers.maxHealth;
      break;
    case 'maxMana':
      base = 50 + (player.level - 1) * 5;
      equipmentBonus = equipmentBonuses.mana;
      attributeBonus = attributeModifiers.maxMana;
      break;
  }

  return {
    base,
    equipment: equipmentBonus,
    attributes: attributeBonus,
    total: base + equipmentBonus + attributeBonus,
  };
};

// Update player stats based on calculated values
export const updatePlayerWithCalculatedStats = (player: Player, equipment: Equipment): Player => {
  const finalStats = calculateFinalStats(player, equipment);
  
  const equipmentBonuses = calculateEquipmentBonuses(equipment);

  return {
    ...player,
    attack: finalStats.attack,
    defense: finalStats.defense,
    maxHealth: finalStats.maxHealth,
    maxMana: finalStats.maxMana,
    health: Math.min(player.health, finalStats.maxHealth),
    mana: Math.min(player.mana, finalStats.maxMana),
    // Also update total attributes on the player object for display
    strength: (player.freeStatPoints > 0 ? player.strength : (player.strength - (calculateEquipmentBonuses(player.equipment).strength || 0))) + (equipmentBonuses.strength || 0),
    dexterity: (player.freeStatPoints > 0 ? player.dexterity : (player.dexterity - (calculateEquipmentBonuses(player.equipment).dexterity || 0))) + (equipmentBonuses.dexterity || 0),
    luck: (player.freeStatPoints > 0 ? player.luck : (player.luck - (calculateEquipmentBonuses(player.equipment).luck || 0))) + (equipmentBonuses.luck || 0),
    endurance: (player.freeStatPoints > 0 ? player.endurance : (player.endurance - (calculateEquipmentBonuses(player.equipment).endurance || 0))) + (equipmentBonuses.endurance || 0),
    magic: (player.freeStatPoints > 0 ? player.magic : (player.magic - (calculateEquipmentBonuses(player.equipment).magic || 0))) + (equipmentBonuses.magic || 0),
  };
};
