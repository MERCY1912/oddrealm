
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminBots from './admin/AdminBots';
import AdminShop from './admin/AdminShop';
import AdminTower from './admin/AdminTower';
import AdminTowerBots from './admin/AdminTowerBots';
import AdminPlayers from './admin/AdminPlayers';
import AdminLocations from './admin/AdminLocations';
import AdminHeroAvatarsPage from './admin/AdminHeroAvatarsPage';
import AdminLocationImages from './admin/AdminLocationImages';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Ошибка доступа",
          description: "Необходимо войти в систему",
          variant: "destructive",
        });
        onBack();
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !data) {
        toast({
          title: "Доступ запрещен",
          description: "У вас нет прав администратора",
          variant: "destructive",
        });
        onBack();
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin role:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при проверке прав доступа",
        variant: "destructive",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Проверка прав доступа...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-400">
            🛠️ Панель администратора
          </h1>
          <Button 
            onClick={onBack}
            className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
          >
            ← Назад в игру
          </Button>
        </div>

        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="flex flex-wrap gap-2 bg-gray-700 p-2 rounded-md">
              <TabsTrigger value="players" className="text-white data-[state=active]:bg-blue-700">Игроки</TabsTrigger>
              <TabsTrigger value="shop" className="text-white data-[state=active]:bg-blue-700">Магазин</TabsTrigger>
              <TabsTrigger value="tower" className="text-white data-[state=active]:bg-blue-700">Башни</TabsTrigger>
              <TabsTrigger value="tower-bots" className="text-white data-[state=active]:bg-indigo-700">Боты башни</TabsTrigger>
              <TabsTrigger value="bots" className="text-white data-[state=active]:bg-blue-700">Боты</TabsTrigger>
              <TabsTrigger value="locations" className="text-white data-[state=active]:bg-yellow-600">Локации</TabsTrigger>
              <TabsTrigger value="location-images" className="text-white data-[state=active]:bg-green-600">Картинки локаций</TabsTrigger>
              <TabsTrigger value="avatars" className="text-white data-[state=active]:bg-purple-600">Образы героев</TabsTrigger>
            </TabsList>
            <TabsContent value="players" className="mt-4">
              <AdminPlayers />
            </TabsContent>
            <TabsContent value="shop" className="mt-4">
              <AdminShop />
            </TabsContent>
            <TabsContent value="tower" className="mt-4">
              <AdminTower />
            </TabsContent>
            <TabsContent value="tower-bots" className="mt-4">
              <AdminTowerBots />
            </TabsContent>
            <TabsContent value="bots" className="mt-4">
              <AdminBots />
            </TabsContent>
            <TabsContent value="locations" className="mt-4">
              <AdminLocations />
            </TabsContent>
            <TabsContent value="location-images" className="mt-4">
              <AdminLocationImages />
            </TabsContent>
            <TabsContent value="avatars" className="mt-4">
              <AdminHeroAvatarsPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
