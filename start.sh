#!/bin/bash

# 里奥Leo降AI神器 - 启动脚本
echo "🚀 启动里奥Leo降AI神器..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到npm，请先安装npm"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件，正在复制模板..."
    cp .env.example .env
    echo "📝 请编辑.env文件并配置您的API密钥和其他设置"
    echo "💡 提示: 使用 nano .env 或您喜欢的编辑器来编辑配置文件"
    read -p "配置完成后按Enter键继续..."
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm run install-all
fi

# 启动项目
echo "🎯 启动开发服务器..."
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:5000"
echo "👑 管理后台: http://localhost:3000/admin/login"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev 