@echo off
echo ========================================
echo   Delta Helper v2.1
echo ========================================
echo.
echo Starting...
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo OK: Node.js found
node --version
echo.

if not exist "node_modules" (
    echo Installing dependencies (3-5 min)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Install failed!
        echo Check network and run: npm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Done!
    echo.
)

echo Starting server...
echo Browser will open: http://localhost:3001
echo Press Ctrl+C to stop
echo ========================================
echo.

start http://localhost:3001
call npm run dev

pause
