import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { saveEquipmentToSupabase, loadEquipmentFromSupabase } from '@/utils/equipmentUtils';
import { loadInventoryFromSupabase, addItemToInventory, removeItemFromInventory } from '@/utils/inventoryUtils';
import { updatePlayerWithCalculatedStats } from '@/utils/enhancedCharacterStats';
import { Item, Player, PlayerProfile, PlayerEquipmentDb, Equipment, ItemType, ItemRarity, WeaponType } from '@/types/game';
import { enhancedShopItems } from '@/data/enhancedShopItems';

const allShopItems: Item[] = Object.values(enhancedShopItems).flat();
const findItemDataInShop = (name: string): Item | undefined => {
  return allShopItems.find(item => item.name === name);
};

export const useGameData = (initialPlayer: PlayerProfile, initialEquipment: PlayerEquipmentDb) => {
  const [player, setPlayer] = useState<PlayerProfile>(initialPlayer);
  const [equipment, setEquipment] = useState<PlayerEquipmentDb>(initialEquipment);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [showLevelUpDistribution, setShowLevelUpDistribution] = useState(false);
  const [pendingLevelUpPoints, setPendingLevelUpPoints] = useState(0);
  const { toast } = useToast();

  const calculateExpToNextLevel = useCallback((level: number) => {
    // Slower, exponential progression
    return Math.floor(100 * Math.pow(level, 1.5));
  }, []);

  // 1. Update convertToGameEquipment to pass through data directly (no more shop lookup unless it's truly missing)
  const convertToGameEquipment = useCallback((dbEquipment: PlayerEquipmentDb): Equipment => {
    // НАЧИНАЕМ с того, что dbEquipment уже теперь (если из базы) содержит всё нужное (включая image_url)
    // Поэтому мы просто ищем поля, которые сами уже содержат image_url и прочее (предполагаем что loadEquipmentFromSupabase отдаёт полностью наполненные Item)
    const gameEquipment: Equipment = {};
    Object.entries(dbEquipment).forEach(([slot, dbItem]) => {
      if (dbItem) {
        // Конвертируем PlayerEquipmentDb в Item
        gameEquipment[slot as keyof Equipment] = {
          id: `${slot}_${dbItem.name}`,
          name: dbItem.name,
          stats: dbItem.stats,
          type: slot.replace(/\d/g, '') as ItemType,
          rarity: dbItem.rarity || 'common',
          price: dbItem.price || 0,
          description: dbItem.description || `Equipped ${dbItem.name}`,
          image_url: dbItem.image_url,
          weaponType: dbItem.weaponType || dbItem.weapon_type,
        };
      }
    });
    return gameEquipment;
  }, []);

  const convertToPlayer = useCallback((playerProfile: PlayerProfile, gameEquipment: Equipment): Player => ({
    id: playerProfile.id,
    username: playerProfile.username,
    level: playerProfile.level,
    experience: playerProfile.experience,
    experienceToNext: playerProfile.experience_to_next,
    health: playerProfile.health,
    maxHealth: playerProfile.max_health,
    mana: playerProfile.mana,
    maxMana: playerProfile.max_mana,
    attack: playerProfile.attack,
    defense: playerProfile.defense,
    gold: playerProfile.gold,
    class: playerProfile.character_class as 'warrior' | 'mage' | 'archer',
    equipment: gameEquipment,
    strength: playerProfile.strength,
    dexterity: playerProfile.dexterity,
    luck: playerProfile.luck,
    endurance: playerProfile.endurance,
    magic: playerProfile.magic,
    freeStatPoints: playerProfile.free_stat_points,
    avatar_url: playerProfile.avatar_url,
    character_image_url: playerProfile.character_image_url,
  }), []);

  const convertFromPlayer = useCallback((playerData: Player): PlayerProfile => ({
    id: playerData.id,
    username: playerData.username,
    character_class: playerData.class,
    level: playerData.level,
    experience: playerData.experience,
    experience_to_next: playerData.experienceToNext,
    health: playerData.health,
    max_health: playerData.maxHealth,
    mana: playerData.mana,
    max_mana: playerData.maxMana,
    attack: playerData.attack,
    defense: playerData.defense,
    gold: playerData.gold,
    strength: playerData.strength,
    dexterity: playerData.dexterity,
    luck: playerData.luck,
    endurance: playerData.endurance,
    magic: playerData.magic,
    free_stat_points: playerData.freeStatPoints,
    avatar_url: playerData.avatar_url,
    character_image_url: playerData.character_image_url,
  }), []);

  const convertedGameEquipment = convertToGameEquipment(equipment);

  const savePlayerToSupabase = useCallback(async (updatedPlayer: PlayerProfile) => {
    console.log('savePlayerToSupabase - Saving player:', updatedPlayer);
    if (!updatedPlayer.id) {
      console.error("Save aborted: player ID is missing.", updatedPlayer);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить прогресс (отсутствует ID).',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          level: updatedPlayer.level,
          experience: updatedPlayer.experience,
          experience_to_next: updatedPlayer.experience_to_next,
          health: updatedPlayer.health,
          max_health: updatedPlayer.max_health,
          mana: updatedPlayer.mana,
          max_mana: updatedPlayer.max_mana,
          attack: updatedPlayer.attack,
          defense: updatedPlayer.defense,
          gold: updatedPlayer.gold,
          strength: updatedPlayer.strength,
          dexterity: updatedPlayer.dexterity,
          luck: updatedPlayer.luck,
          endurance: updatedPlayer.endurance,
          magic: updatedPlayer.magic,
          free_stat_points: updatedPlayer.free_stat_points,
          avatar_url: updatedPlayer.avatar_url,
          character_image_url: updatedPlayer.character_image_url,
          description: updatedPlayer.description,
          city: updatedPlayer.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedPlayer.id);

      if (error) {
        console.error('Error saving player data:', error);
        toast({
          title: 'Ошибка сохранения',
          description: 'Не удалось сохранить прогресс',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }, [toast]);

  const checkForLevelUp = useCallback(async () => {
    if (player.experience >= player.experience_to_next) {
      const levelsGained = Math.floor(player.experience / player.experience_to_next);
      const newLevel = player.level + levelsGained;
      const remainingExp = player.experience % player.experience_to_next;
      const newExpToNext = calculateExpToNextLevel(newLevel);
      
      const baseMaxHealth = player.max_health || 100;
      const baseMaxMana = player.max_mana || 50;
      
      const newMaxHealth = Math.max(100, baseMaxHealth + (levelsGained * 10));
      const newMaxMana = Math.max(50, baseMaxMana + (levelsGained * 5));
      
      const pointsToGive = levelsGained * 5;
      
      const updatedPlayer: PlayerProfile = {
        ...player,
        level: newLevel,
        experience: remainingExp,
        experience_to_next: newExpToNext,
        max_health: newMaxHealth,
        max_mana: newMaxMana,
        health: newMaxHealth,
        mana: newMaxMana,
      };

      setPlayer(updatedPlayer);
      await savePlayerToSupabase(updatedPlayer);
      
      setPendingLevelUpPoints(pointsToGive);
      setShowLevelUpDistribution(true);

      toast({
        title: 'Повышение уровня!',
        description: `Уровень ${newLevel}! Распределите ${pointsToGive} очков атрибутов`,
      });
    }
  }, [player, calculateExpToNextLevel, savePlayerToSupabase, toast]);

  useEffect(() => {
    checkForLevelUp();
  }, [player.experience, checkForLevelUp]);

  // 2. When loading equipment, pass through full item data from Supabase (which should include image_url)
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!player.id) return;

      console.log('useGameData: Loading player data for:', player.id);
      console.log('useGameData: Current player data:', player);
      const loadedEquipment = await loadEquipmentFromSupabase(player.id);
      console.log('useGameData: Loaded equipment from Supabase:', loadedEquipment);

      // Convert loaded Equipment to PlayerEquipmentDb format
      const processedEquipment: PlayerEquipmentDb = {};

      Object.entries(loadedEquipment).forEach(([slot, item]) => {
        if (item && item.name) {
          // Конвертируем Item в формат PlayerEquipmentDb
          processedEquipment[slot as keyof PlayerEquipmentDb] = {
            name: item.name,
            stats: item.stats,
            rarity: item.rarity,
            image_url: item.image_url,
            description: item.description,
            price: item.price,
            weaponType: item.weaponType,
            weapon_type: item.weaponType,
          };
        }
      });

      setEquipment(processedEquipment);

      const gameEquipment = convertToGameEquipment(processedEquipment);
      const playerAsPlayerObject = convertToPlayer(player, gameEquipment);
      const updatedPlayer = updatePlayerWithCalculatedStats(playerAsPlayerObject, gameEquipment);

      if (
        updatedPlayer.attack !== player.attack ||
        updatedPlayer.defense !== player.defense ||
        updatedPlayer.maxHealth !== player.max_health
      ) {
        const updatedProfile = convertFromPlayer(updatedPlayer);
        setPlayer(updatedProfile);
        savePlayerToSupabase(updatedProfile);
      }

      const loadedInventory = await loadInventoryFromSupabase(player.id);
      console.log('useGameData: Loaded inventory from Supabase:', loadedInventory);
      setInventory(loadedInventory);
    };

    loadPlayerData();
  }, [player.id, convertToGameEquipment, convertToPlayer, convertFromPlayer, savePlayerToSupabase]);

  const handleLevelUpDistribution = useCallback(async (attributeDistribution: { [key: string]: number }) => {
    const playerWithAddedAttribs: PlayerProfile = {
      ...player,
      strength: player.strength + attributeDistribution.strength,
      dexterity: player.dexterity + attributeDistribution.dexterity,
      luck: player.luck + attributeDistribution.luck,
      endurance: player.endurance + attributeDistribution.endurance,
      magic: player.magic + attributeDistribution.magic,
    };

    const playerToRecalc = convertToPlayer(playerWithAddedAttribs, convertedGameEquipment);
    const playerWithRecalculatedStats = updatePlayerWithCalculatedStats(playerToRecalc, convertedGameEquipment);
    const finalProfile = convertFromPlayer(playerWithRecalculatedStats);

    setPlayer(finalProfile);
    await savePlayerToSupabase(finalProfile);
    
    setShowLevelUpDistribution(false);
    setPendingLevelUpPoints(0);

    toast({
      title: 'Очки распределены!',
      description: 'Атрибуты персонажа обновлены',
    });
  }, [player, convertedGameEquipment, savePlayerToSupabase, toast, convertToPlayer, convertFromPlayer, updatePlayerWithCalculatedStats]);

  const handleAddToInventory = useCallback(async (item: Item) => {
    const success = await addItemToInventory(player.id, item);
    if (success) {
      const updatedInventory = await loadInventoryFromSupabase(player.id);
      setInventory(updatedInventory);
      toast({
        title: '🎉 Предмет добавлен!',
        description: `${item.name} теперь в вашем инвентаре`,
        duration: 4000,
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить предмет в инвентарь',
        variant: 'destructive',
      });
    }
  }, [player.id, toast]);

  const handleRemoveFromInventory = useCallback(async (itemId: string) => {
    const success = await removeItemFromInventory(player.id, itemId);
    if (success) {
      const updatedInventory = await loadInventoryFromSupabase(player.id);
      setInventory(updatedInventory);
    }
  }, [player.id]);

  const handlePlayerUpdate = useCallback(async (updatedPlayerData: Partial<PlayerProfile>) => {
    console.log('useGameData - handlePlayerUpdate called with:', updatedPlayerData);
    const finalPlayerProfile = { ...player, ...updatedPlayerData };
    console.log('useGameData - finalPlayerProfile:', finalPlayerProfile);
    
    if (!finalPlayerProfile.id) {
        console.error("Critical Error: Player ID is missing before save.", { current: player, update: updatedPlayerData });
        toast({
            title: 'Критическая ошибка сохранения',
            description: 'Не удалось сохранить прогресс из-за потери ID игрока.',
            variant: 'destructive',
        });
        return;
    }

    setPlayer(finalPlayerProfile);
    await savePlayerToSupabase(finalPlayerProfile);
  }, [player, savePlayerToSupabase, toast]);
  
  const handleEquipmentUpdate = useCallback(async (itemToEquip: Item) => {
    console.log('useGameData: handleEquipmentUpdate called with item:', itemToEquip);
    
    // Определяем слот для предмета
    const slot = itemToEquip.type as keyof Equipment;
    
    // Создаем новую экипировку
    const newEquipment = {
      ...convertedGameEquipment,
      [slot]: itemToEquip
    };
    
    const newDbEquipment: PlayerEquipmentDb = {};
    Object.entries(newEquipment).forEach(([slot, item]) => {
      if (item) {
        // Сохраняем информацию о предмете в формате PlayerEquipmentDb
        newDbEquipment[slot as keyof PlayerEquipmentDb] = {
          name: item.name,
          stats: item.stats,
          rarity: item.rarity,
          image_url: item.image_url,
          description: item.description,
          price: item.price,
          weaponType: item.weaponType,
          weapon_type: item.weaponType,
        };
      }
    });
    setEquipment(newDbEquipment);

    const playerToUpdate = convertToPlayer(player, newEquipment);
    const updatedPlayer = updatePlayerWithCalculatedStats(playerToUpdate, newEquipment);
    const updatedPlayerProfile = convertFromPlayer(updatedPlayer);

    setPlayer(updatedPlayerProfile);
    await savePlayerToSupabase(updatedPlayerProfile);
    await saveEquipmentToSupabase(player.id, newDbEquipment);
    
    toast({
      title: '⚔️ Предмет экипирован!',
      description: `${itemToEquip.name} теперь надет`,
      duration: 3000,
    });
  }, [player, convertedGameEquipment, savePlayerToSupabase, convertToPlayer, convertFromPlayer, updatePlayerWithCalculatedStats, toast]);

  const handleUnequipItem = useCallback(async (itemToUnequip: Item) => {
    console.log('useGameData: handleUnequipItem called for item:', itemToUnequip);
    
    // Определяем слот для предмета
    const slot = itemToUnequip.type as keyof Equipment;
    
    // Создаем новую экипировку без предмета в указанном слоте
    const newEquipment = {
      ...convertedGameEquipment,
      [slot]: undefined
    };
    
    const newDbEquipment: PlayerEquipmentDb = {};
    Object.entries(newEquipment).forEach(([slot, item]) => {
      if (item) {
        newDbEquipment[slot as keyof PlayerEquipmentDb] = {
          name: item.name,
          stats: item.stats,
          rarity: item.rarity,
          image_url: item.image_url,
          description: item.description,
          price: item.price,
          weaponType: item.weaponType,
          weapon_type: item.weaponType,
        };
      }
    });
    setEquipment(newDbEquipment);

    const playerToUpdate = convertToPlayer(player, newEquipment);
    const updatedPlayer = updatePlayerWithCalculatedStats(playerToUpdate, newEquipment);
    const updatedPlayerProfile = convertFromPlayer(updatedPlayer);

    setPlayer(updatedPlayerProfile);
    await savePlayerToSupabase(updatedPlayerProfile);
    await saveEquipmentToSupabase(player.id, newDbEquipment);
    
    // Добавляем предмет обратно в инвентарь
    await handleAddToInventory(itemToUnequip);
    
    toast({
      title: '📦 Предмет снят!',
      description: `${itemToUnequip.name} возвращен в инвентарь`,
      duration: 3000,
    });
  }, [player, convertedGameEquipment, savePlayerToSupabase, convertToPlayer, convertFromPlayer, updatePlayerWithCalculatedStats, toast, handleAddToInventory]);

  return {
    player,
    equipment,
    inventory,
    showLevelUpDistribution,
    pendingLevelUpPoints,
    handleLevelUpDistribution,
    handleAddToInventory,
    handleRemoveFromInventory,
    handlePlayerUpdate,
    handleEquipmentUpdate,
    handleUnequipItem,
    convertedPlayer: convertToPlayer(player, convertedGameEquipment),
    convertedEquipment: convertedGameEquipment,
  };
};
