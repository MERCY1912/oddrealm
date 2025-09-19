
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CharacterInfo from './CharacterInfo';
import EquipmentDisplay from './EquipmentDisplay';
import AttributeDistribution from './AttributeDistribution';
import StatDisplay from './StatDisplay';
import EnhancedInventoryPanel from './EnhancedInventoryPanel';
import { calculateFinalStats, updatePlayerWithCalculatedStats } from '@/utils/enhancedCharacterStats';
import { Equipment } from '@/types/game';

interface DetailedCharacterPanelProps {
  player: any;
  equipment: Equipment;
  inventory: any[];
  onPlayerUpdate: (player: any) => void;
  onEquipmentUpdate: (equipment: Equipment) => void;
  onRemoveFromInventory: (itemId: string) => void;
  onAddToInventory: (item: any) => void;
}

const DetailedCharacterPanel = ({ 
  player, 
  equipment, 
  inventory,
  onPlayerUpdate, 
  onEquipmentUpdate,
  onRemoveFromInventory,
  onAddToInventory
}: DetailedCharacterPanelProps) => {
  const { toast } = useToast();
  
  // Отладочная информация
  console.log('DetailedCharacterPanel - equipment:', equipment);
  console.log('DetailedCharacterPanel - player:', player);
  console.log('DetailedCharacterPanel - inventory:', inventory);
  const [pendingChanges, setPendingChanges] = useState({
    strength: 0,
    dexterity: 0,
    luck: 0,
    endurance: 0,
    magic: 0,
  });
  const [availablePoints, setAvailablePoints] = useState(player.free_stat_points || 0);

  // Calculate final stats for display
  const finalStats = calculateFinalStats(player, equipment);

  // Save player data to Supabase
  const savePlayerToSupabase = async (updatedPlayer: any) => {
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
  };

  // Update available points when player changes
  useEffect(() => {
    setAvailablePoints(player.free_stat_points || 0);
  }, [player.free_stat_points]);

  const increasePendingAttribute = (attribute: string) => {
    if (availablePoints > 0) {
      setPendingChanges(prev => ({
        ...prev,
        [attribute]: prev[attribute] + 1,
      }));
      setAvailablePoints(prev => prev - 1);
    }
  };

  const decreasePendingAttribute = (attribute: string) => {
    if (pendingChanges[attribute] > 0) {
      setPendingChanges(prev => ({
        ...prev,
        [attribute]: prev[attribute] - 1,
      }));
      setAvailablePoints(prev => prev + 1);
    }
  };

  const saveChanges = async () => {
    const totalPendingChanges = Object.values(pendingChanges).reduce((sum, val) => sum + val, 0);
    
    if (totalPendingChanges === 0) {
      toast({
        title: 'Нет изменений',
        description: 'Нет изменений для сохранения',
      });
      return;
    }

    const updatedPlayer = {
      ...player,
      strength: player.strength + pendingChanges.strength,
      dexterity: player.dexterity + pendingChanges.dexterity,
      luck: player.luck + pendingChanges.luck,
      endurance: player.endurance + pendingChanges.endurance,
      magic: player.magic + pendingChanges.magic,
      free_stat_points: availablePoints,
    };

    // Recalculate stats based on new attributes and equipment
    const playerWithCalculatedStats = updatePlayerWithCalculatedStats(updatedPlayer, equipment);

    onPlayerUpdate(playerWithCalculatedStats);
    await savePlayerToSupabase(playerWithCalculatedStats);
    
    // Reset pending changes
    setPendingChanges({
      strength: 0,
      dexterity: 0,
      luck: 0,
      endurance: 0,
      magic: 0,
    });

    toast({
      title: 'Изменения сохранены',
      description: 'Атрибуты персонажа обновлены',
    });
  };

  const resetChanges = () => {
    setAvailablePoints(player.free_stat_points || 0);
    setPendingChanges({
      strength: 0,
      dexterity: 0,
      luck: 0,
      endurance: 0,
      magic: 0,
    });
  };

  return (
    <div className="grid gap-6 items-stretch w-full" style={{ height: '700px', gridTemplateColumns: '384px 1fr 800px' }}>
      {/* Левая колонка - Характеристики */}
      <div className="panel h-full flex flex-col">
        <div className="px-3 py-2 border-b border-[#2a2f3a] flex-shrink-0">
          <h3 className="text-white font-bold text-sm text-center">ХАРАКТЕРИСТИКИ</h3>
        </div>
        
        <div className="p-3 flex-1 overflow-y-auto game-scrollbar">
          <AttributeDistribution
            player={player}
            pendingChanges={pendingChanges}
            availablePoints={availablePoints}
            onIncreaseAttribute={increasePendingAttribute}
            onDecreaseAttribute={decreasePendingAttribute}
            onSaveChanges={saveChanges}
            onResetChanges={resetChanges}
          />

          {/* Main characteristics with detailed breakdowns */}
          <div className="mt-4 space-y-2">
            <h4 className="game-text-primary font-semibold text-sm game-border-dark border-b pb-1">ОСНОВНЫЕ ХАРАКТЕРИСТИКИ</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <StatDisplay 
                player={player} 
                equipment={equipment} 
                statName="attack" 
                label="Атака" 
                color="text-red-400" 
              />
              <StatDisplay 
                player={player} 
                equipment={equipment} 
                statName="defense" 
                label="Защита" 
                color="text-blue-400" 
              />
              <StatDisplay 
                player={player} 
                equipment={equipment} 
                statName="maxHealth" 
                label="Макс. HP" 
                color="text-green-400" 
              />
              <StatDisplay 
                player={player} 
                equipment={equipment} 
                statName="maxMana" 
                label="Макс. MP" 
                color="text-purple-400" 
              />
              <div className="flex justify-between">
                <span className="text-gray-400">Золото:</span>
                <span className="text-yellow-400 font-medium">{player.gold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Класс:</span>
                <span className="text-blue-400 font-medium">{player.character_class}</span>
              </div>
            </div>
          </div>

          {/* Modifiers section */}
          <div className="mt-3 pt-2 border-t border-gray-600">
            <h5 className="text-white font-semibold text-xs mb-2">МОДИФИКАТОРЫ</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Бонус атаки:</span>
                <span className="text-green-400">+{finalStats.attackBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Бонус защиты:</span>
                <span className="text-green-400">+{finalStats.defenseBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Бонус удачи:</span>
                <span className="text-green-400">+{finalStats.luckBonus}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Бонус НР:</span>
                <span className="text-green-400">+{finalStats.healthBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Бонус МР:</span>
                <span className="text-green-400">+{finalStats.manaBonus}</span>
              </div>
            </div>
          </div>

          {/* Additional calculated stats */}
          <div className="mt-3 pt-2 border-t border-gray-600">
            <h5 className="text-white font-semibold text-xs mb-2">ДОПОЛНИТЕЛЬНЫЕ ХАРАКТЕРИСТИКИ</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Крит. шанс:</span>
                <span className="text-yellow-400">{finalStats.critChance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Уворот:</span>
                <span className="text-green-400">{finalStats.dodgeChance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Бонус золота:</span>
                <span className="text-yellow-300">{finalStats.goldBonus}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Регенерация:</span>
                <span className="text-red-300">{finalStats.healthRegen}/мин</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Мф. против крит. удара:</span>
                <span className="text-cyan-400">{finalStats.antiCriticalChance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Мф. против увертывания:</span>
                <span className="text-pink-400">{finalStats.antiDodgeChance}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Нижний блок прижат вниз */}
        <div className="mt-auto pt-3 px-3 pb-3">
          {/* Служебная плашка для баланса высоты */}
        </div>
      </div>

      {/* Средняя колонка - Персонаж и экипировка */}
      <div className="panel-hero h-full flex flex-col">
        <div className="px-3 py-2 border-b border-[#2a2f3a] flex-shrink-0">
          <h3 className="text-white font-bold text-sm text-center">ПЕРСОНАЖ И ЭКИПИРОВКА</h3>
        </div>
        
        <div className="flex-1 p-3 overflow-y-auto game-scrollbar">
          <CharacterInfo player={player} />
          <EquipmentDisplay equipment={equipment} player={player} />
        </div>
        
        {/* Нижний блок прижат вниз */}
        <div className="mt-auto pt-3 px-3 pb-3">
          {/* Можно добавить кнопки или дополнительную информацию */}
        </div>
      </div>

      {/* Правая колонка - Инвентарь */}
      <div className="panel h-full flex flex-col">
        <EnhancedInventoryPanel
          player={player}
          equipment={equipment}
          inventory={inventory}
          onEquipmentUpdate={onEquipmentUpdate}
          onPlayerUpdate={onPlayerUpdate}
          onRemoveFromInventory={onRemoveFromInventory}
          onAddToInventory={onAddToInventory}
        />
      </div>
    </div>
  );
};

export default DetailedCharacterPanel;
