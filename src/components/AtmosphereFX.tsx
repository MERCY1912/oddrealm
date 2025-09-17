import React, { useState } from 'react';
import OrnateFrame from './OrnateFrame';
import { Slot } from './Slot';

const AtmosphereFX = () => {
  const [showLootFX, setShowLootFX] = useState(false);
  const [showLevelUpFX, setShowLevelUpFX] = useState(false);

  const triggerLootFX = () => {
    setShowLootFX(true);
    setTimeout(() => setShowLootFX(false), 1200);
  };

  const triggerLevelUpFX = () => {
    setShowLevelUpFX(true);
    setTimeout(() => setShowLevelUpFX(false), 1200);
  };

  return (
    <div className="min-h-screen bg-ink p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="medieval-title text-5xl text-center medieval-accent-blood">
          АТМОСФЕРНЫЕ ЭФФЕКТЫ
        </h1>

        {/* FX при луте/уровне */}
        <OrnateFrame title="FX ПРИ ЛУТЕ/УРОВНЕ" variant="epic" colorClass="text-amber-300">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="medieval-subtitle mb-4">Эффект при получении лута</h3>
                <div className={`medieval-bg-tertiary p-8 rounded-lg transition-all duration-300 ${showLootFX ? 'loot-fx' : ''}`}>
                  <div className="text-4xl mb-2">💎</div>
                  <div className="medieval-text-primary">Редкий предмет!</div>
                </div>
                <button 
                  onClick={triggerLootFX}
                  className="medieval-button mt-4 px-4 py-2"
                >
                  Получить лут
                </button>
              </div>

              <div className="text-center">
                <h3 className="medieval-subtitle mb-4">Эффект при повышении уровня</h3>
                <div className={`medieval-bg-tertiary p-8 rounded-lg transition-all duration-300 ${showLevelUpFX ? 'level-up-fx' : ''}`}>
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="medieval-text-primary">Новый уровень!</div>
                </div>
                <button 
                  onClick={triggerLevelUpFX}
                  className="medieval-button mt-4 px-4 py-2"
                >
                  Повысить уровень
                </button>
              </div>
            </div>
          </div>
        </OrnateFrame>

        {/* Редкость предметов */}
        <OrnateFrame title="РЕДКОСТЬ ПРЕДМЕТОВ" variant="strong" colorClass="text-gold" edges>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="medieval-subtitle mb-4">Обычные</h3>
                <div className="flex justify-center">
                  <Slot 
                    icon={<span>⚔️</span>} 
                    rarity="common"
                    className="w-20 h-20"
                  />
                </div>
                <div className="medieval-caption mt-2">Серое внутреннее сияние</div>
              </div>

              <div className="text-center">
                <h3 className="medieval-subtitle mb-4">Редкие</h3>
                <div className="flex justify-center">
                  <Slot 
                    icon={<span>🛡️</span>} 
                    rarity="rare"
                    className="w-20 h-20"
                  />
                </div>
                <div className="medieval-caption mt-2">Золотое внутреннее сияние</div>
              </div>

              <div className="text-center">
                <h3 className="medieval-subtitle mb-4">Эпические</h3>
                <div className="flex justify-center">
                  <Slot 
                    icon={<span>🔮</span>} 
                    rarity="epic"
                    className="w-20 h-20"
                  />
                </div>
                <div className="medieval-caption mt-2">Красное внутреннее сияние</div>
              </div>
            </div>
          </div>
        </OrnateFrame>

        {/* Шрифты заголовков */}
        <OrnateFrame title="ШРИФТЫ ЗАГОЛОВКОВ" variant="base" colorClass="text-gold">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="medieval-title text-4xl mb-4">
                Cinzel - Готический шрифт
              </h2>
              <p className="medieval-body">
                Этот шрифт придает заголовкам средневековый характер и атмосферу.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="medieval-title text-2xl mb-3">Заголовок H3</h3>
                <p className="medieval-body">Описание с обычным шрифтом Inter</p>
              </div>
              <div>
                <h3 className="medieval-title text-2xl mb-3">Заголовок H3</h3>
                <p className="medieval-body">Еще одно описание с обычным шрифтом</p>
              </div>
            </div>
          </div>
        </OrnateFrame>

        {/* Комбинированный пример */}
        <OrnateFrame title="КОМБИНИРОВАННЫЙ ПРИМЕР" variant="epic" colorClass="text-amber-300">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="medieval-title text-3xl mb-4">
                Получен новый предмет!
              </h2>
              <div className="flex justify-center mb-4">
                <Slot 
                  icon={<span>⚔️</span>} 
                  rarity="epic"
                  className="w-24 h-24"
                />
              </div>
              <div className="medieval-subtitle mb-2">Легендарный меч дракона</div>
              <div className="medieval-caption">Эпическая редкость с красным сиянием</div>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default AtmosphereFX;
