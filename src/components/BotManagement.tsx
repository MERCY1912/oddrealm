import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBotSystem } from '@/hooks/useBotSystem';
import { BotCharacter } from '@/types/bot';
import { Play, Pause, RefreshCw, Users, MessageSquare, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BotManagement: React.FC = () => {
  const { bots, isInitialized, isRunning, startBots, stopBots, refreshBots } = useBotSystem();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleStartBots = () => {
    startBots();
    toast({
      title: "Боты запущены",
      description: "Система ботов активирована",
    });
  };

  const handleStopBots = () => {
    stopBots();
    toast({
      title: "Боты остановлены",
      description: "Система ботов деактивирована",
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBots();
      toast({
        title: "Список обновлен",
        description: `Активно ${bots.length} ботов`,
      });
    } catch (error) {
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить список ботов",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'afk': return 'bg-yellow-500';
      case 'in_battle': return 'bg-red-500';
      case 'in_dungeon': return 'bg-purple-500';
      default: return 'bg-gray-500';
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

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление ботами
            </CardTitle>
            <CardDescription>
              Система ботов для имитации живых игроков
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            {isRunning ? (
              <Button onClick={handleStopBots} variant="destructive" size="sm">
                <Pause className="h-4 w-4" />
                Остановить
              </Button>
            ) : (
              <Button onClick={handleStartBots} variant="default" size="sm">
                <Play className="h-4 w-4" />
                Запустить
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Статус системы */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isInitialized ? 'Система инициализирована' : 'Система не инициализирована'}
              </span>
            </div>
            <Badge variant={isRunning ? 'default' : 'secondary'}>
              {isRunning ? 'Активна' : 'Неактивна'}
            </Badge>
            <Badge variant="outline">
              {bots.length} ботов
            </Badge>
          </div>

          {/* Список ботов */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Активные боты</h3>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {bots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет активных ботов
                  </div>
                ) : (
                  bots.map((bot) => (
                    <BotCard key={bot.id} bot={bot} />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface BotCardProps {
  bot: BotCharacter;
}

const BotCard: React.FC<BotCardProps> = ({ bot }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'afk': return 'bg-yellow-500';
      case 'in_battle': return 'bg-red-500';
      case 'in_dungeon': return 'bg-purple-500';
      default: return 'bg-gray-500';
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

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getClassIcon(bot.character_class)}</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{bot.name}</h4>
              <Badge variant="outline">Ур. {bot.level}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">@{bot.username}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`} />
              <span className="text-sm font-medium">{getStatusText(bot.status)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {bot.location}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Активность</div>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatLastActivity(bot.last_activity)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Ответы</div>
            <div className="text-sm font-medium">{bot.response_chance}%</div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <p className="text-sm text-muted-foreground italic">
          "{bot.personality}"
        </p>
      </div>
    </Card>
  );
};

export default BotManagement;
