import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Player, DungeonEvent, DungeonEventEffects, Item } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { dungeonMaterials } from '@/data/dungeonItems';
import TreasureChest from './TreasureChest';

interface DungeonEventProps {
  player: Player;
  event: DungeonEvent;
  onEventComplete: (effects: DungeonEventEffects) => void;
  onSkip: () => void;
  onAddToInventory?: (item: Item) => void;
}

const DungeonEventComponent = ({ player, event, onEventComplete, onSkip, onAddToInventory }: DungeonEventProps) => {
  const [eventState, setEventState] = useState<'description' | 'action' | 'completed'>('description');
  const { toast } = useToast();

  const handleEventAction = async () => {
    console.log('DungeonEvent: handleEventAction called');
    console.log('DungeonEvent: event:', event);
    console.log('DungeonEvent: onEventComplete function:', onEventComplete);
    setEventState('action');
    
    // Apply event effects
    const effects = event.effects;
    console.log('DungeonEvent: effects:', effects);
    
    if (effects.heal) {
      toast({
        title: 'Восстановление здоровья',
        description: `+${effects.heal} HP`,
      });
    }
    
    if (effects.mana) {
      toast({
        title: 'Восстановление маны',
        description: `+${effects.mana} MP`,
      });
    }
    
    if (effects.damage) {
      toast({
        title: 'Получен урон',
        description: `-${effects.damage} HP`,
        variant: 'destructive',
      });
    }
    
    if (effects.gold) {
      toast({
        title: 'Найдено золото',
        description: `+${effects.gold} золота`,
      });
    }
    
    if (effects.exp) {
      toast({
        title: 'Получен опыт',
        description: `+${effects.exp} опыта`,
      });
    }
    
    if (effects.items && effects.items.length > 0) {
      console.log('DungeonEvent: Processing items:', effects.items);
      // Получаем предметы по их ID
      const foundItems: Item[] = [];
      effects.items.forEach(itemId => {
        console.log('DungeonEvent: Looking for item with ID:', itemId);
        const material = dungeonMaterials.find(m => m.id === itemId);
        if (material) {
          console.log('DungeonEvent: Found material:', material);
          foundItems.push(material);
        } else {
          console.log('DungeonEvent: Material not found for ID:', itemId);
        }
      });
      
      console.log('DungeonEvent: Found items:', foundItems);
      
      if (foundItems.length > 0) {
        toast({
          title: 'Найдены предметы!',
          description: `Получено: ${foundItems.map(item => item.name).join(', ')}`,
        });
      } else {
        console.log('DungeonEvent: No items found to show in toast');
      }
    }
    
    if (effects.random_effect) {
      const randomEffects = [
        { type: 'heal', value: 30, message: 'Зелье восстановило здоровье!' },
        { type: 'mana', value: 20, message: 'Зелье восстановило ману!' },
        { type: 'damage', value: 15, message: 'Зелье оказалось ядовитым!' },
        { type: 'gold', value: 50, message: 'В зелье оказались золотые монеты!' },
        { type: 'exp', value: 25, message: 'Зелье дало мудрость!' }
      ];
      
      const randomEffect = randomEffects[Math.floor(Math.random() * randomEffects.length)];
      
      toast({
        title: 'Таинственное зелье',
        description: randomEffect.message,
        variant: randomEffect.type === 'damage' ? 'destructive' : 'default'
      });
      
      // Apply random effect
      const randomEffectsObj: DungeonEventEffects = {};
      randomEffectsObj[randomEffect.type as keyof DungeonEventEffects] = randomEffect.value;
      effects.random_effect = false; // Remove the flag
      Object.assign(effects, randomEffectsObj);
    }
    
    setEventState('completed');
    console.log('DungeonEvent: calling onEventComplete with effects:', effects);
    await onEventComplete(effects);
    console.log('DungeonEvent: onEventComplete completed');
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'rest': return '🛌';
      case 'trader': return '🛒';
      case 'trap': return '⚠️';
      case 'treasure': return '💰';
      case 'puzzle': return '🧩';
      default: return '🎲';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'rest': return 'bg-green-900 bg-opacity-50';
      case 'trader': return 'bg-blue-900 bg-opacity-50';
      case 'trap': return 'bg-red-900 bg-opacity-50';
      case 'treasure': return 'bg-yellow-900 bg-opacity-50';
      case 'puzzle': return 'bg-purple-900 bg-opacity-50';
      default: return 'bg-gray-900 bg-opacity-50';
    }
  };

  const getActionButtonText = (eventType: string) => {
    switch (eventType) {
      case 'rest': return 'Отдохнуть';
      case 'trader': return 'Торговать';
      case 'trap': return 'Проверить';
      case 'treasure': return 'Открыть';
      case 'puzzle': return 'Решить';
      default: return 'Действовать';
    }
  };

  // Если это событие с сокровищем, используем специальный компонент
  if (event.event_type === 'treasure') {
    return (
      <TreasureChest
        player={player}
        event={event}
        onEventComplete={onEventComplete}
        onSkip={onSkip}
        onAddToInventory={onAddToInventory}
      />
    );
  }

  return (
    <Card className="bg-gray-800 bg-opacity-80 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-2xl">
          {getEventIcon(event.event_type)} {event.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getEventColor(event.event_type)}`}>
            <p className="text-gray-300 text-lg">{event.description}</p>
          </div>
          
          {eventState === 'description' && (
            <div className="text-center space-y-4">
              <div className="text-gray-300">
                {event.event_type === 'rest' && 'Вы можете отдохнуть и восстановить силы.'}
                {event.event_type === 'trader' && 'Торговец предлагает свои товары.'}
                {event.event_type === 'trap' && 'Осторожно! Здесь может быть ловушка.'}
                {event.event_type === 'treasure' && 'Вы нашли сокровище!'}
                {event.event_type === 'puzzle' && 'Здесь есть загадка, которую нужно решить.'}
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    console.log('DungeonEvent: Button clicked!');
                    handleEventAction();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {getActionButtonText(event.event_type)}
                </Button>
                <Button
                  onClick={onSkip}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                >
                  Пропустить
                </Button>
              </div>
            </div>
          )}
          
          {eventState === 'action' && (
            <div className="text-center">
              <div className="text-white text-lg mb-4">
                Событие обрабатывается...
              </div>
            </div>
          )}
          
          {eventState === 'completed' && (
            <div className="text-center">
              <div className="text-green-400 text-lg mb-4">
                Событие завершено!
              </div>
              <Button
                onClick={onSkip}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                Продолжить
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DungeonEventComponent;
