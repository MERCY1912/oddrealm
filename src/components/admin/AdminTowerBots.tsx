import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TowerFloor {
  id: string;
  floor_number: number;
  bot_id?: string;
  floor_type: string;
  difficulty: string;
  rewards?: any;
  is_active: boolean;
  bot?: AdminBot;
}

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
  is_active: boolean;
}

const AdminTowerBots = () => {
  const [floors, setFloors] = useState<TowerFloor[]>([]);
  const [availableBots, setAvailableBots] = useState<AdminBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFloor, setEditingFloor] = useState<TowerFloor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Загружаем этажи башни
      const { data: floorsData, error: floorsError } = await supabase
        .from('admin_tower_floors')
        .select(`
          *,
          bot:admin_bots(*)
        `)
        .order('floor_number', { ascending: true });

      if (floorsError) throw floorsError;

      // Загружаем доступных ботов
      const { data: botsData, error: botsError } = await supabase
        .from('admin_bots')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (botsError) throw botsError;

      setFloors(floorsData || []);
      setAvailableBots(botsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBot = async (floorId: string, botId: string | null) => {
    try {
      const { error } = await supabase
        .from('admin_tower_floors')
        .update({ bot_id: botId })
        .eq('id', floorId);

      if (error) throw error;

      toast({
        title: "Успех",
        description: botId ? "Бот назначен на этаж" : "Бот убран с этажа",
      });

      loadData();
    } catch (error) {
      console.error('Error assigning bot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось назначить бота",
        variant: "destructive",
      });
    }
  };

  const handleCreateFloor = async () => {
    const maxFloor = Math.max(0, ...floors.map(f => f.floor_number));
    const newFloorNumber = maxFloor + 1;

    try {
      const { error } = await supabase
        .from('admin_tower_floors')
        .insert([{
          floor_number: newFloorNumber,
          floor_type: 'normal',
          difficulty: 'medium',
          is_active: true,
          rewards: { gold: newFloorNumber * 10, experience: newFloorNumber * 5 }
        }]);

      if (error) throw error;

      toast({
        title: "Успех",
        description: `Создан этаж ${newFloorNumber}`,
      });

      loadData();
    } catch (error) {
      console.error('Error creating floor:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать этаж",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFloor = async (floorId: string, floorNumber: number) => {
    if (!confirm(`Удалить этаж ${floorNumber}?`)) return;

    try {
      const { error } = await supabase
        .from('admin_tower_floors')
        .delete()
        .eq('id', floorId);

      if (error) throw error;

      toast({
        title: "Успех",
        description: `Этаж ${floorNumber} удален`,
      });

      loadData();
    } catch (error) {
      console.error('Error deleting floor:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить этаж",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      case 'boss': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getFloorTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return 'bg-blue-600';
      case 'mini-boss': return 'bg-orange-600';
      case 'boss': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-purple-400 flex justify-between items-center">
            Управление ботами башни
            <Button onClick={handleCreateFloor} className="bg-green-600 hover:bg-green-700">
              Добавить этаж
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {floors.map((floor) => (
              <div key={floor.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getFloorTypeColor(floor.floor_type)}`}>
                      Этаж {floor.floor_number}
                    </span>
                    <span className={`text-sm ${getDifficultyColor(floor.difficulty)}`}>
                      {floor.difficulty}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${floor.floor_type === 'boss' ? 'bg-red-900 text-red-300' : floor.floor_type === 'mini-boss' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
                      {floor.floor_type}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDeleteFloor(floor.id, floor.floor_number)}
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                  >
                    Удалить этаж
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Назначенный бот */}
                  <div>
                    <Label className="text-white text-sm mb-2 block">Назначенный бот</Label>
                    {floor.bot ? (
                      <div className="bg-gray-600 p-3 rounded flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {floor.bot.image_url && (
                            <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                              <img 
                                src={floor.bot.image_url} 
                                alt={floor.bot.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-white font-bold">{floor.bot.name}</div>
                            <div className="text-gray-300 text-sm">
                              Уровень {floor.bot.level} | HP: {floor.bot.health}/{floor.bot.max_health}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Атака: {floor.bot.attack} | Защита: {floor.bot.defense}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAssignBot(floor.id, null)}
                          size="sm"
                          variant="outline"
                          className="border-gray-500 text-gray-300 hover:bg-gray-600"
                        >
                          Убрать
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-600 p-3 rounded text-center text-gray-400">
                        Бот не назначен
                      </div>
                    )}
                  </div>

                  {/* Выбор бота */}
                  <div>
                    <Label className="text-white text-sm mb-2 block">Назначить бота</Label>
                    <Select onValueChange={(value) => handleAssignBot(floor.id, value)}>
                      <SelectTrigger className="bg-gray-600 text-white border-gray-500">
                        <SelectValue placeholder="Выберите бота" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="none" className="text-white">Убрать бота</SelectItem>
                        {availableBots.map((bot) => (
                          <SelectItem key={bot.id} value={bot.id} className="text-white">
                            {bot.name} (Ур. {bot.level}) - {bot.difficulty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Показываем награды этажа */}
                    {floor.rewards && (
                      <div className="mt-2 text-xs text-gray-400">
                        Награды: {floor.rewards.gold ? `${floor.rewards.gold} золота` : ''} 
                        {floor.rewards.experience ? `, ${floor.rewards.experience} опыта` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {floors.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                Этажи башни не созданы. Нажмите "Добавить этаж" для создания.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTowerBots;