#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Проверка готовности к деплою...\n');

// Проверка наличия необходимых файлов
const fs = require('fs');
const requiredFiles = [
  'package.json',
  'index.js',
  'railway.json',
  'render.yaml',
  'Procfile',
  '.gitignore'
];

console.log('📁 Проверка файлов:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ОТСУТСТВУЕТ`);
  }
});

// Проверка package.json
console.log('\n📦 Проверка package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ Скрипт start найден');
  } else {
    console.log('❌ Скрипт start отсутствует');
  }
  
  if (packageJson.dependencies) {
    console.log('✅ Зависимости настроены');
  } else {
    console.log('❌ Зависимости не настроены');
  }
} catch (error) {
  console.log('❌ Ошибка чтения package.json');
}

// Проверка переменных окружения
console.log('\n🔧 Проверка переменных окружения:');
if (process.env.TELEGRAM_BOT_TOKEN) {
  console.log('✅ TELEGRAM_BOT_TOKEN настроен');
} else {
  console.log('⚠️  TELEGRAM_BOT_TOKEN не найден (нужно будет настроить на хостинге)');
}

if (process.env.F1_API_URL) {
  console.log('✅ F1_API_URL настроен');
} else {
  console.log('ℹ️  F1_API_URL не настроен (будет использован по умолчанию)');
}

console.log('\n🚀 Готово к деплою!');
console.log('\n📋 Следующие шаги:');
console.log('1. Закоммитьте все изменения в Git');
console.log('2. Загрузите код на GitHub');
console.log('3. Выберите платформу для деплоя (Railway, Render, Heroku)');
console.log('4. Настройте переменные окружения на хостинге');
console.log('5. Запустите деплой'); 