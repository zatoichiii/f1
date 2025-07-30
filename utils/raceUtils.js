const axios = require('axios');

const F1_API = process.env.F1_API_URL || 'https://f1api.dev/api';

// Получение всех пилотов
async function getAllDrivers() {
  try {
    const response = await axios.get(`${F1_API}/current/drivers`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.drivers && Array.isArray(response.data.drivers)) {
      return response.data.drivers;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

// Получение информации о пилоте
async function getDriverInfo(driverName) {
  try {
    const response = await axios.get(`${F1_API}/current/drivers`);
    
    // Проверяем структуру ответа от нового API
    const drivers = response.data.drivers || response.data || [];
    
    const driver = drivers.find(d => 
      (d.name && d.name.toLowerCase().includes(driverName.toLowerCase())) ||
      (d.surname && d.surname.toLowerCase().includes(driverName.toLowerCase())) ||
      (d.shortName && d.shortName.toLowerCase().includes(driverName.toLowerCase())) ||
      (d.driverId && d.driverId.toLowerCase().includes(driverName.toLowerCase()))
    );
    
    if (!driver) {
      return null;
    }
    
    return {
      driver: driver,
      currentStats: null // Пока нет статистики в новом API
    };
  } catch (error) {
    console.error('Error fetching driver info:', error);
    return null;
  }
}

// Получение информации о команде (пока заглушка)
async function getTeamInfo(teamName) {
  try {
    // Пока используем заглушку, так как API команд может быть недоступен
    return {
      team: {
        name: teamName,
        nationality: 'Unknown'
      },
      currentStats: null
    };
  } catch (error) {
    console.error('Error fetching team info:', error);
    return null;
  }
}

// Получение результатов последней гонки
async function getLastRaceResults() {
  try {
    const response = await axios.get(`${F1_API}/current/last`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.race && Array.isArray(response.data.race) && response.data.race.length > 0) {
      const lastRace = response.data.race[0];
      
      // Если есть победитель, создаем результаты
      if (lastRace.winner) {
        return {
          results: [
            {
              position: 1,
              driver: lastRace.winner,
              team: lastRace.teamWinner,
              points: 25
            }
          ]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching last race results:', error);
    return null;
  }
}

// Получение календаря сезона
async function getSeasonCalendar() {
  try {
    const response = await axios.get(`${F1_API}/current`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.race && Array.isArray(response.data.race)) {
      return {
        races: response.data.race
      };
    } else if (response.data && response.data.races && Array.isArray(response.data.races)) {
      return {
        races: response.data.races
      };
    }
    
    return { races: [] };
  } catch (error) {
    console.error('Error fetching season calendar:', error);
    return null;
  }
}

// Получение зачёта пилотов
async function getCurrentDriverStandings() {
  try {
    const response = await axios.get(`${F1_API}/current/drivers-championship`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.drivers_championship) {
      // Обрабатываем данные, чтобы правильно отображать названия команд
      const standings = response.data.drivers_championship.map(item => ({
        ...item,
        team: {
          ...item.team,
          name: item.team.teamName || item.team.name || 'Unknown Team',
          nationality: item.team.country || item.team.nationality || 'Unknown'
        }
      }));
      
      return {
        standings: standings
      };
    } else if (response.data && response.data.standings) {
      return {
        standings: response.data.standings
      };
    } else if (response.data && Array.isArray(response.data)) {
      return {
        standings: response.data
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching driver standings:', error);
    return null;
  }
}

// Получение зачёта конструкторов
async function getCurrentConstructorStandings() {
  try {
    const response = await axios.get(`${F1_API}/current/constructors-championship`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.constructors_championship) {
      // Обрабатываем данные, чтобы правильно отображать названия команд
      const standings = response.data.constructors_championship.map(item => ({
        ...item,
        team: {
          ...item.team,
          name: item.team.teamName || item.team.name || 'Unknown Team',
          nationality: item.team.country || item.team.nationality || 'Unknown'
        }
      }));
      
      return {
        standings: standings
      };
    } else if (response.data && response.data.standings) {
      return {
        standings: response.data.standings
      };
    } else if (response.data && Array.isArray(response.data)) {
      return {
        standings: response.data
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching constructor standings:', error);
    return null;
  }
}

// Получение всех команд
async function getAllTeams() {
  try {
    const response = await axios.get(`${F1_API}/current/teams`);
    
    // Проверяем структуру ответа от нового API
    let teams = [];
    if (response.data && response.data.teams && Array.isArray(response.data.teams)) {
      teams = response.data.teams;
    } else if (response.data && Array.isArray(response.data)) {
      teams = response.data;
    }
    
    // Обрабатываем данные, чтобы правильно отображать названия команд
    return teams.map(team => ({
      ...team,
      name: team.teamName || team.name || 'Unknown Team',
      nationality: team.country || team.nationality || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

// Получение информации о команде
async function getTeamInfo(teamId) {
  try {
    const response = await axios.get(`${F1_API}/current/teams/${teamId}`);
    
    // Проверяем структуру ответа от нового API
    let team = null;
    if (response.data && response.data.team) {
      team = response.data.team;
    } else if (response.data) {
      team = response.data;
    }
    
    if (team) {
      // Обрабатываем данные, чтобы правильно отображать названия команд
      return {
        ...team,
        name: team.teamName || team.name || 'Unknown Team',
        nationality: team.country || team.nationality || 'Unknown'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching team info:', error);
    return null;
  }
}

// Получение пилотов команды
async function getTeamDrivers(teamId) {
  try {
    const response = await axios.get(`${F1_API}/current/teams/${teamId}/drivers`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.drivers) {
      return response.data;
    } else if (response.data) {
      return { drivers: response.data };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching team drivers:', error);
    return null;
  }
}

// Получение информации о трассах
async function getAllCircuits() {
  try {
    const response = await axios.get(`${F1_API}/circuits`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.circuits && Array.isArray(response.data.circuits)) {
      return response.data.circuits;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching circuits:', error);
    return null;
  }
}

// Получение ближайшей гонки
async function getNextRace() {
  try {
    const response = await axios.get(`${F1_API}/current/next`, {
      timeout: 10000, // 10 секунд таймаут
      headers: {
        'User-Agent': 'F1Bot/1.0'
      }
    });
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.race && Array.isArray(response.data.race) && response.data.race.length > 0) {
      return response.data.race[0];
    } else if (response.data && response.data.races && Array.isArray(response.data.races) && response.data.races.length > 0) {
      return response.data.races[0];
    } else if (response.data && response.data.raceName) {
      return response.data;
    } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching next race:', error.message);
    throw error;
  }
}

// Получение последней гонки
async function getLastRace() {
  try {
    const response = await axios.get(`${F1_API}/current/last`);
    
    // Проверяем структуру ответа от нового API
    if (response.data && response.data.race && Array.isArray(response.data.race) && response.data.race.length > 0) {
      return response.data.race[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching last race:', error);
    return null;
  }
}

// Форматирование времени гонки
function formatRaceTime(timeString) {
  if (!timeString) return 'Время не указано';
  
  try {
    // Обрабатываем разные форматы времени
    let time;
    
    if (timeString.includes('T')) {
      // Формат ISO: "2025-08-03T13:00:00Z"
      time = timeString.split('T')[1];
    } else {
      // Формат API: "13:00:00Z"
      time = timeString;
    }
    
    // Убираем секунды и часовой пояс
    const [hours, minutes] = time.split(':');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('❌ Ошибка форматирования времени:', timeString, error);
    return 'Время не указано';
  }
}

// Форматирование даты
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Получение эмодзи для позиции
function getPositionEmoji(position) {
  switch (position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    case 4: case 5: case 6: case 7: case 8: case 9: case 10: return '🏆';
    default: return '🏎️';
  }
}

module.exports = {
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
}; 