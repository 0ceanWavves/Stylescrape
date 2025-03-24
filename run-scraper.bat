@echo off
echo Website Scraper GUI Launcher
echo ============================
echo.

REM Check if files exist
if not exist server.js (
    echo Error: server.js not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

if not exist website-cloner-gui (
    echo Error: website-cloner-gui directory not found!
    echo Please make sure you have the GUI components installed.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)

if not exist website-cloner-gui\node_modules (
    echo Installing frontend dependencies...
    cd website-cloner-gui
    call npm install
    cd ..
)

REM Start the servers
echo Starting the Website Scraper...
call start-gui.bat

echo.
echo If the browser doesn't open automatically, navigate to:
echo http://localhost:3000
echo.
echo You can close this window when you're done with the scraper. 