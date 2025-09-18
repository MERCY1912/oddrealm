import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocationHandler from './LocationHandler';
import AncientTower from './AncientTower';
import AdminPanel from './AdminPanel';
import DungeonSystem from './DungeonSystem';

interface TownViewProps {
  player: any;
  onPlayerUpdate: (player: any) => void;
}

const TownView = ({ player, onPlayerUpdate }: TownViewProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const locations = [
    { id: 'merchant', name: 'Лавка' },
    { id: 'blacksmith', name: 'Кузница' },
    { id: 'healer', name: 'Лазарет' },
    { id: 'arena', name: 'Арена' },
    { id: 'castle', name: 'Замок' },
    { id: 'tavern', name: 'Трактир' },
    { id: 'temple', name: 'Храм' },
    { id: 'ancient-tower', name: 'Башня' },
    { id: 'dungeons', name: '🏰 Подземелья' },
    { id: 'admin', name: '🛠️ Админ' }
  ];

  if (selectedLocation) {
    if (selectedLocation === 'ancient-tower') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <Button 
              onClick={() => setSelectedLocation(null)}
              className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
            >
              ← Назад в город
            </Button>
            <div className="text-yellow-400 font-bold">💰 {player.gold} золота</div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <AncientTower 
              player={player}
              onPlayerUpdate={onPlayerUpdate}
            />
          </div>
        </div>
      );
    }

    if (selectedLocation === 'dungeons') {
      return (
        <div className="min-h-screen p-4">
          <div className="flex justify-between items-center mb-6">
            <Button 
              onClick={() => setSelectedLocation(null)}
              className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
            >
              ← Назад в город
            </Button>
            <div className="text-yellow-400 font-bold">💰 {player.gold} золота</div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <DungeonSystem 
              player={player}
              onPlayerUpdate={onPlayerUpdate}
              onBack={() => setSelectedLocation(null)}
            />
          </div>
        </div>
      );
    }

    if (selectedLocation === 'admin') {
      return (
        <AdminPanel 
          onBack={() => setSelectedLocation(null)}
        />
      );
    }

    return (
      <LocationHandler
        locationId={selectedLocation}
        player={player}
        onPlayerUpdate={onPlayerUpdate}
        onBack={() => setSelectedLocation(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-400">
            🏰 Город Альдерион
          </h1>
          <div className="bg-gray-900 bg-opacity-80 rounded-lg p-3 border border-gray-600">
            <div className="text-yellow-400 font-bold">💰 {player.gold} золота</div>
            <div className="text-green-400">❤️ {player.health}/{player.max_health || player.maxHealth}</div>
            <div className="text-blue-400">🔮 {player.mana}/{player.max_mana || player.maxMana}</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Central City Image */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <img 
                src="/lovable-uploads/f75b78ee-bfd9-47ad-8092-a3fd36400dc5.png" 
                alt="Город Альдерион" 
                className="w-full max-w-5xl h-[32rem] object-cover rounded-lg shadow-2xl border border-gray-400"
              />
            </div>
          </div>

          {/* Compact Location Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {locations.map((location) => (
              <Button
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
              >
                {location.name}
              </Button>
            ))}
          </div>

          {/* City Information Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player Tips */}
            <Card className="bg-gray-800 border-gray-600 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-lg">💡 Советы новичку</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">⛪</span>
                  <span>Начните с лазарета для восстановления здоровья</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🏪</span>
                  <span>Купите снаряжение в торговой лавке</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">⚔️</span>
                  <span>Сражайтесь на арене за опыт</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">🏗️</span>
                  <span>Испытайте себя в Башне Древних</span>
                </div>
              </CardContent>
            </Card>

            {/* City News */}
            <Card className="bg-gray-800 border-gray-600 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-lg">📰 Городские новости</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-gray-300">
                  • Торговцы завезли новые товары из дальних земель
                </div>
                <div className="text-gray-300">
                  • В арене появились новые опасные противники
                </div>
                <div className="text-gray-300">
                  • Башня Древних излучает странную энергию
                </div>
                <div className="text-gray-300">
                  • Кузнец освоил новые техники улучшения снаряжения
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownView;
