import React from 'react';
import OrnateFrame from './OrnateFrame';
import { InventorySlot } from './InventorySlot';

interface InventoryProps {
  items?: Array<{
    id: string;
    icon: React.ReactNode;
    rarity: "common" | "rare" | "epic" | "legend";
    name?: string;
    equipped?: boolean;
  }>;
  onItemClick?: (itemId: string) => void;
  onSearch?: () => void;
  onSort?: () => void;
}

function Inventory({ 
  items = [], 
  onItemClick, 
  onSearch, 
  onSort 
}: InventoryProps) {
  // Если нет предметов, создаем пустые слоты
  const slots = items.length > 0 ? items : Array.from({ length: 18 }, (_, i) => ({
    id: `empty-${i}`,
    icon: <span className="text-ash/70">◆</span>,
    rarity: i % 10 === 0 ? "legend" : i % 7 === 0 ? "epic" : i % 3 === 0 ? "rare" : "common" as "common" | "rare" | "epic" | "legend",
    name: `Пустой слот ${i + 1}`,
    equipped: false
  }));

  return (
    <OrnateFrame title="ИНВЕНТАРЬ" variant="epic" colorClass="text-amber-300">
      <div className="space-y-4">
        {/* Сетка предметов */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 py-0.5">
          {slots.map((item, i) => (
            <InventorySlot 
              key={item.id || i}
              icon={item.icon}
              rarity={item.rarity}
            />
          ))}
        </div>
        
        {/* Кнопки управления */}
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui"
            onClick={onSearch}
          >
            ИСКАТЬ
          </button>
          <button 
            className="px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui"
            onClick={onSort}
          >
            СОРТИРОВКА
          </button>
        </div>
      </div>
    </OrnateFrame>
  );
}

export default Inventory;
