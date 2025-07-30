@echo off
echo 🚀 Настройка GitHub репозитория для F1 Bot
echo.

echo 📋 ШАГ 1: Создайте репозиторий на GitHub
echo.
echo 1. Перейдите на https://github.com
echo 2. Нажмите "New repository"
echo 3. Назовите его "f1-bot" (или как хотите)
echo 4. НЕ добавляйте README, .gitignore или license
echo 5. Нажмите "Create repository"
echo.

echo 📋 ШАГ 2: Скопируйте URL репозитория
echo URL будет выглядеть так: https://github.com/YOUR_USERNAME/f1-bot.git
echo.

set /p REPO_URL="Введите URL вашего репозитория: "

echo.
echo 🔗 Настраиваем remote...
git remote add origin %REPO_URL%

echo.
echo 📤 Переименовываем ветку в main...
git branch -M main

echo.
echo 📤 Загружаем код на GitHub...
git push -u origin main

echo.
echo ✅ Готово! Код загружен на GitHub
echo.
echo 🚀 Теперь можете развертывать на Railway:
echo 1. Перейдите на https://railway.app
echo 2. Войдите через GitHub
echo 3. Создайте новый проект
echo 4. Выберите ваш репозиторий
echo 5. Добавьте переменные окружения
echo.

pause 