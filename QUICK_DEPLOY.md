# ⚡ Быстрое развертывание F1 Bot

## 🚀 Railway (Самый простой способ)

1. **Подготовка:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Развертывание:**
   - Перейдите на [railway.app](https://railway.app)
   - Войдите через GitHub
   - Нажмите "New Project" → "Deploy from GitHub repo"
   - Выберите ваш репозиторий
   - Добавьте переменные окружения:
     - `TELEGRAM_BOT_TOKEN` = ваш токен бота
     - `F1_API_URL` = https://f1api.dev/api

3. **Готово!** Бот автоматически запустится.

## 🔧 Альтернативы

### Render
- [render.com](https://render.com)
- Создайте Web Service
- Подключите GitHub репозиторий
- Настройте переменные окружения

### Heroku
```bash
heroku create your-f1-bot
heroku config:set TELEGRAM_BOT_TOKEN=your_token
git push heroku main
```

## ✅ Проверка

После деплоя в логах должно появиться:
```
F1 Bot запущен! 🏁
```

## 🆘 Если что-то не работает

1. Проверьте логи в панели управления
2. Убедитесь, что токен бота правильный
3. Проверьте переменные окружения
4. Убедитесь, что бот не заблокирован в Telegram

## 📞 Поддержка

- Логи: Панель управления хостинга
- Telegram: @BotFather для настройки бота
- API: https://f1api.dev для данных F1 