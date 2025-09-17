import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const PlayerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: 'Темный Воин',
      class: 'Воин Тьмы',
      rating: 5,
      text: 'Невероятная игра! Битвы эпические, экипировка разнообразная. Провел уже 100+ часов и не могу остановиться!',
      avatar: '⚔️'
    },
    {
      id: 2,
      name: 'Некромант',
      class: 'Маг',
      rating: 5,
      text: 'Лучшая RPG в жанре фэнтези! Графика потрясающая, геймплей захватывающий. Рекомендую всем!',
      avatar: '🔮'
    },
    {
      id: 3,
      name: 'Убийца',
      class: 'Лучник',
      rating: 5,
      text: 'PvP арены просто безумные! Каждая битва - это адреналин. Сообщество отличное, всегда есть с кем сразиться.',
      avatar: '🏹'
    },
    {
      id: 4,
      name: 'Кровавый Король',
      class: 'Воин Тьмы',
      rating: 5,
      text: 'Собираю легендарную экипировку уже месяц! Каждый предмет уникален. Разработчики молодцы!',
      avatar: '👑'
    }
  ];

  return (
    <div className="mb-8 sm:mb-16">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Что говорят воины
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Отзывы наших игроков о Кровавых Аренах
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">{review.avatar}</div>
                <div>
                  <div className="font-bold text-white text-sm sm:text-base">{review.name}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{review.class}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-2 sm:mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div className="relative">
                <Quote className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 h-4 w-4 sm:h-6 sm:w-6 text-red-500/30" />
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed pl-3 sm:pl-4">
                  {review.text}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerReviews;
