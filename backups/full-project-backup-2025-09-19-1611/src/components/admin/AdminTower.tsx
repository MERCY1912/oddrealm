import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface AdminTower {
  id: string;
  name: string;
  level: number;
  health: number;
  attack: number;
  defense: number;
  cost: number;
  range: number;
  attack_speed: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface TowerFormData {
  name: string;
  level: number;
  health: number;
  attack: number;
  defense: number;
  cost: number;
  range: number;
  attack_speed: number;
  description: string;
}

const AdminTower = () => {
  const [towers, setTowers] = useState<AdminTower[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTower, setEditingTower] = useState<AdminTower | null>(null);
  const [formData, setFormData] = useState<TowerFormData>({
    name: '',
    level: 1,
    health: 100,
    attack: 10,
    defense: 5,
    cost: 100,
    range: 5,
    attack_speed: 1,
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTowers();
  }, []);

  const loadTowers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_towers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTowers(data || []);
    } catch (error) {
      console.error('Error loading towers:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить башни",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `towers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('admin-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = editingTower?.image_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) return;
      }

      const towerData = {
        ...formData,
        image_url: imageUrl,
      };

      if (editingTower) {
        const { error } = await supabase
          .from('admin_towers')
          .update(towerData)
          .eq('id', editingTower.id);

        if (error) throw error;
        
        toast({
          title: "Успех",
          description: "Башня обновлена",
        });
      } else {
        const { error } = await supabase
          .from('admin_towers')
          .insert([towerData]);

        if (error) throw error;
        
        toast({
          title: "Успех",
          description: "Башня создана",
        });
      }

      setEditingTower(null);
      setFormData({
        name: '',
        level: 1,
        health: 100,
        attack: 10,
        defense: 5,
        cost: 100,
        range: 5,
        attack_speed: 1,
        description: '',
      });
      setImageFile(null);
      loadTowers();
    } catch (error) {
      console.error('Error saving tower:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить башню",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tower: AdminTower) => {
    setEditingTower(tower);
    setFormData({
      name: tower.name,
      level: tower.level,
      health: tower.health,
      attack: tower.attack,
      defense: tower.defense,
      cost: tower.cost,
      range: tower.range,
      attack_speed: tower.attack_speed,
      description: tower.description || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить башню?')) return;

    try {
      const { error } = await supabase
        .from('admin_towers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: "Башня удалена",
      });
      
      loadTowers();
    } catch (error) {
      console.error('Error deleting tower:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить башню",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingTower(null);
    setFormData({
      name: '',
      level: 1,
      health: 100,
      attack: 10,
      defense: 5,
      cost: 100,
      range: 5,
      attack_speed: 1,
      description: '',
    });
    setImageFile(null);
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-purple-400">
            {editingTower ? 'Редактировать башню' : 'Добавить башню'}
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
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="level" className="text-white">Уровень</Label>
                <Input
                  id="level"
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="health" className="text-white">Здоровье</Label>
                <Input
                  id="health"
                  type="number"
                  value={formData.health}
                  onChange={(e) => setFormData({...formData, health: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="attack" className="text-white">Атака</Label>
                <Input
                  id="attack"
                  type="number"
                  value={formData.attack}
                  onChange={(e) => setFormData({...formData, attack: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="defense" className="text-white">Защита</Label>
                <Input
                  id="defense"
                  type="number"
                  value={formData.defense}
                  onChange={(e) => setFormData({...formData, defense: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cost" className="text-white">Стоимость</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="range" className="text-white">Радиус</Label>
                <Input
                  id="range"
                  type="number"
                  value={formData.range}
                  onChange={(e) => setFormData({...formData, range: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="attack_speed" className="text-white">Скорость атаки</Label>
                <Input
                  id="attack_speed"
                  type="number"
                  step="0.1"
                  value={formData.attack_speed}
                  onChange={(e) => setFormData({...formData, attack_speed: parseFloat(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>

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

            <div className="flex space-x-2">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingTower ? 'Обновить' : 'Создать'}
              </Button>
              {editingTower && (
                <Button type="button" onClick={handleCancel} variant="outline" className="border-gray-600 text-white">
                  Отмена
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-purple-400">Список башен</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {towers.map((tower) => (
              <div key={tower.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {tower.image_url && (
                    <img src={tower.image_url} alt={tower.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className="text-white font-bold">{tower.name}</h3>
                    <p className="text-gray-300">
                      Уровень {tower.level} | HP: {tower.health} | Атака: {tower.attack}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Стоимость: {tower.cost} | Радиус: {tower.range} | Скорость: {tower.attack_speed}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleEdit(tower)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Редактировать
                  </Button>
                  <Button 
                    onClick={() => handleDelete(tower.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Удалить
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

export default AdminTower;
