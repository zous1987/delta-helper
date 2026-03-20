@echo off
cd /d "%~dp0"

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install from https://nodejs.org/
    pause
    exit /b 1
)

REM Set China mirror
npm config set registry https://registry.npmmirror.com

REM Install if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start
echo Starting server...
start http://localhost:3001
npm run dev

pause
