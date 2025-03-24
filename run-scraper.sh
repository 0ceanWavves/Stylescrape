#!/bin/bash

echo "Website Scraper GUI Launcher"
echo "============================"
echo

# Check if files exist
if [ ! -f server.js ]; then
    echo "Error: server.js not found!"
    echo "Please make sure you're in the correct directory."
    exit 1
fi

if [ ! -d website-cloner-gui ]; then
    echo "Error: website-cloner-gui directory not found!"
    echo "Please make sure you have the GUI components installed."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d node_modules ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -d website-cloner-gui/node_modules ]; then
    echo "Installing frontend dependencies..."
    cd website-cloner-gui
    npm install
    cd ..
fi

# Make sure the start script is executable
chmod +x start-gui.sh

# Start the servers
echo "Starting the Website Scraper..."
./start-gui.sh

echo
echo "If the browser doesn't open automatically, navigate to:"
echo "http://localhost:3000"
echo
echo "You can close this window when you're done with the scraper." 