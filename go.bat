@echo off
cd /d "%~dp0"

echo Step 1: Setting mirror...
npm config set registry https://registry.npmmirror.com
echo Done.
echo.

echo Step 2: Installing (wait 1-2 min)...
npm install
if errorlevel 1 (
    echo Install failed!
    pause
    exit /b 1
)
echo Done.
echo.

echo Step 3: Starting...
start http://localhost:3001
npm run dev

pause
