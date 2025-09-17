
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlayerClass } from '@/types/game';

interface AuthFormsProps {
  onLogin: (name: string, playerClass: PlayerClass) => void;
}

const AuthForms = ({ onLogin }: AuthFormsProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('warrior');

  const classes = [
    {
      id: 'warrior' as PlayerClass,
      name: 'Воин',
      emoji: '⚔️',
      description: 'Сильный и выносливый боец ближнего боя',
      stats: 'Высокие здоровье и защита',
    },
    {
      id: 'mage' as PlayerClass,
      name: 'Маг',
      emoji: '🔮',
      description: 'Мастер магических искусств',
      stats: 'Высокие мана и атака',
    },
    {
      id: 'archer' as PlayerClass,
      name: 'Лучник',
      emoji: '🏹',
      description: 'Меткий стрелок дальнего боя',
      stats: 'Сбалансированные характеристики',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name, selectedClass);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2">
            ⚔️ Легенды Средневековья
          </h1>
          <p className="text-gray-300">
            Браузерная RPG в мире рыцарей и магии
          </p>
        </div>

        <Card className="bg-gray-800 border-yellow-600 text-white">
          <CardHeader>
            <CardTitle className="text-center text-yellow-400">
              {isLogin ? 'Вход в игру' : 'Создание персонажа'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">
                  Имя персонажа
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя героя"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label className="text-white mb-3 block">
                    Выберите класс
                  </Label>
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedClass === cls.id
                            ? 'border-yellow-600 bg-yellow-600/20'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedClass(cls.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cls.emoji}</span>
                          <div>
                            <div className="font-bold">{cls.name}</div>
                            <div className="text-sm text-gray-300">
                              {cls.description}
                            </div>
                            <div className="text-xs text-yellow-400">
                              {cls.stats}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                disabled={!name.trim()}
              >
                {isLogin ? 'Войти в игру' : 'Создать персонажа'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-yellow-400 hover:text-yellow-300 text-sm"
              >
                {isLogin ? 'Создать нового персонажа' : 'У меня уже есть персонаж'}
              </button>
            </div>

            <div className="mt-6 p-3 bg-blue-900/50 rounded-lg">
              <p className="text-blue-300 text-sm text-center">
                💡 Для полной функциональности (сохранение прогресса, многопользовательский чат) 
                подключите Supabase интеграцию
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForms;
