@echo off
chcp 65001 >nul
echo ======================================
echo   三角洲行动调试助手 v2.0 安装包
echo ======================================
echo.
echo 正在安装...
echo.

:: 创建启动脚本
copy /Y start.bat "%CD%\启动三角洲助手.bat"

:: 创建桌面快捷方式（需要管理员权限，可选）
echo.
echo 安装完成！
echo.
echo 使用方法：
echo   1. 双击 "启动三角洲助手.bat"
echo   2. 浏览器会自动打开 http://localhost:3000
echo.
echo 按任意键退出...
pause >nul
