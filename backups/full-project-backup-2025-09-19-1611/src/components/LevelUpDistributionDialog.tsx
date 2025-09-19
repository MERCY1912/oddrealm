
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Minus } from 'lucide-react';

interface LevelUpDistributionDialogProps {
  isOpen: boolean;
  pointsToDistribute: number;
  playerLevel: number;
  onDistribute: (distribution: any) => void;
}

const LevelUpDistributionDialog = ({
  isOpen,
  pointsToDistribute,
  playerLevel,
  onDistribute,
}: LevelUpDistributionDialogProps) => {
  const [distribution, setDistribution] = useState({
    strength: 0,
    dexterity: 0,
    luck: 0,
    endurance: 0,
    magic: 0,
  });

  const totalDistributed = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const remainingPoints = pointsToDistribute - totalDistributed;
  const canConfirm = remainingPoints === 0;

  const increaseAttribute = (attribute: string) => {
    if (remainingPoints > 0) {
      setDistribution(prev => ({
        ...prev,
        [attribute]: prev[attribute] + 1,
      }));
    }
  };

  const decreaseAttribute = (attribute: string) => {
    if (distribution[attribute] > 0) {
      setDistribution(prev => ({
        ...prev,
        [attribute]: prev[attribute] - 1,
      }));
    }
  };

  const handleConfirm = () => {
    if (canConfirm) {
      onDistribute(distribution);
      // Reset distribution for next time
      setDistribution({
        strength: 0,
        dexterity: 0,
        luck: 0,
        endurance: 0,
        magic: 0,
      });
    }
  };

  const attributes = [
    { key: 'strength', label: 'Сила', color: 'text-red-400', description: '+2 атака за очко' },
    { key: 'dexterity', label: 'Ловкость', color: 'text-green-400', description: '+1 защита за очко' },
    { key: 'luck', label: 'Удача', color: 'text-yellow-400', description: 'Увеличивает шанс критического урона' },
    { key: 'endurance', label: 'Выносливость', color: 'text-purple-400', description: '+5 HP за очко' },
    { key: 'magic', label: 'Магия', color: 'text-blue-400', description: '+3 MP за очко' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent 
        className="bg-gray-800 border-yellow-500 text-white max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-xl text-center">
            🎉 Уровень {playerLevel}!
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            У вас есть {pointsToDistribute} очков для распределения!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Remaining points indicator */}
          <div className="bg-green-900 border border-green-500 rounded p-3 text-center">
            <div className="text-green-400 text-sm font-bold mb-1">СВОБОДНЫЕ ОЧКИ</div>
            <div className="text-yellow-400 text-2xl font-bold">{remainingPoints}</div>
            <div className="text-green-300 text-xs mt-1">
              {remainingPoints > 0 ? 'Распределите все очки для продолжения' : 'Все очки распределены!'}
            </div>
          </div>

          {/* Attributes distribution */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm text-center">РАСПРЕДЕЛЕНИЕ АТРИБУТОВ</h4>
            {attributes.map(({ key, label, color, description }) => (
              <div key={key} className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className={`font-medium ${color}`}>{label}</span>
                    <div className="text-xs text-gray-400">{description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold w-8 text-center">
                      {distribution[key]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => decreaseAttribute(key)}
                        disabled={distribution[key] === 0}
                        className={`w-7 h-7 flex items-center justify-center transition-colors rounded ${
                          distribution[key] > 0
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => increaseAttribute(key)}
                        disabled={remainingPoints === 0}
                        className={`w-7 h-7 flex items-center justify-center transition-colors rounded ${
                          remainingPoints > 0
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`w-full py-3 text-lg font-bold ${
              canConfirm
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canConfirm ? 'Подтвердить распределение' : `Распределите ещё ${remainingPoints} очков`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpDistributionDialog;
