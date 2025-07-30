# 🚀 Деплой F1 Bot в Railway

## 📋 Предварительные требования

1. **GitHub аккаунт** с репозиторием
2. **Railway аккаунт** (бесплатный)
3. **Telegram Bot Token** от @BotFather

## 🔧 Пошаговая инструкция

### 1. Подготовка репозитория

Убедитесь, что ваш код загружен в GitHub репозиторий:

```bash
git add .
git commit -m "Add web interface and Railway support"
git push origin main
```

### 2. Создание проекта в Railway

1. Перейдите на [Railway.app](https://railway.app/)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите ваш репозиторий с F1 Bot

### 3. Настройка переменных окружения

В Railway Dashboard:

1. Перейдите в раздел **"Variables"**
2. Добавьте следующие переменные:

```env
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
F1_API_URL=https://f1api.dev/api
NODE_ENV=production
```

### 4. Настройка домена (опционально)

1. В разделе **"Settings"** найдите **"Domains"**
2. Railway автоматически создаст домен вида: `your-app-name.railway.app`
3. Скопируйте этот URL для использования в боте

### 5. Обновление Web App URL

После получения домена, обновите переменную окружения:

```env
WEBAPP_URL=https://your-app-name.railway.app
```

### 6. Настройка Telegram Bot

1. Напишите @BotFather в Telegram
2. Отправьте команду `/setmenubutton`
3. Выберите вашего бота
4. Установите URL: `https://your-app-name.railway.app`

### 7. Проверка деплоя

1. Railway автоматически запустит деплой
2. Проверьте логи в разделе **"Deployments"**
3. Убедитесь, что нет ошибок

## 🔍 Проверка работоспособности

### Health Check
```bash
curl https://your-app-name.railway.app/health
```

### Веб-интерфейс
Откройте в браузере:
```
https://your-app-name.railway.app
```

### Telegram Bot
Отправьте боту команду `/start`

## 🛠 Устранение проблем

### Ошибка "Port already in use"
- Railway автоматически установит правильный порт
- Убедитесь, что в коде используется `process.env.PORT`

### Ошибка "Bot token not found"
- Проверьте переменную `TELEGRAM_BOT_TOKEN` в Railway
- Убедитесь, что токен правильный

### Ошибка "Web App not working"
- Проверьте переменную `WEBAPP_URL`
- Убедитесь, что домен правильный

### Ошибка "409 Conflict"
- Остановите все локальные экземпляры бота
- Убедитесь, что нет других деплоев

## 📊 Мониторинг

### Логи
- Railway автоматически собирает логи
- Доступны в разделе **"Deployments"**

### Метрики
- Railway показывает использование ресурсов
- Доступны в разделе **"Metrics"**

### Автоматический деплой
- Railway автоматически деплоит при push в main ветку
- Можно настроить другие ветки в настройках

## 🔄 Обновление

Для обновления приложения:

```bash
git add .
git commit -m "Update web interface"
git push origin main
```

Railway автоматически запустит новый деплой.

## 💰 Стоимость

- **Бесплатный план**: 500 часов/месяц
- **Платный план**: $5/месяц за дополнительные часы

## 🎯 Результат

После успешного деплоя у вас будет:

1. **Работающий Telegram бот** с веб-интерфейсом
2. **Красивый веб-сайт** доступный по URL
3. **Автоматические обновления** при изменении кода
4. **Мониторинг и логи** для отладки

---

🏁 **Ваш F1 Bot готов к использованию!** 🏁 