import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DungeonCompletionResult, DungeonTier } from '@/types/game';
import { getTierByNumber } from '@/data/dungeonTiers';

interface DungeonCompletionProps {
  result: DungeonCompletionResult;
  currentTier: DungeonTier;
  onContinue: () => void;
  onReturnToTown: () => void;
}

const DungeonCompletion = ({ result, currentTier, onContinue, onReturnToTown }: DungeonCompletionProps) => {
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'gold': return '💰';
      case 'exp': return '⭐';
      case 'items': return '🎁';
      default: return '✨';
    }
  };

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('первый')) return '🥇';
    if (achievement.includes('уровень')) return '📈';
    if (achievement.includes('босс')) return '👑';
    if (achievement.includes('серия')) return '🔥';
    return '🏆';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="bg-gray-800 border-gray-600 max-w-2xl w-full mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-yellow-400 mb-2">
            🎉 Подземелье пройдено!
          </CardTitle>
          <div className="text-lg text-gray-300">
            {currentTier.name} - Уровень {currentTier.tier}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Награды */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🎁</span>
              Полученные награды
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">{getRewardIcon('gold')}</div>
                <div className="text-lg font-bold text-yellow-400">{result.rewards.gold}</div>
                <div className="text-sm text-gray-400">золота</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{getRewardIcon('exp')}</div>
                <div className="text-lg font-bold text-blue-400">{result.rewards.exp}</div>
                <div className="text-sm text-gray-400">опыта</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{getRewardIcon('items')}</div>
                <div className="text-lg font-bold text-purple-400">{result.rewards.items.length}</div>
                <div className="text-sm text-gray-400">предметов</div>
              </div>
            </div>
          </div>

          {/* Достижения */}
          {result.progress.achievements.length > 0 && (
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <span>🏆</span>
                Достижения
              </h3>
              <div className="space-y-2">
                {result.progress.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <span className="text-lg">{getAchievementIcon(achievement)}</span>
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Прогресс */}
          {result.progress.tierUnlocked && result.progress.newTier && (
            <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span>🔓</span>
                Новый уровень разблокирован!
              </h3>
              <div className="text-gray-300">
                Теперь доступен уровень {result.progress.newTier} подземелий
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-4 justify-center">
            {result.progress.tierUnlocked && result.progress.newTier && (
              <Button
                onClick={onContinue}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                🚀 Продолжить на уровень {result.progress.newTier}
              </Button>
            )}
            <Button
              onClick={onReturnToTown}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              🏠 Вернуться в город
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DungeonCompletion;




