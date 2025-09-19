import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Player, Item, WeaponType, ItemRarity } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shopCategories, weaponSubcategories } from '@/data/enhancedShopItems';
import { useToast } from '@/hooks/use-toast';
import { fetchShopItems } from '@/data/shopApi';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ItemTooltip from './ItemTooltip';

interface EnhancedShopProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onAddToInventory: (item: Item) => void;
}

const EnhancedShop = ({ player, onPlayerUpdate, onAddToInventory }: EnhancedShopProps) => {
  const [activeCategory, setActiveCategory] = useState('weapon');
  const [activeSubcategory, setActiveSubcategory] = useState('sword');
  const [sortBy, setSortBy] = useState<'level' | 'price' | 'rarity' | 'name'>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRarity, setFilterRarity] = useState<ItemRarity | 'all'>('all');
  const { toast } = useToast();
  
  const { data: shopItems = [], isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: fetchShopItems,
  });

  // Добавляем отладочную информацию
  useEffect(() => {
    console.log('Shop items loaded:', shopItems);
    console.log('Items count:', shopItems.length);
    if (shopItems.length > 0) {
      console.log('Sample item:', shopItems[0]);
      const weaponItems = shopItems.filter(item => item.type === 'weapon');
      console.log('Weapon items:', weaponItems);
      weaponItems.forEach(item => {
        console.log(`Weapon: ${item.name}, weaponType: ${item.weaponType}`);
      });
    }
  }, [shopItems]);

  useEffect(() => {
    console.log('Active category:', activeCategory, 'Active subcategory:', activeSubcategory);
  }, [activeCategory, activeSubcategory]);

  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500',
  };

  const rarityNames = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное',
  };

  const weaponTypeNames: Record<WeaponType, string> = {
    sword: 'Меч',
    axe: 'Топор',
    bow: 'Лук',
    staff: 'Посох',
    dagger: 'Кинжал',
    mace: 'Булава',
  };

  const buyItem = async (item: Item) => {
    if (player.gold < item.price) {
      toast({
        title: "Недостаточно золота",
        description: `Вам нужно ${item.price} золота для покупки этого предмета.`,
        variant: "destructive",
      });
      return;
    }

    // Проверяем требования к уровню
    if (item.levelReq && player.level < item.levelReq) {
      toast({
        title: "Недостаточный уровень",
        description: `Для покупки этого предмета требуется ${item.levelReq} уровень.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Логируем предмет перед покупкой
      if (item.name && item.name.includes('холодной')) {
        console.log('EnhancedShop buyItem: Buying "Величие холодной стали":', {
          item,
          image_url: item.image_url,
          rarity: item.rarity,
          type: item.type
        });
      }

      // Обновляем золото игрока
      const updatedPlayer: Player = {
        ...player,
        gold: player.gold - item.price,
      };

      onPlayerUpdate(updatedPlayer);
      
      // Добавляем предмет в инвентарь
      if (onAddToInventory) {
        console.log('EnhancedShop buyItem: Calling onAddToInventory with item:', item);
        await onAddToInventory(item);
      }
      
      toast({
        title: "✅ Покупка успешна!",
        description: `${item.name} добавлен в инвентарь`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error buying item:', error);
      toast({
        title: "Ошибка покупки",
        description: "Не удалось купить предмет. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const getItemIcon = (item: Item) => {
    const icons: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      helmet: '⛑️',
      boots: '👢',
      gloves: '🧤',
      ring: '💍',
      necklace: '📿',
      belt: '🔗',
      shield: '🛡️',
      leggings: '👖',
    };
    return icons[item.type] || '📦';
  };

  const getCurrentItems = () => {
    if (!shopItems) return [];
    
    let items: Item[] = [];
    
    // Фильтрация по категории
    if (activeCategory === 'weapon') {
      const weaponTypeMapping: Record<string, WeaponType> = {
        'sword': 'sword',
        'axe': 'axe', 
        'bow': 'bow',
        'staff': 'staff',
      };
      
      const targetWeaponType = weaponTypeMapping[activeSubcategory];
      items = shopItems.filter(item => {
        const isWeapon = item.type === 'weapon';
        const hasCorrectWeaponType = item.weaponType === targetWeaponType;
        return isWeapon && hasCorrectWeaponType;
      });
    } else if (activeCategory === 'armor') {
      // Группируем все виды брони
      items = shopItems.filter(item => 
        ['armor', 'helmet', 'boots', 'gloves', 'belt', 'shield', 'bracers', 'leggings'].includes(item.type)
      );
    } else if (activeCategory === 'accessories') {
      // Группируем аксессуары
      items = shopItems.filter(item => 
        ['ring', 'necklace', 'earring'].includes(item.type)
      );
    } else if (activeCategory === 'consumables') {
      // Группируем расходники
      items = shopItems.filter(item => 
        ['spell', 'elixir', 'charm', 'rune', 'food', 'consumable'].includes(item.type)
      );
    } else {
      items = shopItems.filter(item => item.type === activeCategory);
    }
    
    // Фильтрация по редкости
    if (filterRarity !== 'all') {
      items = items.filter(item => item.rarity === filterRarity);
    }
    
    // Сортировка
    return items.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'level':
          const levelA = a.levelReq || 0;
          const levelB = b.levelReq || 0;
          comparison = levelA - levelB;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rarity':
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'weapon') {
      setActiveSubcategory('sword');
    }
  };

  // Расширенные категории
  const extendedCategories = [
    { id: 'weapon', name: 'Оружие', icon: '⚔️' },
    { id: 'armor', name: 'Доспехи', icon: '🛡️' },
    { id: 'accessories', name: 'Аксессуары', icon: '💍' },
    { id: 'consumables', name: 'Свитки и зелья', icon: '🧪' },
  ];

  return (
    <div className="space-y-4">
      <Card className="panel text-white border-yellow-600">
        <CardHeader>
          <CardTitle className="text-center text-yellow-400">🏪 МАГАЗИН</CardTitle>
          <div className="text-center text-yellow-300">
            💰 У вас: {player.gold} золота
          </div>
        </CardHeader>
        <CardContent>
          {/* Основные категории */}
          <div className="flex flex-wrap gap-2 mb-4">
            {extendedCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                variant={activeCategory === category.id ? "default" : "outline"}
                className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none min-w-0"
              >
                <span className="hidden sm:inline">{category.icon} </span>
                <span className="truncate">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Подкатегории для оружия */}
          {activeCategory === 'weapon' && (
            <div className="flex flex-wrap gap-2 mb-4 border-t border-gray-600 pt-4">
              {weaponSubcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  onClick={() => setActiveSubcategory(subcategory.id)}
                  variant={activeSubcategory === subcategory.id ? "default" : "outline"}
                  className="text-xs flex-1 sm:flex-none min-w-0"
                  size="sm"
                >
                  <span className="hidden sm:inline">{subcategory.icon} </span>
                  <span className="truncate">{subcategory.name}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Элементы управления сортировкой и фильтрацией */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 border-t border-gray-600 pt-4">
            {/* Сортировка */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-300 whitespace-nowrap">Сортировка:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="flex-1 sm:w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="level">По уровню</SelectItem>
                  <SelectItem value="price">По цене</SelectItem>
                  <SelectItem value="rarity">По редкости</SelectItem>
                  <SelectItem value="name">По имени</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                variant="outline"
                size="sm"
                className="text-xs flex-shrink-0"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* Фильтр по редкости */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-300 whitespace-nowrap">Редкость:</span>
              <Select value={filterRarity} onValueChange={(value: any) => setFilterRarity(value)}>
                <SelectTrigger className="flex-1 sm:w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="common">Обычные</SelectItem>
                  <SelectItem value="rare">Редкие</SelectItem>
                  <SelectItem value="epic">Эпические</SelectItem>
                  <SelectItem value="legendary">Легендарные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Счетчик предметов */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <span className="text-sm text-gray-300">
                Найдено: {getCurrentItems().length} предметов
              </span>
            </div>
          </div>

          {/* Товары в виде таблицы */}
          <div className="max-h-[600px] overflow-y-auto game-scrollbar">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full bg-gray-700" />)}
            
            {!isLoading && getCurrentItems().length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📦</div>
                <p>В этой категории пока нет предметов</p>
              </div>
            )}
            
            {!isLoading && getCurrentItems().length > 0 && (
              <div className="space-y-2">
                {/* Заголовок таблицы - скрыт на мобильных */}
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-800 rounded-lg text-sm font-medium text-gray-300">
                  <div className="col-span-1">Иконка</div>
                  <div className="col-span-6">Название и характеристики</div>
                  <div className="col-span-2">Редкость</div>
                  <div className="col-span-1">Уровень</div>
                  <div className="col-span-1">Цена</div>
                  <div className="col-span-1">Действие</div>
                </div>
                
                {/* Строки предметов */}
                {getCurrentItems().map((item) => (
                  <div key={item.id}>
                    {/* Десктопная версия */}
                    <ItemTooltip item={item} side="top">
                      <div className="hidden sm:grid grid-cols-12 gap-4 p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors items-start cursor-pointer min-h-[200px]">
                    {/* Иконка */}
                    <div className="col-span-1">
                      <div className="w-16 h-16 text-3xl bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          getItemIcon(item)
                        )}
                      </div>
                    </div>
                    
                    {/* Название и характеристики */}
                    <div className="col-span-6">
                      <div className="font-bold text-white text-lg mb-2">{item.name}</div>
                      <div className="text-sm text-gray-300 mb-3">{item.description}</div>
                      
                      {/* Основная информация списком */}
                      <div className="space-y-1 text-sm mb-3">
                        {item.weight && (
                          <div className="text-gray-400">
                            ⚖️ Вес: {item.weight}
                          </div>
                        )}
                        {item.durability && (
                          <div className="text-yellow-400">
                            🛡️ Прочность: {item.durability.current}/{item.durability.max}
                          </div>
                        )}
                      {item.requirements && (
                          <div className="text-red-400">
                          📋 {item.requirements}
                        </div>
                      )}
                      </div>

                      {/* Характеристики */}
                      <div className="space-y-2">
                        {/* Основные характеристики */}
                        <div>
                          <div className="text-sm font-semibold text-blue-400 mb-1">Основные характеристики:</div>
                          <div className="space-y-1">
                            {Object.entries(item.stats).filter(([stat, value]) => 
                              value && value !== 0 && ['attack', 'defense', 'health', 'mana'].includes(stat)
                            ).map(([stat, value]) => {
                              const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                attack: { label: 'Атака', color: 'text-red-400', icon: '⚔️'},
                                defense: { label: 'Защита', color: 'text-blue-400', icon: '🛡️'},
                                health: { label: 'Здоровье', color: 'text-green-400', icon: '❤️'},
                                mana: { label: 'Мана', color: 'text-purple-400', icon: '🔮'},
                              };
                              return (
                                <div key={stat} className={`text-sm ${statsMap[stat].color} flex items-center gap-2`}>
                                  <span>{statsMap[stat].icon}</span>
                                  <span>{statsMap[stat].label}: +{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Атрибуты */}
                        <div>
                          <div className="text-sm font-semibold text-orange-400 mb-1">Атрибуты:</div>
                          <div className="space-y-1">
                            {Object.entries(item.stats).filter(([stat, value]) => 
                              value && value !== 0 && ['strength', 'dexterity', 'luck', 'endurance', 'magic', 'intuition'].includes(stat)
                            ).map(([stat, value]) => {
                              const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                strength: { label: 'Сила', color: 'text-orange-400', icon: '💪'},
                                dexterity: { label: 'Ловкость', color: 'text-cyan-400', icon: '🤸'},
                                luck: { label: 'Удача', color: 'text-yellow-400', icon: '🍀'},
                                endurance: { label: 'Выносливость', color: 'text-amber-400', icon: '🏃'},
                                magic: { label: 'Магия', color: 'text-indigo-400', icon: '🧙'},
                                intuition: { label: 'Интуиция', color: 'text-pink-400', icon: '🔮'},
                              };
                              return (
                                <div key={stat} className={`text-sm ${statsMap[stat].color} flex items-center gap-2`}>
                                  <span>{statsMap[stat].icon}</span>
                                  <span>{statsMap[stat].label}: +{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Модификаторы */}
                        <div>
                          <div className="text-sm font-semibold text-purple-400 mb-1">Модификаторы:</div>
                          <div className="space-y-1">
                            {Object.entries(item.stats).filter(([stat, value]) => 
                              value && value !== 0 && ['criticalChance', 'antiCriticalChance', 'dodgeChance', 'antiDodgeChance', 'vampirism', 'blockChance'].includes(stat)
                            ).map(([stat, value]) => {
                              const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                criticalChance: { label: 'Критический удар', color: 'text-orange-400', icon: '💥'},
                                antiCriticalChance: { label: 'Защита от крита', color: 'text-orange-600', icon: '🛡️💥'},
                                dodgeChance: { label: 'Уворот', color: 'text-cyan-400', icon: '💨'},
                                antiDodgeChance: { label: 'Точность', color: 'text-cyan-600', icon: '🎯'},
                                vampirism: { label: 'Вампиризм', color: 'text-red-300', icon: '🩸'},
                                blockChance: { label: 'Блок', color: 'text-gray-400', icon: '🛡️'},
                              };
                              return (
                                <div key={stat} className={`text-sm ${statsMap[stat].color} flex items-center gap-2`}>
                                  <span>{statsMap[stat].icon}</span>
                                  <span>{statsMap[stat].label}: +{value}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Сопротивления */}
                        <div>
                          <div className="text-sm font-semibold text-red-400 mb-1">Сопротивления:</div>
                          <div className="space-y-1">
                            {Object.entries(item.stats).filter(([stat, value]) => 
                              value && value !== 0 && ['fireResistance', 'coldResistance', 'darkResistance', 'crushResistance'].includes(stat)
                            ).map(([stat, value]) => {
                              const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                fireResistance: { label: 'Огнестойкость', color: 'text-red-500', icon: '🔥'},
                                coldResistance: { label: 'Морозостойкость', color: 'text-blue-500', icon: '❄️'},
                                darkResistance: { label: 'Тенестойкость', color: 'text-purple-500', icon: '🌑'},
                                crushResistance: { label: 'Ударопрочность', color: 'text-gray-500', icon: '💥'},
                              };
                              return (
                                <div key={stat} className={`text-sm ${statsMap[stat].color} flex items-center gap-2`}>
                                  <span>{statsMap[stat].icon}</span>
                                  <span>{statsMap[stat].label}: +{value}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Броня */}
                        <div>
                          <div className="text-sm font-semibold text-blue-300 mb-1">Броня:</div>
                          <div className="space-y-1">
                            {Object.entries(item.stats).filter(([stat, value]) => 
                              value && value !== 0 && ['bodyArmor', 'headArmor', 'armArmor', 'legArmor'].includes(stat)
                            ).map(([stat, value]) => {
                              const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                bodyArmor: { label: 'Броня тела', color: 'text-blue-300', icon: '👕'},
                                headArmor: { label: 'Броня головы', color: 'text-blue-300', icon: '🎓'},
                                armArmor: { label: 'Броня рук', color: 'text-blue-300', icon: '🧤'},
                                legArmor: { label: 'Броня ног', color: 'text-blue-300', icon: '👢'},
                              };
                              return (
                                <div key={stat} className={`text-sm ${statsMap[stat].color} flex items-center gap-2`}>
                                  <span>{statsMap[stat].icon}</span>
                                  <span>{statsMap[stat].label}: +{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Дополнительные характеристики */}
                        <div>
                          {Object.entries(item.stats).filter(([stat, value]) => 
                            value && value !== 0 && !['attack', 'defense', 'health', 'mana', 'strength', 'dexterity', 'luck', 'endurance', 'magic', 'intuition', 'criticalChance', 'antiCriticalChance', 'dodgeChance', 'antiDodgeChance', 'vampirism', 'blockChance', 'fireResistance', 'coldResistance', 'darkResistance', 'crushResistance', 'bodyArmor', 'headArmor', 'armArmor', 'legArmor'].includes(stat)
                          ).length > 0 && (
                            <>
                              <div className="text-sm font-semibold text-gray-400 mb-1">Дополнительно:</div>
                              <div className="space-y-1">
                                {Object.entries(item.stats).filter(([stat, value]) => 
                                  value && value !== 0 && !['attack', 'defense', 'health', 'mana', 'strength', 'dexterity', 'luck', 'endurance', 'magic', 'intuition', 'criticalChance', 'antiCriticalChance', 'dodgeChance', 'antiDodgeChance', 'vampirism', 'blockChance', 'fireResistance', 'coldResistance', 'darkResistance', 'crushResistance', 'bodyArmor', 'headArmor', 'armArmor', 'legArmor'].includes(stat)
                                ).map(([stat, value]) => {
                                  const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                    stealth: { label: 'Скрытность', color: 'text-purple-400', icon: '👤'},
                                  };
                                  if (!statsMap[stat]) return null;
                                  return (
                                    <div key={stat} className={`text-sm ${statsMap[stat].color} flex items-center gap-2`}>
                                      <span>{statsMap[stat].icon}</span>
                                      <span>{statsMap[stat].label}: +{value}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>

                        {Object.keys(item.stats).filter(stat => item.stats[stat as keyof typeof item.stats] && item.stats[stat as keyof typeof item.stats] !== 0).length === 0 && (
                          <div className="text-sm text-gray-500">Нет характеристик</div>
                      )}
                      </div>
                    </div>
                    
                    {/* Редкость */}
                    <div className="col-span-2">
                      <Badge className={`${rarityColors[item.rarity]} text-xs`}>
                        {rarityNames[item.rarity]}
                      </Badge>
                      {item.weaponType && (
                        <div className="text-xs text-gray-400 mt-1">
                          {weaponTypeNames[item.weaponType]}
                        </div>
                      )}
                    </div>
                    
                    
                    {/* Уровень */}
                    <div className="col-span-1 text-center">
                      <span className="text-yellow-400 font-bold">{item.levelReq || 1}</span>
                    </div>
                    
                    {/* Цена */}
                    <div className="col-span-1 text-center">
                      <span className="text-yellow-400 font-bold">💰 {item.price}</span>
                    </div>
                    
                    {/* Кнопка покупки */}
                    <div className="col-span-1 flex items-center justify-center">
                      <Button 
                        onClick={() => buyItem(item)}
                        disabled={player.gold < item.price || (item.levelReq && player.level < item.levelReq)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-xs px-2 py-1"
                      >
                        {player.gold < item.price ? 'Недостаточно золота' : 
                         (item.levelReq && player.level < item.levelReq) ? 'Низкий уровень' : 
                         'Купить'}
                      </Button>
                    </div>
                    </div>
                  </ItemTooltip>

                    {/* Мобильная версия */}
                    <ItemTooltip item={item} side="top">
                      <div className="sm:hidden bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer p-4 space-y-4">
                      {/* Верхняя часть с иконкой, названием и ценой */}
                      <div className="flex items-start gap-3">
                        {/* Иконка */}
                        <div className="w-12 h-12 text-2xl bg-gray-800 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            getItemIcon(item)
                          )}
                        </div>
                        
                        {/* Название и основная информация */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-base mb-1">{item.name}</div>
                          <div className="text-sm text-gray-300 mb-2 line-clamp-2">{item.description}</div>
                          
                          {/* Редкость и уровень */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${rarityColors[item.rarity]} text-xs`}>
                              {rarityNames[item.rarity]}
                            </Badge>
                            <span className="text-yellow-400 font-bold text-sm">Ур. {item.levelReq || 1}</span>
                          </div>
                          
                          {/* Цена */}
                          <div className="text-yellow-400 font-bold text-lg mb-3">
                            💰 {item.price}
                          </div>
                        </div>
                      </div>

                      {/* Характеристики - компактная версия */}
                      <div className="space-y-2">
                        {/* Основные характеристики */}
                        {Object.entries(item.stats).filter(([stat, value]) => 
                          value && value !== 0 && ['attack', 'defense', 'health', 'mana'].includes(stat)
                        ).length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-blue-400 mb-1">Основные характеристики:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.stats).filter(([stat, value]) => 
                                value && value !== 0 && ['attack', 'defense', 'health', 'mana'].includes(stat)
                              ).map(([stat, value]) => {
                                const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                  attack: { label: 'Атака', color: 'text-red-400', icon: '⚔️'},
                                  defense: { label: 'Защита', color: 'text-blue-400', icon: '🛡️'},
                                  health: { label: 'Здоровье', color: 'text-green-400', icon: '❤️'},
                                  mana: { label: 'Мана', color: 'text-purple-400', icon: '🔮'},
                                };
                                return (
                                  <span key={stat} className={`text-xs ${statsMap[stat].color}`}>
                                    {statsMap[stat].icon} {statsMap[stat].label}: +{value}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Атрибуты */}
                        {Object.entries(item.stats).filter(([stat, value]) => 
                          value && value !== 0 && ['strength', 'dexterity', 'luck', 'endurance', 'magic', 'intuition'].includes(stat)
                        ).length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-orange-400 mb-1">Атрибуты:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.stats).filter(([stat, value]) => 
                                value && value !== 0 && ['strength', 'dexterity', 'luck', 'endurance', 'magic', 'intuition'].includes(stat)
                              ).map(([stat, value]) => {
                                const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                  strength: { label: 'Сила', color: 'text-orange-400', icon: '💪'},
                                  dexterity: { label: 'Ловкость', color: 'text-cyan-400', icon: '🤸'},
                                  luck: { label: 'Удача', color: 'text-yellow-400', icon: '🍀'},
                                  endurance: { label: 'Выносливость', color: 'text-amber-400', icon: '🏃'},
                                  magic: { label: 'Магия', color: 'text-indigo-400', icon: '🧙'},
                                  intuition: { label: 'Интуиция', color: 'text-pink-400', icon: '🔮'},
                                };
                                return (
                                  <span key={stat} className={`text-xs ${statsMap[stat].color}`}>
                                    {statsMap[stat].icon} {statsMap[stat].label}: +{value}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Модификаторы */}
                        {Object.entries(item.stats).filter(([stat, value]) => 
                          value && value !== 0 && ['criticalChance', 'antiCriticalChance', 'dodgeChance', 'antiDodgeChance', 'vampirism', 'blockChance'].includes(stat)
                        ).length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-purple-400 mb-1">Модификаторы:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.stats).filter(([stat, value]) => 
                                value && value !== 0 && ['criticalChance', 'antiCriticalChance', 'dodgeChance', 'antiDodgeChance', 'vampirism', 'blockChance'].includes(stat)
                              ).map(([stat, value]) => {
                                const statsMap: Record<string, {label: string, color: string, icon: string}> = {
                                  criticalChance: { label: 'Критический удар', color: 'text-orange-400', icon: '💥'},
                                  antiCriticalChance: { label: 'Защита от крита', color: 'text-orange-600', icon: '🛡️💥'},
                                  dodgeChance: { label: 'Уворот', color: 'text-cyan-400', icon: '💨'},
                                  antiDodgeChance: { label: 'Точность', color: 'text-cyan-600', icon: '🎯'},
                                  vampirism: { label: 'Вампиризм', color: 'text-red-300', icon: '🩸'},
                                  blockChance: { label: 'Блок', color: 'text-gray-400', icon: '🛡️'},
                                };
                                return (
                                  <span key={stat} className={`text-xs ${statsMap[stat].color}`}>
                                    {statsMap[stat].icon} {statsMap[stat].label}: +{value}%
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Кнопка покупки */}
                      <div className="pt-2 border-t border-gray-600">
                        <Button 
                          onClick={() => buyItem(item)}
                          disabled={player.gold < item.price || (item.levelReq && player.level < item.levelReq)}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-sm py-2"
                      >
                        {player.gold < item.price ? 'Недостаточно золота' : 
                         (item.levelReq && player.level < item.levelReq) ? 'Низкий уровень' : 
                         'Купить'}
                      </Button>
                    </div>
                      </div>
                    </ItemTooltip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedShop;
