@echo off
echo StyleScrape - Netlify Deployment
echo ----------------------------
echo.

REM Check if netlify-cli is installed
call npx netlify --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Installing netlify-cli...
  call npm install -g netlify-cli
  if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install netlify-cli.
    exit /b 1
  )
)

echo Installing dependencies for Netlify functions...
cd netlify
call npm install
if %ERRORLEVEL% neq 0 (
  echo Error: Failed to install dependencies.
  cd ..
  exit /b 1
)
cd ..

echo Installing dependencies for website-cloner-gui...
cd website-cloner-gui
call npm install
if %ERRORLEVEL% neq 0 (
  echo Error: Failed to install dependencies.
  cd ..
  exit /b 1
)
cd ..

REM Build the frontend
echo Building the frontend...
cd website-cloner-gui
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Error: Build failed.
  cd ..
  exit /b 1
)
cd ..

REM Deploy to Netlify
echo Deploying to Netlify...
call netlify deploy --prod
if %ERRORLEVEL% neq 0 (
  echo Error: Deployment failed.
  exit /b 1
)

echo.
echo Deployment completed successfully!
echo Your site should now be live with real website cloning functionality.
echo Site will now include color palette extraction with light alternatives.
echo.
pause 