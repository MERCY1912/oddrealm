
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NPC {
  id: string;
  name: string;
  type: string;
  description: string;
  dialogue: any;
  icon: string;
  services: string[];
}

interface NPCDialogProps {
  npc: NPC | null;
  isOpen: boolean;
  onClose: () => void;
  player: any;
  onPlayerUpdate: (player: any) => void;
}

const NPCDialog = ({ npc, isOpen, onClose, player, onPlayerUpdate }: NPCDialogProps) => {
  const [dialogState, setDialogState] = useState('greeting');
  const { toast } = useToast();

  if (!npc) return null;

  const handleHeal = () => {
    const healCost = 50;
    if (player.gold >= healCost) {
      const updatedPlayer = {
        ...player,
        health: player.maxHealth,
        mana: player.maxMana,
        gold: player.gold - healCost,
      };
      onPlayerUpdate(updatedPlayer);
      toast({
        title: 'Лечение',
        description: `${npc.name} полностью восстановил ваше здоровье и ману!`,
      });
      onClose();
    } else {
      toast({
        title: 'Недостаточно золота',
        description: `Нужно ${healCost} золота для лечения`,
        variant: 'destructive',
      });
    }
  };

  const renderDialogue = () => {
    const dialogue = npc.dialogue || {};
    
    switch (dialogState) {
      case 'greeting':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">{dialogue.greeting || 'Привет, путник!'}</p>
            <div className="space-y-2">
              {npc.services.includes('heal') && (
                <Button onClick={handleHeal} className="w-full bg-green-600 hover:bg-green-700">
                  Лечение (50💰)
                </Button>
              )}
              {npc.services.includes('buy') && (
                <Button onClick={() => setDialogState('shop')} className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Торговля
                </Button>
              )}
              {npc.services.includes('upgrade') && (
                <Button onClick={() => setDialogState('upgrade')} className="w-full bg-blue-600 hover:bg-blue-700">
                  Улучшение оружия
                </Button>
              )}
              {npc.services.includes('train') && (
                <Button onClick={() => setDialogState('train')} className="w-full bg-purple-600 hover:bg-purple-700">
                  Обучение
                </Button>
              )}
            </div>
          </div>
        );
      case 'shop':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">{dialogue.shop || 'Что хотите купить?'}</p>
            <Button onClick={() => setDialogState('greeting')} variant="outline">
              Назад
            </Button>
          </div>
        );
      case 'upgrade':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">{dialogue.upgrade || 'Принесите оружие для улучшения!'}</p>
            <p className="text-yellow-400">Функция будет добавлена позже</p>
            <Button onClick={() => setDialogState('greeting')} variant="outline">
              Назад
            </Button>
          </div>
        );
      case 'train':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">{dialogue.train || 'Хотите изучить новые навыки?'}</p>
            <p className="text-purple-400">Функция будет добавлена позже</p>
            <Button onClick={() => setDialogState('greeting')} variant="outline">
              Назад
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{npc.icon}</span>
            {npc.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{npc.description}</p>
          {renderDialogue()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NPCDialog;
