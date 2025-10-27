@echo off
chcp 65001 >nul
echo ========================================
echo   Eye Health Platform - Development Environment
echo ========================================
echo.

:: Set color
color 0B

:: Check Docker status
echo [1/4] Checking Docker service status...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running, please start Docker Desktop first
    pause
    exit /b 1
)
echo SUCCESS: Docker service is running

:: Start MinIO service
echo.
echo [2/4] Starting MinIO storage service...
docker start eyehealth-minio >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MinIO container does not exist, creating...
    docker run -d --name eyehealth-minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=password123 minio/minio server /data --console-address ":9001" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: MinIO startup failed
        pause
        exit /b 1
    )
    echo SUCCESS: MinIO container created and started
) else (
    echo SUCCESS: MinIO service started
)

:: Wait for MinIO to be ready
echo    Waiting for MinIO service to be ready...
timeout /t 3 /nobreak >nul

:: Start backend service
echo.
echo [3/4] Starting backend service...
cd backend
start "Backend Service" cmd /k "npm run start:dev"
cd ..
echo SUCCESS: Backend service starting...

:: Wait for backend to start
echo    Waiting for backend service to be ready...
timeout /t 8 /nobreak >nul

:: Start frontend service
echo.
echo [4/4] Starting frontend service...
cd frontend
start "Frontend Service" cmd /k "npm run dev"
cd ..
echo SUCCESS: Frontend service starting...

:: Wait for frontend to start
echo    Waiting for frontend service to be ready...
timeout /t 5 /nobreak >nul

:: Show service status
echo.
echo ========================================
echo        Development Environment Ready
echo ========================================
echo.
echo Service Status:
echo   * MinIO Storage: http://localhost:9000 (admin/password123)
echo   * MinIO Console: http://localhost:9001
echo   * Backend API:   http://localhost:3001
echo   * Frontend App:  http://localhost:3000
echo.
echo Management Commands:
echo   * Stop all services: stop-all.bat
echo   * Full environment (with AI): start-all.bat
echo.
echo Quick Access:
echo   * Open frontend app: http://localhost:3000
echo   * API documentation: http://localhost:3001/api
echo.

:: Ask if open browser
set /p choice="Open browser to access frontend app? (y/n): "
if /i "%choice%"=="y" (
    start http://localhost:3000
    echo SUCCESS: Browser opened
)

echo.
echo Development environment started successfully!
echo    Press any key to exit...
pause >nul
