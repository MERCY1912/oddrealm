import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArenaBot } from '@/types/game';
import BotEquipmentDisplay from './BotEquipmentDisplay';

interface ArenaBotProps {
  bot: ArenaBot;
  onChallenge: (bot: ArenaBot) => void;
  playerHealth: number;
  className?: string;
}

const ArenaBotComponent = ({ bot, onChallenge, playerHealth, className = '' }: ArenaBotProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600 hover:bg-green-700';
      case 'medium': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'hard': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };

  const getBotTypeColor = (botType: string) => {
    switch (botType) {
      case 'warrior': return 'text-blue-400';
      case 'mage': return 'text-purple-400';
      case 'archer': return 'text-green-400';
      case 'rogue': return 'text-gray-400';
      case 'paladin': return 'text-yellow-400';
      case 'berserker': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getBotTypeText = (botType: string) => {
    switch (botType) {
      case 'warrior': return 'Воин';
      case 'mage': return 'Маг';
      case 'archer': return 'Лучник';
      case 'rogue': return 'Разбойник';
      case 'paladin': return 'Паладин';
      case 'berserker': return 'Берсерк';
      default: return 'Неизвестно';
    }
  };

  return (
    <Card className={`bg-gray-800 border-gray-600 hover:border-gray-500 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {bot.image && (bot.image.includes('.jpg') || bot.image.includes('.png') || bot.image.includes('.jpeg') || bot.image.includes('.gif') || bot.image.includes('.webp')) ? (
              <img src={bot.image} alt={bot.name} className="w-12 h-12 rounded-md object-cover"/>
            ) : (
              <div className="text-3xl">{bot.image}</div>
            )}
            <div>
              <CardTitle className="text-white text-lg">{bot.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Ур. {bot.level}
                </Badge>
                <span className={`text-sm font-medium ${getBotTypeColor(bot.botType)}`}>
                  {getBotTypeText(bot.botType)}
                </span>
              </div>
            </div>
          </div>
          <Badge 
            className={`${getDifficultyColor(bot.difficulty)} text-white border-0`}
          >
            {getDifficultyText(bot.difficulty)}
          </Badge>
        </div>
      </CardHeader>

      
            <CardContent className="pt-0">
              {/* Описание */}
              <p className="text-gray-300 text-sm mb-4">{bot.description}</p>
      
              {/* Экипировка бота */}
              <div className="mb-4">
                <BotEquipmentDisplay bot={bot} />
              </div>
        {/* Основные характеристики */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-700 rounded p-2">
            <div className="text-red-400 text-xs font-medium">Здоровье</div>
            <div className="text-white text-sm font-bold">{bot.health}</div>
          </div>
          <div className="bg-gray-700 rounded p-2">
            <div className="text-orange-400 text-xs font-medium">Атака</div>
            <div className="text-white text-sm font-bold">{bot.attack}</div>
          </div>
          <div className="bg-gray-700 rounded p-2">
            <div className="text-blue-400 text-xs font-medium">Защита</div>
            <div className="text-white text-sm font-bold">{bot.defense}</div>
          </div>
          <div className="bg-gray-700 rounded p-2">
            <div className="text-yellow-400 text-xs font-medium">Опыт</div>
            <div className="text-white text-sm font-bold">+{bot.experience}</div>
          </div>
        </div>

        {/* Характеристики */}
        <div className="mb-4">
          <div className="text-gray-400 text-xs font-medium mb-2">Характеристики:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gray-700 rounded p-1 text-center">
                    <div className="text-red-300">Сила</div>
                    <div className="text-white font-bold">{bot.strength}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Влияет на урон в ближнем бою</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gray-700 rounded p-1 text-center">
                    <div className="text-green-300">Ловкость</div>
                    <div className="text-white font-bold">{bot.dexterity}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Влияет на скорость и уклонение</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gray-700 rounded p-1 text-center">
                    <div className="text-yellow-300">Удача</div>
                    <div className="text-white font-bold">{bot.luck}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Влияет на критические удары</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gray-700 rounded p-1 text-center">
                    <div className="text-blue-300">Выносливость</div>
                    <div className="text-white font-bold">{bot.endurance}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Влияет на здоровье и защиту</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Дополнительные характеристики */}
        <div className="mb-4">
          <div className="text-gray-400 text-xs font-medium mb-2">Боевые способности:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-700 rounded p-1 text-center">
              <div className="text-red-300">Крит</div>
              <div className="text-white font-bold">{bot.critChance}%</div>
            </div>
            <div className="bg-gray-700 rounded p-1 text-center">
              <div className="text-green-300">Уклон</div>
              <div className="text-white font-bold">{bot.dodgeChance}%</div>
            </div>
            <div className="bg-gray-700 rounded p-1 text-center">
              <div className="text-blue-300">Блок</div>
              <div className="text-white font-bold">{bot.blockChance}%</div>
            </div>
          </div>
        </div>

        {/* Награды */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-400 text-xs">
            Награда: <span className="text-yellow-400 font-bold">{bot.gold} золота</span>
          </div>
        </div>

        {/* Кнопка вызова */}
        <Button
          onClick={() => onChallenge(bot)}
          className={`w-full ${getDifficultyColor(bot.difficulty)} text-white font-bold`}
          disabled={playerHealth <= 0}
        >
          {playerHealth <= 0 ? 'Нужно лечение' : 'ВЫЗВАТЬ НА БОЙ'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArenaBotComponent;



