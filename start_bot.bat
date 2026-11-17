@echo off
title BarberHub Telegram Boti
cd /d "%~dp0backend"
echo BarberHub Telegram Boti ishga tushirilmoqda...
call venv\Scripts\activate.bat
python run_bot.py
pause
