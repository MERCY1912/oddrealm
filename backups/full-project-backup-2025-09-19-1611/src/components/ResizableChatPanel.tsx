import React, { useState, useEffect, useRef } from 'react';
import Chat from './Chat';
import { PlayerProfile } from '@/types/game';
import { Card } from '@/components/ui/card';

interface ResizableChatPanelProps {
  player: PlayerProfile;
}

const ResizableChatPanel = ({ player }: ResizableChatPanelProps) => {
  const [height, setHeight] = useState(160); // Начальная высота в пикселях
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  // Загружаем сохраненную высоту из localStorage при монтировании
  useEffect(() => {
    const savedHeight = localStorage.getItem('chat-panel-height');
    if (savedHeight) {
      setHeight(parseInt(savedHeight, 10));
    }
  }, []);

  // Сохраняем высоту в localStorage при изменении и отправляем событие
  useEffect(() => {
    localStorage.setItem('chat-panel-height', height.toString());
    
    // Отправляем кастомное событие для синхронизации в том же окне
    const event = new CustomEvent('chat-height-changed', {
      detail: { height }
    });
    window.dispatchEvent(event);
  }, [height]);

  // Слушаем изменения высоты от кнопок в GameFooter
  useEffect(() => {
    const handleHeightChange = (e: CustomEvent) => {
      setHeight(e.detail.height);
    };

    window.addEventListener('chat-height-changed', handleHeightChange as EventListener);

    return () => {
      window.removeEventListener('chat-height-changed', handleHeightChange as EventListener);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    
    // Добавляем обработчики событий на document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = startYRef.current - e.clientY; // Инвертируем для изменения размера вверх
    const newHeight = Math.max(120, Math.min(400, startHeightRef.current + deltaY)); // Ограничения: 120px - 400px
    
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Очищаем обработчики при размонтировании
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={panelRef}
      className="relative"
      style={{ height: `${height}px` }}
    >
      <Card className="bg-gray-800 border-gray-600 h-full overflow-hidden">
        <Chat userId={player.id} username={player.username} />
      </Card>
      
      {/* Resize handle */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gray-600 hover:bg-gray-500 cursor-ns-resize transition-colors ${
          isResizing ? 'bg-gray-400' : ''
        }`}
        onMouseDown={handleMouseDown}
        title="Перетащите для изменения высоты чата"
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default ResizableChatPanel;
