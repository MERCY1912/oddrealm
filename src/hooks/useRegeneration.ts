
import { useEffect, useRef } from 'react';

interface Player {
  id: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  [key: string]: any;
}

interface UseRegenerationProps {
  player: Player | null;
  onPlayerUpdate: (player: Player) => void;
  isInBattle?: boolean;
}

export const useRegeneration = ({ player, onPlayerUpdate, isInBattle = false }: UseRegenerationProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't regenerate during battle or if no player
    if (isInBattle || !player) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only start regeneration if not in battle and player exists
    if (!isInBattle && player) {
      intervalRef.current = setInterval(() => {
        if (!player) return;

        const needsHealing = player.health < player.maxHealth;
        
        if (needsHealing) {
          onPlayerUpdate({
            ...player,
            health: Math.min(player.health + 1, player.maxHealth),
          });
        }
      }, 10000); // Every 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInBattle, onPlayerUpdate, player]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
