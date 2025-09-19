import React from 'react';
import { InventorySlot } from './InventorySlot';
import OrnateFrame from './OrnateFrame';
import EquipmentSlotPlaceholder from './EquipmentSlotPlaceholder';

interface EquipmentSlotsProps {
  equipment?: {
    helmet?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    armor?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    weapon?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    shield?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    ring1?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    ring2?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    necklace?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
    boots?: { icon: React.ReactNode; rarity: "common" | "rare" | "epic" | "legend" };
  };
  onSlotClick?: (slot: string) => void;
}

function EquipmentSlots({ equipment = {}, onSlotClick }: EquipmentSlotsProps) {
  const slots = [
    { key: 'helmet', label: 'Шлем', position: 'top-center' },
    { key: 'armor', label: 'Нагрудник', position: 'center' },
    { key: 'weapon', label: 'Оружие', position: 'left' },
    { key: 'shield', label: 'Щит', position: 'right' },
    { key: 'ring1', label: 'Кольцо 1', position: 'bottom-left' },
    { key: 'ring2', label: 'Кольцо 2', position: 'bottom-right' },
    { key: 'necklace', label: 'Амулет', position: 'top-left' },
    { key: 'boots', label: 'Ботинки', position: 'bottom-center' },
  ];

  const getSlotIcon = (slotKey: string) => {
    console.log('getSlotIcon called with slotKey:', slotKey);
    const item = equipment[slotKey as keyof typeof equipment];
    if (item) {
      console.log('Item found for slot:', slotKey, item);
      return item.icon;
    }
    
    console.log('No item found for slot:', slotKey, 'using placeholder');
    // Используем EquipmentSlotPlaceholder для пустых слотов
    return <EquipmentSlotPlaceholder slot={slotKey} width={60} height={60} />;
  };

  const getSlotRarity = (slotKey: string): "common" | "rare" | "epic" | "legend" => {
    const item = equipment[slotKey as keyof typeof equipment];
    return item?.rarity || "common";
  };

  const getSlotRarityClass = (slotKey: string) => {
    const rarity = getSlotRarity(slotKey);
    return `rarity-${rarity}`;
  };

  return (
    <OrnateFrame title="ЭКИПИРОВКА" variant="base" colorClass="text-gold">
      <div className="space-y-4">
        {/* Сетка слотов экипировки */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto py-0.5">
          {/* Верхний ряд */}
          <div></div>
          <InventorySlot 
            icon={getSlotIcon('helmet')}
            rarity={getSlotRarity('helmet')}
          />
          <InventorySlot 
            icon={getSlotIcon('necklace')}
            rarity={getSlotRarity('necklace')}
          />
          
          {/* Средний ряд */}
          <InventorySlot 
            icon={getSlotIcon('weapon')}
            rarity={getSlotRarity('weapon')}
          />
          <InventorySlot 
            icon={getSlotIcon('armor')}
            rarity={getSlotRarity('armor')}
          />
          <InventorySlot 
            icon={getSlotIcon('shield')}
            rarity={getSlotRarity('shield')}
          />
          
          {/* Нижний ряд */}
          <InventorySlot 
            icon={getSlotIcon('ring1')}
            rarity={getSlotRarity('ring1')}
          />
          <InventorySlot 
            icon={getSlotIcon('boots')}
            rarity={getSlotRarity('boots')}
          />
          <InventorySlot 
            icon={getSlotIcon('ring2')}
            rarity={getSlotRarity('ring2')}
          />
        </div>
        
        {/* Информация о слотах */}
        <div className="text-xs text-ash/70 text-center">
          Нажмите на слот для экипировки предмета
        </div>
      </div>
    </OrnateFrame>
  );
}

export default EquipmentSlots;
