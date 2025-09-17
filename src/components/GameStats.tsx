import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Trophy, Sword, Crown } from 'lucide-react';

const GameStats = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Активных воинов',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: Sword,
      value: '50,000+',
      label: 'Проведенных битв',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30'
    },
    {
      icon: Trophy,
      value: '1,000+',
      label: 'Легендарных предметов',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      icon: Crown,
      value: '100+',
      label: 'Эпических боссов',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border-2 hover:scale-105 transition-transform duration-300`}
          >
            <CardContent className="p-4 text-center">
              <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} ${stat.borderColor} border mb-3`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-300 text-sm">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GameStats;
