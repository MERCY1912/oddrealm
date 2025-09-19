import React from 'react';
import OrnateFrame from './OrnateFrame';
import cityMainImage from '@/assets/locations/city_main_1.jpg';
import arenaMainImage from '@/assets/locations/arena_main.jpg';

interface LocationViewProps {
  locationName: string;
  locationImage: string;
  locationDescription: string;
  availableActions?: Array<{
    name: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
  customContent?: React.ReactNode;
}

const LocationView = ({
  locationName,
  locationImage,
  locationDescription,
  availableActions = [],
  customContent
}: LocationViewProps) => {
  // Проверяем, является ли это городом, ареной или магазином, чтобы показать картинку
  const isCity = locationName === "ГОРОД";
  const isArena = locationName === "АРЕНА";
  const isShop = locationName === "МАГАЗИН";
  const isCharacter = locationName === "ПЕРСОНАЖ И ЭКИПИРОВКА";
  
  // Для персонажа используем обычный layout без полного экрана
  if (isCharacter) {
    return (
      <div className="space-y-6">
        {/* Заголовок локации */}
        <OrnateFrame title={locationName} tone="accent" corners={2}>
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">{locationImage}</div>
            <p className="medieval-body text-lg">{locationDescription}</p>
          </div>
        </OrnateFrame>

        {/* Доступные действия */}
        {availableActions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-amber-400 medieval-title">
              ДОСТУПНЫЕ МЕСТА
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableActions.map((action, index) => (
                <div
                  key={index}
                  className="medieval-bg-secondary border-2 border-amber-600 rounded-lg p-6 hover:border-amber-400 hover:medieval-bg-primary/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  onClick={action.action}
                >
                  <div className="text-center space-y-4">
                    <div className="text-5xl mb-2 medieval-floating">{action.icon}</div>
                    <h3 className="text-amber-400 font-bold text-xl medieval-title">{action.name}</h3>
                    <p className="text-gray-300 text-sm medieval-body leading-relaxed">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Для города, арены и магазина используем адаптивный layout
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
          {isCity ? "ГОРОД АЛЬДЕРИОН" : isArena ? "ВЕЛИКАЯ АРЕНА ТАВРОС" : isShop ? "ТОРГОВЫЙ ДОМ" : locationName}
        </h1>

        {/* Основная рамка с картинкой */}
        <div className="w-full">
          <OrnateFrame tone="accent" corners={4} padded={false}>
            {isCity ? (
              <img 
                src={cityMainImage} 
                alt="Главный город королевства"
                className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              />
            ) : isArena ? (
              <img 
                src={arenaMainImage} 
                alt="Кровавые арены"
                className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              />
            ) : isShop ? (
              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-amber-900/30 via-yellow-900/20 to-amber-800/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,.15),transparent_70%)]" />
                <div className="text-8xl opacity-80">🏪</div>
                <div className="absolute bottom-4 left-4 text-amber-200 text-sm font-medium">
                  Торговый дом Альдериона
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="text-6xl mb-4">{locationImage}</div>
              </div>
            )}
          </OrnateFrame>
        </div>

        {/* Описание локации за рамкой */}
        <p className="medieval-body text-lg text-center text-white max-w-4xl">
          {locationDescription}
        </p>

        {/* Доступные действия */}
        {availableActions.length > 0 && (
          <div className="w-full space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-center text-amber-400 medieval-title">
              ДОСТУПНЫЕ МЕСТА
            </h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {availableActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-gray-700 text-white hover:bg-gray-600 px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-colors"
                >
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Кастомный контент */}
        {customContent && (
          <div className="w-full">
            {customContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationView;
