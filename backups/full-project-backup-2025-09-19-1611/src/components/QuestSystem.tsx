import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/types/game';

interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: {
    level?: number;
    strength?: number;
    dexterity?: number;
    magic?: number;
    luck?: number;
    endurance?: number;
  };
  rewards: {
    experience: number;
    gold: number;
    items?: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  completed: boolean;
}

interface QuestSystemProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
}

const quests: Quest[] = [
  {
    id: 'first_steps',
    title: 'Первые шаги',
    description: 'Достигните 2 уровня и изучите основы боя.',
    requirements: { level: 2 },
    rewards: { experience: 50, gold: 100 },
    difficulty: 'easy',
    completed: false,
  },
  {
    id: 'gear_up',
    title: 'Экипировка',
    description: 'Купите любое оружие и броню в магазине.',
    requirements: {},
    rewards: { experience: 75, gold: 150 },
    difficulty: 'easy',
    completed: false,
  },
  {
    id: 'strong_warrior',
    title: 'Сильный воин',
    description: 'Достигните 15 силы для выполнения этого квеста.',
    requirements: { strength: 15 },
    rewards: { experience: 200, gold: 300 },
    difficulty: 'medium',
    completed: false,
  },
  {
    id: 'agile_fighter',
    title: 'Ловкий боец',
    description: 'Развейте ловкость до 15 для освоения уклонений.',
    requirements: { dexterity: 15 },
    rewards: { experience: 200, gold: 300 },
    difficulty: 'medium',
    completed: false,
  },
  {
    id: 'master_mage',
    title: 'Мастер магии',
    description: 'Достигните 20 магии и станьте могущественным чародеем.',
    requirements: { magic: 20 },
    rewards: { experience: 500, gold: 800 },
    difficulty: 'hard',
    completed: false,
  },
  {
    id: 'legendary_hero',
    title: 'Легендарный герой',
    description: 'Достигните 10 уровня и докажите свое величие.',
    requirements: { level: 10 },
    rewards: { experience: 1000, gold: 2000 },
    difficulty: 'legendary',
    completed: false,
  },
];

const QuestSystem = ({ player, onPlayerUpdate }: QuestSystemProps) => {
  const [playerQuests, setPlayerQuests] = useState<Quest[]>(() => {
    // Загружаем состояние квестов из localStorage
    const savedQuests = localStorage.getItem('completedQuests');
    if (savedQuests) {
      const completedQuestIds = JSON.parse(savedQuests);
      // Фильтруем квесты, исключая уже выполненные
      return quests.filter(quest => !completedQuestIds.includes(quest.id));
    }
    return quests;
  });
  const { toast } = useToast();

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
    legendary: 'bg-purple-500',
  };

  const difficultyNames = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный',
    legendary: 'Легендарный',
  };

  const canCompleteQuest = (quest: Quest): boolean => {
    if (quest.completed) return false;
    
    const req = quest.requirements;
    return (
      (!req.level || player.level >= req.level) &&
      (!req.strength || player.strength >= req.strength) &&
      (!req.dexterity || player.dexterity >= req.dexterity) &&
      (!req.magic || player.magic >= req.magic) &&
      (!req.luck || player.luck >= req.luck) &&
      (!req.endurance || player.endurance >= req.endurance)
    );
  };

  const completeQuest = (questId: string) => {
    const quest = playerQuests.find(q => q.id === questId);
    if (!quest || !canCompleteQuest(quest)) return;

    // Удаляем квест из списка
    const updatedQuests = playerQuests.filter(q => q.id !== questId);
    setPlayerQuests(updatedQuests);

    // Сохраняем ID выполненного квеста в localStorage
    const savedQuests = localStorage.getItem('completedQuests');
    const completedQuestIds = savedQuests ? JSON.parse(savedQuests) : [];
    completedQuestIds.push(questId);
    localStorage.setItem('completedQuests', JSON.stringify(completedQuestIds));

    const updatedPlayer = {
      ...player,
      experience: player.experience + quest.rewards.experience,
      gold: player.gold + quest.rewards.gold,
    };

    onPlayerUpdate(updatedPlayer);

    toast({
      title: 'Квест выполнен!',
      description: `Получено: ${quest.rewards.experience} опыта, ${quest.rewards.gold} золота`,
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-600 text-white">
      <CardHeader>
        <CardTitle className="text-center text-yellow-400">📜 КВЕСТЫ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {playerQuests.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-lg font-bold mb-2">Все квесты выполнены!</div>
            <div className="text-sm">Поздравляем! Вы завершили все доступные квесты.</div>
          </div>
        ) : (
          playerQuests.map((quest) => (
            <div 
              key={quest.id}
              className={`p-4 rounded-lg border-2 ${
                canCompleteQuest(quest)
                  ? 'bg-yellow-900/30 border-yellow-500'
                  : 'bg-gray-700 border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{quest.title}</h3>
                <Badge className={difficultyColors[quest.difficulty]}>
                  {difficultyNames[quest.difficulty]}
                </Badge>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
              
              {Object.keys(quest.requirements).length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Требования:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(quest.requirements).map(([key, value]) => (
                      <span 
                        key={key} 
                        className={`text-xs px-2 py-1 rounded ${
                          (player as any)[key] >= value ? 'bg-green-600' : 'bg-red-600'
                        }`}
                      >
                        {key === 'level' ? 'Уровень' : 
                         key === 'strength' ? 'Сила' :
                         key === 'dexterity' ? 'Ловкость' :
                         key === 'magic' ? 'Магия' :
                         key === 'luck' ? 'Удача' :
                         key === 'endurance' ? 'Выносливость' : key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Награды:</div>
                <div className="text-sm text-yellow-300">
                  💰 {quest.rewards.gold} золота, ⭐ {quest.rewards.experience} опыта
                </div>
              </div>
              
              {canCompleteQuest(quest) ? (
                <Button 
                  onClick={() => completeQuest(quest.id)}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Получить награду
                </Button>
              ) : (
                <Badge variant="outline" className="text-gray-400">
                  Требования не выполнены
                </Badge>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default QuestSystem;
