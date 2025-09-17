import React, { useRef, useEffect } from 'react';
import PlayerBattlePanel from './PlayerBattlePanel';
import BotBattlePanel from './BotBattlePanel';
import BattleControlPanel from './BattleControlPanel';
import { BattleZone, BattleLogEntry } from '@/hooks/useBattleState';

interface BattleInterfaceProps {
  player: any;
  playerStats: any;
  selectedBot: any;
  currentBotHealth: number;
  botEquipment: any;
  playerAttackZone: BattleZone | null;
  playerDefenseZone: BattleZone | null;
  setPlayerAttackZone: (zone: BattleZone) => void;
  setPlayerDefenseZone: (zone: BattleZone) => void;
  executeAttack: () => void;
  isProcessing: boolean;
  battleLog: BattleLogEntry[];
}

const BattleInterface = ({
  player,
  playerStats,
  selectedBot,
  currentBotHealth,
  botEquipment,
  playerAttackZone,
  playerDefenseZone,
  setPlayerAttackZone,
  setPlayerDefenseZone,
  executeAttack,
  isProcessing,
  battleLog,
}: BattleInterfaceProps) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  console.log('BattleInterface DEBUG:', { 
    player: player?.username, 
    selectedBot: selectedBot?.name, 
    executeAttack: typeof executeAttack,
    playerStats,
    botEquipment
  });

  if (!selectedBot || !player) {
    console.error('BattleInterface: Missing critical data', { selectedBot: !!selectedBot, player: !!player });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel panel--tint text-center p-8">
          <div className="text-white text-lg font-bold mb-4"> Подготовка к битве...</div>
          <div className="text-gray-400">Загрузка данных противника и игрока</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4" style={{
      background: "linear-gradient(180deg, #1c2029 0%, #171a21 100%)"
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Заголовок боя */}
        <div className="panel panel--tint panel--warm text-center py-3 sm:py-4 mb-4 sm:mb-6">
          <h1 className="font-ui text-lg sm:text-xl lg:text-2xl font-bold tracking-wide"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            {selectedBot.name} [{selectedBot.level}] vs {player.username}
          </h1>
        </div>

        {/* Основная область боя */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Мобильная версия - полные карточки героев */}
          <div className="lg:hidden space-y-4">
            {/* Карточки игрока и противника с экипировкой */}
            <div className="grid grid-cols-2 gap-3">
              {/* Карточка игрока */}
              <div className="panel panel--tint panel--warm p-2">
                <div className="text-center mb-2">
                  <div className="font-bold text-xs text-white mb-1">{player.username} [{player.level}]</div>
                </div>
                
                {/* Горизонтальные полоски HP и MP */}
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <div className="text-[8px] text-red-400 mb-1">HP</div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${((playerStats?.health || player.health) / (playerStats?.maxHealth || player.maxHealth)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[6px] text-red-400 text-center">
                      {playerStats?.health || player.health}/{playerStats?.maxHealth || player.maxHealth}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[8px] text-blue-400 mb-1">MP</div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${((playerStats?.mana || player.mana) / (playerStats?.maxMana || player.maxMana)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[6px] text-blue-400 text-center">
                      {playerStats?.mana || player.mana}/{playerStats?.maxMana || player.maxMana}
                    </div>
                  </div>
                </div>
                
                {/* Улучшенная экипировка игрока с увеличенным аватаром */}
                <div className="flex justify-center items-start gap-1">
                    {/* Левая колонка слотов */}
                    <div className="flex flex-col items-center">
                      {/* Шлем - увеличенный размер */}
                      <div className={`w-6 h-6 border rounded flex items-center justify-center text-xs ${player.equipment?.helmet ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.helmet ? '👑' : ''}
                      </div>
                      {/* Браслеты */}
                      <div className={`w-6 h-4 border rounded flex items-center justify-center text-xs ${player.equipment?.bracers ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.bracers ? '🛡️' : ''}
                      </div>
                      {/* Оружие */}
                      <div className={`w-6 h-6 border rounded flex items-center justify-center text-xs ${player.equipment?.weapon ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.weapon ? '⚔️' : ''}
                      </div>
                      {/* Броня */}
                      <div className={`w-6 h-8 border rounded flex items-center justify-center text-xs ${player.equipment?.armor ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.armor ? '🛡️' : ''}
                      </div>
                      {/* Пояс */}
                      <div className={`w-6 h-4 border rounded flex items-center justify-center text-xs ${player.equipment?.belt ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.belt ? '📿' : ''}
                      </div>
                    </div>
                    
                    {/* Центральная область — аватар героя - увеличенный размер */}
                    <div className="w-20 h-28 bg-gray-700 border border-gray-500 rounded flex items-center justify-center">
                      <img
                        src={player?.character_image_url || player?.avatar_url || "/lovable-uploads/d34b59ae-7d60-4c9a-afce-737fbd38a77e.png"}
                        alt="Character"
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/lovable-uploads/d34b59ae-7d60-4c9a-afce-737fbd38a77e.png";
                        }}
                      />
                    </div>
                    
                    {/* Правая колонка слотов */}
                    <div className="flex flex-col items-center">
                      {/* Серьга */}
                      <div className={`w-6 h-3 border rounded flex items-center justify-center text-xs ${player.equipment?.earring ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.earring ? '💎' : ''}
                      </div>
                      {/* Кольца */}
                      <div className="flex">
                        <div className={`w-3 h-3 border rounded flex items-center justify-center text-xs ${player.equipment?.ring1 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                          {player.equipment?.ring1 ? '💍' : ''}
                        </div>
                        <div className={`w-3 h-3 border rounded flex items-center justify-center text-xs ${player.equipment?.ring2 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                          {player.equipment?.ring2 ? '💍' : ''}
                        </div>
                        <div className={`w-3 h-3 border rounded flex items-center justify-center text-xs ${player.equipment?.ring3 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                          {player.equipment?.ring3 ? '💍' : ''}
                        </div>
                      </div>
                      {/* Перчатки */}
                      <div className={`w-6 h-4 border rounded flex items-center justify-center text-xs ${player.equipment?.gloves ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.gloves ? '🧤' : ''}
                      </div>
                      {/* Щит */}
                      <div className={`w-6 h-6 border rounded flex items-center justify-center text-xs ${player.equipment?.shield ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.shield ? '🛡️' : ''}
                      </div>
                      {/* Поножи */}
                      <div className={`w-6 h-8 border rounded flex items-center justify-center text-xs ${player.equipment?.leggings ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.leggings ? '🦵' : ''}
                      </div>
                      {/* Ботинки */}
                      <div className={`w-6 h-4 border rounded flex items-center justify-center text-xs ${player.equipment?.boots ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-600 border-gray-500'}`}>
                        {player.equipment?.boots ? '👢' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Карточка противника */}
              <div className="panel panel--tint panel--warm p-2">
                <div className="text-center mb-2">
                  <div className="font-bold text-xs text-white mb-1">{selectedBot.name} [{selectedBot.level}]</div>
                </div>
                
                {/* Горизонтальные полоски HP и MP */}
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <div className="text-[8px] text-red-400 mb-1">HP</div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(currentBotHealth / selectedBot.health) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[6px] text-red-400 text-center">
                      {currentBotHealth}/{selectedBot.health}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[8px] text-blue-400 mb-1">MP</div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(selectedBot.mana / selectedBot.maxMana) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[6px] text-blue-400 text-center">
                      {selectedBot.mana}/{selectedBot.maxMana}
                    </div>
                  </div>
                </div>
                
                {/* Улучшенная экипировка противника с увеличенным аватаром */}
                <div className="flex justify-center items-start gap-1">
                    {/* Левая колонка слотов */}
                    <div className="flex flex-col items-center">
                      {/* Шлем - увеличенный размер */}
                      <div className="w-6 h-6 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Браслеты */}
                      <div className="w-6 h-4 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Оружие */}
                      <div className="w-6 h-6 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Броня */}
                      <div className="w-6 h-8 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Пояс */}
                      <div className="w-6 h-4 bg-gray-600 border border-gray-500 rounded"></div>
                    </div>
                    
                    {/* Центральная область — аватар бота - увеличенный размер */}
                    <div className="w-20 h-28 bg-gray-700 border border-gray-500 rounded flex items-center justify-center">
                      {selectedBot?.image && (selectedBot.image.includes('.jpg') || selectedBot.image.includes('.png') || selectedBot.image.includes('.jpeg') || selectedBot.image.includes('.gif') || selectedBot.image.includes('.webp')) ? (
                        <img
                          src={selectedBot.image}
                          alt={selectedBot.name || 'Bot'}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="text-2xl opacity-60">👾</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="text-2xl opacity-60">
                          {selectedBot?.image || '👾'}
                        </div>
                      )}
                    </div>
                    
                    {/* Правая колонка слотов */}
                    <div className="flex flex-col items-center">
                      {/* Серьга */}
                      <div className="w-6 h-3 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Кольца */}
                      <div className="flex">
                        <div className="w-3 h-3 bg-gray-600 border border-gray-500 rounded"></div>
                        <div className="w-3 h-3 bg-gray-600 border border-gray-500 rounded"></div>
                        <div className="w-3 h-3 bg-gray-600 border border-gray-500 rounded"></div>
                      </div>
                      {/* Перчатки */}
                      <div className="w-6 h-4 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Щит */}
                      <div className="w-6 h-6 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Поножи */}
                      <div className="w-6 h-8 bg-gray-600 border border-gray-500 rounded"></div>
                      {/* Ботинки */}
                      <div className="w-6 h-4 bg-gray-600 border border-gray-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Управление боем - компактная версия */}
            <div className="panel panel--tint panel--warm p-3">
              <h3 className="text-center text-white font-bold text-sm mb-3">УПРАВЛЕНИЕ БОЕМ</h3>
              
              {/* Атака и защита в две колонки */}
              <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Атака */}
                <div className="border border-red-500/50 rounded p-2">
                  <div className="text-red-400 font-bold text-xs mb-2 text-center flex items-center justify-center">
                    <span className="mr-1">⚔️</span> АТАКА
                </div>
                  <div className="grid grid-cols-1 gap-1">
                  {['head', 'chest', 'stomach', 'groin', 'legs'].map(zone => {
                    const zoneNames = { head: 'Голова', chest: 'Грудь', stomach: 'Живот', groin: 'Пах', legs: 'Ноги' };
                    const isSelected = playerAttackZone === zone;
                    return (
                      <button
                        key={zone}
                        onClick={() => setPlayerAttackZone(zone as any)}
                        disabled={isProcessing}
                          className={`py-1 px-2 rounded text-xs font-medium transition-all ${
                            isSelected
                              ? 'text-white bg-red-600 border border-red-400'
                              : 'hover:bg-red-500/20'
                          }`}
                      >
                        {zoneNames[zone as keyof typeof zoneNames]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Защита */}
                <div className="border border-blue-500/50 rounded p-2">
                  <div className="text-blue-400 font-bold text-xs mb-2 text-center flex items-center justify-center">
                    <span className="mr-1">🛡️</span> ЗАЩИТА
                </div>
                  <div className="grid grid-cols-1 gap-1">
                  {['head', 'chest', 'stomach', 'groin', 'legs'].map(zone => {
                    const zoneNames = { head: 'Голова', chest: 'Грудь', stomach: 'Живот', groin: 'Пах', legs: 'Ноги' };
                    const isSelected = playerDefenseZone === zone;
                    return (
                      <button
                        key={zone}
                        onClick={() => setPlayerDefenseZone(zone as any)}
                        disabled={isProcessing}
                          className={`py-1 px-2 rounded text-xs font-medium transition-all ${
                            isSelected
                              ? 'text-white bg-blue-600 border border-blue-400'
                              : 'hover:bg-blue-500/20'
                          }`}
                      >
                        {zoneNames[zone as keyof typeof zoneNames]}
                      </button>
                    );
                  })}
                  </div>
                </div>
              </div>

              {/* Кнопка атаки */}
              <div className="text-center">
                <button
                  onClick={executeAttack}
                  disabled={!playerAttackZone || !playerDefenseZone || isProcessing}
                  className="w-full py-2 px-4 rounded font-bold text-sm transition-all bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'АТАКА...' : '⚔️ АТАКОВАТЬ!'}
                </button>
              </div>
            </div>
          </div>

          {/* Десктопная версия - оригинальная */}
          <div className="hidden lg:contents">
            <PlayerBattlePanel player={player} playerStats={playerStats} />
            <BattleControlPanel
              playerAttackZone={playerAttackZone}
              playerDefenseZone={playerDefenseZone}
              setPlayerAttackZone={setPlayerAttackZone}
              setPlayerDefenseZone={setPlayerDefenseZone}
              executeAttack={executeAttack}
              isProcessing={isProcessing}
            />
            <BotBattlePanel
              selectedBot={selectedBot}
              currentBotHealth={currentBotHealth}
              botEquipment={botEquipment}
            />
          </div>
        </div>

        {/* Лог боя */}
        <div className="panel panel--tint panel--warm p-4 sm:p-6">
          <h3 className="font-ui text-sm sm:text-lg font-bold text-center mb-3 sm:mb-4"
              style={{ background: "linear-gradient(180deg,#fde8a7,#8a5a18)", WebkitBackgroundClip: "text", color: "transparent" }}>
            ХРОНИКА БИТВЫ
          </h3>
          <div
            ref={logRef}
            className="h-24 sm:h-32 overflow-y-auto space-y-1 game-scrollbar"
          >
            {battleLog.map((log, index) => {
              let logClass = "text-gray-300";
              if (log.type === 'crit') logClass = "text-red-400 font-bold";
              if (log.type === 'dodge') logClass = "text-green-400 font-bold";
              if (log.type === 'victory') logClass = "text-yellow-400 font-bold";
              if (log.type === 'defeat') logClass = "text-red-400 font-bold";
              if (log.type === 'info') logClass = "text-blue-400";
              return (
                <div key={index} className="text-xs sm:text-sm transition-all duration-300">
                  {log.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleInterface;
