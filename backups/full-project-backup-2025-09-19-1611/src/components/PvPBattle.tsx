import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Player, PvPBattle as PvPBattleType, BattleZone } from '@/types/game';
import { toast } from 'sonner';
import PlayerBattlePanel from './PlayerBattlePanel';
import BotBattlePanel from './BotBattlePanel';
import BattleControlPanel from './BattleControlPanel';
import VictoryAnimation from './VictoryAnimation';
import DefeatAnimation from './DefeatAnimation';

interface PvPBattleProps {
  player: Player;
  battle: PvPBattleType;
  onMakeMove: (attackZone: BattleZone, defenseZone: BattleZone) => void;
  onBattleEnd: () => void;
  onRefreshBattle?: () => void;
  onEndBattle?: () => void;
}

const PvPBattle: React.FC<PvPBattleProps> = ({
  player,
  battle,
  onMakeMove,
  onBattleEnd,
  onRefreshBattle,
  onEndBattle
}) => {
  const [selectedAttackZone, setSelectedAttackZone] = useState<BattleZone>('chest');
  const [selectedDefenseZone, setSelectedDefenseZone] = useState<BattleZone>('chest');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showDefeatAnimation, setShowDefeatAnimation] = useState(false);

  // Проверяем, что battle определен
  if (!battle) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Ошибка загрузки боя
          </h2>
          <p className="text-white">
            Данные боя не найдены. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    );
  }

  // Показываем анимацию победы или поражения при завершении боя
  useEffect(() => {
    const isPlayer1 = battle.player1.id === player.id;
    const currentPlayer = isPlayer1 ? battle.player1 : battle.player2;
    const opponent = isPlayer1 ? battle.player2 : battle.player1;
    
    // Проверяем, завершился ли бой по здоровью игроков
    const battleFinished = currentPlayer.currentHealth <= 0 || opponent.currentHealth <= 0;
    
    if (battle.status === 'finished' || battleFinished) {
      console.log('Battle finished - showing animation:', {
        battleStatus: battle.status,
        battleFinished,
        currentPlayerHealth: currentPlayer.currentHealth,
        opponentHealth: opponent.currentHealth,
        playerId: player.id,
        winner: battle.winner
      });
      
      if (battle.winner === player.id || opponent.currentHealth <= 0) {
        setShowVictoryAnimation(true);
        console.log('Showing victory animation');
      } else {
        setShowDefeatAnimation(true);
        console.log('Showing defeat animation');
      }
    }
  }, [battle.status, battle.winner, battle.player1.currentHealth, battle.player2.currentHealth, player.id]);

  const isPlayer1 = battle.player1.id === player.id;
  const isPlayer2 = battle.player2.id === player.id;
  const isMyTurn = (battle.currentTurn === 1 && isPlayer1) || (battle.currentTurn === 2 && isPlayer2);
  const opponent = isPlayer1 ? battle.player2 : battle.player1;
  const currentPlayer = isPlayer1 ? battle.player1 : battle.player2;

  // Функция для получения эмодзи класса
  const getClassEmoji = (className: string) => {
    const classEmojis = {
      warrior: '⚔️',
      mage: '🔮',
      archer: '🏹',
    };
    return classEmojis[className as keyof typeof classEmojis] || '👾';
  };

  // Преобразуем данные противника в формат, совместимый с BotBattlePanel
  const opponentBot = {
    id: opponent.id,
    name: opponent.name,
    level: opponent.level,
    class: opponent.class,
    health: opponent.currentHealth,
    maxHealth: opponent.maxHealth,
    mana: 50, // По умолчанию
    maxMana: 50,
    equipment: {}, // Пустое оборудование для противника
    image: getClassEmoji(opponent.class) // Добавляем изображение на основе класса
  };

  // Преобразуем данные игрока в формат, совместимый с PlayerBattlePanel
  // Используем актуальные данные из боя, а не локальные данные игрока
  const playerStats = {
    maxHealth: currentPlayer?.maxHealth || player.maxHealth || 100,
    maxMana: player.maxMana || 50, // Мана пока не отслеживается в бою
    health: currentPlayer?.currentHealth || player.health || 100,
    mana: player.mana || 50 // Мана пока не отслеживается в бою
  };

  // Логирование для отладки синхронизации здоровья
  console.log('PvPBattle - Player data sync:', {
    playerId: player.id,
    playerUsername: player.username,
    isPlayer1,
    currentPlayerHealth: currentPlayer.currentHealth,
    currentPlayerMaxHealth: currentPlayer.maxHealth,
    opponentHealth: opponent.currentHealth,
    opponentMaxHealth: opponent.maxHealth,
    battleRound: battle.round,
    battleStatus: battle.status,
    playerStats: {
      health: playerStats.health,
      maxHealth: playerStats.maxHealth,
      mana: playerStats.mana,
      maxMana: playerStats.maxMana
    },
    opponentBot: {
      health: opponentBot.health,
      maxHealth: opponentBot.maxHealth
    }
  });

  // Преобразуем лог боя в формат, совместимый с BattleLog
  const battleLogEntries = battle.battleLog.map((log, index) => ({
    id: index.toString(),
    text: log,
    type: 'normal' as const
  }));

  useEffect(() => {
    if (battle.status === 'waiting_for_moves' && isMyTurn && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isMyTurn) {
      // Автоматический ход при истечении времени
      handleMakeMove();
    }
  }, [timeLeft, isMyTurn, battle.status]);

  useEffect(() => {
    if (battle.status === 'waiting_for_moves' && isMyTurn) {
      setTimeLeft(30);
    }
  }, [battle.currentTurn, battle.status, isMyTurn]);

  const handleMakeMove = () => {
    if (!isMyTurn || isProcessing) return;
    
    setIsProcessing(true);
    onMakeMove(selectedAttackZone, selectedDefenseZone);
    
    // Сброс обработки через 2 секунды
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  if (battle.status === 'finished') {
    const isWinner = battle.winner === player.id;
    
    // Логирование для отладки определения победителя
    console.log('Battle finished - Winner determination:', {
      battleWinner: battle.winner,
      playerId: player.id,
      playerUsername: player.username,
      isWinner: isWinner,
      battleStatus: battle.status
    });
    
    return (
      <div className="space-y-4">
        {/* Анимация победы */}
        {isWinner && (
          <VictoryAnimation
            isVisible={showVictoryAnimation}
            onContinue={() => setShowVictoryAnimation(false)}
          />
        )}
        
        {/* Анимация поражения */}
        {!isWinner && (
          <DefeatAnimation
            isVisible={showDefeatAnimation}
            onContinue={() => setShowDefeatAnimation(false)}
          />
        )}
        
        {/* Обычный экран результата */}
        <div className="text-center">
          <h2 className={`text-4xl font-bold ${isWinner ? 'text-green-400' : 'text-red-400'} mb-4`}>
            {isWinner ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ'}
          </h2>
          <p className="text-white text-lg mb-4">
            {isWinner ? 'Вы одержали победу!' : 'Вы потерпели поражение!'}
          </p>
          {battle.rewards && (
            <div className="medieval-bg-secondary border-2 border-amber-600 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="text-amber-400 font-bold mb-2">Награды:</h4>
              <div className="space-y-1 text-sm">
                <p className="text-white">
                  Опыт: <span className="text-green-400">+{battle.rewards[isWinner ? 'winner' : 'loser'].experience}</span>
                </p>
                <p className="text-white">
                  Золото: <span className="text-yellow-400">+{battle.rewards[isWinner ? 'winner' : 'loser'].gold}</span>
                </p>
                <p className="text-white">
                  Рейтинг: <span className="text-blue-400">{isWinner ? '+' : ''}{battle.rewards[isWinner ? 'winner' : 'loser'].rating}</span>
                </p>
              </div>
            </div>
          )}
          <Button
            onClick={onBattleEnd}
            className="medieval-bg-primary hover:medieval-bg-primary/80 mt-4"
          >
            Вернуться в арену
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Заголовок боя */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4">
          <h2 className="text-2xl font-bold text-amber-400 medieval-title">
            PvP Сражение - Раунд {battle.round}
          </h2>
          {onRefreshBattle && (
            <Button
              onClick={onRefreshBattle}
              variant="outline"
              size="sm"
              className="medieval-bg-secondary"
            >
              🔄 Обновить
            </Button>
          )}
          {onEndBattle && (
            <Button
              onClick={onEndBattle}
              variant="destructive"
              size="sm"
              className="medieval-bg-red"
            >
              ⚔️ Завершить бой
            </Button>
          )}
        </div>
        {isMyTurn && timeLeft > 0 && (
          <div className="mt-2">
            <Badge className="bg-red-600 text-white">
              Ваш ход: {timeLeft}с
            </Badge>
          </div>
        )}
        {!isMyTurn && (
          <div className="mt-2">
            <Badge className="bg-blue-600 text-white">
              Ожидание хода противника
            </Badge>
          </div>
        )}
      </div>

      {/* Основной интерфейс боя */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Левая панель - Игрок */}
        <div className="lg:col-span-1">
          <PlayerBattlePanel 
            player={player} 
            playerStats={playerStats} 
          />
        </div>

        {/* Центральная панель - Управление боем */}
        <div className="lg:col-span-1">
          {isMyTurn ? (
            <BattleControlPanel
              playerAttackZone={selectedAttackZone}
              playerDefenseZone={selectedDefenseZone}
              setPlayerAttackZone={setSelectedAttackZone}
              setPlayerDefenseZone={setSelectedDefenseZone}
              executeAttack={handleMakeMove}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="panel panel--tint panel--warm h-full">
              <div className="p-4 h-full flex flex-col items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">
                    ⏳ Ожидание хода противника
                  </h3>
                  <p className="text-white">
                    Противник {opponent.name} делает ход...
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Дождитесь завершения хода противника
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Правая панель - Противник */}
        <div className="lg:col-span-1">
          <BotBattlePanel 
            selectedBot={opponentBot}
            currentBotHealth={opponent.currentHealth}
            botEquipment={{}}
          />
        </div>
      </div>

      {/* Лог боя */}
      <div className="lg:col-span-3">
        <div className="panel panel--tint panel--warm">
          <div className="p-4">
            <h3 className="font-ui text-lg font-bold tracking-wide mb-3 text-center"
                style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
              ХРОНИКА БИТВЫ
            </h3>
            <div className="h-32 overflow-y-auto space-y-1 game-scrollbar">
              {battleLogEntries.map((log, index) => {
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
    </div>
  );
};

export default PvPBattle;
