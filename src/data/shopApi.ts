
import { supabase } from '@/integrations/supabase/client';
import { Item, ItemRarity, ItemType, WeaponType } from '@/types/game';
import { enhancedShopItems } from './enhancedShopItems';

// Конвертируем предмет из формата базы данных во фронтенд-тип Item
const convertDbItemToItem = (dbItem: any): Item => {
  const stats = dbItem.stats || {};
  return {
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

  return allItems;
};
