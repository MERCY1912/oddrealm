import React, { useState } from 'react';
import { Item } from '@/types/game';
import { questItems, shopItems } from '@/data/gameData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEquipmentIcon } from './EquipmentIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const InventoryDemo = () => {
  const [inventory, setInventory] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'equipment' | 'quest'>('equipment');

  // Фильтрация предметов по типу
  const equipmentItems = inventory.filter(item => 
    ['weapon', 'armor', 'helmet', 'boots', 'gloves', 'belt', 'necklace', 'ring', 'shield', 'leggings', 'bracers', 'earring'].includes(item.type)
  );

  const questItemsFiltered = inventory.filter(item => 
    ['quest', 'consumable', 'material'].includes(item.type)
  );

  const addRandomEquipment = () => {
    const randomItem = shopItems[Math.floor(Math.random() * shopItems.length)];
    setInventory(prev => [...prev, { ...randomItem, id: `${randomItem.id}_${Date.now()}` }]);
  };

  const addRandomQuestItem = () => {
    const randomItem = questItems[Math.floor(Math.random() * questItems.length)];
    setInventory(prev => [...prev, { ...randomItem, id: `${randomItem.id}_${Date.now()}` }]);
  };

  const clearInventory = () => {
    setInventory([]);
  };

  const getItemTooltip = (item: Item) => (
    <div className="p-3 max-w-xs">
      <div className="font-bold text-yellow-300 mb-2">{item.name}</div>
      <div className="text-sm text-gray-300 mb-2">{item.description}</div>
      
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-400">Характеристики:</div>
        {item.stats.attack && <div className="text-red-400 text-xs">⚔️ Атака: +{item.stats.attack}</div>}
        {item.stats.defense && <div className="text-blue-400 text-xs">🛡️ Защита: +{item.stats.defense}</div>}
        {item.stats.health && <div className="text-green-400 text-xs">❤️ Здоровье: +{item.stats.health}</div>}
        {item.stats.mana && <div className="text-purple-400 text-xs">🔮 Мана: +{item.stats.mana}</div>}
      </div>
      
      {item.price > 0 && (
        <div className="text-yellow-200 text-xs mt-2">Цена: {item.price} золота</div>
      )}
    </div>
  );

  const ItemGrid = ({ items }: { items: Item[] }) => (
    <div className="flex-1 overflow-y-auto">
      {items.length === 0 ? (
        <div className="text-gray-500 text-center text-xs pt-10">
          {activeTab === 'equipment' ? 'Нет экипировки в инвентаре' : 'Нет квестовых предметов'}
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-2 auto-rows-min py-0.5">
          {items.map((item, index) => (
            <Tooltip key={`${item.id}-${index}`}>
              <TooltipTrigger asChild>
                <div className="relative w-12 h-12 inventory-empty-slot cursor-pointer hover:border-yellow-500 transition-colors group">
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <span className="text-base">{getEquipmentIcon(item.name, item.type)}</span>
                  </div>
                  
                  {/* Rarity border overlay */}
                  <div className={`absolute inset-0 border-2 rounded pointer-events-none ${
                    item.rarity === 'legendary' ? 'border-yellow-400' :
                    item.rarity === 'epic' ? 'border-purple-400' :
                    item.rarity === 'rare' ? 'border-blue-400' : 'border-transparent'
                  }`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900/95 backdrop-blur-sm border border-gray-500/50 text-white shadow-xl">
                {getItemTooltip(item)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="panel p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-white font-bold text-lg mb-4 text-center">Демонстрация системы инвентаря</h2>
        
        <div className="flex gap-2 justify-center mb-4">
          <Button onClick={addRandomEquipment} variant="outline" size="sm">
            Добавить экипировку
          </Button>
          <Button onClick={addRandomQuestItem} variant="outline" size="sm">
            Добавить квестовый предмет
          </Button>
          <Button onClick={clearInventory} variant="destructive" size="sm">
            Очистить инвентарь
          </Button>
        </div>

        <div className="text-center text-sm text-gray-300 mb-4">
          Всего предметов: {inventory.length} | Экипировка: {equipmentItems.length} | Квестовые: {questItemsFiltered.length}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'equipment' | 'quest')} className="flex flex-col h-96">
        <TabsList className="grid w-full grid-cols-2 bg-gray-700 mb-3">
          <TabsTrigger 
            value="equipment" 
            className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Экипировка ({equipmentItems.length})
          </TabsTrigger>
          <TabsTrigger 
            value="quest" 
            className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Квесты ({questItemsFiltered.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="equipment" className="flex-1 mt-0">
          <ItemGrid items={equipmentItems} />
        </TabsContent>
        
        <TabsContent value="quest" className="flex-1 mt-0">
          <ItemGrid items={questItemsFiltered} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDemo;

