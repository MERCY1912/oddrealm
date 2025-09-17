import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Player, Item } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { updatePlayerWithCalculatedStats } from '@/utils/enhancedCharacterStats';
import { fetchShopItems } from '@/data/shopApi';
import { Skeleton } from './ui/skeleton';

interface ShopProps {
  player: Player;
  onPlayerUpdate: (player: Partial<Player>) => void;
  onBack?: () => void;
  // Let's assume onEquipmentUpdate is also available or handled by onPlayerUpdate
}

const Shop = ({ player, onPlayerUpdate, onBack }: ShopProps) => {
  const { data: shopItems = [], isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: fetchShopItems,
  });
  const { toast } = useToast();

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

  const typeNames: Record<string, string> = {
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
        description: `Вам нужно ${item.price} золота для покупки этого предмета.`,
        variant: "destructive",
      });
      return;
    }

    const newEquipment = {
      ...player.equipment,
      [item.type]: item,
    };
    
    let tempPlayer = { ...player, gold: player.gold - item.price, equipment: newEquipment };
    
    const updatedPlayer = updatePlayerWithCalculatedStats(tempPlayer, newEquipment);

    onPlayerUpdate(updatedPlayer);
    toast({
      title: "Покупка успешна!",
      description: `Вы купили и надели ${item.name}`,
    });
  };

  const sellItem = (itemType: keyof Player['equipment']) => {
    const item = player.equipment[itemType];
    if (!item) return;

    const sellPrice = Math.floor(item.price * 0.5);

    const newEquipment = {
        ...player.equipment,
        [itemType]: undefined,
    };

    let tempPlayer = { ...player, gold: player.gold + sellPrice, equipment: newEquipment };
    
    const updatedPlayer = updatePlayerWithCalculatedStats(tempPlayer, newEquipment);

    onPlayerUpdate(updatedPlayer);
    toast({
      title: "Продажа успешна!",
      description: `Вы продали ${item.name} за ${sellPrice} золота`,
    });
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="mb-4">
          <Button onClick={onBack} className="medieval-button">
            ← Назад к торговцу
          </Button>
        </div>
      )}
      {/* Инвентарь игрока */}
      <Card className="bg-gray-800 border-yellow-600 text-white">
        <CardHeader>
          <CardTitle className="text-center text-yellow-400">🎒 Ваше снаряжение</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {(['weapon', 'armor', 'helmet', 'boots'] as const).map((slot) => {
              const item = player.equipment[slot];
              return (
                <div key={slot} className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">{typeNames[slot]}</div>
                  {item ? (
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <Badge className={`${rarityColors[item.rarity]} mb-2`}>
                        {rarityNames[item.rarity]}
                      </Badge>
                      <div className="text-xs space-y-1">
                        {item.stats.attack && <div className="text-red-400">Атака: +{item.stats.attack}</div>}
                        {item.stats.defense && <div className="text-blue-400">Защита: +{item.stats.defense}</div>}
                        {item.stats.health && <div className="text-green-400">Здоровье: +{item.stats.health}</div>}
                        {item.stats.mana && <div className="text-purple-400">Мана: +{item.stats.mana}</div>}
                      </div>
                      <Button 
                        onClick={() => sellItem(slot)}
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full text-xs"
                      >
                        Продать за {Math.floor(item.price * 0.5)} 💰
                      </Button>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center">Пусто</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Магазин */}
      <Card className="bg-gray-800 border-yellow-600 text-white">
        <CardHeader>
          <CardTitle className="text-center text-yellow-400">🏪 Магазин</CardTitle>
          <div className="text-center text-yellow-300">
            💰 У вас: {player.gold} золота
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-gray-700" />)}
            {shopItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white">{item.name}</span>
                    <Badge className={rarityColors[item.rarity]}>
                      {rarityNames[item.rarity]}
                    </Badge>
                    <Badge variant="outline">
                      {typeNames[item.type] || 'Предмет'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    {item.description}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {Object.entries(item.stats).map(([stat, value]) => {
                        if (!value) return null;
                        const statsMap: Record<string, string> = {
                            attack: `⚔️Атака: +${value}`,
                            defense: `🛡️Защита: +${value}`,
                            health: `❤️Здоровье: +${value}`,
                            mana: `🔮Мана: +${value}`,
                            strength: `💪Сила: +${value}`,
                            dexterity: `🤸Ловкость: +${value}`,
                            luck: `🍀Удача: +${value}`,
                            endurance: `🏃Выносливость: +${value}`,
                            magic: `🧙Магия: +${value}`,
                        };
                        return <span key={stat} className="text-gray-300">{statsMap[stat]}</span>
                    })}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-yellow-400 font-bold mb-2">💰 {item.price}</div>
                  <Button 
                    onClick={() => buyItem(item)}
                    disabled={player.gold < item.price || !!player.equipment[item.type]}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    {player.equipment[item.type] ? 'Уже есть' : 'Купить'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Shop;
