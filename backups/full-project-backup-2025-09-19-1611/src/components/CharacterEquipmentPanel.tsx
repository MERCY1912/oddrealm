import React from 'react';
import { Player, Equipment } from '@/types/game';
import { SegmentBar } from './SegmentBar';
import FixedSlot from './FixedSlot';

interface CharacterEquipmentPanelProps {
  player: Player;
  equipment?: Equipment;
  onUnequipItem?: (item: Item) => void;
}

const CharacterEquipmentPanel = ({ player, equipment = {}, onUnequipItem }: CharacterEquipmentPanelProps) => {
  console.log('CharacterEquipmentPanel - player character_image_url:', (player as any).character_image_url);
  const classNames = {
    warrior: 'Воин',
    mage: 'Маг', 
    archer: 'Лучник',
  };

  const classEmojis = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
  };

  // Размеры слотов - все одинаковой ширины для симметрии
  const S = {
    helmet:  { w: 60, h: 60 },  // Шлем 60x60px
    bracer:  { w: 60, h: 40 },  // Наручи 60x40px
    weapon:  { w: 60, h: 60 },  // Оружие 60x60px
    armor:   { w: 60, h: 80 },  // Броня 60x80px
    belt:    { w: 60, h: 40 },  // Пояс 60x40px
    earring: { w: 60, h: 20 },  // Серьги 60x20px
    amulet:  { w: 60, h: 20 },  // Амулет 60x20px
    ring1:   { w: 20, h: 20 },  // Кольцо 1 20x20px
    ring2:   { w: 20, h: 20 },  // Кольцо 2 20x20px
    ring3:   { w: 20, h: 20 },  // Кольцо 3 20x20px
    glove:   { w: 60, h: 40 },  // Перчатки 60x40px
    shield:  { w: 60, h: 60 },  // Щит 60x60px
    greave:  { w: 60, h: 80 },  // Поножи 60x80px
    boot:    { w: 60, h: 40 },  // Сапоги 60x40px
  };

  const GAP = 2; // Минимальные отступы для компактного столбика

  // Расчет высоты левой колонки (5 элементов)
  const leftColHeight =
    (S.helmet.h + S.bracer.h + S.weapon.h + S.armor.h + S.belt.h) +
    GAP * 4; // 4 отступа между 5 элементами

  // Расчет высоты правой колонки (кольца считаются как один элемент по высоте)
  const rightColHeight =
    (S.earring.h + S.amulet.h + S.ring1.h + S.glove.h + S.shield.h + S.greave.h + S.boot.h) +
    GAP * 6; // 6 отступов между 7 элементами

  // Размеры центральной сцены: 190x290px для картинки героя
  const heroH = 290; // высота центральной области
  const heroW = 190; // ширина центральной области
  const leftColWidth = 80; // ширина левой колонки
  const rightColWidth = 80; // ширина правой колонки (уравнено с левой)

  return (
    <section className="panel panel--tint panel--warm h-full flex flex-col p-6">
        {/* Заголовок */}
        <div className="text-center mb-4">
          <h3 className="font-ui text-lg font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            ПЕРСОНАЖ И ЭКИПИРОВКА
          </h3>
          <div className="medieval-subtitle text-ash/80">
            {classEmojis[player.class]} {player.username} [{player.level}]
          </div>
        </div>

        {/* Полоски HP/MP/XP */}
        <div className="space-y-3 mb-4">
          <SegmentBar
            label="Здоровье"
            value={player.health}
            max={player.maxHealth}
            color="#b52a2a"
          />
          <SegmentBar
            label="Мана"
            value={player.mana}
            max={player.maxMana}
            color="#b58b46"
          />
          <SegmentBar
            label="Опыт"
            value={player.experience}
            max={player.experienceToNext}
            color="#7c5cff"
          />
        </div>

        {/* Центральная область с персонажем и экипировкой - flex-1 для заполнения остального пространства */}
        <div className="relative flex justify-center flex-1">
          {/* 3 колонки: левая 80px, центр 190px, правая 80px */}
          <div
            className="grid items-start"
            style={{
              gridTemplateColumns: `${leftColWidth}px ${heroW}px ${rightColWidth}px`,
              columnGap: `16px 12px`,
            }}
          >
            {/* ЛЕВАЯ колонка — сверху вниз: Шлем, Наручи, Оружие, Доспехи, Пояс */}
            <div className="grid justify-start"
                 style={{ rowGap: GAP, gridAutoFlow: "row" }}>
              <FixedSlot {...S.helmet} title="Шлем" item={equipment.helmet} onUnequip={onUnequipItem} />
              <FixedSlot {...S.bracer} title="Наручи" item={equipment.bracers} onUnequip={onUnequipItem} />
              <FixedSlot {...S.weapon} title="Оружие" item={equipment.weapon} onUnequip={onUnequipItem} />
              <FixedSlot {...S.armor} title="Доспехи" item={equipment.armor} onUnequip={onUnequipItem} />
              <FixedSlot {...S.belt} title="Пояс" item={equipment.belt} onUnequip={onUnequipItem} />
            </div>

            {/* ЦЕНТР — сцена героя (строго прямоугольник) */}
            <div className="relative rounded-xl ring-1 ring-[#2a2a33] overflow-hidden mx-auto"
                 style={{ width: heroW, height: heroH }}>
              {/* фон сцены (можно картинку ландшафта) */}
              <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(181,42,42,.18),transparent_60%)]" />
              {/* герой */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a33] via-[#1b1b22] to-[#0f0f12] flex items-center justify-center">
                {(player as any).character_image_url ? (
                  <img
                    src={(player as any).character_image_url}
                    alt="Character"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-4xl opacity-60">${classEmojis[player.class]}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-4xl opacity-60">{classEmojis[player.class]}</span>
                )}
              </div>
              {/* лёгкий блик сверху */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,.12),transparent_55%)]" />
            </div>

            {/* ПРАВАЯ колонка — сверху вниз:
                Серьги, Амулет, 3 Кольца в ряд, Перчатки, Щит, Поножи, Сапоги */}
            <div className="grid justify-end"
                 style={{ rowGap: GAP, gridAutoFlow: "row" }}>
              <FixedSlot {...S.earring} title="Серьги" item={equipment.earring} onUnequip={onUnequipItem} />
              <FixedSlot {...S.amulet} title="Амулет" item={equipment.necklace} onUnequip={onUnequipItem} />
              {/* 3 кольца в ряд */}
              <div className="flex justify-end gap-0">
                <FixedSlot {...S.ring1} title="Кольцо 1" item={equipment.ring1} onUnequip={onUnequipItem} />
                <FixedSlot {...S.ring2} title="Кольцо 2" item={equipment.ring2} onUnequip={onUnequipItem} />
                <FixedSlot {...S.ring3} title="Кольцо 3" item={equipment.ring3} onUnequip={onUnequipItem} />
              </div>
              <FixedSlot {...S.glove} title="Перчатки" item={equipment.gloves} onUnequip={onUnequipItem} />
              <FixedSlot {...S.shield} title="Щит" item={equipment.shield} onUnequip={onUnequipItem} />
              <FixedSlot {...S.greave} title="Поножи" item={equipment.leggings} onUnequip={onUnequipItem} />
              <FixedSlot {...S.boot} title="Сапоги" item={equipment.boots} onUnequip={onUnequipItem} />
            </div>
          </div>
        </div>
    </section>
  );
};

export default CharacterEquipmentPanel;
