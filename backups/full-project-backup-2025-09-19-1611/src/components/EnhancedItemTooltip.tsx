import React from 'react';
import { Item, ItemRarity } from '@/types/game';
import { MedievalTooltip } from '@/components/ui/medieval-tooltip';
import { cn } from '@/lib/utils';

interface EnhancedItemTooltipProps {
  item: Item;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const EnhancedItemTooltip = ({ item, children, side = "right", className }: EnhancedItemTooltipProps) => {
  // Безопасная проверка item.stats
  const stats = item.stats || {};
  
  // Функция для получения цвета редкости
  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-300';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-amber-400';
      default:
        return 'text-gray-300';
    }
  };

  // Функция для получения цвета рамки редкости
  const getRarityBorderColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500/60';
      case 'rare':
        return 'border-blue-500/60';
      case 'epic':
        return 'border-purple-500/60';
      case 'legendary':
        return 'border-amber-500/60';
      default:
        return 'border-gray-500/60';
    }
  };

  // Функция для получения иконки типа предмета
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return '⚔️';
      case 'armor':
        return '🛡️';
      case 'helmet':
        return '⛑️';
      case 'gloves':
        return '🧤';
      case 'boots':
        return '👢';
      case 'belt':
        return '🔗';
      case 'ring':
        return '💍';
      case 'necklace':
        return '📿';
      case 'earring':
        return '📿';
      case 'shield':
        return '🛡️';
      case 'leggings':
        return '👖';
      case 'bracers':
        return '🦾';
      default:
        return '📦';
    }
  };

  // Функция для форматирования статистик
  const formatStat = (value: number, suffix: string = '') => {
    if (value && value > 0) {
      const numValue = Number(value);
      let formattedValue = numValue;
      
      // Если значение больше 1000, делим на 1000
      if (numValue >= 1000) {
        formattedValue = Math.floor(numValue / 1000);
      }
      
      // Убираем дробную часть если она есть
      formattedValue = Math.floor(formattedValue);
      
      return `+${formattedValue}${suffix}`;
    }
    return null;
  };

  // Функция для получения названия редкости на русском
  const getRarityName = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common':
        return 'Обычный';
      case 'rare':
        return 'Редкий';
      case 'epic':
        return 'Эпический';
      case 'legendary':
        return 'Легендарный';
      default:
        return 'Неизвестный';
    }
  };

  // Функция для получения названия типа предмета на русском
  const getTypeName = (type: string) => {
    switch (type) {
      case 'weapon':
        return 'Оружие';
      case 'armor':
        return 'Доспех';
      case 'helmet':
        return 'Шлем';
      case 'gloves':
        return 'Перчатки';
      case 'boots':
        return 'Ботинки';
      case 'belt':
        return 'Пояс';
      case 'ring':
        return 'Кольцо';
      case 'necklace':
        return 'Ожерелье';
      case 'earring':
        return 'Серьга';
      case 'shield':
        return 'Щит';
      case 'leggings':
        return 'Поножи';
      case 'bracers':
        return 'Наручи';
      default:
        return 'Предмет';
    }
  };

  // Собираем все характеристики в массив для удобного отображения
  const getStatEntries = () => {
    const entries = [];
    
    // Базовые характеристики
    if (stats.attack && stats.attack > 0) {
      entries.push({ name: 'Атака', value: formatStat(stats.attack), color: 'text-red-400', icon: '⚔️' });
    }
    if (stats.defense && stats.defense > 0) {
      entries.push({ name: 'Защита', value: formatStat(stats.defense), color: 'text-blue-400', icon: '🛡️' });
    }
    if (stats.health && stats.health > 0) {
      entries.push({ name: 'Здоровье', value: formatStat(stats.health), color: 'text-green-400', icon: '❤️' });
    }
    if (stats.mana && stats.mana > 0) {
      entries.push({ name: 'Мана', value: formatStat(stats.mana), color: 'text-purple-400', icon: '🔮' });
    }
    
    // Атрибуты
    if (stats.strength && stats.strength > 0) {
      entries.push({ name: 'Сила', value: formatStat(stats.strength), color: 'text-orange-400', icon: '💪' });
    }
    if (stats.dexterity && stats.dexterity > 0) {
      entries.push({ name: 'Ловкость', value: formatStat(stats.dexterity), color: 'text-teal-400', icon: '🤸' });
    }
    if (stats.luck && stats.luck > 0) {
      entries.push({ name: 'Удача', value: formatStat(stats.luck), color: 'text-yellow-400', icon: '🍀' });
    }
    if (stats.endurance && stats.endurance > 0) {
      entries.push({ name: 'Выносливость', value: formatStat(stats.endurance), color: 'text-lime-400', icon: '🏃' });
    }
    if (stats.magic && stats.magic > 0) {
      entries.push({ name: 'Магия', value: formatStat(stats.magic), color: 'text-indigo-400', icon: '🧙' });
    }
    
    // Специальные модификаторы
    if (stats.criticalChance && stats.criticalChance > 0) {
      entries.push({ name: 'Критический удар', value: formatStat(stats.criticalChance, '%'), color: 'text-yellow-400', icon: '💥' });
    }
    if (stats.dodgeChance && stats.dodgeChance > 0) {
      entries.push({ name: 'Уворот', value: formatStat(stats.dodgeChance, '%'), color: 'text-green-400', icon: '🍃' });
    }
    if (stats.vampirism && stats.vampirism > 0) {
      entries.push({ name: 'Вампиризм', value: formatStat(stats.vampirism, '%'), color: 'text-red-500', icon: '🧛' });
    }
    if (stats.blockChance && stats.blockChance > 0) {
      entries.push({ name: 'Блок', value: formatStat(stats.blockChance, '%'), color: 'text-gray-400', icon: '✋' });
    }
    if (stats.antiCriticalChance && stats.antiCriticalChance > 0) {
      entries.push({ name: 'Защита от крита', value: formatStat(stats.antiCriticalChance, '%'), color: 'text-blue-500', icon: '🛡️' });
    }
    if (stats.antiDodgeChance && stats.antiDodgeChance > 0) {
      entries.push({ name: 'Точность', value: formatStat(stats.antiDodgeChance, '%'), color: 'text-orange-500', icon: '🎯' });
    }
    
    // Сопротивления
    if (stats.fireResistance && stats.fireResistance > 0) {
      entries.push({ name: 'Огнестойкость', value: formatStat(stats.fireResistance, '%'), color: 'text-red-600', icon: '🔥' });
    }
    if (stats.coldResistance && stats.coldResistance > 0) {
      entries.push({ name: 'Морозостойкость', value: formatStat(stats.coldResistance, '%'), color: 'text-blue-600', icon: '❄️' });
    }
    if (stats.darkResistance && stats.darkResistance > 0) {
      entries.push({ name: 'Тенестойкость', value: formatStat(stats.darkResistance, '%'), color: 'text-purple-600', icon: '🌑' });
    }
    if (stats.crushResistance && stats.crushResistance > 0) {
      entries.push({ name: 'Ударопрочность', value: formatStat(stats.crushResistance, '%'), color: 'text-gray-600', icon: '💥' });
    }
    
    // Дополнительные характеристики
    if (stats.stealth && stats.stealth > 0) {
      entries.push({ name: 'Скрытность', value: formatStat(stats.stealth), color: 'text-gray-500', icon: '👤' });
    }
    if (stats.intuition && stats.intuition > 0) {
      entries.push({ name: 'Интуиция', value: formatStat(stats.intuition), color: 'text-pink-400', icon: '🔮' });
    }
    
    return entries;
  };

  const statEntries = getStatEntries();

  const tooltipContent = (
    <div className="p-4 max-w-sm min-w-[250px]">
      {/* Заголовок с названием и редкостью */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{getTypeIcon(item.type)}</span>
          <h3 className={cn("font-bold text-base leading-tight", getRarityColor(item.rarity))}>
            {item.name}
          </h3>
        </div>
        <div className="text-sm text-gray-400">
          {getRarityName(item.rarity)} • {getTypeName(item.type)}
        </div>
      </div>

      {/* Описание */}
      {item.description && (
        <div className="text-sm text-gray-300 mb-3 leading-relaxed border-l-2 border-amber-500/30 pl-3">
          {item.description}
        </div>
      )}

      {/* Характеристики */}
      {statEntries.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-amber-400 border-b border-amber-500/30 pb-1">
            Характеристики:
          </div>
          <div className="grid grid-cols-1 gap-1">
            {statEntries.map((stat, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">{stat.icon}</span>
                  <span className={stat.color}>{stat.name}:</span>
                </div>
                <span className="text-white font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      <div className="mt-3 pt-2 border-t border-gray-600/30">
        <div className="flex justify-between text-sm text-gray-400">
          {item.price > 0 && (
            <span>💰 Цена: {item.price.toLocaleString()}</span>
          )}
          {item.levelReq && (
            <span>📊 Уровень: {item.levelReq}</span>
          )}
        </div>
        {item.weight && (
          <div className="text-sm text-gray-400 mt-1">
            ⚖️ Вес: {item.weight}
          </div>
        )}
        {item.durability && (
          <div className="text-sm text-gray-400 mt-1">
            🔧 Прочность: {item.durability.current}/{item.durability.max}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <MedievalTooltip 
      content={tooltipContent} 
      side={side} 
      className={className}
      contentClassName={cn("border-2", getRarityBorderColor(item.rarity))}
      delayDuration={200}
    >
      {children}
    </MedievalTooltip>
  );
};

export default EnhancedItemTooltip;




