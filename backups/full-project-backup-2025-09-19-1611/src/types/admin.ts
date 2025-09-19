export interface AdminShopItem {
    id: string;
    item_id: string;
    name: string;
    type: string;
    rarity: string;
    weapon_type?: string;
    stats: {
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
      bodyArmor?: number;
      legArmor?: number;
      armArmor?: number;
      headArmor?: number;
      vampirism?: number;
      blockChance?: number;
    };
    price: number;
    description?: string;
    image_url?: string;
    requirements?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface ItemFormData {
    item_id: string;
    name: string;
    type: string;
    weaponType: string;
    rarity: string;
    stats: {
      attack: number;
      defense: number;
      health: number;
      mana: number;
      criticalChance: number;
      antiCriticalChance: number;
      dodgeChance: number;
      antiDodgeChance: number;
      strength: number;
      dexterity: number;
      luck: number;
      endurance: number;
      magic: number;
      bodyArmor: number;
      legArmor: number;
      armArmor: number;
      headArmor: number;
      vampirism: number;
      blockChance: number;
    };
    price: number;
    description: string;
    requirements: string;
    is_active: boolean;
  }

export interface AdminLocation {
  id: string;
  location_id: string;
  name: string;
  description?: string;
  image_url?: string;
  background_gradient?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Новые типы для админки v2
export interface AdminShopItemV2 {
  id: string;
  item_id: string;
  name: string;
  type: string;
  rarity: string;
  weapon_type?: string;
  stats: {
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
    bodyArmor?: number;
    legArmor?: number;
    armArmor?: number;
    headArmor?: number;
    vampirism?: number;
    blockChance?: number;
  };
  price: number;
  description?: string;
  image_url?: string;
  requirements?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemFormDataV2 {
  item_id: string;
  name: string;
  type: string;
  weaponType: string;
  rarity: string;
  stats: {
    attack: number;
    defense: number;
    health: number;
    mana: number;
    criticalChance: number;
    antiCriticalChance: number;
    dodgeChance: number;
    antiDodgeChance: number;
    strength: number;
    dexterity: number;
    luck: number;
    endurance: number;
    magic: number;
    bodyArmor: number;
    legArmor: number;
    armArmor: number;
    headArmor: number;
    vampirism: number;
    blockChance: number;
  };
  price: number;
  description: string;
  requirements: string;
  is_active: boolean;
}
