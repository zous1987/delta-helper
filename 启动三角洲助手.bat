@echo off
chcp 65001 >nul
title 三角洲调试助手
cls
echo ======================================
echo   三角洲调试助手 v2.0
echo ======================================
echo.
echo 正在启动服务...
echo.
echo 浏览器会自动打开：http://localhost:3001
echo.
echo 按 Ctrl+C 可停止服务
echo ======================================
echo.
start http://localhost:3001
cd /d "%~dp0"
node node_modules\next\dist\bin\next start -H 0.0.0.0 -p 3001
pause
