require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { 
  getAllDrivers,
  getLastRaceResults, 
  getSeasonCalendar, 
  getCurrentDriverStandings,
  getCurrentConstructorStandings,
  getAllTeams,
  getTeamInfo,
  getTeamDrivers,
  getAllCircuits,
  getNextRace,
  getLastRace,
  getDriverInfo,
  formatRaceTime,
  formatDate,
  getPositionEmoji 
} = require('./utils/raceUtils');
const { getRandomDriverFact } = require('./data/driverFacts');

// Проверка наличия токена бота
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ ОШИБКА: TELEGRAM_BOT_TOKEN не найден в переменных окружения!');
  console.error('Создайте файл .env и добавьте: TELEGRAM_BOT_TOKEN=ваш_токен_бота');
  process.exit(1);
}

// Инициализация Express сервера для веб-интерфейса
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'F1 Bot is running! 🏁',
    timestamp: new Date().toISOString()
  });
});

// API Routes для веб-интерфейса
app.get('/api/next-race', async (req, res) => {
  try {
    const nextRace = await getNextRace();
    res.json(nextRace);
  } catch (error) {
    console.error('API Error - next-race:', error);
    res.status(500).json({ error: 'Ошибка получения данных о ближайшей гонке' });
  }
});

app.get('/api/last-race', async (req, res) => {
  try {
    const lastRace = await getLastRace();
    res.json(lastRace);
  } catch (error) {
    console.error('API Error - last-race:', error);
    res.status(500).json({ error: 'Ошибка получения данных о последней гонке' });
  }
});

app.get('/api/last-race-results', async (req, res) => {
  try {
    const results = await getLastRaceResults();
    res.json(results);
  } catch (error) {
    console.error('API Error - last-race-results:', error);
    res.status(500).json({ error: 'Ошибка получения результатов последней гонки' });
  }
});

app.get('/api/calendar', async (req, res) => {
  try {
    const calendar = await getSeasonCalendar();
    res.json(calendar);
  } catch (error) {
    console.error('API Error - calendar:', error);
    res.status(500).json({ error: 'Ошибка получения календаря сезона' });
  }
});

app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await getAllDrivers();
    res.json(drivers);
  } catch (error) {
    console.error('API Error - drivers:', error);
    res.status(500).json({ error: 'Ошибка получения списка пилотов' });
  }
});

app.get('/api/driver/:id', async (req, res) => {
  try {
    const driver = await getDriverInfo(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Пилот не найден' });
    }
    res.json(driver);
  } catch (error) {
    console.error('API Error - driver:', error);
    res.status(500).json({ error: 'Ошибка получения информации о пилоте' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('API Error - teams:', error);
    res.status(500).json({ error: 'Ошибка получения списка команд' });
  }
});

app.get('/api/team/:id', async (req, res) => {
  try {
    const team = await getTeamInfo(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json(team);
  } catch (error) {
    console.error('API Error - team:', error);
    res.status(500).json({ error: 'Ошибка получения информации о команде' });
  }
});

app.get('/api/team/:id/drivers', async (req, res) => {
  try {
    const drivers = await getTeamDrivers(req.params.id);
    res.json(drivers);
  } catch (error) {
    console.error('API Error - team drivers:', error);
    res.status(500).json({ error: 'Ошибка получения пилотов команды' });
  }
});

app.get('/api/standings/drivers', async (req, res) => {
  try {
    const standings = await getCurrentDriverStandings();
    res.json(standings);
  } catch (error) {
    console.error('API Error - driver standings:', error);
    res.status(500).json({ error: 'Ошибка получения зачёта пилотов' });
  }
});

app.get('/api/standings/constructors', async (req, res) => {
  try {
    const standings = await getCurrentConstructorStandings();
    res.json(standings);
  } catch (error) {
    console.error('API Error - constructor standings:', error);
    res.status(500).json({ error: 'Ошибка получения зачёта конструкторов' });
  }
});

app.get('/api/circuits', async (req, res) => {
  try {
    const circuits = await getAllCircuits();
    res.json(circuits);
  } catch (error) {
    console.error('API Error - circuits:', error);
    res.status(500).json({ error: 'Ошибка получения списка трасс' });
  }
});

app.get('/api/circuit/:id', async (req, res) => {
  try {
    const circuit = await getAllCircuits();
    const foundCircuit = circuit.find(c => c.id === req.params.id);
    if (!foundCircuit) {
      return res.status(404).json({ error: 'Трасса не найдена' });
    }
    res.json(foundCircuit);
  } catch (error) {
    console.error('API Error - circuit:', error);
    res.status(500).json({ error: 'Ошибка получения информации о трассе' });
  }
});

// Инициализация бота с улучшенной обработкой ошибок
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: true,
  // Добавляем обработку ошибок
  request: {
    timeout: 30000, // 30 секунд таймаут
    retry: 3 // 3 попытки
  }
});

// Хранилище пользователей (в реальном проекте лучше использовать базу данных)
const userPreferences = new Map();

// Ergast API
const F1_API = process.env.F1_API_URL || 'https://f1api.dev/api';

// Эмодзи для красивого отображения
const EMOJIS = {
  flag: '🏁',
  trophy: '🏆',
  car: '🏎️',
  heart: '❤️',
  fire: '🔥',
  clock: '⏰',
  calendar: '📅',
  star: '⭐',
  check: '✅',
  warning: '⚠️',
  party: '🎉',
  crown: '👑',
  lightning: '⚡',
  rocket: '🚀',
  info: 'ℹ️'
};

// Основные команды бота (упрощенные)
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const webAppUrl = process.env.WEBAPP_URL || `https://${process.env.RAILWAY_STATIC_URL || 'localhost:3000'}`;
  
  const welcomeMessage = `
${EMOJIS.car} Добро пожаловать в F1 Bot! ${EMOJIS.car}

Я твой персональный помощник по Формуле-1! 

${EMOJIS.rocket} Все взаимодействие происходит через современный веб-интерфейс:

${EMOJIS.flag} Доступные команды:
• /webapp - Открыть веб-интерфейс
• /subscribe - Подписаться на уведомления
• /subscription - Проверить статус подписки

${EMOJIS.info} Нажмите кнопку ниже, чтобы открыть интерактивный интерфейс с:
• Красивыми карточками гонок
• Детальной информацией о пилотах и командах
• Интерактивными зачётами
• Поиском и фильтрацией
• Темной и светлой темой
• Адаптивным дизайном
  `;
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [[
        {
          text: `${EMOJIS.car} Открыть веб-интерфейс`,
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Команда для открытия веб-интерфейса
bot.onText(/\/webapp/, async (msg) => {
  const chatId = msg.chat.id;
  const webAppUrl = process.env.WEBAPP_URL || `https://${process.env.RAILWAY_STATIC_URL || 'localhost:3000'}`;
  
  const webAppMessage = `
${EMOJIS.rocket} Открыть современный веб-интерфейс F1 Bot!

${EMOJIS.info} Нажмите кнопку ниже, чтобы открыть интерактивный интерфейс с:
• Красивыми карточками гонок
• Детальной информацией о пилотах и командах
• Интерактивными зачётами
• Поиском и фильтрацией
• Темной и светлой темой
• Адаптивным дизайном
  `;
  
  await bot.sendMessage(chatId, webAppMessage, {
    reply_markup: {
      inline_keyboard: [[
        {
          text: `${EMOJIS.car} Открыть веб-интерфейс`,
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Подписка на уведомления
bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!userPreferences.has(userId)) {
    userPreferences.set(userId, { subscribed: false, favoriteDriver: null });
  }
  
  const user = userPreferences.get(userId);
  user.subscribed = !user.subscribed;
  
  const message = user.subscribed 
    ? `${EMOJIS.check} Подписка активирована! Буду напоминать о гонках! ${EMOJIS.heart}`
    : `${EMOJIS.warning} Подписка отключена.`;
    
  await bot.sendMessage(chatId, message);
});

// Проверка статуса подписки
bot.onText(/\/subscription/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!userPreferences.has(userId)) {
    userPreferences.set(userId, { subscribed: false, favoriteDriver: null });
  }
  
  const user = userPreferences.get(userId);
  
  let statusMessage = `${EMOJIS.info} СТАТУС ПОДПИСКИ ${EMOJIS.info}\n\n`;
  statusMessage += `Подписка: ${user.subscribed ? `${EMOJIS.check} Активна` : `${EMOJIS.warning} Неактивна`}\n`;
  statusMessage += `Любимый пилот: ${user.favoriteDriver || 'Не выбран'}\n\n`;
  statusMessage += `Используйте /subscribe для включения/отключения подписки`;
  
  await bot.sendMessage(chatId, statusMessage);
});

// Обработка текстовых сообщений - перенаправление на веб-интерфейс
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const webAppUrl = process.env.WEBAPP_URL || `https://${process.env.RAILWAY_STATIC_URL || 'localhost:3000'}`;
    
    const message = `
${EMOJIS.info} Для получения информации используйте веб-интерфейс!

${EMOJIS.rocket} Нажмите кнопку ниже, чтобы открыть интерактивный интерфейс с:
• Информацией о гонках
• Данными о пилотах и командах
• Зачётами и результатами
• Поиском и фильтрацией
  `;
    
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: `${EMOJIS.car} Открыть веб-интерфейс`,
            web_app: { url: webAppUrl }
          }
        ]]
      }
    });
  }
});

// Настройка автоматических уведомлений (ежедневно в 9:00)
cron.schedule('0 9 * * *', async () => {
  // Проверяем, есть ли гонка сегодня
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${F1_API}/current`);
    const races = response.data.races;
    
    const todayRace = races.find(race => race.schedule?.race?.date === today);
    
    if (todayRace) {
      // Уведомляем всех подписчиков
      for (const [userId, user] of userPreferences) {
        if (user.subscribed) {
          const message = `
${EMOJIS.flag} СЕГОДНЯ ГОНКА! ${EMOJIS.flag}

${EMOJIS.calendar} ${todayRace.raceName}
${EMOJIS.car} ${todayRace.circuit?.circuitName}
${EMOJIS.clock} Время старта: ${todayRace.schedule?.race?.time ? formatRaceTime(todayRace.schedule.race.time) : 'Не указано'}

${EMOJIS.heart} Готов к гонке? ${EMOJIS.heart}
          `;
          
          try {
            await bot.sendMessage(userId, message);
          } catch (error) {
            console.error(`Error sending notification to ${userId}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка проверки гонок на сегодня:', error);
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
  
  // Обработка ошибки 409 Conflict (несколько экземпляров бота)
  if (error.code === 'ETELEGRAM' && error.response?.body?.error_code === 409) {
    console.error('🚨 ОШИБКА 409: Обнаружено несколько экземпляров бота!');
    console.error('💡 Решение: Остановите все другие экземпляры бота и перезапустите.');
    console.error('💡 Проверьте:');
    console.error('   - Нет ли других процессов node index.js');
    console.error('   - Нет ли других деплоев на Railway/Render');
    console.error('   - Очистите webhook если используете');
    
    // Попытка перезапуска через 30 секунд
    setTimeout(() => {
      console.log('🔄 Попытка перезапуска через 30 секунд...');
      process.exit(1);
    }, 30000);
  }
  
  // Обработка таймаутов
  if (error.code === 'ESOCKETTIMEDOUT' || error.message.includes('ECONNABORTED')) {
    console.error('⏰ Таймаут соединения, перезапуск...');
    setTimeout(() => {
      console.log('🔄 Перезапуск бота...');
      process.exit(1);
    }, 10000);
  }
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

// Запуск Express сервера
app.listen(PORT, () => {
  console.log(`🌐 Веб-сервер запущен на порту ${PORT}`);
  console.log(`📱 Веб-интерфейс доступен по адресу: http://localhost:${PORT}`);
});

console.log('F1 Bot запущен! 🏁'); 