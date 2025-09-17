
import React from 'react';
import { Button } from '@/components/ui/button';
import { CtaAttack } from './CtaAttack';

type BattleZone = 'head' | 'chest' | 'stomach' | 'groin' | 'legs';

interface BattleControlPanelProps {
  playerAttackZone: BattleZone | null;
  playerDefenseZone: BattleZone | null;
  setPlayerAttackZone: (zone: BattleZone) => void;
  setPlayerDefenseZone: (zone: BattleZone) => void;
  executeAttack: () => void;
  isProcessing: boolean;
}

const BattleControlPanel = ({
  playerAttackZone,
  playerDefenseZone,
  setPlayerAttackZone,
  setPlayerDefenseZone,
  executeAttack,
  isProcessing
}: BattleControlPanelProps) => {
  const zones: BattleZone[] = ['head', 'chest', 'stomach', 'groin', 'legs'];
  const zoneNames = { 
    head: 'Голова', 
    chest: 'Грудь', 
    stomach: 'Живот', 
    groin: 'Пах',
    legs: 'Ноги'
  };

  return (
    <div className="panel panel--tint panel--warm h-full">
      <div className="p-4 h-full flex flex-col">
        {/* Заголовок панели управления */}
        <div className="text-center mb-6">
          <h3 className="font-ui text-lg font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            УПРАВЛЕНИЕ БОЕМ
          </h3>
        </div>

        {/* Attack and Defense buttons in two columns */}
        <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
          {/* Attack buttons - left side */}
          <div className="panel panel--tint panel--warm p-3 border-2 border-red-500/50">
            <h4 className="text-red-500 font-bold text-center mb-3 text-sm flex items-center justify-center">
              <span className="mr-2">⚔️</span>
              АТАКА
            </h4>
            <div className="space-y-2">
              {zones.map(zone => {
                const isSelected = playerAttackZone === zone;
                
                return (
                  <button
                    key={zone}
                    onClick={() => setPlayerAttackZone(zone)}
                    disabled={isProcessing}
                    className={`w-full py-2 px-2 rounded transition-all text-sm font-medium medieval-button relative overflow-hidden ${
                      isSelected
                        ? 'text-white border border-red-400 shadow-glow'
                        : 'hover:border-red-400/50'
                    }`}
                    style={isSelected ? {
                      background: "linear-gradient(180deg, #b52a2a 0%, #b52a2add 50%, #7a1b1b 100%)"
                    } : {}}
                  >
                    {/* Эффекты потертости для выбранной кнопки */}
                    {isSelected && (
                      <>
                        {/* Сегменты - риски потертости */}
                        <div className="absolute inset-0 opacity-30"
                             style={{ background: "repeating-linear-gradient(90deg, transparent 0 8px, rgba(255,255,255,.12) 8px 9px)" }} />
                        {/* Внутренний блик */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,.15),transparent_40%)]" />
                        {/* Верхний глянцевый блик */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,.2),transparent_50%)]" />
                      </>
                    )}
                    {zoneNames[zone]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Defense buttons - right side */}
          <div className="panel panel--tint panel--warm p-3 border-2 border-blue-500/50">
            <h4 className="text-blue-500 font-bold text-center mb-3 text-sm flex items-center justify-center">
              <span className="mr-2">🛡️</span>
              ЗАЩИТА
            </h4>
            <div className="space-y-2">
              {zones.map(zone => {
                const isSelected = playerDefenseZone === zone;
                
                return (
                  <button
                    key={zone}
                    onClick={() => setPlayerDefenseZone(zone)}
                    disabled={isProcessing}
                    className={`w-full py-2 px-2 rounded transition-all text-sm font-medium medieval-button ${
                      isSelected
                        ? 'text-white border border-blue-400 shadow-glow'
                        : 'hover:border-blue-400/50'
                    }`}
                    style={isSelected ? {
                      background: "linear-gradient(145deg, #1e3a8a, #3b82f6, #1d4ed8)"
                    } : {}}
                  >
                    {zoneNames[zone]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Attack button - centered */}
        <div className="text-center">
          <CtaAttack
            onClick={executeAttack}
            disabled={!playerAttackZone || !playerDefenseZone || isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default BattleControlPanel;
