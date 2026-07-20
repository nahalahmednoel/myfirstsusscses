@echo off
REM MOCHiHOOD Web3 Dashboard - Quick Start Script (Windows)
REM Run this to automatically set up and start the server

echo.
echo 🚀 MOCHiHOOD Web3 Dashboard - Setup
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo ✓ Node.js version: %NODE_VERSION%
echo ✓ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed
echo.

REM Check if .env exists, if not create from template
if not exist .env (
    if exist .env.example (
        echo 📝 Creating .env file from template...
        copy .env.example .env
        echo ✓ .env created (update JWT_SECRET in production!)
    )
)

echo.
echo ====================================
echo ✅ Setup Complete!
echo.
echo Default Credentials:
echo   Admin  ^→ username: admin / password: admin2024secure
echo   Demo   ^→ username: demo / password: demo123
echo.
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop
echo ====================================
echo.

REM Start the server
call npm start
pause
