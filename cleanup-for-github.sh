#!/bin/bash

# StyleScrape GitHub Repository Cleanup Script
# This script removes non-essential files to create a clean repository for GitHub

echo "StyleScrape GitHub Repository Cleanup Script"
echo "=========================================="
echo 

# Make sure we're in the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR" || exit 1

echo "🧹 Cleaning up non-essential files and directories..."

# Remove non-essential directories
DIRS_TO_REMOVE=(
  # Generated output directories
  "cloned-site"
  "cloned-sites"
  "PrismFinancial"
  "design-elements"
  "design-reports"
  "design-system"
  "static-sites"
  "website-cloner.js /" # Unusual directory, likely unintended
  
  # Build and dependency directories
  "node_modules"
  "website-cloner-gui/node_modules"
  "netlify/node_modules"
  "netlify/functions/node_modules"
  "website-cloner-gui/build"
  "website-ripping-tools/node_modules"
  
  # Redundant directories
  "website-ripping-tools" # Contains duplicate functionality
  ".cursor" # Editor-specific directory
)

for dir in "${DIRS_TO_REMOVE[@]}"; do
  if [ -d "$dir" ]; then
    echo "  - Removing directory: $dir"
    rm -rf "$dir"
  else
    echo "  - Directory not found: $dir (skipping)"
  fi
done

# Remove non-essential files
FILES_TO_REMOVE=(
  # Generated and temporary files
  ".repomix-output.txt"
  "ter main"
  ".DS_Store"
  ".cursorrules"
  
  # Lock files (will be regenerated)
  "package-lock.json"
  "website-cloner-gui/package-lock.json"
  "netlify/package-lock.json"
  "netlify/functions/package-lock.json"
  "yarn.lock"
  "website-cloner-gui/yarn.lock"
  "netlify/yarn.lock"
  "netlify/functions/yarn.lock"
  
  # Redundant scripts
  "cleanup-repo.bat"
  "cleanup-repo.sh"
  "initialize-git.bat"
  "github-setup.md"
  "push-to-github.md"
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
echo "Your repository now contains only the essential files for the website scraping functionality:"
echo "- website-cloner.js: Core website scraping functionality"
echo "- server.js: API server for the scraper"
echo "- extract-design.js: Design element extraction tool"
echo "- serve-site.js: Local server for viewing cloned sites"
echo "- static-generator.js: Static site generator"
echo "- website-cloner-gui/: GUI interface for the scraper"
echo "- netlify/: Netlify deployment configuration"
echo
echo "Next steps:"
echo "1. Run 'git init' to initialize a new Git repository"
echo "2. Run 'git add .' to stage all files"
echo "3. Run 'git commit -m "Initial commit"' to create your first commit"
echo "4. Add your GitHub repository as remote and push"
echo