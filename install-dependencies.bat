@echo off
echo Installing Website Scraper dependencies...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
call npm install
echo Backend dependencies installed!
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd website-cloner-gui
call npm install
echo Frontend dependencies installed!
echo.

cd ..
echo All dependencies have been installed successfully!
echo.
echo You can now run the Website Scraper GUI by running:
echo start-gui.bat
echo.

pause 