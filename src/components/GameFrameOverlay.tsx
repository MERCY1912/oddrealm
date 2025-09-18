import React from 'react';
import gameFrameBorder from '@/assets/game-frame-border.jpg';

// Функция для получения базового URL Supabase
const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error('VITE_SUPABASE_URL is not defined');
  }
  return url;
};

interface GameFrameOverlayProps {
  children: React.ReactNode;
  className?: string;
}

const GameFrameOverlay: React.FC<GameFrameOverlayProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Левая верхняя рамка */}
      <div 
        className="absolute -top-3 -left-4 pointer-events-none z-30"
        style={{
          backgroundImage: `url(${gameFrameBorder})`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left',
          opacity: 0.9,
          width: '100px',
          height: '100px'
        }}
      />
      
      {/* Правая верхняя рамка */}
      <div 
        className="absolute -top-3 -right-4 pointer-events-none z-30"
        style={{
          backgroundImage: `url(${getSupabaseUrl()}/storage/v1/object/public/design/right_top_ornament_2.png)`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top right',
          opacity: 0.9,
          width: '100px',
          height: '100px'
        }}
      />
      
      {/* Контент панели */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GameFrameOverlay;
