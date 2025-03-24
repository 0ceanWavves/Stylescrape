#!/bin/bash

echo "Installing Website Scraper dependencies..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed or not in your PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install
echo "Backend dependencies installed!"
echo

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd website-cloner-gui
npm install
echo "Frontend dependencies installed!"
echo

cd ..
echo "All dependencies have been installed successfully!"
echo
echo "You can now run the Website Scraper GUI by running:"
echo "./start-gui.sh"
echo

# Make the start script executable
chmod +x start-gui.sh
echo "Made start-gui.sh executable."
echo

read -p "Press any key to continue..." key 