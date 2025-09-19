import React from 'react';
import EquipmentSlot from './EquipmentSlot';

interface BotEquipmentDisplayProps {
  bot: any;
  showSlashEffect?: boolean;
}

// Более компактный layout для инвентаря бота (пустые слоты)
const BotEquipmentDisplay = ({ bot, showSlashEffect }: BotEquipmentDisplayProps) => {
  // Создаем пустой объект экипировки для бота
  // Боты по умолчанию не имеют предметов, поэтому все слоты будут пустыми
  const emptyEquipment = {
    helmet: undefined,
    bracers: undefined,
    weapon: undefined,
    armor: undefined,
    belt: undefined,
    earring: undefined,
    necklace: undefined,
    ring1: undefined,
    ring2: undefined,
    ring3: undefined,
    gloves: undefined,
    shield: undefined,
    leggings: undefined,
    boots: undefined
 };

  return (
    <div className="flex justify-center items-start gap-1 select-none">
      {/* Левая колонка */}
      <div className="flex flex-col gap-0.5 items-center">
        <EquipmentSlot item={emptyEquipment.helmet} slot="helmet" size="small" />
        <EquipmentSlot item={emptyEquipment.bracers} slot="bracers" size="small" />
        <EquipmentSlot item={emptyEquipment.weapon} slot="weapon" size="small" />
        <EquipmentSlot item={emptyEquipment.armor} slot="armor" size="small" />
        <EquipmentSlot item={emptyEquipment.belt} slot="belt" size="small" />
      </div>
      {/* Центральная область — аватар бота */}
      <div
        className="game-bg-tertiary game-border-dark border-2 rounded flex items-center justify-center relative"
        style={{ width: '190px', height: '290px' }}
      >
        {bot?.image && (bot.image.includes('.jpg') || bot.image.includes('.png') || bot.image.includes('.jpeg') || bot.image.includes('.gif') || bot.image.includes('.webp')) ? (
          <img
            src={bot.image}
            alt={bot.name || 'Bot'}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="text-6xl opacity-60">👾</div>';
              }
            }}
          />
        ) : (
          <div className="text-6xl opacity-60">
            {bot?.image || '👾'}
          </div>
        )}
        {showSlashEffect && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-red-500 transform rotate-45 origin-center animate-slash-effect"></div>
          </div>
        )}
      </div>
      {/* Правая колонка */}
      <div className="flex flex-col gap-0.5 items-center">
        <EquipmentSlot item={emptyEquipment.earring} slot="earring" size="small" />
        <EquipmentSlot item={emptyEquipment.necklace} slot="necklace" size="small" />
        {/* Кольца в ряд, ТОЛЬКО 3 кольца */}
        <div className="flex flex-row gap-0.5">
          <EquipmentSlot item={emptyEquipment.ring1} slot="ring1" size="small" />
          <EquipmentSlot item={emptyEquipment.ring2} slot="ring2" size="small" />
          <EquipmentSlot item={emptyEquipment.ring3} slot="ring3" size="small" />
        </div>
        <EquipmentSlot item={emptyEquipment.gloves} slot="gloves" size="small" />
        <EquipmentSlot item={emptyEquipment.shield} slot="shield" size="small" />
        <EquipmentSlot item={emptyEquipment.leggings} slot="leggings" size="small" />
        <EquipmentSlot item={emptyEquipment.boots} slot="boots" size="small" />
      </div>
    </div>
  );
};

export default BotEquipmentDisplay;