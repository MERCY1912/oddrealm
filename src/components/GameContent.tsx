
import React from 'react';
import TownView from './TownView';
import InventoryPanel from './InventoryPanel';
import EnhancedInventoryPanel from './EnhancedInventoryPanel';
import QuestSystem from './QuestSystem';
import EnhancedShop from './EnhancedShop';
import Infirmary from './Infirmary';
import DetailedCharacterPanel from './DetailedCharacterPanel';
import NewBattleArena from './NewBattleArena';
import { PlayerProfile, PlayerEquipmentDb, Item, Equipment, Player } from '@/types/game';

interface GameContentProps {
  activeTab: string;
  player: PlayerProfile;
  equipment: PlayerEquipmentDb;
  inventory: Item[];
  onPlayerUpdate: (player: Partial<PlayerProfile>) => void;
  onEquipmentUpdate: (equipment: Equipment) => void;
  onRemoveFromInventory: (itemId: string) => void;
  onAddToInventory: (item: Item) => void;
  setInBattle: (inBattle: boolean) => void;
  convertedPlayer: Player;
  convertedEquipment: Equipment;
}

const GameContent = ({
  activeTab,
  player,
  equipment,
  inventory,
  onPlayerUpdate,
  onEquipmentUpdate,
  onRemoveFromInventory,
  onAddToInventory,
  setInBattle,
  convertedPlayer,
  convertedEquipment,
}: GameContentProps) => {
  return (
    <div className="mb-6 mx-auto" style={{ width: '1600px' }}>
      {activeTab === 'character' && (
        <DetailedCharacterPanel 
          player={player}
          equipment={convertedEquipment}
          inventory={inventory}
          onPlayerUpdate={onPlayerUpdate}
          onEquipmentUpdate={onEquipmentUpdate}
          onRemoveFromInventory={onRemoveFromInventory}
          onAddToInventory={onAddToInventory}
        />
      )}
      
      {activeTab !== 'character' && (
        <div className="w-full">
        
        {activeTab === 'town' && (
          <TownView 
            player={player}
            onPlayerUpdate={onPlayerUpdate}
          />
        )}
        
        {activeTab === 'inventory' && (
          <EnhancedInventoryPanel 
            player={convertedPlayer}
            equipment={convertedEquipment}
            inventory={inventory}
            onEquipmentUpdate={onEquipmentUpdate}
            onPlayerUpdate={onPlayerUpdate}
            onRemoveFromInventory={onRemoveFromInventory}
            onAddToInventory={onAddToInventory}
          />
        )}
        
        {activeTab === 'quests' && (
          <QuestSystem 
            player={convertedPlayer}
            onPlayerUpdate={onPlayerUpdate}
          />
        )}
        
        {activeTab === 'shop' && (
          <EnhancedShop 
            player={convertedPlayer}
            onPlayerUpdate={onPlayerUpdate}
            onAddToInventory={onAddToInventory}
          />
        )}
        
        {activeTab === 'infirmary' && (
          <Infirmary 
            player={convertedPlayer}
            onPlayerUpdate={onPlayerUpdate}
          />
        )}

        {activeTab === 'arena' && (
          <NewBattleArena
            player={convertedPlayer}
            onPlayerUpdate={onPlayerUpdate}
            onBattleStateChange={setInBattle}
          />
        )}
        </div>
      )}
    </div>
  );
};

export default GameContent;
