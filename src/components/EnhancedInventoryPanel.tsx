import React, { useState, useMemo } from 'react';
import { Player, Item, Equipment, ItemType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getEquipmentIcon } from './EquipmentIcons';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { enhancedShopItems } from '@/data/enhancedShopItems';

interface EnhancedInventoryPanelProps {
  player: Player;
  equipment: Equipment;
  inventory: Item[];
  onEquipmentUpdate: (equipment: Equipment) => void;
  onPlayerUpdate: (player: Player) => void;
  onRemoveFromInventory: (itemId: string) => void;
  onAddToInventory: (item: Item) => void;
}

// Категории предметов как на скриншоте
const inventoryCategories = [
  { id: 'equipment', name: 'Обмундирование', icon: '⚔️' },
  { id: 'spells', name: 'Заклятия', icon: '🔮' },
  { id: 'elixirs', name: 'Эликсиры', icon: '🧪' },
  { id: 'charms', name: 'Чарки', icon: '✨' },
  { id: 'runes', name: 'Руны', icon: '🔯' },
  { id: 'food', name: 'Еда', icon: '🍖' },
  { id: 'other', name: 'Прочее', icon: '📦' },
];

const EnhancedInventoryPanel = ({ 
  player, 
  equipment, 
  inventory, 
  onEquipmentUpdate, 
  onPlayerUpdate, 
  onRemoveFromInventory,
  onAddToInventory
}: EnhancedInventoryPanelProps) => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('equipment');
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация предметов по категориям
  const getItemsByCategory = (category: string) => {
    let filteredItems = inventory;
    
    switch (category) {
      case 'equipment':
        filteredItems = inventory.filter(item => 
          ['weapon', 'armor', 'helmet', 'boots', 'gloves', 'belt', 'necklace', 'ring', 'shield', 'leggings', 'bracers', 'earring'].includes(item.type)
        );
        break;
      case 'spells':
        filteredItems = inventory.filter(item => item.type === 'spell');
        break;
      case 'elixirs':
        filteredItems = inventory.filter(item => item.type === 'elixir');
        break;
      case 'charms':
        filteredItems = inventory.filter(item => item.type === 'charm');
        break;
      case 'runes':
        filteredItems = inventory.filter(item => item.type === 'rune');
        break;
      case 'food':
        filteredItems = inventory.filter(item => item.type === 'food');
        break;
      case 'other':
        filteredItems = inventory.filter(item => 
          ['quest', 'consumable', 'material', 'misc'].includes(item.type)
        );
        break;
    }

    // Применяем поиск
    if (searchQuery) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredItems;
  };

  const currentItems = useMemo(() => getItemsByCategory(activeCategory), [inventory, activeCategory, searchQuery]);

  // Вычисляем общий вес инвентаря
  const totalWeight = useMemo(() => {
    return inventory.reduce((total, item) => {
      const weight = item.weight || 1; // По умолчанию вес 1
      return total + (weight * (item.quantity || 1));
    }, 0);
  }, [inventory]);

  const maxWeight = 568; // Максимальный вес как на скриншоте

  const handleEquip = (itemToEquip: Item) => {
    let newEquipment = { ...equipment };
    let targetSlot: keyof Equipment | null = null;

    if (itemToEquip.type === 'ring') {
      const ringSlots: (keyof Equipment)[] = ['ring1', 'ring2', 'ring3'];
      const emptySlot = ringSlots.find(slot => !newEquipment[slot]);
      targetSlot = emptySlot || 'ring1'; 
    } else {
      targetSlot = itemToEquip.type as keyof Equipment;
    }

    if (!targetSlot) {
      toast({ title: "Ошибка", description: "Неверный тип предмета", variant: "destructive" });
      return;
    }
    
    const oldItem = newEquipment[targetSlot];

    if (oldItem) {
      onAddToInventory(oldItem);
      toast({
        title: 'Предмет заменен',
        description: `${oldItem.name} возвращен в инвентарь.`,
      });
    }

    newEquipment[targetSlot] = itemToEquip;
    onEquipmentUpdate(newEquipment);
    onRemoveFromInventory(itemToEquip.id);
    
    toast({
      title: 'Экипировка надета!',
      description: `${itemToEquip.name} теперь экипирован`,
    });
  };

  const addTestItems = () => {
    const allItems = Object.values(enhancedShopItems).flat();
    const randomItems = allItems.slice(0, 12); // Увеличиваем количество для демонстрации
    
    randomItems.forEach(item => {
      onAddToInventory({
        ...item,
        id: `${item.id}_test_${Date.now()}_${Math.random()}`,
        weight: item.weight || Math.floor(Math.random() * 5) + 0.1, // Используем вес из предмета или случайный
        quantity: 1,
        durability: item.durability || { current: Math.floor(Math.random() * 50) + 1, max: 50 },
        effects: item.effects || {}
      } as any);
    });
    
    toast({
      title: 'Тестовые предметы добавлены!',
      description: 'В инвентарь добавлено 12 случайных предметов из разных категорий',
    });
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
    </div>
  );

  const getItemDetails = (item: Item) => {
    const weight = item.weight || 1;
    const durability = item.durability || { current: 50, max: 50 };
    const effects = item.effects || {};

    // Генерируем требования на основе уровня и типа предмета
    const requirements: { [key: string]: any } = {};
    if (item.levelReq) requirements['Уровень'] = item.levelReq;
    
    // Добавляем требования по характеристикам для экипировки
    if (['weapon', 'armor', 'helmet', 'boots', 'gloves', 'belt', 'necklace', 'ring', 'shield', 'leggings', 'bracers', 'earring'].includes(item.type)) {
      if (item.stats.strength) requirements['Сила'] = item.stats.strength;
      if (item.stats.dexterity) requirements['Ловкость'] = item.stats.dexterity;
      if (item.stats.endurance) requirements['Выносливость'] = item.stats.endurance;
      
      // Добавляем мастерство для оружия
      if (item.type === 'weapon' && item.weaponType) {
        const masteryMap: { [key: string]: string } = {
          'sword': 'Мастерство владения мечами',
          'axe': 'Мастерство владения топорами, секирами',
          'bow': 'Мастерство владения луками',
          'staff': 'Мастерство владения посохами'
        };
        if (masteryMap[item.weaponType]) {
          requirements[masteryMap[item.weaponType]] = Math.max(1, Math.floor((item.levelReq || 1) / 2));
        }
      }
    }

    // Генерируем эффекты на основе характеристик предмета
    const itemEffects: { [key: string]: any } = {};
    if (item.stats.attack) itemEffects['Атака'] = item.stats.attack;
    if (item.stats.defense) itemEffects['Защита'] = item.stats.defense;
    if (item.stats.health) itemEffects['Уровень жизни (НР)'] = item.stats.health;
    if (item.stats.mana) itemEffects['Мана'] = item.stats.mana;
    if (item.stats.strength) itemEffects['Сила'] = item.stats.strength;
    if (item.stats.dexterity) itemEffects['Ловкость'] = item.stats.dexterity;
    if (item.stats.luck) itemEffects['Удача'] = item.stats.luck;
    if (item.stats.criticalChance) itemEffects['Мф. критического удара (%)'] = item.stats.criticalChance;
    if (item.stats.antiCriticalChance) itemEffects['Мф. против критического удара (%)'] = item.stats.antiCriticalChance;
    if (item.stats.dodgeChance) itemEffects['Мф. увертывания (%)'] = item.stats.dodgeChance;
    if (item.stats.antiDodgeChance) itemEffects['Мф. против увертывания (%)'] = item.stats.antiDodgeChance;
    if (item.stats.blockChance) itemEffects['Мф. контрудара (%)'] = item.stats.blockChance;

    // Добавляем эффекты из предмета
    Object.assign(itemEffects, effects);

    return (
      <div className="bg-gray-700 rounded p-3 mb-2">
        <div className="flex items-start gap-3">
          {/* Иконка предмета */}
          <div className="w-12 h-12 inventory-empty-slot flex items-center justify-center flex-shrink-0">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-contain rounded" />
            ) : (
              <span className="text-lg">{getEquipmentIcon(item.name, item.type)}</span>
            )}
          </div>

          {/* Информация о предмете */}
          <div className="flex-1 min-w-0">
            <div className="text-blue-400 font-bold text-sm mb-1">{item.name}</div>
            <div className="text-gray-400 text-xs mb-1">
              (Масса: {weight}, id: {item.id})
            </div>
            <div className="text-gray-400 text-xs mb-1">Цена: {item.price} кр.</div>
            <div className="text-gray-400 text-xs mb-2">Долговечность: {durability.current}/{durability.max}</div>

            {/* Требования */}
            {Object.keys(requirements).length > 0 && (
              <div className="mb-2">
                <div className="text-gray-400 text-xs font-semibold mb-1">Требуется минимальное:</div>
                <div className="space-y-1">
                  {Object.entries(requirements).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-gray-400">• </span>
                      <span className={key.includes('Мастерство') ? 'text-red-400' : 'text-white'}>
                        {key}: {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Эффекты */}
            {Object.keys(itemEffects).length > 0 && (
              <div className="mb-2">
                <div className="text-gray-400 text-xs font-semibold mb-1">Действует на:</div>
                <div className="space-y-1">
                  {Object.entries(itemEffects).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-gray-400">• </span>
                      <span className="text-green-400">{key}: +{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Свойства предмета */}
            <div className="mb-2">
              <div className="text-gray-400 text-xs font-semibold mb-1">Свойства предмета:</div>
              <div className="space-y-1">
                {item.stats.attack && (
                  <div className="text-xs text-gray-400">• Урон: {item.stats.attack}</div>
                )}
                {item.stats.defense && (
                  <div className="text-xs text-gray-400">• Защита: {item.stats.defense}</div>
                )}
                {item.stats.blockChance && (
                  <div className="text-xs text-gray-400">• Зоны блокирования: +</div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => onRemoveFromInventory(item.id)}
              size="sm"
              variant="destructive"
              className="w-6 h-6 p-0 text-xs"
            >
              ✕
            </Button>
            {['weapon', 'armor', 'helmet', 'boots', 'gloves', 'belt', 'necklace', 'ring', 'shield', 'leggings', 'bracers', 'earring'].includes(item.type) && (
              <Button
                onClick={() => handleEquip(item)}
                size="sm"
                variant="outline"
                className="w-6 h-6 p-0 text-xs"
              >
                👤
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="panel h-full flex flex-col">
        {/* Заголовок с категориями */}
        <div className="bg-gray-700 px-3 py-2 border-b border-gray-500 flex-shrink-0">
          <h3 className="text-white font-bold text-sm text-center mb-2">ИНВЕНТАРЬ</h3>
          <div className="flex gap-1">
            {inventoryCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                variant={activeCategory === category.id ? "default" : "ghost"}
                size="sm"
                className={`text-xs px-2 py-1 h-6 ${
                  activeCategory === category.id 
                    ? 'bg-gray-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Основная панель - Предметы */}
          <div className="w-full p-3 flex flex-col">
            {/* Поиск */}
            <div className="mb-3">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите название предмета..."
                  className="bg-gray-700 border-gray-600 text-white text-sm flex-1"
                />
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="destructive"
                  size="sm"
                  className="px-2"
                >
                  ✕
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 border-gray-600 text-white"
                >
                  Искать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 border-gray-600 text-white"
                >
                  Сортировка
                </Button>
              </div>
            </div>

            {/* Список предметов */}
            <div className="flex-1 overflow-y-auto game-scrollbar">
              {currentItems.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-8">
                  {searchQuery ? 'Предметы не найдены' : 'Нет предметов в этой категории'}
                </div>
              ) : (
                <div className="space-y-2 py-0.5">
                  {currentItems.map((item) => getItemDetails(item))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedInventoryPanel;
