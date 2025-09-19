import React, { useState } from 'react';
import OrnateFrame from './OrnateFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChangePasswordProps {
  onBack: () => void;
}

const ChangePassword = ({ onBack }: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Проверяем совпадение паролей
      if (newPassword !== confirmPassword) {
        throw new Error('Новые пароли не совпадают');
      }

      // Проверяем длину пароля
      if (newPassword.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      // Получаем текущего пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Пользователь не найден');
      }

      // Обновляем пароль
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Пароль изменен',
        description: 'Ваш пароль успешно обновлен',
        variant: 'default',
      });

      // Очищаем форму
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Возвращаемся назад
      onBack();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="medieval-title text-5xl medieval-accent-blood mb-2">
            ⚔️ КРОВАВЫЕ АРЕНЫ
          </h1>
          <p className="medieval-subtitle text-lg">
            Мир жестокости и темной магии
          </p>
        </div>

        <OrnateFrame title="СМЕНА ПАРОЛЯ" tone="epic" corners={4} edges>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="medieval-text-primary font-bold">
                Текущий пароль
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-700 border-red-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="medieval-text-primary font-bold">
                Новый пароль
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-700 border-red-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="medieval-text-primary font-bold">
                Подтвердите новый пароль
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-700 border-red-600 text-white"
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full medieval-button bg-blood hover:bg-red-700 text-white font-bold text-lg py-3"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            >
              {loading ? 'Изменение...' : 'ИЗМЕНИТЬ ПАРОЛЬ'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onBack}
              className="medieval-accent-blood hover:text-red-300 text-sm font-bold transition-colors"
            >
              Вернуться в игру
            </button>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default ChangePassword;
