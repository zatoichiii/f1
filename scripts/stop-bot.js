#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

console.log('🛑 Остановка всех экземпляров F1 Bot...');

const isWindows = os.platform() === 'win32';

if (isWindows) {
  // Для Windows
  exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout) => {
    if (error) {
      console.error('❌ Ошибка при получении списка процессов:', error);
      return;
    }
    
    const lines = stdout.split('\n');
    let nodeProcesses = 0;
    
    lines.forEach(line => {
      if (line.includes('node.exe')) {
        nodeProcesses++;
        console.log(`📋 Найден процесс Node.js: ${line}`);
      }
    });
    
    if (nodeProcesses > 0) {
      console.log(`\n🔍 Найдено ${nodeProcesses} процессов Node.js`);
      console.log('💡 Для остановки всех процессов выполните:');
      console.log('   taskkill /F /IM node.exe');
      console.log('\n💡 Или остановите конкретные процессы по PID');
    } else {
      console.log('✅ Процессы Node.js не найдены');
    }
  });
} else {
  // Для Linux/Mac
  exec('ps aux | grep "node index.js" | grep -v grep', (error, stdout) => {
    if (error) {
      console.error('❌ Ошибка при получении списка процессов:', error);
      return;
    }
    
    const lines = stdout.split('\n').filter(line => line.trim());
    
    if (lines.length > 0) {
      console.log('📋 Найденные процессы F1 Bot:');
      lines.forEach(line => {
        console.log(`   ${line}`);
      });
      
      console.log('\n💡 Для остановки всех процессов выполните:');
      console.log('   pkill -f "node index.js"');
    } else {
      console.log('✅ Процессы F1 Bot не найдены');
    }
  });
}

console.log('\n💡 Дополнительные рекомендации:');
console.log('   1. Проверьте Railway/Render на наличие дублирующихся деплоев');
console.log('   2. Очистите webhook если используете:');
console.log('      curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook');
console.log('   3. Перезапустите бота после остановки всех процессов'); 