
import React from 'react';
import EquipmentSlot from './EquipmentSlot';
import { formatPlayerName } from '@/utils/playerUtils';
import { Player } from '@/types/game';
import EquipmentDisplay from './EquipmentDisplay';
import { SegmentBar } from './SegmentBar';

interface PlayerBattlePanelProps {
  player: Player;
  playerStats?: any;
}

const PlayerBattlePanel = ({ player, playerStats }: PlayerBattlePanelProps) => {
  const equipment = player?.equipment || {};
  const maxHealth = playerStats?.maxHealth > 0 ? playerStats.maxHealth : (player?.maxHealth || 1);
  const maxMana = playerStats?.maxMana > 0 ? playerStats.maxMana : (player?.maxMana || 1);

  // Логирование для отладки
  console.log('PlayerBattlePanel - Health data:', {
    playerUsername: player?.username,
    playerHealth: player?.health,
    playerMaxHealth: player?.maxHealth,
    playerStatsHealth: playerStats?.health,
    playerStatsMaxHealth: playerStats?.maxHealth,
    finalHealth: playerStats?.health || player?.health || 0,
    finalMaxHealth: maxHealth,
    playerStatsExists: !!playerStats
  });

  if (!player) {
    return (
      <div className="panel panel--tint">
        <div className="text-center text-red-400 p-4">Ошибка загрузки данных игрока</div>
      </div>
    );
  }

  // Если playerStats не переданы, используем данные игрока
  if (!playerStats) {
    console.warn('PlayerBattlePanel: playerStats not provided, using player data');
  }

  const classEmojis = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
  };

  return (
    <div className="panel panel--tint panel--warm h-full">
      <div className="p-4 h-full flex flex-col">
        {/* Заголовок игрока */}
        <div className="text-center mb-4">
          <h4 className="font-ui text-lg font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            {formatPlayerName(player.username || 'Unknown', player.level || 1)}
          </h4>
          <div className="medieval-subtitle text-ash/80">
            {classEmojis[player.class as keyof typeof classEmojis]} {player.class}
          </div>
        </div>
        
        {/* Полоски здоровья и маны */}
        <div className="space-y-3 mb-4">
          <SegmentBar
            label="Здоровье"
            value={playerStats?.health || player.health || 0}
            max={maxHealth}
            color="#b52a2a"
          />
          <SegmentBar
            label="Мана"
            value={playerStats?.mana || player.mana || 0}
            max={maxMana}
            color="#b58b46"
          />
        </div>
        
        {/* Экипировка игрока */}
        <div className="flex-1">
          <EquipmentDisplay equipment={equipment} player={player} />
        </div>
      </div>
    </div>
  );
};

export default PlayerBattlePanel;
