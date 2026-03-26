#!/bin/bash

echo "🚀 启动秒著..."
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 启动应用
echo "✅ 启动应用..."
echo "📱 请在浏览器中访问: http://localhost:3000"
echo "⏹️  按 Ctrl+C 停止服务"
echo ""

node proxy.js
