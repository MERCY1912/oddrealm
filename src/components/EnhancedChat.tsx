import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  player_name: string;
  message: string;
  created_at: string;
  type?: 'general' | 'system' | 'trade';
}

interface EnhancedChatProps {
  userId: string;
  username: string;
}

const EnhancedChat = ({ userId, username }: EnhancedChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [autoScroll, setAutoScroll] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    addMockMessages();
    subscribeToMessages();
  }, []);

  // Автоскролл к последним сообщениям
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Обработка скролла для определения, нужно ли автоскроллить
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isNearBottom);
  };

  const addMockMessages = () => {
    // Добавляем тестовые сообщения для демонстрации
    const mockMessages: ChatMessage[] = [
      {
        id: 'mock-1',
        player_name: 'Myp',
        message: 'to [Котзилла]',
        created_at: new Date(Date.now() - 300000).toISOString(),
        type: 'general'
      },
      {
        id: 'mock-2',
        player_name: 'GAZOBUK',
        message: 'использовал магию кровавого нападения на персонажа "Oblivaron"',
        created_at: new Date(Date.now() - 240000).toISOString(),
        type: 'system'
      },
      {
        id: 'mock-3',
        player_name: 'GAZOBUK',
        message: 'to [3 EK]',
        created_at: new Date(Date.now() - 180000).toISOString(),
        type: 'general'
      },
      {
        id: 'mock-4',
        player_name: 'Драконобой',
        message: 'Кто-нибудь хочет сходить в подземелье?',
        created_at: new Date(Date.now() - 120000).toISOString(),
        type: 'general'
      },
      {
        id: 'mock-5',
        player_name: 'Темный_Маг',
        message: 'Продаю редкий посох +20 к магии!',
        created_at: new Date(Date.now() - 60000).toISOString(),
        type: 'trade'
      },
    ];
    
    setMessages(mockMessages);
    setLoading(false);
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('all_chat_messages')
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
    console.log('📡 Подписываемся на real-time обновления чата...');
    
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
          console.log('💬 Получено новое сообщение от пользователя:', payload);
          const newMessage: ChatMessage = {
            id: payload.new.id,
            player_name: payload.new.player_name,
            message: payload.new.message,
            created_at: payload.new.created_at,
            type: 'general'
          };
          setMessages(prev => [...prev, newMessage]);
          // Включаем автоскролл при получении нового сообщения
          setAutoScroll(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bot_chat_messages',
        },
        (payload) => {
          console.log('🤖 Получено новое сообщение от бота:', payload);
          // Преобразуем сообщение бота в формат ChatMessage
          const botMessage: ChatMessage = {
            id: payload.new.id,
            player_name: payload.new.player_name,
            message: payload.new.message,
            created_at: payload.new.created_at,
            type: 'general'
          };
          setMessages(prev => [...prev, botMessage]);
          // Включаем автоскролл при получении нового сообщения от бота
          setAutoScroll(true);
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Отписываемся от real-time обновлений чата');
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Пытаемся отправить в базу данных
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          player_id: userId,
          player_name: username,
          message: messageText,
        });

      if (error) throw error;
      console.log('✅ Сообщение отправлено в базу данных');
    } catch (error: any) {
      console.log('⚠️ Сообщение отправлено в демо-режиме:', error);
      
      // Добавляем сообщение локально для демонстрации
      const newMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        player_name: username,
        message: messageText,
        created_at: new Date().toISOString(),
        type: activeTab as 'general' | 'system' | 'trade'
      };
      
      setMessages(prev => [...prev, newMsg]);
    }

    // Включаем автоскролл после отправки сообщения
    setAutoScroll(true);
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

  const getFilteredMessages = () => {
    if (activeTab === 'general') {
      return messages.filter(msg => msg.type === 'general' || !msg.type);
    } else if (activeTab === 'system') {
      return messages.filter(msg => msg.type === 'system');
    } else if (activeTab === 'trade') {
      return messages.filter(msg => msg.type === 'trade');
    }
    return messages;
  };

  const getTabCount = (type: string) => {
    if (type === 'general') {
      return messages.filter(msg => msg.type === 'general' || !msg.type).length;
    } else if (type === 'system') {
      return messages.filter(msg => msg.type === 'system').length;
    } else if (type === 'trade') {
      return messages.filter(msg => msg.type === 'trade').length;
    }
    return 0;
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-t-lg">
      {/* Вкладки чата */}
      <div className="bg-gray-700 px-2 py-1 border-b border-gray-500 flex-shrink-0 rounded-t-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-600">
            <TabsTrigger 
              value="general" 
              className="text-xs data-[state=active]:bg-gray-500 data-[state=active]:text-white"
            >
              Общий чат
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="text-xs data-[state=active]:bg-gray-500 data-[state=active]:text-white"
            >
              Системные {getTabCount('system')}
            </TabsTrigger>
            <TabsTrigger 
              value="trade" 
              className="text-xs data-[state=active]:bg-gray-500 data-[state=active]:text-white"
            >
              Торговый {getTabCount('trade')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Область сообщений */}
      <ScrollArea 
        className="flex-1 p-1 min-h-0"
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        <div className="space-y-1">
          {loading ? (
            <div className="text-gray-500 text-sm text-center">
              Загрузка сообщений...
            </div>
          ) : getFilteredMessages().length === 0 ? (
            <div className="text-gray-500 text-sm text-center">
              Чат пуст. Будьте первым, кто начнет беседу!
            </div>
          ) : (
            getFilteredMessages().map((message) => (
              <div key={message.id} className="text-sm">
                <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
                <span className="text-gray-300 mx-1">[</span>
                <span className="text-red-400 font-bold">{message.player_name}</span>
                <span className="text-gray-300 mx-1">]</span>
                <span className="text-white ml-1">{message.message}</span>
              </div>
            ))
          )}
          {/* Невидимый элемент для автоскролла */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Поле ввода */}
      <div className="p-1 border-t border-gray-600 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">⚙</span>
          </div>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="bg-gray-700 border-gray-600 text-white text-sm flex-1 h-8"
            maxLength={200}
          />
          <div className="flex gap-1">
            <Button 
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              😊
            </Button>
            <Button 
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              📎
            </Button>
            <Button 
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              🔍
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChat;
