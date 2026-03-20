@echo off
chcp 65001 >nul
echo ========================================
echo   Delta Helper - Starting...
echo ========================================
echo.
echo [1/2] Installing dependencies...
echo.
call npm install
echo.
echo [2/2] Starting server...
echo.
echo Server will start at:
echo   Local:   http://localhost:3000
echo   Network: http://YOUR_IP:3000
echo.
echo Get your IP address:
echo   1. Press Win+R
echo   2. Type: cmd
echo   3. Type: ipconfig
echo   4. Find IPv4 Address
echo.
call npm run dev
pause
