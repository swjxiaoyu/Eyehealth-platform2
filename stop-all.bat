@echo off
chcp 65001 >nul
echo ========================================
echo   Eye Health Platform - Stop All Services
echo ========================================
echo.

:: Set color
color 0C

echo [1/4] Stopping frontend service...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Frontend Service*" >nul 2>&1
echo SUCCESS: Frontend service stopped

echo.
echo [2/4] Stopping backend service...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Backend Service*" >nul 2>&1
echo SUCCESS: Backend service stopped

echo.
echo [3/4] Stopping AI service...
taskkill /f /im python.exe /fi "WINDOWTITLE eq AI Service*" >nul 2>&1
echo SUCCESS: AI service stopped

echo.
echo [4/4] Stopping MinIO service...
docker stop eyehealth-minio >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MinIO container is not running
) else (
    echo SUCCESS: MinIO service stopped
)

echo.
echo ========================================
echo           All Services Stopped
echo ========================================
echo.
echo To restart services, run: start-all.bat
echo.
pause