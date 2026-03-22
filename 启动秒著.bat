@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   🚀 秒著 - 正在启动...
echo   ─────────────────────
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo   ❌ 未检测到 Node.js，请先安装：
  echo      https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo   📦 首次运行，正在安装依赖...
  npm install
  echo.
)

node proxy.js
pause
