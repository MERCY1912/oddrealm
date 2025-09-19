
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  label?: string;
  color?: 'health' | 'mana' | 'experience';
  showText?: boolean;
}

const ProgressBar = ({ 
  current, 
  max, 
  className, 
  label, 
  color = 'health',
  showText = true 
}: ProgressBarProps) => {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const isFull = percentage >= 100;
  
  const colorClasses = {
    health: 'bg-gradient-to-r from-red-600 to-red-500',
    mana: 'bg-gradient-to-r from-blue-600 to-blue-500', 
    experience: 'bg-gradient-to-r from-yellow-600 to-yellow-500',
  };

  const backgroundColors = {
    health: 'bg-red-900/30',
    mana: 'bg-blue-900/30',
    experience: 'bg-yellow-900/30',
  };

  return (
    <div className={cn('w-full max-w-full', className)}>
      {(label || showText) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-gray-300 font-medium">{label}</span>}
          {showText && (
            <span className="text-gray-400">{Number.isFinite(current) && Number.isFinite(max) ? `${Math.round(current)}/${Math.round(max)}` : '...'}</span>
          )}
        </div>
      )}
      <div className={cn(
        'relative w-full rounded-sm h-4 overflow-hidden border border-gray-600',
        backgroundColors[color]
      )}>
        <div 
          className={cn(
            'h-full transition-all duration-1000 ease-out rounded-sm',
            colorClasses[color]
          )}
          style={{ 
            width: `${percentage}%`,
            boxShadow: percentage > 0 ? `0 0 8px ${color === 'health' ? '#dc2626' : color === 'mana' ? '#2563eb' : '#ca8a04'}` : 'none'
          }}
        />
        {/* Анимация только для неполных полос */}
        {!isFull && percentage > 0 && (
          <div className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
            'animate-[shimmer_2s_ease-in-out_infinite]'
          )} 
          style={{ 
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
            transform: `translateX(-100%)`,
            animation: 'shimmer 2s ease-in-out infinite'
          }} />
        )}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
