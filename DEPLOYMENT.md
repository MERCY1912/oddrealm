# 🚀 Деплой игры "Кровавые Арены"

## Подготовка к деплою

Проект уже готов к деплою! Все необходимые файлы конфигурации созданы.

## 📦 Варианты деплоя

### 1. Vercel (Рекомендуется)

**Быстрый способ:**
1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите ваш репозиторий
5. Vercel автоматически определит настройки из `vercel.json`
6. Нажмите "Deploy"

**Через Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 2. Netlify

**Быстрый способ:**
1. Перейдите на [netlify.com](https://netlify.com)
2. Войдите через GitHub
3. Нажмите "New site from Git"
4. Выберите ваш репозиторий
5. Netlify автоматически определит настройки из `netlify.toml`
6. Нажмите "Deploy site"

**Через Netlify CLI:**
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### 3. GitHub Pages

1. В настройках репозитория перейдите в "Pages"
2. Выберите "GitHub Actions" как источник
3. Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🔧 Настройка переменных окружения

Убедитесь, что в вашем Supabase проекте настроены правильные URL и ключи:

1. Перейдите в настройки Supabase проекта
2. Скопируйте URL и anon key
3. В настройках деплоя добавьте переменные окружения:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📱 Проверка после деплоя

После деплоя проверьте:
- [ ] Главная страница загружается
- [ ] Модальное окно авторизации работает
- [ ] Регистрация новых пользователей работает
- [ ] Вход в игру работает
- [ ] Все изображения загружаются
- [ ] Игровой процесс функционирует

## 🎮 Игра с друзьями

После деплоя вы сможете:
1. Поделиться ссылкой на игру с друзьями
2. Играть в PvP режиме
3. Сражаться на арене
4. Покупать предметы в магазине
5. Собирать экипировку

## 🛠️ Локальная сборка

Для локальной сборки:
```bash
npm run build
npm run preview
```

## 📊 Мониторинг

- **Vercel**: Автоматический мониторинг в дашборде
- **Netlify**: Статистика в панели управления
- **Supabase**: Мониторинг базы данных в дашборде

## 🔒 Безопасность

- Все API ключи защищены переменными окружения
- RLS политики настроены в Supabase
- Аутентификация через Supabase Auth

---

**Удачного деплоя! 🎉**
