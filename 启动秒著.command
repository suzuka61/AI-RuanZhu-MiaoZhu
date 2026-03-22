#!/bin/bash
cd "$(dirname "$0")"
echo ""
echo "  🚀 秒著 - 正在启动..."
echo "  ─────────────────────"
echo ""

# 检查 node
if ! command -v node &> /dev/null; then
  echo "  ❌ 未检测到 Node.js，请先安装："
  echo "     https://nodejs.org/"
  echo ""
  echo "  按任意键退出..."
  read -n 1
  exit 1
fi

# 自动安装依赖
if [ ! -d "node_modules" ]; then
  echo "  📦 首次运行，正在安装依赖..."
  npm install
  echo ""
fi

# 启动服务
node proxy.js
