#!/bin/bash

# 本地开发启动脚本
echo "🚀 启动去中心化眼健康管理平台 - 本地开发模式"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装，请先安装Python3"
    exit 1
fi

echo "✅ 环境检查通过"

# 启动前端服务
echo "📱 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待前端启动
sleep 5

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 5

# 启动AI服务
echo "🤖 启动AI服务..."
cd ai-service
python main.py &
AI_PID=$!
cd ..

echo ""
echo "🎉 所有服务已启动！"
echo ""
echo "访问地址："
echo "前端应用: http://localhost:3000"
echo "后端API: http://localhost:3001"
echo "AI服务: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $FRONTEND_PID $BACKEND_PID $AI_PID; exit" INT
wait






