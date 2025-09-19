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

  private constructor() {
    this.mistralService = MistralService.getInstance();
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
      console.log('BotService: Инициализируем ботов...');
      
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

      if (!recentMessages || recentMessages.length === 0) {
        return;
      }

      // Фильтруем сообщения ботов (используем поле is_bot_message если доступно)
      const humanMessages = recentMessages.filter(msg => 
        !msg.is_bot_message && !this.botCharacters.some(bot => bot.username === msg.player_name)
      );

      if (humanMessages.length === 0) {
        return;
      }

      // Получаем полную историю чата для контекста (включая сообщения ботов)
      const { data: chatHistory } = await supabase
        .from('all_chat_messages')
        .select('player_name, message, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      // Выбираем бота для ответа
      const respondingBot = this.selectBotForResponse();
      if (!respondingBot) {
        return;
      }

      // Выбираем сообщение для ответа
      const messageToRespond = this.selectMessageToRespond(humanMessages);
      if (!messageToRespond) {
        return;
      }

      // Генерируем ответ
      await this.generateBotResponse(respondingBot, messageToRespond, chatHistory || []);

    } catch (error) {
      console.error('Ошибка проверки сообщений:', error);
    }
  }

  /**
   * Выбирает бота для ответа
   */
  private selectBotForResponse(): BotCharacter | null {
    const availableBots = this.botCharacters.filter(bot => 
      bot.status === 'online' && Math.random() * 100 < bot.response_chance
    );

    if (availableBots.length === 0) {
      return null;
    }

    return availableBots[Math.floor(Math.random() * availableBots.length)];
  }

  /**
   * Выбирает сообщение для ответа
   */
  private selectMessageToRespond(messages: any[]): any | null {
    // Выбираем случайное сообщение из последних
    const recentMessages = messages.slice(0, 3);
    return recentMessages[Math.floor(Math.random() * recentMessages.length)];
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
      console.log(`Бот ${bot.name} отвечает на сообщение: "${messageToRespond.message}"`);
      
      const response = await this.mistralService.generateBotResponse(
        bot.personality,
        chatHistory,
        messageToRespond.message,
        bot.name
      );

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
          console.log(`Бот ${bot.name} отправил ответ: "${response}"`);
          
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
