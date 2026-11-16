@echo off
title BarberHub Backend
cd /d "%~dp0backend"
echo [BarberHub] Python FastAPI serveri ishga tushmoqda...
call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
