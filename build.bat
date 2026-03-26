@echo off
chcp 65001 >nul
echo ======================================
echo    秒著 - 一键打包工具
echo ======================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo.
)

echo 请选择打包平台：
echo 1) macOS
echo 2) Windows
echo 3) Linux
echo 4) 全平台
echo.
set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🚀 正在打包 macOS 版本...
    call npm run build:mac
) else if "%choice%"=="2" (
    echo.
    echo 🚀 正在打包 Windows 版本...
    call npm run build:win
) else if "%choice%"=="3" (
    echo.
    echo 🚀 正在打包 Linux 版本...
    call npm run build:linux
) else if "%choice%"=="4" (
    echo.
    echo 🚀 正在打包全平台版本...
    call npm run build
) else (
    echo ❌ 无效选项
    pause
    exit /b 1
)

if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo ✅ 打包完成！
    echo ======================================
    echo.
    echo 📁 打包文件位于: dist\ 目录
    echo.
    echo 📋 文件列表:
    dir dist /b 2>nul
    echo.
    echo 🎉 现在可以将应用分发给用户了！
    echo.
) else (
    echo.
    echo ❌ 打包失败，请检查错误信息
)

pause
