import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'loot' | 'levelup' | 'achievement';
  message: string;
  icon: string;
}

interface GameNotificationsProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const GameNotifications = ({ notifications, onRemove }: GameNotificationsProps) => {
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, 3000);
      
      return () => clearTimeout(timer);
    });
  }, [notifications, onRemove]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            medieval-bg-tertiary medieval-border border-2 rounded-lg p-4 shadow-lg
            ${notification.type === 'loot' ? 'loot-fx' : ''}
            ${notification.type === 'levelup' ? 'level-up-fx' : ''}
            ${notification.type === 'achievement' ? 'level-up-fx' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{notification.icon}</span>
            <div>
              <div className="medieval-text-primary font-bold text-sm">
                {notification.message}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameNotifications;
