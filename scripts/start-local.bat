@echo off
echo 🚀 启动去中心化眼健康管理平台 - 本地开发模式

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装，请先安装Python
    pause
    exit /b 1
)

echo ✅ 环境检查通过

REM 启动前端服务
echo 📱 启动前端服务...
start "前端服务" cmd /k "cd frontend && npm run dev"

REM 等待前端启动
timeout /t 5 /nobreak >nul

REM 启动后端服务
echo 🔧 启动后端服务...
start "后端服务" cmd /k "cd backend && npm run start:dev"

REM 等待后端启动
timeout /t 5 /nobreak >nul

REM 启动AI服务
echo 🤖 启动AI服务...
start "AI服务" cmd /k "cd ai-service && python main.py"

echo.
echo 🎉 所有服务已启动！
echo.
echo 访问地址：
echo 前端应用: http://localhost:3000
echo 后端API: http://localhost:3001
echo AI服务: http://localhost:8000
echo.
echo 按任意键关闭此窗口...
pause >nul






