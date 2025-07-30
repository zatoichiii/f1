require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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
    message: 'F1 Bot Web Interface is running! 🏁',
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints для тестирования
app.get('/api/next-race', (req, res) => {
  res.json({
    raceName: 'Гран-при Великобритании',
    circuit: { circuitName: 'Silverstone Circuit' },
    schedule: {
      race: {
        date: '2024-07-07',
        time: '15:00:00Z'
      }
    }
  });
});

app.get('/api/last-race', (req, res) => {
  res.json({
    raceName: 'Гран-при Австрии',
    circuit: { circuitName: 'Red Bull Ring' },
    winner: {
      name: 'Max',
      surname: 'Verstappen'
    },
    teamWinner: {
      teamName: 'Red Bull Racing'
    }
  });
});

app.get('/api/standings/drivers', (req, res) => {
  res.json({
    standings: [
      {
        driver: { name: 'Max', surname: 'Verstappen' },
        team: { name: 'Red Bull Racing' },
        points: 314
      },
      {
        driver: { name: 'Lando', surname: 'Norris' },
        team: { name: 'McLaren' },
        points: 171
      },
      {
        driver: { name: 'Charles', surname: 'Leclerc' },
        team: { name: 'Ferrari' },
        points: 150
      }
    ]
  });
});

app.get('/api/calendar', (req, res) => {
  res.json({
    races: [
      {
        id: 1,
        raceName: 'Гран-при Великобритании',
        circuit: { circuitName: 'Silverstone Circuit' },
        schedule: { race: { date: '2024-07-07', time: '15:00:00Z' } }
      },
      {
        id: 2,
        raceName: 'Гран-при Венгрии',
        circuit: { circuitName: 'Hungaroring' },
        schedule: { race: { date: '2024-07-21', time: '15:00:00Z' } }
      }
    ]
  });
});

app.get('/api/drivers', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Max',
      surname: 'Verstappen',
      shortName: 'VER',
      number: 1,
      nationality: 'Dutch'
    },
    {
      id: 2,
      name: 'Lando',
      surname: 'Norris',
      shortName: 'NOR',
      number: 4,
      nationality: 'British'
    },
    {
      id: 3,
      name: 'Charles',
      surname: 'Leclerc',
      shortName: 'LEC',
      number: 16,
      nationality: 'Monegasque'
    }
  ]);
});

app.get('/api/teams', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Red Bull Racing',
      nationality: 'Austrian',
      base: 'Milton Keynes, UK',
      teamChief: 'Christian Horner'
    },
    {
      id: 2,
      name: 'McLaren',
      nationality: 'British',
      base: 'Woking, UK',
      teamChief: 'Andrea Stella'
    },
    {
      id: 3,
      name: 'Ferrari',
      nationality: 'Italian',
      base: 'Maranello, Italy',
      teamChief: 'Frédéric Vasseur'
    }
  ]);
});

// Запуск Express сервера
app.listen(PORT, () => {
  console.log(`🌐 Веб-сервер запущен на порту ${PORT}`);
  console.log(`📱 Веб-интерфейс доступен по адресу: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Тестовый сервер готов!');
}); 