@echo off
chcp 65001 >nul
echo ========================================
echo   三角洲调试助手 v2.1
echo ========================================
echo.
echo 正在启动服务，请稍候...
echo.

cd /d "%~dp0"

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 未检测到 Node.js!
    echo.
    echo 请先安装 Node.js v20+
    echo 下载地址：https://nodejs.org/
    echo 建议安装 LTS 版本
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js 已安装
node --version
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [INFO] 首次运行，正在安装依赖（可能需要 3-5 分钟）...
    echo.
    call npm install --registry=https://registry.npmmirror.com
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] 依赖安装失败!
        echo 请检查网络连接，或手动运行：npm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] 依赖安装完成!
    echo.
)

echo [INFO] 启动服务...
echo.
echo 服务启动后，浏览器会自动打开 http://localhost:3001
echo.
echo 按 Ctrl+C 可停止服务
echo ========================================
echo.

REM 启动浏览器
start http://localhost:3001

REM 启动 Next.js 开发服务器
call npm run dev

pause
