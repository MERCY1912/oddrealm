import React, { useEffect, useState } from 'react';
import OnlinePlayersList from './OnlinePlayersList';

const ResizableOnlinePlayersList = () => {
  const [height, setHeight] = useState(160);

  // Синхронизируем высоту с чатом
  useEffect(() => {
    const updateHeight = () => {
      const savedHeight = localStorage.getItem('chat-panel-height');
      if (savedHeight) {
        setHeight(parseInt(savedHeight, 10));
      }
    };

    // Обновляем высоту при загрузке
    updateHeight();

    // Слушаем изменения в localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-panel-height' && e.newValue) {
        setHeight(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Также слушаем кастомное событие для синхронизации в том же окне
    const handleHeightChange = (e: CustomEvent) => {
      setHeight(e.detail.height);
    };

    window.addEventListener('chat-height-changed', handleHeightChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chat-height-changed', handleHeightChange as EventListener);
    };
  }, []);

  return (
    <div style={{ height: `${height}px` }} className="h-full">
      <OnlinePlayersList />
    </div>
  );
};

export default ResizableOnlinePlayersList;
