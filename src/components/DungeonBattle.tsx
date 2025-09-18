import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Player, Bot, DungeonRun } from '@/types/game';
import { useBattleState } from '@/hooks/useBattleState';
import { useToast } from '@/hooks/use-toast';
import PlayerBattlePanel from './PlayerBattlePanel';
import BotBattlePanel from './BotBattlePanel';
import BattleControlPanel from './BattleControlPanel';

interface DungeonBattleProps {
  player: Player;
  enemy: Bot;
  dungeonRun: DungeonRun;
  onBattleEnd: (victory: boolean, rewards?: any) => void;
  onFlee: () => void;
}

const DungeonBattle = ({ player, enemy, dungeonRun, onBattleEnd, onFlee }: DungeonBattleProps) => {
  const [showBattleInterface, setShowBattleInterface] = useState(false);
  const { toast } = useToast();

  const {
    playerStats,
    selectedBot,
    setSelectedBot,
    currentBotHealth,
    setCurrentBotHealth,
    inBattle,
    setInBattle,
    playerAttackZone,
    setPlayerAttackZone,
    playerDefenseZone,
    setPlayerDefenseZone,
    battleLog,
    setBattleLog,
    isProcessing,
    setIsProcessing,
    startBattle,
    executeAttack,
  } = useBattleState({
    player,
    onPlayerUpdate: () => {}, // Will be handled by parent
    onBattleStateChange: () => {},
    onBattleEnd: (victory: boolean, rewards: { experience: number; gold: number }) => {
      handleBattleEnd(victory);
    },
    bots: [enemy],
    toast,
  });

  const handleStartBattle = () => {
    setSelectedBot(enemy);
    setCurrentBotHealth(enemy.health);
    setInBattle(true);
    setBattleLog([{ 
      text: `🔥 Смертельная схватка с ${enemy.name} в подземелье началась!`, 
      type: 'info' 
    }]);
    setShowBattleInterface(true);
  };

  const handleBattleEnd = (victory: boolean) => {
    setShowBattleInterface(false);
    setInBattle(false);
    
    if (victory) {
      const rewards = {
        gold: enemy.gold,
        exp: enemy.experience
      };
      onBattleEnd(true, rewards);
    } else {
      onBattleEnd(false);
    }
  };

  if (showBattleInterface && inBattle) {
    const getBotEquipment = (bot: any) => {
      const level = bot.level;
      return {
        weapon: level >= 1,
        armor: level >= 2,
        helmet: level >= 3,
        boots: level >= 1,
        gloves: level >= 4,
        shield: level >= 5,
        belt: level >= 3,
        necklace: level >= 6,
        ring1: level >= 7,
        ring2: level >= 8,
      };
    };

    return (
      <div className="max-w-7xl mx-auto">
        {/* Заголовок боя */}
        <div className="panel panel--tint panel--warm text-center py-4 mb-6">
          <h1 className="font-ui text-2xl font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            {selectedBot?.name} [{selectedBot?.level}] против {player.username} - Подземелье
          </h1>
        </div>

        {/* Основная область боя - используем те же компоненты что и в арене */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 h-[600px]">
          {/* Панель игрока */}
          <PlayerBattlePanel 
            player={player} 
            playerStats={playerStats} 
          />
          
          {/* Панель управления боем */}
          <BattleControlPanel
            playerAttackZone={playerAttackZone}
            playerDefenseZone={playerDefenseZone}
            setPlayerAttackZone={setPlayerAttackZone}
            setPlayerDefenseZone={setPlayerDefenseZone}
            executeAttack={executeAttack}
            isProcessing={isProcessing}
          />
          
          {/* Панель противника */}
          <BotBattlePanel
            selectedBot={selectedBot}
            currentBotHealth={currentBotHealth}
            botEquipment={getBotEquipment(selectedBot)}
          />
        </div>

        {/* Лог боя */}
        <div className="panel panel--tint panel--warm p-4">
          <h3 className="text-white font-bold mb-2">ХРОНИКА БИТВЫ</h3>
          <div className="bg-gray-900 p-3 rounded max-h-40 overflow-y-auto">
            {battleLog.map((entry, index) => (
              <div key={index} className={`text-sm mb-1 ${
                entry.type === 'victory' ? 'text-green-400' :
                entry.type === 'defeat' ? 'text-red-400' :
                entry.type === 'crit' ? 'text-yellow-400' :
                entry.type === 'dodge' ? 'text-blue-400' :
                'text-gray-300'
              }`}>
                {entry.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 bg-opacity-80 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-2xl">
          ⚔️ Бой в подземелье
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          <div className="bg-red-900 bg-opacity-50 p-6 rounded-lg">
            <div className="text-white font-bold text-2xl mb-2">
              {enemy.image} {enemy.name} [{enemy.level}]
            </div>
            <div className="text-gray-300 space-y-1">
              <div>❤️ Здоровье: {enemy.health}/{enemy.maxHealth}</div>
              <div>⚔️ Атака: {enemy.attack}</div>
              <div>🛡️ Защита: {enemy.defense}</div>
              <div>💰 Награда: {enemy.gold} золота</div>
              <div>⭐ Опыт: {enemy.experience}</div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleStartBattle}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              ⚔️ Начать бой
            </Button>
            <Button
              onClick={onFlee}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-lg"
            >
              🏃 Бежать
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DungeonBattle;
