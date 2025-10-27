@echo off
echo ========================================
echo 去中心化眼健康管理平台 - 一键启动脚本
echo ========================================
echo.

echo 正在检查服务状态...
netstat -an | findstr "3000 3001" >nul
if %errorlevel% == 0 (
    echo 警告: 检测到服务已在运行！
    echo 前端 (3000): 已运行
    echo 后端 (3001): 已运行
    echo.
    echo 是否要重新启动服务？(y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        echo 正在停止现有服务...
        taskkill /f /im node.exe >nul 2>&1
        timeout /t 2 >nul
    ) else (
        echo 保持现有服务运行
        goto :end
    )
)

echo.
echo 正在启动服务...
echo.

echo [1/2] 启动后端服务 (端口 3001)...
start "后端服务" cmd /k "cd /d %~dp0backend && echo 后端服务启动中... && npm run start:dev"

echo 等待后端启动...
timeout /t 5 >nul

echo [2/2] 启动前端服务 (端口 3000)...
start "前端服务" cmd /k "cd /d %~dp0frontend && echo 前端服务启动中... && npm run dev"

echo.
echo ========================================
echo 服务启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo.
echo 按任意键打开浏览器...
pause >nul

echo 正在打开浏览器...
start http://localhost:3000

:end
echo.
echo 脚本执行完成！
echo 如需停止服务，请关闭对应的命令行窗口
pause






