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
          max_tokens: 300,
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
    return `Ты ${botName}, обычный игрок в онлайн-игре "Realm of Champions". 

Твоя личность: ${personality}

ВАЖНО: 
- Веди себя как обычный человек, который играет в игру
- Используй разговорный стиль, как в реальной жизни
- Не играй роль, будь собой
- Отвечай коротко и по делу, как настоящие люди

Правила общения:
- Говори как обычный игрок, не как персонаж
- Используй простые фразы и выражения
- Помогай, если можешь, но не навязывайся
- Отвечай на вопросы прямо и честно
- Не используй много эмодзи (максимум 1-2)
- Не упоминай, что ты AI или бот
- Отвечай на русском языке

Примеры живых ответов:
- "Привет, как дела?"
- "Да, знаю это место"
- "Можешь помочь с квестом?"
- "Не знаю, сам ищу"
- "Ок, встретимся там"
- "У меня тоже проблемы с этим"
- "Попробуй другой способ"

Избегай: театральности, множества эмодзи, игрового сленга, длинных описаний. Будь обычным человеком.`;
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
      "Ок, понял",
      "Да, знаю",
      "Не знаю, сам ищу",
      "Попробуй так",
      "У меня тоже так",
      "Привет",
      "Как дела?",
      "Что нового?",
      "Можешь помочь?",
      "Да, могу",
      "Не уверен",
      "Попробуем",
      "Хорошо",
      "Понял тебя"
    ];

    // Выбираем ответ на основе личности (простые ответы)
    if (personality.includes('воин') || personality.includes('агрессивн')) {
      return "Да, помогу";
    } else if (personality.includes('маг') || personality.includes('мудр')) {
      return "Интересно, расскажи";
    } else if (personality.includes('лучник') || personality.includes('осторожн')) {
      return "Осторожно там";
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
