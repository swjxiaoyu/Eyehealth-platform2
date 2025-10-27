@echo off
chcp 65001 > nul
echo ========================================
echo    Python Environment Setup Script
echo ========================================
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8+ from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo Python is installed correctly.
echo.

echo Checking pip installation...
pip --version
if %errorlevel% neq 0 (
    echo ERROR: pip is not available
    echo Please reinstall Python with pip included
    pause
    exit /b 1
)

echo pip is available.
echo.

echo Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Installing AI service dependencies...
cd ai-service
pip install fastapi uvicorn python-multipart requests python-dotenv pydantic loguru numpy pandas scikit-learn Pillow PyPDF2

echo.
echo Testing AI service startup...
echo Starting AI service for 5 seconds to test...
timeout /t 1 /nobreak >nul
start "AI Test" cmd /c "python main.py & timeout /t 5 /nobreak >nul & taskkill /f /im python.exe"

echo.
echo Waiting for test to complete...
timeout /t 8 /nobreak >nul

echo.
echo Python environment setup completed!
echo.
echo You can now run:
echo - start-ai-service.bat (to start AI service only)
echo - start-all.bat (to start all services)
echo - start-simple.bat (to start core services)
echo.
pause




