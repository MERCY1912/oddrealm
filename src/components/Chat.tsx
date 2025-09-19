
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMessage {
  id: string;
  player_name: string;
  message: string;
  created_at: string;
  mentions?: string[]; // Массив упомянутых пользователей
}

interface ChatProps {
  userId: string;
  username: string;
}

const Chat = ({ userId, username }: ChatProps) => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    addMockMessages();
    subscribeToMessages();
    
    // Fallback: периодическая проверка новых сообщений каждые 5 секунд
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Автоскролл к последним сообщениям
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        .from('all_chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const reversedData = data.reverse();
        
        // Проверяем, есть ли новые сообщения
        setMessages(prevMessages => {
          // Если это первая загрузка или нет предыдущих сообщений, устанавливаем все
          if (prevMessages.length === 0 || loading) {
            // Инициализируем обработанные ID для всех загруженных сообщений
            reversedData.forEach(msg => processedMessageIds.current.add(msg.id));
            return reversedData;
          }
          
          // Проверяем, есть ли новые сообщения
          const lastMessage = prevMessages[prevMessages.length - 1];
          const newMessages = reversedData.filter(msg => 
            new Date(msg.created_at) > new Date(lastMessage.created_at) &&
            !processedMessageIds.current.has(msg.id)
          );
          
          if (newMessages.length > 0) {
            console.log(`🔄 Загружено ${newMessages.length} новых сообщений`);
            // Добавляем ID сообщений в обработанные
            newMessages.forEach(msg => processedMessageIds.current.add(msg.id));
            return [...prevMessages, ...newMessages];
          }
          
          return prevMessages;
        });
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
          
          // Проверяем, не обработано ли уже это сообщение
          if (processedMessageIds.current.has(payload.new.id)) {
            console.log('⚠️ Сообщение уже обработано, пропускаем');
            return;
          }
          
          const newMessage: ChatMessage = {
            id: payload.new.id,
            player_name: payload.new.player_name,
            message: payload.new.message,
            created_at: payload.new.created_at
          };
          
          processedMessageIds.current.add(payload.new.id);
          setMessages(prev => [...prev, newMessage]);
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
          
          // Проверяем, не обработано ли уже это сообщение
          if (processedMessageIds.current.has(payload.new.id)) {
            console.log('⚠️ Сообщение бота уже обработано, пропускаем');
            return;
          }
          
          // Преобразуем сообщение бота в формат ChatMessage
          const botMessage: ChatMessage = {
            id: payload.new.id,
            player_name: payload.new.player_name,
            message: payload.new.message,
            created_at: payload.new.created_at
          };
          
          processedMessageIds.current.add(payload.new.id);
          setMessages(prev => [...prev, botMessage]);
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Отписываемся от real-time обновлений чата');
      supabase.removeChannel(channel);
    };
  };

  // Функция для обработки клика по нику
  const handleUsernameClick = (clickedUsername: string) => {
    if (messageInputRef.current) {
      // Проверяем, не упомянут ли уже этот пользователь
      const currentMessage = newMessage;
      const mentionPattern = new RegExp(`@${clickedUsername}\\b`, 'i');
      
      if (!mentionPattern.test(currentMessage)) {
        // Добавляем упоминание в конец сообщения
        const mention = `@${clickedUsername} `;
        const newText = currentMessage + (currentMessage ? ' ' : '') + mention;
        setNewMessage(newText);
        
        // Фокусируемся на поле ввода
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      }
    }
  };

  // Функция для подсветки упоминаний в сообщении
  const renderMessageWithMentions = (message: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      // Добавляем текст до упоминания
      if (match.index > lastIndex) {
        parts.push(message.slice(lastIndex, match.index));
      }
      
      // Добавляем упоминание с подсветкой
      parts.push(
        <span 
          key={match.index} 
          className="bg-blue-100 text-blue-800 px-1 rounded font-medium cursor-pointer hover:bg-blue-200 transition-colors"
          onClick={() => handleUsernameClick(match[1])}
          title={`Упомянуть ${match[1]}`}
        >
          @{match[1]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Добавляем оставшийся текст
    if (lastIndex < message.length) {
      parts.push(message.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : message;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Извлекаем упоминания из сообщения
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(messageText)) !== null) {
      mentions.push(match[1]);
    }

    // Сначала добавляем сообщение локально для мгновенного отображения
    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      player_name: username,
      message: messageText,
      created_at: new Date().toISOString(),
      mentions: mentions.length > 0 ? mentions : undefined
    };
    
    setMessages(prev => [...prev, newMsg]);

    // Затем пытаемся отправить в базу данных
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
      console.log('⚠️ Ошибка отправки в базу данных:', error);
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
      <ScrollArea 
        className={`flex-1 min-h-0 game-scrollbar ${isMobile ? 'px-1 py-0.5' : 'p-2'}`}
        ref={scrollAreaRef}
      >
        <div className={`${isMobile ? 'space-y-0.5' : 'space-y-2'}`}>
          {loading ? (
            <div className={`text-gray-500 text-center ${isMobile ? 'text-xs py-1' : 'text-sm'}`}>
              Загрузка...
            </div>
          ) : messages.length === 0 ? (
            <div className={`text-gray-500 text-center ${isMobile ? 'text-xs py-1' : 'text-sm'}`}>
              {isMobile ? 'Чат пуст' : 'Чат пуст. Будьте первым, кто начнет беседу!'}
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`text-white ${isMobile ? 'py-0.5 text-xs' : 'py-1 text-sm'}`}>
                {isMobile ? (
                  <div className="flex items-start gap-1">
                    <span 
                      className="text-red-400 font-bold text-xs flex-shrink-0 cursor-pointer hover:text-red-300 transition-colors"
                      onClick={() => handleUsernameClick(message.player_name)}
                      title={`Упомянуть ${message.player_name}`}
                    >
                      {message.player_name}:
                    </span>
                    <span className="break-words">{renderMessageWithMentions(message.message)}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
                    <span 
                      className="text-red-400 font-bold text-xs ml-2 cursor-pointer hover:text-red-300 transition-colors"
                      onClick={() => handleUsernameClick(message.player_name)}
                      title={`Упомянуть ${message.player_name}`}
                    >
                      {message.player_name}
                    </span>
                    <span className="ml-2 break-words">{renderMessageWithMentions(message.message)}</span>
                  </>
                )}
              </div>
            ))
          )}
          {/* Невидимый элемент для автоскролла */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className={`border-t medieval-border flex-shrink-0 ${isMobile ? 'px-1 py-0.5' : 'p-2'}`}>
        <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'}`}>
          <Input
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isMobile ? "Сообщение..." : "Введите сообщение..."}
            className={`medieval-bg-tertiary medieval-border text-white flex-1 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] ${isMobile ? 'text-xs h-7' : 'text-sm'}`}
            style={{
              background: 'linear-gradient(145deg, hsl(var(--medieval-bg-tertiary)), hsl(var(--medieval-bg-secondary)))'
            }}
            maxLength={200}
          />
          <Button
            onClick={sendMessage}
            className={`bg-red-600 hover:bg-red-700 text-white flex-shrink-0 ${isMobile ? 'text-xs px-2 h-7' : 'text-sm px-3'}`}
            disabled={!newMessage.trim()}
          >
            {isMobile ? '↵' : '↵'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
