require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const axios = require('axios');
const healthServer = require('./health');
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

// Основные команды
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
${EMOJIS.car} Добро пожаловать в F1 Bot! ${EMOJIS.car}

Я твой персональный помощник по Формуле-1! 

${EMOJIS.flag} Доступные команды:
• /nextrace - Ближайшая гонка
• /lastrace - Результаты последней гонки
• /standings - Позиции пилотов
• /constructors - Конструкторский зачёт
• /drivers - Список всех пилотов
• /driver [имя] - Информация о пилоте
• /teams - Информация о командах
• /team [название] - Информация о команде
• /calendar - Календарь сезона
• /subscribe - Подписаться на уведомления
• /subscription - Проверить статус подписки
• /favorite [имя] - Установить любимого пилота

${EMOJIS.heart} Кто твой любимый пилот? Напиши мне его имя!
  `;
  
  await bot.sendMessage(chatId, welcomeMessage);
});

// Ближайшая гонка
bot.onText(/\/nextrace/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const nextRace = await getNextRace();
    
    if (!nextRace) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Нет данных о ближайшей гонке. Возможно, сезон завершён или данные временно недоступны.`);
      return;
    }
    
    const raceMessage = `
${EMOJIS.flag} БЛИЖАЙШАЯ ГОНКА ${EMOJIS.flag}

${EMOJIS.calendar} Гран-при: ${nextRace.raceName || 'Не указано'}
${EMOJIS.car} Трасса: ${nextRace.circuit?.circuitName || 'Не указано'}
${EMOJIS.calendar} Дата: ${nextRace.schedule?.race?.date ? formatDate(nextRace.schedule.race.date) : 'Не указано'}
${EMOJIS.clock} Время: ${nextRace.schedule?.race?.time ? formatRaceTime(nextRace.schedule.race.time) : 'Не указано'}

${EMOJIS.rocket} Готов к гонке? ${EMOJIS.rocket}
    `;
    
    await bot.sendMessage(chatId, raceMessage);
  } catch (error) {
    console.error('Error fetching race data:', error.message);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении данных о гонке.`);
  }
});

// Позиции пилотов
bot.onText(/\/standings/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const standings = await getCurrentDriverStandings();
    
    if (!standings || !standings.standings) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Нет данных о таблице пилотов.`);
      return;
    }
    
    let standingsMessage = `${EMOJIS.trophy} ТАБЛИЦА ПИЛОТОВ ${EMOJIS.trophy}\n\n`;
    
    standings.standings.slice(0, 10).forEach((driver, index) => {
      const position = index + 1;
      const emoji = position === 1 ? EMOJIS.crown : position <= 3 ? EMOJIS.trophy : EMOJIS.car;
      
      standingsMessage += `${emoji} ${position}. ${driver.driver.name} ${driver.driver.surname}\n`;
      standingsMessage += `   ${driver.team.name} - ${driver.points} очков\n\n`;
    });
    
    await bot.sendMessage(chatId, standingsMessage);
  } catch (error) {
    console.error('Error fetching driver standings:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении таблицы пилотов.`);
  }
});

// Конструкторский зачёт
bot.onText(/\/constructors/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const standings = await getCurrentConstructorStandings();
    
    if (!standings || !standings.standings) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Нет данных о конструкторском зачёте.`);
      return;
    }
    
    let standingsMessage = `${EMOJIS.trophy} КОНСТРУКТОРСКИЙ ЗАЧЁТ ${EMOJIS.trophy}\n\n`;
    
    standings.standings.slice(0, 10).forEach((team, index) => {
      const position = index + 1;
      const emoji = position === 1 ? EMOJIS.crown : position <= 3 ? EMOJIS.trophy : EMOJIS.car;
      
      standingsMessage += `${emoji} ${position}. ${team.team.name}\n`;
      standingsMessage += `   ${team.points} очков\n\n`;
    });
    
    await bot.sendMessage(chatId, standingsMessage);
  } catch (error) {
    console.error('Error fetching constructor standings:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении конструкторского зачёта.`);
  }
});

// Информация о пилотах
bot.onText(/\/drivers/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const drivers = await getAllDrivers();
    
    if (!drivers || drivers.length === 0) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Не удалось получить информацию о пилотах.`);
      return;
    }
    
    let driversMessage = `${EMOJIS.car} ПИЛОТЫ F1 ${EMOJIS.car}\n\n`;
    
    drivers.slice(0, 20).forEach((driver, index) => {
      driversMessage += `${index + 1}. ${driver.name || 'Не указано'} ${driver.surname || ''}\n`;
      driversMessage += `   Код: ${driver.shortName || 'Не указано'}\n`;
      driversMessage += `   Номер: ${driver.number || 'Не указано'}\n`;
      driversMessage += `   Национальность: ${driver.nationality || 'Не указано'}\n\n`;
    });
    
    if (drivers.length > 20) {
      driversMessage += `${EMOJIS.info} Показано ${20} из ${drivers.length} пилотов\n`;
      driversMessage += `Используйте /driver [имя] для поиска конкретного пилота`;
    }
    
    await bot.sendMessage(chatId, driversMessage);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении информации о пилотах.`);
  }
});

// Информация о командах
bot.onText(/\/teams/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const teams = await getAllTeams();
    
    if (!teams || teams.length === 0) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Не удалось получить информацию о командах.`);
      return;
    }
    
    let teamsMessage = `${EMOJIS.car} КОМАНДЫ F1 ${EMOJIS.car}\n\n`;
    
    teams.slice(0, 20).forEach((team, index) => {
      teamsMessage += `${index + 1}. ${team.teamName || team.name || 'Не указано'}\n`;
      teamsMessage += `   Национальность: ${team.country || team.nationality || 'Не указано'}\n`;
      if (team.base) teamsMessage += `   База: ${team.base}\n`;
      if (team.teamChief) teamsMessage += `   Руководитель: ${team.teamChief}\n`;
      teamsMessage += `\n`;
    });
    
    if (teams.length > 20) {
      teamsMessage += `${EMOJIS.info} Показано ${20} из ${teams.length} команд\n`;
      teamsMessage += `Используйте /team [название] для поиска конкретной команды`;
    }
    
    await bot.sendMessage(chatId, teamsMessage);
  } catch (error) {
    console.error('Error fetching teams:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении информации о командах.`);
  }
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



// Установка любимого пилота
bot.onText(/\/favorite (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const driverName = match[1];
  
  if (!userPreferences.has(userId)) {
    userPreferences.set(userId, { subscribed: false, favoriteDriver: null });
  }
  
  const user = userPreferences.get(userId);
  user.favoriteDriver = driverName;
  
  const message = `${EMOJIS.heart} ${driverName} теперь твой любимый пилот! ${EMOJIS.heart}\n\nБуду следить за его результатами! ${EMOJIS.fire}`;
  
  await bot.sendMessage(chatId, message);
});

// Результаты последней гонки
bot.onText(/\/lastrace/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const lastRace = await getLastRace();
    const lastRaceResults = await getLastRaceResults();
    
    if (!lastRace) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Нет данных о последней гонке.`);
      return;
    }
    
    let resultsMessage = `${EMOJIS.flag} РЕЗУЛЬТАТЫ ПОСЛЕДНЕЙ ГОНКИ ${EMOJIS.flag}\n\n`;
    resultsMessage += `${EMOJIS.calendar} ${lastRace.raceName || 'Не указано'}\n`;
    resultsMessage += `${EMOJIS.car} ${lastRace.circuit?.circuitName || 'Не указано'}\n`;
    resultsMessage += `${EMOJIS.calendar} ${lastRace.schedule?.race?.date ? formatDate(lastRace.schedule.race.date) : 'Не указано'}\n\n`;
    
    // Проверяем, есть ли победитель в данных гонки
    if (lastRace.winner) {
      resultsMessage += `${EMOJIS.trophy} ПОБЕДИТЕЛЬ:\n\n`;
      resultsMessage += `${EMOJIS.crown} 🥇 ${lastRace.winner.name} ${lastRace.winner.surname}\n`;
      resultsMessage += `   ${lastRace.teamWinner?.teamName || 'Не указано'} - 25 очков\n\n`;
      
      if (lastRace.fast_lap && lastRace.fast_lap.fast_lap) {
        resultsMessage += `${EMOJIS.lightning} БЫСТРЫЙ КРУГ: ${lastRace.fast_lap.fast_lap}\n`;
      }
    } else if (lastRaceResults && lastRaceResults.results) {
      resultsMessage += `${EMOJIS.trophy} ТОП-10:\n\n`;
      
      lastRaceResults.results.slice(0, 10).forEach((result, index) => {
        const position = index + 1;
        const emoji = getPositionEmoji(position);
        
        resultsMessage += `${emoji} ${position}. ${result.driver.name} ${result.driver.surname}\n`;
        resultsMessage += `   ${result.team.name} - ${result.points || 0} очков\n\n`;
      });
    } else {
      resultsMessage += `${EMOJIS.warning} Результаты гонки пока недоступны.\n`;
    }
    
    await bot.sendMessage(chatId, resultsMessage);
  } catch (error) {
    console.error('Error fetching last race results:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении результатов гонки.`);
  }
});

// Календарь сезона
bot.onText(/\/calendar/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const calendar = await getSeasonCalendar();
    
    if (!calendar || !calendar.races) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Нет данных о календаре сезона.`);
      return;
    }
    
    const now = new Date();
    const upcomingRaces = calendar.races.filter(race => new Date(race.schedule?.race?.date) > now);
    const completedRaces = calendar.races.filter(race => new Date(race.schedule?.race?.date) <= now);
    
    let calendarMessage = `${EMOJIS.calendar} КАЛЕНДАРЬ СЕЗОНА ${EMOJIS.calendar}\n\n`;
    calendarMessage += `${EMOJIS.check} Завершено гонок: ${completedRaces.length}\n`;
    calendarMessage += `${EMOJIS.clock} Осталось гонок: ${upcomingRaces.length}\n`;
    calendarMessage += `${EMOJIS.trophy} Всего в сезоне: ${calendar.races.length}\n\n`;
    
    if (upcomingRaces.length > 0) {
      calendarMessage += `${EMOJIS.flag} СЛЕДУЮЩИЕ ГОНКИ:\n\n`;
      upcomingRaces.slice(0, 5).forEach((race, index) => {
        calendarMessage += `${index + 1}. ${race.raceName}\n`;
        calendarMessage += `   ${race.circuit?.circuitName}\n`;
        calendarMessage += `   ${formatDate(race.schedule?.race?.date)}\n\n`;
      });
    }
    
    await bot.sendMessage(chatId, calendarMessage);
  } catch (error) {
    console.error('Error fetching season calendar:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении календаря сезона.`);
  }
});

// Информация о пилоте
bot.onText(/\/driver (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const driverName = match[1];
  
  try {
    const driverInfo = await getDriverInfo(driverName);
    
    if (!driverInfo) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Пилот не найден. Попробуйте другое имя.`);
      return;
    }
    
    let driverMessage = `${EMOJIS.car} ИНФОРМАЦИЯ О ПИЛОТЕ ${EMOJIS.car}\n\n`;
    driverMessage += `${EMOJIS.star} ${driverInfo.driver.name} ${driverInfo.driver.surname}\n`;
    driverMessage += `${EMOJIS.car} Код: ${driverInfo.driver.shortName}\n`;
    driverMessage += `${EMOJIS.car} Номер: ${driverInfo.driver.number}\n`;
    driverMessage += `${EMOJIS.flag} Национальность: ${driverInfo.driver.nationality}\n`;
    driverMessage += `${EMOJIS.calendar} Дата рождения: ${driverInfo.driver.birthday}\n`;
    
    if (driverInfo.driver.url) {
      driverMessage += `${EMOJIS.info} Википедия: ${driverInfo.driver.url}\n`;
    }
    
    // Добавляем случайный факт
    const fact = getRandomDriverFact(driverName);
    driverMessage += `\n${EMOJIS.heart} ${fact}`;
    
    await bot.sendMessage(chatId, driverMessage);
  } catch (error) {
    console.error('Error fetching driver info:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении информации о пилоте.`);
  }
});

// Информация о команде
bot.onText(/\/team (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const teamName = match[1];
  
  try {
    // Сначала получаем все команды для поиска
    const teams = await getAllTeams();
    const team = teams.find(t => 
      t.name.toLowerCase().includes(teamName.toLowerCase()) ||
      t.nationality.toLowerCase().includes(teamName.toLowerCase())
    );
    
    if (!team) {
      await bot.sendMessage(chatId, `${EMOJIS.warning} Команда не найдена. Попробуйте другое название.`);
      return;
    }
    
    // Получаем детальную информацию о команде
    const teamInfo = await getTeamInfo(team.id);
    const teamDrivers = await getTeamDrivers(team.id);
    
    let teamMessage = `${EMOJIS.car} ИНФОРМАЦИЯ О КОМАНДЕ ${EMOJIS.car}\n\n`;
    teamMessage += `${EMOJIS.star} ${team.name}\n`;
    teamMessage += `${EMOJIS.flag} Национальность: ${team.nationality}\n`;
    
    if (team.base) teamMessage += `${EMOJIS.car} База: ${team.base}\n`;
    if (team.teamChief) teamMessage += `${EMOJIS.star} Руководитель: ${team.teamChief}\n`;
    
    if (teamDrivers && teamDrivers.drivers) {
      teamMessage += `\n${EMOJIS.car} ПИЛОТЫ КОМАНДЫ:\n`;
      teamDrivers.drivers.forEach(driver => {
        teamMessage += `• ${driver.name} ${driver.surname} (${driver.shortName})\n`;
      });
    }
    
    await bot.sendMessage(chatId, teamMessage);
  } catch (error) {
    console.error('Error fetching team info:', error);
    await bot.sendMessage(chatId, `${EMOJIS.warning} Ошибка при получении информации о команде.`);
  }
});

// Весёлые команды
bot.onText(/\/verstappen/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('verstappen');
  await bot.sendMessage(chatId, fact);
});

bot.onText(/\/hamilton/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('hamilton');
  await bot.sendMessage(chatId, fact);
});

// Добавляем команды для других популярных пилотов
bot.onText(/\/leclerc/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('leclerc');
  await bot.sendMessage(chatId, fact);
});

bot.onText(/\/norris/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('norris');
  await bot.sendMessage(chatId, fact);
});

bot.onText(/\/russell/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('russell');
  await bot.sendMessage(chatId, fact);
});

bot.onText(/\/sainz/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('sainz');
  await bot.sendMessage(chatId, fact);
});

bot.onText(/\/perez/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('perez');
  await bot.sendMessage(chatId, fact);
});

bot.onText(/\/alonso/, async (msg) => {
  const chatId = msg.chat.id;
  const fact = getRandomDriverFact('alonso');
  await bot.sendMessage(chatId, fact);
});

// Обработка текстовых сообщений для поиска пилотов
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const driverName = msg.text.toLowerCase();
    
    // Проверяем, не является ли это установкой любимого пилота
    if (!userPreferences.has(userId)) {
      userPreferences.set(userId, { subscribed: false, favoriteDriver: null });
    }
    
    const user = userPreferences.get(userId);
    user.favoriteDriver = msg.text;
    
    const message = `${EMOJIS.heart} Отлично! ${msg.text} теперь твой любимый пилот! ${EMOJIS.heart}\n\nИспользуй /favorite [имя] чтобы изменить любимого пилота.`;
    
    await bot.sendMessage(chatId, message);
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
    console.error('Error 409: Multiple bot instances detected');
  }
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

console.log('F1 Bot запущен! 🏁'); 