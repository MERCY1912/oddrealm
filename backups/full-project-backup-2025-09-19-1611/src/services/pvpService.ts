import { supabase } from '@/integrations/supabase/client';
import { PvPRequest, PvPBattle, PvPMove } from '@/types/game';

export class PvPService {
  // Получение всех активных заявок
  static async getActiveRequests(): Promise<PvPRequest[]> {
    try {
      console.log('Fetching active PvP requests...');
      
      const { data, error } = await supabase
        .from('pvp_requests')
        .select('*')
        .eq('status', 'waiting')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching PvP requests:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return [];
      }

      console.log('Raw data from database:', data);
      
      const mappedRequests = data?.map(request => ({
        id: request.id,
        challengerId: request.challenger_id,
        challengerName: request.challenger_name,
        challengerLevel: request.challenger_level,
        challengerClass: request.challenger_class,
        waitTime: request.wait_time,
        createdAt: new Date(request.created_at),
        expiresAt: new Date(request.expires_at),
        status: request.status,
        acceptedBy: request.accepted_by
      })) || [];

      console.log('Mapped requests:', mappedRequests);
      return mappedRequests;
    } catch (error) {
      console.error('Error in getActiveRequests:', error);
      return [];
    }
  }

  // Создание новой заявки
  static async createRequest(
    challengerId: string,
    challengerName: string,
    challengerLevel: number,
    challengerClass: string,
    waitTime: number
  ): Promise<PvPRequest | null> {
    try {
      console.log('Creating PvP request with data:', {
        challengerId,
        challengerName,
        challengerLevel,
        challengerClass,
        waitTime
      });
      
      const expiresAt = new Date(Date.now() + waitTime * 60000);
      
      const { data, error } = await supabase
        .from('pvp_requests')
        .insert({
          challenger_id: challengerId,
          challenger_name: challengerName,
          challenger_level: challengerLevel,
          challenger_class: challengerClass,
          wait_time: waitTime,
          expires_at: expiresAt.toISOString(),
          status: 'waiting'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating PvP request:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('Successfully created PvP request:', data);

      return {
        id: data.id,
        challengerId: data.challenger_id,
        challengerName: data.challenger_name,
        challengerLevel: data.challenger_level,
        challengerClass: data.challenger_class,
        waitTime: data.wait_time,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        status: data.status,
        acceptedBy: data.accepted_by
      };
    } catch (error) {
      console.error('Error in createRequest:', error);
      return null;
    }
  }

  // Отмена заявки
  static async cancelRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pvp_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) {
        console.error('Error cancelling PvP request:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelRequest:', error);
      return false;
    }
  }

  // Принятие заявки
  static async acceptRequest(requestId: string, accepterId: string): Promise<PvPBattle | null> {
    try {
      // Сначала получаем заявку
      const { data: request, error: requestError } = await supabase
        .from('pvp_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'waiting')
        .single();

      if (requestError || !request) {
        console.error('Error fetching request:', requestError);
        return null;
      }

      // Обновляем статус заявки
      const { error: updateError } = await supabase
        .from('pvp_requests')
        .update({ 
          status: 'accepted',
          accepted_by: accepterId
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request:', updateError);
        return null;
      }

      // Получаем данные игрока, который принимает заявку
      const { data: accepterData, error: accepterError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', accepterId)
        .single();

      if (accepterError || !accepterData) {
        console.error('Error fetching accepter data:', accepterError);
        return null;
      }

      // Получаем данные игрока, который создал заявку
      const { data: challengerData, error: challengerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.challenger_id)
        .single();

      if (challengerError || !challengerData) {
        console.error('Error fetching challenger data:', challengerError);
        return null;
      }

      // Логирование данных игроков для отладки
      console.log('Creating battle with player data:', {
        challenger: {
          id: request.challenger_id,
          name: request.challenger_name,
          health: challengerData.health,
          maxHealth: challengerData.max_health
        },
        accepter: {
          id: accepterId,
          name: accepterData.username,
          health: accepterData.health,
          maxHealth: accepterData.max_health
        }
      });

      // Создаем бой
      const { data: battleData, error: battleError } = await supabase
        .from('pvp_battles')
        .insert({
          player1_id: request.challenger_id,
          player1_name: request.challenger_name,
          player1_level: request.challenger_level,
          player1_class: request.challenger_class,
          player1_current_health: challengerData.health, // Используем актуальное здоровье
          player1_max_health: challengerData.max_health, // Используем актуальное максимальное здоровье
          player1_stats: {},
          player2_id: accepterId,
          player2_name: accepterData.username,
          player2_level: accepterData.level,
          player2_class: accepterData.character_class,
          player2_current_health: accepterData.health,
          player2_max_health: accepterData.max_health,
          player2_stats: {},
          current_turn: 1,
          round: 1,
          status: 'waiting_for_moves',
          battle_log: [`Бой начался между ${request.challenger_name} и ${accepterData.username}!`]
        })
        .select()
        .single();

      if (battleError) {
        console.error('Error creating battle:', battleError);
        return null;
      }

      return {
        id: battleData.id,
        player1: {
          id: battleData.player1_id,
          name: battleData.player1_name,
          level: battleData.player1_level,
          class: battleData.player1_class,
          currentHealth: battleData.player1_current_health,
          maxHealth: battleData.player1_max_health,
          stats: battleData.player1_stats
        },
        player2: {
          id: battleData.player2_id,
          name: battleData.player2_name,
          level: battleData.player2_level,
          class: battleData.player2_class,
          currentHealth: battleData.player2_current_health,
          maxHealth: battleData.player2_max_health,
          stats: battleData.player2_stats
        },
        currentTurn: battleData.current_turn,
        round: battleData.round,
        status: battleData.status,
        moves: {},
        battleLog: battleData.battle_log,
        createdAt: new Date(battleData.created_at),
        updatedAt: new Date(battleData.updated_at)
      };
    } catch (error) {
      console.error('Error in acceptRequest:', error);
      return null;
    }
  }

  // Получение ходов текущего раунда
  static async getCurrentRoundMoves(battleId: string, round: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('pvp_moves')
        .select('*')
        .eq('battle_id', battleId)
        .eq('round', round)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching current round moves:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCurrentRoundMoves:', error);
      return [];
    }
  }

  // Получение активного боя для игрока
  static async getActiveBattle(playerId: string): Promise<PvPBattle | null> {
    try {
      console.log('Checking for active battle for player:', playerId);
      
      const { data, error } = await supabase
        .from('pvp_battles')
        .select('*')
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .in('status', ['waiting_for_moves', 'processing'])
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching active battle:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No active battle found for player:', playerId);
        return null;
      }

      const battleData = data[0];
      console.log('Found active battle:', battleData);

      // Загружаем ходы текущего раунда
      const currentMoves = await this.getCurrentRoundMoves(battleData.id, battleData.round);
      console.log('Current round moves:', currentMoves);

      // Формируем объект moves для совместимости
      const moves: any = {};
      currentMoves.forEach(move => {
        if (move.player_id === battleData.player1_id) {
          moves.player1 = {
            playerId: move.player_id,
            attackZone: move.attack_zone,
            defenseZone: move.defense_zone,
            timestamp: new Date(move.created_at)
          };
        } else if (move.player_id === battleData.player2_id) {
          moves.player2 = {
            playerId: move.player_id,
            attackZone: move.attack_zone,
            defenseZone: move.defense_zone,
            timestamp: new Date(move.created_at)
          };
        }
      });

      return {
        id: battleData.id,
        player1: {
          id: battleData.player1_id,
          name: battleData.player1_name,
          level: battleData.player1_level,
          class: battleData.player1_class,
          currentHealth: battleData.player1_current_health,
          maxHealth: battleData.player1_max_health,
          stats: battleData.player1_stats
        },
        player2: {
          id: battleData.player2_id,
          name: battleData.player2_name,
          level: battleData.player2_level,
          class: battleData.player2_class,
          currentHealth: battleData.player2_current_health,
          maxHealth: battleData.player2_max_health,
          stats: battleData.player2_stats
        },
        currentTurn: battleData.current_turn,
        round: battleData.round,
        status: battleData.status,
        winner: battleData.winner,
        rewards: battleData.rewards,
        moves: moves,
        battleLog: battleData.battle_log,
        createdAt: new Date(battleData.created_at),
        updatedAt: new Date(battleData.updated_at)
      };
    } catch (error) {
      console.error('Error in getActiveBattle:', error);
      return null;
    }
  }

  // Проверка, может ли игрок сделать ход в текущем раунде
  static async canPlayerMakeMove(battleId: string, playerId: string, round: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('pvp_moves')
        .select('id')
        .eq('battle_id', battleId)
        .eq('player_id', playerId)
        .eq('round', round)
        .limit(1);

      if (error) {
        console.error('Error checking if player can make move:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error in canPlayerMakeMove:', error);
      return false;
    }
  }

  // Выполнение хода
  static async makeMove(
    battleId: string,
    playerId: string,
    attackZone: string,
    defenseZone: string
  ): Promise<boolean> {
    try {
      console.log('Making move:', { battleId, playerId, attackZone, defenseZone });
      
      // Получаем текущий бой
      const { data: battle, error: battleError } = await supabase
        .from('pvp_battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (battleError || !battle) {
        console.error('Error fetching battle:', battleError);
        return false;
      }

      // Проверяем, может ли игрок сделать ход в этом раунде
      const canMakeMove = await this.canPlayerMakeMove(battleId, playerId, battle.round);
      if (!canMakeMove) {
        console.log('Player already made move in this round');
        return false;
      }

      // Создаем запись о ходе
      const { error: moveError } = await supabase
        .from('pvp_moves')
        .insert({
          battle_id: battleId,
          player_id: playerId,
          attack_zone: attackZone,
          defense_zone: defenseZone,
          round: battle.round
        });

      if (moveError) {
        console.error('Error creating move:', moveError);
        return false;
      }

      // Проверяем, сделали ли оба игрока ходы в этом раунде
      const { data: moves, error: movesError } = await supabase
        .from('pvp_moves')
        .select('*')
        .eq('battle_id', battleId)
        .eq('round', battle.round);

      if (movesError) {
        console.error('Error fetching moves:', movesError);
        return false;
      }

      console.log('Current moves in round:', moves);

      // Проверяем, есть ли ходы от обоих игроков
      const player1Move = moves?.find(m => m.player_id === battle.player1_id);
      const player2Move = moves?.find(m => m.player_id === battle.player2_id);

      console.log('Player 1 move:', player1Move);
      console.log('Player 2 move:', player2Move);

      // Если оба игрока сделали ходы, обрабатываем раунд
      if (player1Move && player2Move) {
        console.log('Both players made moves, processing round...');
        await this.processBattleRound(battleId, battle, moves);
      } else {
        // Обновляем текущий ход
        const nextTurn = battle.current_turn === 1 ? 2 : 1;
        console.log('Only one player made move, switching turn to:', nextTurn);
        
        const { error: updateError } = await supabase
          .from('pvp_battles')
          .update({ 
            current_turn: nextTurn,
            updated_at: new Date().toISOString()
          })
          .eq('id', battleId);

        if (updateError) {
          console.error('Error updating turn:', updateError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in makeMove:', error);
      return false;
    }
  }

  // Обработка раунда боя
  static async processBattleRound(battleId: string, battle: any, moves: any[]): Promise<void> {
    try {
      console.log('Processing battle round:', { battleId, battle, moves });
      
      const player1Move = moves.find(m => m.player_id === battle.player1_id);
      const player2Move = moves.find(m => m.player_id === battle.player2_id);

      if (!player1Move || !player2Move) {
        console.error('Missing moves for round processing');
        return;
      }

      // Упрощенный расчет урона
      const player1Damage = Math.floor(Math.random() * 20) + 10; // 10-30 урона
      const player2Damage = Math.floor(Math.random() * 20) + 10;

      // Проверка блокировки
      const player1Defended = player1Move.defense_zone === player2Move.attack_zone;
      const player2Defended = player2Move.defense_zone === player1Move.attack_zone;

      const finalPlayer1Damage = player1Defended ? Math.floor(player1Damage * 0.3) : player1Damage;
      const finalPlayer2Damage = player2Defended ? Math.floor(player2Damage * 0.3) : player2Damage;

      console.log('Damage calculation:', {
        player1Damage,
        player2Damage,
        player1Defended,
        player2Defended,
        finalPlayer1Damage,
        finalPlayer2Damage,
        currentHealth: {
          player1: battle.player1_current_health,
          player2: battle.player2_current_health
        }
      });

      // Применение урона
      const newPlayer1Health = Math.max(0, battle.player1_current_health - finalPlayer2Damage);
      const newPlayer2Health = Math.max(0, battle.player2_current_health - finalPlayer1Damage);

      console.log('Health after damage:', {
        newPlayer1Health,
        newPlayer2Health
      });

      // Обновление лога боя
      const newBattleLog = [
        ...battle.battle_log,
        `Раунд ${battle.round}:`,
        `${battle.player1_name} атакует ${player1Move.attack_zone} (урон: ${finalPlayer1Damage})`,
        `${battle.player2_name} атакует ${player2Move.attack_zone} (урон: ${finalPlayer2Damage})`,
        player1Defended ? `${battle.player1_name} заблокировал атаку!` : '',
        player2Defended ? `${battle.player2_name} заблокировал атаку!` : '',
        `Здоровье: ${battle.player1_name} ${newPlayer1Health}/${battle.player1_max_health}, ${battle.player2_name} ${newPlayer2Health}/${battle.player2_max_health}`
      ].filter(Boolean);

      // Проверка окончания боя
      let newStatus = 'waiting_for_moves';
      let winner = null;
      let rewards = null;

      if (newPlayer1Health <= 0 || newPlayer2Health <= 0) {
        newStatus = 'finished';
        winner = newPlayer1Health <= 0 ? battle.player2_id : battle.player1_id;
        rewards = {
          winner: { experience: 50, gold: 100, rating: 25 },
          loser: { experience: 20, gold: 25, rating: -15 }
        };
        newBattleLog.push(`🎉 ${winner === battle.player1_id ? battle.player1_name : battle.player2_name} побеждает!`);
        
        // Детальное логирование определения победителя
        console.log('Battle finished - Winner determination:', {
          player1Health: newPlayer1Health,
          player2Health: newPlayer2Health,
          player1Id: battle.player1_id,
          player2Id: battle.player2_id,
          player1Name: battle.player1_name,
          player2Name: battle.player2_name,
          winner: winner,
          winnerName: winner === battle.player1_id ? battle.player1_name : battle.player2_name
        });
        
        // Обновляем здоровье игроков в их профилях при завершении боя
        const { error: player1HealthError } = await supabase
          .from('profiles')
          .update({ 
            health: newPlayer1Health,
            updated_at: new Date().toISOString()
          })
          .eq('id', battle.player1_id);

        if (player1HealthError) {
          console.error('Error updating player1 health after battle:', player1HealthError);
        }

        const { error: player2HealthError } = await supabase
          .from('profiles')
          .update({ 
            health: newPlayer2Health,
            updated_at: new Date().toISOString()
          })
          .eq('id', battle.player2_id);

        if (player2HealthError) {
          console.error('Error updating player2 health after battle:', player2HealthError);
        }
      }

      // Обновление боя
      const updateData = {
        player1_current_health: newPlayer1Health,
        player2_current_health: newPlayer2Health,
        round: battle.round + 1,
        current_turn: 1,
        status: newStatus,
        winner: winner,
        rewards: rewards,
        battle_log: newBattleLog,
        updated_at: new Date().toISOString()
      };

      console.log('Updating battle with data:', {
        ...updateData,
        winnerDetails: {
          winner: winner,
          winnerName: winner === battle.player1_id ? battle.player1_name : battle.player2_name,
          battleId: battleId
        }
      });

      const { error: updateError } = await supabase
        .from('pvp_battles')
        .update(updateData)
        .eq('id', battleId);

      if (updateError) {
        console.error('Error updating battle:', updateError);
      } else {
        console.log('Battle round processed successfully');
      }
    } catch (error) {
      console.error('Error processing battle round:', error);
    }
  }

  // Завершение боя и обновление здоровья игроков
  static async endBattle(battleId: string): Promise<boolean> {
    try {
      console.log('Ending battle:', battleId);
      
      // Получаем данные боя
      const { data: battle, error: battleError } = await supabase
        .from('pvp_battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (battleError || !battle) {
        console.error('Error fetching battle for end:', battleError);
        return false;
      }

      // Обновляем здоровье игроков в их профилях
      const { error: player1UpdateError } = await supabase
        .from('profiles')
        .update({ 
          health: battle.player1_current_health,
          updated_at: new Date().toISOString()
        })
        .eq('id', battle.player1_id);

      if (player1UpdateError) {
        console.error('Error updating player1 health:', player1UpdateError);
      }

      const { error: player2UpdateError } = await supabase
        .from('profiles')
        .update({ 
          health: battle.player2_current_health,
          updated_at: new Date().toISOString()
        })
        .eq('id', battle.player2_id);

      if (player2UpdateError) {
        console.error('Error updating player2 health:', player2UpdateError);
      }

      // Обновляем статус боя на 'finished' если он еще не завершен
      const { error: updateError } = await supabase
        .from('pvp_battles')
        .update({ 
          status: 'finished',
          updated_at: new Date().toISOString()
        })
        .eq('id', battleId)
        .neq('status', 'finished'); // Обновляем только если статус не 'finished'

      if (updateError) {
        console.error('Error ending battle:', updateError);
        return false;
      }

      console.log('Battle ended successfully, player health updated');
      return true;
    } catch (error) {
      console.error('Error in endBattle:', error);
      return false;
    }
  }

  // Принудительное обновление боя
  static async forceRefreshBattle(battleId: string): Promise<PvPBattle | null> {
    try {
      console.log('Force refreshing battle:', battleId);
      
      const { data, error } = await supabase
        .from('pvp_battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (error || !data) {
        console.error('Error force refreshing battle:', error);
        return null;
      }

      // Загружаем ходы текущего раунда
      const currentMoves = await this.getCurrentRoundMoves(data.id, data.round);

      // Формируем объект moves для совместимости
      const moves: any = {};
      currentMoves.forEach(move => {
        if (move.player_id === data.player1_id) {
          moves.player1 = {
            playerId: move.player_id,
            attackZone: move.attack_zone,
            defenseZone: move.defense_zone,
            timestamp: new Date(move.created_at)
          };
        } else if (move.player_id === data.player2_id) {
          moves.player2 = {
            playerId: move.player_id,
            attackZone: move.attack_zone,
            defenseZone: move.defense_zone,
            timestamp: new Date(move.created_at)
          };
        }
      });

      return {
        id: data.id,
        player1: {
          id: data.player1_id,
          name: data.player1_name,
          level: data.player1_level,
          class: data.player1_class,
          currentHealth: data.player1_current_health,
          maxHealth: data.player1_max_health,
          stats: data.player1_stats
        },
        player2: {
          id: data.player2_id,
          name: data.player2_name,
          level: data.player2_level,
          class: data.player2_class,
          currentHealth: data.player2_current_health,
          maxHealth: data.player2_max_health,
          stats: data.player2_stats
        },
        currentTurn: data.current_turn,
        round: data.round,
        status: data.status,
        winner: data.winner,
        rewards: data.rewards,
        moves: moves,
        battleLog: data.battle_log,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error in forceRefreshBattle:', error);
      return null;
    }
  }

  // Подписка на изменения заявок (для real-time обновлений)
  static subscribeToRequests(callback: (requests: PvPRequest[]) => void) {
    return supabase
      .channel('pvp_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pvp_requests' 
        }, 
        async () => {
          const requests = await this.getActiveRequests();
          callback(requests);
        }
      )
      .subscribe();
  }

  // Подписка на изменения боев
  static subscribeToBattles(playerId: string, callback: (battle: PvPBattle | null) => void) {
    return supabase
      .channel('pvp_battles')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pvp_battles',
          filter: `or(player1_id.eq.${playerId},player2_id.eq.${playerId})`
        }, 
        async () => {
          const battle = await this.getActiveBattle(playerId);
          callback(battle);
        }
      )
      .subscribe();
  }
}
