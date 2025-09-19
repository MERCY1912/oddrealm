import { supabase } from '@/integrations/supabase/client';
import { Equipment, Item, ItemType, ItemRarity, ItemStats, WeaponType, PlayerEquipmentDb } from '@/types/game';

export const saveEquipmentToSupabase = async (playerId: string, equipment: PlayerEquipmentDb) => {
  try {
    console.log('saveEquipmentToSupabase: Saving equipment for player:', playerId);
    console.log('saveEquipmentToSupabase: Equipment data:', JSON.stringify(equipment, null, 2));
    
    // Delete existing equipment for this player
    console.log('saveEquipmentToSupabase: Deleting existing equipment...');
    const { error: deleteError } = await supabase
      .from('equipment')
      .delete()
      .eq('player_id', playerId);
    
    if (deleteError) {
      console.error('Error deleting existing equipment:', deleteError);
    } else {
      console.log('saveEquipmentToSupabase: Existing equipment deleted successfully');
    }

    // Insert new equipment with complete item data
    const equipmentEntries = Object.entries(equipment)
      .filter(([_, item]) => item !== null && item !== undefined)
      .map(([slot, item]) => {
        const entry = {
          player_id: playerId,
          slot: slot,
          item_data: {
            name: item!.name,
            stats: item!.stats || {},
            // Store additional item data that might be needed
            type: slot.replace(/\d/g, ''), // Remove numbers from slot name for type
            rarity: item!.rarity || 'common',
            price: item!.price || 0,
            description: item!.description || `Equipped ${item!.name}`,
            image_url: item!.image_url,
            weaponType: item!.weaponType,
            weapon_type: item!.weapon_type,
          }
        };
        console.log(`saveEquipmentToSupabase: Created entry for slot ${slot}:`, entry);
        return entry;
      });

    console.log('saveEquipmentToSupabase: Equipment entries to save:', equipmentEntries);

    if (equipmentEntries.length > 0) {
      console.log('saveEquipmentToSupabase: Inserting equipment entries...');
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentEntries)
        .select();

      if (error) {
        console.error('Error saving equipment:', error);
        return false;
      } else {
        console.log('saveEquipmentToSupabase: Equipment inserted successfully:', data);
      }
    } else {
      console.log('saveEquipmentToSupabase: No equipment entries to save');
    }

    console.log('saveEquipmentToSupabase: Equipment saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveEquipmentToSupabase:', error);
    return false;
  }
};

export const loadEquipmentFromSupabase = async (playerId: string): Promise<Equipment> => {
  try {
    console.log('loadEquipmentFromSupabase: Loading equipment for player:', playerId);

    // 1. Get all items from the shop to use as a reference
    const { data: allItemsData, error: itemsError } = await supabase
      .from('admin_shop_items')
      .select('item_id, name, type, rarity, stats, price, description, image_url, requirements');

    if (itemsError) {
      console.error('Error loading shop items for equipment reference:', itemsError);
      return {};
    }
    
    console.log('loadEquipmentFromSupabase: Loaded shop items:', allItemsData?.length, 'items');
    
    // Create a map of items by their ID for easy lookup
    const allItemsMap = new Map<string, Item>();
    if (allItemsData) {
      allItemsData.forEach(itemData => {
        const item: Item = {
          id: itemData.item_id,
          name: itemData.name,
          type: itemData.type as ItemType,
          rarity: itemData.rarity as ItemRarity,
          stats: itemData.stats as ItemStats,
          price: itemData.price,
          description: itemData.description,
          image_url: itemData.image_url,
          requirements: itemData.requirements,
          weaponType: itemData.weapon_type as WeaponType,
        };
        allItemsMap.set(item.id, item);
        
        // Логируем предметы с изображениями
        if (item.image_url) {
          console.log('loadEquipmentFromSupabase: Item with image:', {
            id: item.id,
            name: item.name,
            image_url: item.image_url
          });
        }
      });
    }

    // 2. Get player's equipped items from the 'equipment' table
    console.log('loadEquipmentFromSupabase: Querying equipment table for player:', playerId);
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('slot, item_data')
      .eq('player_id', playerId);

    if (equipmentError) {
      console.error('Error loading equipment:', equipmentError);
      return {};
    }

    console.log('loadEquipmentFromSupabase: Player equipment data:', equipmentData);
    console.log('loadEquipmentFromSupabase: Number of equipment items found:', equipmentData?.length || 0);

    // 3. Construct the final equipment object with full item details
    const equipment: Equipment = {};
    if (equipmentData) {
      for (const equippedItem of equipmentData) {
        // Try to get the saved item data first
        if (equippedItem.item_data && typeof equippedItem.item_data === 'object') {
          const savedItemData = equippedItem.item_data as any;
          
          console.log('loadEquipmentFromSupabase: Processing equipped item from saved data:', {
            slot: equippedItem.slot,
            itemName: savedItemData.name,
            hasImageUrl: !!savedItemData.image_url,
            imageUrl: savedItemData.image_url
          });

          // Create item from saved data
          const item: Item = {
            id: `${equippedItem.slot}_${savedItemData.name}`,
            name: savedItemData.name,
            type: savedItemData.type as ItemType,
            rarity: savedItemData.rarity as ItemRarity,
            stats: savedItemData.stats as ItemStats,
            price: savedItemData.price || 0,
            description: savedItemData.description || `Equipped ${savedItemData.name}`,
            image_url: savedItemData.image_url,
            requirements: savedItemData.requirements,
            weaponType: savedItemData.weaponType || savedItemData.weapon_type as WeaponType,
          };
          
          equipment[equippedItem.slot as keyof Equipment] = item;
        } else {
          console.warn('loadEquipmentFromSupabase: No item data found for slot:', equippedItem.slot);
        }
      }
    }
    
    console.log('loadEquipmentFromSupabase: Final equipment object:', equipment);
    return equipment;
  } catch (error) {
    console.error('Error in loadEquipmentFromSupabase:', error);
    return {};
  }
};

export const getEquipmentPlaceholder = (slot: string): string => {
  const placeholders = {
    weapon: '⚔️',
    armor: '🛡️',
    helmet: '⛑️',
    boots: '👢',
    gloves: '🧤',
    belt: '🪢',
    necklace: '📿',
    ring1: '💍',
    ring2: '💍',
    ring3: '💍',
    shield: '🛡️',
    leggings: '👖',
    bracers: '🦾',
    earring: '🦻',
  };
  return placeholders[slot as keyof typeof placeholders] || '❓';
};
