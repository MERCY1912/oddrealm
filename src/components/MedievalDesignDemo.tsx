import React from 'react';
import Frame from './Frame';
import { Bar } from './Bar';
import { Slot } from './Slot';
import Inventory from './Inventory';
import EquipmentSlots from './EquipmentSlots';

const MedievalDesignDemo = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="medieval-title text-5xl mb-4 medieval-floating">⚔️ ЦАРСТВО ЧЕМПИОНОВ</h1>
          <p className="medieval-subtitle text-xl">Средневековый фэнтезийный дизайн с игровыми эффектами</p>
        </div>

        {/* Готические рамки */}
        <Frame title="ГОТИЧЕСКИЕ РАМКИ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Frame title="Обычная рамка">
              <div className="medieval-body">
                Это обычная готическая рамка с угловыми скобами и золотым обрамлением.
              </div>
            </Frame>
            <Frame title="Акцентная рамка" accent>
              <div className="medieval-body">
                Это акцентная рамка с красным свечением для важных элементов.
              </div>
            </Frame>
          </div>
        </Frame>

        {/* Цветовая палитра */}
        <Frame title="ЦВЕТОВАЯ ПАЛИТРА">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-ink"></div>
              <div className="medieval-caption">Ink</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-iron"></div>
              <div className="medieval-caption">Iron</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-stone"></div>
              <div className="medieval-caption">Stone</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-gold"></div>
              <div className="medieval-caption">Gold</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-blood"></div>
              <div className="medieval-caption">Blood</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-ash"></div>
              <div className="medieval-caption">Ash</div>
            </div>
          </div>
        </Frame>

        {/* Компоненты */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Кнопки */}
          <Frame title="КНОПКИ">
            <div className="space-y-4">
              <button className="medieval-button w-full">Обычная кнопка</button>
              <button className="medieval-button w-full hover:shadow-glow-gold">Кнопка с эффектом</button>
              <button className="medieval-button w-full bg-blood hover:bg-red-600">Красная кнопка</button>
            </div>
          </Frame>

          {/* Прогресс-бары */}
          <Frame title="АЛХИМИЧЕСКИЕ ПОЛОСКИ">
            <div className="space-y-4">
              <Bar label="Здоровье" value={75} max={100} color="blood" />
              <Bar label="Мана" value={50} max={100} color="gold" />
              <Bar label="Опыт" value={30} max={100} color="gold" />
              <Bar label="Энергия" value={90} max={100} color="blood" />
              <Bar label="Магическая сила" value={15} max={100} color="gold" />
            </div>
          </Frame>
        </div>

        {/* Слоты предметов с редкостью */}
        <Frame title="СЛОТЫ ПРЕДМЕТОВ С РЕДКОСТЬЮ">
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-3">
              <Slot icon={<span>⚔️</span>} rarity="common" />
              <Slot icon={<span>🛡️</span>} rarity="rare" />
              <Slot icon={<span>🔮</span>} rarity="epic" />
              <Slot icon={<span>💍</span>} rarity="common" />
              <Slot icon={<span>👢</span>} rarity="rare" />
              <Slot icon={<span>⛑️</span>} rarity="epic" />
            </div>
            
            <div className="grid grid-cols-6 gap-3">
              <Slot icon={<span>⚔️</span>} rarity="common" equipped />
              <Slot icon={<span>🛡️</span>} rarity="rare" equipped />
              <Slot icon={<span>🔮</span>} rarity="epic" equipped />
              <Slot icon={<span>💍</span>} rarity="common" />
              <Slot icon={<span>👢</span>} rarity="rare" />
              <Slot icon={<span>⛑️</span>} rarity="epic" />
            </div>
            
            <div className="text-center">
              <div className="medieval-caption">
                Обратите внимание на внутреннее сияние в зависимости от редкости
              </div>
            </div>
          </div>
        </Frame>
        
        {/* Инвентарь */}
        <Frame title="ИНВЕНТАРЬ">
          <Inventory 
            onItemClick={(itemId) => console.log('Clicked item:', itemId)}
            onSearch={() => console.log('Search clicked')}
            onSort={() => console.log('Sort clicked')}
          />
        </Frame>
        
        {/* Слоты экипировки */}
        <Frame title="СЛОТЫ ЭКИПИРОВКИ">
          <EquipmentSlots 
            onSlotClick={(slot) => console.log('Clicked equipment slot:', slot)}
          />
        </Frame>

        {/* Текстовые стили */}
        <Frame title="ТЕКСТОВЫЕ СТИЛИ">
          <div className="space-y-4">
            <div className="medieval-title text-3xl">Заголовок (Title)</div>
            <div className="medieval-subtitle text-xl">Подзаголовок (Subtitle)</div>
            <div className="medieval-body text-lg">Основной текст (Body)</div>
            <div className="medieval-caption text-sm">Подпись (Caption)</div>
            <div className="medieval-accent-gold text-lg">Золотой акцент</div>
            <div className="medieval-accent-blood text-lg">Красный акцент</div>
            <div className="medieval-accent-ash text-lg">Серый акцент</div>
          </div>
        </Frame>

        {/* Панели */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Frame title="Панель 1">
            <p className="medieval-body">Содержимое панели с средневековым дизайном.</p>
          </Frame>
          <Frame title="Панель 2">
            <p className="medieval-body">Еще одна панель с градиентным фоном.</p>
          </Frame>
          <Frame title="Панель 3" accent>
            <p className="medieval-body">Третья панель с красным свечением.</p>
          </Frame>
        </div>

        {/* Эффекты свечения */}
        <Frame title="ЭФФЕКТЫ СВЕЧЕНИЯ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="medieval-bg-tertiary p-4 rounded-lg shadow-glow">
              <div className="medieval-body text-center">Красное свечение</div>
            </div>
            <div className="medieval-bg-tertiary p-4 rounded-lg shadow-glow-gold">
              <div className="medieval-body text-center">Золотое свечение</div>
            </div>
            <div className="medieval-bg-tertiary p-4 rounded-lg shadow-glow-ash">
              <div className="medieval-body text-center">Серое свечение</div>
            </div>
          </div>
        </Frame>

        {/* Игровые эффекты */}
        <Frame title="ИГРОВЫЕ ЭФФЕКТЫ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="medieval-subtitle">Анимированные элементы:</h4>
              <div className="medieval-bg-tertiary p-4 rounded-lg medieval-floating">
                <div className="medieval-body text-center">Плавающий элемент</div>
              </div>
              <div className="medieval-bg-tertiary p-4 rounded-lg">
                <div className="medieval-body text-center medieval-glow-text medieval-accent-gold">Светящийся текст</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="medieval-subtitle">Интерактивные кнопки:</h4>
              <button className="medieval-button w-full">Кнопка с эффектом блика</button>
              <button className="medieval-button w-full bg-blood hover:bg-red-600">Красная кнопка</button>
              <button className="medieval-button w-full medieval-floating">Плавающая кнопка</button>
            </div>
          </div>
        </Frame>

        {/* Демонстрация состояний полосок */}
        <Frame title="СОСТОЯНИЯ ПОЛОСОК">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="medieval-subtitle mb-3">Красные полоски (Здоровье/Энергия)</h4>
                <div className="space-y-3">
                  <Bar label="Полное здоровье" value={100} max={100} color="blood" />
                  <Bar label="Ранен" value={60} max={100} color="blood" />
                  <Bar label="Критическое состояние" value={15} max={100} color="blood" />
                  <Bar label="Умирает" value={5} max={100} color="blood" />
                </div>
              </div>
              <div>
                <h4 className="medieval-subtitle mb-3">Золотые полоски (Мана/Опыт)</h4>
                <div className="space-y-3">
                  <Bar label="Полная мана" value={100} max={100} color="gold" />
                  <Bar label="Использована мана" value={40} max={100} color="gold" />
                  <Bar label="Мало маны" value={20} max={100} color="gold" />
                  <Bar label="Опыт до уровня" value={85} max={100} color="gold" />
                </div>
              </div>
            </div>
          </div>
        </Frame>

        {/* Фоновые эффекты */}
        <Frame title="ФОНОВЫЕ ЭФФЕКТЫ">
          <div className="space-y-4">
            <div className="medieval-body text-center">
              Фон содержит радиальные градиенты с красными акцентами и текстуру шума для создания атмосферы средневекового фэнтези
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="medieval-bg-tertiary p-4 rounded-lg">
                <div className="medieval-body text-center">Панель с текстурой шума</div>
              </div>
              <div className="medieval-bg-tertiary p-4 rounded-lg">
                <div className="medieval-body text-center">Панель с размытием фона</div>
              </div>
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
};

export default MedievalDesignDemo;
