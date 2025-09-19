
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface LevelUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpInfo: { level: number; points: number };
}

const LevelUpDialog = ({ isOpen, onClose, levelUpInfo }: LevelUpDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-yellow-500 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-2xl font-bold text-center">
            🎉 Повышение уровня!
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center text-base">
            Поздравляем! Вы достигли {levelUpInfo.level} уровня!
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center space-y-6">
          <div className="w-28 h-28 rounded-full bg-yellow-900/30 border-4 border-yellow-500 flex items-center justify-center">
            <div className="text-yellow-400 text-4xl font-bold">
              {levelUpInfo.level}
            </div>
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-gray-300">Атака</div>
              <div className="text-green-400">+2</div>
            </div>
            <Progress value={100} className="h-2 bg-gray-700">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-400"></div>
            </Progress>
            
            <div className="flex items-center justify-between">
              <div className="text-gray-300">Защита</div>
              <div className="text-green-400">+1</div>
            </div>
            <Progress value={100} className="h-2 bg-gray-700">
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
            </Progress>
            
            <div className="flex items-center justify-between">
              <div className="text-gray-300">Здоровье</div>
              <div className="text-green-400">+10</div>
            </div>
            <Progress value={100} className="h-2 bg-gray-700">
              <div className="h-full bg-gradient-to-r from-green-600 to-green-400"></div>
            </Progress>
          </div>

          <div className="text-gray-300 text-sm text-center animate-pulse">
            Вам доступно {levelUpInfo.points} очков для распределения!
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose}
            className="bg-yellow-600 hover:bg-yellow-500 text-white w-full"
          >
            Продолжить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpDialog;
