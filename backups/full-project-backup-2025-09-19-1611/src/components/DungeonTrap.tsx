import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/types/game';
import { useSound } from '@/hooks/useSound';

interface DungeonTrapProps {
  player: Player;
  onDamage: (amount: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export default function DungeonTrap({ 
  player, 
  onDamage, 
  onComplete, 
  onSkip 
}: DungeonTrapProps) {
  const [triggered, setTriggered] = useState(false);
  const [avoided, setAvoided] = useState(false);
  const { sounds } = useSound();

  const handleTrigger = () => {
    const damage = Math.floor(Math.random() * 20) + 10;
    const avoidChance = player.dexterity / 100;
    const isAvoided = Math.random() < avoidChance;
    
    if (isAvoided) {
      setAvoided(true);
      sounds.trapAvoid();
    } else {
      onDamage(damage);
      sounds.trapTrigger();
    }
    setTriggered(true);
  };

  const handleDisarm = () => {
    const disarmChance = (player.dexterity + player.luck) / 200;
    const isDisarmed = Math.random() < disarmChance;
    
    if (isDisarmed) {
      setAvoided(true);
      sounds.trapAvoid();
    } else {
      const damage = Math.floor(Math.random() * 15) + 5;
      onDamage(damage);
      sounds.trapTrigger();
    }
    setTriggered(true);
  };

  if (triggered) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-center">☠️ Ловушка</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {avoided ? (
            <div>
              <p className="text-green-400 mb-4 text-lg">
                🎉 Вы успешно избежали ловушки!
              </p>
              <p className="text-gray-300 mb-4">
                Ваша ловкость и удача помогли вам избежать опасности.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-400 mb-4 text-lg">
                💥 Ловушка сработала!
              </p>
              <p className="text-gray-300 mb-4">
                Вы получили урон от ловушки.
              </p>
            </div>
          )}
          <Button 
            onClick={onComplete}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Продолжить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-center">☠️ Опасная Ловушка</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-300 mb-6">
          Вы обнаружили коварную ловушку! Острые шипы торчат из пола. 
          Что будете делать?
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleTrigger}
            className="bg-red-600 hover:bg-red-700 text-white h-16 flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-1">⚡</span>
            <span>Быстро пройти</span>
            <span className="text-xs opacity-75">
              Шанс избежать: {Math.floor(player.dexterity)}%
            </span>
          </Button>
          
          <Button
            onClick={handleDisarm}
            className="bg-yellow-600 hover:bg-yellow-700 text-white h-16 flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-1">🔧</span>
            <span>Попытаться обезвредить</span>
            <span className="text-xs opacity-75">
              Шанс успеха: {Math.floor((player.dexterity + player.luck) / 2)}%
            </span>
          </Button>
        </div>
        
        <Button 
          onClick={onSkip}
          variant="outline"
          className="border-gray-500 text-gray-300 hover:bg-gray-700"
        >
          Обойти ловушку
        </Button>
      </CardContent>
    </Card>
  );
}
