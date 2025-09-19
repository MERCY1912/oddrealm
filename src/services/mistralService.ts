interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class MistralService {
  private static instance: MistralService;
  private apiKey: string;
  private baseUrl = 'https://api.mistral.ai/v1/chat/completions';
  private model = 'mistral-medium-latest';

  private constructor() {
    // Пробуем разные способы получения API ключа
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY || 
                  (typeof window !== 'undefined' && (window as any).VITE_MISTRAL_API_KEY) || 
                  'cZGg3pBnGpBY6hA3m7cXcJ947eIy9KXC'; // Fallback для тестирования
    
    if (!this.apiKey) {
      console.warn('Mistral API key not found. Bot responses will be disabled.');
      console.log('Available env vars:', Object.keys(import.meta.env));
    } else {
      console.log('✅ Mistral API key loaded successfully');
    }
  }

  public static getInstance(): MistralService {
    if (!MistralService.instance) {
      MistralService.instance = new MistralService();
    }
    return MistralService.instance;
  }

  /**
   * Устанавливает API ключ вручную (для отладки)
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('✅ Mistral API key set manually');
  }

  /**
   * Генерирует ответ бота на основе контекста чата и личности бота
   */
  async generateBotResponse(
    botPersonality: string,
    chatHistory: Array<{ username: string; message: string; timestamp: string }>,
    currentMessage: string,
    botName: string
  ): Promise<string> {
    console.log(`🧠 MistralService: Генерируем ответ для ${botName}`);
    console.log(`🔑 API ключ: ${this.apiKey ? 'найден' : 'НЕ НАЙДЕН'}`);
    
    if (!this.apiKey) {
      console.log('⚠️ Используем запасной ответ');
      return this.getFallbackResponse(botPersonality);
    }

    try {
      const systemPrompt = this.createSystemPrompt(botPersonality, botName);
      const messages = this.buildMessageHistory(systemPrompt, chatHistory, currentMessage);

      console.log('🚀 Отправляем запрос к Mistral AI...');
      console.log('📝 Сообщения:', messages);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 100,
          temperature: 0.8,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data: MistralResponse = await response.json();
      const botResponse = data.choices[0]?.message?.content?.trim();

      if (!botResponse) {
        return this.getFallbackResponse(botPersonality);
      }

      // Ограничиваем длину ответа
      return botResponse.length > 200 ? botResponse.substring(0, 200) + '...' : botResponse;

    } catch (error) {
      console.error('Error generating bot response:', error);
      return this.getFallbackResponse(botPersonality);
    }
  }

  /**
   * Создает системный промпт для бота
   */
  private createSystemPrompt(personality: string, botName: string): string {
    return `Ты ${botName}, игрок в онлайн-игре "Realm of Champions". 

Твоя личность: ${personality}

Правила общения:
- Отвечай как игрок, а не как AI
- Используй игровую терминологию (уровни, классы, подземелья, арена)
- Будь дружелюбным и помогай другим игрокам
- Не упоминай, что ты AI или бот
- Отвечай кратко (максимум 2-3 предложения)
- Используй эмодзи в меру
- Отвечай на русском языке

Примеры ответов:
- "Привет! Как дела в игре?"
- "Я сейчас прохожу подземелье, очень сложно!"
- "Можешь помочь с выбором оружия?"
- "Увидимся на арене! 💪"`;
  }

  /**
   * Строит историю сообщений для контекста
   */
  private buildMessageHistory(
    systemPrompt: string,
    chatHistory: Array<{ username: string; message: string; timestamp: string }>,
    currentMessage: string
  ): MistralMessage[] {
    console.log(`📚 История чата: ${chatHistory.length} сообщений`);
    console.log('📝 Первое сообщение:', chatHistory[0]);
    
    const messages: MistralMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Добавляем последние 5 сообщений для контекста
    const recentHistory = chatHistory.slice(-5);
    for (const msg of recentHistory) {
      // Проверяем разные варианты полей (username/player_name)
      const username = msg.username || msg.player_name;
      const message = msg.message;
      
      if (msg && username && message) {
        messages.push({
          role: username.includes('_bot') || username.includes('Bot') ? 'assistant' : 'user',
          content: `${username}: ${message}`
        });
      }
    }

    // Добавляем текущее сообщение
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  /**
   * Возвращает запасной ответ, если API недоступен
   */
  private getFallbackResponse(personality: string): string {
    const fallbackResponses = [
      "Интересно! Расскажи больше",
      "Понял, спасибо за информацию",
      "Да, согласен с тобой",
      "Хм, не думал об этом",
      "Хорошая идея!",
      "Попробуем разобраться вместе",
      "У меня тоже так было",
      "Классно! Продолжай"
    ];

    // Выбираем ответ на основе личности
    if (personality.includes('воин') || personality.includes('агрессивн')) {
      return "💪 Давай разберемся с этим!";
    } else if (personality.includes('маг') || personality.includes('мудр')) {
      return "🔮 Интересная мысль...";
    } else if (personality.includes('лучник') || personality.includes('осторожн')) {
      return "🏹 Нужно быть осторожнее";
    }

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  /**
   * Проверяет, доступен ли API
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export default MistralService;
