import React, { useState, useEffect } from 'react';
import { Player, Item } from '@/types/game';
import { normalizeItemImageUrl } from '@/utils/imageUtils';
import ItemTooltip from './ItemTooltip';

interface InventoryPanelProps {
  player: Player;
  inventory?: Item[];
  onEquipItem?: (item: Item) => void;
  onRemoveFromInventory?: (itemId: string) => void;
}

const InventoryPanel = ({ player, inventory = [], onEquipItem, onRemoveFromInventory }: InventoryPanelProps) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [sparkSlot, setSparkSlot] = useState<number | null>(null);
  const [newItemSlot, setNewItemSlot] = useState<number | null>(null);
  const [previousInventoryLength, setPreviousInventoryLength] = useState(inventory.length);

  // Отслеживаем добавление новых предметов
  useEffect(() => {
    if (inventory.length > previousInventoryLength) {
      // Новый предмет добавлен - показываем анимацию
      const newItemIndex = inventory.length - 1;
      setNewItemSlot(newItemIndex);
      setTimeout(() => setNewItemSlot(null), 2000);
    }
    setPreviousInventoryLength(inventory.length);
  }, [inventory.length, previousInventoryLength]);

  // Используем реальный инвентарь из пропсов
  const displayInventory = inventory.length > 0 ? inventory : [
    // Демо-инвентарь только если нет реальных предметов
    { id: 1, name: "Зелье лечения", type: "consumable", rarity: "common", icon: "🧪", quantity: 3 },
    { id: 2, name: "Зелье маны", type: "consumable", rarity: "common", icon: "💙", quantity: 2 },
    { id: 3, name: "Редкий камень", type: "material", rarity: "rare", icon: "💎", quantity: 1 },
    { id: 4, name: "Кожа дракона", type: "material", rarity: "epic", icon: "🐉", quantity: 1 },
    { id: 5, name: "Свиток телепортации", type: "consumable", rarity: "uncommon", icon: "📜", quantity: 1 },
    { id: 6, name: "Золотой ключ", type: "key", rarity: "rare", icon: "🗝️", quantity: 2 },
    { id: 7, name: "Яд скорпиона", type: "poison", rarity: "uncommon", icon: "🦂", quantity: 1 },
    { id: 8, name: "Руна силы", type: "rune", rarity: "rare", icon: "🔮", quantity: 1 },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 border-2';
      case 'rare': return 'border-blue-400 border-2';
      case 'epic': return 'border-purple-400 border-2';
      case 'legendary': return 'border-yellow-400 border-2';
      default: return 'border-gray-400 border-2';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consumable': return '🧪';
      case 'material': return '📦';
      case 'key': return '🗝️';
      case 'poison': return '☠️';
      case 'rune': return '🔮';
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'helmet': return '⛑️';
      case 'boots': return '👢';
      case 'gloves': return '🧤';
      case 'belt': return '🔗';
      case 'necklace': return '📿';
      case 'ring': return '💍';
      case 'shield': return '🛡️';
      case 'leggings': return '👖';
      case 'bracers': return '🦾';
      case 'earring': return '🦻';
      case 'spell': return '📜';
      case 'elixir': return '🧪';
      case 'charm': return '🔮';
      case 'food': return '🍖';
      default: return '📦';
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string | number) => {
    setDraggedItem(Number(itemId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (draggedItem !== null) {
      // Показать эффект всплеска
      setSparkSlot(slotIndex);
      setTimeout(() => setSparkSlot(null), 300);
      
      // Здесь будет логика перемещения предмета
      console.log(`Moving item ${draggedItem} to slot ${slotIndex}`);
    }
    
    setDraggedItem(null);
  };

  const handleItemClick = (item: Item | { id: number; name: string; type: string; rarity: string; icon: string; quantity: number; }) => {
    if (onEquipItem && onRemoveFromInventory && 'stats' in item && 'price' in item && 'description' in item) {
      // Экипируем предмет только если это полный объект Item
      onEquipItem(item as Item);
      // Удаляем из инвентаря
      onRemoveFromInventory(item.id);
    }
  };

  return (
    <section className="panel panel--tint h-full flex flex-col">
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-xl font-bold text-white mb-2 text-center">
          ИНВЕНТАРЬ
        </h2>
        <p className="text-xs text-gray-400 text-center mb-4">
          Нажмите на предмет, чтобы экипировать
        </p>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2 py-0.5">
            {Array.from({ length: 24 }, (_, index) => {
              const item = displayInventory[index];
              const isDragOver = dragOverSlot === index;
              const isSpark = sparkSlot === index;
              const isDragged = draggedItem === item?.id;
              const isNewItem = newItemSlot === index;
              
              const slotElement = (
                <div 
                  key={index}
                  draggable={!!item}
                  onDragStart={(e) => item && handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => item && handleItemClick(item)}
                  className={`inventory-empty-slot aspect-square cursor-pointer flex flex-col items-center justify-center p-1 relative rounded-lg transition-all duration-200 ${
                    item ? getRarityColor(item.rarity) : 'border-gray-600 border-2'
                  } ${
                    isDragOver ? 'outline outline-2 outline-amber-300/60' : ''
                  } ${
                    isSpark ? 'animate-spark' : ''
                  } ${
                    isDragged ? 'opacity-50' : ''
                  } ${
                    isNewItem ? 'animate-pulse bg-green-500/20 border-green-400' : ''
                  } ${
                    item ? 'hover:shadow-lg hover:shadow-blue-500/20' : ''
                  }`}
                  title={item ? `Нажмите, чтобы экипировать: ${item.name} (${item.rarity})` : 'Пустой слот'}
                >
                  {item ? (
                    <>
                      {'image_url' in item && item.image_url ? (
                        <img
                          src={normalizeItemImageUrl(item.image_url) || item.image_url}
                          alt={item.name || 'Предмет'}
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            console.error('Image failed to load in InventoryPanel:', item.image_url, 'for item:', item.name);
                            console.error('Normalized URL:', normalizeItemImageUrl(item.image_url));
                            console.error('Error details:', e);
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const emojiDiv = document.createElement('div');
                              emojiDiv.className = 'text-lg mb-1';
                              emojiDiv.textContent = getTypeIcon(item.type);
                              parent.appendChild(emojiDiv);
                            }
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully in InventoryPanel:', item.image_url, 'for item:', item.name);
                          }}
                        />
                      ) : (
                        <div className="text-lg mb-1">{getTypeIcon(item.type)}</div>
                      )}
                      {'quantity' in item && item.quantity && item.quantity > 1 && (
                        <div className="text-xs text-gray-400 absolute bottom-0 right-0 bg-black/50 rounded px-1">
                          {item.quantity}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-600 text-xs">•</div>
                  )}
                </div>
              );

              // Обертываем в тултип только если есть предмет
              if (item && 'stats' in item && 'price' in item && 'description' in item) {
                return (
                  <ItemTooltip key={index} item={item as Item} side="top">
                    {slotElement}
                  </ItemTooltip>
                );
              }

              return slotElement;
            })}
          </div>
        </div>
        
        {/* Информация об инвентаре */}
        <div className="mt-4 p-3 panel">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Предметов:</span>
            <span className="text-white font-bold">{displayInventory.length}</span>
              </div>
          <div className="flex justify-between text-sm text-gray-300 mt-1">
            <span>Слоты:</span>
            <span className="text-white font-bold">{displayInventory.length}/24</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPanel;