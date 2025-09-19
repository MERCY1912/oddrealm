
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PlayerBattlePanel from './PlayerBattlePanel';
import BotBattlePanel from './BotBattlePanel';
import BattleControlPanel from './BattleControlPanel';
import { formatPlayerName } from '@/utils/playerUtils';
import { calculateFinalStats } from '@/utils/enhancedCharacterStats';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBattleState } from '@/hooks/useBattleState';
import BotSelectionPanel from './BotSelectionPanel';
import BattleInterface from './BattleInterface';
import SimpleArenaBotList from './SimpleArenaBotList';
import { ArenaBot, Player } from '@/types/game';
import { arenaBots } from '@/data/arenaBots';
import PvPArena from './PvPArena';

type BattleZone = 'head' | 'chest' | 'stomach' | 'groin' | 'legs';

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
  image: string; // Emoji
  image_url: string | null; // For list display
  difficulty: string;
}

interface NewBattleArenaProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onBattleStateChange?: (inBattle: boolean) => void;
  preselectedBot?: ArenaBot | null;
  defaultTab?: string;
}

type BattleLogEntry = {
  text: string;
  type: 'normal' | 'crit' | 'dodge' | 'victory' | 'defeat' | 'info';
};

const NewBattleArena = ({ player, onPlayerUpdate, onBattleStateChange, preselectedBot, defaultTab = 'pve' }: NewBattleArenaProps) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [arenaTab, setArenaTab] = useState(defaultTab);
  const [selectedArenaBot, setSelectedArenaBot] = useState<ArenaBot | null>(null);
  const { toast } = useToast();

  console.log('NewBattleArena render with player:', player);

  useEffect(() => {
    const fetchBots = async () => {
      setLoadingBots(true);
      try {
        const { data, error } = await supabase
          .from('admin_bots')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        
        const difficultyToEmoji: { [key: string]: string } = {
          easy: '🐀',
          medium: '🐺',
          hard: '👹',
          boss: '🐉',
        };

        const formattedBots: Bot[] = data.map(dbBot => ({
          id: dbBot.id,
          name: dbBot.name,
          level: dbBot.level,
          health: dbBot.health,
          maxHealth: dbBot.max_health,
          attack: dbBot.attack,
          defense: dbBot.defense,
          experience: dbBot.experience,
          gold: dbBot.gold,
          image: difficultyToEmoji[dbBot.difficulty] || '💀',
          image_url: dbBot.image_url,
          difficulty: dbBot.difficulty,
        }));
        setBots(formattedBots);
        console.log('Loaded bots:', formattedBots);
      } catch (error) {
        console.error('Error fetching bots:', error);
        console.log('Using demo bots instead');
        
        // Добавляем тестовых ботов для демонстрации
        const demoBots: Bot[] = [
          {
            id: 'demo-1',
            name: 'Гоблин-воин',
            level: 4,
            health: 80,
            maxHealth: 80,
            attack: 25,
            defense: 8,
            experience: 50,
            gold: 30,
            image: '🐀',
            image_url: null,
            difficulty: 'easy'
          },
          {
            id: 'demo-2',
            name: 'Орк-берсерк',
            level: 4,
            health: 120,
            maxHealth: 120,
            attack: 35,
            defense: 12,
            experience: 75,
            gold: 45,
            image: '🐺',
            image_url: null,
            difficulty: 'medium'
          },
          {
            id: 'demo-3',
            name: 'Темный рыцарь',
            level: 5,
            health: 150,
            maxHealth: 150,
            attack: 45,
            defense: 18,
            experience: 100,
            gold: 60,
            image: '👹',
            image_url: null,
            difficulty: 'hard'
          }
        ];
        
        setBots(demoBots);
      } finally {
        setLoadingBots(false);
      }
    };

    fetchBots();
  }, [toast]);

  // Автоматически начинаем бой если передан preselectedBot
  useEffect(() => {
    if (preselectedBot && !inBattle) {
      handleArenaBotChallenge(preselectedBot);
    }
  }, [preselectedBot]);



  const battleStateHookProps = {
    player,
    onPlayerUpdate,
    onBattleStateChange,
    bots,
    toast,
  };

  console.log('Battle state hook props:', battleStateHookProps);

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
  } = useBattleState(battleStateHookProps);

  console.log('Battle state:', { inBattle, selectedBot, executeAttack: typeof executeAttack });

  // Функция для обработки вызова бота арены
  const handleArenaBotChallenge = (arenaBot: ArenaBot) => {
    console.log('Challenging arena bot:', arenaBot);
    
    // Конвертируем ArenaBot в Bot для совместимости с существующей системой боя
    const convertedBot: Bot = {
      id: arenaBot.id,
      name: arenaBot.name,
      level: arenaBot.level,
      health: arenaBot.health,
      maxHealth: arenaBot.maxHealth,
      attack: arenaBot.attack,
      defense: arenaBot.defense,
      experience: arenaBot.experience,
      gold: arenaBot.gold,
      image: arenaBot.image,
      image_url: arenaBot.image_url || null,
      difficulty: arenaBot.difficulty
    };

    setSelectedArenaBot(arenaBot);
    startBattle(convertedBot);
  };

  const getBotEquipment = (bot: any) => {
    const level = bot.level;
    return {
      weapon: level >= 2,
      armor: level >= 3,
      helmet: level >= 4,
      boots: level >= 1,
      gloves: level >= 3,
      shield: level >= 5,
      belt: level >= 2,
      necklace: level >= 6,
      ring1: level >= 7,
      ring2: level >= 8,
    };
  };

  const easyBots = bots.filter(bot => bot.difficulty === 'easy');
  const mediumBots = bots.filter(bot => bot.difficulty === 'medium');
  const hardBots = bots.filter(bot => bot.difficulty === 'hard');
  const eliteBots = bots.filter(bot => bot.difficulty === 'boss');

  if (!inBattle) {
    return (
      <div className="panel panel--tint panel--warm">
        <div className="bg-[#2a2a33] px-4 py-2 border-b medieval-border">
          <h3 className="text-white font-bold text-center">АРЕНА БОЕВ</h3>
        </div>
        
        <Tabs value={arenaTab} onValueChange={setArenaTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 medieval-bg-tertiary">
            <TabsTrigger
              value="pve"
              className="data-[state=active]:medieval-bg-secondary data-[state=active]:text-white"
            >
              PvE Арена
            </TabsTrigger>
            <TabsTrigger
              value="pvp"
              className="data-[state=active]:medieval-bg-secondary data-[state=active]:text-white"
            >
              PvP Дуэли
            </TabsTrigger>
            <TabsTrigger
              value="arena"
              className="data-[state=active]:medieval-bg-secondary data-[state=active]:text-white"
            >
              Новая арена
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pve" className="mt-4">
            <BotSelectionPanel
              easyBots={easyBots}
              mediumBots={mediumBots}
              hardBots={hardBots}
              eliteBots={eliteBots}
              player={player}
              startBattle={startBattle}
              loadingBots={loadingBots}
            />
          </TabsContent>
          
          <TabsContent value="pvp" className="mt-4">
            <PvPArena
              player={player}
              onPlayerUpdate={onPlayerUpdate}
            />
          </TabsContent>
          
          <TabsContent value="arena" className="mt-4">
            <SimpleArenaBotList
              player={player}
              onChallengeBot={handleArenaBotChallenge}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const botEquipment = getBotEquipment(selectedBot!);

  console.log('Rendering battle interface with:', { selectedBot, executeAttack: typeof executeAttack });

  return (
    <div className="medieval-bg-primary text-white">
      <BattleInterface
        player={player}
        playerStats={playerStats}
        selectedBot={selectedBot}
        currentBotHealth={currentBotHealth}
        botEquipment={botEquipment}
        playerAttackZone={playerAttackZone}
        playerDefenseZone={playerDefenseZone}
        setPlayerAttackZone={setPlayerAttackZone}
        setPlayerDefenseZone={setPlayerDefenseZone}
        executeAttack={executeAttack}
        isProcessing={isProcessing}
        battleLog={battleLog}
      />
    </div>
  );
};

export default NewBattleArena;
