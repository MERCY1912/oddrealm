import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Player } from '@/types/game';
import PvPArena from './PvPArena';
import ArenaHallView from './ArenaHallView';
import OrnateFrame from './OrnateFrame';
import arenaMainImage from '@/assets/locations/arena_main.jpg';
import newbieRoomImage from '@/assets/rooms/newbie_room.png';
import averageRoomImage from '@/assets/rooms/average_room.png';
import hardRoomImage from '@/assets/rooms/hard_room.png';

interface ArenaWithTabsProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onNavigate: (location: string) => void;
  onEnterHall: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onStartBattleWithBot: (botId: string) => void;
}

const ArenaWithTabs = ({ 
  player, 
  onPlayerUpdate, 
  onNavigate, 
  onEnterHall, 
  onStartBattleWithBot 
}: ArenaWithTabsProps) => {
  const [activeTab, setActiveTab] = useState('pve');
  const [selectedHall, setSelectedHall] = useState<'easy' | 'medium' | 'hard' | null>(null);

  // Если выбран зал, показываем его
  if (selectedHall) {
    return (
      <ArenaHallView
        difficulty={selectedHall}
        onBackToArena={() => setSelectedHall(null)}
        onStartBattleWithBot={onStartBattleWithBot}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-start p-4 pt-8">
      <div className="w-full max-w-6xl flex flex-col items-center space-y-4">
        {/* Название локации золотыми буквами */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2"
            style={{ 
              background: "linear-gradient(180deg,#fde8a7,#8a5a18)", 
              WebkitBackgroundClip: "text", 
              color: "transparent" 
            }}>
          ВЕЛИКАЯ АРЕНА ТАВРОС
        </h1>

        {/* Кнопки выбора режима PVE/PVP - сверху картинки */}
        <div className="w-full max-w-6xl mb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 rounded-b-none border-b-0">
              <TabsTrigger
                value="pve"
                className="text-base font-bold relative transition-all duration-200 rounded-b-none"
                style={{
                  backgroundColor: activeTab === 'pve' ? '#2d4a2d' : '#2a2a2a',
                  color: activeTab === 'pve' ? '#e5e5e5' : '#9ca3af',
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                <span className="font-serif tracking-wide">⚔️ PVE СРАЖЕНИЯ</span>
              </TabsTrigger>
              <TabsTrigger
                value="pvp"
                className="text-base font-bold relative transition-all duration-200 rounded-b-none"
                style={{
                  backgroundColor: activeTab === 'pvp' ? '#4a2d2d' : '#2a2a2a',
                  color: activeTab === 'pvp' ? '#e5e5e5' : '#9ca3af',
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                <span className="font-serif tracking-wide">🛡️ PVP ДУЭЛИ</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Основная рамка с картинкой - показываем только для PVE */}
        {activeTab === 'pve' && (
          <div className="w-full -mt-2">
            <div className="relative">
              <OrnateFrame tone="accent" corners={4} padded={false}>
                <img 
                  src={arenaMainImage} 
                  alt="Кровавые арены"
                  className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover rounded-t-none"
                />
              </OrnateFrame>
            </div>
          </div>
        )}

        {/* Описание локации за рамкой - только для PVE */}
        {activeTab === 'pve' && (
          <p className="medieval-body text-lg text-center text-white max-w-4xl mt-4">
            Выберите тип сражений на Великой арене Таврос.
          </p>
        )}

        {/* Контент вкладок */}
        <div className="w-full max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="pve" className="mt-4">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-amber-400 mb-4">
                    ВЫБЕРИТЕ ЗАЛ ДЛЯ СРАЖЕНИЯ
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Каждый зал предлагает противников разной сложности и соответствующие награды
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Зал новичков */}
                  <div
                    className="medieval-bg-secondary rounded-lg p-6 hover:medieval-bg-primary/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => setSelectedHall('easy')}
                  >
                    <div className="text-center space-y-4">
                      <div className="mb-2 medieval-floating">
                        <img 
                          src={newbieRoomImage} 
                          alt="Зал новичков" 
                          className="w-24 h-24 mx-auto object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="text-green-400 font-bold text-xl medieval-title">ЗАЛ НОВИЧКОВ</h3>
                      <p className="text-gray-300 text-sm medieval-body leading-relaxed">
                        Для начинающих воинов. Слабые противники, небольшие награды.
                      </p>
                      <div className="text-xs text-green-300">
                        Рекомендуемый уровень: 1-5
                      </div>
                    </div>
                  </div>

                  {/* Зал ветеранов */}
                  <div
                    className="medieval-bg-secondary rounded-lg p-6 hover:medieval-bg-primary/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => setSelectedHall('medium')}
                  >
                    <div className="text-center space-y-4">
                      <div className="mb-2 medieval-floating">
                        <img 
                          src={averageRoomImage} 
                          alt="Зал ветеранов" 
                          className="w-24 h-24 mx-auto object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="text-yellow-400 font-bold text-xl medieval-title">ЗАЛ ВЕТЕРАНОВ</h3>
                      <p className="text-gray-300 text-sm medieval-body leading-relaxed">
                        Для опытных воинов. Сильные противники, хорошие награды.
                      </p>
                      <div className="text-xs text-yellow-300">
                        Рекомендуемый уровень: 6-15
                      </div>
                    </div>
                  </div>

                  {/* Зал легенд */}
                  <div
                    className="medieval-bg-secondary rounded-lg p-6 hover:medieval-bg-primary/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => setSelectedHall('hard')}
                  >
                    <div className="text-center space-y-4">
                      <div className="mb-2 medieval-floating">
                        <img 
                          src={hardRoomImage} 
                          alt="Зал легенд" 
                          className="w-24 h-24 mx-auto object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="text-red-400 font-bold text-xl medieval-title">ЗАЛ ЛЕГЕНД</h3>
                      <p className="text-gray-300 text-sm medieval-body leading-relaxed">
                        Для истинных мастеров боя. Смертельно опасные противники, легендарные награды.
                      </p>
                      <div className="text-xs text-red-300">
                        Рекомендуемый уровень: 16+
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pvp" className="mt-4">
              <PvPArena
                player={player}
                onPlayerUpdate={onPlayerUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArenaWithTabs;
