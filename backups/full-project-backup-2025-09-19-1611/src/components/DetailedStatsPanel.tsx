import React, { useState } from 'react';
import { Player } from '@/types/game';

interface DetailedStatsPanelProps {
  player: Player;
}

const DetailedStatsPanel = ({ player }: DetailedStatsPanelProps) => {
  const [expandedSections, setExpandedSections] = useState({
    characteristics: true,
    modifiers: true,
    defense: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Вычисляем статы (только те, что есть в игре)
  const baseStats = {
    strength: player.strength || 10,
    dexterity: player.dexterity || 10,
    endurance: player.endurance || 10,
    magic: player.magic || 10,
    luck: player.luck || 10,
  };

  const modifiers = {
    attack: player.attack || 20,
    defense: player.defense || 15,
    criticalChance: Math.min(5 + (baseStats.dexterity * 0.5), 50),
    dodgeChance: Math.min(3 + (baseStats.dexterity * 0.3), 30),
    blockChance: Math.min(2 + (baseStats.strength * 0.2), 25),
    magicResist: Math.min(5 + (baseStats.magic * 0.4), 40),
  };

  const defenseStats = {
    physicalDefense: modifiers.defense,
    magicDefense: modifiers.magicResist,
  };


  const StatRow = ({ label, value, color = "text-white", isPositive = true }: { 
    label: string; 
    value: string | number; 
    color?: string;
    isPositive?: boolean;
  }) => {
    const valueColor = typeof value === 'number' 
      ? (isPositive ? 'text-emerald-400' : 'text-rose-400')
      : color;
    
    return (
      <div className="flex justify-between items-center text-sm gap-2">
        <span className="text-gray-300">{label}:</span>
        <span className={`font-bold text-right tabular-nums ${valueColor}`}>{value}</span>
      </div>
    );
  };

  const SectionHeader = ({ title, isExpanded, onToggle, extraText }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void;
    extraText?: string;
  }) => (
    <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
      <span className="text-white font-bold">{title}</span>
      <div className="flex items-center gap-2">
        {extraText && <span className="text-blue-400 text-xs cursor-pointer hover:underline">{extraText}</span>}
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </div>
    </div>
  );

  return (
    <section className="panel panel--tint h-full flex flex-col">
      <div className="p-4 h-full flex flex-col text-sm">
        <h2 className="text-lg font-bold text-white mb-4 text-center">
          ДЕТАЛЬНЫЕ СТАТЫ
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Прогресс и ресурсы */}
          <div className="space-y-2 p-2">
            <StatRow label="Опыт" value={player.experience || 0} color="text-white" />
            <StatRow label="До следующего уровня" value={player.experienceToNext || 0} color="text-blue-400" />
            <StatRow label="Здоровье" value={`${player.health}/${player.maxHealth}`} color="text-red-400" />
            <StatRow label="Мана" value={`${player.mana}/${player.maxMana}`} color="text-blue-400" />
            <StatRow label="Золото" value={player.gold} color="text-yellow-400" />
            <StatRow label="Свободные очки" value={player.freeStatPoints || 0} color="text-green-400" />
          </div>


          {/* Характеристики */}
          <div className="p-3 bg-[#1b1b22]/30 rounded border border-[#2a2a33] space-y-2">
            <SectionHeader 
              title="Характеристики" 
              isExpanded={expandedSections.characteristics} 
              onToggle={() => toggleSection('characteristics')} 
            />
            {expandedSections.characteristics && (
              <div className="mt-2 space-y-2">
                <StatRow label="Сила" value={baseStats.strength} color="text-red-400" />
                <StatRow label="Ловкость" value={baseStats.dexterity} color="text-green-400" />
                <StatRow label="Выносливость" value={baseStats.endurance} color="text-yellow-400" />
                <StatRow label="Магия" value={baseStats.magic} color="text-purple-400" />
                <StatRow label="Удача" value={baseStats.luck} color="text-pink-400" />
              </div>
            )}
          </div>

          {/* Модификаторы */}
          <div className="p-3 bg-[#1b1b22]/30 rounded border border-[#2a2a33] space-y-2">
            <SectionHeader 
              title="Модификаторы" 
              isExpanded={expandedSections.modifiers} 
              onToggle={() => toggleSection('modifiers')} 
            />
            {expandedSections.modifiers && (
              <div className="mt-2 space-y-2">
                <StatRow label="Атака" value={modifiers.attack} color="text-orange-400" />
                <StatRow label="Защита" value={modifiers.defense} color="text-blue-400" />
                <StatRow label="Шанс критического удара" value={`${modifiers.criticalChance.toFixed(1)}%`} color="text-red-400" />
                <StatRow label="Шанс уворота" value={`${modifiers.dodgeChance.toFixed(1)}%`} color="text-green-400" />
                <StatRow label="Шанс блока" value={`${modifiers.blockChance.toFixed(1)}%`} color="text-yellow-400" />
                <StatRow label="Сопротивление магии" value={`${modifiers.magicResist.toFixed(1)}%`} color="text-purple-400" />
              </div>
            )}
          </div>

          {/* Защита */}
          <div className="p-3 bg-[#1b1b22]/30 rounded border border-[#2a2a33] space-y-2">
            <SectionHeader 
              title="Защита" 
              isExpanded={expandedSections.defense} 
              onToggle={() => toggleSection('defense')} 
            />
            {expandedSections.defense && (
              <div className="mt-2 space-y-2">
                <StatRow label="Физическая защита" value={defenseStats.physicalDefense} color="text-gray-400" />
                <StatRow label="Магическая защита" value={`${defenseStats.magicDefense.toFixed(1)}%`} color="text-purple-400" />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default DetailedStatsPanel;
