import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sword, Shield, Zap, Users, Trophy, Star } from 'lucide-react';
import arenaImage from '@/assets/locations/arena_main.jpg';
import GameStats from './GameStats';
import PlayerReviews from './PlayerReviews';

interface HomePageProps {
  onStartGame: () => void;
}

const HomePage = ({ onStartGame }: HomePageProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'battle',
      icon: Sword,
      title: 'Кровавые Битвы',
      description: 'Сражайтесь в эпических поединках с боссами и другими игроками',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30'
    },
    {
      id: 'equipment',
      icon: Shield,
      title: 'Легендарная Экипировка',
      description: 'Собирайте редкие доспехи и оружие с уникальными свойствами',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'magic',
      icon: Zap,
      title: 'Темная Магия',
      description: 'Осваивайте заклинания некромантии и проклятия',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'pvp',
      icon: Users,
      title: 'PvP Арены',
      description: 'Бросайте вызов другим воинам в смертельных дуэлях',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'achievements',
      icon: Trophy,
      title: 'Достижения',
      description: 'Покоряйте арены и получайте легендарные награды',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'ranking',
      icon: Star,
      title: 'Рейтинги',
      description: 'Поднимайтесь в топе лучших воинов мира',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 relative overflow-hidden">
      {/* Background Effects */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-red-400 via-red-600 to-red-800 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
              ⚔️ КРОВАВЫЕ АРЕНЫ
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Войдите в мир жестокости и темной магии, где только сильнейшие выживают в кровавых аренах
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={onStartGame}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-xl px-8 py-4 rounded-lg shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
            >
              ВОЙТИ В АРЕНУ
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10 px-4 py-2 text-lg">
              🏆 БЕСПЛАТНО ИГРАТЬ
            </Badge>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative mb-16">
          <div className="relative mx-auto max-w-4xl">
            <div className="aspect-video rounded-2xl border-2 border-red-500/30 shadow-2xl overflow-hidden">
              <img
                src={arenaImage}
                alt="Кровавые Арены"
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-purple-900/40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">⚔️</div>
                  <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Эпическая Битва</div>
                  <div className="text-white/80 text-lg drop-shadow-lg">Сражайтесь за славу и золото</div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-red-500/20 rounded-full blur-sm"></div>
              <div className="absolute top-8 right-8 w-12 h-12 bg-purple-500/20 rounded-full blur-sm"></div>
              <div className="absolute bottom-8 left-8 w-20 h-20 bg-blue-500/20 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Game Statistics */}
        <GameStats />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer group ${
                  hoveredFeature === feature.id 
                    ? 'scale-105 shadow-2xl' 
                    : 'hover:scale-102'
                } ${feature.bgColor} ${feature.borderColor} border-2`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${feature.bgColor} ${feature.borderColor} border`}>
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${feature.color}`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Player Reviews */}
        <PlayerReviews />

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Готовы к кровавой битве?
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            Присоединяйтесь к тысячам воинов в эпических сражениях за славу и золото
          </p>
          <Button
            onClick={onStartGame}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
          >
            НАЧАТЬ ПУТЕШЕСТВИЕ
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            © 2024 Кровавые Арены. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
