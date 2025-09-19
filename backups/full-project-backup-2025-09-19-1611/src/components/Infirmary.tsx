
import React from 'react';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InfirmaryProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
}

const Infirmary = ({ player, onPlayerUpdate }: InfirmaryProps) => {
  const { toast } = useToast();

  const heal = () => {
    const healCost = 20;
    if (player.gold >= healCost) {
      const updatedPlayer: Player = {
        ...player,
        health: player.maxHealth,
        mana: player.maxMana,
        gold: player.gold - healCost,
      };
      onPlayerUpdate(updatedPlayer);
      toast({
        title: "Исцеление завершено!",
        description: "Клирик восстановил ваше здоровье и ману",
      });
    } else {
      toast({
        title: "Недостаточно золота",
        description: `Клирик требует ${healCost} золота за исцеление`,
        variant: "destructive",
      });
    }
  };

  const isFullHealth = player.health === player.maxHealth && player.mana === player.maxMana;

  return (
    <Card className="bg-gray-800 border-blue-600 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⛪</span>
          <div>
            <div className="text-xl text-blue-400">Лазарет</div>
            <div className="text-sm text-gray-300">Клирик-целитель</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-center mb-3">
            <div className="text-6xl mb-2">🧙‍♂️</div>
            <div className="text-blue-400 font-bold">Отец Бенедикт</div>
            <div className="text-gray-300 text-sm">Священный целитель</div>
          </div>
          
          <div className="text-gray-300 text-sm text-center mb-4">
            "Пусть свет исцелит твои раны, воин. За небольшую плату я восстановлю твои силы."
          </div>

          <div className="bg-blue-900/30 rounded p-3 mb-4">
            <div className="text-center text-sm">
              <div className="text-blue-400">💚 Полное исцеление</div>
              <div className="text-gray-300">Восстанавливает здоровье и ману</div>
              <div className="text-yellow-400 font-bold">💰 20 золота</div>
            </div>
          </div>

          <Button 
            onClick={heal}
            disabled={player.gold < 20 || isFullHealth}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isFullHealth ? 'Вы полностью здоровы' : 'Исцелиться (20 💰)'}
          </Button>

          {player.gold < 20 && !isFullHealth && (
            <div className="text-red-400 text-xs text-center mt-2">
              Недостаточно золота для исцеления
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Infirmary;
