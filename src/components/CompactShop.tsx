
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Player, Item } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchShopItems } from '@/data/shopApi';
import { getEquipmentIcon } from './EquipmentIcons';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

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

  const getItemTooltip = (item: Item) => (
    <div className="p-3 max-w-xs">
      <div className="font-bold text-yellow-300 mb-2">{item.name}</div>
      <div className="text-sm text-gray-300 mb-3">{item.description}</div>
      
      <div className="space-y-1 mb-3 text-xs">
        <div className="font-semibold text-gray-400">Характеристики:</div>
        {item.stats.attack ? <div className="text-red-400">⚔️ Атака: +{item.stats.attack}</div> : null}
        {item.stats.defense ? <div className="text-blue-400">🛡️ Защита: +{item.stats.defense}</div> : null}
        {item.stats.health ? <div className="text-green-400">❤️ Здоровье: +{item.stats.health}</div> : null}
        {item.stats.mana ? <div className="text-purple-400">🔮 Мана: +{item.stats.mana}</div> : null}
        {item.stats.strength ? <div className="text-orange-400">💪 Сила: +{item.stats.strength}</div> : null}
        {item.stats.dexterity ? <div className="text-teal-400">🤸 Ловкость: +{item.stats.dexterity}</div> : null}
        {item.stats.luck ? <div className="text-yellow-400">🍀 Удача: +{item.stats.luck}</div> : null}
        {item.stats.endurance ? <div className="text-lime-400">🏃 Выносливость: +{item.stats.endurance}</div> : null}
        {item.stats.magic ? <div className="text-indigo-400">🧙 Магия: +{item.stats.magic}</div> : null}
        {item.stats.criticalChance ? <div className="text-yellow-400">💥 Крит. шанс: +{item.stats.criticalChance}%</div> : null}
        {item.stats.dodgeChance ? <div className="text-green-400">🍃 Уворот: +{item.stats.dodgeChance}%</div> : null}
        {item.stats.vampirism ? <div className="text-red-500">🧛 Вампиризм: +{item.stats.vampirism}%</div> : null}
        {item.stats.blockChance ? <div className="text-gray-400">✋ Блок: +{item.stats.blockChance}%</div> : null}
        {item.stats.antiCriticalChance ? <div className="text-cyan-400">🛡️ Мф. против крит. удара: +{item.stats.antiCriticalChance}%</div> : null}
        {item.stats.antiDodgeChance ? <div className="text-pink-400">🎯 Мф. против увертывания: +{item.stats.antiDodgeChance}%</div> : null}
        {item.stats.bodyArmor ? <div className="text-blue-300">👕 Броня тела: +{item.stats.bodyArmor}</div> : null}
        {item.stats.headArmor ? <div className="text-blue-300">🎓 Броня головы: +{item.stats.headArmor}</div> : null}
        {item.stats.armArmor ? <div className="text-blue-300">🧤 Броня рук: +{item.stats.armArmor}</div> : null}
        {item.stats.legArmor ? <div className="text-blue-300">👢 Броня ног: +{item.stats.legArmor}</div> : null}
      </div>

      {(item.levelReq || item.requirements) && (
        <div className="space-y-1 mb-2">
          <div className="text-xs font-semibold text-gray-400">Требования:</div>
          {item.levelReq && <div className="text-orange-400 text-xs">Уровень: {item.levelReq}</div>}
          {item.requirements && <div className="text-orange-400 text-xs">{item.requirements}</div>}
        </div>
      )}
      
      <div className="text-xs">
        <Badge className={rarityColors[item.rarity]}>
          {item.rarity === 'common' && 'Обычное'}
          {item.rarity === 'rare' && 'Редкое'}
          {item.rarity === 'epic' && 'Эпическое'}
          {item.rarity === 'legendary' && 'Легендарное'}
        </Badge>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="bg-gray-800 border border-gray-500 rounded shadow-lg h-full flex flex-col">
        <div className="bg-gray-700 px-3 py-2 border-b border-gray-500 flex-shrink-0">
          <h3 className="text-white font-bold text-sm text-center">ТОРГОВЕЦ</h3>
          <div className="text-center text-yellow-400 text-xs">💰 {player.gold} золота</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          <div className="space-y-1">
            {isLoading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-full bg-gray-700" />)}
            {!isLoading && shopItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900/95 backdrop-blur-sm border border-gray-500/50 text-white shadow-xl">
                  {getItemTooltip(item)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CompactShop;
