
import React, { useState, useEffect } from 'react';
import ResizableOnlinePlayersList from './ResizableOnlinePlayersList';
import EnhancedChat from './EnhancedChat';
import { PlayerProfile } from '@/types/game';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface GameFooterProps {
  player: PlayerProfile;
}

const GameFooter = ({ player }: GameFooterProps) => {
  const [chatHeight, setChatHeight] = useState(() => {
    // По умолчанию 20% от высоты экрана
    const defaultHeight = Math.round(window.innerHeight * 0.2);
    const savedHeight = localStorage.getItem('chat-panel-height');
    return savedHeight ? parseInt(savedHeight, 10) : defaultHeight;
  });

  useEffect(() => {
    const updateHeight = () => {
      const savedHeight = localStorage.getItem('chat-panel-height');
      if (savedHeight) {
        setChatHeight(parseInt(savedHeight, 10));
      } else {
        // Если нет сохраненной высоты, используем 20% от текущего размера экрана
        const defaultHeight = Math.round(window.innerHeight * 0.2);
        setChatHeight(defaultHeight);
      }
    };

    updateHeight();

    const handleHeightChange = (e: CustomEvent) => {
      setChatHeight(e.detail.height);
    };

    const handleResize = () => {
      // При изменении размера окна пересчитываем высоту, если нет сохраненной
      const savedHeight = localStorage.getItem('chat-panel-height');
      if (!savedHeight) {
        const defaultHeight = Math.round(window.innerHeight * 0.2);
        setChatHeight(defaultHeight);
      }
    };

    window.addEventListener('chat-height-changed', handleHeightChange as EventListener);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('chat-height-changed', handleHeightChange as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const increaseChatHeight = () => {
    const maxHeight = Math.round(window.innerHeight * 0.5); // Максимум 50% экрана
    const newHeight = Math.min(maxHeight, chatHeight + 20);
    setChatHeight(newHeight);
    
    // Сохраняем в localStorage
    localStorage.setItem('chat-panel-height', newHeight.toString());
    
    // Отправляем событие для синхронизации
    const event = new CustomEvent('chat-height-changed', {
      detail: { height: newHeight }
    });
    window.dispatchEvent(event);
  };

  const decreaseChatHeight = () => {
    const minHeight = Math.round(window.innerHeight * 0.1); // Минимум 10% экрана
    const newHeight = Math.max(minHeight, chatHeight - 20);
    setChatHeight(newHeight);
    
    // Сохраняем в localStorage
    localStorage.setItem('chat-panel-height', newHeight.toString());
    
    // Отправляем событие для синхронизации
    const event = new CustomEvent('chat-height-changed', {
      detail: { height: newHeight }
    });
    window.dispatchEvent(event);
  };

  return (
    <footer 
      className="fixed bottom-0 left-0 w-full bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-20"
      style={{ 
        height: `${chatHeight}px`
      }}
    >
      {/* Кнопки управления размером чата */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
          <Button
            onClick={increaseChatHeight}
            disabled={chatHeight >= Math.round(window.innerHeight * 0.5)}
            size="sm"
            variant="outline"
            className="w-8 h-6 p-0 bg-gray-700 border-gray-500 hover:bg-gray-600 text-white"
            title="Увеличить высоту чата"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            onClick={decreaseChatHeight}
            disabled={chatHeight <= Math.round(window.innerHeight * 0.1)}
            size="sm"
            variant="outline"
            className="w-8 h-6 p-0 bg-gray-700 border-gray-500 hover:bg-gray-600 text-white"
            title="Уменьшить высоту чата"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

      <div className="h-full px-2">
        <div className="flex h-full gap-2">
          {/* Чат занимает 90% ширины */}
          <div className="w-[90%]">
            <EnhancedChat userId={player.id} username={player.username} />
          </div>
          
          {/* Список игроков занимает 10% ширины */}
          <div className="w-[10%] flex-shrink-0">
            <ResizableOnlinePlayersList />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GameFooter;
