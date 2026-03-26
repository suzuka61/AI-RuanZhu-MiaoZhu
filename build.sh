#!/bin/bash

echo "======================================"
echo "    秒著 - 一键打包工具"
echo "======================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo ""
fi

echo "请选择打包平台："
echo "1) macOS"
echo "2) Windows"
echo "3) Linux"
echo "4) 全平台"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 正在打包 macOS 版本..."
        npm run build:mac
        ;;
    2)
        echo ""
        echo "🚀 正在打包 Windows 版本..."
        npm run build:win
        ;;
    3)
        echo ""
        echo "🚀 正在打包 Linux 版本..."
        npm run build:linux
        ;;
    4)
        echo ""
        echo "🚀 正在打包全平台版本..."
        npm run build
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ 打包完成！"
    echo "======================================"
    echo ""
    echo "📁 打包文件位于: dist/ 目录"
    echo ""
    echo "📋 文件列表:"
    ls -lh dist/ 2>/dev/null || echo "  (暂无文件)"
    echo ""
    echo "🎉 现在可以将应用分发给用户了！"
    echo ""
else
    echo ""
    echo "❌ 打包失败，请检查错误信息"
    exit 1
fi
