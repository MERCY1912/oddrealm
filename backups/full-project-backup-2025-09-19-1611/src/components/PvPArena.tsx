import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Player, PvPRequest, PvPBattle as PvPBattleType, PvPStatus, BattleZone } from '@/types/game';
import { toast } from 'sonner';
import PvPRequestForm from './PvPRequestForm';
import PvPRequestList from './PvPRequestList';
import PvPBattle from './PvPBattle';
import PvPTest from './PvPTest';
import { PvPService } from '@/services/pvpService';

interface PvPArenaProps {
  player: Player;
  onPlayerUpdate: (updatedPlayer: Player) => void;
}

const PvPArena: React.FC<PvPArenaProps> = ({ player, onPlayerUpdate }) => {
  const [pvpStatus, setPvpStatus] = useState<PvPStatus>('idle');
  const [currentRequest, setCurrentRequest] = useState<PvPRequest | null>(null);
  const [activeRequests, setActiveRequests] = useState<PvPRequest[]>([]);
  const [currentBattle, setCurrentBattle] = useState<PvPBattleType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useRealData, setUseRealData] = useState(false);

  // Загрузка активных заявок и подписка на изменения
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        if (useRealData) {
          const requests = await PvPService.getActiveRequests();
          setActiveRequests(requests);
        } else {
          // Моковые данные для демонстрации
          const mockRequests: PvPRequest[] = [
            {
              id: '1',
              challengerId: 'player2',
              challengerName: 'DarkKnight',
              challengerLevel: 15,
              challengerClass: 'warrior',
              waitTime: 5,
              createdAt: new Date(Date.now() - 60000),
              expiresAt: new Date(Date.now() + 240000),
              status: 'waiting'
            },
            {
              id: '2',
              challengerId: 'player3',
              challengerName: 'MageLord',
              challengerLevel: 12,
              challengerClass: 'mage',
              waitTime: 2,
              createdAt: new Date(Date.now() - 30000),
              expiresAt: new Date(Date.now() + 90000),
              status: 'waiting'
            },
            {
              id: '3',
              challengerId: 'player4',
              challengerName: 'ShadowRogue',
              challengerLevel: 18,
              challengerClass: 'rogue',
              waitTime: 10,
              createdAt: new Date(Date.now() - 120000),
              expiresAt: new Date(Date.now() + 480000),
              status: 'waiting'
            }
          ];
          setActiveRequests(mockRequests);
        }
      } catch (error) {
        console.error('Error loading PvP requests:', error);
        toast.error('Ошибка загрузки заявок');
      } finally {
        setIsLoading(false);
      }
    };

    // Загружаем заявки при монтировании
    loadRequests();

    // Подписываемся на изменения заявок только если используем реальные данные
    if (useRealData) {
      const subscription = PvPService.subscribeToRequests((requests) => {
        setActiveRequests(requests);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [useRealData]);

  // Проверяем активный бой при монтировании
  useEffect(() => {
    const checkActiveBattle = async () => {
      try {
        if (useRealData) {
          const battle = await PvPService.getActiveBattle(player.id);
          if (battle) {
            // Проверяем статус боя
            if (battle.status === 'finished') {
              // Если бой завершен, очищаем состояние
              setCurrentBattle(null);
              setCurrentRequest(null);
              setPvpStatus('idle');
              toast.info('Предыдущий бой завершен. Можете создать новую заявку.');
            } else {
              setCurrentBattle(battle);
              setPvpStatus('in_battle');
              setCurrentRequest(null); // Очищаем заявку, так как бой начался
            }
          }
        }
      } catch (error) {
        console.error('Error checking active battle:', error);
      }
    };

    checkActiveBattle();

    // Подписываемся на изменения боев только в реальном режиме
    if (useRealData) {
      const battleSubscription = PvPService.subscribeToBattles(player.id, (battle) => {
        console.log('Battle subscription update:', battle);
        if (battle) {
          setCurrentBattle(battle);
          setPvpStatus('in_battle');
          setCurrentRequest(null); // Очищаем заявку, так как бой начался
          toast.success('Бой начался!');
        } else {
          setCurrentBattle(null);
          setPvpStatus('idle');
        }
      });

      return () => {
        battleSubscription.unsubscribe();
      };
    }
  }, [player.id, useRealData]);

  // Периодическая проверка активного боя (fallback для real-time подписок)
  useEffect(() => {
    if (!useRealData || pvpStatus !== 'waiting_for_opponent') return;

    const interval = setInterval(async () => {
      try {
        const battle = await PvPService.getActiveBattle(player.id);
        if (battle) {
          console.log('Found active battle via polling:', battle);
          setCurrentBattle(battle);
          setPvpStatus('in_battle');
          setCurrentRequest(null);
          toast.success('Бой начался!');
        }
      } catch (error) {
        console.error('Error polling for active battle:', error);
      }
    }, 2000); // Проверяем каждые 2 секунды

    return () => clearInterval(interval);
  }, [useRealData, pvpStatus, player.id]);

  // Периодическая проверка обновлений боя
  useEffect(() => {
    if (!useRealData || pvpStatus !== 'in_battle' || !currentBattle) return;

    // Определяем интервал polling в зависимости от состояния боя
    const getPollingInterval = () => {
      // Если у кого-то из игроков мало здоровья, проверяем чаще
      const lowHealth = currentBattle.player1.currentHealth <= 20 || currentBattle.player2.currentHealth <= 20;
      return lowHealth ? 500 : 1000; // 500мс если мало здоровья, иначе 1с
    };

    const interval = setInterval(async () => {
      try {
        const battle = await PvPService.getActiveBattle(player.id);
        if (battle && battle.id === currentBattle.id) {
          // Проверяем, изменился ли бой - более детальная проверка
          const hasChanges =
            battle.round !== currentBattle.round ||
            battle.player1.currentHealth !== currentBattle.player1.currentHealth ||
            battle.player2.currentHealth !== currentBattle.player2.currentHealth ||
            battle.player1.maxHealth !== currentBattle.player1.maxHealth ||
            battle.player2.maxHealth !== currentBattle.player2.maxHealth ||
            battle.battleLog.length !== currentBattle.battleLog.length ||
            battle.currentTurn !== currentBattle.currentTurn ||
            battle.status !== currentBattle.status;

          if (hasChanges) {
            console.log('Battle updated via polling:', {
              old: {
                round: currentBattle.round,
                player1Health: currentBattle.player1.currentHealth,
                player2Health: currentBattle.player2.currentHealth,
                currentTurn: currentBattle.currentTurn,
                status: currentBattle.status
              },
              new: {
                round: battle.round,
                player1Health: battle.player1.currentHealth,
                player2Health: battle.player2.currentHealth,
                currentTurn: battle.currentTurn,
                status: battle.status
              }
            });
            setCurrentBattle(battle);

            // Показываем уведомление об обновлении
            if (battle.round !== currentBattle.round) {
              toast.info(`Раунд ${battle.round} начался!`);
            }
            
            // Если бой закончился
            const battleFinished = battle.status === 'finished' || 
                                 battle.player1.currentHealth <= 0 || 
                                 battle.player2.currentHealth <= 0;
            
            if (battleFinished) {
              setPvpStatus('battle_finished');
              // НЕ очищаем currentBattle, чтобы показать результат
              toast.success('Бой завершен!');
              console.log('Battle finished in polling:', {
                status: battle.status,
                player1Health: battle.player1.currentHealth,
                player2Health: battle.player2.currentHealth,
                winner: battle.winner
              });
            }
          }
        }
      } catch (error) {
        console.error('Error polling for battle updates:', error);
      }
    }, getPollingInterval());

    return () => clearInterval(interval);
  }, [useRealData, pvpStatus, currentBattle, player.id]);

  const createPvPRequest = async (waitTime: number) => {
    setIsLoading(true);
    
    try {
      if (useRealData) {
        // Проверяем, нет ли активного боя
        const activeBattle = await PvPService.getActiveBattle(player.id);
        if (activeBattle) {
          toast.error('У вас уже есть активный бой! Завершите его перед созданием новой заявки.');
          setIsLoading(false);
          return;
        }

        const newRequest = await PvPService.createRequest(
          player.id,
          player.username,
          player.level,
          player.class,
          waitTime
        );

        if (newRequest) {
          setCurrentRequest(newRequest);
          setPvpStatus('waiting_for_opponent');
          toast.success('Заявка на бой создана!');
        } else {
          toast.error('Ошибка при создании заявки');
        }
      } else {
        // Моковое создание заявки
        const newRequest: PvPRequest = {
          id: `request_${Date.now()}`,
          challengerId: player.id,
          challengerName: player.username,
          challengerLevel: player.level,
          challengerClass: player.class,
          waitTime,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + waitTime * 60000),
          status: 'waiting'
        };

        setCurrentRequest(newRequest);
        setPvpStatus('waiting_for_opponent');
        toast.success('Заявка на бой создана! (демо режим)');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Ошибка при создании заявки');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPvPRequest = async () => {
    if (!currentRequest) return;
    
    try {
      if (useRealData) {
        const success = await PvPService.cancelRequest(currentRequest.id);
        if (success) {
          setCurrentRequest(null);
          setPvpStatus('idle');
          toast.success('Заявка отменена');
        } else {
          toast.error('Ошибка при отмене заявки');
        }
      } else {
        setCurrentRequest(null);
        setPvpStatus('idle');
        toast.success('Заявка отменена');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Ошибка при отмене заявки');
    }
  };

  const checkForBattle = async () => {
    if (!useRealData) return;
    
    try {
      if (currentBattle) {
        // Если у нас уже есть бой, принудительно обновляем его
        const refreshedBattle = await PvPService.forceRefreshBattle(currentBattle.id);
        if (refreshedBattle) {
          setCurrentBattle(refreshedBattle);
          
          // Проверяем, завершился ли бой
          const battleFinished = refreshedBattle.status === 'finished' || 
                               refreshedBattle.player1.currentHealth <= 0 || 
                               refreshedBattle.player2.currentHealth <= 0;
          
          if (battleFinished) {
            setPvpStatus('battle_finished');
            // НЕ очищаем currentBattle, чтобы показать результат
            toast.success('Бой завершен!');
          } else {
            toast.success('Бой обновлен!');
          }
        } else {
          toast.error('Ошибка при обновлении боя');
        }
      } else {
        // Ищем новый активный бой
        const battle = await PvPService.getActiveBattle(player.id);
        if (battle) {
          setCurrentBattle(battle);
          
          // Проверяем, завершился ли бой
          const battleFinished = battle.status === 'finished' || 
                               battle.player1.currentHealth <= 0 || 
                               battle.player2.currentHealth <= 0;
          
          if (battleFinished) {
            setPvpStatus('battle_finished');
            // НЕ очищаем currentBattle, чтобы показать результат
            toast.success('Бой завершен!');
          } else {
            setPvpStatus('in_battle');
            setCurrentRequest(null);
            toast.success('Бой найден!');
          }
        } else {
          toast.info('Активный бой не найден');
        }
      }
    } catch (error) {
      console.error('Error checking for battle:', error);
      toast.error('Ошибка при проверке боя');
    }
  };

  const acceptPvPRequest = async (requestId: string) => {
    setIsLoading(true);
    
    try {
      const battle = await PvPService.acceptRequest(requestId, player.id);
      if (battle) {
        setCurrentBattle(battle);
        setPvpStatus('in_battle');
        toast.success('Бой начался!');
      } else {
        toast.error('Ошибка при принятии заявки');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Ошибка при принятии заявки');
    } finally {
      setIsLoading(false);
    }
  };

  const makeBattleMove = async (attackZone: BattleZone, defenseZone: BattleZone) => {
    if (!currentBattle) return;

    try {
      console.log('Making battle move:', { attackZone, defenseZone });
      
      const success = await PvPService.makeMove(
        currentBattle.id,
        player.id,
        attackZone,
        defenseZone
      );

      if (success) {
        toast.success('Ход выполнен! Ожидание хода противника...');
        
        // Обновляем локальное состояние для немедленного отклика
        const isPlayer1 = currentBattle.player1.id === player.id;
        const opponentKey = isPlayer1 ? 'player2' : 'player1';
        
        const updatedBattle = {
          ...currentBattle,
          currentTurn: isPlayer1 ? 2 : 1,
          battleLog: [
            ...currentBattle.battleLog,
            `Игрок ${player.username} выбрал атаку: ${attackZone}, защита: ${defenseZone}`,
            `Ожидание хода игрока ${currentBattle[opponentKey].name}...`
          ],
          updatedAt: new Date()
        };
        
        setCurrentBattle(updatedBattle);
        
                // Принудительно обновляем бой через 500мс, чтобы получить актуальные данные
                setTimeout(async () => {
                  try {
                    const freshBattle = await PvPService.getActiveBattle(player.id);
                    if (freshBattle && freshBattle.id === currentBattle.id) {
                      console.log('Refreshing battle after move (500ms):', freshBattle);
                      setCurrentBattle(freshBattle);
                      
                      // Проверяем, завершился ли бой
                      const battleFinished = freshBattle.status === 'finished' || 
                                           freshBattle.player1.currentHealth <= 0 || 
                                           freshBattle.player2.currentHealth <= 0;
                      
                      if (battleFinished) {
                        setPvpStatus('battle_finished');
                        // НЕ очищаем currentBattle, чтобы показать результат
                        toast.success('Бой завершен!');
                      }
                    }
                  } catch (error) {
                    console.error('Error refreshing battle after move:', error);
                  }
                }, 500);

                // Дополнительное обновление через 1.5 секунды для обработки раунда
                setTimeout(async () => {
                  try {
                    const freshBattle = await PvPService.getActiveBattle(player.id);
                    if (freshBattle && freshBattle.id === currentBattle.id) {
                      console.log('Second refresh after move (1.5s):', freshBattle);
                      setCurrentBattle(freshBattle);
                      
                      // Проверяем, завершился ли бой
                      const battleFinished = freshBattle.status === 'finished' || 
                                           freshBattle.player1.currentHealth <= 0 || 
                                           freshBattle.player2.currentHealth <= 0;
                      
                      if (battleFinished) {
                        setPvpStatus('battle_finished');
                        // НЕ очищаем currentBattle, чтобы показать результат
                        toast.success('Бой завершен!');
                      }
                    }
                  } catch (error) {
                    console.error('Error in second refresh after move:', error);
                  }
                }, 1500);

                // Третье обновление через 3 секунды для финальной синхронизации
                setTimeout(async () => {
                  try {
                    const freshBattle = await PvPService.getActiveBattle(player.id);
                    if (freshBattle && freshBattle.id === currentBattle.id) {
                      console.log('Third refresh after move (3s):', freshBattle);
                      setCurrentBattle(freshBattle);
                      
                      // Проверяем, завершился ли бой
                      const battleFinished = freshBattle.status === 'finished' || 
                                           freshBattle.player1.currentHealth <= 0 || 
                                           freshBattle.player2.currentHealth <= 0;
                      
                      if (battleFinished) {
                        setPvpStatus('battle_finished');
                        // НЕ очищаем currentBattle, чтобы показать результат
                        toast.success('Бой завершен!');
                      }
                    }
                  } catch (error) {
                    console.error('Error in third refresh after move:', error);
                  }
                }, 3000);
      } else {
        toast.error('Ошибка при выполнении хода');
      }
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Ошибка при выполнении хода');
    }
  };

  const processBattleRound = async (battle: PvPBattleType) => {
    // Упрощенная логика расчета урона
    const player1Move = battle.moves.player1!;
    const player2Move = battle.moves.player2!;
    
    // Базовый урон
    const baseDamage = 20;
    const levelBonus = 2;
    
    // Расчет урона для каждого игрока
    const player1Damage = Math.max(5, baseDamage + (battle.player1.level * levelBonus) + Math.random() * 10);
    const player2Damage = Math.max(5, baseDamage + (battle.player2.level * levelBonus) + Math.random() * 10);
    
    // Проверка защиты
    const player1Defended = player1Move.defenseZone === player2Move.attackZone;
    const player2Defended = player2Move.defenseZone === player1Move.attackZone;
    
    const finalPlayer1Damage = player1Defended ? player1Damage * 0.3 : player1Damage;
    const finalPlayer2Damage = player2Defended ? player2Damage * 0.3 : player2Damage;
    
    // Применение урона
    const newPlayer1Health = Math.max(0, battle.player1.currentHealth - finalPlayer2Damage);
    const newPlayer2Health = Math.max(0, battle.player2.currentHealth - finalPlayer1Damage);
    
    // Обновление боя
    const updatedBattle = {
      ...battle,
      player1: { ...battle.player1, currentHealth: newPlayer1Health },
      player2: { ...battle.player2, currentHealth: newPlayer2Health },
      round: battle.round + 1,
      currentTurn: 1,
      moves: {},
      battleLog: [
        ...battle.battleLog,
        `Раунд ${battle.round}:`,
        `${battle.player1.name} атакует ${player1Move.attackZone} (урон: ${Math.round(finalPlayer1Damage)})`,
        `${battle.player2.name} атакует ${player2Move.attackZone} (урон: ${Math.round(finalPlayer2Damage)})`,
        player1Defended ? `${battle.player1.name} заблокировал атаку!` : '',
        player2Defended ? `${battle.player2.name} заблокировал атаку!` : '',
        `Здоровье: ${battle.player1.name} ${newPlayer1Health}/${battle.player1.maxHealth}, ${battle.player2.name} ${newPlayer2Health}/${battle.player2.maxHealth}`
      ].filter(Boolean),
      updatedAt: new Date()
    };
    
    // Проверка окончания боя
    if (newPlayer1Health <= 0 || newPlayer2Health <= 0) {
      const winner = newPlayer1Health <= 0 ? battle.player2 : battle.player1;
      const loser = newPlayer1Health <= 0 ? battle.player1 : battle.player2;
      
      updatedBattle.status = 'finished';
      updatedBattle.winner = winner.id;
      updatedBattle.rewards = {
        winner: { experience: 50, gold: 100, rating: 25 },
        loser: { experience: 20, gold: 25, rating: -15 }
      };
      
      updatedBattle.battleLog.push(`🎉 ${winner.name} побеждает!`);
      
      // Обновление игрока
      if (winner.id === player.id) {
        const updatedPlayer = {
          ...player,
          health: Math.min(player.maxHealth, player.health + 20), // Восстановление после победы
          experience: player.experience + 50,
          gold: player.gold + 100
        };
        onPlayerUpdate(updatedPlayer);
      }
      
      setPvpStatus('battle_finished');
    } else {
      updatedBattle.battleLog.push(`Раунд ${battle.round + 1}: Ход игрока ${battle.player1.name}`);
    }
    
    setCurrentBattle(updatedBattle);
  };

  const endBattle = async () => {
    if (currentBattle && useRealData) {
      // Завершаем бой в базе данных
      await PvPService.endBattle(currentBattle.id);
    }
    
    setCurrentBattle(null);
    setCurrentRequest(null);
    setPvpStatus('idle');
    toast.info('Бой завершен. Можете создать новую заявку.');
  };

  if ((pvpStatus === 'in_battle' || pvpStatus === 'battle_finished') && currentBattle) {
    return (
      <PvPBattle
        player={player}
        battle={currentBattle}
        onMakeMove={makeBattleMove}
        onBattleEnd={endBattle}
        onRefreshBattle={checkForBattle}
        onEndBattle={endBattle}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Переключатель режима */}
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded border">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useRealData"
            checked={useRealData}
            onChange={(e) => setUseRealData(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="useRealData" className="text-sm">
            Использовать реальную базу данных
          </label>
        </div>
        <div className="text-xs text-gray-400">
          {useRealData ? 'Реальный режим' : 'Демо режим'}
        </div>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3 medieval-bg-tertiary">
          <TabsTrigger
            value="create"
            className="data-[state=active]:medieval-bg-secondary data-[state=active]:text-white"
          >
            Создать заявку
          </TabsTrigger>
          <TabsTrigger
            value="accept"
            className="data-[state=active]:medieval-bg-secondary data-[state=active]:text-white"
          >
            Принять вызов
          </TabsTrigger>
          <TabsTrigger
            value="test"
            className="data-[state=active]:medieval-bg-secondary data-[state=active]:text-white"
          >
            Тест БД
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-4">
          <PvPRequestForm
            player={player}
            onCreateRequest={createPvPRequest}
            onCancelRequest={cancelPvPRequest}
            currentRequest={currentRequest}
            isCreating={isLoading}
            onCheckBattle={checkForBattle}
          />
        </TabsContent>
        
        <TabsContent value="accept" className="mt-4">
          <PvPRequestList
            player={player}
            requests={activeRequests}
            onAcceptRequest={acceptPvPRequest}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="test" className="mt-4">
          <PvPTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PvPArena;
