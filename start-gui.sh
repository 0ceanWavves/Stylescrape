#!/bin/bash

echo "Starting Website Scraper GUI..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed or not in your PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Start the backend server in a new terminal
echo "Starting backend server..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && node server.js"'
else
    # Linux
    gnome-terminal -- bash -c "cd \"$(pwd)\" && node server.js; exec bash" || \
    xterm -e "cd \"$(pwd)\" && node server.js; exec bash" || \
    konsole -e "cd \"$(pwd)\" && node server.js; exec bash" || \
    echo "Could not open a new terminal window. Starting in background instead." && \
    node server.js > server.log 2>&1 &
fi

echo

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 5

# Navigate to the GUI directory and start it
echo "Starting frontend GUI..."
cd website-cloner-gui
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm start"'
else
    # Linux
    gnome-terminal -- bash -c "cd \"$(pwd)\" && npm start; exec bash" || \
    xterm -e "cd \"$(pwd)\" && npm start; exec bash" || \
    konsole -e "cd \"$(pwd)\" && npm start; exec bash" || \
    echo "Could not open a new terminal window. Starting in background instead." && \
    npm start > frontend.log 2>&1 &
fi

echo
echo "Both servers are starting up!"
echo "- Backend API server will be running on http://localhost:3001"
echo "- Frontend GUI will open automatically in your default browser"
echo
echo "If the GUI doesn't open automatically, navigate to:"
echo "http://localhost:3000"
echo
echo "To stop the servers, close the terminal windows or press Ctrl+C in each terminal."
echo

# Make the script wait so it doesn't exit immediately
echo "Press Ctrl+C to close this window when you're done."
tail -f /dev/null 