
import { useRef, useState, useEffect } from 'react';
import { calculateFinalStats } from '@/utils/enhancedCharacterStats';
import { Player } from '@/types/game';

// Add missing types here
export type BattleZone = 'head' | 'chest' | 'stomach' | 'groin' | 'legs';

export type BattleLogEntry = {
  text: string;
  type: 'normal' | 'crit' | 'dodge' | 'victory' | 'defeat' | 'info';
};

interface Bot {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  image: string;
  image_url: string | null;
  difficulty: string;
}

interface UseBattleStateProps {
  player: Player;
  onPlayerUpdate: (updates: Partial<Player>) => void;
  onBattleStateChange?: (inBattle: boolean) => void;
  onBattleEnd?: (victory: boolean, rewards: { experience: number; gold: number }) => void;
  bots: Bot[];
  toast: any;
}

export const useBattleState = ({
  player,
  onPlayerUpdate,
  onBattleStateChange,
  onBattleEnd,
  bots,
  toast,
}: UseBattleStateProps) => {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [currentBotHealth, setCurrentBotHealth] = useState(0);
  const [inBattle, setInBattle] = useState(false);
  const [playerAttackZone, setPlayerAttackZone] = useState<BattleZone | null>(null);
  const [playerDefenseZone, setPlayerDefenseZone] = useState<BattleZone | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    onBattleStateChange?.(inBattle);
  }, [inBattle, onBattleStateChange]);

  // Add error handling for calculateFinalStats
  let playerStats;
  try {
    playerStats = calculateFinalStats(player, player.equipment || {});
  } catch (error) {
    console.error('Error calculating player stats:', error);
    // Fallback stats
    playerStats = {
      attack: player.attack || 10,
      defense: player.defense || 5,
      maxHealth: player.maxHealth || 100,
      maxMana: player.maxMana || 50,
      critChance: 5,
      dodgeChance: 5,
    };
  }

  const startBattle = (bot: Bot) => {
    console.log('Starting battle with:', bot);
    setSelectedBot(bot);
    setCurrentBotHealth(bot.health);
    setInBattle(true);
    setBattleLog([{ text: `🔥 Смертельная схватка с ${bot.name} началась! Кровь прольется...`, type: 'info' }]);
    setPlayerAttackZone(null);
    setPlayerDefenseZone(null);
  };

  const getBrutalPhrases = () => {
    const attackPhrases = [
      'наносит жестокий удар',
      'разрывает плоть',
      'проливает кровь',
      'сокрушает кости',
      'терзает противника',
      'безжалостно атакует',
      'наносит смертельный удар',
      'разбивает череп',
      'пронзает насквозь',
      'размазывает по стене'
    ];

    const blockPhrases = [
      'отражает смертоносную атаку',
      'избегает кровавой расправы',
      'уклоняется от погибели',
      'блокирует удар судьбы',
      'спасается от неминуемой смерти'
    ];

    const victoryPhrases = [
      'Враг повержен в агонии!',
      'Противник истекает кровью!',
      'Жертва пала к вашим ногам!',
      'Еще один труп для коллекции!',
      'Смерть забрала очередную душу!'
    ];

    const defeatPhrases = [
      'Ваша кровь орошает землю...',
      'Тьма поглощает вашу душу...',
      'Смерть приветствует вас...',
      'Ваши кости будут удобрением...',
      'Агония - ваш последний спутник...'
    ];

    return { attackPhrases, blockPhrases, victoryPhrases, defeatPhrases };
  };

  const executeAttack = () => {
    if (!selectedBot || !playerAttackZone || !playerDefenseZone || isProcessing) {
      console.log('Attack blocked:', { selectedBot, playerAttackZone, playerDefenseZone, isProcessing });
      return;
    }

    console.log('Executing attack...');
    setIsProcessing(true);
    const phrases = getBrutalPhrases();

    setTimeout(() => {
      const zones: BattleZone[] = ['head', 'chest', 'stomach', 'groin', 'legs'];
      const botAttackZone = zones[Math.floor(Math.random() * zones.length)];
      const botDefenseZone = zones[Math.floor(Math.random() * zones.length)];

      let turnLog: BattleLogEntry[] = [];
      let playerDamage = 0;
      let botDamage = 0;

      const zoneNames = {
        head: 'голову',
        chest: 'грудь',
        stomach: 'живот',
        groin: 'пах',
        legs: 'ноги'
      };

      // Player's turn
      const isPlayerCrit = Math.random() * 100 < (playerStats.critChance || 5);
      const isBotDodge = Math.random() * 100 < 5; // Bots have a base 5% dodge chance

      if (isBotDodge) {
        turnLog.push({ text: `💨 ${selectedBot.name} увернулся от вашей атаки!`, type: 'dodge' });
      } else if (playerAttackZone !== botDefenseZone) {
        playerDamage = Math.max(1, (playerStats.attack || 10) - selectedBot.defense + Math.floor(Math.random() * 10));
        if (isPlayerCrit) {
          playerDamage = Math.floor(playerDamage * 1.5);
          turnLog.push({ text: `💥 КРИТИЧЕСКИЙ УДАР! Вы вонзаете оружие в ${zoneNames[playerAttackZone]}: ${playerDamage} урона`, type: 'crit' });
        } else {
          const attackPhrase = phrases.attackPhrases[Math.floor(Math.random() * phrases.attackPhrases.length)];
          turnLog.push({ text: `⚔️ Вы ${attackPhrase} в ${zoneNames[playerAttackZone]}: ${playerDamage} урона`, type: 'normal' });
        }
      } else {
        const blockPhrase = phrases.blockPhrases[Math.floor(Math.random() * phrases.blockPhrases.length)];
        turnLog.push({ text: `🛡️ ${selectedBot.name} ${blockPhrase}`, type: 'normal' });
      }
      
      const newBotHealth = Math.max(0, currentBotHealth - playerDamage);
      setCurrentBotHealth(newBotHealth);

      // Bot's turn
      if (newBotHealth > 0) {
        const isBotCrit = Math.random() * 100 < 5;
        const isPlayerDodge = Math.random() * 100 < (playerStats.dodgeChance || 5);
        
        if (isPlayerDodge) {
            turnLog.push({ text: `💨 Вы увернулись от атаки ${selectedBot.name}!`, type: 'dodge' });
        } else if (botAttackZone !== playerDefenseZone) {
          botDamage = Math.max(1, selectedBot.attack - (playerStats.defense || 5) + Math.floor(Math.random() * 8));
          if (isBotCrit) {
              botDamage = Math.floor(botDamage * 1.5);
              turnLog.push({ text: `💥 КРИТИЧЕСКИЙ УДАР! ${selectedBot.name} наносит сокрушительный удар в ${zoneNames[botAttackZone]}: ${botDamage} урона`, type: 'crit' });
          } else {
              const attackPhrase = phrases.attackPhrases[Math.floor(Math.random() * phrases.attackPhrases.length)];
              turnLog.push({ text: `💥 ${selectedBot.name} ${attackPhrase} в ${zoneNames[botAttackZone]}: ${botDamage} урона`, type: 'normal' });
          }
        } else {
          const blockPhrase = phrases.blockPhrases[Math.floor(Math.random() * phrases.blockPhrases.length)];
          turnLog.push({ text: `🛡️ Вы ${blockPhrase}`, type: 'normal' });
        }
      }

      setBattleLog(prev => [...prev, ...turnLog]);

      const newPlayerHealth = Math.max(0, player.health - botDamage);

      setTimeout(() => {
        if (newBotHealth <= 0) {
          const victoryPhrase = phrases.victoryPhrases[Math.floor(Math.random() * phrases.victoryPhrases.length)];
          setBattleLog(prev => [...prev, { text: `🏆 ${victoryPhrase} +${selectedBot.experience} опыта, +${selectedBot.gold} золота`, type: 'victory' }]);
          
          onPlayerUpdate({
            experience: player.experience + selectedBot.experience,
            gold: player.gold + selectedBot.gold,
            health: newPlayerHealth,
          });

          toast({
            title: 'Кровавая победа!',
            description: `+${selectedBot.experience} опыта, +${selectedBot.gold} золота`,
          });

          // Call onBattleEnd with victory and rewards
          onBattleEnd?.(true, {
            experience: selectedBot.experience,
            gold: selectedBot.gold
          });

          endBattle();
        } else if (newPlayerHealth <= 0) {
          const defeatPhrase = phrases.defeatPhrases[Math.floor(Math.random() * phrases.defeatPhrases.length)];
          setBattleLog(prev => [...prev, { text: `💀 ${defeatPhrase}`, type: 'defeat' }]);
          onPlayerUpdate({ health: newPlayerHealth });
          toast({
            title: 'Смертельное поражение',
            description: 'Вы пали в бою',
            variant: 'destructive',
          });
          
          // Call onBattleEnd with defeat and no rewards
          onBattleEnd?.(false, {
            experience: 0,
            gold: 0
          });
          
          endBattle();
        } else {
          if (botDamage > 0) {
            onPlayerUpdate({ health: newPlayerHealth });
          }
          setPlayerAttackZone(null);
          setPlayerDefenseZone(null);
          setIsProcessing(false);
        }
      }, 1500);
    }, 1000);
  };

  const endBattle = () => {
    setInBattle(false);
    setSelectedBot(null);
    setCurrentBotHealth(0);
    setPlayerAttackZone(null);
    setPlayerDefenseZone(null);
    setIsProcessing(false);
    setTimeout(() => setBattleLog([]), 5000);
  };

  return {
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
    endBattle,
  };
};
