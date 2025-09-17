
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameNavigationProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
  isInBattle: boolean;
}

const navItems = [
  { id: 'character', label: 'Персонаж' },
  { id: 'inventory', label: 'Инвентарь' },
  { id: 'quests', label: 'Квесты' },
  { id: 'shop', label: 'Магазин' },
  { id: 'infirmary', label: 'Лечебница' },
  { id: 'town', label: 'Город' },
  { id: 'arena', label: 'Арена' },
];

const GameNavigation = ({ activeTab, onTabClick, isInBattle }: GameNavigationProps) => {
  return (
    <nav className="mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            onClick={() => onTabClick(item.id)}
            variant={activeTab === item.id ? 'default' : 'outline'}
            className="bg-gray-700 text-white hover:bg-gray-600"
            disabled={isInBattle && item.id !== 'arena'}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default GameNavigation;
