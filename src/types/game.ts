export interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  gold: number;
  class: PlayerClass;
  equipment: Equipment;
  strength: number;
  dexterity: number;
  luck: number;
  endurance: number;
  magic: number;
  freeStatPoints: number;
  avatar_url?: string | null;
  character_image_url?: string | null;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  helmet?: Item;
  boots?: Item;
  gloves?: Item;
  belt?: Item;
  necklace?: Item;
  ring1?: Item;
  ring2?: Item;
  ring3?: Item;
  shield?: Item;
  leggings?: Item;
  bracers?: Item;   // Наручи
  earring?: Item;   // Серьга
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats: ItemStats;
  price: number;
  description: string;
  image_url?: string;
  requirements?: string;
  levelReq?: number;
  weaponType?: WeaponType;
  weight?: number;
  quantity?: number;
  durability?: {
    current: number;
    max: number;
  };
  effects?: { [key: string]: number };
}

export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  criticalChance?: number;
  antiCriticalChance?: number;
  dodgeChance?: number;
  antiDodgeChance?: number;
  strength?: number;
  dexterity?: number;
  luck?: number;
  endurance?: number;
  magic?: number;
  intuition?: number;
  bodyArmor?: number | string;
  legArmor?: number;
  armArmor?: number;
  headArmor?: number;
  vampirism?: number;
  blockChance?: number;
  fireResistance?: number;
  coldResistance?: number;
  darkResistance?: number;
  crushResistance?: number;
  stealth?: number;
}

export interface Bot {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  difficulty: BotDifficulty;
  image: string;
  floorType?: 'normal' | 'mini-boss' | 'boss';
}

export interface ArenaBot {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  difficulty: ArenaBotDifficulty;
  image: string;
  image_url?: string;
  // Характеристики бота
  strength: number;
  dexterity: number;
  luck: number;
  endurance: number;
  // Дополнительные характеристики
  critChance: number;
  dodgeChance: number;
  blockChance: number;
  // Описание и тип
  description: string;
  botType: ArenaBotType;
}

export interface TowerProgress {
  currentFloor: number;
  maxFloorReached: number;
  isInTower: boolean;
  canRest: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export interface PlayerProfile {
  id: string;
  username: string;
  character_class: string;
  level: number;
  experience: number;
  experience_to_next: number;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  attack: number;
  defense: number;
  gold: number;
  strength: number;
  dexterity: number;
  luck: number;
  endurance: number;
  magic: number;
  free_stat_points: number;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string | null;
  character_image_url?: string | null;
  description?: string | null;
  city?: string | null;
}

export interface PlayerEquipmentDb {
  weapon?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  armor?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  helmet?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  boots?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  gloves?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  belt?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  necklace?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  ring1?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  ring2?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  ring3?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  ring4?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  shield?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  leggings?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  bracers?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
  earring?: { name: string; stats: any; rarity?: string; image_url?: string; description?: string; price?: number; weaponType?: string; weapon_type?: string };
}

export type PlayerClass = 'warrior' | 'mage' | 'archer';
export type ItemType =
  | 'weapon'
  | 'armor'
  | 'helmet'
  | 'boots'
  | 'gloves'
  | 'belt'
  | 'necklace'
  | 'ring'
  | 'shield'
  | 'leggings'
  | 'bracers'
  | 'earring'
  | 'quest'
  | 'consumable'
  | 'material'
  | 'spell'
  | 'elixir'
  | 'charm'
  | 'rune'
  | 'food'
  | 'misc';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type WeaponType = 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'mace';
export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type ArenaBotDifficulty = 'easy' | 'medium' | 'hard';
  export type ArenaBotType = 'warrior' | 'mage' | 'archer' | 'rogue' | 'paladin' | 'berserker';
  export type GameScreen = 'login' | 'register' | 'character-creation' | 'game';

  // PvP System Types
  export type BattleZone = 'head' | 'chest' | 'stomach' | 'groin' | 'legs';

  export interface PvPRequest {
    id: string;
    challengerId: string;
    challengerName: string;
    challengerLevel: number;
    challengerClass: PlayerClass;
    waitTime: number; // в минутах (2, 5, 10)
    createdAt: Date;
    expiresAt: Date;
    status: 'waiting' | 'accepted' | 'expired' | 'cancelled';
    acceptedBy?: string;
  }

  export interface PvPBattle {
    id: string;
    player1: {
      id: string;
      name: string;
      level: number;
      class: PlayerClass;
      currentHealth: number;
      maxHealth: number;
      stats: any;
    };
    player2: {
      id: string;
      name: string;
      level: number;
      class: PlayerClass;
      currentHealth: number;
      maxHealth: number;
      stats: any;
    };
    currentTurn: 1 | 2;
    round: number;
    status: 'waiting_for_moves' | 'processing' | 'finished';
    winner?: string;
    moves: {
      player1?: PvPMove;
      player2?: PvPMove;
    };
    battleLog: string[];
    rewards?: {
      winner: { experience: number; gold: number; rating: number };
      loser: { experience: number; gold: number; rating: number };
    };
    createdAt: Date;
    updatedAt: Date;
  }

  export interface PvPMove {
    playerId: string;
    attackZone: BattleZone;
    defenseZone: BattleZone;
    timestamp: Date;
  }

  export interface PvPRating {
    playerId: string;
    username: string;
    rating: number;
    wins: number;
    losses: number;
    draws: number;
    totalBattles: number;
    rank: number;
    lastBattle?: Date;
  }

  export type PvPStatus = 'idle' | 'creating_request' | 'waiting_for_opponent' | 'in_battle' | 'battle_finished';
