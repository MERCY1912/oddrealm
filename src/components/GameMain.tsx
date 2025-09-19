
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameData } from '@/hooks/useGameData';
import { PlayerProfile, PlayerEquipmentDb } from '@/types/game';
import { formatPlayerName } from '@/utils/playerUtils';
import { useToast } from '@/hooks/use-toast';
import { useRegeneration } from '@/hooks/useRegeneration';
import { useFastUserPresence } from '@/hooks/useFastUserPresence';

import LevelUpDistributionDialog from './LevelUpDistributionDialog';
import GameInterface from './GameInterface';
import { Button } from './ui/button';
import { LogOut, Shield, UserCog } from 'lucide-react';
import AdminPanel from './AdminPanel';
import AdminPanelV2 from './AdminPanelV2';
import ProfileSettingsDialog from './ProfileSettingsDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface GameMainProps {
  initialPlayer: PlayerProfile;
  initialEquipment: PlayerEquipmentDb;
  onLogout: () => void;
}

const GameMain = ({ initialPlayer, initialEquipment, onLogout }: GameMainProps) => {
  const {
    player,
    equipment,
    inventory,
    showLevelUpDistribution,
    pendingLevelUpPoints,
    handleLevelUpDistribution,
    handleAddToInventory,
    handleRemoveFromInventory,
    handlePlayerUpdate,
    handleEquipmentUpdate,
    handleUnequipItem,
    convertedPlayer,
    convertedEquipment
  } = useGameData(initialPlayer, initialEquipment);
  
  // Инициализируем отслеживание присутствия пользователя
  const { setStatus } = useFastUserPresence({ autoStart: true });
  
  const [activeTab, setActiveTab] = useState('character');
  const [isInBattle, setInBattle] = useState(false);
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminPanelV2, setShowAdminPanelV2] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [chatHeight, setChatHeight] = useState(() => {
    // По умолчанию 20% от высоты экрана
    const defaultHeight = Math.round(window.innerHeight * 0.2);
    const savedHeight = localStorage.getItem('chat-panel-height');
    return savedHeight ? parseInt(savedHeight, 10) : defaultHeight;
  });

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        if (data && !error) {
          setIsAdmin(true);
          // Проверяем, показывали ли уже сообщение в этой сессии
          const adminToastShown = sessionStorage.getItem('adminToastShown');
          if (!adminToastShown) {
            toast({
              title: "Права администратора подтверждены",
              description: "Вам доступна панель администратора.",
            });
            sessionStorage.setItem('adminToastShown', 'true');
          }
        }
      }
    };
    checkAdminRole();
  }, [toast]);

  useRegeneration({
    player: convertedPlayer,
    onPlayerUpdate: handlePlayerUpdate,
    isInBattle,
  });

  // Отслеживаем изменения высоты чата
  useEffect(() => {
    const handleHeightChange = (e: CustomEvent) => {
      setChatHeight(e.detail.height);
    };

    window.addEventListener('chat-height-changed', handleHeightChange as EventListener);

    return () => {
      window.removeEventListener('chat-height-changed', handleHeightChange as EventListener);
    };
  }, []);

  // Heartbeat to update user's last_seen timestamp
  useEffect(() => {
    const updateUserPresence = async () => {
      try {
        const { error } = await supabase.rpc('update_user_presence');
        if (error) {
          console.warn("Error updating user presence (function may not exist):", error);
        }
      } catch (err) {
        console.warn("User presence update failed:", err);
      }
    };

    // Only try to update if the function exists
    // updateUserPresence(); // Call immediately on load
    // const intervalId = setInterval(updateUserPresence, 30000); // And every 30 seconds thereafter

    // return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Update document title
    document.title = `${formatPlayerName(player.username, player.level)} - ${player.character_class}`;
  }, [player.username, player.level, player.character_class]);
  
  useEffect(() => {
    if (isInBattle && activeTab !== 'arena') {
      setActiveTab('arena');
    }
  }, [isInBattle, activeTab]);

  // Обновляем статус при изменении активной вкладки
  useEffect(() => {
    if (activeTab === 'arena') {
      setStatus('in_battle');
    } else if (activeTab === 'dungeon') {
      setStatus('in_dungeon');
    } else {
      setStatus('online');
    }
  }, [activeTab, setStatus]);


  const handleTabClick = (tab: string) => {
    if (isInBattle && tab !== 'arena') {
      toast({
        title: "Бой продолжается!",
        description: "Вы не можете покинуть арену до окончания боя.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab(tab);
  };

  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  if (showAdminPanelV2) {
    return <AdminPanelV2 onBack={() => setShowAdminPanelV2(false)} />;
  }

  return (
    <>
      <GameInterface 
        player={convertedPlayer}
        onPlayerUpdate={handlePlayerUpdate}
        onLogout={onLogout}
        onOpenSettings={() => {
          console.log('GameMain - Opening profile settings');
          setShowProfileSettings(true);
        }}
        onOpenAdminPanel={() => {
          console.log('GameMain - Opening admin panel');
          setShowAdminPanel(true);
        }}
        onOpenAdminPanelV2={() => {
          console.log('GameMain - Opening admin panel v2');
          setShowAdminPanelV2(true);
        }}
        onAddToInventory={handleAddToInventory}
        onEquipItem={handleEquipmentUpdate}
        onRemoveFromInventory={handleRemoveFromInventory}
        onUnequipItem={handleUnequipItem}
        inventory={inventory}
        equipment={convertedEquipment}
      />

      {/* Mandatory Level Up Distribution Dialog */}
      <LevelUpDistributionDialog
        isOpen={showLevelUpDistribution}
        pointsToDistribute={pendingLevelUpPoints}
        playerLevel={player.level}
        onDistribute={handleLevelUpDistribution}
      />
      
      {/* Profile Settings Dialog */}
      <ProfileSettingsDialog 
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        player={player}
        onPlayerUpdate={handlePlayerUpdate}
      />
    </>
  );
};

export default GameMain;
