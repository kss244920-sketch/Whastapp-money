@echo off
title WHbot - WhatsApp Group Manager
cd /d "%~dp0"

echo =============================================
echo   WHbot - WhatsApp Group Manager Bot
echo =============================================
echo.

REM Skip puppeteer Chrome download — we use the system Chrome/Edge instead
set PUPPETEER_SKIP_DOWNLOAD=true

REM Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and set your BOT_TOKEN:
    echo   copy .env.example .env
    echo Then open .env in Notepad and set BOT_TOKEN=
    echo.
    pause
    exit /b 1
)

REM If node_modules exists but is broken, remove and reinstall
if exist "node_modules\.broken" (
    echo [SETUP] Removing broken node_modules...
    rmdir /s /q node_modules
)

REM Install Node deps if missing
if not exist "node_modules\whatsapp-web.js" (
    echo [SETUP] Installing Node.js dependencies...
    echo [INFO]  Using your installed Chrome/Edge - no Chromium download needed.
    npm install --ignore-scripts
    if errorlevel 1 (
        echo [ERROR] npm install failed. Make sure Node.js 18+ is installed.
        echo Download from: https://nodejs.org
        pause
        exit /b 1
    )
    REM Run only the patch script, not postinstall (which might try to download)
    node scripts\patch-whatsapp-web.js
)

REM Check if Python deps are installed
python -c "import telegram" 2>nul
if errorlevel 1 (
    echo [SETUP] Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] pip install failed. Make sure Python 3.9+ is installed.
        echo Download from: https://python.org
        pause
        exit /b 1
    )
)

REM Load .env variables (skip comment lines starting with #)
for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%b"=="" set "%%a=%%b"
)

echo.
echo [OK] All dependencies ready. Starting WHbot...
echo [OK] Open Telegram and message your bot to begin.
echo      Press Ctrl+C to stop the bot.
echo.
python WHbot.py
pause
