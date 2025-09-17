import React from 'react';
import OrnateFrame from './OrnateFrame';
import { Bar } from './Bar';
import Inventory from './Inventory';

const CharacterScreen = () => {
  const attributes = [
    { name: "Сила", value: 15, bonus: "+7" },
    { name: "Ловкость", value: 12, bonus: "+3" },
    { name: "Интуиция", value: 9, bonus: "+1" },
    { name: "Выносливость", value: 10, bonus: "+2" },
    { name: "Магия", value: 0, bonus: "+0" }
  ];

  const resistances = [
    { name: "Огню", value: 0 },
    { name: "Холоду", value: 5 },
    { name: "Яду", value: 10 },
    { name: "Тьме", value: 0 },
    { name: "Свету", value: 15 },
    { name: "Физ.ур.", value: 20 }
  ];

  const characterInfo = {
    name: "Алдрик Железный",
    class: "Воин",
    level: 15,
    health: 183,
    maxHealth: 183,
    mana: 41,
    maxMana: 100,
    experience: 1250,
    experienceToNext: 2000
  };

  return (
    <div className="min-h-screen bg-ink p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid md:grid-cols-[340px,1fr,380px] gap-6">
                    {/* Атрибуты */}
                    <OrnateFrame title="АТРИБУТЫ" variant="base" colorClass="text-gold">
            <div className="space-y-3">
              <div className="medieval-caption text-center mb-3">
                Базовые характеристики
              </div>
              <ul className="space-y-2 text-sm">
                {attributes.map((attr, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="medieval-text-primary">{attr.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ash/90">{attr.value}</span>
                      <span className="medieval-accent-gold text-xs">{attr.bonus}</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-stone/30">
                <div className="medieval-caption text-center mb-2">
                  Свободные очки: 0
                </div>
                <div className="text-xs text-ash/60 text-center">
                  Повысьте уровень для получения новых очков
                </div>
              </div>
            </div>
          </OrnateFrame>

                    {/* Персонаж */}
                    <OrnateFrame title="ПЕРСОНАЖ" variant="strong" colorClass="text-gold" edges>
            <div className="space-y-4">
              {/* Информация о персонаже */}
              <div className="text-center mb-4">
                <h2 className="medieval-title text-2xl mb-1">{characterInfo.name}</h2>
                <div className="medieval-subtitle">{characterInfo.class} • Уровень {characterInfo.level}</div>
              </div>
              
              {/* Полоски здоровья и маны */}
              <Bar label="Здоровье" value={characterInfo.health} max={characterInfo.maxHealth} color="blood" />
              <Bar label="Мана" value={characterInfo.mana} max={characterInfo.maxMana} color="gold" />
              <Bar label="Опыт" value={characterInfo.experience} max={characterInfo.experienceToNext} color="gold" />
              
              {/* Портрет персонажа */}
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-stone/20 to-iron/40 ring-1 ring-stone/70 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-stone/10 to-stone/20"></div>
                <div className="text-center relative z-10">
                  <div className="text-6xl mb-2 medieval-floating">⚔️</div>
                  <div className="medieval-subtitle">{characterInfo.class}</div>
                  <div className="medieval-caption">Уровень {characterInfo.level}</div>
                </div>
              </div>
              
              {/* Статистики */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center medieval-bg-tertiary rounded-lg p-3">
                  <div className="medieval-accent-blood text-xl font-bold">46</div>
                  <div className="medieval-caption text-xs">⚔️ Атака</div>
                </div>
                <div className="text-center medieval-bg-tertiary rounded-lg p-3">
                  <div className="medieval-accent-gold text-xl font-bold">23</div>
                  <div className="medieval-caption text-xs">🛡️ Защита</div>
                </div>
              </div>
            </div>
          </OrnateFrame>

          {/* Инвентарь */}
          <Inventory 
            onItemClick={(itemId) => console.log('Clicked item:', itemId)}
            onSearch={() => console.log('Search clicked')}
            onSort={() => console.log('Sort clicked')}
          />
        </div>

        {/* Сопротивления */}
        <OrnateFrame title="СОПРОТИВЛЕНИЯ" variant="base" colorClass="text-gold">
          <div className="space-y-4">
            <div className="medieval-caption text-center mb-3">
              Защита от различных типов урона
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {resistances.map((resistance) => (
                <div key={resistance.name} className="flex justify-between items-center medieval-bg-tertiary rounded-lg p-3">
                  <span className="medieval-text-primary">{resistance.name}</span>
                  <span className={`font-bold ${resistance.value > 0 ? 'medieval-accent-gold' : 'text-ash/80'}`}>
                    {resistance.value}%
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-stone/30">
              <div className="text-xs text-ash/60 text-center">
                Сопротивления можно увеличить с помощью экипировки и заклинаний
              </div>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default CharacterScreen;
