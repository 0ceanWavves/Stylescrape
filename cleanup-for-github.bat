@echo off
:: StyleScrape GitHub Repository Cleanup Script
:: This script removes non-essential files to create a clean repository for GitHub

echo StyleScrape GitHub Repository Cleanup Script
echo ==========================================
echo.

echo 🧹 Cleaning up non-essential files and directories...

:: Remove non-essential directories
set DIRS_TO_REMOVE=^
    cloned-site^
    cloned-sites^
    PrismFinancial^
    design-elements^
    design-reports^
    design-system^
    static-sites^
    "website-cloner.js /"^
    node_modules^
    website-cloner-gui\node_modules^
    netlify\node_modules^
    netlify\functions\node_modules^
    website-cloner-gui\build^
    website-ripping-tools\node_modules^
    website-ripping-tools^
    .cursor

for %%d in (%DIRS_TO_REMOVE%) do (
    if exist %%d (
        echo   - Removing directory: %%d
        rmdir /s /q %%d
    ) else (
        echo   - Directory not found: %%d (skipping)
    )
)

:: Remove non-essential files
set FILES_TO_REMOVE=^
    .repomix-output.txt^
    "ter main"^
    .DS_Store^
    .cursorrules^
    package-lock.json^
    website-cloner-gui\package-lock.json^
    netlify\package-lock.json^
    netlify\functions\package-lock.json^
    yarn.lock^
    website-cloner-gui\yarn.lock^
    netlify\yarn.lock^
    netlify\functions\yarn.lock^
    cleanup-repo.bat^
    cleanup-repo.sh^
    initialize-git.bat^
    github-setup.md^
    push-to-github.md

for %%f in (%FILES_TO_REMOVE%) do (
    if exist %%f (
        echo   - Removing file: %%f
        del /f /q %%f
    ) else (
        echo   - File not found: %%f (skipping)
    )
)

echo.
echo ✅ Cleanup completed!
echo.
echo Your repository now contains only the essential files for the website scraping functionality:
echo - website-cloner.js: Core website scraping functionality
echo - server.js: API server for the scraper
echo - extract-design.js: Design element extraction tool
echo - serve-site.js: Local server for viewing cloned sites
echo - static-generator.js: Static site generator
echo - website-cloner-gui/: GUI interface for the scraper
echo - netlify/: Netlify deployment configuration
echo.
echo Next steps:
echo 1. Run 'git init' to initialize a new Git repository
echo 2. Run 'git add .' to stage all files
echo 3. Run 'git commit -m "Initial commit"' to create your first commit
echo 4. Add your GitHub repository as remote and push
echo.

:: Pause to see the output
pause