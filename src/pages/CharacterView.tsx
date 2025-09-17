import React from 'react';
import PaperDollExact from "@/components/PaperDollExact";

export default function CharacterView() {
  return (
    <div className="min-h-screen bg-ink p-4">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="font-ui text-4xl font-bold tracking-wide mb-2"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            БУМАЖНАЯ КУКЛА
          </h1>
          <p className="medieval-body text-ash/80">
            Точное расположение слотов экипировки
          </p>
        </div>

        {/* Бумажная кукла */}
        <PaperDollExact heroImg="/art/hero.png" />
        
        {/* Информация */}
        <div className="mt-8 text-center">
          <p className="medieval-body text-ash/60">
            Размеры слотов заданы жёстко в пикселях для точного соответствия дизайну
          </p>
        </div>
      </div>
    </div>
  );
}
