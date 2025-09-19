export interface BotCharacter {
  id: string;
  name: string;
  username: string;
  character_class: 'warrior' | 'mage' | 'archer';
  level: number;
  personality: string;
  avatar_url?: string;
  is_active: boolean;
  response_chance: number; // 0-100, вероятность ответа на сообщение
  last_activity: string;
  location: string;
  status: 'online' | 'afk' | 'in_battle' | 'in_dungeon';
}

export interface BotMessage {
  id: string;
  bot_id: string;
  message: string;
  timestamp: string;
  response_to?: string; // ID сообщения, на которое отвечает бот
}

export interface BotActivity {
  id: string;
  bot_id: string;
  activity_type: 'chat' | 'status_change' | 'location_change';
  details: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  player_id: string;
  player_name: string;
  message: string;
  timestamp: string;
  is_bot?: boolean;
}
