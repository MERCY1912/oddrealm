import React, { useState, useEffect } from 'react';
import { DungeonMap, RoomType } from '@/types/game';
import { getRoomIcon } from '@/data/dungeonGenerator';

interface DungeonMapProps {
  dungeon: DungeonMap;
  visited: Set<string>;
  current: string;
  onMove: (to: string) => void;
}

export default function DungeonMapComponent({ dungeon, visited, current, onMove }: DungeonMapProps) {
  const rooms = Object.values(dungeon.rooms);
  const [visibleRooms, setVisibleRooms] = useState<Set<string>>(new Set());

  // Отладочная информация
  console.log('DungeonMap render:', {
    dungeon,
    rooms: rooms.length,
    visited: Array.from(visited),
    current,
    visibleRooms: Array.from(visibleRooms)
  });

  // Анимация появления новых комнат
  useEffect(() => {
    const newVisibleRooms = new Set(visibleRooms);
    visited.forEach(roomId => {
      if (!visibleRooms.has(roomId)) {
        setTimeout(() => {
          setVisibleRooms(prev => new Set([...prev, roomId]));
        }, Math.random() * 500); // Случайная задержка для эффекта
      }
    });
  }, [visited, visibleRooms]);

  // Инициализация видимых комнат при первой загрузке
  useEffect(() => {
    if (dungeon && Object.keys(dungeon.rooms).length > 0) {
      const initialVisible = new Set<string>();
      // Показываем стартовую комнату и её соседей
      if (dungeon.startId) {
        initialVisible.add(dungeon.startId);
        if (dungeon.rooms[dungeon.startId]) {
          dungeon.rooms[dungeon.startId].neighbors.forEach(neighborId => {
            initialVisible.add(neighborId);
          });
        }
      }
      setVisibleRooms(initialVisible);
    }
  }, [dungeon]);

  return (
    <div className="relative w-full h-[500px] bg-neutral-900 rounded-xl p-4 border border-gray-600 overflow-hidden">
      {/* Соединения между комнатами - рисуем ПОД комнатами */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }}>
        {rooms.map(r => r.neighbors.map(n => {
          const b = dungeon.rooms[n];
          if (!b) return null;
          
          // Рисуем линию только если ID первой комнаты меньше второй (избегаем дублирования)
          if (r.id >= n) return null;
          
          // Логика отображения путей:
          // - Зеленые: пути из текущей комнаты к соседним
          // - Серые: все остальные пути (только если обе комнаты видны)
          const isFromCurrent = (current && r.id === current && dungeon.rooms[current].neighbors.includes(n));
          const isToCurrent = (current && n === current && dungeon.rooms[current].neighbors.includes(r.id));
          const isAccessible = isFromCurrent || isToCurrent;
          
          // Показываем линию только если обе комнаты видны
          const bothRoomsVisible = (visited.has(r.id) || (current && r.id === current) || (current && dungeon.rooms[current]?.neighbors.includes(r.id))) &&
                                  (visited.has(n) || (current && n === current) || (current && dungeon.rooms[current]?.neighbors.includes(n)));
          
          if (!bothRoomsVisible) return null;
          
          const strokeColor = isAccessible ? "#22c55e" : "#6b7280"; // Зеленый или серый
          const strokeOpacity = isAccessible ? 0.9 : 0.5;
          const strokeWidth = "3";
          
          return (
            <line 
              key={`${r.id}-${n}`}
              x1={r.x + 24} 
              y1={r.y + 24} 
              x2={b.x + 24} 
              y2={b.y + 24} 
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }))}
      </svg>

      {/* Комнаты - рисуем ПОВЕРХ линий */}
      {rooms.map(r => {
        const isCurrent = r.id === current;
        const isVisited = visited.has(r.id);
        const isNeighbor = current && dungeon.rooms[current] ? dungeon.rooms[current].neighbors.includes(r.id) : false;
        const isKnown = isVisited || isNeighbor;
        const canMove = isNeighbor && !isCurrent; // Можно перейти только в соседние комнаты, кроме текущей
        // Все комнаты видны, но с разной прозрачностью и стилями
        let opacity = 1;
        let bgColor = "bg-neutral-800";
        let textColor = "text-gray-400";
        
        if (isCurrent) {
          bgColor = "bg-amber-400";
          textColor = "text-black";
        } else if (isVisited) {
          bgColor = "bg-sky-700";
          textColor = "text-white";
        } else if (isKnown) {
          bgColor = "bg-gray-600";
          textColor = "text-white";
          opacity = 0.7;
        } else {
          bgColor = "bg-neutral-800";
          textColor = "text-gray-500";
          opacity = 0.3;
        }

        return (
          <button
            key={r.id}
            style={{ left: r.x, top: r.y, zIndex: 2, opacity }}
            disabled={!canMove}
            className={`
              absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
              ${bgColor} ${textColor}
              ${isCurrent ? "ring-4 ring-amber-200" : ""}
              ${canMove ? "cursor-pointer hover:ring-2 hover:ring-blue-300" : "cursor-not-allowed"}
            `}
            onClick={() => canMove && onMove(r.id)}
            title={isKnown ? `${r.type} (${r.id})` : "Неизвестная комната"}
          >
            <span className="text-lg">
              {isCurrent ? '🧭' : getRoomIcon(r.type, isKnown)}
            </span>
          </button>
        );
      })}

      {/* Легенда */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 p-2 rounded text-xs text-white">
        <div>🏁 Старт | ⚔️ Бой | ❓ Событие | ⛪ Алтарь</div>
        <div>☠️ Ловушка | 🛒 Торговец | 🗝️ Сундук | 👑 Босс</div>
        <div>❔ Неизвестно | 🔍 Секрет | 💀 Проклято | ✨ Благословено</div>
      </div>

      {/* Информация о подземелье */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 p-2 rounded text-xs text-white">
        <div className="font-bold">{dungeon.name}</div>
        <div>Уровень: {dungeon.level}</div>
        <div>Сложность: {dungeon.difficulty}</div>
        <div>Комнат: {Object.keys(dungeon.rooms).length}</div>
      </div>
    </div>
  );
}
