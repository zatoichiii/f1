@echo off
echo 🚀 Загрузка F1 Bot на GitHub...

echo.
echo 📋 Инструкция:
echo 1. Создайте репозиторий на GitHub (НЕ добавляйте README)
echo 2. Скопируйте URL репозитория
echo 3. Введите его ниже
echo.

set /p REPO_URL="Введите URL репозитория (например: https://github.com/username/f1-bot.git): "

echo.
echo 🔗 Добавляем remote...
git remote add origin %REPO_URL%

echo.
echo 📤 Загружаем код...
git branch -M main
git push -u origin main

echo.
echo ✅ Готово! Код загружен на GitHub
echo.
echo 🚀 Теперь развертывайте на Railway:
echo 1. Перейдите на railway.app
echo 2. Войдите через GitHub
echo 3. Создайте новый проект
echo 4. Выберите ваш репозиторий
echo 5. Добавьте переменные окружения
echo.

pause 