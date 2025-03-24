#!/bin/bash

# StyleScrape Repository Cleanup Script
# This script helps clean up generated files and directories that should not be in version control

echo "StyleScrape Repository Cleanup Script"
echo "===================================="
echo 

# Make sure we're in the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR" || exit 1

echo "🧹 Cleaning up output and generated directories..."

# Remove output directories
DIRS_TO_REMOVE=(
  "cloned-site"
  "cloned-sites"
  "PrismFinancial"
  "design-elements"
  "design-reports"
  "design-system"
  "static-sites"
  "website-cloner.js /" # Unusual directory, likely unintended
)

for dir in "${DIRS_TO_REMOVE[@]}"; do
  if [ -d "$dir" ]; then
    echo "  - Removing directory: $dir"
    rm -rf "$dir"
  else
    echo "  - Directory not found: $dir (skipping)"
  fi
done

# Remove large/debug files
FILES_TO_REMOVE=(
  ".repomix-output.txt"
  "ter main"
)

for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "  - Removing file: $file"
    rm -f "$file"
  else
    echo "  - File not found: $file (skipping)"
  fi
done

echo
echo "✅ Cleanup completed!"
echo 
echo "Next steps:"
echo "1. Run 'git status' to see what files were removed"
echo "2. Commit changes: git add . && git commit -m 'chore: cleanup repository'"
echo "3. Push to GitHub: git push origin main"
echo
echo "Your repository is now cleaner and more organized!" 