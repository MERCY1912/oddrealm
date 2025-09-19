import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatPlayerName } from '@/utils/playerUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFastOnlinePlayers } from '@/hooks/useFastOnlinePlayers';
import { useBotSystem } from '@/hooks/useBotSystem';
import { OnlinePlayer } from '@/services/fastOnlineService';
import { RefreshCw, Users, UserCheck, UserX, Bot } from 'lucide-react';

const OnlinePlayersListWithBots = () => {
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
  } = useFastOnlinePlayers(true);

  const { bots, isInitialized } = useBotSystem();

  // Объединяем реальных игроков и ботов
  const allPlayers = React.useMemo(() => {
    const botPlayers: OnlinePlayer[] = bots.map(bot => ({
      id: bot.id, // Используем ID бота напрямую
      username: bot.username,
      level: bot.level,
      character_class: bot.character_class,
      last_seen: bot.last_activity,
      status: bot.status,
      location: bot.location,
      isBot: true // Добавляем флаг для ботов
    }));

    return [...onlinePlayers, ...botPlayers];
  }, [onlinePlayers, bots]);

  // Пересчитываем статистику с ботами
  const totalWithBots = allPlayers.length;
  const onlineWithBots = allPlayers.filter(p => p.status === 'online').length;
  const afkWithBots = allPlayers.filter(p => p.status === 'afk').length;
  const inBattleWithBots = allPlayers.filter(p => p.status === 'in_battle').length;
  const inDungeonWithBots = allPlayers.filter(p => p.status === 'in_dungeon').length;
  const botCount = bots.length;

  const handleRefresh = async () => {
    await refreshPlayers();
    toast({
      title: "Список обновлен",
      description: `Найдено ${totalWithBots} игроков (${botCount} ботов)`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'afk': return <UserX className="h-4 w-4 text-yellow-500" />;
      case 'in_battle': return <Users className="h-4 w-4 text-red-500" />;
      case 'in_dungeon': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <UserX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Онлайн';
      case 'afk': return 'Отошел';
      case 'in_battle': return 'В бою';
      case 'in_dungeon': return 'В подземелье';
      default: return 'Неизвестно';
    }
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'archer': return '🏹';
      default: return '❓';
    }
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins}м`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}ч`;
    
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Ошибка загрузки списка игроков: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
        <div className="bg-background border rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">Всего</span>
          </div>
          <div className="text-lg font-bold text-blue-600">{totalWithBots}</div>
          {botCount > 0 && (
            <div className="text-xs text-muted-foreground">
              ({botCount} ботов)
            </div>
          )}
        </div>
        
        <div className="bg-background border rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserCheck className="h-4 w-4 text-green-500" />
            <span className="font-semibold">Онлайн</span>
          </div>
          <div className="text-lg font-bold text-green-600">{onlineWithBots}</div>
        </div>
        
        <div className="bg-background border rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserX className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">Отошел</span>
          </div>
          <div className="text-lg font-bold text-yellow-600">{afkWithBots}</div>
        </div>
        
        <div className="bg-background border rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-4 w-4 text-red-500" />
            <span className="font-semibold">В бою</span>
          </div>
          <div className="text-lg font-bold text-red-600">{inBattleWithBots}</div>
        </div>
        
        <div className="bg-background border rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">Подземелье</span>
          </div>
          <div className="text-lg font-bold text-purple-600">{inDungeonWithBots}</div>
        </div>
      </div>

      {/* Кнопка обновления */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Игроки онлайн</h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Список игроков */}
      <ScrollArea className="h-64 md:h-96">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка списка игроков...
          </div>
        ) : allPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет игроков онлайн
          </div>
        ) : (
          <div className="space-y-2">
            {allPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getClassIcon(player.character_class)}</span>
                    {(player as any).isBot && (
                      <Bot className="h-4 w-4 text-blue-500" title="Бот" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatPlayerName(player.username)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Ур. {player.level}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {player.character_class}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(player.status)}
                    <span className="text-sm font-medium">
                      {getStatusText(player.status)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {player.location}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatLastSeen(player.last_seen)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Информация о ботах */}
      {isInitialized && botCount > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          💡 В списке отображаются как реальные игроки, так и боты для создания живого сообщества
        </div>
      )}
    </div>
  );
};

export default OnlinePlayersListWithBots;
