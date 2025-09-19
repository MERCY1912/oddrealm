import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Eye, EyeOff, Sword, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlayerClass } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  onAuthSuccess: () => void;
  onShowPasswordReset?: () => void;
  onClose?: () => void;
}

const AuthModal = ({ onAuthSuccess, onShowPasswordReset, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('warrior');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const classes = [
    {
      id: 'warrior' as PlayerClass,
      name: 'Воин Тьмы',
      emoji: '⚔️',
      icon: Sword,
      description: 'Безжалостный мастер клинка',
      stats: 'Высокие здоровье и атака',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/50'
    },
    {
      id: 'mage' as PlayerClass,
      name: 'Некромант',
      emoji: '🔮',
      icon: Zap,
      description: 'Повелитель темной магии',
      stats: 'Высокие мана и магия',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/50'
    },
    {
      id: 'archer' as PlayerClass,
      name: 'Убийца',
      emoji: '🏹',
      icon: Shield,
      description: 'Меткий стрелок смерти',
      stats: 'Сбалансированные характеристики',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/50'
    },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
      
      toast({
        title: 'Регистрация успешна!',
        description: 'Проверьте почту для подтверждения аккаунта',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 shadow-2xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
        
        <CardHeader className="text-center pb-2 sm:pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            ⚔️ КРОВАВЫЕ АРЕНЫ
          </CardTitle>
          <p className="text-gray-400 text-xs sm:text-sm">Войдите в мир жестокости и темной магии</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-red-600 text-xs sm:text-sm">
                Вход
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-red-600 text-xs sm:text-sm">
                Регистрация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="login-email" className="text-white font-semibold text-sm sm:text-base">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-gray-800 border-gray-600 text-white focus:border-red-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="login-password" className="text-white font-semibold text-sm sm:text-base">
                    Пароль
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-gray-800 border-gray-600 text-white focus:border-red-500 pr-10 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 sm:py-3 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Вход...' : 'ВОЙТИ В АРЕНУ'}
                </Button>
              </form>

              <div className="text-center space-y-2">
                {onShowPasswordReset && (
                  <button
                    onClick={onShowPasswordReset}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors"
                  >
                    Забыли пароль?
                  </button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="reg-email" className="text-white font-semibold text-sm sm:text-base">
                    Email
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-gray-800 border-gray-600 text-white focus:border-red-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="reg-password" className="text-white font-semibold text-sm sm:text-base">
                    Пароль
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-gray-800 border-gray-600 text-white focus:border-red-500 pr-10 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="reg-username" className="text-white font-semibold text-sm sm:text-base">
                    Имя воина
                  </Label>
                  <Input
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите имя героя"
                    className="bg-gray-800 border-gray-600 text-white focus:border-red-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-white font-semibold text-sm sm:text-base">
                    Выберите класс воина
                  </Label>
                  <div className="grid gap-2 sm:gap-3">
                    {classes.map((cls) => {
                      const Icon = cls.icon;
                      return (
                        <div
                          key={cls.id}
                          className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedClass === cls.id
                              ? `${cls.bgColor} ${cls.borderColor} shadow-lg`
                              : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedClass(cls.id)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`p-1 sm:p-2 rounded-lg ${cls.bgColor} ${cls.borderColor} border`}>
                              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${cls.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold text-sm sm:text-base ${cls.color}`}>
                                {cls.emoji} {cls.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400">
                                {cls.description}
                              </div>
                              <div className={`text-xs ${cls.color} font-semibold`}>
                                {cls.stats}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 sm:py-3 text-sm sm:text-base"
                  disabled={loading || !username.trim()}
                >
                  {loading ? 'Создание...' : 'СОЗДАТЬ ВОИНА'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
