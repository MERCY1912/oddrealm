import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminShopV2 from './admin/AdminShopV2';

interface AdminPanelV2Props {
  onBack: () => void;
}

const AdminPanelV2 = ({ onBack }: AdminPanelV2Props) => {
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
            🛠️ Панель администратора v2
          </h1>
          <Button 
            onClick={onBack}
            className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
          >
            ← Назад в игру
          </Button>
        </div>

        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="flex flex-wrap gap-2 bg-gray-700 p-2 rounded-md">
              <TabsTrigger value="items" className="text-white data-[state=active]:bg-green-700">
                🎮 Предметы
              </TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="mt-4">
              <AdminShopV2 />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelV2;
