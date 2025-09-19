
import React from 'react';
import { Button } from '@/components/ui/button';
import { AdminShopItem as AdminShopItemType } from '@/types/admin';

interface AdminShopItemProps {
  item: AdminShopItemType;
  onEdit: (item: AdminShopItemType) => void;
  onDelete: (id: string) => void;
}

const AdminShopItem: React.FC<AdminShopItemProps> = ({ item, onEdit, onDelete }) => {
  const { stats } = item;
  const primaryStats = `Атака: ${stats.attack || 0} | Защита: ${stats.defense || 0} | HP: ${stats.health || 0} | Мана: ${stats.mana || 0}`;
  const attributes = [
    stats.strength && `Сила: ${stats.strength}`,
    stats.dexterity && `Ловкость: ${stats.dexterity}`,
    stats.luck && `Удача: ${stats.luck}`,
    stats.endurance && `Вынос: ${stats.endurance}`,
    stats.magic && `Магия: ${stats.magic}`,
  ].filter(Boolean).join(' | ');
  const combatMods = [
    stats.criticalChance && `Мф.Крит: ${stats.criticalChance}%`,
    stats.antiCriticalChance && `Анти-крит: ${stats.antiCriticalChance}%`,
    stats.dodgeChance && `Уворот: ${stats.dodgeChance}%`,
    stats.antiDodgeChance && `Анти-уворот: ${stats.antiDodgeChance}%`,
  ].filter(Boolean).join(' | ');
  const armorStats = [
    stats.headArmor && `Броня головы: ${stats.headArmor}`,
    stats.bodyArmor && `Броня тела: ${stats.bodyArmor}`,
    stats.armArmor && `Броня рук: ${stats.armArmor}`,
    stats.legArmor && `Броня ног: ${stats.legArmor}`,
  ].filter(Boolean).join(' | ');

  return (
    <div className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {item.image_url && (
          <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
        )}
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-bold">{item.name}</h3>
            {!item.is_active && (
              <span className="text-red-400 text-sm">(Неактивен)</span>
            )}
          </div>
          <p className="text-gray-300">
            {item.type} | {item.weapon_type && `${item.weapon_type} | `}{item.rarity} | {item.price}💰
          </p>
          <p className="text-gray-400 text-sm">{primaryStats}</p>
          {attributes && <p className="text-gray-400 text-sm">{attributes}</p>}
          {combatMods && <p className="text-yellow-400 text-sm">{combatMods}</p>}
          {armorStats && <p className="text-blue-400 text-sm">{armorStats}</p>}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={() => onEdit(item)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Редактировать
        </Button>
        <Button 
          onClick={() => onDelete(item.id)}
          size="sm"
          variant="destructive"
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default AdminShopItem;
