import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatPlayerName } from '@/utils/playerUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnlinePlayers } from '@/hooks/useOnlinePlayers';
import { OnlinePlayer } from '@/services/simpleOnlineService';
import { RefreshCw, Users, UserCheck, UserX } from 'lucide-react';

const OnlinePlayersList = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { 
    onlinePlayers, 
    loading, 
    error, 
    refreshPlayers, 
    onlineCount, 
    afkCount, 
    inBattleCount,
    inDungeonCount,
    totalCount 
  } = useOnlinePlayers(true);

  const handleRefresh = async () => {
    await refreshPlayers();
    toast({
      title: "Список обновлен",
      description: `Найдено ${totalCount} игроков (${onlineCount} онлайн, ${afkCount} AFK, ${inBattleCount} в бою, ${inDungeonCount} в подземельях)`,
    });
  };

  const getClassIcon = (className: string) => {
    switch (className) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'archer': return '🏹';
      default: return '❓';
    }
  };

  const getClassColor = (className: string) => {
    switch (className) {
      case 'warrior': return 'text-red-400';
      case 'mage': return 'text-blue-400';
      case 'archer': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: OnlinePlayer['status']) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'afk': return 'bg-yellow-400';
      case 'in_battle': return 'bg-red-400';
      case 'in_dungeon': return 'bg-purple-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: OnlinePlayer['status']) => {
    switch (status) {
      case 'online': return <UserCheck className="w-3 h-3" />;
      case 'afk': return <UserX className="w-3 h-3" />;
      case 'in_battle': return <span className="text-xs">⚔️</span>;
      case 'in_dungeon': return <span className="text-xs">🏰</span>;
      default: return <span className="text-xs">❓</span>;
    }
  };

  return (
    <div className="h-full flex flex-col online-list-area">
      {/* Заголовок с кнопкой обновления */}
      <div className={`flex items-center justify-between ${isMobile ? 'px-1 py-0.5' : 'px-2 py-1'} border-b border-gray-600`}>
        <div className="flex items-center gap-1">
          <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-300`} />
          <span className={`font-bold text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? `${totalCount}` : `Онлайн (${totalCount})`}
          </span>
          {!isMobile && totalCount > 0 && (
            <div className="flex gap-1 text-xs text-gray-400">
              <span className="text-green-400">{onlineCount}</span>
              {afkCount > 0 && <span className="text-yellow-400">{afkCount}</span>}
              {inBattleCount > 0 && <span className="text-red-400">{inBattleCount}</span>}
              {inDungeonCount > 0 && <span className="text-purple-400">{inDungeonCount}</span>}
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 hover:text-white transition-colors disabled:opacity-50`}
          title="Обновить список"
        >
          <RefreshCw className={`w-full h-full ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ScrollArea className={`flex-grow game-scrollbar ${isMobile ? 'px-0.5 py-0.5' : 'p-1'}`}>
        <div className={`${isMobile ? 'space-y-0.5' : 'space-y-1'}`}>
          {loading && onlinePlayers.length === 0 ? (
            <div className={`text-center text-gray-400 ${isMobile ? 'text-xs py-1 px-1' : 'text-sm p-1'}`}>
              Загрузка...
            </div>
          ) : error ? (
            <div className={`text-center text-red-400 ${isMobile ? 'text-xs py-1 px-1' : 'text-sm p-1'}`}>
              {isMobile ? 'Ошибка' : 'Ошибка загрузки'}
            </div>
          ) : onlinePlayers.length > 0 ? (
            onlinePlayers.map((player) => (
              <div key={player.id} className={`medieval-bg-tertiary rounded hover:medieval-bg-secondary transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,.3)] ${isMobile ? 'px-0.5 py-0.5' : 'p-1'}`}
                   style={{
                     background: 'linear-gradient(145deg, hsl(var(--medieval-bg-tertiary)), hsl(var(--medieval-bg-secondary)))'
                   }}>
                <div className="flex items-center gap-1">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{getClassIcon(player.character_class)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate ${getClassColor(player.character_class)} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {isMobile ? player.username : formatPlayerName(player.username, player.level)}
                    </div>
                    {!isMobile && (
                      <div className="text-xs text-gray-400 truncate">
                        {player.status === 'afk' ? 'AFK' : player.location}
                      </div>
                    )}
                  </div>
                  <div className={`${getStatusColor(player.status)} rounded-full ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} flex items-center justify-center`}>
                    {!isMobile && getStatusIcon(player.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center text-gray-400 ${isMobile ? 'text-xs py-1 px-1' : 'text-sm p-1'}`}>
              {isMobile ? 'Нет игроков' : 'Нет игроков онлайн'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OnlinePlayersList;
