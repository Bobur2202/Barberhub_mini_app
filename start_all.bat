@echo off
title BarberHub System Launcher
echo ===================================================
echo     BarberHub SaaS & Marketplace Platformasi
echo ===================================================
echo.
echo [1/2] Backend (FastAPI + Telegram Bot) ishga tushirilmoqda...
start "BarberHub Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Frontend (React Mini-App) ishga tushirilmoqda...
start "BarberHub Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo  Tizim to'liq ishga tushdi!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8000/docs
echo ===================================================
pause
