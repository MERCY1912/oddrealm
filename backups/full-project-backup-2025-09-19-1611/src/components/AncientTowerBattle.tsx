
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bot, Player } from '@/types/game';
import PlayerBattlePanel from './PlayerBattlePanel';
import BotBattlePanel from './BotBattlePanel';
import BattleControlPanel from './BattleControlPanel';
import BattleResultScreen from './BattleResultScreen';
import VictoryAnimation from './VictoryAnimation';
import DefeatAnimation from './DefeatAnimation';
import { calculateFinalStats } from '@/utils/enhancedCharacterStats';

type BattleZone = 'head' | 'chest' | 'stomach' | 'groin' | 'legs';

interface AncientTowerBattleProps {
  player: Player;
  enemy: Bot;
  onPlayerUpdate: (player: Player) => void;
  onBattleEnd: (victory: boolean) => void;
  onFlee: () => void;
}

const AncientTowerBattle = ({ 
  player, 
  enemy, 
  onPlayerUpdate, 
  onBattleEnd, 
  onFlee 
}: AncientTowerBattleProps) => {
  const [currentEnemyHealth, setCurrentEnemyHealth] = useState(enemy.health);
  const [playerAttackZone, setPlayerAttackZone] = useState<BattleZone | null>(null);
  const [playerDefenseZone, setPlayerDefenseZone] = useState<BattleZone | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([
    `🏗️ Битва на этаже башни! Противник: ${enemy.name}`
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBattleResult, setShowBattleResult] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    victory: boolean;
    rewards: { experience: number; gold: number };
  } | null>(null);
  const [showSlashEffect, setShowSlashEffect] = useState(false);
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showDefeatAnimation, setShowDefeatAnimation] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debug equipment display
  useEffect(() => {
    console.log('AncientTowerBattle - Player object:', player);
    console.log('AncientTowerBattle - Player equipment:', player.equipment);
    console.log('AncientTowerBattle - Equipment keys:', player.equipment ? Object.keys(player.equipment) : 'No equipment');
  }, [player]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const getPlayerStats = () => {
    return calculateFinalStats(player, player.equipment);
  };

  const getTowerBattlePhrases = () => {
    const attackPhrases = [
      'обрушивает древнее проклятие',
      'призывает силы башни',
      'наносит мистический удар',
      'высвобождает темную энергию',
      'атакует с яростью веков',
      'использует магию древних',
      'призывает духов башни',
      'наносит сокрушительный удар'
    ];

    const blockPhrases = [
      'отражает древнее заклятье',
      'противостоит силам башни',
      'укрывается защитной аурой',
      'отбивает мистическую атаку',
      'использует защиту предков'
    ];

    const victoryPhrases = [
      'Страж башни повержен!',
      'Древний противник пал!',
      'Этаж башни пройден!',
      'Враг изгнан в небытие!',
      'Победа над стражем!'
    ];

    const defeatPhrases = [
      'Башня поглощает вашу силу...',
      'Древние духи побеждают...',
      'Мощь башни сокрушает вас...',
      'Стражи башни торжествуют...',
      'Тьма башни поглощает душу...'
    ];

    return { attackPhrases, blockPhrases, victoryPhrases, defeatPhrases };
  };

  const executeAttack = () => {
    if (!playerAttackZone || !playerDefenseZone || isProcessing) return;

    // Trigger slash effect
    setShowSlashEffect(true);
    setTimeout(() => setShowSlashEffect(false), 500); // Hide effect after 500ms

    setIsProcessing(true);
    const playerStats = getPlayerStats();
    const phrases = getTowerBattlePhrases();

    setTimeout(() => {
      const zones: BattleZone[] = ['head', 'chest', 'stomach', 'groin', 'legs'];
      const enemyAttackZone = zones[Math.floor(Math.random() * zones.length)];
      const enemyDefenseZone = zones[Math.floor(Math.random() * zones.length)];

      let newLog = [...battleLog];
      let playerDamage = 0;
      let enemyDamage = 0;

      const zoneNames = {
        head: 'голову',
        chest: 'грудь',
        stomach: 'живот',
        groin: 'пах',
        legs: 'ноги'
      };

      // Player attack
      if (playerAttackZone !== enemyDefenseZone) {
        playerDamage = Math.max(1, playerStats.attack - enemy.defense + Math.floor(Math.random() * 15));
        const attackPhrase = phrases.attackPhrases[Math.floor(Math.random() * phrases.attackPhrases.length)];
        newLog.push(`⚔️ Вы ${attackPhrase} в ${zoneNames[playerAttackZone]}: ${playerDamage} урона`);
      } else {
        const blockPhrase = phrases.blockPhrases[Math.floor(Math.random() * phrases.blockPhrases.length)];
        newLog.push(`🛡️ ${enemy.name} ${blockPhrase}`);
      }

      const newEnemyHealth = Math.max(0, currentEnemyHealth - playerDamage);
      setCurrentEnemyHealth(newEnemyHealth);

      // Enemy attack
      if (newEnemyHealth > 0) {
        if (enemyAttackZone !== playerDefenseZone) {
          enemyDamage = Math.max(1, enemy.attack - playerStats.defense + Math.floor(Math.random() * 12));
          const attackPhrase = phrases.attackPhrases[Math.floor(Math.random() * phrases.attackPhrases.length)];
          newLog.push(`💥 ${enemy.name} ${attackPhrase} в ${zoneNames[enemyAttackZone]}: ${enemyDamage} урона`);
        } else {
          const blockPhrase = phrases.blockPhrases[Math.floor(Math.random() * phrases.blockPhrases.length)];
          newLog.push(`🛡️ Вы ${blockPhrase}`);
        }
      }

      setBattleLog(newLog);

      const newPlayerHealth = Math.max(0, player.health - enemyDamage);
      const updatedPlayer = { ...player, health: newPlayerHealth };
      
      if (enemyDamage > 0) {
        onPlayerUpdate(updatedPlayer);
      }

      setTimeout(() => {
        if (newEnemyHealth <= 0) {
          const victoryPhrase = phrases.victoryPhrases[Math.floor(Math.random() * phrases.victoryPhrases.length)];
          const goldReward = Math.round(enemy.gold / 2);
          newLog.push(`🏆 ${victoryPhrase} +${enemy.experience} опыта, +${goldReward} золота`);
          setBattleLog(newLog);
          
          const finalPlayer = {
            ...updatedPlayer,
            experience: updatedPlayer.experience + enemy.experience,
            gold: updatedPlayer.gold + goldReward,
          };
          onPlayerUpdate(finalPlayer);

          setBattleResult({
            victory: true,
            rewards: {
              experience: enemy.experience,
              gold: goldReward
            }
          });

          setShowVictoryAnimation(true);
          setTimeout(() => {
            setShowVictoryAnimation(false);
            setShowBattleResult(true);
          }, 3000);
        } else if (newPlayerHealth <= 0) {
          const defeatPhrase = phrases.defeatPhrases[Math.floor(Math.random() * phrases.defeatPhrases.length)];
          newLog.push(`💀 ${defeatPhrase}`);
          setBattleLog(newLog);
          
          setBattleResult({
            victory: false,
            rewards: { experience: 0, gold: 0 }
          });
          
          setShowDefeatAnimation(true);
          setTimeout(() => {
            setShowDefeatAnimation(false);
            setShowBattleResult(true);
          }, 3000);
        } else {
          setPlayerAttackZone(null);
          setPlayerDefenseZone(null);
          setIsProcessing(false);
        }
      }, 1500);
    }, 1000);
  };

  const getEnemyEquipment = (enemy: Bot) => {
    const level = enemy.level;
    const isBoss = enemy.floorType === 'boss';
    
    return {
      weapon: level >= 1 || isBoss,
      armor: level >= 2 || isBoss,
      helmet: level >= 3 || isBoss,
      boots: level >= 1 || isBoss,
      gloves: level >= 4 || isBoss,
      shield: level >= 5 || isBoss,
      belt: level >= 3 || isBoss,
      necklace: level >= 6 || isBoss,
      ring1: level >= 7 || isBoss,
      ring2: level >= 8 || isBoss,
    };
  };

  const handleBattleResultContinue = () => {
    if (battleResult?.victory) {
      onBattleEnd(true);
    } else {
      onBattleEnd(false);
    }
  };

  const handleBattleResultLeave = () => {
    onFlee();
  };

  if (showBattleResult && battleResult) {
    return (
      <BattleResultScreen
        player={player}
        victory={battleResult.victory}
        rewards={battleResult.rewards}
        onContinue={handleBattleResultContinue}
        onLeaveTower={handleBattleResultLeave}
      />
    );
  }

  const playerStats = getPlayerStats();
  const enemyEquipment = getEnemyEquipment(enemy);

  return (
    <div className="min-h-screen medieval-bg-primary text-white">
      {/* Victory Animation */}
      <VictoryAnimation
        isVisible={showVictoryAnimation}
        onContinue={() => setShowVictoryAnimation(false)}
      />
      
      {/* Defeat Animation */}
      <DefeatAnimation
        isVisible={showDefeatAnimation}
        onContinue={() => setShowDefeatAnimation(false)}
      />
      
      {/* Header */}
      <div className="panel panel--tint panel--warm text-center py-3 mb-4">
        <h1 className="text-white text-lg font-bold">
          🏗️ БАШНЯ ДРЕВНИХ - {enemy.name} [{enemy.level}] против {player.username}
        </h1>
        {enemy.floorType === 'boss' && (
          <div className="text-red-400 font-bold text-sm">⚡ БОСС ЭТАЖА ⚡</div>
        )}
      </div>
      
      {/* Main battle grid */}
      <div className="flex justify-center gap-4 px-4 mb-4">
        {/* LEFT CONTAINER - PLAYER */}
        <PlayerBattlePanel player={player} playerStats={playerStats} />

        {/* CENTER CONTAINER - BATTLE CONTROL */}
        <BattleControlPanel
          playerAttackZone={playerAttackZone}
          playerDefenseZone={playerDefenseZone}
          setPlayerAttackZone={setPlayerAttackZone}
          setPlayerDefenseZone={setPlayerDefenseZone}
          executeAttack={executeAttack}
          isProcessing={isProcessing}
        />

        {/* RIGHT CONTAINER - ENEMY */}
        <BotBattlePanel
          selectedBot={{ ...enemy, health: currentEnemyHealth, maxHealth: enemy.maxHealth }}
          currentBotHealth={currentEnemyHealth}
          botEquipment={enemyEquipment}
          showSlashEffect={showSlashEffect}
        />
      </div>

      {/* Battle log */}
      <div className="mx-4 mb-4 panel panel--tint panel--warm p-4 h-32">
        <div 
          ref={logRef}
          className="h-full overflow-y-auto space-y-1"
        >
          {battleLog.map((log, index) => (
            <div key={index} className="text-gray-300 text-sm">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mx-4 mb-4 flex justify-center gap-4">
        <Button 
          onClick={onFlee}
          variant="outline"
          className="medieval-button bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
          disabled={isProcessing}
        >
          🚪 Покинуть башню
        </Button>
      </div>
    </div>
  );
};

export default AncientTowerBattle;
