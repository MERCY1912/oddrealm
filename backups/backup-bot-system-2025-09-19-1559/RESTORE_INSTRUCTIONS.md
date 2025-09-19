# 🔄 Инструкции по восстановлению бекапа

## 📋 Быстрое восстановление

### 1. Подготовка проекта
```bash
# Создать новый проект или очистить существующий
npm install
```

### 2. Восстановление файлов
Скопировать файлы из бекапа в соответствующие директории:

#### Сервисы
- `botService.ts` → `src/services/`
- `mistralService.ts` → `src/services/`
- `fastOnlineService.ts` → `src/services/`

#### Хуки
- `useBotSystem.ts` → `src/hooks/`
- `useFastOnlinePlayers.ts` → `src/hooks/`
- `useFastUserPresence.ts` → `src/hooks/`

#### Компоненты
- `EnhancedChat.tsx` → `src/components/`
- `OnlinePlayersListWithBots.tsx` → `src/components/`
- `BotManagement.tsx` → `src/components/`

#### Типы
- `bot.ts` → `src/types/`

### 3. База данных
Применить SQL миграции в следующем порядке:

1. **RPC функции:**
   ```sql
   -- Выполнить create-all-rpc-functions-fixed.sql в Supabase SQL Editor
   ```

2. **Система ботов:**
   ```sql
   -- Выполнить 20250121000001_create_bot_system.sql в Supabase SQL Editor
   ```

3. **Финальная миграция ботов:**
   ```sql
   -- Выполнить apply-bot-system-migration-final.sql в Supabase SQL Editor
   ```

4. **Разрешения чата:**
   ```sql
   -- Выполнить fix-bot-chat-permissions.sql в Supabase SQL Editor
   ```

### 4. Переменные окружения
Скопировать `env.local.example` в `env.local` и настроить:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_KEY=your_service_key
VITE_MISTRAL_API_KEY=your_mistral_api_key
```

### 5. Интеграция в основное приложение

#### В `src/components/GameMain.tsx`:
```typescript
import { useBotSystem } from '../hooks/useBotSystem';

// В компоненте:
const { bots, isLoading: botsLoading } = useBotSystem({ autoStart: true });
```

#### В `src/components/GameInterface.tsx`:
Заменить `OnlinePlayersList` на `OnlinePlayersListWithBots`

#### В чате:
Заменить обычный чат на `EnhancedChat`

## 🧪 Тестирование

### 1. Проверка ботов
```bash
# Запустить тест ботов (если есть Node.js скрипты)
node scripts/test-bot-system.cjs
```

### 2. Проверка чата
- Открыть игру
- Написать сообщение в чат
- Проверить, что боты отвечают
- Убедиться, что нет дублирования ответов

### 3. Проверка онлайн системы
- Проверить отображение игроков онлайн
- Убедиться, что боты отображаются в списке
- Проверить обновление статусов

## ⚠️ Важные моменты

1. **Mistral API Key** - обязательно настроить для работы ботов
2. **RLS Policies** - убедиться, что применены все политики безопасности
3. **Индексы** - проверить создание индексов для производительности
4. **Кэширование** - настроено автоматически в `fastOnlineService.ts`

## 🔧 Возможные проблемы

### Боты не отвечают
- Проверить `VITE_MISTRAL_API_KEY` в env.local
- Проверить RLS политики для `bot_chat_messages`
- Проверить логи в консоли браузера

### Дублирование ответов
- Убедиться, что используется правильная версия `botService.ts`
- Проверить кулдаун 30 секунд между сообщениями

### Проблемы с базой данных
- Проверить все миграции применены
- Убедиться в правильности RPC функций
- Проверить существование всех таблиц

---
**Время восстановления:** 15-30 минут  
**Сложность:** Средняя  
**Требования:** Supabase проект, Mistral AI API ключ
