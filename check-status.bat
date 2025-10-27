@echo off
chcp 65001 >nul
echo ========================================
echo   Eye Health Platform - Service Status Check
echo ========================================
echo.

:: Set color
color 0E

echo Checking service status...
echo.

:: Check Docker status
echo [Docker Service]
docker version >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Docker service is running normally
) else (
    echo ERROR: Docker service is not running
)
echo.

:: Check MinIO status
echo [MinIO Storage Service]
docker ps --filter "name=eyehealth-minio" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>nul | findstr eyehealth-minio >nul
if %errorlevel% equ 0 (
    echo SUCCESS: MinIO container is running
    docker ps --filter "name=eyehealth-minio" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
) else (
    echo ERROR: MinIO container is not running
)
echo.

:: Check port usage
echo [Port Usage Check]
echo Checking port 3000 (frontend)...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo SUCCESS: Port 3000 is occupied (frontend service may be running)
) else (
    echo WARNING: Port 3000 is not occupied (frontend service not running)
)

echo Checking port 3001 (backend)...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo SUCCESS: Port 3001 is occupied (backend service may be running)
) else (
    echo WARNING: Port 3001 is not occupied (backend service not running)
)

echo Checking port 9000 (MinIO)...
netstat -an | findstr :9000 >nul
if %errorlevel% equ 0 (
    echo SUCCESS: Port 9000 is occupied (MinIO service is running)
) else (
    echo ERROR: Port 9000 is not occupied (MinIO service not running)
)
echo.

:: Check processes
echo [Process Check]
echo Checking Node.js processes...
tasklist /fi "imagename eq node.exe" 2>nul | findstr node.exe >nul
if %errorlevel% equ 0 (
    echo SUCCESS: Found Node.js processes running
    tasklist /fi "imagename eq node.exe" /fo table
) else (
    echo WARNING: No Node.js processes found
)
echo.

:: Check Python processes
echo Checking Python processes...
tasklist /fi "imagename eq python.exe" 2>nul | findstr python.exe >nul
if %errorlevel% equ 0 (
    echo SUCCESS: Found Python processes running
    tasklist /fi "imagename eq python.exe" /fo table
) else (
    echo WARNING: No Python processes found
)
echo.

:: Service access test
echo [Service Access Test]
echo Testing backend API...
curl -s http://localhost:3001/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Backend API is accessible
) else (
    echo ERROR: Backend API is not accessible
)

echo Testing frontend app...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Frontend app is accessible
) else (
    echo ERROR: Frontend app is not accessible
)

echo Testing MinIO service...
curl -s http://localhost:9000/minio/health/live >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: MinIO service is accessible
) else (
    echo ERROR: MinIO service is not accessible
)
echo.

:: Show summary
echo ========================================
echo           Status Check Complete
echo ========================================
echo.
echo Management Commands:
echo   * Start development environment: start-dev.bat
echo   * Start full environment: start-all.bat
echo   * Stop all services: stop-all.bat
echo.
echo Service Addresses:
echo   * Frontend app: http://localhost:3000
echo   * Backend API:  http://localhost:3001
echo   * MinIO:        http://localhost:9000
echo   * MinIO Console: http://localhost:9001
echo.
pause
