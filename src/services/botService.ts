import { supabase } from '@/integrations/supabase/client';
import MistralService from './mistralService';
import { BotCharacter, BotMessage, ChatMessage } from '@/types/bot';

class BotService {
  private static instance: BotService;
  private mistralService: MistralService;
  private botCharacters: BotCharacter[] = [];
  private isRunning = false;
  private chatCheckInterval: NodeJS.Timeout | null = null;
  private presenceUpdateInterval: NodeJS.Timeout | null = null;
  private processedMessages: Set<string> = new Set();
  private isProcessingMessage: Set<string> = new Set();
  private instanceId: string = Math.random().toString(36).substr(2, 9);

  private constructor() {
    this.mistralService = MistralService.getInstance();
    
    // Пытаемся установить API ключ из переменных окружения
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (apiKey) {
      this.mistralService.setApiKey(apiKey);
    }
  }

  public static getInstance(): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  /**
   * Инициализирует ботов и запускает их активность
   */
  async initializeBots(): Promise<void> {
    try {
      // Проверяем, не инициализированы ли уже боты
      if (this.isRunning) {
        console.log('⚠️ BotService уже запущен, пропускаем повторную инициализацию');
        return;
      }

      console.log(`BotService [${this.instanceId}]: Инициализируем ботов...`);
      
      // Создаем ботов, если их нет
      await this.createDefaultBots();
      
      // Загружаем активных ботов
      await this.loadActiveBots();
      
      // Запускаем активность ботов
      this.startBotActivity();
      
      console.log(`BotService: Инициализировано ${this.botCharacters.length} ботов`);
    } catch (error) {
      console.error('Ошибка инициализации ботов:', error);
    }
  }

  /**
   * Создает ботов по умолчанию
   */
  private async createDefaultBots(): Promise<void> {
    const defaultBots: Omit<BotCharacter, 'id' | 'last_activity'>[] = [
      {
        name: 'Гароld',
        username: 'garold_bot',
        character_class: 'warrior',
        level: 15,
        personality: 'Опытный воин, любит помогать новичкам. Говорит кратко и по делу. Часто упоминает бои и арену.',
        is_active: true,
        response_chance: 70,
        location: 'Таврос',
        status: 'online'
      },
      {
        name: 'Мерлин',
        username: 'merlin_bot',
        character_class: 'mage',
        level: 22,
        personality: 'Мудрый маг, знает много о магии и подземельях. Любит давать советы и рассказывать истории.',
        is_active: true,
        response_chance: 60,
        location: 'Таврос',
        status: 'online'
      },
      {
        name: 'Луна',
        username: 'luna_bot',
        character_class: 'archer',
        level: 18,
        personality: 'Ловкий лучник, дружелюбная и общительная. Любит обсуждать квесты и приключения.',
        is_active: true,
        response_chance: 80,
        location: 'Таврос',
        status: 'online'
      }
    ];

    for (const botData of defaultBots) {
      try {
        // Проверяем, существует ли уже бот
        const { data: existingBot } = await supabase
          .from('bot_characters')
          .select('id')
          .eq('username', botData.username)
          .single();

        if (!existingBot) {
          const { data, error } = await supabase
            .from('bot_characters')
            .insert([{
              ...botData,
              last_activity: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error(`Ошибка создания бота ${botData.username}:`, error);
          } else {
            console.log(`Создан бот: ${botData.name}`);
          }
        }
      } catch (error) {
        console.error(`Ошибка при создании бота ${botData.username}:`, error);
      }
    }
  }

  /**
   * Загружает активных ботов
   */
  private async loadActiveBots(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('bot_characters')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      this.botCharacters = data || [];
      console.log(`Загружено ${this.botCharacters.length} активных ботов`);
    } catch (error) {
      console.error('Ошибка загрузки ботов:', error);
      this.botCharacters = [];
    }
  }

  /**
   * Запускает активность ботов
   */
  private startBotActivity(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('BotService: Запускаем активность ботов...');

    // Проверяем чат каждые 30 секунд
    this.chatCheckInterval = setInterval(() => {
      this.checkForNewMessages();
    }, 30000);

    // Обновляем присутствие ботов каждые 2 минуты
    this.presenceUpdateInterval = setInterval(() => {
      this.updateBotPresence();
    }, 120000);

    // Первоначальная проверка
    setTimeout(() => {
      this.checkForNewMessages();
      this.updateBotPresence();
    }, 5000);
  }

  /**
   * Останавливает активность ботов
   */
  stopBotActivity(): void {
    this.isRunning = false;
    
    if (this.chatCheckInterval) {
      clearInterval(this.chatCheckInterval);
      this.chatCheckInterval = null;
    }
    
    if (this.presenceUpdateInterval) {
      clearInterval(this.presenceUpdateInterval);
      this.presenceUpdateInterval = null;
    }
    
    console.log('BotService: Активность ботов остановлена');
  }

  /**
   * Проверяет новые сообщения в чате
   */
  private async checkForNewMessages(): Promise<void> {
    try {
      console.log(`🔍 BotService [${this.instanceId}]: Проверяем новые сообщения...`);
      
      // Очищаем старые обработанные сообщения (старше 10 минут)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      this.cleanOldProcessedMessages(tenMinutesAgo);
      
      // Получаем последние сообщения за последние 5 минут
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentMessages, error } = await supabase
        .from('all_chat_messages')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Ошибка получения сообщений:', error);
        return;
      }

      console.log(`📨 Найдено ${recentMessages?.length || 0} сообщений за последние 5 минут`);
      
      if (!recentMessages || recentMessages.length === 0) {
        console.log('📭 Нет сообщений для обработки');
        return;
      }

      // Фильтруем сообщения ботов (используем поле is_bot_message если доступно)
      const humanMessages = recentMessages.filter(msg => 
        !msg.is_bot_message && !this.botCharacters.some(bot => bot.username === msg.player_name)
      );

      console.log(`👤 Найдено ${humanMessages.length} сообщений от пользователей`);
      
      if (humanMessages.length === 0) {
        console.log('🤖 Нет сообщений от пользователей для ответа');
        return;
      }

      // Получаем полную историю чата для контекста (включая сообщения ботов)
      const { data: chatHistory } = await supabase
        .from('all_chat_messages')
        .select('player_name, message, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      // Выбираем бота для ответа
      console.log('🎯 Начинаем процесс выбора бота и сообщения...');
      const respondingBot = this.selectBotForResponse();
      if (!respondingBot) {
        console.log('❌ Не удалось выбрать бота для ответа');
        return;
      }

      // Выбираем сообщение для ответа
      const messageToRespond = this.selectMessageToRespond(humanMessages);
      if (!messageToRespond) {
        console.log('❌ Не удалось выбрать сообщение для ответа');
        return;
      }

      // Проверяем, не отвечали ли уже боты на это сообщение
      if (this.processedMessages.has(messageToRespond.id)) {
        console.log(`⚠️ На сообщение "${messageToRespond.message}" уже отвечали боты, пропускаем`);
        return;
      }

      // Проверяем, не обрабатывается ли уже это сообщение
      if (this.isProcessingMessage.has(messageToRespond.id)) {
        console.log(`⚠️ Сообщение "${messageToRespond.message}" уже обрабатывается, пропускаем`);
        return;
      }

      // Помечаем сообщение как обрабатываемое
      this.isProcessingMessage.add(messageToRespond.id);

      try {
      // Генерируем ответ
      console.log(`🚀 BotService [${this.instanceId}] - Бот ${respondingBot.name} отвечает на: "${messageToRespond.message}"`);
      await this.generateBotResponse(respondingBot, messageToRespond, chatHistory || []);
      
      // Помечаем сообщение как обработанное
      this.processedMessages.add(messageToRespond.id);
      console.log(`✅ BotService [${this.instanceId}] - Сообщение помечено как обработанное. Всего обработано: ${this.processedMessages.size}`);
      } finally {
        // Убираем из обрабатываемых
        this.isProcessingMessage.delete(messageToRespond.id);
      }

    } catch (error) {
      console.error('Ошибка проверки сообщений:', error);
    }
  }

  /**
   * Очищает старые обработанные сообщения
   */
  private cleanOldProcessedMessages(cutoffTime: string): void {
    // В реальном приложении здесь можно было бы очистить по времени создания сообщений
    // Но поскольку у нас нет доступа к времени создания по ID, просто ограничиваем размер Set
    if (this.processedMessages.size > 100) {
      console.log('🧹 Очищаем старые обработанные сообщения');
      this.processedMessages.clear();
      this.isProcessingMessage.clear();
    }
  }

  /**
   * Выбирает бота для ответа
   */
  private selectBotForResponse(): BotCharacter | null {
    console.log('🎯 Выбираем бота для ответа...');
    console.log('🤖 Доступные боты:', this.botCharacters.map(bot => ({
      name: bot.name,
      status: bot.status,
      response_chance: bot.response_chance
    })));

    const availableBots = this.botCharacters.filter(bot => 
      bot.status !== 'offline' && Math.random() * 100 < bot.response_chance
    );

    console.log(`✅ Боты готовые к ответу: ${availableBots.length}`);

    if (availableBots.length === 0) {
      console.log('❌ Нет доступных ботов для ответа');
      return null;
    }

    const selectedBot = availableBots[Math.floor(Math.random() * availableBots.length)];
    console.log(`✅ Выбран бот: ${selectedBot.name}`);
    return selectedBot;
  }

  /**
   * Выбирает сообщение для ответа
   */
  private selectMessageToRespond(messages: any[]): any | null {
    console.log('📝 Выбираем сообщение для ответа...');
    
    // Выбираем самое последнее сообщение от пользователя
    const latestMessage = messages[0];
    console.log('💬 Последнее сообщение:', latestMessage);
    
    // Проверяем, что сообщение не слишком старое (не более 2 минут)
    const messageTime = new Date(latestMessage.created_at).getTime();
    const now = Date.now();
    const twoMinutesAgo = now - (2 * 60 * 1000);
    
    console.log(`⏰ Время сообщения: ${new Date(messageTime).toLocaleTimeString()}`);
    console.log(`⏰ Сейчас: ${new Date(now).toLocaleTimeString()}`);
    console.log(`⏰ 2 минуты назад: ${new Date(twoMinutesAgo).toLocaleTimeString()}`);
    
    if (messageTime < twoMinutesAgo) {
      console.log('❌ Сообщение слишком старое, пропускаем');
      return null; // Сообщение слишком старое
    }
    
    console.log('✅ Сообщение подходит для ответа');
    return latestMessage;
  }

  /**
   * Генерирует ответ бота
   */
  private async generateBotResponse(
    bot: BotCharacter, 
    messageToRespond: any, 
    chatHistory: any[]
  ): Promise<void> {
    try {
      console.log(`🤖 BotService [${this.instanceId}] - Бот ${bot.name} отвечает на сообщение: "${messageToRespond.message}"`);
      console.log(`🔑 Mistral API доступен: ${this.mistralService.isAvailable()}`);
      
      const response = await this.mistralService.generateBotResponse(
        bot.personality,
        chatHistory,
        messageToRespond.message,
        bot.name
      );
      
      console.log(`📝 Сгенерированный ответ: "${response}"`);

      if (response) {
        // Отправляем сообщение от имени бота в специальную таблицу
        const { error } = await supabase
          .from('bot_chat_messages')
          .insert([{
            bot_id: bot.id,
            player_name: bot.username,
            message: response,
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Ошибка отправки сообщения бота:', error);
        } else {
          console.log(`✅ BotService [${this.instanceId}] - Бот ${bot.name} отправил ответ: "${response}"`);
          
          // Обновляем активность бота
          await this.updateBotActivity(bot.id, 'chat', `Ответил: "${response.substring(0, 50)}..."`);
        }
      }
    } catch (error) {
      console.error('Ошибка генерации ответа бота:', error);
    }
  }

  /**
   * Обновляет присутствие ботов
   */
  private async updateBotPresence(): Promise<void> {
    for (const bot of this.botCharacters) {
      try {
        // Случайно меняем статус и локацию
        const shouldChangeStatus = Math.random() < 0.3; // 30% шанс
        const shouldChangeLocation = Math.random() < 0.2; // 20% шанс

        let newStatus = bot.status;
        let newLocation = bot.location;

        if (shouldChangeStatus) {
          const statuses: Array<BotCharacter['status']> = ['online', 'afk', 'in_battle', 'in_dungeon'];
          newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        }

        if (shouldChangeLocation) {
          const locations = ['Таврос', 'Арена', 'Подземелье', 'Гильдия'];
          newLocation = locations[Math.floor(Math.random() * locations.length)];
        }

        // Обновляем в базе данных
        const now = new Date().toISOString();
        
        // Обновляем основную информацию бота
        console.log(`🤖 Бот ${bot.name}: ${newStatus} в ${newLocation}`);
        const { error: botError } = await supabase
          .from('bot_characters')
          .update({
            status: newStatus,
            location: newLocation,
            last_activity: now
          })
          .eq('id', bot.id);

        // Обновляем присутствие бота
        const { error: presenceError } = await supabase
          .from('bot_presence')
          .upsert({
            bot_id: bot.id,
            last_seen: now,
            status: newStatus,
            location: newLocation,
            last_activity: now
          }, {
            onConflict: 'bot_id'
          });

        const error = botError || presenceError;

        if (error) {
          console.error(`Ошибка обновления присутствия бота ${bot.name}:`, error);
        } else {
          // Обновляем локальный кэш
          bot.status = newStatus;
          bot.location = newLocation;
          bot.last_activity = new Date().toISOString();

          console.log(`Бот ${bot.name}: ${newStatus} в ${newLocation}`);
        }

      } catch (error) {
        console.error(`Ошибка обновления бота ${bot.name}:`, error);
      }
    }
  }

  /**
   * Обновляет активность бота
   */
  private async updateBotActivity(
    botId: string, 
    activityType: 'chat' | 'status_change' | 'location_change', 
    details: string
  ): Promise<void> {
    try {
      await supabase
        .from('bot_activity')
        .insert([{
          bot_id: botId,
          activity_type: activityType,
          details: details,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Ошибка обновления активности бота:', error);
    }
  }

  /**
   * Получает список активных ботов
   */
  getActiveBots(): BotCharacter[] {
    return this.botCharacters;
  }

  /**
   * Получает информацию о боте по ID
   */
  getBotById(id: string): BotCharacter | undefined {
    return this.botCharacters.find(bot => bot.id === id);
  }

  /**
   * Проверяет, является ли пользователь ботом
   */
  isBot(username: string): boolean {
    return this.botCharacters.some(bot => bot.username === username);
  }
}

export default BotService;
