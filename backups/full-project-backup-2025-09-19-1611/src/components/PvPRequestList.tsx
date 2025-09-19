import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player, PvPRequest } from '@/types/game';
import { toast } from 'sonner';

interface PvPRequestListProps {
  player: Player;
  requests: PvPRequest[];
  onAcceptRequest: (requestId: string) => void;
  isLoading: boolean;
}

const PvPRequestList: React.FC<PvPRequestListProps> = ({
  player,
  requests,
  onAcceptRequest,
  isLoading
}) => {
  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return 'Истекло';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (challengerLevel: number) => {
    const levelDiff = challengerLevel - player.level;
    if (levelDiff <= -5) return 'text-green-400';
    if (levelDiff <= -2) return 'text-yellow-400';
    if (levelDiff <= 2) return 'text-orange-400';
    if (levelDiff <= 5) return 'text-red-400';
    return 'text-purple-400';
  };

  const getDifficultyText = (challengerLevel: number) => {
    const levelDiff = challengerLevel - player.level;
    if (levelDiff <= -5) return 'Очень легко';
    if (levelDiff <= -2) return 'Легко';
    if (levelDiff <= 2) return 'Равно';
    if (levelDiff <= 5) return 'Сложно';
    return 'Очень сложно';
  };

  const handleAcceptRequest = (request: PvPRequest) => {
    if (player.health < player.maxHealth * 0.5) {
      toast.error('Недостаточно здоровья для участия в PvP!');
      return;
    }

    if (request.challengerId === player.id) {
      toast.error('Нельзя принять собственную заявку!');
      return;
    }

    onAcceptRequest(request.id);
  };

  const activeRequests = requests.filter(req => 
    req.status === 'waiting' && 
    req.challengerId !== player.id &&
    new Date() < req.expiresAt
  );

  if (isLoading) {
    return (
      <Card className="medieval-bg-secondary border-2 border-amber-600">
        <CardHeader>
          <CardTitle className="text-amber-400 text-center">
            ⚔️ Доступные заявки на бой
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-white">
            Загрузка заявок...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeRequests.length === 0) {
    return (
      <Card className="medieval-bg-secondary border-2 border-amber-600">
        <CardHeader>
          <CardTitle className="text-amber-400 text-center">
            ⚔️ Доступные заявки на бой
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-white space-y-2">
            <p>Нет доступных заявок на бой</p>
            <p className="text-sm text-gray-400">
              Создайте свою заявку или подождите появления новых вызовов
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="medieval-bg-secondary border-2 border-amber-600">
      <CardHeader>
        <CardTitle className="text-amber-400 text-center">
          ⚔️ Доступные заявки на бой ({activeRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeRequests.map((request) => (
          <div
            key={request.id}
            className="medieval-bg-tertiary border border-amber-600 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-white font-bold text-lg">
                  {request.challengerName}
                </h4>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-amber-400">
                    Уровень: <span className="text-white">{request.challengerLevel}</span>
                  </span>
                  <span className="text-amber-400">
                    Класс: <span className="text-white">{request.challengerClass}</span>
                  </span>
                </div>
              </div>
              <Badge 
                className={`${getDifficultyColor(request.challengerLevel)} bg-transparent border`}
              >
                {getDifficultyText(request.challengerLevel)}
              </Badge>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <p className="text-gray-300">
                  <span className="text-amber-400">Время ожидания:</span> {request.waitTime} мин
                </p>
                <p className="text-gray-300">
                  <span className="text-amber-400">Осталось:</span> {getTimeRemaining(request.expiresAt)}
                </p>
              </div>
              <Button
                onClick={() => handleAcceptRequest(request)}
                disabled={player.health < player.maxHealth * 0.5}
                className="medieval-bg-primary hover:medieval-bg-primary/80"
                size="sm"
              >
                Принять вызов
              </Button>
            </div>

            {player.health < player.maxHealth * 0.5 && (
              <div className="text-center text-red-400 text-xs">
                ⚠️ Недостаточно здоровья для участия в PvP
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PvPRequestList;
