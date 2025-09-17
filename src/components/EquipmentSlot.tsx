
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getEquipmentPlaceholder } from '@/utils/equipmentUtils';
import { Item } from '@/types/game';
import EquipmentSlotPlaceholder from './EquipmentSlotPlaceholder';

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

  const getItemTooltip = () => {
    if (!isValidItem) return null;
    
    return (
      <div className="p-3 space-y-2 max-w-xs">
        <div className="font-bold text-yellow-300 text-lg">{item.name?.toUpperCase() || 'НЕИЗВЕСТНЫЙ ПРЕДМЕТ'}</div>
        {item.rarity && (
          <div className={`text-xs capitalize font-bold ${
            item.rarity === 'legendary' ? 'text-orange-400' :
            item.rarity === 'epic' ? 'text-purple-400' :
            item.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
          }`}>
            {item.rarity === 'legendary' ? 'Легендарный' :
             item.rarity === 'epic' ? 'Эпический' :
             item.rarity === 'rare' ? 'Редкий' : 'Обычный'}
          </div>
        )}
        <div className="text-gray-300 text-sm">{item.description || '—'}</div>
        {item.type && (
          <div className="text-teal-300 text-xs">Тип: {item.type}</div>
        )}
        {item.weaponType && (
          <div className="text-cyan-400 text-xs">Класс оружия: {item.weaponType}</div>
        )}
        {item.stats && typeof item.stats === 'object' && Object.keys(item.stats).length > 0 && (
          <div>
            <div className="text-green-400 text-sm font-semibold mb-1">Характеристики:</div>
            <ul className="text-xs space-y-0.5">
              {Object.entries(item.stats).map(([k, v]) => (
                <li key={k}>
                  <span className="text-gray-400">{k}:</span>{' '}
                  <span className="text-white font-semibold">+{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {item.requirements && (
          <div className="text-red-400 text-xs">Требования: {item.requirements}</div>
        )}
        {item.price && (
          <div className="text-yellow-200 text-xs">Цена: {item.price} золота</div>
        )}
        {/* Безопасная проверка levelReq */}
        {isValidItem && typeof item === 'object' && 'levelReq' in item && (item as any).levelReq && (
          <div className="text-orange-300 text-xs">Мин. уровень: {(item as any).levelReq}</div>
        )}
        {item.id && (
          <div className="text-gray-500 text-xs">ID: {item.id}</div>
        )}
      </div>
    );
  };

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {slotElement}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-gray-900/95 backdrop-blur-sm border border-gray-500/50 text-white max-w-xs z-50 shadow-xl"
        >
          {getItemTooltip()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EquipmentSlot;
