import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateCryptoId } from '@/utils/browserUtils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface AdminBot {
  id: string;
  name: string;
  level: number;
  health: number;
  max_health: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  difficulty: string;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface BotFormData {
  name: string;
  level: number;
  health: number;
  max_health: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  difficulty: string;
  description: string;
  is_active: boolean;
}

const AdminBots = () => {
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState<AdminBot | null>(null);
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    level: 1,
    health: 100,
    max_health: 100,
    attack: 10,
    defense: 5,
    experience: 0,
    gold: 0,
    difficulty: 'easy',
    description: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_bots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить ботов",
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
      const filePath = `bots/${fileName}`;

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
      let imageUrl = editingBot?.image_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) return;
      }

      const botData = {
        ...formData,
        image_url: imageUrl,
      };

      if (editingBot) {
        const { error } = await supabase
          .from('admin_bots')
          .update(botData)
          .eq('id', editingBot.id);

        if (error) throw error;
        
        toast({
          title: "Успех",
          description: "Бот обновлен",
        });
      } else {
        const { error } = await supabase
          .from('admin_bots')
          .insert([botData]);

        if (error) throw error;
        
        toast({
          title: "Успех",
          description: "Бот создан",
        });
      }

      setEditingBot(null);
      setFormData({
        name: '',
        level: 1,
        health: 100,
        max_health: 100,
        attack: 10,
        defense: 5,
        experience: 0,
        gold: 0,
        difficulty: 'easy',
        description: '',
        is_active: true,
      });
      setImageFile(null);
      loadBots();
    } catch (error) {
      console.error('Error saving bot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить бота",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (bot: AdminBot) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      level: bot.level,
      health: bot.health,
      max_health: bot.max_health,
      attack: bot.attack,
      defense: bot.defense,
      experience: bot.experience,
      gold: bot.gold,
      difficulty: bot.difficulty,
      description: bot.description || '',
      is_active: bot.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить бота?')) return;

    try {
      const { error } = await supabase
        .from('admin_bots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: "Бот удален",
      });
      
      loadBots();
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить бота",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingBot(null);
    setFormData({
      name: '',
      level: 1,
      health: 100,
      max_health: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      gold: 0,
      difficulty: 'easy',
      description: '',
      is_active: true,
    });
    setImageFile(null);
  };

  const handleToggleActive = async (bot: AdminBot) => {
    try {
      const { error } = await supabase
        .from('admin_bots')
        .update({ is_active: !bot.is_active })
        .eq('id', bot.id);

      if (error) throw error;

      toast({
        title: "Статус обновлен",
        description: `Бот "${bot.name}" теперь ${!bot.is_active ? 'активен' : 'неактивен'}.`,
      });

      loadBots();
    } catch (error) {
      console.error('Error toggling bot status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус бота",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-red-400">
            {editingBot ? 'Редактировать бота' : 'Добавить бота'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">Имя</Label>
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

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="max_health" className="text-white">Макс. здоровье</Label>
                <Input
                  id="max_health"
                  type="number"
                  value={formData.max_health}
                  onChange={(e) => setFormData({...formData, max_health: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience" className="text-white">Опыт</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gold" className="text-white">Золото</Label>
                <Input
                  id="gold"
                  type="number"
                  value={formData.gold}
                  onChange={(e) => setFormData({...formData, gold: parseInt(e.target.value)})}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="difficulty" className="text-white">Сложность</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Легкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="hard">Сложный</SelectItem>
                  <SelectItem value="boss">Босс</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Описание</Label>
              <Textarea
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
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-white">
                Активен в игре
              </Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {editingBot ? 'Обновить' : 'Создать'}
              </Button>
              {editingBot && (
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
          <CardTitle className="text-red-400">Список ботов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots.map((bot) => (
              <div key={bot.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {bot.image_url && (
                    <img src={bot.image_url} alt={bot.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">{bot.name}</h3>
                      <Badge variant={bot.is_active ? 'default' : 'destructive'} className="bg-green-600 text-white">
                        {bot.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <p className="text-gray-300">
                      Уровень {bot.level} | HP: {bot.health}/{bot.max_health} | 
                      Атака: {bot.attack} | Защита: {bot.defense}
                    </p>
                    <p className="text-gray-400 text-sm">Сложность: {bot.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`active-toggle-${bot.id}`} className="text-sm text-gray-400">
                      {bot.is_active ? "Выкл" : "Вкл"}
                    </Label>
                    <Switch
                        id={`active-toggle-${bot.id}`}
                        checked={bot.is_active}
                        onCheckedChange={() => handleToggleActive(bot)}
                    />
                  </div>
                  <Button 
                    onClick={() => handleEdit(bot)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Редактировать
                  </Button>
                  <Button 
                    onClick={() => handleDelete(bot.id)}
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

export default AdminBots;
