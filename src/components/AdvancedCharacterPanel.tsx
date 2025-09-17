
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressBar from './ProgressBar';
import { formatPlayerName } from '@/utils/playerUtils';

interface PlayerProfile {
  username: string;
  character_class: string;
  level: number;
  experience: number;
  experience_to_next: number;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  attack: number;
  defense: number;
  gold: number;
}

interface Equipment {
  weapon?: { name: string; stats: any };
  armor?: { name: string; stats: any };
  helmet?: { name: string; stats: any };
  boots?: { name: string; stats: any };
}

interface AdvancedCharacterPanelProps {
  player: PlayerProfile;
  equipment: Equipment;
}

const AdvancedCharacterPanel = ({ player, equipment }: AdvancedCharacterPanelProps) => {
  const classNames = {
    warrior: 'Воин Тьмы',
    mage: 'Некромант',
    archer: 'Убийца',
  };

  const classEmojis = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
  };

  const getEquipmentSlot = (slot: keyof Equipment) => {
    const item = equipment[slot];
    if (item) {
      return (
        <div className="bg-gray-700 border-2 border-red-600 rounded-lg p-2 text-center min-h-[60px] flex items-center justify-center">
          <div>
            <div className="text-xs text-red-400 font-bold">{item.name}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-2 text-center min-h-[60px] flex items-center justify-center">
        <div className="text-gray-500 text-xs">Пусто</div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-red-600 border-2 text-white shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-center">
          <div className="text-2xl text-red-500 mb-2">{classEmojis[player.character_class as keyof typeof classEmojis]}</div>
          <div className="text-xl text-red-400 font-bold">{formatPlayerName(player.username, player.level)}</div>
          <div className="text-sm text-gray-300">
            {classNames[player.character_class as keyof typeof classNames]}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Экипировка вокруг персонажа */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div></div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Шлем</div>
            {getEquipmentSlot('helmet')}
          </div>
          <div></div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Оружие</div>
            {getEquipmentSlot('weapon')}
          </div>
          
          <div 
            className="bg-gray-900 border-2 border-gray-400 rounded-lg flex items-center justify-center"
            style={{ width: '190px', height: '290px' }}
          >
            {(player as any).character_image_url ? (
              <img
                src={(player as any).character_image_url}
                alt="Character"
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-4xl">${classEmojis[player.character_class as keyof typeof classEmojis]}</div>`;
                  }
                }}
              />
            ) : (
              <div className="text-4xl">{classEmojis[player.character_class as keyof typeof classEmojis]}</div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Броня</div>
            {getEquipmentSlot('armor')}
          </div>
          
          <div></div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Сапоги</div>
            {getEquipmentSlot('boots')}
          </div>
          <div></div>
        </div>

        <ProgressBar
          current={player.health}
          max={player.max_health}
          color="health"
          label="Жизни"
        />
        
        <ProgressBar
          current={player.mana}
          max={player.max_mana}
          color="mana"
          label="Мана"
        />
        
        <ProgressBar
          current={player.experience}
          max={player.experience_to_next}
          color="experience"
          label="Опыт"
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center bg-red-900/50 rounded-lg p-2">
            <div className="text-red-400 text-xl font-bold">{player.attack}</div>
            <div className="text-xs text-gray-400">Атака</div>
          </div>
          <div className="text-center bg-blue-900/50 rounded-lg p-2">
            <div className="text-blue-400 text-xl font-bold">{player.defense}</div>
            <div className="text-xs text-gray-400">Защита</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 bg-yellow-900/50 rounded-lg p-2">
          <span className="text-yellow-500 text-xl">💰</span>
          <span className="text-yellow-400 font-bold">{player.gold}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCharacterPanel;
