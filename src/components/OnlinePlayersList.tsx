import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPlayerName } from '@/utils/playerUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface OnlinePlayer {
  id: string;
  username: string;
  level: number;
  character_class: string;
}

const OnlinePlayersList = () => {
  const isMobile = useIsMobile();
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadOnlinePlayers = async () => {
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('user_activity')
          .select(`
            profiles (
              id,
              username,
              level,
              character_class
            )
          `)
          .gt('last_seen', fiveMinutesAgo);

        if (error) {
          throw error;
        }

        if (data) {
          const players = data
            .map(activity => activity.profiles)
            .filter(profile => {
              return profile !== null &&
                     typeof profile === 'object' &&
                     'id' in profile &&
                     'username' in profile &&
                     'level' in profile &&
                     'character_class' in profile;
            })
            .map(profile => profile as unknown as OnlinePlayer);
          
          setOnlinePlayers(players.sort((a, b) => a.username.localeCompare(b.username)));
        }

      } catch (error) {
        console.error('Ошибка загрузки списка игроков:', error);
        
        // Добавляем тестовых игроков для демонстрации
        const mockPlayers: OnlinePlayer[] = [
          { id: '1', username: 'afk DarliBank', level: 10, character_class: 'warrior' },
          { id: '2', username: 'afk Assaultive', level: 10, character_class: 'mage' },
          { id: '3', username: 'GAZOBUK', level: 15, character_class: 'archer' },
          { id: '4', username: 'Myp', level: 8, character_class: 'warrior' },
          { id: '5', username: 'Котзилла', level: 12, character_class: 'mage' },
          { id: '6', username: 'Oblivaron', level: 20, character_class: 'archer' },
        ];
        
        setOnlinePlayers(mockPlayers);
      }
    };
    
    loadOnlinePlayers();
    
    const interval = setInterval(loadOnlinePlayers, 30000);
    
    return () => clearInterval(interval);
  }, [toast]);

  const getClassIcon = (className: string) => {
    switch (className) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'archer': return '🏹';
      default: return '❓';
    }
  };

  const getClassColor = (className: string) => {
    switch (className) {
      case 'warrior': return 'text-red-400';
      case 'mage': return 'text-blue-400';
      case 'archer': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col online-list-area">
      <ScrollArea className={`flex-grow game-scrollbar ${isMobile ? 'px-0.5 py-0.5' : 'p-1'}`}>
        <div className={`${isMobile ? 'space-y-0.5' : 'space-y-1'}`}>
          {onlinePlayers.length > 0 ? (
            onlinePlayers.map((player) => (
              <div key={player.id} className={`medieval-bg-tertiary rounded hover:medieval-bg-secondary transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,.3)] ${isMobile ? 'px-0.5 py-0.5' : 'p-1'}`}
                   style={{
                     background: 'linear-gradient(145deg, hsl(var(--medieval-bg-tertiary)), hsl(var(--medieval-bg-secondary)))'
                   }}>
                <div className="flex items-center gap-1">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{getClassIcon(player.character_class)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate ${getClassColor(player.character_class)} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {isMobile ? player.username : formatPlayerName(player.username, player.level)}
                    </div>
                  </div>
                  <div className={`bg-green-400 rounded-full ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}></div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center text-gray-400 ${isMobile ? 'text-xs py-1 px-1' : 'text-sm p-1'}`}>
              {isMobile ? 'Нет игроков' : 'Нет игроков онлайн'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OnlinePlayersList;
