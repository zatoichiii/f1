#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка готовности к деплою в Railway...\n');

// Проверка обязательных файлов
const requiredFiles = [
  'package.json',
  'index.js',
  'public/index.html',
  'public/css/style.css',
  'public/js/app.js',
  'public/js/api.js',
  'public/js/ui.js',
  'railway.json',
  'Procfile'
];

console.log('📁 Проверка файлов:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Проверка package.json
console.log('\n📦 Проверка package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Проверка обязательных полей
  const requiredFields = ['name', 'version', 'main', 'scripts', 'dependencies'];
  requiredFields.forEach(field => {
    if (packageJson[field]) {
      console.log(`✅ ${field}: ${typeof packageJson[field] === 'object' ? 'OK' : packageJson[field]}`);
    } else {
      console.log(`❌ ${field}: отсутствует`);
      allFilesExist = false;
    }
  });
  
  // Проверка зависимостей
  const requiredDeps = ['express', 'cors', 'node-telegram-bot-api', 'axios'];
  console.log('\n📚 Проверка зависимостей:');
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: отсутствует`);
      allFilesExist = false;
    }
  });
  
} catch (error) {
  console.log('❌ Ошибка чтения package.json:', error.message);
  allFilesExist = false;
}

// Проверка переменных окружения
console.log('\n🔧 Проверка переменных окружения:');
const envExample = fs.existsSync('env.example');
console.log(`${envExample ? '✅' : '❌'} env.example`);

// Проверка структуры public
console.log('\n📱 Проверка веб-интерфейса:');
const publicDir = fs.existsSync('public');
const publicIndex = fs.existsSync('public/index.html');
const publicCss = fs.existsSync('public/css/style.css');
const publicJs = fs.existsSync('public/js/app.js');

console.log(`${publicDir ? '✅' : '❌'} public/ директория`);
console.log(`${publicIndex ? '✅' : '❌'} public/index.html`);
console.log(`${publicCss ? '✅' : '❌'} public/css/style.css`);
console.log(`${publicJs ? '✅' : '❌'} public/js/app.js`);

if (!publicDir || !publicIndex || !publicCss || !publicJs) {
  allFilesExist = false;
}

// Итоговая проверка
console.log('\n🎯 Итоговая проверка:');
if (allFilesExist) {
  console.log('✅ Проект готов к деплою в Railway!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Загрузите код в GitHub репозиторий');
  console.log('2. Создайте проект в Railway');
  console.log('3. Настройте переменные окружения');
  console.log('4. Дождитесь успешного деплоя');
  console.log('\n🚀 Удачи с деплоем!');
} else {
  console.log('❌ Проект не готов к деплою. Исправьте ошибки выше.');
  process.exit(1);
} 