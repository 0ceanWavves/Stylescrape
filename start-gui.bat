@echo off
echo Starting Website Scraper GUI...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Start the backend server in a new window
echo Starting backend server...
start "Website Scraper Backend" cmd /c "node server.js && pause"
echo.

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

REM Navigate to the GUI directory and start it
echo Starting frontend GUI...
cd website-cloner-gui
start "Website Scraper GUI" cmd /c "npm start && pause"

echo.
echo Both servers are starting up!
echo - Backend API server will be running on http://localhost:3001
echo - Frontend GUI will open automatically in your default browser
echo.
echo If the GUI doesn't open automatically, navigate to:
echo http://localhost:3000
echo.
echo To stop the servers, close the command prompt windows.
echo. 