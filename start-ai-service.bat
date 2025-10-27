@echo off
chcp 65001 > nul
echo ========================================
echo    AI Service Startup Script
echo ========================================
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to PATH
    pause
    exit /b 1
)

echo.
echo Checking AI service directory...
if not exist "ai-service\main.py" (
    echo ERROR: AI service directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
cd ai-service
pip install fastapi uvicorn python-multipart requests python-dotenv pydantic loguru numpy pandas scikit-learn Pillow PyPDF2
if %errorlevel% neq 0 (
    echo WARNING: Some dependencies may not have installed correctly
    echo Continuing with basic dependencies...
)

echo.
echo Starting AI service...
echo AI service will be available at: http://localhost:8000
echo API documentation: http://localhost:8000/docs
echo.
python main.py

echo.
echo AI service stopped.
pause
