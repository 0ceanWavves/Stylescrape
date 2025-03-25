@echo off
title GUI Application Launcher
echo Starting GUI Application...
echo.

REM Set the path to your GUI application executable
set APP_PATH=your_application.exe

REM Check if the application exists
if not exist "%APP_PATH%" (
    echo Error: Application not found at %APP_PATH%
    echo Please check the path and try again.
    pause
    exit /b 1
)

REM Launch the application
echo Launching application...
start "" "%APP_PATH%"

REM You can add additional parameters as needed
REM start "" "%APP_PATH%" /param1 /param2

echo.
echo Application launched successfully!
echo.
echo You can close this window, or it will close automatically in 5 seconds...
timeout /t 5 > nul
exit /b 0 
