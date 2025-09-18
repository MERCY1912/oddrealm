
import { supabase } from '@/integrations/supabase/client';
import { Item } from '@/types/game';

export interface InventoryItem {
  id: string;
  player_id: string;
  item_id: string;
  item_data: Item;
  quantity: number;
  created_at: string;
}

export const loadInventoryFromSupabase = async (playerId: string): Promise<Item[]> => {
  try {
    console.log('loadInventoryFromSupabase: Loading inventory for player:', playerId);
    const { data, error } = await supabase
      .from('player_inventory')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      console.error('Error loading inventory:', error);
      return [];
    }

    console.log('loadInventoryFromSupabase: Raw data from Supabase:', data);

    const processedItems = data?.map(item => {
      const itemData = item.item_data as any;
      const processedItem = {
        id: item.item_id,
        name: itemData.name || 'Unknown Item',
        type: itemData.type || 'misc',
        rarity: itemData.rarity || 'common',
        stats: itemData.stats || {},
        price: itemData.price || 0,
        description: itemData.description || '',
        image_url: itemData.image_url || '',
      } as Item;
      
      // Логируем предмет "Величие холодной стали" при загрузке из инвентаря
      if (processedItem.name && processedItem.name.includes('холодной')) {
        console.log('loadInventoryFromSupabase: Loading "Величие холодной стали" from inventory:', {
          rawItemData: itemData,
          processedItem,
          image_url: processedItem.image_url,
          rarity: processedItem.rarity
        });
      }
      
      console.log('loadInventoryFromSupabase: Processed item:', processedItem);
      return processedItem;
    }) || [];

    console.log('loadInventoryFromSupabase: Final processed items:', processedItems);
    return processedItems;
  } catch (error) {
    console.error('Error loading inventory:', error);
    return [];
  }
};

export const addItemToInventory = async (playerId: string, item: Item): Promise<boolean> => {
  try {
    // Логируем предмет "Величие холодной стали" перед добавлением в инвентарь
    if (item.name && item.name.includes('холодной')) {
      console.log('addItemToInventory: Adding "Величие холодной стали" to inventory:', {
        playerId,
        item,
        image_url: item.image_url,
        rarity: item.rarity
      });
    }

    // Check if item already exists in inventory
    const { data: existingItems, error: checkError } = await supabase
      .from('player_inventory')
      .select('*')
      .eq('player_id', playerId)
      .eq('item_id', item.id);

    if (checkError) {
      console.error('Error checking existing items:', checkError);
      return false;
    }

    // Convert Item to JSON-serializable format with proper type casting
    const itemData = {
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      stats: {
        attack: item.stats.attack || 0,
        defense: item.stats.defense || 0,
        health: item.stats.health || 0,
        mana: item.stats.mana || 0,
        strength: item.stats.strength || 0,
        dexterity: item.stats.dexterity || 0,
        luck: item.stats.luck || 0,
        endurance: item.stats.endurance || 0,
        magic: item.stats.magic || 0,
        criticalChance: item.stats.criticalChance || 0,
        antiCriticalChance: item.stats.antiCriticalChance || 0,
        dodgeChance: item.stats.dodgeChance || 0,
        antiDodgeChance: item.stats.antiDodgeChance || 0,
        vampirism: item.stats.vampirism || 0,
        blockChance: item.stats.blockChance || 0,
        fireResistance: item.stats.fireResistance || 0,
        stealth: item.stats.stealth || 0,
      },
      price: item.price,
      description: item.description,
      levelReq: item.levelReq,
      weight: item.weight,
      durability: item.durability,
      requirements: item.requirements,
      weaponType: item.weaponType,
      image_url: item.image_url,
    };

    if (existingItems && existingItems.length > 0) {
      // Update quantity if item exists
      const { error: updateError } = await supabase
        .from('player_inventory')
        .update({ quantity: existingItems[0].quantity + 1 })
        .eq('id', existingItems[0].id);

      if (updateError) {
        console.error('Error updating item quantity:', updateError);
        return false;
      }
    } else {
      // Add new item - cast itemData to Json type
      const { error: insertError } = await supabase
        .from('player_inventory')
        .insert({
          player_id: playerId,
          item_id: item.id,
          item_data: itemData as any, // Type cast to bypass strict typing
          quantity: 1,
        });

      if (insertError) {
        console.error('Error adding item to inventory:', insertError);
        return false;
      }
    }

    // Логируем успешное добавление предмета "Величие холодной стали"
    if (item.name && item.name.includes('холодной')) {
      console.log('addItemToInventory: Successfully added "Величие холодной стали" to inventory');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    return false;
  }
};

export const removeItemFromInventory = async (playerId: string, itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('player_inventory')
      .delete()
      .eq('player_id', playerId)
      .eq('item_id', itemId);

    if (error) {
      console.error('Error removing item from inventory:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing item from inventory:', error);
    return false;
  }
};
