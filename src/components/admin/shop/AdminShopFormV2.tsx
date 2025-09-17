import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ItemFormDataV2, AdminShopItemV2 } from '@/types/admin';

interface AdminShopFormV2Props {
  formData: ItemFormDataV2;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormDataV2>>;
  handleStatChange: (statName: keyof ItemFormDataV2['stats'], value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  editingItem: AdminShopItemV2 | null;
  setImageFile: (file: File | null) => void;
}

const AdminShopFormV2: React.FC<AdminShopFormV2Props> = ({
  formData,
  setFormData,
  handleStatChange,
  handleSubmit,
  handleCancel,
  editingItem,
  setImageFile,
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
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

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400 text-2xl">
          {editingItem ? 'Редактировать предмет' : 'Добавить предмет'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Общая информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white text-lg font-semibold">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 text-white border-gray-600 mt-2"
                placeholder="Введите название предмета"
                required
              />
            </div>
            <div>
              <Label htmlFor="item_id" className="text-white text-lg font-semibold">ID предмета</Label>
              <Input
                id="item_id"
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                className="bg-gray-700 text-white border-gray-600 mt-2"
                placeholder="Автогенерация, если пусто"
              />
            </div>
          </div>

          {/* Тип и редкость */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-white text-lg font-semibold">Тип</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weapon">Оружие</SelectItem>
                  <SelectItem value="armor">Броня</SelectItem>
                  <SelectItem value="helmet">Шлем</SelectItem>
                  <SelectItem value="gloves">Перчатки</SelectItem>
                  <SelectItem value="boots">Ботинки</SelectItem>
                  <SelectItem value="belt">Пояс</SelectItem>
                  <SelectItem value="ring">Кольцо</SelectItem>
                  <SelectItem value="necklace">Амулет</SelectItem>
                  <SelectItem value="earring">Серьги</SelectItem>
                  <SelectItem value="shield">Щит</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === 'weapon' && (
              <div>
                <Label htmlFor="weaponType" className="text-white text-lg font-semibold">Тип оружия</Label>
                <Select value={formData.weaponType} onValueChange={(value) => setFormData({ ...formData, weaponType: value })}>
                  <SelectTrigger className="bg-gray-700 text-white border-gray-600 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sword">Меч</SelectItem>
                    <SelectItem value="axe">Топор</SelectItem>
                    <SelectItem value="bow">Лук</SelectItem>
                    <SelectItem value="staff">Посох</SelectItem>
                    <SelectItem value="dagger">Кинжал</SelectItem>
                    <SelectItem value="mace">Булава</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="rarity" className="text-white text-lg font-semibold">Редкость</Label>
              <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Обычный</SelectItem>
                  <SelectItem value="rare">Редкий</SelectItem>
                  <SelectItem value="epic">Эпический</SelectItem>
                  <SelectItem value="legendary">Легендарный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Основные характеристики */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-xl">Основные характеристики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="attack" className="text-white font-semibold">Атака</Label>
                  <Input
                    id="attack"
                    type="number"
                    value={formData.stats.attack}
                    onChange={(e) => handleStatChange('attack', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="defense" className="text-white font-semibold">Защита</Label>
                  <Input
                    id="defense"
                    type="number"
                    value={formData.stats.defense}
                    onChange={(e) => handleStatChange('defense', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="health" className="text-white font-semibold">Здоровье</Label>
                  <Input
                    id="health"
                    type="number"
                    value={formData.stats.health}
                    onChange={(e) => handleStatChange('health', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mana" className="text-white font-semibold">Мана</Label>
                  <Input
                    id="mana"
                    type="number"
                    value={formData.stats.mana}
                    onChange={(e) => handleStatChange('mana', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Атрибуты */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-blue-400 text-xl">Атрибуты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="strength" className="text-white font-semibold">Сила</Label>
                  <Input
                    id="strength"
                    type="number"
                    value={formData.stats.strength}
                    onChange={(e) => handleStatChange('strength', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dexterity" className="text-white font-semibold">Ловкость</Label>
                  <Input
                    id="dexterity"
                    type="number"
                    value={formData.stats.dexterity}
                    onChange={(e) => handleStatChange('dexterity', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="luck" className="text-white font-semibold">Удача</Label>
                  <Input
                    id="luck"
                    type="number"
                    value={formData.stats.luck}
                    onChange={(e) => handleStatChange('luck', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endurance" className="text-white font-semibold">Выносливость</Label>
                  <Input
                    id="endurance"
                    type="number"
                    value={formData.stats.endurance}
                    onChange={(e) => handleStatChange('endurance', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="magic" className="text-white font-semibold">Магия</Label>
                  <Input
                    id="magic"
                    type="number"
                    value={formData.stats.magic}
                    onChange={(e) => handleStatChange('magic', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Боевые модификаторы */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-red-400 text-xl">Боевые модификаторы (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="criticalChance" className="text-white font-semibold">Мф. крит. удара</Label>
                  <Input
                    id="criticalChance"
                    type="number"
                    value={formData.stats.criticalChance}
                    onChange={(e) => handleStatChange('criticalChance', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="antiCriticalChance" className="text-white font-semibold">Мф. против крит. удара</Label>
                  <Input
                    id="antiCriticalChance"
                    type="number"
                    value={formData.stats.antiCriticalChance}
                    onChange={(e) => handleStatChange('antiCriticalChance', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dodgeChance" className="text-white font-semibold">Мф. увертывания</Label>
                  <Input
                    id="dodgeChance"
                    type="number"
                    value={formData.stats.dodgeChance}
                    onChange={(e) => handleStatChange('dodgeChance', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="antiDodgeChance" className="text-white font-semibold">Мф. против увертывания</Label>
                  <Input
                    id="antiDodgeChance"
                    type="number"
                    value={formData.stats.antiDodgeChance}
                    onChange={(e) => handleStatChange('antiDodgeChance', e.target.value)}
                    className="bg-gray-600 text-white border-gray-500 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Броня - индивидуальные поля */}
          {shouldShowArmorField(formData.type) && (
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-purple-400 text-xl">Броня</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bodyArmor" className="text-white font-semibold">
                      {getArmorFieldLabel(formData.type)}
                    </Label>
                    <Input
                      id="bodyArmor"
                      type="number"
                      value={formData.stats.bodyArmor}
                      onChange={(e) => handleStatChange('bodyArmor', e.target.value)}
                      className="bg-gray-600 text-white border-gray-500 mt-1"
                    />
                  </div>
                  {formData.type === 'armor' && (
                    <>
                      <div>
                        <Label htmlFor="legArmor" className="text-white font-semibold">Броня ног</Label>
                        <Input
                          id="legArmor"
                          type="number"
                          value={formData.stats.legArmor}
                          onChange={(e) => handleStatChange('legArmor', e.target.value)}
                          className="bg-gray-600 text-white border-gray-500 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="armArmor" className="text-white font-semibold">Броня рук</Label>
                        <Input
                          id="armArmor"
                          type="number"
                          value={formData.stats.armArmor}
                          onChange={(e) => handleStatChange('armArmor', e.target.value)}
                          className="bg-gray-600 text-white border-gray-500 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="headArmor" className="text-white font-semibold">Броня головы</Label>
                        <Input
                          id="headArmor"
                          type="number"
                          value={formData.stats.headArmor}
                          onChange={(e) => handleStatChange('headArmor', e.target.value)}
                          className="bg-gray-600 text-white border-gray-500 mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Цена и требования */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-white text-lg font-semibold">Цена</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 text-white border-gray-600 mt-2"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="requirements" className="text-white text-lg font-semibold">Требования</Label>
              <Input
                id="requirements"
                type="number"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="bg-gray-700 text-white border-gray-600 mt-2"
                placeholder="Уровень"
              />
            </div>
          </div>

          {/* Описание */}
          <div>
            <Label htmlFor="description" className="text-white text-lg font-semibold">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 text-white border-gray-600 mt-2"
              placeholder="Описание предмета"
              rows={3}
            />
          </div>

          {/* Изображение */}
          <div>
            <Label htmlFor="image" className="text-white text-lg font-semibold">Изображение</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="bg-gray-700 text-white border-gray-600 mt-2"
            />
            {editingItem?.image_url && (
              <div className="mt-2">
                <img 
                  src={editingItem.image_url} 
                  alt="Current image" 
                  className="w-16 h-16 object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Активен */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="text-white text-lg font-semibold">Активен</Label>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            >
              {editingItem ? 'Обновить' : 'Создать'}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminShopFormV2;
