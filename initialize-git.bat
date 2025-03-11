@echo off
echo Initializing Git repository...
git init
echo.

echo Adding files to Git...
git add .
echo.

echo Making initial commit...
git commit -m "Initial commit: Website cloning and analysis tools"
echo.

echo Git repository is ready for connecting to remote.
echo.
echo Next steps:
echo 1. Create a new repository on GitHub (don't initialize with README or license)
echo 2. Run: git remote add origin YOUR_REPOSITORY_URL
echo 3. Run: git push -u origin main
echo.
echo Replace YOUR_REPOSITORY_URL with the URL of your GitHub repository.
echo Example: git remote add origin https://github.com/yourusername/website-ripping-tools.git
echo.
pause
