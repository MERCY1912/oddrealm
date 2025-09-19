import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttributeDistributionProps {
  player: any;
  pendingChanges: any;
  availablePoints: number;
  onIncreaseAttribute: (attribute: string) => void;
  onDecreaseAttribute: (attribute: string) => void;
  onSaveChanges: () => void;
  onResetChanges: () => void;
}

const AttributeDistribution = ({
  player,
  pendingChanges,
  availablePoints,
  onIncreaseAttribute,
  onDecreaseAttribute,
  onSaveChanges,
  onResetChanges,
}: AttributeDistributionProps) => {
  const hasPendingChanges = Object.values(pendingChanges).some((val: any) => (val as number) > 0);
  const hasAnyFreePoints = availablePoints > 0 || player.free_stat_points > 0;

  return (
    <div className="space-y-3">
      {/* Free points - always show if player has any free points */}
      {hasAnyFreePoints && (
        <div className="bg-green-900 border border-green-500 rounded p-3 text-center">
          <div className="text-green-400 text-sm font-bold mb-1">СВОБОДНЫЕ ОЧКИ</div>
          <div className="text-yellow-400 text-2xl font-bold">{availablePoints}</div>
          <div className="text-green-300 text-xs mt-1">
            {availablePoints > 0 ? 'Нажмите "+" чтобы распределить' : 'Распределите очки и сохраните'}
          </div>
        </div>
      )}

      {/* Attributes */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-2">АТРИБУТЫ</h4>
        <div className="space-y-2">
          {[
            { key: 'strength', label: 'Сила', value: player.strength, color: 'text-red-400' },
            { key: 'dexterity', label: 'Ловкость', value: player.dexterity, color: 'text-green-400' },
            { key: 'luck', label: 'Удача', value: player.luck, color: 'text-yellow-400' },
            { key: 'endurance', label: 'Выносливость', value: player.endurance, color: 'text-purple-400' },
            { key: 'magic', label: 'Магия', value: player.magic, color: 'text-blue-400' },
          ].map(({ key, label, value, color }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-400 w-20">{label}:</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium w-12 text-center ${color}`}>
                  {value + pendingChanges[key]}
                  {pendingChanges[key] > 0 && (
                    <span className="text-green-400 ml-1">+{pendingChanges[key]}</span>
                  )}
                </span>
                
                {/* Always show buttons when player has free points or pending changes */}
                {hasAnyFreePoints && (
                  <div className="flex items-center gap-1">
                    {pendingChanges[key] > 0 && (
                      <button
                        onClick={() => onDecreaseAttribute(key)}
                        className="bg-red-600 hover:bg-red-500 text-white rounded w-7 h-7 flex items-center justify-center transition-colors"
                        title={`Уменьшить ${label}`}
                      >
                        <Minus size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onIncreaseAttribute(key)}
                      disabled={availablePoints <= 0}
                      className={`w-7 h-7 flex items-center justify-center transition-colors rounded ${
                        availablePoints > 0
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                      title={`Увеличить ${label}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save/Reset buttons */}
      {hasPendingChanges && (
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onSaveChanges}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-2"
          >
            Сохранить
          </Button>
          <Button
            onClick={onResetChanges}
            variant="outline"
            className="flex-1 text-xs py-2 border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Сбросить
          </Button>
        </div>
      )}

      {/* Show message when no free points available */}
      {!hasAnyFreePoints && (
        <div className="text-center text-gray-400 text-xs py-2 border border-gray-600 rounded">
          Нет свободных очков атрибутов.<br/>
          Повысьте уровень для получения новых очков.
        </div>
      )}

      {/* Modifiers */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-2 border-t border-gray-600 pt-2">МОДИФИКАТОРЫ</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Бонус атаки:</span>
            <span className="text-green-400">+{Math.floor((player.strength + pendingChanges.strength) / 2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Бонус защиты:</span>
            <span className="text-blue-400">+{Math.floor((player.dexterity + pendingChanges.dexterity) / 3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Бонус удачи:</span>
            <span className="text-yellow-400">+{Math.floor((player.luck + pendingChanges.luck) / 4)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Бонус HP:</span>
            <span className="text-red-400">+{Math.floor((player.endurance + pendingChanges.endurance) * 2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Бонус MP:</span>
            <span className="text-purple-400">+{Math.floor((player.magic + pendingChanges.magic) * 1.5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeDistribution;
