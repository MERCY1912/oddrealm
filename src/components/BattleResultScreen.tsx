
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';
import { calculateFinalStats } from '@/utils/enhancedCharacterStats';

interface BattleResultScreenProps {
  player: Player;
  victory: boolean;
  rewards: {
    experience: number;
    gold: number;
  };
  onContinue: () => void;
  onLeaveTower: () => void;
}

const BattleResultScreen = ({ 
  player, 
  victory, 
  rewards, 
  onContinue, 
  onLeaveTower 
}: BattleResultScreenProps) => {
  const finalStats = calculateFinalStats(player, player.equipment);

  const getEquipmentBonuses = () => {
    let totalAttack = 0;
    let totalDefense = 0;
    let totalHealth = 0;
    let totalMana = 0;

    if (player.equipment) {
      Object.values(player.equipment).forEach((item: any) => {
        if (item && item.stats) {
          totalAttack += item.stats.attack || 0;
          totalDefense += item.stats.defense || 0;
          totalHealth += item.stats.health || 0;
          totalMana += item.stats.mana || 0;
        }
      });
    }

    return { totalAttack, totalDefense, totalHealth, totalMana };
  };

  const equipmentBonuses = getEquipmentBonuses();

  return (
    <div className="min-h-screen medieval-bg-primary text-white p-4">
      <Card className="max-w-4xl mx-auto panel panel--tint panel--warm border-purple-600">
        <CardHeader className="text-center">
          <CardTitle className={`text-3xl ${victory ? 'text-green-400' : 'text-red-400'}`}>
            {victory ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Hero Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health and Mana */}
            <Card className="panel panel--tint panel--warm">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">Текущее состояние героя</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-400 font-bold">❤️ Здоровье</span>
                    <span className="text-white font-bold">{player.health}/{finalStats.maxHealth}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(player.health / finalStats.maxHealth) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-bold">💙 Мана</span>
                    <span className="text-white font-bold">{player.mana}/{finalStats.maxMana}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(player.mana / finalStats.maxMana) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combat Stats */}
            <Card className="panel panel--tint panel--warm">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400">Боевые характеристики</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-orange-400">⚔️ Атака:</span>
                  <span className="text-white font-bold">
                    {finalStats.attack}
                    {equipmentBonuses.totalAttack > 0 && (
                      <span className="text-green-400 ml-1">(+{equipmentBonuses.totalAttack})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">🛡️ Защита:</span>
                  <span className="text-white font-bold">
                    {finalStats.defense}
                    {equipmentBonuses.totalDefense > 0 && (
                      <span className="text-green-400 ml-1">(+{equipmentBonuses.totalDefense})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">💖 Макс. здоровье:</span>
                  <span className="text-white font-bold">
                    {finalStats.maxHealth}
                    {equipmentBonuses.totalHealth > 0 && (
                      <span className="text-green-400 ml-1">(+{equipmentBonuses.totalHealth})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">💠 Макс. мана:</span>
                  <span className="text-white font-bold">
                    {finalStats.maxMana}
                    {equipmentBonuses.totalMana > 0 && (
                      <span className="text-green-400 ml-1">(+{equipmentBonuses.totalMana})</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Bonuses */}
          {player.equipment && Object.keys(player.equipment).length > 0 && (
            <Card className="panel panel--tint panel--warm">
              <CardHeader>
                <CardTitle className="text-lg text-purple-400">Экипированные предметы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(player.equipment).map(([slot, item]: [string, any]) => {
                    if (!item) return null;
                    return (
                      <div key={slot} className="panel panel--tint p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            {slot}
                          </Badge>
                          <span className="text-white font-bold">{item.name}</span>
                        </div>
                        {item.stats && (
                          <div className="text-sm space-y-1">
                            {item.stats.attack && (
                              <div className="text-orange-400">⚔️ +{item.stats.attack} атака</div>
                            )}
                            {item.stats.defense && (
                              <div className="text-blue-400">🛡️ +{item.stats.defense} защита</div>
                            )}
                            {item.stats.health && (
                              <div className="text-red-400">❤️ +{item.stats.health} здоровье</div>
                            )}
                            {item.stats.mana && (
                              <div className="text-blue-400">💙 +{item.stats.mana} мана</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Battle Rewards */}
          {victory && (
            <Card className="panel panel--tint panel--warm border-green-600">
              <CardHeader>
                <CardTitle className="text-lg text-green-400">Награды за победу</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-yellow-400">⭐</div>
                    <div className="text-yellow-400 font-bold">+{rewards.experience} опыта</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-yellow-400">💰</div>
                    <div className="text-yellow-400 font-bold">+{rewards.gold} золота</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {victory ? (
              <>
                <Button 
                  onClick={onContinue}
                  className="medieval-button bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  ⬆️ Продолжить восхождение
                </Button>
                <Button 
                  onClick={onLeaveTower}
                  variant="outline"
                  size="lg"
                >
                  🚪 Покинуть башню
                </Button>
              </>
            ) : (
              <Button 
                onClick={onLeaveTower}
                variant="outline"
                size="lg"
                className="medieval-button bg-red-900 border-red-600 text-red-400 hover:bg-red-800"
              >
                💀 Покинуть башню
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BattleResultScreen;
