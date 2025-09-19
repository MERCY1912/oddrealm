import React, { useState } from 'react';
import OrnateFrame from './OrnateFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { PlayerClass } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface AuthProps {
  onAuthSuccess: () => void;
  onShowPasswordReset?: () => void;
}

const Auth = ({ onAuthSuccess, onShowPasswordReset }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('warrior');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const classes = [
    {
      id: 'warrior' as PlayerClass,
      name: 'Воин Тьмы',
      emoji: '⚔️',
      description: 'Безжалостный мастер клинка, жаждущий крови',
      stats: 'Высокие здоровье и атака ближнего боя',
    },
    {
      id: 'mage' as PlayerClass,
      name: 'Некромант',
      emoji: '🔮',
      description: 'Повелитель темной магии и проклятий',
      stats: 'Высокие мана и магическая атака',
    },
    {
      id: 'archer' as PlayerClass,
      name: 'Убийца',
      emoji: '🏹',
      description: 'Меткий стрелок, несущий смерть издалека',
      stats: 'Сбалансированные характеристики',
    },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              character_class: selectedClass,
            },
          },
        });
        if (error) throw error;
      }

      onAuthSuccess();
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

        <OrnateFrame title={isLogin ? 'ВХОД В КРОВАВЫЕ АРЕНЫ' : 'СОЗДАНИЕ ВОИНА ТЬМЫ'} tone="epic" corners={4} edges>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="email" className="medieval-text-primary font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-gray-700 border-red-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="medieval-text-primary font-bold">
                  Пароль
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

              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="username" className="medieval-text-primary font-bold">
                      Имя воина
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Введите имя героя"
                      className="bg-gray-700 border-red-600 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label className="medieval-text-primary mb-3 block font-bold">
                      Выберите класс воина
                    </Label>
                    <div className="space-y-2">
                      {classes.map((cls) => (
                        <div
                          key={cls.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedClass === cls.id
                              ? 'medieval-border-gold medieval-bg-tertiary shadow-glow-gold'
                              : 'medieval-border medieval-bg-secondary hover:medieval-border-gold'
                          }`}
                          onClick={() => setSelectedClass(cls.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cls.emoji}</span>
                            <div>
                              <div className="font-bold medieval-accent-blood">{cls.name}</div>
                              <div className="text-sm medieval-text-primary">
                                {cls.description}
                              </div>
                              <div className="text-xs medieval-accent-gold">
                                {cls.stats}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Button 
                type="submit"
                className="w-full medieval-button bg-blood hover:bg-red-700 text-white font-bold text-lg py-3"
                disabled={loading || (!isLogin && !username.trim())}
              >
                {loading ? 'Загрузка...' : isLogin ? 'ВОЙТИ В АРЕНУ' : 'СОЗДАТЬ ВОИНА'}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="medieval-accent-blood hover:text-red-300 text-sm font-bold transition-colors block"
              >
                {isLogin ? 'Создать нового воина' : 'Уже есть аккаунт?'}
              </button>
              {isLogin && onShowPasswordReset && (
                <button
                  onClick={onShowPasswordReset}
                  className="medieval-accent-gold hover:text-yellow-300 text-sm font-bold transition-colors block"
                >
                  Забыли пароль?
                </button>
              )}
            </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default Auth;
