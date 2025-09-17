import React, { useState, useEffect } from 'react';
import EquipmentSlot from './EquipmentSlot';
import { SegmentBar } from './SegmentBar';
import BotEquipmentDisplay from './BotEquipmentDisplay';

interface BotBattlePanelProps {
  selectedBot: any;
  currentBotHealth: number;
  botEquipment: any;
  showSlashEffect?: boolean;
}

const BotBattlePanel = ({ selectedBot, currentBotHealth, botEquipment, showSlashEffect }: BotBattlePanelProps) => {
  console.log('BotBattlePanel DEBUG:', {
    selectedBot: selectedBot?.name,
    currentBotHealth,
    botEquipment,
    botEquipmentKeys: botEquipment ? Object.keys(botEquipment) : 'No equipment'
  });

  if (!selectedBot) {
    console.error('BotBattlePanel: selectedBot is null or undefined');
    return (
      <div className="panel panel--tint">
        <div className="text-center text-red-400 p-4">Ошибка загрузки данных противника</div>
      </div>
    );
  }

  // Безопасная проверка botEquipment
  const equipment = botEquipment || {};

  return (
    <div className="panel panel--tint panel--warm h-full">
      <div className="p-4 h-full flex flex-col">
        {/* Заголовок противника */}
        <div className="text-center mb-4">
          <h4 className="font-ui text-lg font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            {selectedBot.name || 'Unknown Bot'}
          </h4>
          <div className="medieval-subtitle text-ash/80">
            Уровень {selectedBot.level}
          </div>
        </div>
        
        {/* Полоски здоровья и маны */}
        <div className="space-y-3 mb-4">
          <SegmentBar
            label="Здоровье"
            value={currentBotHealth}
            max={selectedBot.maxHealth || selectedBot.health || 1}
            color="#b52a2a"
          />
          <SegmentBar
            label="Мана"
            value={selectedBot.mana || 50}
            max={selectedBot.maxMana || 50}
            color="#b58b46"
          />
        </div>
        
        {/* Экипировка бота */}
        <div className="flex-1 mb-4">
          <BotEquipmentDisplay bot={selectedBot} showSlashEffect={showSlashEffect} />
        </div>
      </div>
    </div>
  );
};

export default BotBattlePanel;
