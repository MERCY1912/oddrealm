import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player, Item } from '@/types/game';
import { dungeonMaterials } from '@/data/dungeonItems';

interface DungeonMerchantProps {
  player: Player;
  onPurchase: (item: Item, price: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export default function DungeonMerchant({ 
  player, 
  onPurchase, 
  onComplete, 
  onSkip 
}: DungeonMerchantProps) {
  const [purchased, setPurchased] = useState(false);

  // Генерируем случайные товары для торговца
  const getRandomItems = (): Item[] => {
    const items: Item[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 2; // 2-4 предмета
    
    for (let i = 0; i < itemCount; i++) {
      const randomMaterial = dungeonMaterials[Math.floor(Math.random() * dungeonMaterials.length)];
      const price = Math.floor(randomMaterial.price * (0.8 + Math.random() * 0.4)); // ±20% от базовой цены
      
      items.push({
        ...randomMaterial,
        id: `${randomMaterial.id}_merchant_${i}`,
        price: price
      });
    }
    
    return items;
  };

  const [merchantItems] = useState<Item[]>(getRandomItems());

  const handlePurchase = (item: Item) => {
    if (player.gold >= item.price) {
      onPurchase(item, item.price);
      setPurchased(true);
    }
  };

  if (purchased) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-center">🛒 Торговец</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300 mb-4">
            Спасибо за покупку! Удачных приключений!
          </p>
          <Button 
            onClick={onComplete}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Продолжить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-center">🛒 Подземный Торговец</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 mb-6 text-center">
          Вы встретили странного торговца в глубинах подземелья. 
          У него есть несколько интересных товаров:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {merchantItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-gray-700 p-4 rounded-lg border border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{item.name}</h4>
                <span className="text-yellow-400 font-bold">{item.price} золота</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Редкость: {item.rarity}
                </span>
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={player.gold < item.price}
                  className={`${
                    player.gold >= item.price
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                  size="sm"
                >
                  {player.gold >= item.price ? 'Купить' : 'Недостаточно золота'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            У вас: {player.gold} золота
          </p>
          <Button 
            onClick={onSkip}
            variant="outline"
            className="border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Уйти без покупок
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}




