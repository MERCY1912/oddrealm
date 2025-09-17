
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  attack: number;
  defense: number;
  gold: number;
  character_class: string;
  strength?: number;
  dexterity?: number;
  magic?: number;
  endurance?: number;
  luck?: number;
  free_stat_points?: number;
  created_at: string;
}

const AdminPlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Player>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading players:', error);
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player.id);
    setEditForm(player);
  };

  const handleSave = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', playerId);

      if (error) {
        console.error('Error updating player:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить игрока",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Успешно",
        description: "Игрок обновлен",
      });

      setEditingPlayer(null);
      setEditForm({});
      loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingPlayer(null);
    setEditForm({});
  };

  const filteredPlayers = players.filter(player =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'archer': return '🏹';
      default: return '🎭';
    }
  };

  const getClassName = (characterClass: string) => {
    switch (characterClass) {
      case 'warrior': return 'Воин';
      case 'mage': return 'Маг';
      case 'archer': return 'Лучник';
      default: return characterClass;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-yellow-400">Поиск игроков</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Введите имя игрока..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
        </CardContent>
      </Card>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex justify-between items-center">
                <span>
                  {getClassIcon(player.character_class)} {player.username}
                </span>
                <div className="flex gap-2">
                  {editingPlayer === player.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(player.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCancel}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleEdit(player)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingPlayer === player.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-white text-xs">Уровень</Label>
                      <Input
                        type="number"
                        value={editForm.level || 0}
                        onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) })}
                        className="bg-gray-700 text-white border-gray-600 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Опыт</Label>
                      <Input
                        type="number"
                        value={editForm.experience || 0}
                        onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) })}
                        className="bg-gray-700 text-white border-gray-600 h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-white text-xs">Здоровье</Label>
                      <Input
                        type="number"
                        value={editForm.health || 0}
                        onChange={(e) => setEditForm({ ...editForm, health: parseInt(e.target.value) })}
                        className="bg-gray-700 text-white border-gray-600 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Макс. здоровье</Label>
                      <Input
                        type="number"
                        value={editForm.max_health || 0}
                        onChange={(e) => setEditForm({ ...editForm, max_health: parseInt(e.target.value) })}
                        className="bg-gray-700 text-white border-gray-600 h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-white text-xs">Атака</Label>
                      <Input
                        type="number"
                        value={editForm.attack || 0}
                        onChange={(e) => setEditForm({ ...editForm, attack: parseInt(e.target.value) })}
                        className="bg-gray-700 text-white border-gray-600 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Защита</Label>
                      <Input
                        type="number"
                        value={editForm.defense || 0}
                        onChange={(e) => setEditForm({ ...editForm, defense: parseInt(e.target.value) })}
                        className="bg-gray-700 text-white border-gray-600 h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-xs">Золото</Label>
                    <Input
                      type="number"
                      value={editForm.gold || 0}
                      onChange={(e) => setEditForm({ ...editForm, gold: parseInt(e.target.value) })}
                      className="bg-gray-700 text-white border-gray-600 h-8"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-white space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400">Класс:</div>
                      <div>{getClassName(player.character_class)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Уровень:</div>
                      <div>{player.level}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400">Здоровье:</div>
                      <div className="text-red-400">❤️ {player.health}/{player.max_health}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Мана:</div>
                      <div className="text-blue-400">🔮 {player.mana}/{player.max_mana}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400">Атака:</div>
                      <div className="text-orange-400">⚔️ {player.attack}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Защита:</div>
                      <div className="text-green-400">🛡️ {player.defense}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400">Золото:</div>
                    <div className="text-yellow-400">💰 {player.gold}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400">Опыт:</div>
                    <div className="text-purple-400">⭐ {player.experience}</div>
                  </div>
                  
                  {(player.strength || player.dexterity || player.magic || player.endurance || player.luck) && (
                    <div className="bg-gray-700 rounded p-2">
                      <div className="text-gray-400 text-xs mb-1">Характеристики:</div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        {player.strength && <div>💪 {player.strength}</div>}
                        {player.dexterity && <div>🏃 {player.dexterity}</div>}
                        {player.magic && <div>🔮 {player.magic}</div>}
                        {player.endurance && <div>🏋️ {player.endurance}</div>}
                        {player.luck && <div>🍀 {player.luck}</div>}
                      </div>
                      {player.free_stat_points && player.free_stat_points > 0 && (
                        <div className="text-green-400 text-xs mt-1">
                          Свободных очков: {player.free_stat_points}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-gray-500 text-xs">
                    Создан: {new Date(player.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="text-center py-8">
            <div className="text-gray-400">
              {searchTerm ? 'Игроки не найдены' : 'Нет зарегистрированных игроков'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPlayers;
