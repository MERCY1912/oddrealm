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

// Dungeon System Types
export interface Dungeon {
  id: string;
  dungeon_id: string;
  name: string;
  description: string;
  min_level: number;
  max_level: number;
  difficulty: DungeonDifficulty;
  rooms_count: number;
  base_reward_gold: number;
  base_reward_exp: number;
  image_url?: string;
  background_gradient?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DungeonRoom {
  id: string;
  dungeon_id: string;
  room_number: number;
  room_type: DungeonRoomType;
  enemy_data?: Bot;
  event_data?: DungeonEvent;
  rewards: DungeonRewards;
  is_boss: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DungeonRun {
  id: string;
  player_id: string;
  dungeon_id: string;
  current_room: number;
  player_health: number;
  player_mana: number;
  player_gold: number;
  player_exp: number;
  inventory_snapshot: any;
  completed_rooms: number[];
  status: DungeonRunStatus;
  started_at: string;
  completed_at?: string;
}

export interface DungeonEvent {
  id: string;
  event_id: string;
  name: string;
  description: string;
  event_type: DungeonEventType;
  effects: DungeonEventEffects;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DungeonRewards {
  gold?: number;
  exp?: number;
  items?: Item[];
}

export interface DungeonEventEffects {
  heal?: number;
  mana?: number;
  damage?: number;
  gold?: number;
  exp?: number;
  items?: string[];
  prices?: number[];
  random_effect?: boolean;
}

export type DungeonDifficulty = 'normal' | 'heroic' | 'mythic';
export type DungeonRoomType = 'battle' | 'event' | 'boss' | 'treasure';
export type DungeonRunStatus = 'active' | 'completed' | 'abandoned' | 'died';
export type DungeonEventType = 'trader' | 'trap' | 'rest' | 'treasure' | 'puzzle';

// Новые типы для системы исследования подземелий
export type RoomType = 'start' | 'combat' | 'event' | 'altar' | 'trap' | 'merchant' | 'chest' | 'boss' | 'unknown' | 'secret' | 'cursed' | 'blessed';

export interface Room {
  id: string;
  type: RoomType;
  neighbors: string[];
  x: number;
  y: number;
  visited?: boolean;
  used?: boolean; // для одноразовых комнат (алтарь, торговец)
  defeated?: boolean; // Побежден ли монстр в этой комнате
  looted?: boolean; // Разграблен ли сундук
}

export interface DungeonMap {
  id: string;
  seed: number;
  rooms: Record<string, Room>;
  startId: string;
  bossId: string;
  name: string;
  description: string;
  difficulty: 'normal' | 'heroic' | 'mythic';
  level: number;
}

export interface DungeonRunV2 {
  id: string;
  player_id: string;
  dungeon_id: string;
  current_room: string;
  visited_rooms: string[];
  player_health: number;
  player_mana: number;
  player_gold: number;
  player_exp: number;
  inventory_delta: any; // найденный лут до выхода
  status: 'in_progress' | 'exited' | 'dead' | 'cleared';
  started_at: string;
  updated_at: string;
}

// ========== УЛУЧШЕННАЯ СИСТЕМА ПОДЗЕМЕЛИЙ ==========

// 1) Цели подземелий
export type DungeonGoalType = 'key_boss' | 'rescue_prisoner' | 'collect_shards';

export interface DungeonGoal {
  type: DungeonGoalType;
  description: string;
  icon: string;
  current: number;
  required: number;
  completed: boolean;
}

// 2) Система факелов/выносливости  
export interface ExpeditionResource {
  torches: number;
  maxTorches: number;
  exhausted: boolean; // когда факелы закончились
}

// 3) Аффиксы забега
export type DungeonAffixType = 
  | 'strong_enemies'     // +15% HP врагов
  | 'fragile_chests'     // -1 лут из сундуков
  | 'dark_paths'         // -2 факела в старт
  | 'treasure_call'      // +1 сундук, +5% легендарки
  | 'cursed_healing'     // -50% хил от алтарей
  | 'blessed_combat'     // +10% опыт от боев
  | 'merchant_discount'  // -20% цены у торговцев
  | 'trap_master';       // +25% урон от ловушек

export interface DungeonAffix {
  type: DungeonAffixType;
  name: string;
  description: string;
  icon: string;
  positive: boolean; // положительный или отрицательный эффект
}

// 4) Система оценки опасности
export type ThreatLevel = 1 | 2 | 3; // ★☆☆, ★★☆, ★★★

export interface RoomThreat {
  level: ThreatLevel;
  hint?: string; // "слышны монеты", "запах крови" и т.д.
  hintChance: number; // 0-100% шанс показать подсказку
}

// 5) Очки исследования и награды
export interface ExplorationPoints {
  current: number;
  fromSafeRooms: number;   // по 1 очку
  fromDangerous: number;   // по 2 очка
  fromBoss: number;        // 3 очка
}

export interface DungeonRunRewards {
  baseGold: number;
  baseExp: number;
  explorationMultiplier: number; // от очков исследования
  torchBonus: number;           // от непотраченных факелов
  finalGold: number;
  finalExp: number;
  items: Item[];
}

// 6) Улучшенная комната с новыми свойствами
export interface EnhancedRoom extends Room {
  threat: RoomThreat;
  goal_item?: 'key' | 'shard' | 'prisoner'; // для целей подземелья
  locked?: boolean; // для врат к боссу
  distance_from_start?: number; // для скалирования
}

// 7) Улучшенная карта подземелья
export interface EnhancedDungeonMap extends Omit<DungeonMap, 'rooms'> {
  rooms: Record<string, EnhancedRoom>;
  goal: DungeonGoal;
  affixes: DungeonAffix[];
  gateRoomId?: string; // ID комнаты-врат перед боссом
  keyRooms: string[];  // комнаты с ключами/осколками
}

// 8) Улучшенный забег
export interface EnhancedDungeonRun extends Omit<DungeonRunV2, 'status'> {
  goal: DungeonGoal;
  resources: ExpeditionResource;
  explorationPoints: ExplorationPoints;
  affixes: DungeonAffix[];
  status: 'in_progress' | 'exited' | 'dead' | 'cleared' | 'goal_completed';
  rewards?: DungeonRunRewards;
}

// 9) Настройки генерации улучшенного подземелья
export interface EnhancedDungeonGenConfig {
  roomCount: number;
  minPathToBoss: number;
  roomDistribution: {
    combat: number;
    event: number;
    trap: number;
    altar: number;
    merchant: number;
    chest: number;
  };
  goalType: DungeonGoalType;
  affixCount: number;
  difficulty: 'normal' | 'heroic' | 'mythic';
  playerLevel: number;
}

// ========== СИСТЕМА ПРОГРЕССИИ ПОДЗЕМЕЛИЙ ==========

// Уровни сложности подземелий
export interface DungeonTier {
  tier: number;
  name: string;
  description: string;
  minPlayerLevel: number;
  roomCount: number;
  difficulty: 'normal' | 'heroic' | 'mythic';
  baseRewardMultiplier: number;
  enemyLevelBonus: number;
  affixCount: number;
  unlockRequirement?: {
    completedTiers: number;
    playerLevel: number;
  };
}

// Прогресс игрока в подземельях
export interface DungeonProgress {
  currentTier: number;
  completedTiers: number[];
  totalDungeonsCompleted: number;
  totalBossesDefeated: number;
  highestTierReached: number;
  lastCompletedAt?: string;
}

// Результат завершения подземелья
export interface DungeonCompletionResult {
  success: boolean;
  tier: number;
  rewards: {
    gold: number;
    exp: number;
    items: Item[];
  };
  progress: {
    tierUnlocked: boolean;
    newTier?: number;
    achievements: string[];
  };
}
