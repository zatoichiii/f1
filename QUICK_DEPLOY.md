# ⚡ Быстрый деплой в Railway

## 🚀 5 минут до работающего бота!

### 1. Подготовка GitHub
```bash
# Инициализируйте Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit with web interface"

# Создайте репозиторий на GitHub и загрузите код
git remote add origin https://github.com/YOUR_USERNAME/f1-bot.git
git push -u origin main
```

### 2. Создание проекта в Railway
1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите ваш репозиторий

### 3. Настройка переменных
В Railway Dashboard → Variables добавьте:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
F1_API_URL=https://f1api.dev/api
NODE_ENV=production
```

### 4. Получение домена
1. Railway автоматически создаст домен
2. Скопируйте URL вида: `https://your-app-name.railway.app`
3. Добавьте переменную:
```env
WEBAPP_URL=https://your-app-name.railway.app
```

### 5. Настройка Telegram Bot
1. Напишите @BotFather
2. `/setmenubutton` → выберите бота → установите URL
3. Отправьте боту `/start`

## ✅ Готово!

Ваш бот теперь работает 24/7 с красивым веб-интерфейсом!

---
**Время выполнения: ~5 минут** ⚡ 