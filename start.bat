@echo off
chcp 65001 >nul
echo 🚀 启动秒著...
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    echo.
)

REM 启动应用
echo ✅ 启动应用...
echo 📱 请在浏览器中访问: http://localhost:3000
echo ⏹️  按 Ctrl+C 停止服务
echo.

node proxy.js
pause
