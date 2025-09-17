import React, { useState, useEffect } from 'react';
import defeatImage from '../assets/Defeat_grave.png';

interface DefeatAnimationProps {
  isVisible: boolean;
  onContinue?: () => void;
}

const DefeatAnimation: React.FC<DefeatAnimationProps> = ({ isVisible, onContinue }) => {
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
      {/* Мрачные частицы вокруг */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = startX + (Math.random() - 0.5) * 150; // Движение в сторону
          const endY = startY + Math.random() * 100; // Движение вниз (как падающие листья/пепел)
          
          return (
            <div
              key={i}
              className="absolute rounded-full animate-defeat-particle"
              style={{
                left: `${startX}%`,
                top: `${startY}%`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                backgroundColor: Math.random() > 0.5 ? '#4a4a4a' : '#2d2d2d',
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 4 + 3}s`,
                boxShadow: `0 0 ${Math.random() * 8 + 3}px ${Math.random() > 0.5 ? '#4a4a4a' : '#2d2d2d'}`,
                '--end-x': `${endX}%`,
                '--end-y': `${endY}%`
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      <div className="relative z-10 text-center">
        {/* Изображение поражения уменьшенное на 20% */}
        <div
          className={`transform transition-all duration-1000 ${
            showAnimation 
              ? 'scale-100 opacity-100' 
              : 'scale-50 opacity-0'
          }`}
        >
          <img
            src={defeatImage}
            alt="Defeat"
            className="max-w-[80%] max-h-[64vh] mx-auto"
            style={{
              objectFit: 'contain',
              filter: 'grayscale(20%) contrast(1.1)'
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
            className="mt-8 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Дальше
          </button>
        </div>
      </div>

      {/* CSS анимации для мрачных частиц */}
      <style jsx>{`
        @keyframes defeat-particle {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.8;
          }
          25% {
            transform: translate(calc(var(--end-x) * 0.25), calc(var(--end-y) * 0.25)) scale(0.9) rotate(90deg);
            opacity: 0.7;
          }
          50% {
            transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)) scale(0.8) rotate(180deg);
            opacity: 0.6;
          }
          75% {
            transform: translate(calc(var(--end-x) * 0.75), calc(var(--end-y) * 0.75)) scale(0.7) rotate(270deg);
            opacity: 0.4;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.5) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-defeat-particle {
          animation: defeat-particle ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default DefeatAnimation;



