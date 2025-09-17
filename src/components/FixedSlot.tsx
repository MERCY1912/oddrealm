import React from 'react';
import { Item } from '@/types/game';
import EquipmentSlotPlaceholder from './EquipmentSlotPlaceholder';
import { normalizeItemImageUrl } from '@/utils/imageUtils';

interface FixedSlotProps {
  w: number;
  h: number;
  title: string;
  item?: Item;
  icon?: React.ReactNode;
  rarity?: "common" | "rare" | "epic" | "legend";
  onClick?: () => void;
  onUnequip?: (item: Item) => void;
}

export default function FixedSlot({ 
  w, 
  h, 
  title, 
  item,
  icon, 
  rarity = "common",
  onClick,
  onUnequip
}: FixedSlotProps) {
  const getRarityStyles = () => {
    const itemRarity = item?.rarity || rarity;
    switch (itemRarity) {
      case "legendary":
      case "legend":
        return "ring-1 ring-[#83622c] shadow-[inset_0_0_14px_rgba(251,191,36,.35),0_0_12px_rgba(251,191,36,.25)]";
      case "epic":
        return "ring-1 ring-[#83622c] shadow-[inset_0_0_12px_rgba(167,139,250,.3),0_0_10px_rgba(167,139,250,.2)]";
      case "rare":
        return "ring-1 ring-[#83622c] shadow-[inset_0_0_12px_rgba(56,189,248,.25),0_0_10px_rgba(56,189,248,.15)]";
      default:
        return "ring-1 ring-[#2a2a33] shadow-[inset_0_0_10px_rgba(255,255,255,.04)]";
    }
  };

  const getItemIcon = () => {
    if (item) {
      console.log('FixedSlot getItemIcon - Item data:', {
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        image_url: item.image_url,
        fullItem: item
      });
      
      // Если есть изображение предмета, показываем его
      if (item.image_url) {
        // Нормализуем URL изображения
        const normalizedImageUrl = normalizeItemImageUrl(item.image_url);
        console.log('FixedSlot getItemIcon - Normalized image URL:', normalizedImageUrl);
        
        return (
          <img
            src={normalizedImageUrl || item.image_url}
            alt={item.name || 'Предмет'}
            className="w-full h-full object-contain rounded"
            onError={(e) => {
              console.error('Image failed to load in FixedSlot:', {
                originalUrl: item.image_url,
                normalizedUrl: normalizedImageUrl,
                finalUrl: normalizedImageUrl || item.image_url,
                itemName: item.name,
                slot: title
              });
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-lg">${getEmojiForType(item.type)}</span>`;
              }
            }}
            onLoad={() => {
              console.log('Image loaded successfully in FixedSlot:', {
                originalUrl: item.image_url,
                normalizedUrl: normalizedImageUrl,
                finalUrl: normalizedImageUrl || item.image_url,
                itemName: item.name,
                slot: title
              });
            }}
          />
        );
      }
      
      // Если нет изображения, используем эмодзи
      console.log('FixedSlot getItemIcon - No image_url, using emoji for type:', item.type);
      return getEmojiForType(item.type);
    }
    
    // Если нет предмета, используем EquipmentSlotPlaceholder
    if (!icon) {
      // Определяем тип слота по title
      const slotType = getSlotTypeFromTitle(title);
      return <EquipmentSlotPlaceholder slot={slotType} width={w} height={h} />;
    }
    
    return icon;
  };

  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'weapon':
        return '⚔️';
      case 'armor':
        return '🛡️';
      case 'helmet':
        return '⛑️';
      case 'boots':
        return '👢';
      case 'gloves':
        return '🧤';
      case 'shield':
        return '🛡️';
      case 'ring':
        return '💍';
      case 'necklace':
        return '📿';
      case 'earring':
        return '💎';
      default:
        return '📦';
    }
  };

  const getSlotTypeFromTitle = (title: string): string => {
    const titleToSlotMap: { [key: string]: string } = {
      'Шлем': 'helmet',
      'Наручи': 'bracers',
      'Оружие': 'weapon',
      'Доспехи': 'armor',
      'Пояс': 'belt',
      'Серьги': 'earring',
      'Амулет': 'necklace',
      'Кольцо': 'ring1',
      'Кольцо 1': 'ring1',
      'Кольцо 2': 'ring2',
      'Кольцо 3': 'ring3',
      'Перчатки': 'gloves',
      'Щит': 'shield',
      'Поножи': 'leggings',
      'Ботинки': 'boots',
      'Сапоги': 'boots'  // Добавлено для CharacterEquipmentPanel
    };
    
    const slotType = titleToSlotMap[title];
    console.log('FixedSlot getSlotTypeFromTitle:', title, '->', slotType);
    return slotType || 'helmet';
  };

  const handleClick = () => {
    if (item && onUnequip) {
      onUnequip(item);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      className={`empty-slot ${getRarityStyles()} grid place-items-center cursor-pointer transition-transform`}
      style={{ width: w, height: h }}
      onClick={handleClick}
      title={item ? `Нажмите, чтобы снять: ${item.name} (${item.rarity})` : title}
    >
      {getItemIcon() || <span className="text-ash/60 text-lg">◆</span>}
    </button>
  );
}
