import React from "react";
import FixedSlot from "./FixedSlot";

export default function PaperDollExact({
  heroImg = "/art/hero.png",
}: { heroImg?: string }) {
  // Размеры (px) — как ты просила
  const S = {
    helmet:  { w: 60, h: 60 },  // Шлем
    bracer:  { w: 60, h: 60 },  // Наручи
    weapon:  { w: 60, h: 60 },  // Оружие
    armor:   { w: 60, h: 90 },  // Доспехи (чуть выше)
    belt:    { w: 60, h: 20 },  // Пояс
    earring: { w: 20, h: 20 },  // Серьги
    amulet:  { w: 60, h: 20 },  // Ожерелье/Амулет
    ring:    { w: 20, h: 20 },  // Кольцо
    glove:   { w: 60, h: 60 },  // Перчатки
    shield:  { w: 60, h: 60 },  // Щит
    greave:  { w: 60, h: 60 },  // Поножи
    boot:    { w: 60, h: 60 },  // Ботинки
  };

  // Отступ между элементами
  const GAP = 8;

  // Высота центральной сцены: подгоняем под правую колонку (самая «высокая»)
  const heroH =
    (S.earring.h + S.amulet.h + S.ring.h * 3 + S.glove.h + S.shield.h + S.greave.h + S.boot.h) +
    GAP * 7;
  const heroW = 240; // можно увеличить, если картинка крупная

  return (
    <div className="relative rounded-2xl bg-[#1b1b22]/88 ring-1 ring-[#2a2a33] p-4 md:p-5 shadow-[0_10px_28px_rgba(0,0,0,.34)]
      before:absolute before:inset-[1px] before:rounded-[14px] before:pointer-events-none
      before:ring-1 before:ring-white/5
      after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none
      after:bg-[radial-gradient(1200px_800px_at_20%_-10%,rgba(181,42,42,.08),transparent_60%),radial-gradient(1200px_800px_at_80%_110%,rgba(181,42,42,.06),transparent_60%)] after:opacity-[.35]">
      
      {/* 3 колонки: левая 60px, центр фикс., правая 60px */}
      <div
        className="grid items-start"
        style={{
          gridTemplateColumns: `${S.helmet.w}px ${heroW}px ${S.helmet.w}px`,
          columnGap: `${GAP * 2}px`,
        }}
      >
        {/* ЛЕВАЯ колонка — сверху вниз: Шлем, Наручи, Оружие, Доспехи, Пояс */}
        <div className="grid"
             style={{ rowGap: GAP, gridAutoFlow: "row" }}>
          <FixedSlot {...S.helmet}  title="Шлем" />
          <FixedSlot {...S.bracer}  title="Наручи" />
          <FixedSlot {...S.weapon}  title="Оружие" />
          <FixedSlot {...S.armor}   title="Доспехи" />
          <FixedSlot {...S.belt}    title="Пояс" />
        </div>

        {/* ЦЕНТР — сцена героя (строго прямоугольник) */}
        <div className="relative rounded-xl ring-1 ring-[#2a2a33] overflow-hidden mx-auto"
             style={{ width: heroW, height: heroH }}>
          {/* фон сцены (можно картинку ландшафта) */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(181,42,42,.18),transparent_60%)]" />
          {/* герой */}
          <div className="absolute inset-0 bg-no-repeat bg-center"
               style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "contain",
                        filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))" }} />
          {/* лёгкий блик сверху */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,.12),transparent_55%)]" />
        </div>

        {/* ПРАВАЯ колонка — сверху вниз:
            Серьги, Амулет, 3 Кольца, Перчатки, Щит, Поножи, Ботинки */}
        <div className="grid"
             style={{ rowGap: GAP, gridAutoFlow: "row" }}>
          <FixedSlot {...S.earring} title="Серьги" />
          <FixedSlot {...S.amulet}  title="Амулет" />
          <FixedSlot {...S.ring}    title="Кольцо 1" />
          <FixedSlot {...S.ring}    title="Кольцо 2" />
          <FixedSlot {...S.ring}    title="Кольцо 3" />
          <FixedSlot {...S.glove}   title="Перчатки" />
          <FixedSlot {...S.shield}  title="Щит" />
          <FixedSlot {...S.greave}  title="Поножи" />
          <FixedSlot {...S.boot}    title="Ботинки" />
        </div>
      </div>
    </div>
  );
}
