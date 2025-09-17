
import React, { useRef, useEffect } from 'react';
import PlayerBattlePanel from './PlayerBattlePanel';
import BotBattlePanel from './BotBattlePanel';
import BattleControlPanel from './BattleControlPanel';
import { BattleZone, BattleLogEntry } from '@/hooks/useBattleState';

interface BattleInterfaceProps {
  player: any;
  playerStats: any;
  selectedBot: any;
  currentBotHealth: number;
  botEquipment: any;
  playerAttackZone: BattleZone | null;
  playerDefenseZone: BattleZone | null;
  setPlayerAttackZone: (zone: BattleZone) => void;
  setPlayerDefenseZone: (zone: BattleZone) => void;
  executeAttack: () => void;
  isProcessing: boolean;
  battleLog: BattleLogEntry[];
}

const BattleInterface = ({
  player,
  playerStats,
  selectedBot,
  currentBotHealth,
  botEquipment,
  playerAttackZone,
  playerDefenseZone,
  setPlayerAttackZone,
  setPlayerDefenseZone,
  executeAttack,
  isProcessing,
  battleLog,
}: BattleInterfaceProps) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  console.log('BattleInterface DEBUG:', { 
    player: player?.username, 
    selectedBot: selectedBot?.name, 
    executeAttack: typeof executeAttack,
    playerStats,
    botEquipment
  });

  if (!selectedBot || !player) {
    console.error('BattleInterface: Missing critical data', { selectedBot: !!selectedBot, player: !!player });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel panel--tint text-center p-8">
          <div className="text-white text-lg font-bold mb-4">⚔️ Подготовка к битве...</div>
          <div className="text-gray-400">Загрузка данных противника и игрока</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{
      background: "linear-gradient(180deg, #1c2029 0%, #171a21 100%)"
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Заголовок боя */}
        <div className="panel panel--tint panel--warm text-center py-4 mb-6">
          <h1 className="font-ui text-2xl font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            {selectedBot.name} [{selectedBot.level}] против {player.username}
          </h1>
        </div>

        {/* Основная область боя */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <PlayerBattlePanel player={player} playerStats={playerStats} />
          <BattleControlPanel
            playerAttackZone={playerAttackZone}
            playerDefenseZone={playerDefenseZone}
            setPlayerAttackZone={setPlayerAttackZone}
            setPlayerDefenseZone={setPlayerDefenseZone}
            executeAttack={executeAttack}
            isProcessing={isProcessing}
          />
          <BotBattlePanel
            selectedBot={selectedBot}
            currentBotHealth={currentBotHealth}
            botEquipment={botEquipment}
          />
        </div>

        {/* Лог боя */}
        <div className="panel panel--tint panel--warm p-6">
          <h3 className="font-ui text-lg font-bold text-center mb-4"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            ХРОНИКА БИТВЫ
          </h3>
          <div
            ref={logRef}
            className="h-32 overflow-y-auto space-y-1 game-scrollbar"
          >
            {battleLog.map((log, index) => {
              let logClass = "text-gray-300";
              if (log.type === 'crit') logClass = "text-red-400 font-bold";
              if (log.type === 'dodge') logClass = "text-green-400 font-bold";
              if (log.type === 'victory') logClass = "text-yellow-400 font-bold";
              if (log.type === 'defeat') logClass = "text-red-400 font-bold";
              if (log.type === 'info') logClass = "text-blue-400";
              return (
                <div key={index} className={`text-sm transition-all duration-300 ${logClass}`}>
                  {log.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleInterface;
