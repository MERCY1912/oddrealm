
import React from 'react';
import { Button } from '@/components/ui/button';

const BotSelectionPanel = ({
  easyBots,
  mediumBots,
  hardBots,
  eliteBots,
  player,
  startBattle,
  loadingBots,
}) => {
  if (loadingBots) {
    return (
      <div className="panel panel--tint panel--warm p-8 text-center text-white">
        Загрузка противников...
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Легкие противники */}
      {easyBots.length > 0 && <div>
        <h4 className="text-green-400 font-bold mb-2">🟢 Легкие противники</h4>
        <div className="space-y-2">
          {easyBots.map((bot) => (
            <div
              key={bot.id}
              className="panel panel--tint p-2 hover:bg-[#363640] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {bot.image && (bot.image.includes('.jpg') || bot.image.includes('.png') || bot.image.includes('.jpeg') || bot.image.includes('.gif') || bot.image.includes('.webp')) ? (
                    <img src={bot.image} alt={bot.name} className="w-10 h-10 rounded-md object-cover"/>
                  ) : (
                    <span className="text-2xl">{bot.image}</span>
                  )}
                  <div>
                    <h5 className="text-white text-sm font-medium">{bot.name}</h5>
                    <p className="text-gray-400 text-xs">Ур.{bot.level} • {bot.health} HP • +{bot.experience} опыта</p>
                  </div>
                </div>
                <Button
                  onClick={() => startBattle(bot)}
                  className="medieval-button text-white text-xs px-2 py-1 bg-green-700 hover:bg-green-600"
                  disabled={player.health <= 0}
                >
                  ВЫЗОВ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* Средние противники */}
      {mediumBots.length > 0 && <div>
        <h4 className="text-yellow-400 font-bold mb-2">🟡 Средние противники</h4>
        <div className="space-y-2">
          {mediumBots.map((bot) => (
            <div
              key={bot.id}
              className="panel panel--tint p-2 hover:bg-[#363640] transition-colors"
            >
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                  {bot.image && (bot.image.includes('.jpg') || bot.image.includes('.png') || bot.image.includes('.jpeg') || bot.image.includes('.gif') || bot.image.includes('.webp')) ? (
                    <img src={bot.image} alt={bot.name} className="w-10 h-10 rounded-md object-cover"/>
                  ) : (
                    <span className="text-2xl">{bot.image}</span>
                  )}
                  <div>
                    <h5 className="text-white text-sm font-medium">{bot.name}</h5>
                    <p className="text-gray-400 text-xs">Ур.{bot.level} • {bot.health} HP • +{bot.experience} опыта</p>
                  </div>
                </div>
                <Button
                  onClick={() => startBattle(bot)}
                  className="medieval-button text-white text-xs px-2 py-1 bg-yellow-700 hover:bg-yellow-600"
                  disabled={player.health <= 0}
                >
                  ВЫЗОВ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* Сильные противники */}
      {hardBots.length > 0 && <div>
        <h4 className="text-red-400 font-bold mb-2">🔴 Сильные противники</h4>
        <div className="space-y-2">
          {hardBots.map((bot) => (
            <div
              key={bot.id}
              className="panel panel--tint p-2 hover:bg-[#363640] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {bot.image && (bot.image.includes('.jpg') || bot.image.includes('.png') || bot.image.includes('.jpeg') || bot.image.includes('.gif') || bot.image.includes('.webp')) ? (
                    <img src={bot.image} alt={bot.name} className="w-10 h-10 rounded-md object-cover"/>
                  ) : (
                    <span className="text-2xl">{bot.image}</span>
                  )}
                  <div>
                    <h5 className="text-white text-sm font-medium">{bot.name}</h5>
                    <p className="text-gray-400 text-xs">Ур.{bot.level} • {bot.health} HP • +{bot.experience} опыта</p>
                  </div>
                </div>
                <Button
                  onClick={() => startBattle(bot)}
                  className="medieval-button text-white text-xs px-2 py-1 bg-red-700 hover:bg-red-600"
                  disabled={player.health <= 0}
                >
                  ВЫЗОВ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* Элитные противники */}
      {eliteBots.length > 0 && <div>
        <h4 className="text-purple-400 font-bold mb-2">🟣 Элитные противники (Боссы)</h4>
        <div className="space-y-2">
          {eliteBots.map((bot) => (
            <div
              key={bot.id}
              className="panel panel--tint p-2 hover:bg-[#363640] transition-colors border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {bot.image && (bot.image.includes('.jpg') || bot.image.includes('.png') || bot.image.includes('.jpeg') || bot.image.includes('.gif') || bot.image.includes('.webp')) ? (
                    <img src={bot.image} alt={bot.name} className="w-10 h-10 rounded-md object-cover"/>
                  ) : (
                    <span className="text-2xl">{bot.image}</span>
                  )}
                  <div>
                    <h5 className="text-white text-sm font-medium">{bot.name}</h5>
                    <p className="text-gray-400 text-xs">Ур.{bot.level} • {bot.health} HP • +{bot.experience} опыта</p>
                  </div>
                </div>
                <Button
                  onClick={() => startBattle(bot)}
                  className="medieval-button text-white text-xs px-2 py-1 bg-purple-700 hover:bg-purple-60"
                  disabled={player.health <= 0}
                >
                  ВЫЗОВ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
};

export default BotSelectionPanel;
