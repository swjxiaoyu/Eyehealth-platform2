@echo off
echo 启动去中心化眼健康管理平台...

echo 启动后端 (3001)...
start cmd /k "cd backend && npm run start:dev"

timeout /t 3 >nul

echo 启动前端 (3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo 服务启动完成！
echo 前端: http://localhost:3000
echo 后端: http://localhost:3001
echo.
pause






