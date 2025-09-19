import React, { useState, useEffect } from 'react';
import victoryImage from '../assets/Victory_leon.png';

interface VictoryAnimationProps {
  isVisible: boolean;
  onContinue?: () => void;
}

const VictoryAnimation: React.FC<VictoryAnimationProps> = ({ isVisible, onContinue }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Огоньки вокруг */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = startX + (Math.random() - 0.5) * 200; // Движение в сторону
          const endY = startY - Math.random() * 100; // Движение вверх
          
          return (
            <div
              key={i}
              className="absolute rounded-full animate-fire-spark"
              style={{
                left: `${startX}%`,
                top: `${startY}%`,
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                backgroundColor: Math.random() > 0.5 ? '#ff4500' : '#ff6347',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() > 0.5 ? '#ff4500' : '#ff6347'}`,
                '--end-x': `${endX}%`,
                '--end-y': `${endY}%`
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      <div className="relative z-10 text-center">
        {/* Изображение уменьшенное на 20% */}
        <div
          className={`transform transition-all duration-1000 ${
            showAnimation 
              ? 'scale-100 opacity-100' 
              : 'scale-50 opacity-0'
          }`}
        >
          <img
            src={victoryImage}
            alt="Victory"
            className="max-w-[80%] max-h-[64vh] mx-auto"
            style={{
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Кнопка "Дальше" */}
        <div
          className={`transform transition-all duration-1000 delay-500 ${
            showAnimation 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          <button
            onClick={onContinue}
            className="mt-8 px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Дальше
          </button>
        </div>
      </div>

      {/* CSS анимации для огоньков */}
      <style jsx>{`
        @keyframes fire-spark {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          25% {
            transform: translate(calc(var(--end-x) * 0.25), calc(var(--end-y) * 0.25)) scale(1.1);
            opacity: 0.9;
          }
          50% {
            transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)) scale(0.9);
            opacity: 0.8;
          }
          75% {
            transform: translate(calc(var(--end-x) * 0.75), calc(var(--end-y) * 0.75)) scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.5);
            opacity: 0;
          }
        }
        
        .animate-fire-spark {
          animation: fire-spark ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VictoryAnimation;
