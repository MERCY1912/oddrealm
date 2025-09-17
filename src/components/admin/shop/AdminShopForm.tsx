import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ItemFormData, AdminShopItem } from '@/types/admin';

interface AdminShopFormProps {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  handleStatChange: (statName: keyof ItemFormData['stats'], value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  editingItem: AdminShopItem | null;
  setImageFile: (file: File | null) => void;
}

const AdminShopForm: React.FC<AdminShopFormProps> = ({
  formData,
  setFormData,
  handleStatChange,
  handleSubmit,
  handleCancel,
  editingItem,
  setImageFile,
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400">
          {editingItem ? 'Редактировать предмет' : 'Добавить предмет'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                required
              />
            </div>
            <div>
              <Label htmlFor="item_id" className="text-white">ID предмета</Label>
              <Input
                id="item_id"
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="Автогенерация, если пусто"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type" className="text-white">Тип</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weapon">Оружие</SelectItem>
                  <SelectItem value="armor">Броня</SelectItem>
                  <SelectItem value="helmet">Шлем</SelectItem>
                  <SelectItem value="boots">Ботинки</SelectItem>
                  <SelectItem value="shield">Щит</SelectItem>
                  <SelectItem value="gloves">Перчатки</SelectItem>
                  <SelectItem value="leggings">Поножи</SelectItem>
                  <SelectItem value="belt">Пояс</SelectItem>
                  <SelectItem value="necklace">Ожерелье</SelectItem>
                  <SelectItem value="ring">Кольцо</SelectItem>
                  <SelectItem value="bracers">Наручи</SelectItem>
                  <SelectItem value="earring">Серьги</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === 'weapon' && (
              <div>
                <Label htmlFor="weaponType" className="text-white">Тип оружия</Label>
                <Select value={formData.weaponType} onValueChange={(value) => setFormData({ ...formData, weaponType: value })}>
                  <SelectTrigger className="bg-gray-700 text-white border-gray-600">
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
              <Label htmlFor="rarity" className="text-white">Редкость</Label>
              <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
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

          <Card className="bg-gray-900 border-gray-700 p-4">
            <CardTitle className="text-sm text-yellow-300 mb-2">Основные характеристики</CardTitle>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="attack" className="text-white">Атака</Label>
                <Input id="attack" type="number" value={formData.stats.attack} onChange={(e) => handleStatChange('attack', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="defense" className="text-white">Защита</Label>
                <Input id="defense" type="number" value={formData.stats.defense} onChange={(e) => handleStatChange('defense', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="health" className="text-white">Здоровье</Label>
                <Input id="health" type="number" value={formData.stats.health} onChange={(e) => handleStatChange('health', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="mana" className="text-white">Мана</Label>
                <Input id="mana" type="number" value={formData.stats.mana} onChange={(e) => handleStatChange('mana', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-4">
            <CardTitle className="text-sm text-yellow-300 mb-2">Атрибуты</CardTitle>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <Label htmlFor="strength" className="text-white">Сила</Label>
                <Input id="strength" type="number" value={formData.stats.strength} onChange={(e) => handleStatChange('strength', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="dexterity" className="text-white">Ловкость</Label>
                <Input id="dexterity" type="number" value={formData.stats.dexterity} onChange={(e) => handleStatChange('dexterity', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="luck" className="text-white">Удача</Label>
                <Input id="luck" type="number" value={formData.stats.luck} onChange={(e) => handleStatChange('luck', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="endurance" className="text-white">Выносливость</Label>
                <Input id="endurance" type="number" value={formData.stats.endurance} onChange={(e) => handleStatChange('endurance', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="magic" className="text-white">Магия</Label>
                <Input id="magic" type="number" value={formData.stats.magic} onChange={(e) => handleStatChange('magic', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700 p-4">
            <CardTitle className="text-sm text-yellow-300 mb-2">Боевые модификаторы (%)</CardTitle>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="criticalChance" className="text-white">Мф. крит. удара</Label>
                <Input id="criticalChance" type="number" value={formData.stats.criticalChance} onChange={(e) => handleStatChange('criticalChance', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="antiCriticalChance" className="text-white">Мф. против крит. удара</Label>
                <Input id="antiCriticalChance" type="number" value={formData.stats.antiCriticalChance} onChange={(e) => handleStatChange('antiCriticalChance', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="dodgeChance" className="text-white">Мф. увертывания</Label>
                <Input id="dodgeChance" type="number" value={formData.stats.dodgeChance} onChange={(e) => handleStatChange('dodgeChance', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
              <div>
                <Label htmlFor="antiDodgeChance" className="text-white">Мф. против увертывания</Label>
                <Input id="antiDodgeChance" type="number" value={formData.stats.antiDodgeChance} onChange={(e) => handleStatChange('antiDodgeChance', e.target.value)} className="bg-gray-700 text-white border-gray-600" />
              </div>
            </div>
          </Card>

          {(formData.type === 'helmet' || formData.type === 'armor' || formData.type === 'gloves' || formData.type === 'leggings') && (
            <Card className="bg-gray-900 border-gray-700 p-4">
              <CardTitle className="text-sm text-yellow-300 mb-2">Броня</CardTitle>
              <div className="grid grid-cols-4 gap-4">
                {formData.type === 'helmet' && <div><Label htmlFor="headArmor" className="text-white">Броня головы</Label><Input id="headArmor" type="number" value={formData.stats.headArmor} onChange={(e) => handleStatChange('headArmor', e.target.value)} className="bg-gray-700 text-white border-gray-600"/></div>}
                {formData.type === 'armor' && <div><Label htmlFor="bodyArmor" className="text-white">Броня тела</Label><Input id="bodyArmor" type="number" value={formData.stats.bodyArmor} onChange={(e) => handleStatChange('bodyArmor', e.target.value)} className="bg-gray-700 text-white border-gray-600"/></div>}
                {formData.type === 'gloves' && <div><Label htmlFor="armArmor" className="text-white">Броня рук</Label><Input id="armArmor" type="number" value={formData.stats.armArmor} onChange={(e) => handleStatChange('armArmor', e.target.value)} className="bg-gray-700 text-white border-gray-600"/></div>}
                {formData.type === 'leggings' && <div><Label htmlFor="legArmor" className="text-white">Броня ног</Label><Input id="legArmor" type="number" value={formData.stats.legArmor} onChange={(e) => handleStatChange('legArmor', e.target.value)} className="bg-gray-700 text-white border-gray-600"/></div>}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-white">Цена</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 text-white border-gray-600"
                required
              />
            </div>
            <div>
              <Label htmlFor="requirements" className="text-white">Требования</Label>
              <Input
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="напр. Уровень 10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image" className="text-white">Изображение</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-white">Активен</Label>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingItem ? 'Обновить' : 'Создать'}
            </Button>
            {editingItem && (
              <Button type="button" onClick={handleCancel} variant="outline" className="border-gray-600 text-white">
                Отмена
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminShopForm;
