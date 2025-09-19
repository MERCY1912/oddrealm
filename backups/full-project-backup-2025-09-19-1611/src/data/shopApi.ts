
import { supabase } from '@/integrations/supabase/client';
import { Item, ItemRarity, ItemType, WeaponType } from '@/types/game';
import { enhancedShopItems } from './enhancedShopItems';

// Конвертируем предмет из формата базы данных во фронтенд-тип Item
const convertDbItemToItem = (dbItem: any): Item => {
  const stats = dbItem.stats || {};
  
  // Логируем предметы с названием "Величие холодной стали"
  if (dbItem.name && dbItem.name.includes('холодной')) {
    console.log('convertDbItemToItem: Processing "Величие холодной стали":', {
      originalData: dbItem,
      image_url: dbItem.image_url,
      rarity: dbItem.rarity
    });
  }
  
  const convertedItem = {
    id: dbItem.item_id,
    name: dbItem.name,
    type: dbItem.type as ItemType,
    rarity: dbItem.rarity as ItemRarity,
    price: dbItem.price,
    description: dbItem.description || '',
    requirements: dbItem.requirements,
    levelReq: stats.levelReq,
    weaponType: dbItem.weapon_type as WeaponType,
    image_url: dbItem.image_url,
    stats: {
      attack: stats.attack,
      defense: stats.defense,
      health: stats.health,
      mana: stats.mana,
      strength: stats.strength,
      dexterity: stats.dexterity,
      luck: stats.luck,
      endurance: stats.endurance,
      magic: stats.magic,
      criticalChance: stats.criticalChance,
      antiCriticalChance: stats.antiCriticalChance,
      dodgeChance: stats.dodgeChance,
      antiDodgeChance: stats.antiDodgeChance,
      bodyArmor: stats.bodyArmor,
      legArmor: stats.legArmor,
      armArmor: stats.armArmor,
      headArmor: stats.headArmor,
      vampirism: stats.vampirism,
      blockChance: stats.blockChance,
    },
  };
  
  // Логируем результат конвертации для "Величие холодной стали"
  if (dbItem.name && dbItem.name.includes('холодной')) {
    console.log('convertDbItemToItem: Converted "Величие холодной стали":', {
      convertedItem,
      image_url: convertedItem.image_url,
      rarity: convertedItem.rarity
    });
  }
  
  return convertedItem;
};

export const fetchShopItems = async (): Promise<Item[]> => {
  // Получаем предметы из базы данных
  const { data, error } = await supabase
    .from('admin_shop_items')
    .select('*')
    .eq('is_active', true);

  let dbItems: Item[] = [];
  
  if (error) {
    console.error('Error fetching shop items from database:', error);
  } else if (data) {
    console.log('fetchShopItems: Raw data from database:', data.length, 'items');
    // Логируем предмет "Величие холодной стали" из базы данных
    const armorItem = data.find(item => item.name && item.name.includes('холодной'));
    if (armorItem) {
      console.log('fetchShopItems: Found "Величие холодной стали" in database:', armorItem);
    }
    
    dbItems = data.map(convertDbItemToItem);
  }

  // Получаем тестовые предметы из enhancedShopItems
  const testItems: Item[] = [];
  
  // Собираем все предметы из всех категорий
  Object.values(enhancedShopItems).forEach(categoryItems => {
    testItems.push(...categoryItems);
  });

  // Объединяем предметы из базы данных и тестовые предметы
  // Тестовые предметы имеют приоритет (перезаписывают предметы с тем же ID)
  const allItems = [...dbItems];
  
  testItems.forEach(testItem => {
    const existingIndex = allItems.findIndex(item => item.id === testItem.id);
    if (existingIndex >= 0) {
      // Заменяем существующий предмет
      allItems[existingIndex] = testItem;
    } else {
      // Добавляем новый предмет
      allItems.push(testItem);
    }
  });

  console.log('Total shop items loaded:', allItems.length);
  console.log('DB items:', dbItems.length);
  console.log('Test items:', testItems.length);
  
  // Логируем финальный предмет "Величие холодной стали"
  const finalArmorItem = allItems.find(item => item.name && item.name.includes('холодной'));
  if (finalArmorItem) {
    console.log('fetchShopItems: Final "Величие холодной стали" item:', {
      id: finalArmorItem.id,
      name: finalArmorItem.name,
      rarity: finalArmorItem.rarity,
      image_url: finalArmorItem.image_url,
      type: finalArmorItem.type
    });
  }

  return allItems;
};
