
import React from 'react';
import EquipmentSlot from './EquipmentSlot';
import { Equipment } from '@/types/game';

interface EquipmentDisplayProps {
  equipment: Equipment;
  player?: any;
}

// Более компактный layout для инвентаря
const EquipmentDisplay = ({ equipment, player }: EquipmentDisplayProps) => {
  console.log('EquipmentDisplay - equipment data:', equipment);
  console.log('EquipmentDisplay - player data:', player);
  
  return (
    <div className="flex justify-center items-start gap-1 select-none">
      {/* Левая колонка */}
      <div className="flex flex-col gap-0.5 items-center">
        <EquipmentSlot item={equipment.helmet} slot="helmet" size="small" />
        <EquipmentSlot item={equipment.bracers} slot="bracers" size="small" />
        <EquipmentSlot item={equipment.weapon} slot="weapon" size="small" />
        <EquipmentSlot item={equipment.armor} slot="armor" size="small" />
        <EquipmentSlot item={equipment.belt} slot="belt" size="small" />
      </div>
      {/* Центральная область — аватар героя */}
      <div
        className="game-bg-tertiary game-border-dark border-2 rounded flex items-center justify-center"
        style={{ width: '190px', height: '290px' }}
      >
        <img
          src={player?.character_image_url || player?.avatar_url || "/lovable-uploads/d34b59ae-7d60-4c9a-afce-737fbd38a77e.png"}
          alt="Character"
          className="w-full h-full object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = "/lovable-uploads/d34b59ae-7d60-4c9a-afce-737fbd38a77e.png";
          }}
        />
      </div>
      {/* Правая колонка */}
      <div className="flex flex-col gap-0.5 items-center">
        <EquipmentSlot item={equipment.earring} slot="earring" size="small" />
        <EquipmentSlot item={equipment.necklace} slot="necklace" size="small" />
        {/* Кольца в ряд, ТОЛЬКО 3 кольца */}
        <div className="flex flex-row gap-0.5">
          <EquipmentSlot item={equipment.ring1} slot="ring1" size="small" />
          <EquipmentSlot item={equipment.ring2} slot="ring2" size="small" />
          <EquipmentSlot item={equipment.ring3} slot="ring3" size="small" />
        </div>
        <EquipmentSlot item={equipment.gloves} slot="gloves" size="small" />
        <EquipmentSlot item={equipment.shield} slot="shield" size="small" />
        <EquipmentSlot item={equipment.leggings} slot="leggings" size="small" />
        <EquipmentSlot item={equipment.boots} slot="boots" size="small" />
      </div>
    </div>
  );
};

export default EquipmentDisplay;
