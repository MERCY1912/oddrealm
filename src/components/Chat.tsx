
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  player_name: string;
  message: string;
  created_at: string;
}

interface ChatProps {
  userId: string;
  username: string;
}

const Chat = ({ userId, username }: ChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    addMockMessages();
    subscribeToMessages();
  }, []);

  const addMockMessages = () => {
    // Добавляем тестовые сообщения для демонстрации
    const mockMessages: ChatMessage[] = [
      {
        id: 'mock-1',
        player_name: 'Драконобой',
        message: 'Кто-нибудь хочет сходить в подземелье?',
        created_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'mock-2',
        player_name: 'Темный_Маг',
        message: 'Продаю редкий посох +20 к магии!',
        created_at: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: 'mock-3',
        player_name: 'Быстрая_Стрела',
        message: 'Где можно найти хорошую броню?',
        created_at: new Date(Date.now() - 180000).toISOString(),
      },
      {
        id: 'mock-4',
        player_name: 'Железный_Кулак',
        message: 'Ищу команду для рейда на босса!',
        created_at: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: 'mock-5',
        player_name: 'Ледяная_Ведьма',
        message: 'Всем привет! Как дела, воины?',
        created_at: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: 'mock-6',
        player_name: 'Златовласка',
        message: 'Кто знает, где торговец алхимией?',
        created_at: new Date(Date.now() - 30000).toISOString(),
      },
    ];
    
    setMessages(mockMessages);
    setLoading(false);
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data.reverse());
      }
    } catch (error: any) {
      console.log('Чат загружается в демо-режиме');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Добавляем сообщение локально для демонстрации
    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      player_name: username,
      message: newMessage,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Пытаемся отправить в базу данных
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          player_id: userId,
          player_name: username,
          message: newMessage,
        });

      if (error) throw error;
    } catch (error: any) {
      console.log('Сообщение отправлено в демо-режиме');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col chat-area">
      <ScrollArea className="flex-1 p-2 min-h-0 game-scrollbar">
        <div className="space-y-2">
          {loading ? (
            <div className="text-gray-500 text-sm text-center">
              Загрузка сообщений...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500 text-sm text-center">
              Чат пуст. Будьте первым, кто начнет беседу!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="text-white text-sm py-1">
                <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
                <span className="text-red-400 font-bold text-xs ml-2">{message.player_name}</span>
                <span className="ml-2 break-words">{message.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t medieval-border flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="medieval-bg-tertiary medieval-border text-white text-sm flex-1 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--medieval-bg-tertiary)), hsl(var(--medieval-bg-secondary)))'
            }}
            maxLength={200}
          />
          <Button
            onClick={sendMessage}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 flex-shrink-0"
            disabled={!newMessage.trim()}
          >
            ↵
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
