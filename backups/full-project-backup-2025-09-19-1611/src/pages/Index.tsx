
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import HomePage from '@/components/HomePage';
import AuthModal from '@/components/AuthModal';
import PasswordReset from '@/components/PasswordReset';
import GameMain from '@/components/GameMain';
import { PlayerProfile, PlayerEquipmentDb } from '@/types/game';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [equipment, setEquipment] = useState<PlayerEquipmentDb>({});
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHomePage, setShowHomePage] = useState(true);

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadPlayerData(session.user.id);
        setShowHomePage(false);
      } else {
        setLoading(false);
      }
    });

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadPlayerData(session.user.id);
          setShowHomePage(false);
        } else {
          setShowHomePage(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadPlayerData = async (userId: string) => {
    try {
      console.log('Loading player data for user:', userId);
      
      // Load player profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        // Create default profile if not exists
        const { data: userData } = await supabase.auth.getUser();
        const defaultProfile: PlayerProfile = {
          id: userId,
          username: userData.user?.email?.split('@')[0] || 'Player',
          character_class: 'warrior',
          level: 1,
          experience: 0,
          experience_to_next: 100,
          health: 100,
          max_health: 100,
          mana: 50,
          max_mana: 50,
          attack: 10,
          defense: 5,
          gold: 100,
          strength: 10,
          dexterity: 10,
          luck: 10,
          endurance: 10,
          magic: 10,
          free_stat_points: 0,
        };
        setPlayerProfile(defaultProfile);
      } else {
        console.log('Profile found:', profile);
        setPlayerProfile(profile);
      }

      // Load equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('player_id', userId);

      if (equipmentError) {
        console.error('Error loading equipment:', equipmentError);
      } else {
        const equipmentMap: PlayerEquipmentDb = {};
        equipmentData?.forEach(item => {
          equipmentMap[item.slot as keyof PlayerEquipmentDb] = {
            name: item.item_name,
            stats: item.item_stats
          };
        });
        setEquipment(equipmentMap);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in loadPlayerData:', error);
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Пользователь будет установлен автоматически через onAuthStateChange
  };

  const handleStartGame = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowHomePage(true);
    // `onAuthStateChange` обработает сброс состояния пользователя.
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-pulse">⚔️</div>
          <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
            КРОВАВЫЕ АРЕНЫ
          </div>
          <div className="text-gray-400 text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (showPasswordReset) {
    return <PasswordReset onBack={() => setShowPasswordReset(false)} />;
  }

  if (showAuthModal) {
    return (
      <AuthModal 
        onAuthSuccess={handleAuthSuccess} 
        onShowPasswordReset={() => setShowPasswordReset(true)}
        onClose={() => setShowAuthModal(false)}
      />
    );
  }

  if (showHomePage && (!user || !playerProfile)) {
    return <HomePage onStartGame={handleStartGame} />;
  }

  if (user && playerProfile) {
    return (
      <GameMain 
        initialPlayer={playerProfile}
        initialEquipment={equipment}
        onLogout={handleLogout}
      />
    );
  }

  return <HomePage onStartGame={handleStartGame} />;
};

export default Index;
