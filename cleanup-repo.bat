@echo off
:: StyleScrape Repository Cleanup Script
:: This script helps clean up generated files and directories that should not be in version control

echo StyleScrape Repository Cleanup Script
echo ====================================
echo.

echo 🧹 Cleaning up output and generated directories...

:: Remove output directories
set DIRS_TO_REMOVE=^
    cloned-site^
    cloned-sites^
    PrismFinancial^
    design-elements^
    design-reports^
    design-system^
    static-sites^
    "website-cloner.js /"

for %%d in (%DIRS_TO_REMOVE%) do (
    if exist %%d (
        echo   - Removing directory: %%d
        rmdir /s /q %%d
    ) else (
        echo   - Directory not found: %%d (skipping)
    )
)

:: Remove large/debug files
set FILES_TO_REMOVE=^
    .repomix-output.txt^
    "ter main"

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
echo Next steps:
echo 1. Run 'git status' to see what files were removed
echo 2. Commit changes: git add . ^&^& git commit -m "chore: cleanup repository"
echo 3. Push to GitHub: git push origin main
echo.
echo Your repository is now cleaner and more organized!

:: Pause to see the output
pause 