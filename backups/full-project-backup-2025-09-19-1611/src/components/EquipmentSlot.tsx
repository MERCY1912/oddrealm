
import React from 'react';
import { getEquipmentPlaceholder } from '@/utils/equipmentUtils';
import { Item } from '@/types/game';
import EquipmentSlotPlaceholder from './EquipmentSlotPlaceholder';
import ItemTooltip from './ItemTooltip';

interface EquipmentSlotProps {
  item: Item | undefined;
  slot: string;
  size: 'small' | 'medium' | 'large';
  className?: string;
}

const slotSizeMap: Record<string, { width: number; height: number; emojiSize: string }> = {
  gloves:    { width: 60, height: 40, emojiSize: 'text-2xl' },
  bracers:   { width: 60, height: 40, emojiSize: 'text-2xl' },
  boots:     { width: 60, height: 40, emojiSize: 'text-2xl' },
  belt:      { width: 60, height: 40, emojiSize: 'text-2xl' },
  armor:     { width: 60, height: 80, emojiSize: 'text-3xl' },
  necklace:  { width: 60, height: 20, emojiSize: 'text-xl' },
  earring:   { width: 60, height: 20, emojiSize: 'text-xl' },
  ring1:     { width: 20, height: 20, emojiSize: 'text-base' },
  ring2:     { width: 20, height: 20, emojiSize: 'text-base' },
  ring3:     { width: 20, height: 20, emojiSize: 'text-base' },
  ring4:     { width: 20, height: 20, emojiSize: 'text-base' },
  helmet:    { width: 60, height: 60, emojiSize: 'text-3xl' },
  shield:    { width: 60, height: 60, emojiSize: 'text-3xl' },
  weapon:    { width: 60, height: 60, emojiSize: 'text-3xl' },
  leggings:  { width: 60, height: 80, emojiSize: 'text-3xl' },
  default:   { width: 60, height: 60, emojiSize: 'text-3xl' }
};

const EquipmentSlot = ({ item, slot, size, className = '' }: EquipmentSlotProps) => {
  // Безопасная проверка типа item
  const isValidItem = item && typeof item === 'object' && item !== null && !Array.isArray(item);
  
  // Отладочная информация
  console.log(`EquipmentSlot ${slot}:`, {
    hasItem: !!item,
    isValidItem,
    itemData: item ? {
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      image_url: item.image_url
    } : null
  });

  const { width, height, emojiSize } = slotSizeMap[slot] || slotSizeMap.default;


  const slotElement = (
    <div 
      className={`
        bg-gray-600 border rounded flex items-center justify-center transition-all duration-200 overflow-hidden
        ${isValidItem ? 'border-yellow-500 bg-gray-700 shadow-lg' : 'border-gray-500'}
        ${className}
        hover:bg-gray-500
      `}
      style={{
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
        width: `${width}px`,
        height: `${height}px`,
        aspectRatio: `${width} / ${height}`
      }}
    >
      {isValidItem && item.image_url ? (
        <img 
          src={item.image_url} 
          alt={item.name || 'Предмет'} 
          className="w-full h-full object-cover"
          style={{ width: '100%', height: '100%' }} 
          onError={(e) => {
            console.error('Image failed to load:', item.image_url, 'for item:', item.name);
            console.error('Error details:', e);
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="${emojiSize}">${getEquipmentPlaceholder(slot)}</span>`;
            }
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', item.image_url, 'for item:', item.name);
          }}
        />
      ) : (
        <EquipmentSlotPlaceholder slot={slot} width={width} height={height} />
      )}
    </div>
  );

  if (!isValidItem) {
    return slotElement;
  }

  return (
    <ItemTooltip item={item} side="right">
      {slotElement}
    </ItemTooltip>
  );
};

export default EquipmentSlot;
