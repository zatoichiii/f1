// База данных интересных фактов о пилотах
const driverFacts = {
  'verstappen': [
    'Макс Ферстаппен - самый молодой пилот в истории F1!',
    'Ферстаппен выиграл свой первый Гран-при в 18 лет!',
    '"Super Max" - так его называют фанаты!',
    'Макс известен своей агрессивной манерой езды!',
    'Трёхкратный чемпион мира! 👑',
    'Сын бывшего пилота F1 Йоса Ферстаппена!',
    'Начал карьеру в картинге в 4 года!',
    'Первый голландец, ставший чемпионом мира!',
    'Известен своими радиосообщениями!',
    'Любит симуляторы и гонки!'
  ],
  'hamilton': [
    'Льюис Хэмилтон - семикратный чемпион мира!',
    'Льюис начал карьеру в картинге в 8 лет!',
    '"Hammer Time" - его знаменитая фраза!',
    'Льюис активно выступает за экологию!',
    'Рекордсмен по количеству побед в F1!',
    'Первый чернокожий пилот в истории F1!',
    'Увлекается музыкой и модой!',
    'Основал команду X44 в Extreme E!',
    'Известен своими яркими шлемами!',
    'Любит животных и веганство!'
  ],
  'leclerc': [
    'Шарль Леклер - будущее Ferrari!',
    'Леклер начал карьеру в картинге в 4 года!',
    'Победитель GP3 и F2!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит музыку и играет на пианино!',
    'Родился в Монако!',
    'Дебютировал в F1 в 2018 году!',
    'Известен своими квалификационными кругами!',
    'Любит симуляторы и гонки!',
    'Дружит с Пьером Гасли с детства!'
  ],
  'norris': [
    'Ландо Норрис - молодой талант McLaren!',
    'Ландо известен своим юмором в социальных сетях!',
    'Победитель F3 и вице-чемпион F2!',
    'Любит стримить на Twitch!',
    'Известен своими яркими ливреями!',
    'Дебютировал в F1 в 2019 году!',
    'Любит музыку и DJ-инг!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит симуляторы и гонки!',
    'Дружит с Карлосом Сайнсом!'
  ],
  'russell': [
    'Джордж Рассел - будущее Mercedes!',
    'Джордж известен как "Mr. Saturday"!',
    'Победитель GP3 и F2!',
    'Дебютировал в F1 в 2019 году!',
    'Известен своими квалификационными кругами!',
    'Любит симуляторы и гонки!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит музыку и играет на гитаре!',
    'Дружит с Ландо Норрисом!',
    'Известен своими яркими ливреями!'
  ],
  'sainz': [
    'Карлос Сайнс - сын легендарного раллиста!',
    'Карлос известен как "Smooth Operator"!',
    'Победитель F3 и вице-чемпион F2!',
    'Дебютировал в F1 в 2015 году!',
    'Известен своими стабильными результатами!',
    'Любит симуляторы и гонки!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит музыку и играет на гитаре!',
    'Дружит с Ландо Норрисом!',
    'Известен своими яркими ливреями!'
  ],
  'perez': [
    'Серхио Перес - "Мексиканский волшебник"!',
    'Серхио известен своими обгонами!',
    'Победитель GP2!',
    'Дебютировал в F1 в 2011 году!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит симуляторы и гонки!',
    'Известен своими яркими ливреями!',
    'Любит музыку и играет на гитаре!',
    'Дружит с Эстебаном Оконом!',
    'Известен своими стабильными результатами!'
  ],
  'alonso': [
    'Фернандо Алонсо - двукратный чемпион мира!',
    'Фернандо известен как "El Nano"!',
    'Победитель F3000!',
    'Дебютировал в F1 в 2001 году!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит симуляторы и гонки!',
    'Известен своими яркими ливреями!',
    'Любит музыку и играет на гитаре!',
    'Дружит с Себастьяном Феттелем!',
    'Известен своими стабильными результатами!',
    'Самый сексуальный пилот в F1!'
  ],
  'ocon': [
    'Эстебан Окон - будущее Alpine!',
    'Эстебан известен как "Estie Bestie"!',
    'Победитель GP3 и F3!',
    'Дебютировал в F1 в 2016 году!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит симуляторы и гонки!',
    'Известен своими яркими ливреями!',
    'Любит музыку и играет на гитаре!',
    'Дружит с Серхио Пересом!',
    'Известен своими стабильными результатами!'
  ],
  'gasly': [
    'Пьер Гасли - будущее Alpine!',
    'Пьер известен как "Gasly Gasly"!',
    'Победитель GP2!',
    'Дебютировал в F1 в 2017 году!',
    'Известен своими эмоциональными радиосообщениями!',
    'Любит симуляторы и гонки!',
    'Известен своими яркими ливреями!',
    'Любит музыку и играет на гитаре!',
    'Дружит с Шарлем Леклером!',
    'Известен своими стабильными результатами!'
  ]
};

// Функция для получения случайного факта о пилоте
function getRandomDriverFact(driverName) {
  const normalizedName = driverName.toLowerCase();
  
  for (const [key, facts] of Object.entries(driverFacts)) {
    if (normalizedName.includes(key)) {
      return facts[Math.floor(Math.random() * facts.length)];
    }
  }
  
  // Если факт не найден, возвращаем общий факт
  const generalFacts = [
    'Этот пилот - настоящий профессионал! 🏎️',
    'Он знает, как управлять болидом! ⚡',
    'Фанаты его обожают! ❤️',
    'Он всегда показывает лучший результат! 🏆',
    'Этот пилот - будущее F1! 🚀'
  ];
  
  return generalFacts[Math.floor(Math.random() * generalFacts.length)];
}

// Функция для получения всех фактов о пилоте
function getAllDriverFacts(driverName) {
  const normalizedName = driverName.toLowerCase();
  
  for (const [key, facts] of Object.entries(driverFacts)) {
    if (normalizedName.includes(key)) {
      return facts;
    }
  }
  
  return [];
}

module.exports = {
  driverFacts,
  getRandomDriverFact,
  getAllDriverFacts
}; 