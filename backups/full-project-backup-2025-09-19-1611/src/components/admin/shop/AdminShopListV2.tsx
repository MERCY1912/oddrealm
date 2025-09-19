import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminShopItemV2 } from '@/types/admin';

interface AdminShopListV2Props {
  items: AdminShopItemV2[];
  onEdit: (item: AdminShopItemV2) => void;
  onDelete: (id: string) => void;
}

const AdminShopListV2: React.FC<AdminShopListV2Props> = ({ items, onEdit, onDelete }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Обычный';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weapon': return 'Оружие';
      case 'armor': return 'Броня';
      case 'helmet': return 'Шлем';
      case 'gloves': return 'Перчатки';
      case 'boots': return 'Ботинки';
      case 'belt': return 'Пояс';
      case 'ring': return 'Кольцо';
      case 'necklace': return 'Амулет';
      case 'earring': return 'Серьги';
      case 'shield': return 'Щит';
      default: return 'Оружие';
    }
  };

  const getArmorFieldLabel = (type: string) => {
    switch (type) {
      case 'armor': return 'Броня корпуса';
      case 'helmet': return 'Броня головы';
      case 'gloves': return 'Броня рук';
      case 'boots': return 'Броня ног';
      case 'belt': return 'Броня пояса';
      case 'shield': return 'Броня щита';
      default: return 'Броня';
    }
  };

  const shouldShowArmorField = (type: string) => {
    return ['armor', 'helmet', 'gloves', 'boots', 'belt', 'shield'].includes(type);
  };

  if (items.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400 text-lg">Предметы не найдены</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-yellow-400 text-2xl">Список предметов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => {
            const { stats } = item;
            const primaryStats = [
              stats.attack && `Атака: ${stats.attack}`,
              stats.defense && `Защита: ${stats.defense}`,
              stats.health && `Здоровье: ${stats.health}`,
              stats.mana && `Мана: ${stats.mana}`,
            ].filter(Boolean).join(' | ');

            const attributes = [
              stats.strength && `Сила: ${stats.strength}`,
              stats.dexterity && `Ловкость: ${stats.dexterity}`,
              stats.luck && `Удача: ${stats.luck}`,
              stats.endurance && `Выносливость: ${stats.endurance}`,
              stats.magic && `Магия: ${stats.magic}`,
            ].filter(Boolean).join(' | ');

            const combatMods = [
              stats.criticalChance && `Крит: ${stats.criticalChance}%`,
              stats.antiCriticalChance && `Анти-крит: ${stats.antiCriticalChance}%`,
              stats.dodgeChance && `Уворот: ${stats.dodgeChance}%`,
              stats.antiDodgeChance && `Анти-уворот: ${stats.antiDodgeChance}%`,
            ].filter(Boolean).join(' | ');

            const armorStats = [
              stats.bodyArmor && `${getArmorFieldLabel(item.type)}: ${stats.bodyArmor}`,
              item.type === 'armor' && stats.legArmor && `Броня ног: ${stats.legArmor}`,
              item.type === 'armor' && stats.armArmor && `Броня рук: ${stats.armArmor}`,
              item.type === 'armor' && stats.headArmor && `Броня головы: ${stats.headArmor}`,
            ].filter(Boolean).join(' | ');

            return (
              <div key={item.id} className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600" 
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-bold text-xl">{item.name}</h3>
                        <span className={`px-2 py-1 rounded text-sm font-semibold border ${getRarityColor(item.rarity)}`}>
                          {getRarityLabel(item.rarity)}
                        </span>
                        {!item.is_active && (
                          <span className="text-red-400 text-sm font-semibold">(Неактивен)</span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">
                          <span className="font-semibold">Тип:</span> {getTypeLabel(item.type)}
                          {item.weapon_type && ` (${item.weapon_type})`}
                          <span className="mx-2">|</span>
                          <span className="font-semibold">Цена:</span> {item.price}💰
                        </p>
                        
                        {primaryStats && (
                          <p className="text-green-400 font-medium">{primaryStats}</p>
                        )}
                        
                        {attributes && (
                          <p className="text-blue-400">{attributes}</p>
                        )}
                        
                        {combatMods && (
                          <p className="text-yellow-400">{combatMods}</p>
                        )}
                        
                        {armorStats && (
                          <p className="text-purple-400">{armorStats}</p>
                        )}
                        
                        {item.description && (
                          <p className="text-gray-400 italic">"{item.description}"</p>
                        )}
                        
                        {item.requirements && (
                          <p className="text-orange-400">
                            <span className="font-semibold">Требования:</span> Уровень {item.requirements}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => onEdit(item)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      Редактировать
                    </Button>
                    <Button 
                      onClick={() => onDelete(item.id)}
                      size="sm"
                      variant="destructive"
                      className="font-semibold"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminShopListV2;
