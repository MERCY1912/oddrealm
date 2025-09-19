import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Player, PvPRequest } from '@/types/game';
import { toast } from 'sonner';

interface PvPRequestFormProps {
  player: Player;
  onCreateRequest: (waitTime: number) => void;
  onCancelRequest: () => void;
  currentRequest?: PvPRequest | null;
  isCreating: boolean;
  onCheckBattle?: () => void;
}

const PvPRequestForm: React.FC<PvPRequestFormProps> = ({
  player,
  onCreateRequest,
  onCancelRequest,
  currentRequest,
  isCreating,
  onCheckBattle
}) => {
  const [waitTime, setWaitTime] = useState<number>(5);

  const handleCreateRequest = () => {
    if (player.health < player.maxHealth * 0.5) {
      toast.error('Недостаточно здоровья для участия в PvP!');
      return;
    }

    onCreateRequest(waitTime);
  };

  const handleCancelRequest = () => {
    onCancelRequest();
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return 'Истекло';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (currentRequest) {
    return (
      <Card className="medieval-bg-secondary border-2 border-amber-600">
        <CardHeader>
          <CardTitle className="text-amber-400 text-center">
            ⚔️ Ваша заявка на бой
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-white">
              <span className="text-amber-400">Уровень:</span> {currentRequest.challengerLevel}
            </p>
            <p className="text-white">
              <span className="text-amber-400">Класс:</span> {currentRequest.challengerClass}
            </p>
            <p className="text-white">
              <span className="text-amber-400">Время ожидания:</span> {currentRequest.waitTime} мин
            </p>
            <p className="text-white">
              <span className="text-amber-400">Осталось времени:</span> {getTimeRemaining(currentRequest.expiresAt)}
            </p>
            <p className="text-green-400 font-bold">
              Статус: {currentRequest.status === 'waiting' ? 'Ожидание противника...' : currentRequest.status}
            </p>
          </div>
          
          <div className="flex justify-center space-x-2">
            {onCheckBattle && (
              <Button
                onClick={onCheckBattle}
                variant="outline"
                className="medieval-bg-secondary"
              >
                Проверить бой
              </Button>
            )}
            <Button
              onClick={handleCancelRequest}
              variant="destructive"
              className="medieval-bg-red"
            >
              Отменить заявку
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="medieval-bg-secondary border-2 border-amber-600">
      <CardHeader>
        <CardTitle className="text-amber-400 text-center">
          ⚔️ Создать заявку на PvP бой
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-white">
            <span className="text-amber-400">Ваш уровень:</span> {player.level}
          </p>
          <p className="text-white">
            <span className="text-amber-400">Ваш класс:</span> {player.class}
          </p>
          <p className="text-white">
            <span className="text-amber-400">Здоровье:</span> {player.health}/{player.maxHealth}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-amber-400 font-bold">Время ожидания противника:</label>
          <Select value={waitTime.toString()} onValueChange={(value) => setWaitTime(Number(value))}>
            <SelectTrigger className="medieval-bg-tertiary border-amber-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="medieval-bg-tertiary border-amber-600">
              <SelectItem value="2">2 минуты</SelectItem>
              <SelectItem value="5">5 минут</SelectItem>
              <SelectItem value="10">10 минут</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center text-sm text-gray-300">
          <p>После создания заявки любой игрок сможет принять ваш вызов</p>
          <p>Бой начнется автоматически при принятии заявки</p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleCreateRequest}
            disabled={isCreating || player.health < player.maxHealth * 0.5}
            className="medieval-bg-primary hover:medieval-bg-primary/80"
          >
            {isCreating ? 'Создание заявки...' : 'Создать заявку'}
          </Button>
        </div>

        {player.health < player.maxHealth * 0.5 && (
          <div className="text-center text-red-400 text-sm">
            ⚠️ Недостаточно здоровья для участия в PvP (минимум 50%)
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PvPRequestForm;
