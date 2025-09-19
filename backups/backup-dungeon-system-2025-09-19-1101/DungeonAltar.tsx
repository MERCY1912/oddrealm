import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/types/game';

interface DungeonAltarProps {
  player: Player;
  onHeal: (amount: number) => void;
  onManaRestore: (amount: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export default function DungeonAltar({ 
  player, 
  onHeal, 
  onManaRestore, 
  onComplete, 
  onSkip 
}: DungeonAltarProps) {
  const [used, setUsed] = useState(false);

  const handleHeal = () => {
    const healAmount = Math.floor(player.maxHealth * 0.5);
    onHeal(healAmount);
    setUsed(true);
    onComplete();
  };

  const handleManaRestore = () => {
    const manaAmount = Math.floor(player.maxMana * 0.3);
    onManaRestore(manaAmount);
    setUsed(true);
    onComplete();
  };

  const handleBlessing = () => {
    const healAmount = Math.floor(player.maxHealth * 0.3);
    const manaAmount = Math.floor(player.maxMana * 0.2);
    onHeal(healAmount);
    onManaRestore(manaAmount);
    setUsed(true);
    onComplete();
  };

  if (used) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-center">⛪ Алтарь</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300 mb-4">
            Алтарь уже использован. Священная энергия иссякла.
          </p>
          <Button 
            onClick={onSkip}
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
        <CardTitle className="text-white text-center">⛪ Священный Алтарь</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-300 mb-6">
          Вы нашли древний алтарь, излучающий священную энергию. 
          Выберите благословение:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={handleHeal}
            className="bg-green-600 hover:bg-green-700 text-white h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">💚</span>
            <span>Исцеление</span>
            <span className="text-xs opacity-75">+50% здоровья</span>
          </Button>
          
          <Button
            onClick={handleManaRestore}
            className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">💙</span>
            <span>Восстановление маны</span>
            <span className="text-xs opacity-75">+30% маны</span>
          </Button>
          
          <Button
            onClick={handleBlessing}
            className="bg-purple-600 hover:bg-purple-700 text-white h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">✨</span>
            <span>Благословение</span>
            <span className="text-xs opacity-75">+30% здоровья и маны</span>
          </Button>
        </div>
        
        <Button 
          onClick={onSkip}
          variant="outline"
          className="border-gray-500 text-gray-300 hover:bg-gray-700"
        >
          Пропустить
        </Button>
      </CardContent>
    </Card>
  );
}



