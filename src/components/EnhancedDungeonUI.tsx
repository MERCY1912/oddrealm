import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  EnhancedDungeonRun, 
  DungeonAffix, 
  DungeonGoal, 
  ExpeditionResource, 
  ExplorationPoints,
  ThreatLevel 
} from '@/types/game';
import { getResourceStatusDescription, getExplorationDescription } from '@/utils/explorationPoints';

interface EnhancedDungeonUIProps {
  dungeonRun: EnhancedDungeonRun;
  onExitDungeon?: () => void;
  compact?: boolean;
}

export default function EnhancedDungeonUI({ 
  dungeonRun, 
  onExitDungeon,
  compact = false 
}: EnhancedDungeonUIProps) {
  const resourceStatus = getResourceStatusDescription(dungeonRun.resources);
  const explorationInfo = getExplorationDescription(dungeonRun.explorationPoints);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
        <GoalProgress goal={dungeonRun.goal} compact />
        <TorchCounter resource={dungeonRun.resources} compact />
        <ExplorationCounter points={dungeonRun.explorationPoints} compact />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Цель подземелья */}
      <GoalPanel goal={dungeonRun.goal} />
      
      {/* Ресурсы экспедиции */}
      <ResourcePanel resource={dungeonRun.resources} status={resourceStatus} />
      
      {/* Очки исследования */}
      <ExplorationPanel points={dungeonRun.explorationPoints} info={explorationInfo} />
      
      {/* Активные аффиксы */}
      <AffixesPanel affixes={dungeonRun.affixes} />
      
      {/* Кнопка выхода */}
      {onExitDungeon && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onExitDungeon}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            🚪 Покинуть подземелье
          </button>
        </div>
      )}
    </div>
  );
}

// Компонент панели цели
function GoalPanel({ goal }: { goal: DungeonGoal }) {
  const progress = (goal.current / goal.required) * 100;
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{goal.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            Цель подземелья
          </h3>
          <p className="text-gray-300 text-sm mb-2">{goal.description}</p>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium text-white">
              {goal.current}/{goal.required}
            </span>
            {goal.completed && (
              <Badge className="bg-green-600 text-white">✓ Выполнено</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Компонент панели ресурсов
function ResourcePanel({ 
  resource, 
  status 
}: { 
  resource: ExpeditionResource; 
  status: ReturnType<typeof getResourceStatusDescription>;
}) {
  const percentage = (resource.torches / resource.maxTorches) * 100;
  const statusColors = {
    abundant: 'text-green-400',
    moderate: 'text-yellow-400',
    low: 'text-orange-400',
    exhausted: 'text-red-400'
  };
  
  return (
    <Card className="p-4 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-500/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            Факелы экспедиции
          </h3>
          <p className={`text-sm mb-2 ${statusColors[status.status]}`}>
            {status.description}
          </p>
          {status.warning && (
            <p className="text-red-400 text-xs mb-2">⚠️ {status.warning}</p>
          )}
          <div className="flex items-center gap-3">
            <Progress value={percentage} className="flex-1 h-2" />
            <span className="text-sm font-medium text-white">
              {resource.torches}/{resource.maxTorches}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Компонент панели исследования
function ExplorationPanel({ 
  points, 
  info 
}: { 
  points: ExplorationPoints; 
  info: ReturnType<typeof getExplorationDescription>;
}) {
  const rankColors = {
    novice: 'text-gray-400',
    explorer: 'text-blue-400',
    veteran: 'text-purple-400',
    master: 'text-gold-400'
  };
  
  const rankNames = {
    novice: 'Новичок',
    explorer: 'Исследователь',
    veteran: 'Ветеран',
    master: 'Мастер'
  };
  
  return (
    <Card className="p-4 bg-gradient-to-r from-green-900/20 to-teal-900/20 border-green-500/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-white">
              Очки исследования
            </h3>
            <Badge className={`${rankColors[info.rank]} bg-gray-700`}>
              {rankNames[info.rank]}
            </Badge>
          </div>
          <p className="text-gray-300 text-sm mb-2">
            Всего: {info.total} очков ({info.breakdown})
          </p>
          <p className="text-green-400 text-sm">
            Бонус к наградам: {info.multiplier}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Компонент панели аффиксов
function AffixesPanel({ affixes }: { affixes: DungeonAffix[] }) {
  if (affixes.length === 0) return null;
  
  return (
    <Card className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-semibold text-white">
          Активные аффиксы
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {affixes.map((affix, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              affix.positive 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-red-900/20 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{affix.icon}</span>
              <span className={`font-medium ${
                affix.positive ? 'text-green-400' : 'text-red-400'
              }`}>
                {affix.name}
              </span>
            </div>
            <p className="text-gray-300 text-xs">
              {affix.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Компактные компоненты для мини-дисплея

function GoalProgress({ goal, compact }: { goal: DungeonGoal; compact?: boolean }) {
  const progress = (goal.current / goal.required) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{goal.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="flex-1 h-1" />
          <span className="text-xs text-white whitespace-nowrap">
            {goal.current}/{goal.required}
          </span>
        </div>
      </div>
      {goal.completed && <span className="text-green-400 text-xs">✓</span>}
    </div>
  );
}

function TorchCounter({ resource, compact }: { resource: ExpeditionResource; compact?: boolean }) {
  const percentage = (resource.torches / resource.maxTorches) * 100;
  const color = percentage > 50 ? 'text-orange-400' : percentage > 25 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">🔥</span>
      <span className={`text-sm font-medium ${color}`}>
        {resource.torches}/{resource.maxTorches}
      </span>
    </div>
  );
}

function ExplorationCounter({ points, compact }: { points: ExplorationPoints; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">🗺️</span>
      <span className="text-sm font-medium text-green-400">
        {points.current}
      </span>
    </div>
  );
}

// Компонент отображения угрозы комнаты
export function RoomThreatIndicator({ 
  threatLevel, 
  hint 
}: { 
  threatLevel: ThreatLevel; 
  hint?: string;
}) {
  const stars = '★'.repeat(threatLevel) + '☆'.repeat(3 - threatLevel);
  const colors = {
    1: 'text-green-400',
    2: 'text-yellow-400', 
    3: 'text-red-400'
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${colors[threatLevel]}`}>
        {stars}
      </span>
      {hint && (
        <span className="text-xs text-gray-400 italic">
          {hint}
        </span>
      )}
    </div>
  );
}

