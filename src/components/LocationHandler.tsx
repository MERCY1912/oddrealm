import React, { useState } from 'react';
import { Player } from '@/types/game';
import ArenaWithTabs from './ArenaWithTabs';
import ArenaHallView from './ArenaHallView';
import LocationView from './LocationView';
import { Button } from '@/components/ui/button';

interface LocationHandlerProps {
  locationId: string;
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onBack: () => void;
}

const LocationHandler = ({ locationId, player, onPlayerUpdate, onBack }: LocationHandlerProps) => {
  const [selectedHall, setSelectedHall] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [selectedArenaBot, setSelectedArenaBot] = useState<string | null>(null);

  const handleEnterHall = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedHall(difficulty);
  };

  const handleStartBattleWithBot = (botId: string) => {
    setSelectedArenaBot(botId);
  };

  const handleNavigate = (location: string) => {
    if (location === 'character') {
      onBack();
    }
  };

  // Если выбран зал, показываем его
  if (selectedHall) {
    return (
      <ArenaHallView
        difficulty={selectedHall}
        onBackToArena={() => setSelectedHall(null)}
        onStartBattleWithBot={handleStartBattleWithBot}
      />
    );
  }

  // Если это арена, показываем арену с вкладками
  if (locationId === 'arena') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="flex justify-between items-center p-6 mb-6">
          <Button 
            onClick={onBack}
            className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
          >
            ← Назад в город
          </Button>
          <div className="text-yellow-400 font-bold">💰 {player.gold} золота</div>
        </div>
        
        <ArenaWithTabs
          player={player}
          onPlayerUpdate={onPlayerUpdate}
          onNavigate={handleNavigate}
          onEnterHall={handleEnterHall}
          onStartBattleWithBot={handleStartBattleWithBot}
        />
      </div>
    );
  }

  // Для других локаций показываем стандартный вид
  const getLocationInfo = (id: string) => {
    switch (id) {
      case 'merchant':
        return {
          name: 'ЛАВКА',
          image: '🏪',
          description: 'Торговая лавка, где можно купить и продать предметы.'
        };
      case 'blacksmith':
        return {
          name: 'КУЗНИЦА',
          image: '⚒️',
          description: 'Кузница для улучшения и ремонта экипировки.'
        };
      case 'healer':
        return {
          name: 'ЛАЗАРЕТ',
          image: '🏥',
          description: 'Лечебница для восстановления здоровья и маны.'
        };
      case 'castle':
        return {
          name: 'ЗАМОК',
          image: '🏰',
          description: 'Королевский замок с важными заданиями.'
        };
      case 'tavern':
        return {
          name: 'ТРАКТИР',
          image: '🍺',
          description: 'Место отдыха и получения информации.'
        };
      case 'temple':
        return {
          name: 'ХРАМ',
          image: '⛪',
          description: 'Священное место для благословений и молитв.'
        };
      default:
        return {
          name: 'НЕИЗВЕСТНАЯ ЛОКАЦИЯ',
          image: '❓',
          description: 'Описание недоступно.'
        };
    }
  };

  const locationInfo = getLocationInfo(locationId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex justify-between items-center p-6 mb-6">
        <Button 
          onClick={onBack}
          className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
        >
          ← Назад в город
        </Button>
        <div className="text-yellow-400 font-bold">💰 {player.gold} золота</div>
      </div>
      
      <LocationView
        locationName={locationInfo.name}
        locationImage={locationInfo.image}
        locationDescription={locationInfo.description}
        availableActions={[
          {
            name: "Вернуться в город",
            description: "Вернуться к выбору локаций",
            icon: "🏠",
            action: onBack
          }
        ]}
      />
    </div>
  );
};

export default LocationHandler;
