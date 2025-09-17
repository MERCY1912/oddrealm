
import React from 'react';
import { Player } from '@/types/game';
import OrnateFrame from './OrnateFrame';
import { Bar } from './Bar';
import { SegmentBar } from './SegmentBar';
import EquipmentSlots from './EquipmentSlots';

interface CharacterPanelProps {
  player: Player;
}

const CharacterPanel = ({ player }: CharacterPanelProps) => {
  const classNames = {
    warrior: 'Воин',
    mage: 'Маг', 
    archer: 'Лучник',
  };

  const classEmojis = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
  };

  return (
    <OrnateFrame title={`${classEmojis[player.class]} ${player.username}`} tone="epic" corners={4} edges>
      <div className="text-center mb-4">
        <div className="medieval-subtitle">
          {classNames[player.class]} • Уровень {player.level}
        </div>
      </div>
      
      <div className="space-y-4">
        <SegmentBar 
          label="Здоровье" 
          value={player.health} 
          max={player.maxHealth} 
          color="#b52a2a" 
        />
        
        <SegmentBar 
          label="Мана" 
          value={player.mana} 
          max={player.maxMana} 
          color="#b58b46" 
        />
        
        <SegmentBar 
          label="Опыт" 
          value={player.experience} 
          max={player.experienceToNext} 
          color="#7c5cff" 
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center medieval-bg-tertiary rounded-lg p-3">
            <div className="medieval-accent-blood text-xl font-bold">{player.attack}</div>
            <div className="medieval-caption">⚔️ Атака</div>
          </div>
          <div className="text-center medieval-bg-tertiary rounded-lg p-3">
            <div className="medieval-accent-gold text-xl font-bold">{player.defense}</div>
            <div className="medieval-caption">🛡️ Защита</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 medieval-bg-tertiary rounded-lg p-3">
          <span className="medieval-accent-gold text-xl">💰</span>
          <span className="medieval-accent-gold font-bold text-lg">{player.gold}</span>
          <span className="medieval-caption">золота</span>
        </div>
      </div>
      
      {/* Слоты экипировки */}
      <div className="mt-6">
        <EquipmentSlots 
          onSlotClick={(slot) => console.log('Clicked equipment slot:', slot)}
        />
      </div>
    </OrnateFrame>
  );
};

export default CharacterPanel;
