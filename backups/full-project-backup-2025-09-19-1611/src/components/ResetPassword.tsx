import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OrnateFrame from './OrnateFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Проверяем, есть ли валидная сессия для сброса пароля
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Ссылка для сброса пароля недействительна или истекла',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Проверяем совпадение паролей
      if (password !== confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      // Проверяем длину пароля
      if (password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      // Обновляем пароль
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: 'Пароль изменен',
        description: 'Ваш пароль успешно обновлен. Теперь вы можете войти в игру.',
        variant: 'default',
      });

      // Перенаправляем на главную страницу
      navigate('/');
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

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="text-white text-xl">Проверка ссылки...</div>
      </div>
    );
  }

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

        <OrnateFrame title="НОВЫЙ ПАРОЛЬ" tone="epic" corners={4} edges>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="password" className="medieval-text-primary font-bold">
                Новый пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-700 border-red-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="medieval-text-primary font-bold">
                Подтвердите пароль
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
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? 'Сохранение...' : 'СОХРАНИТЬ ПАРОЛЬ'}
            </Button>
          </form>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default ResetPassword;
