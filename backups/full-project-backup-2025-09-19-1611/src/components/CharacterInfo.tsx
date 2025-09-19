
import React from 'react';
import ProgressBar from './ProgressBar';
import { formatPlayerName } from '@/utils/playerUtils';

interface CharacterInfoProps {
  player: any;
}

const CharacterInfo = ({ player }: CharacterInfoProps) => {
  return (
    <div className="mb-4">
      {/* Nickname and level */}
      <div className="text-center mb-2">
        <h4 className="game-text-primary font-bold text-lg">
          {formatPlayerName(player.username, player.level)}
        </h4>
      </div>
      
      {/* Health, mana and experience bars */}
      <div className="space-y-2 mb-3">
        <ProgressBar
          current={player.health}
          max={player.max_health || player.maxHealth}
          color="health"
          label="Здоровье"
          showText={true}
        />
        <ProgressBar
          current={player.mana}
          max={player.max_mana || player.maxMana}
          color="mana"
          label="Мана"
          showText={true}
        />
        <ProgressBar
          current={player.experience}
          max={player.experience_to_next || player.experienceToNext}
          color="experience"
          label="Опыт"
          showText={true}
        />
      </div>
    </div>
  );
};

export default CharacterInfo;
