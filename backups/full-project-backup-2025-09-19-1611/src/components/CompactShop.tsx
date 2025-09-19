
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Player, Item } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchShopItems } from '@/data/shopApi';
import { getEquipmentIcon } from './EquipmentIcons';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedItemTooltip from '@/components/EnhancedItemTooltip';

interface CompactShopProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onAddToInventory: (item: Item) => void;
}

const CompactShop = ({ player, onPlayerUpdate, onAddToInventory }: CompactShopProps) => {
  const { toast } = useToast();
  const { data: shopItems = [], isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: fetchShopItems,
  });

  const rarityColors = {
    common: 'bg-gray-600 text-gray-200',
    rare: 'bg-blue-600 text-blue-100',
    epic: 'bg-purple-600 text-purple-100',
    legendary: 'bg-yellow-600 text-yellow-100',
  };

  const rarityBorders = {
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  const typeNames = {
    weapon: 'Оружие',
    armor: 'Броня',
    helmet: 'Шлем',
    boots: 'Сапоги',
    gloves: 'Перчатки',
    belt: 'Пояс',
    necklace: 'Ожерелье',
    ring: 'Кольцо',
    shield: 'Щит',
    leggings: 'Поножи',
  };

  const buyItem = (item: Item) => {
    if (player.gold < item.price) {
      toast({
        title: "Недостаточно золота",
        description: `Нужно ${item.price} золота`,
        variant: "destructive",
      });
      return;
    }

    const updatedPlayer: Player = {
      ...player,
      gold: player.gold - item.price,
    };

    onPlayerUpdate(updatedPlayer);
    onAddToInventory(item);
    
    toast({
      title: "Покупка завершена!",
      description: `${item.name} добавлен в инвентарь`,
    });
  };


  return (
    <div className="bg-gray-800 border border-gray-500 rounded shadow-lg h-full flex flex-col">
      <div className="bg-gray-700 px-3 py-2 border-b border-gray-500 flex-shrink-0">
        <h3 className="text-white font-bold text-sm text-center">ТОРГОВЕЦ</h3>
        <div className="text-center text-yellow-400 text-xs">💰 {player.gold} золота</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        <div className="space-y-1">
          {isLoading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-full bg-gray-700" />)}
          {!isLoading && shopItems.map((item) => (
            <EnhancedItemTooltip key={item.id} item={item} side="right">
              <div 
                className={`bg-gray-700 border ${rarityBorders[item.rarity]} rounded p-2 hover:bg-gray-600 transition-colors cursor-pointer`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">{getEquipmentIcon(item.name, item.type)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold text-white text-xs truncate">{item.name}</span>
                    </div>
                    
                    <div className="text-xs text-gray-300 mb-2 line-clamp-2">{item.description}</div>
                    
                    <div className="flex gap-1 text-xs mb-1">
                      <Badge className={`${rarityColors[item.rarity]} text-xs px-1 py-0`}>
                        {item.rarity === 'common' && 'Об'}
                        {item.rarity === 'rare' && 'Ред'}
                        {item.rarity === 'epic' && 'Эп'}
                        {item.rarity === 'legendary' && 'Лег'}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {typeNames[item.type]}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                      {item.stats.attack ? <span className="text-red-400">⚔️{item.stats.attack}</span> : null}
                      {item.stats.defense ? <span className="text-blue-400">🛡️{item.stats.defense}</span> : null}
                      {item.stats.health ? <span className="text-green-400">❤️{item.stats.health}</span> : null}
                      {item.stats.mana ? <span className="text-purple-400">🔮{item.stats.mana}</span> : null}
                      {item.stats.strength ? <span className="text-orange-400">💪{item.stats.strength}</span> : null}
                      {item.stats.dexterity ? <span className="text-teal-400">🤸{item.stats.dexterity}</span> : null}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-yellow-400 font-bold text-xs">💰{item.price}</div>
                    <Button 
                      onClick={() => buyItem(item)}
                      disabled={player.gold < item.price}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                    >
                      Купить
                    </Button>
                  </div>
                </div>
              </div>
            </EnhancedItemTooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompactShop;
