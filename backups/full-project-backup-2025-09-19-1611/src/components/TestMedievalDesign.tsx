import React from 'react';
import Frame from './Frame';
import { Bar } from './Bar';

const TestMedievalDesign = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="medieval-title text-5xl text-center medieval-accent-blood">
          КРОВАВЫЕ АРЕНЫ
        </h1>
        
        <Frame title="ТЕСТ СРЕДНЕВЕКОВОГО ДИЗАЙНА">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Frame title="Характеристики">
                <div className="space-y-4">
                  <Bar label="Здоровье" value={75} max={100} color="blood" />
                  <Bar label="Мана" value={50} max={100} color="gold" />
                  <Bar label="Опыт" value={30} max={100} color="gold" />
                </div>
              </Frame>
              
              <Frame title="Информация">
                <div className="space-y-2">
                  <div className="medieval-body">Имя: Тестовый Игрок</div>
                  <div className="medieval-body">Уровень: 5</div>
                  <div className="medieval-body">Класс: Воин</div>
                  <div className="medieval-accent-gold">Золото: 1000</div>
                </div>
              </Frame>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="medieval-item-slot">
                <span className="text-2xl">⚔️</span>
              </div>
              <div className="medieval-item-slot equipped">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="medieval-item-slot">
                <span className="text-2xl">⛑️</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="medieval-button">Обычная кнопка</button>
              <button className="medieval-button bg-blood hover:bg-red-600">Красная кнопка</button>
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
};

export default TestMedievalDesign;
