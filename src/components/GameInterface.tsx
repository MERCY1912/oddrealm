import React, { useState } from 'react';
import { Player, ArenaBot } from '@/types/game';
import { arenaBots } from '@/data/arenaBots';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CharacterPanel from './CharacterPanel';
import CharacterEquipmentPanel from './CharacterEquipmentPanel';
import Inventory from './Inventory';
import NewBattleArena from './NewBattleArena';
import EnhancedShop from './EnhancedShop';
import Chat from './Chat';
import Infirmary from './Infirmary';
import OnlinePlayersList from './OnlinePlayersList';
import GameNotifications from './GameNotifications';
import HeroCard from './HeroCard';
import { SegmentBar } from './SegmentBar';
import { Button } from '@/components/ui/button';
import OrnateFrame from './OrnateFrame';
import CityLocation from './locations/CityLocation';
import ArenaWithTabs from './ArenaWithTabs';
import InfirmaryLocation from './locations/InfirmaryLocation';
import CharacterLocation from './locations/CharacterLocation';
import ShopLocation from './locations/ShopLocation';
import DetailedStatsPanel from './DetailedStatsPanel';
import InventoryPanel from './InventoryPanel';
import ArenaHallView from './ArenaHallView';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameInterfaceProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenAdminPanelV2?: () => void;
  onAddToInventory?: (item: any) => void;
  onEquipItem?: (item: any) => void;
  onRemoveFromInventory?: (itemId: string) => void;
  onUnequipItem?: (item: any) => void;
  inventory?: any[];
  equipment?: any;
}

const GameInterface = ({ player, onPlayerUpdate, onLogout, onOpenSettings, onOpenAdminPanel, onOpenAdminPanelV2, onAddToInventory, onEquipItem, onRemoveFromInventory, onUnequipItem, inventory = [], equipment = {} }: GameInterfaceProps) => {
  const isMobile = useIsMobile();
  
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'loot' | 'levelup' | 'achievement';
    message: string;
    icon: string;
  }>>([]);
  
  const [chatHeight, setChatHeight] = useState(() => {
    // Загружаем сохраненную высоту или используем значение по умолчанию
    const savedHeight = localStorage.getItem('chat-panel-height');
    // Меньшая высота по умолчанию для мобильных устройств
    const defaultHeight = window.innerWidth < 640 ? 180 : 280;
    const height = savedHeight ? parseInt(savedHeight, 10) : defaultHeight;
    
    // Устанавливаем CSS переменную при инициализации
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--chat-height', `${height}px`);
    }
    
    return height;
  });
  
  // Состояние для скрытия чата и списка онлайна на мобильных
  const [isChatHidden, setIsChatHidden] = useState(() => {
    const saved = localStorage.getItem('chat-hidden-mobile');
    return saved === 'true';
  });
  
  const [isOnlineListHidden, setIsOnlineListHidden] = useState(() => {
    const saved = localStorage.getItem('online-list-hidden-mobile');
    return saved === 'true';
  });
  
  const [currentLocation, setCurrentLocation] = useState('character');
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [currentArenaHall, setCurrentArenaHall] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [selectedArenaBot, setSelectedArenaBot] = useState<ArenaBot | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  const addNotification = (type: 'loot' | 'levelup' | 'achievement', message: string, icon: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, icon }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLocationNavigation = (location: string) => {
    setCurrentLocation(location);
    setShowBattleArena(false);
    setCurrentArenaHall(null); // Сбрасываем выбранный зал при смене локации
    
    // Если переходим к PvP арене, показываем NewBattleArena
    if (location === 'pvp-arena') {
      setShowBattleArena(true);
    }
  };

  const handleStartBattle = () => {
    setShowBattleArena(true);
  };

  const handleEnterHall = (difficulty: 'easy' | 'medium' | 'hard') => {
    setCurrentArenaHall(difficulty);
  };

  const handleBackToArena = () => {
    setCurrentArenaHall(null);
    setShowBattleArena(false);
    setSelectedArenaBot(null);
  };

  const handleStartBattleWithBot = (botId: string) => {
    // Находим бота в данных arenaBots
    const arenaBot = arenaBots.find(bot => bot.id === botId);
    if (arenaBot) {
      setSelectedArenaBot(arenaBot);
      setShowBattleArena(true);
    }
  };

  const handleOpenShop = () => {
    setShowShop(true);
  };

  const handleOpenQuests = () => {
    setShowQuests(true);
  };

  const handleBackFromShop = () => {
    setShowShop(false);
  };

  const handleBackFromQuests = () => {
    setShowQuests(false);
  };

  const handleHeal = () => {
    if (player.gold >= 10) {
      const updatedPlayer = {
        ...player,
        health: player.maxHealth,
        gold: player.gold - 10
      };
      onPlayerUpdate(updatedPlayer);
      addNotification('loot', 'Здоровье восстановлено!', '');
    } else {
      addNotification('loot', 'Недостаточно золота для лечения!', '');
    }
  };

  // Функции для переключения видимости чата и списка онлайна на мобильных
  const toggleChatVisibility = () => {
    const newState = !isChatHidden;
    setIsChatHidden(newState);
    localStorage.setItem('chat-hidden-mobile', newState.toString());
  };
  
  const toggleOnlineListVisibility = () => {
    const newState = !isOnlineListHidden;
    setIsOnlineListHidden(newState);
    localStorage.setItem('online-list-hidden-mobile', newState.toString());
  };

  // Демонстрационные уведомления (можно удалить в продакшене)
  const showDemoNotifications = () => {
    addNotification('loot', 'Получен редкий предмет!', '');
    setTimeout(() => addNotification('levelup', 'Новый уровень!', ''), 1000);
    setTimeout(() => addNotification('achievement', 'Достижение разблокировано!', ''), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-2 sm:p-4 content-with-chat" style={{ paddingBottom: isChatHidden ? '0px' : `${chatHeight}px` }}>
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <h1 className="font-ui text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide"
                style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
              КРОВАВЫЕ АРЕНЫ
            </h1>
            
            {/* Кнопки навигации по центру */}
            {currentLocation === 'character' && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleLocationNavigation('city')}
                  className="medieval-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                >
                  Город
                </Button>
                <Button
                  onClick={() => handleLocationNavigation('arena')}
                  className="medieval-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                >
                  Арена
                </Button>
                <Button
                  onClick={() => handleLocationNavigation('infirmary')}
                  className="medieval-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                >
                  Лечебница
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Чекбоксы для мобильной версии - только на мобильных */}
              {isMobile && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!isChatHidden}
                      onChange={toggleChatVisibility}
                      className="w-3 h-3 rounded border border-gray-500 bg-gray-700 checked:bg-green-600 checked:border-green-600 focus:ring-1 focus:ring-green-500"
                    />
                    <span>💬 Чат</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!isOnlineListHidden}
                      onChange={toggleOnlineListVisibility}
                      className="w-3 h-3 rounded border border-gray-500 bg-gray-700 checked:bg-blue-600 checked:border-blue-600 focus:ring-1 focus:ring-blue-500"
                    />
                    <span>👥 Онлайн</span>
                  </label>
                </div>
              )}
              
              <div className="px-2 sm:px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition">
                <span className="font-ui font-bold text-sm sm:text-lg" style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
                   {player.gold} золота
                </span>
              </div>
              <Button 
                onClick={showDemoNotifications}
                className="px-2 sm:px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui text-xs sm:text-sm"
              >
                FX Демо
              </Button>
              {onOpenAdminPanel && (
                <Button 
                  onClick={onOpenAdminPanel}
                  className="px-2 sm:px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui text-xs sm:text-sm"
                >
                   Админ
                </Button>
              )}
              {onOpenAdminPanelV2 && (
                <Button 
                  onClick={onOpenAdminPanelV2}
                  className="px-2 sm:px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui text-xs sm:text-sm"
                >
                   Админ v2
                </Button>
              )}
              {onOpenSettings && (
                <Button 
                  onClick={() => {
                    console.log('Settings button clicked');
                    onOpenSettings();
                  }}
                  className="px-2 sm:px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui text-xs sm:text-sm"
                  title="Настройки аккаунта"
                >
                   Настройки
                </Button>
              )}
              <Button 
                onClick={onLogout}
                className="px-2 sm:px-3 py-1 rounded-md bg-[#22232b] ring-1 ring-black/40 text-ash shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:bg-[#272833] hover:text-white transition font-ui text-xs sm:text-sm"
              >
                Выйти
              </Button>
            </div>
          </div>

          {/* Панель локации - показываем только в локации персонажа */}
          {currentLocation === 'character' && (
            <div className="mb-6">
              <CharacterLocation onNavigate={handleLocationNavigation} />
            </div>
          )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 main-stage items-stretch">
              {/* Панель персонажа - показываем только в локации персонажа */}
              {currentLocation === 'character' && (
                <>
                  <div className="lg:col-span-4">
                    <CharacterEquipmentPanel player={player} equipment={equipment} onUnequipItem={onUnequipItem} />
                  </div>
                  
                  <div className="lg:col-span-4">
                    <DetailedStatsPanel player={player} />
                  </div>
                  
                  <div className="lg:col-span-4">
                    <InventoryPanel 
                      player={player} 
                      inventory={inventory} 
                      onEquipItem={onEquipItem}
                      onRemoveFromInventory={onRemoveFromInventory}
                    />
                  </div>
                </>
              )}

              {/* Основной интерфейс */}
              <div className={currentLocation === 'character' ? 'lg:col-span-12' : 'lg:col-span-12'}>
                
                {currentLocation !== 'character' && (
                  <>
                    {showBattleArena ? (
                      <NewBattleArena
                        player={player}
                        onPlayerUpdate={onPlayerUpdate}
                        preselectedBot={selectedArenaBot}
                        defaultTab={currentLocation === 'pvp-arena' ? 'pvp' : 'pve'}
                      />
                    ) : (
                      <div>
                        {/* Контент локации */}
                        {currentLocation === 'city' && (
                          <CityLocation onNavigate={handleLocationNavigation} />
                        )}
                        {currentLocation === 'arena' && (
                          <>
                            {currentArenaHall ? (
                              <ArenaHallView
                                difficulty={currentArenaHall}
                                onBackToArena={handleBackToArena}
                                onStartBattleWithBot={handleStartBattleWithBot}
                              />
                            ) : (
                              <ArenaWithTabs
                                player={player}
                                onPlayerUpdate={onPlayerUpdate}
                                onNavigate={handleLocationNavigation}
                                onEnterHall={handleEnterHall}
                                onStartBattleWithBot={handleStartBattleWithBot}
                              />
                            )}
                          </>
                        )}
                        {currentLocation === 'infirmary' && (
                          <InfirmaryLocation 
                            onNavigate={handleLocationNavigation}
                            onHeal={handleHeal}
                            player={player}
                          />
                        )}
                        {currentLocation === 'shop' && (
                          <>
                            {showShop ? (
                              <div>
                                <div className="mb-4">
                                  <Button onClick={handleBackFromShop} className="medieval-button">
                                     Назад в лавку
                                  </Button>
                                </div>
                                <EnhancedShop
                                  player={player}
                                  onPlayerUpdate={onPlayerUpdate}
                                  onAddToInventory={onAddToInventory || ((item) => {
                                    console.log('Item added to inventory (fallback):', item);
                                  })}
                                />
                              </div>
                            ) : showQuests ? (
                              <div className="text-center text-white">
                                <h2 className="text-2xl mb-4">Квесты торговца</h2>
                                <p className="mb-4">Здесь будут доступны квесты от торговца</p>
                                <Button onClick={handleBackFromQuests} className="medieval-button">
                                  Назад
                                </Button>
                              </div>
                            ) : (
                              <ShopLocation
                                onNavigate={handleLocationNavigation}
                                onOpenShop={handleOpenShop}
                                onOpenQuests={handleOpenQuests}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed чат и список онлайн игроков - прикреплен к нижней части экрана */}
      {/* Скрываем всю панель на мобильных если оба компонента скрыты */}
      {(!isMobile || !isChatHidden || !isOnlineListHidden) && (
        <div className="sticky-chat-panel" style={{ height: `${chatHeight}px` }}>
          {/* Кнопки управления размером панели - скрываем на мобильных */}
          <div className="hidden sm:block absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
            <button
              onClick={() => {
                const newHeight = Math.min(600, chatHeight + 50);
                setChatHeight(newHeight);
                localStorage.setItem('chat-panel-height', newHeight.toString());
                document.documentElement.style.setProperty('--chat-height', `${newHeight}px`);
              }}
              disabled={chatHeight >= 600}
              className="w-8 h-6 p-0 medieval-bg-tertiary medieval-border border hover:medieval-bg-secondary text-white text-xs rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_4px_rgba(0,0,0,.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,.4)] transition-all duration-200"
              style={{
                background: 'linear-gradient(145deg, hsl(var(--medieval-bg-tertiary)), hsl(var(--medieval-bg-secondary)))'
              }}
              title="Увеличить высоту чата"
            >
              
            </button>
            <button
              onClick={() => {
                const newHeight = Math.max(200, chatHeight - 50);
                setChatHeight(newHeight);
                localStorage.setItem('chat-panel-height', newHeight.toString());
                document.documentElement.style.setProperty('--chat-height', `${newHeight}px`);
              }}
              disabled={chatHeight <= 200}
              className="w-8 h-6 p-0 medieval-bg-tertiary medieval-border border hover:medieval-bg-secondary text-white text-xs rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_4px_rgba(0,0,0,.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,.4)] transition-all duration-200"
              style={{
                background: 'linear-gradient(145deg, hsl(var(--medieval-bg-tertiary)), hsl(var(--medieval-bg-secondary)))'
              }}
              title="Уменьшить высоту чата"
            >
              
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row h-full">
            {/* Чат - скрываем на мобильных если выбран */}
            {(!isChatHidden || !isMobile) && (
              <div className="flex-1 sm:flex-[80%] flex flex-col chat-content medieval-bg-secondary">
                <div className={`flex-1 min-h-0 ${isMobile ? 'p-0.5' : 'p-2'}`}>
                  <Chat
                    userId={player.id}
                    username={player.username}
                  />
                </div>
              </div>
            )}
            
            {/* Список онлайна - скрываем на мобильных если выбран */}
            {(!isOnlineListHidden || !isMobile) && (
              <div className="w-full sm:w-[20%] flex-shrink-0 flex flex-col online-list-content">
                <div className={`flex-1 min-h-0 ${isMobile ? 'p-0.5' : 'p-2'}`}>
                  <OnlinePlayersList />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      
      {/* Уведомления */}
      <GameNotifications 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default GameInterface;
