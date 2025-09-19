import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Player, DungeonEvent, Item } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { dungeonMaterials } from '@/data/dungeonItems';
import { normalizeItemImageUrl } from '@/utils/imageUtils';

interface TreasureChestProps {
  player: Player;
  event: DungeonEvent;
  onEventComplete: (effects: any) => void;
  onSkip: () => void;
  onAddToInventory?: (item: Item) => void;
}

const TreasureChest = ({ player, event, onEventComplete, onSkip, onAddToInventory }: TreasureChestProps) => {
  const [chestState, setChestState] = useState<'closed' | 'opened' | 'completed'>('closed');
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const { toast } = useToast();

  // Fallback event data if event is null
  const eventData = event || {
    event_id: 'treasure_chest',
    name: 'Сундук с Сокровищами',
    description: 'Вы нашли старый сундук, покрытый пылью веков.',
    event_type: 'treasure',
    effects: { 
      gold: 100, 
      exp: 50,
      items: []
    }
  };

  // Генерируем случайные предметы для сундука
  const generateTreasureItems = (): Item[] => {
    const items: Item[] = [];
    const itemCount = Math.random() < 0.5 ? 2 : 3; // 2 или 3 предмета
    
    for (let i = 0; i < itemCount; i++) {
      const randomMaterial = dungeonMaterials[Math.floor(Math.random() * dungeonMaterials.length)];
      if (randomMaterial) {
        items.push({
          ...randomMaterial,
          id: `${randomMaterial.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
    
    return items;
  };

  const [treasureItems] = useState<Item[]>(generateTreasureItems());

  const handleOpenChest = () => {
    setChestState('opened');
    toast({
      title: 'Сундук открыт!',
      description: 'Выберите предметы, которые хотите взять',
    });
  };

  const handleItemClick = (item: Item) => {
    if (selectedItems.find(selected => selected.id === item.id)) {
      // Убираем предмет из выбранных
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      // Добавляем предмет в выбранные
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleTakeItems = () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Ничего не выбрано',
        description: 'Выберите хотя бы один предмет',
        variant: 'destructive',
      });
      return;
    }

    // Добавляем выбранные предметы в инвентарь
    selectedItems.forEach(item => {
      if (onAddToInventory) {
        onAddToInventory(item);
      }
    });

    // Показываем уведомление
    toast({
      title: 'Предметы взяты!',
      description: `Получено: ${selectedItems.map(item => item.name).join(', ')}`,
    });

    setChestState('completed');
    
    // Завершаем событие
    onEventComplete({
      gold: eventData.effects.gold || 0,
      exp: eventData.effects.exp || 0,
      items: selectedItems.map(item => item.id)
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material': return '⚒️';
      case 'ore': return '⛏️';
      case 'crystal': return '💎';
      case 'essence': return '✨';
      default: return '📦';
    }
  };

  if (chestState === 'closed') {
    return (
      <Card className="bg-gray-800 bg-opacity-80 border-gray-600 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            🗝️ {eventData.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-gray-300 text-lg">
            {eventData.description}
          </div>
          
          <div className="text-yellow-400 text-xl">
            💰 {eventData.effects.gold || 0} золота | ⭐ {eventData.effects.exp || 0} опыта
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleOpenChest}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-lg"
            >
              🗝️ Открыть сундук
            </Button>
            <Button
              onClick={onSkip}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-lg"
            >
              Пропустить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chestState === 'opened') {
    return (
      <Card className="bg-gray-800 bg-opacity-80 border-gray-600 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            🗝️ Сундук открыт!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-gray-300">
            Выберите предметы, которые хотите взять (максимум {treasureItems.length})
          </div>
          
          {/* Сетка предметов 2x2 */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {treasureItems.map((item, index) => {
              const isSelected = selectedItems.find(selected => selected.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-yellow-400 bg-yellow-900 bg-opacity-30' 
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }
                  `}
                >
                  {/* Иконка предмета */}
                  <div className="text-center mb-2">
                    {item.image_url ? (
                      <img
                        src={normalizeItemImageUrl(item.image_url) || item.image_url}
                        alt={item.name}
                        className="w-12 h-12 mx-auto object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const emojiDiv = document.createElement('div');
                            emojiDiv.className = 'text-2xl';
                            emojiDiv.textContent = getTypeIcon(item.type);
                            parent.appendChild(emojiDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>
                    )}
                  </div>
                  
                  {/* Название предмета */}
                  <div className="text-center text-white font-bold text-sm mb-1">
                    {item.name}
                  </div>
                  
                  {/* Редкость */}
                  <div className={`text-center text-xs ${
                    item.rarity === 'common' ? 'text-gray-300' :
                    item.rarity === 'rare' ? 'text-blue-400' :
                    item.rarity === 'epic' ? 'text-purple-400' :
                    'text-yellow-400'
                  }`}>
                    {item.rarity === 'common' ? 'Обычный' :
                     item.rarity === 'rare' ? 'Редкий' :
                     item.rarity === 'epic' ? 'Эпический' :
                     'Легендарный'}
                  </div>
                  
                  {/* Цена */}
                  <div className="text-center text-yellow-400 text-xs">
                    💰 {item.price}
                  </div>
                  
                  {/* Индикатор выбора */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-yellow-400 text-lg">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Кнопки действий */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleTakeItems}
              disabled={selectedItems.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg disabled:bg-gray-600"
            >
              📦 Взять выбранное ({selectedItems.length})
            </Button>
            <Button
              onClick={onSkip}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-lg"
            >
              Пропустить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chestState === 'completed') {
    return (
      <Card className="bg-gray-800 bg-opacity-80 border-gray-600 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            ✅ Сундук опустошен
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-green-400 text-lg">
            Вы взяли {selectedItems.length} предметов из сундука!
          </div>
          
          <Button
            onClick={onSkip}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            Продолжить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TreasureChest;
