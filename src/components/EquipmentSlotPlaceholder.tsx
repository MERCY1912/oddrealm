import React from 'react';
import helmetImage from '@/assets/bg_items/helmet.jpg';
import bracersImage from '@/assets/bg_items/bracers.jpg';
import weaponImage from '@/assets/bg_items/weapon.jpg';
import armorImage from '@/assets/bg_items/armor.jpg';
import beltImage from '@/assets/bg_items/belt.jpg';
import earringImage from '@/assets/bg_items/earing.jpg';
import necklaceImage from '@/assets/bg_items/amulet.jpg';
import ringImage from '@/assets/bg_items/ring.jpg';
import glovesImage from '@/assets/bg_items/gloves.jpg';
import shieldImage from '@/assets/bg_items/shield.jpg';
import leggingsImage from '@/assets/bg_items/leggings.jpg';
import bootsImage from '@/assets/bg_items/boots.jpg';

interface EquipmentSlotPlaceholderProps {
  slot: string;
  className?: string;
  width?: number;
  height?: number;
}

const EquipmentSlotPlaceholder = ({ slot, className = '', width = 60, height = 60 }: EquipmentSlotPlaceholderProps) => {
  // Отладочная информация
  console.log('EquipmentSlotPlaceholder received slot:', slot);
  console.log('ringImage value:', ringImage);
  console.log('bootsImage value:', bootsImage);
  console.log('helmetImage value:', helmetImage);
  
  // Маппинг слотов на локальные изображения
  const slotImages: { [key: string]: string } = {
    // Левая колонка (сверху вниз): Шлем, наручи, оружие, доспех, пояс
    helmet: helmetImage,
    bracers: bracersImage,
    weapon: weaponImage,
    armor: armorImage,
    belt: beltImage,
    
    // Правая колонка (сверху вниз): Серьги, амулет, 3 кольца, перчатки, щит, поножи, ботинки
    earring: earringImage,
    necklace: necklaceImage,
    ring1: ringImage,
    ring2: ringImage,
    ring3: ringImage,
    gloves: glovesImage,
    shield: shieldImage,
    leggings: leggingsImage,
    boots: bootsImage,
  };
  
  // Дополнительная проверка для отладки
  console.log('ring1 should be:', slotImages.ring1);
  console.log('ring2 should be:', slotImages.ring2);
  console.log('boots should be:', slotImages.boots);

  const imageUrl = slotImages[slot];
  console.log('EquipmentSlotPlaceholder imageUrl for slot', slot, ':', imageUrl);
  console.log('Available slots:', Object.keys(slotImages));
  console.log('slotImages object:', slotImages);
  
  if (!imageUrl) {
    console.warn('No image found for slot:', slot, 'using fallback');
    return (
      <div className={`bg-gray-600 border border-gray-500 rounded flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-2xl">❓</span>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gray-600 border border-gray-500 rounded flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
      }}
    >
      <img
        src={imageUrl}
        alt={`${slot} placeholder`}
        className="w-full h-full object-cover opacity-50"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = '<span class="text-gray-400 text-2xl">❓</span>';
          }
        }}
      />
    </div>
  );
};

export default EquipmentSlotPlaceholder;
