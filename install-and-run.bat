@echo off
echo ========================================
echo   Delta Helper - Auto Install
echo ========================================
echo.
echo Setting up China mirror for fast download...
echo.

REM Set npm mirror to China (much faster!)
npm config set registry https://registry.npmmirror.com

echo Mirror configured!
echo.
echo Cleaning old installation...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo Cleaned.
)
if exist "package-lock.json" (
    del package-lock.json
    echo Cleaned.
)
echo.
echo Installing dependencies (should take 1-2 min)...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Installation failed!
    echo Please check network and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Starting service...
echo.

start http://localhost:3001
call npm run dev

pause
