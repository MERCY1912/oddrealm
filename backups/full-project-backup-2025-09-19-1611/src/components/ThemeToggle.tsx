import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="game-border game-text-primary hover:game-bg-secondary transition-colors"
    >
      {theme === 'light' ? (
        <>
          <span className="mr-2">🌙</span>
          Темная
        </>
      ) : (
        <>
          <span className="mr-2">☀️</span>
          Светлая
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;

