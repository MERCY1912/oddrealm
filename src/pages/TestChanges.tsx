import React from 'react';
import AmbientLight from '@/components/AmbientLight';
import HeroCard from '@/components/HeroCard';
import { SegmentBar } from '@/components/SegmentBar';
import { InventorySlot } from '@/components/InventorySlot';
import OrnateFrame from '@/components/OrnateFrame';

export default function TestChanges() {
  return (
    <div className="min-h-screen bg-ink p-4">
      <AmbientLight />
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Заголовок с градиентом */}
        <h1 className="font-ui text-4xl font-bold tracking-wide text-center"
            style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
          ТЕСТ ИЗМЕНЕНИЙ
        </h1>

        {/* HeroCard */}
        <div className="flex justify-center">
          <HeroCard />
        </div>

        {/* SegmentBar */}
        <div className="max-w-md mx-auto space-y-4">
          <SegmentBar label="Здоровье" value={180} max={180} color="#b52a2a" />
          <SegmentBar label="Мана" value={95} max={95} color="#b58b46" />
          <SegmentBar label="Опыт" value={45} max={800} color="#7c5cff" />
        </div>

        {/* OrnateFrame с разными тонами */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OrnateFrame title="EPIC ТОН" tone="epic" corners={4}>
            <p className="medieval-body">Эпическая панель с 4 углами</p>
          </OrnateFrame>
          
          <OrnateFrame title="ACCENT ТОН" tone="accent" corners={2}>
            <p className="medieval-body">Акцентная панель с 2 углами</p>
          </OrnateFrame>
          
          <OrnateFrame title="MUTED ТОН" tone="muted" corners={0}>
            <p className="medieval-body">Приглушенная панель без углов</p>
          </OrnateFrame>
        </div>

        {/* InventorySlot с разными редкостями */}
        <div className="flex justify-center gap-4">
          <InventorySlot rarity="common" icon={<span>⚔️</span>} />
          <InventorySlot rarity="rare" icon={<span>🛡️</span>} />
          <InventorySlot rarity="epic" icon={<span>🔮</span>} />
          <InventorySlot rarity="legend" icon={<span>👑</span>} />
        </div>

        {/* Кнопки с эмбоссом */}
        <div className="flex justify-center gap-4">
          <button className="px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui">
            КНОПКА 1
          </button>
          <button className="px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui">
            КНОПКА 2
          </button>
        </div>
      </div>
    </div>
  );
}
